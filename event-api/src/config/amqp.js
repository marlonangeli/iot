import amqp from 'amqplib';
import { v4 as uuidv4 } from 'uuid';
import env from './env.js';

class RabbitMQHandler {
    constructor() {
        const connectionUrl =
            env.NODE_ENV === 'production'
                ? `amqps://${env.RABBITMQ_USER}:${env.RABBITMQ_PASS}@${env.RABBITMQ_HOST}/${env.RABBITMQ_VHOST}`
                : `amqp://${env.RABBITMQ_USER}:${env.RABBITMQ_PASS}@${env.RABBITMQ_HOST}:${env.RABBITMQ_PORT}/${env.RABBITMQ_VHOST}`;

        this.config = {
            url: connectionUrl,
            reconnectDelay: 5000,
        };
        this.connection = null;
        this.publishChannel = null;
    }

    async connect() {
        if (this.connection) return;
        try {
            this.connection = await amqp.connect(this.config.url);

            this.connection.on('error', (err) => {
                console.error('RabbitMQ connection error:', err);
                this.connection = null;
                this.publishChannel = null;
            });

            this.connection.on('close', () => {
                console.warn('RabbitMQ connection closed. Reconnecting...');
                this.connection = null;
                this.publishChannel = null;
                setTimeout(() => this.connect(), this.config.reconnectDelay);
            });

            console.log('RabbitMQ connected.');
        } catch (err) {
            console.error('Failed to connect to RabbitMQ:', err);
            setTimeout(() => this.connect(), this.config.reconnectDelay);
        }
    }

    // Use a dedicated publish channel (reuse it)
    async getPublishChannel() {
        await this.connect();
        if (!this.publishChannel) {
            this.publishChannel = await this.connection.createChannel();
        }
        return this.publishChannel;
    }

    // Publish a message to a given queue
    async publish(queueName, message) {
        const channel = await this.getPublishChannel();
        await channel.assertQueue(queueName, { durable: true });
        const messageId = uuidv4();
        channel.sendToQueue(
            queueName,
            Buffer.from(JSON.stringify(message)),
            { persistent: true, messageId }
        );
        return messageId;
    }

    /**
     * Create a dedicated consumer channel.
     *
     * @param {string} queueName - Queue to consume from.
     * @param {function} handler - Async function to process each message.
     * @param {object} options - Options: { prefetch, autoAck }.
     *                           If autoAck is true, the consumer will not manually ack.
     * @returns {Promise<{consumerTag: *, channel: void | Promise<Channel>}>}
     */
    async createConsumer(queueName, handler, options = {}) {
        await this.connect();
        const consumerChannel = await this.connection.createChannel();
        await consumerChannel.assertQueue(queueName, { durable: true });
        if (options.prefetch) {
            consumerChannel.prefetch(options.prefetch);
        }
        // Use noAck=true if autoAck is set
        const consumeOptions = { noAck: options.autoAck === true };
        const { consumerTag } = await consumerChannel.consume(
            queueName,
            async (msg) => {
                if (!msg) return;
                try {
                    const content = JSON.parse(msg.content.toString());
                    await handler(content);
                    if (!consumeOptions.noAck) {
                        consumerChannel.ack(msg);
                    }
                } catch (err) {
                    console.error('Error processing message:', err);
                    if (!consumeOptions.noAck) {
                        consumerChannel.nack(msg, false, false);
                    }
                }
            },
            consumeOptions
        );
        return { consumerTag, channel: consumerChannel };
    }

    // Cancel a consumer (and close its dedicated channel)
    async cancelConsumer(consumerTag, channel) {
        try {
            if (channel) {
                await channel.cancel(consumerTag);
                await channel.close();
            }
        } catch (err) {
            console.error('Error cancelling consumer:', err);
        }
    }

    /**
     * Fetch a fixed number of messages (one-off batch consumption)
     *
     * @param {string} queueName - Queue to fetch from.
     * @param {number} count - Maximum number of messages to fetch.
     * @param {object} options - Options: { autoAck }.
     * @returns {Promise<Array<any>>} - Array of parsed message contents.
     */
    async fetchMessages(queueName, count, options = {}) {
        await this.connect();
        const channel = await this.connection.createChannel();
        await channel.assertQueue(queueName, { durable: true });
        const messages = [];
        for (let i = 0; i < count; i++) {
            const msg = await channel.get(queueName, { noAck: options.autoAck === true });
            if (!msg) break;
            try {
                const content = JSON.parse(msg.content.toString());
                messages.push(content);
                if (options.autoAck !== true) {
                    channel.ack(msg);
                }
            } catch (err) {
                console.error('Error processing message:', err);
                if (options.autoAck !== true) {
                    channel.nack(msg, false, false);
                }
            }
        }
        await channel.close();
        return messages;
    }

    // Gracefully close the publish channel and connection
    async close() {
        try {
            if (this.publishChannel) await this.publishChannel.close();
            if (this.connection) await this.connection.close();
        } catch (err) {
            console.error('Error closing RabbitMQ connection:', err);
        } finally {
            this.publishChannel = null;
            this.connection = null;
        }
    }
}

export default new RabbitMQHandler();
