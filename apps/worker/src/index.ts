import { Queue, Worker } from "bullmq";
import { Redis } from "ioredis";

const connection = new Redis(process.env.REDIS_URL ?? "redis://localhost:6390", { maxRetriesPerRequest: null });

export const notifications = new Queue("notifications", { connection });

new Worker(
  "notifications",
  async (job) => {
    // WhatsApp / email / push handlers land here (P4)
    console.log("job", job.id, job.name);
  },
  { connection },
);

console.log("worker up");
