import amqp from 'amqplib';
import { v4 as uuidv4 } from 'uuid';
import env from './env.js';

class RabbitMQHandler {
    constructor() {
        const connectionUrl = env.NODE_ENV === 'production'
            ? `amqps://${env.RABBITMQ_USER}:${env.RABBITMQ_PASS}@${env.RABBITMQ_HOST}/${env.RABBITMQ_VHOST}`
            : `amqp://${env.RABBITMQ_USER}:${env.RABBITMQ_PASS}@${env.RABBITMQ_HOST}:${env.RABBITMQ_PORT}/${env.RABBITMQ_VHOST}`;

        this.config = {
            url: connectionUrl,
            reconnectDelay: 5000,
        };
        this.connection = null;
        this.channel = null;
    }

    async connect() {
        try {
            if (this.connection) return;

            this.connection = await amqp.connect(this.config.url);
            this.channel = await this.connection.createChannel();

            this.connection.on('error', (err) => {
                console.error('RabbitMQ connection error:', err);
                this.connection = null;
                this.channel = null;
            });

            this.connection.on('close', () => {
                console.warn('RabbitMQ connection closed. Reconnecting...');
                this.connection = null;
                this.channel = null;
                setTimeout(() => this.connect(), this.config.reconnectDelay);
            });

            console.log('RabbitMQ connected.');
        } catch (err) {
            console.error('Failed to connect to RabbitMQ:', err);
            setTimeout(() => this.connect(), this.config.reconnectDelay);
        }
    }

    async publish(queueName, message) {
        await this.connect();

        try {
            await this.channel.assertQueue(queueName, { durable: true });
            const messageId = uuidv4();
            this.channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)), {
                persistent: true,
                messageId,
            });
            return messageId;
        } catch (err) {
            console.error('Error publishing message:', err);
            throw err;
        }
    }

    async consume(queueName, handler, options = {}) {
        await this.connect();

        try {
            await this.channel.assertQueue(queueName, { durable: true });

            if (options.prefetch) {
                this.channel.prefetch(options.prefetch);
            }

            this.channel.consume(queueName, async (msg) => {
                if (!msg) return;

                try {
                    const content = JSON.parse(msg.content.toString());
                    await handler(content);

                    if (!options.autoAck) {
                        this.channel.ack(msg, true);
                    }
                } catch (err) {
                    console.error('Error processing message:', err);
                    this.channel.nack(msg, false, false);
                }
            });
        } catch (err) {
            console.error('Error consuming messages:', err);
            throw err;
        }
    }

    async close() {
        try {
            if (this.channel) await this.channel.close();
            if (this.connection) await this.connection.close();
        } catch (err) {
            console.error('Error closing RabbitMQ connection:', err);
        } finally {
            this.channel = null;
            this.connection = null;
        }
    }
}

export default new RabbitMQHandler();
