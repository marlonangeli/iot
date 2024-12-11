import express from 'express';
import Device from '../models/device.js';
import mongo from '../config/database.js';

const router = express.Router();

// MongoDb connection middleware
router.use(async (req, res, next) => {
    try {
        console.debug('MongoDB connection middleware');
        await mongo.connect();
        next();
    } catch (error) {
        res.status(500).json({ error: 'Database connection error' });
    } finally {
        // await mongo.disconnect();
    }
});

router.post('/', async (req, res) => {
    try {
        const device = await Device.create(req.body);
        res.status(201).json(device);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.get('/', async (req, res) => {
    try {
        const devices = await Device.find();
        res.status(200).json(devices);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const device = await Device.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!device) return res.status(404).json({ error: 'Device not found' });
        res.status(200).json(device);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const device = await Device.findByIdAndDelete(req.params.id);
        if (!device) return res.status(404).json({ error: 'Device not found' });
        res.status(204).end();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
