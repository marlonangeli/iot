import amqp from 'amqplib';
import { v4 as uuidv4 } from 'uuid';
import env from './env.js';

class RabbitMQHandler {
    constructor() {
        this.config = {
            user: env.RABBITMQ_USER,
            pass: env.RABBITMQ_PASS,
            host: env.RABBITMQ_HOST,
            port: env.RABBITMQ_PORT,
            vhost: env.RABBITMQ_VHOST
        };
        this.connection = null;
        this.channels = new Map();
    }

    _getConnectionUri() {
        return process.env.NODE_ENV === 'production'
            ? `amqps://${this.config.user}:${this.config.pass}@${this.config.host}/${this.config.vhost}`
            : `amqp://${this.config.user}:${this.config.pass}@${this.config.host}:${this.config.port}/${this.config.vhost}`;
    }

    async connect() {
        if (this.connection) return this.connection;

        try {
            this.connection = await amqp.connect(this._getConnectionUri());
            return this.connection;
        } catch (error) {
            console.error('RabbitMQ Connection Error:', error);
            await this.close();
            throw error;
        }
    }

    async createChannel(queueName, options = {}) {
        const defaultOptions = {
            durable: true,
            deadLetterExchange: `${queueName}.dlx`
        };
        const channelOptions = { ...defaultOptions, ...options };

        try {
            const connection = await this.connect();
            const channel = await connection.createChannel();

            // Assert queue with dead-letter configuration
            await channel.assertQueue(queueName, channelOptions);
            await channel.assertExchange(`${queueName}.dlx`, 'direct');

            this.channels.set(queueName, channel);
            return channel;
        } catch (error) {
            console.error(`Channel Creation Error for ${queueName}:`, error);
            await this.close();
            throw error;
        }
    }

    async publish(queueName, message, options = {}) {
        try {
            const channel = await this.createChannel(queueName);
            const messageId = uuidv4();

            const publishOptions = {
                persistent: true,
                messageId,
                timestamp: Date.now(),
                contentType: 'application/json',
                appId: 'iot-event-api',
                ...options
            };

            channel.sendToQueue(
                queueName,
                Buffer.from(JSON.stringify(message)),
                publishOptions
            );

            return messageId;
        } catch (error) {
            console.error(`Publish Error to ${queueName}:`, error);
            await this.close();
            throw error;
        }
    }

    async consume(queueName, handler, options = {}) {
        const defaultOptions = {
            noAck: false,
            prefetch: 1
        };
        const consumeOptions = { ...defaultOptions, ...options };

        try {
            const channel = await this.createChannel(queueName);

            channel.prefetch(consumeOptions.prefetch);

            await channel.consume(queueName, async (msg) => {
                if (!msg) return;

                try {
                    const content = JSON.parse(msg.content.toString());
                    await handler(content, msg);
                    channel.ack(msg);
                } catch (error) {
                    console.error('Message Processing Error:', error);
                    channel.nack(msg, false, false);
                }
            }, consumeOptions);

        } catch (error) {
            console.error(`Consume Error from ${queueName}:`, error);
            await this.close();
            throw error;
        }
    }

    async close() {
        try {
            for (const [queue, channel] of this.channels) {
                await channel.close();
                this.channels.delete(queue);
            }
            if (this.connection) {
                await this.connection.close();
                this.connection = null;
            }
        } catch (error) {
            console.error('RabbitMQ Shutdown Error:', error);
        }
    }
}

export default new RabbitMQHandler();
