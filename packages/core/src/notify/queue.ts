import { Queue } from "bullmq";

export const QUEUE_NAME = "notifications";
export type JobKind =
  "new-lead" | "customer-confirmation" | "new-application" | "daily-digest" | "sweep";

export const redisConnection = () => {
  const url = new URL(process.env.REDIS_URL ?? "redis://localhost:6390");
  return {
    host: url.hostname,
    port: Number(url.port || 6379),
    password: url.password || undefined,
    username: url.username || undefined,
    tls: url.protocol === "rediss:" ? {} : undefined,
  };
};

export const JOB_DEFAULTS = {
  attempts: 6,
  backoff: { type: "exponential" as const, delay: 30_000 }, // 30s, 1m, 2m, 4m, 8m
  removeOnComplete: { count: 1000 },
  removeOnFail: { count: 5000 },
};

let queue: Queue | null = null;
export const getQueue = () =>
  (queue ??= new Queue(QUEUE_NAME, {
    connection: { ...redisConnection(), enableOfflineQueue: false, maxRetriesPerRequest: 1 },
    defaultJobOptions: JOB_DEFAULTS,
  }));

/** Never blocks or fails the caller for long: if Redis is unreachable the worker's sweep re-queues the item. */
export async function enqueue(kind: JobKind, id: string): Promise<boolean> {
  try {
    await Promise.race([
      getQueue().add(kind, { id }, { jobId: `${kind}-${id}` }),
      new Promise((_, rej) => setTimeout(() => rej(new Error("enqueue timeout")), 1500)),
    ]);
    return true;
  } catch (e) {
    console.warn(`[notify] could not enqueue ${kind} ${id}: ${(e as Error).message}`);
    return false;
  }
}

export const enqueueNewLead = async (leadId: string) => {
  const a = await enqueue("new-lead", leadId);
  const b = await enqueue("customer-confirmation", leadId);
  return a && b;
};
