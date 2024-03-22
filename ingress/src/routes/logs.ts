import express, { Request } from "express";
import { client, dbName } from "../services/mongo-service";
import { getPaginatedLogs, handlePagination } from "../utils/paginationUtils";
import { isValidDateString, isValidNumberString } from "../utils/utils";

const router = express.Router();

// Implement time filter for all non-id routes

// Implement previous and next
router.get("/", async (req: Request, res) => {
  const { startTime, endTime } = req.query;

  if (
    !(
      (startTime &&
        isValidDateString(startTime) &&
        endTime &&
        isValidDateString(endTime)) ||
      (!startTime && !endTime)
    )
  ) {
    return res
      .status(400)
      .json({
        error: "startTime and endTime must be provided together and be valid",
      });
  }

  try {
    const { page, limit, offset } = handlePagination(req);
    const filter: { timestamp?: { $gte: Date; $lte: Date } } = {};
    if (startTime && endTime) {
      filter.timestamp = { $gte: new Date(startTime), $lte: new Date(endTime) };
    }

    const logs = await getPaginatedLogs(offset, limit, filter);

    if (logs.length === 0 && page !== 1) {
      return res.status(404).json({ error: "Page not found" });
    }

    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ error: "Error retrieving logs from MongoDB" });
  }
});

// Incorporate searching by timestamp into base endpoint
// Refactor /events to only display emitted events
router.get("/events", async (req: Request, res) => {
  const { startTime, endTime } = req.query;

  if (
    !startTime ||
    !endTime ||
    !isValidDateString(startTime) ||
    !isValidDateString(endTime)
  ) {
    return res
      .status(400)
      .json({ error: "No or invalid startTime or endTime provided in URL" });
  }

  try {
    const { page, limit, offset } = handlePagination(req);
    const filter = {
      timestamp: { $gte: new Date(startTime), $lte: new Date(endTime) },
    };
    const logs = await getPaginatedLogs(offset, limit, filter);

    if (logs.length === 0 && page !== 1) {
      return res.status(404).json({ error: "Page not found" });
    }

    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ error: "Error retrieving events from MongoDB" });
  }
});

// Maybe drop pagination?
router.get("/events/:eventId", async (req: Request, res) => {
  const { eventId } = req.params;

  try {
    const { page, limit, offset } = handlePagination(req);
    const filter = { eventId };
    const logs = await getPaginatedLogs(offset, limit, filter);

    if (logs.length === 0 && page !== 1) {
      return res.status(404).json({ error: "Page not found" });
    }

    if (logs.length === 0) {
      return res.status(404).json({ error: "Event not found" });
    }
    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ error: "Error retrieving logs from MongoDB" });
  }
});

// Maybe drop pagination
router.get("/functions/:funcId", async (req: Request, res) => {
  const { funcId } = req.params;

  try {
    const { page, limit, offset } = handlePagination(req);
    const filter = { funcId };
    const logs = await getPaginatedLogs(offset, limit, filter);

    if (logs.length === 0 && page !== 1) {
      return res.status(404).json({ error: "Page not found" });
    }

    if (logs.length === 0) {
      return res.status(404).json({ error: "Function not found" });
    }

    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ error: "Error retrieving logs from MongoDB" });
  }
});

// Change count to query parameter
router.get("/errors/:count", async (req: Request, res) => {
  const { count } = req.params;

  if (!isValidNumberString(count) || parseInt(count) <= 0) {
    return res.status(400).json({ error: "Count is invalid" });
  }

  try {
    const database = client.db(dbName);
    const collection = database.collection("logs");
    const errors = await collection
      .find({ level: "error" })
      .sort({ timestamp: -1 })
      .limit(parseInt(count))
      .toArray();
    res.status(200).json(errors);
  } catch (error) {
    res.status(500).json({ error: "Error retrieving errors from MongoDB" });
  }
});

export default router;
