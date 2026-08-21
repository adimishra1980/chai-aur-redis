import express from "express";
import Redis from "ioredis";
import mongoose, { mongo } from "mongoose";

const app = express();

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

app.get("/redis", async (req, res) => {
  const reply = await redis.ping();
  return res.json({
    message: `redis replied with ${reply}`,
  });
});

app.get("/mongo", async (req, res) => {
  const url =
    process.env.MONGODB_URL || "mongodb://localhost:27017/chai_aur_redis";

  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(url);
    console.log("MongoDB connected");
  }

  return res.json({
    mongo: "connected",
    database: mongoose.connection.name,
  });
});

app.listen(3000, () => {
  console.log("server is running on port 3000");
});
