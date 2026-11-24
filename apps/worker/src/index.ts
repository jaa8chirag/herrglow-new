import { Worker, type Job } from "bullmq";
import {
  JOB_DEFAULTS,
  QUEUE_NAME,
  enqueueNewLead,
  findUnnotifiedLeads,
  getQueue,
  processCustomerConfirmation,
  processDailyDigest,
  processNewApplication,
  processNewLead,
  redisConnection,
  whatsappEnabled,
  type JobKind,
} from "@herrglow/core";

/** All logic lives in @herrglow/core (notify/*). This file only wires queue → processors and schedules. */
async function handle(job: Job<{ id: string }>) {
  switch (job.name as JobKind) {
    case "new-lead":
      return processNewLead(job.data.id);
    case "customer-confirmation":
      return processCustomerConfirmation(job.data.id);
    case "new-application":
      return processNewApplication(job.data.id);
    case "daily-digest":
      return processDailyDigest();
    case "sweep": {
      const missed = await findUnnotifiedLeads();
      for (const l of missed) await enqueueNewLead(l.id);
      return { requeued: missed.length };
    }
    default:
      throw new Error(`Unknown job ${job.name}`);
  }
}

const worker = new Worker(QUEUE_NAME, handle, {
  connection: { ...redisConnection(), maxRetriesPerRequest: null },
  concurrency: 5,
});
worker.on("completed", (j, r) =>
  console.log(`[done] ${j.name} ${j.data?.id ?? ""}`, r ? JSON.stringify(r).slice(0, 160) : "")
);
worker.on("failed", (j, e) =>
  console.error(
    `[fail] ${j?.name} ${j?.data?.id ?? ""} attempt ${j?.attemptsMade}/${JOB_DEFAULTS.attempts}: ${e.message}`
  )
);
worker.on("error", (e) => console.error("[worker error]", e.message));

// schedules (idempotent upserts): 9:00 IST daily summary, 5-minute safety-net sweep for leads never notified
const q = getQueue();
await q.upsertJobScheduler(
  "daily-digest",
  { pattern: "0 9 * * *", tz: "Asia/Kolkata" },
  { name: "daily-digest", data: { id: "digest" }, opts: JOB_DEFAULTS }
);
await q.upsertJobScheduler(
  "sweep",
  { every: 5 * 60_000 },
  { name: "sweep", data: { id: "sweep" }, opts: JOB_DEFAULTS }
);

console.log(
  `worker up · queue "${QUEUE_NAME}" · WhatsApp ${whatsappEnabled() ? "ENABLED" : "disabled"}`
);

const stop = async () => {
  console.log("shutting down…");
  await worker.close();
  await q.close();
  process.exit(0);
};
process.on("SIGTERM", stop);
process.on("SIGINT", stop);
