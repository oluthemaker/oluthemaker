import mongoose from "mongoose";
import { runAbandonedCartProcessor } from "../controllers/abandonedCartController.js";

const DEFAULT_INTERVAL_MS = 5 * 60 * 1000;
let intervalHandle = null;
let isRunning = false;

/**
 * Start the MongoDB-backed abandoned-cart poller inside the existing API process.
 * The first pass runs immediately after MongoDB connects, then every five minutes.
 * MongoDB's atomic processingUntil claim protects against duplicate work across
 * multiple backend instances; this local guard prevents overlapping passes here.
 */
export const startAbandonedCartWorker = ({ intervalMs } = {}) => {
  if (intervalHandle) return intervalHandle;
  const configuredInterval = Number(process.env.ABANDONED_CART_POLL_INTERVAL_MS);
  const pollIntervalMs = Number.isFinite(intervalMs) && intervalMs > 0
    ? intervalMs
    : configuredInterval > 0 ? configuredInterval : DEFAULT_INTERVAL_MS;

  const run = async () => {
    if (isRunning || mongoose.connection.readyState !== 1) return;
    isRunning = true;
    try {
      const result = await runAbandonedCartProcessor();
      if (result.sent || result.skipped) {
        console.log("Abandoned-cart worker:", result);
      }
    } catch (error) {
      console.error("Abandoned-cart worker pass failed:", error.message);
    } finally {
      isRunning = false;
    }
  };

  // Process anything that became due while the instance was asleep as soon as
  // this process is connected to MongoDB and starts serving requests.
  void run();
  intervalHandle = setInterval(run, pollIntervalMs);
  intervalHandle.unref?.();
  console.log(`Abandoned-cart worker started (polling every ${Math.round(pollIntervalMs / 60000)} minutes).`);
  return intervalHandle;
};

export const stopAbandonedCartWorker = () => {
  if (intervalHandle) clearInterval(intervalHandle);
  intervalHandle = null;
};
