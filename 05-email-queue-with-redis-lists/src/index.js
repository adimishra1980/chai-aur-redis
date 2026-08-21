import express from "express";
import Redis from "ioredis";

const app = express();
app.use(express.json());

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

const QUEUE_KEY = "queue:emails";

// queue email
app.post("/emails", async (req, res) => {
  const { to, subject, body } = req.body;

  const job = {
    to,
    subject: subject || "No subject",
    body: body || "No content",
    createdAt: new Date().toISOString(),
  };

  await redis.lpush(QUEUE_KEY, JSON.stringify(job));

  return res.status(202).json({ queued: true, job });
});

// consume job
app.get("/emails/process-one", async (req, res) => {
  const rawJob = await redis.rpop(QUEUE_KEY);

  if (!rawJob) return res.status(404).json({ error: "no job found" });

  const job = JSON.parse(rawJob);

  // simulating email sending
//   await new Promise((resolve) => setTimeout(resolve, 2000));

  res.json({
    message: "Email sent",
    job,
  });
});

app.listen(3000, () => {
  console.log("server is running on http://localhost:3000");
});

// drawbacks
// 1. job loss
// 2. no retry system
// 3. no parallel workers