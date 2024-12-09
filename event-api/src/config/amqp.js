import amqp from 'amqplib';
import env from './env.js';

const { RABBITMQ_USER, RABBITMQ_PASS, RABBITMQ_VHOST, RABBITMQ_HOST, RABBITMQ_PORT } = env();

function connectAmqp() {
    try {
        return amqp.connect(`amqp://${RABBITMQ_USER}:${RABBITMQ_PASS}@${RABBITMQ_HOST}:${RABBITMQ_PORT}/${RABBITMQ_VHOST}`);
    } catch (error) {
        console.error('Error on connect with RabbitMQ:', error.message);
    }
}

function disconnectAmqp(connection) {
    try {
        connection.close();
        console.log('Disconnected from RabbitMQ');
    } catch (error) {
        console.error('Error on disconnect from RabbitMQ:', error.message);
    }
}

function createChannel(connection) {
    try {
        return connection.createChannel();
    } catch (error) {
        console.error('Error on create channel:', error.message);
    }
}

function createQueue(channel, queue) {
    try {
        return channel.assertQueue(queue);
    } catch (error) {
        console.error('Error on create queue:', error.message);
    }
}

function consumeQueue(channel, queue, callback) {
    try {
        return channel.consume(queue, callback, { noAck: true });
    } catch (error) {
        console.error('Error on consume queue:', error.message);
    }
}

function publishQueue(channel, queue, message) {
    try {
        return channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
    } catch (error) {
        console.error('Error on publish queue:', error.message);
    }
}

const rabbitmq = {
    connect: connectAmqp,
    disconnect: disconnectAmqp,
    createChannel,
    createQueue,
    consumeQueue,
    publishQueue
}

export default rabbitmq;
