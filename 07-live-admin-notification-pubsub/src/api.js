import express, { json } from "express";
import Redis from "ioredis";

const app = express();
const publisher = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

app.use(express.json());

app.post("/notifications", async (req, res) => {
  const payload = {
    title: req.body.title || "Default Title",
    createdAt: new Date().toISOString(),
  };

  const recievers = await publisher.publish(
    "notifications",
    JSON.stringify(payload),
  );

  res.json({ message: "Notification sent", recievers });
});

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
