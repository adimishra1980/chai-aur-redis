import express from "express";
import Redis from "ioredis";

const app = express();

app.use(express.json());

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

const BANNER_KEY = "app:banner";

// set banner
app.post("/banner", async (req, res) => {
  await redis.set(BANNER_KEY, req.body.message || "Welcome to our store");

  return res.json({ success: true, message: "Banner updated" });
});

app.get("/banner", async (req, res) => {
  const banner = await redis.get(BANNER_KEY);

  if (!banner) {
    return res.json({ message: "No banner set" });
  }

  return res.json({ banner });
});

app.delete("/banner", async (req, res) => {
  await redis.del(BANNER_KEY);

  return res.json({ success: true, message: "Banner deleted" });
});

app.get("/banner/exists", async (req, res) => {
  const exists = await redis.exists(BANNER_KEY);
  return res.json({ exists: Boolean(exists), value: exists });
});

app.listen(3000, () => {
  console.log("server started at 3000");
});
