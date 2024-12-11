import express from "express";
import status from "./status.js";
import devices from "./devices.js";
import events from "./events.js";

const router = express.Router();

router.use('/status', status);
router.use('/devices', devices);
router.use('/events', events);


export default router;
