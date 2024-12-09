import express from "express";
import status from "./status.js";

const router = express.Router();

router.use("/status", status);

router.get("/", (req, res) => {
    res.json({
        status: "ok",
        uptime: process.uptime(),
        apiVersion: "1.0",
        commitHash: process.env.COMMIT_HASH || "development"
    });
});

export default router;
