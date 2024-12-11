import express from 'express';
import rabbitMQ from '../config/amqp.js';

const router = express.Router();
const QUEUE_NAME = 'iot_events';

router.post('/', async (req, res) => {
    try {
        const messageId = await rabbitMQ.publish(QUEUE_NAME, req.body);
        res.status(201).json({
            message: 'Event published',
            messageId
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/', async (req, res) => {
    const messages = [];

    try {
        await rabbitMQ.consume(QUEUE_NAME, (message) => {
            messages.push(message);
        }, {
            prefetch: 10,
            noAck: false
        });

        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
