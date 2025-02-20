import express from 'express';
import rabbitMQ from '../config/amqp.js';

const router = express.Router();
const QUEUE_NAME = 'iot_events_queue';

// POST: Publish a message
router.post('/', async (req, res) => {
    try {

        const messageId = await rabbitMQ.publish(QUEUE_NAME, req.body);
        res.status(201).json({
            message: 'Event published successfully',
            messageId,
        });
    } catch (err) {
        console.error('Publish error:', err);
        res.status(500).json({ error: 'Failed to publish event' });
    }
});

// GET: Stream messages in real-time (NDJSON)
// A dedicated consumer channel is created and canceled on client disconnect.
router.get('/stream', async (req, res) => {
    res.setHeader('Content-Type', 'application/x-ndjson');
    res.setHeader('Transfer-Encoding', 'chunked');

    let consumer;
    // When the client disconnects, cancel the consumer instead of closing the global connection.
    req.on('close', async () => {
        if (consumer) {
            await rabbitMQ.cancelConsumer(consumer.consumerTag, consumer.channel);
            console.log('Client disconnected, consumer canceled.');
        }
    });

    try {
        consumer = await rabbitMQ.createConsumer(
            QUEUE_NAME,
            (message) => {
                res.write(`${JSON.stringify(message)}\n`);
            },
            {
                autoAck: false,
                prefetch: 10,
            }
        );
    } catch (err) {
        console.error('Stream error:', err);
        res.status(500).end();
    }
});

// GET: Fetch a batch of messages without streaming
router.get('/consume', async (req, res) => {
    try {
        const messages = await rabbitMQ.fetchMessages(QUEUE_NAME, 10, {
            autoAck: false,
        });
        res.status(200).json({
            count: messages.length,
            messages,
        });
    } catch (err) {
        console.error('Consume error:', err);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

// PATCH: Close RabbitMQ connection (for maintenance/testing)
router.patch('/close', async (req, res) => {
    try {
        await rabbitMQ.close();
        res.status(200).json({ message: 'RabbitMQ connection closed' });
    } catch (err) {
        console.error('Close error:', err);
        res.status(500).json({ error: 'Failed to close RabbitMQ connection' });
    }
});

export default router;
