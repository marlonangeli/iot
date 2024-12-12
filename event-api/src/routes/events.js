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

// GET: Stream messages in real-time
router.get('/stream', async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Transfer-Encoding', 'chunked');

    try {
        await rabbitMQ.consume(
            QUEUE_NAME,
            (message) => {
                res.write(`${JSON.stringify(message)}\n`);
            }
        );
    } catch (err) {
        console.error('Stream error:', err);
        res.status(500).end();
    } finally {

        res.on('close', async () => {
            await rabbitMQ.close();
        })
    }
});

// GET: Fetch a batch of messages without streaming
router.get('/consume', async (req, res) => {
    const messages = [];
    let count = 0;

    try {
        await rabbitMQ.consume(
            QUEUE_NAME,
            (message) => {
                messages.push(JSON.stringify(message));
                count++;
            },
            {
                prefetch: 10,
                autoAck: true,
            }
        );

        res.status(200).json({
            count: count,
            messages: messages,
        }).end();
    } catch (err) {
        console.error('Consume error:', err);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

// PATCH: Close RabbitMQ connection
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
