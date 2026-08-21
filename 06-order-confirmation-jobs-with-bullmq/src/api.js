import express from "express";
import { emailQueue } from "./queue.js";

const app = express();

app.use(express.json());

app.post("/welcome-email", async (req, res) => {
  const { to, name } = req.body;

  const job = emailQueue.add(
    "welcome-email",
    {
      to,
      name: name || "Learner",
    },
    {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 1000,
      },
    },
  );

  res.json({
    message: "Welcome email job added to the queue!",
    jobId: job.id,
  });
});

app.listen(3000, () => {
  console.log("server is running on http://localhost:3000");
});
