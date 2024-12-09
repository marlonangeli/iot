import express from "express";
import mongoose from "mongoose";

import mongo from "../config/database.js";
import rabbitmq from "../config/amqp.js";

const router = express.Router();

router.get("/", async (req, res) => {
    let rabbitConn = null;
    try {
        await mongo.connect();
        const mongoStatus = await mongoose.connection.readyState;
        const mongoVersion = mongoose.version;

        rabbitConn = await rabbitmq.connect();
        const rabbitmqVersion = await rabbitConn.connection.serverProperties.product;
        const channel = await rabbitmq.createChannel(rabbitConn);
        const queue = await rabbitmq.createQueue(channel, "status");
        const rabbitMQStatus = !!queue;

        res.json({
            status: "ok",
            uptime: process.uptime(),
            apiVersion: "1.0",
            commitHash: process.env.COMMIT_HASH || "development",
            services: {
                database: {
                    status: mongoStatus === 1 ? "ok" : "error",
                    version: mongoVersion
                },
                messageQueue: {
                    status: rabbitMQStatus ? "ok" : "error",
                    version: rabbitmqVersion
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: "Failed to check service status",
            error: error.message
        });
    } finally {
        await mongo.disconnect();
        if (rabbitConn)
            await rabbitmq.disconnect(rabbitConn);
    }
});

export default router;
