import express from "express";
import mongoose from "mongoose";

import mongo from "../config/database.js";
import rabbitmq from "../config/amqp.js";
import env from "../config/env.js";

const router = express.Router();

router.get("/", async (req, res) => {
    let statusCode = 200;
    let hasError = false;
    let response = {
        status: "healthy",
        uptime: process.uptime(),
        api_version: "1.0",
        commit_hash: env.COMMIT_HASH || "development",
        services: {},
        updated_at: new Date().toISOString()
    }
    try {
        await mongo.connect();
        const mongoStatus = await mongoose.connection.readyState === 1 ? "healthy" : "warning";
        const mongoInfo = await mongoose.connection.db.admin().serverInfo();
        response.services.mongo = {
            status: mongoStatus,
            version: mongoInfo.version,
            mongoose: mongoose.version,
            metadata: env.NODE_ENV === "development" ? mongoInfo : {}
        }
    } catch (error) {
        hasError = true;
        const mongoError = error.message;
        const mongoStatus = "unhealthy";
        response.services.mongo = {
            status: mongoStatus,
            mongoose: mongoose.version,
            error: mongoError,
            metadata: {}
        }
        console.error("Error on connect with MongoDB:", error.message);
    } finally {
        await mongo.disconnect();
    }

    let rabbitConn = null;
    try {
        await rabbitmq.connect();
        const rabbitConn = rabbitmq.connection;
        const rabbitmqProps = await rabbitConn.connection.serverProperties;
        response.services.rabbitmq = {
            status: "healthy",
            version: rabbitmqProps.version,
            metadata: env.NODE_ENV === "development" ? rabbitmqProps : {}
        }
    } catch (error) {
        hasError = true;
        response.services.rabbitmq = {
            status: "unhealthy",
            error: error.message,
            metadata: {}
        }
        console.error("Error on connect with RabbitMQ:", error.message);
    } finally {
        await rabbitmq.close();
    }

    if (hasError) {
        response.status = "unhealthy";
        statusCode = 503;
    }

    return res.status(statusCode).json(response);
});

export default router;
