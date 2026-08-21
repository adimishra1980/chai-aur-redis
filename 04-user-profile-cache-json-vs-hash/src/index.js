import express from "express";
import Redis from "ioredis";

const app = express();
const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");
app.use(express.json());

// set in json
app.post("/user/:id/json", async (req, res) => {
  const { id } = req.params;

  await redis.set(`user:${id}:json`, JSON.stringify(req.body));
  res.json({ message: "User profile saved", savedAs: "json" });
});

// get in json
app.get("/user/:id/json", async (req, res) => {
  const { id } = req.params;
  const raw = await redis.get(`user:${id}:json`);

  return res.json({
    user: raw ? JSON.parse(raw) : null,
  });
});

// set in hash as object
app.post("/user/:id/hash", async (req, res) => {
  const { id } = req.params;

  await redis.hset(`user:${id}:hash`, req.body);
  res.json({ message: "User profile saved", savedAs: "hash" });
});

// get in hash
app.get("/user/:id/hash", async (req, res) => {
  const { id } = req.params;

  const user = await redis.hgetall(`user:${id}:hash`);
  res.json({
    user: user ? user : null,
  });
});

// update in json
app.put("/user/:id/json", async (req, res) => {
  const { id } = req.params;

  const raw = await redis.get(`user:${id}:json`);
  const user = raw ? JSON.parse(raw) : {};

  Object.assign(user, req.body);

  await redis.set(`user:${id}:json`, JSON.stringify(user));
  return res.json({ message: "User profile updated", updatedAs: "json" });
});

// update in hash
app.put("/user/:id/hash", async (req, res) => {
  const { id } = req.params;

  await redis.hset(`user:${id}:hash`, req.body);
  return res.json({ message: "User profile updated", updatedAs: "hash" });
});

// hget
app.get("/user/:id/hash/:field", async (req, res) => {
  const { id, field } = req.params;

  const user = await redis.hget(`user:${id}:hash`, field);
  return res.json({
    user,
  });
});

// hexists
app.get("/user/:id/hash/:field/exists", async (req, res) => {
  const { id, field } = req.params;

  const exists = await redis.hexists(`user:${id}:hash`, field);

  return res.json({
    exists: !!exists,
  });
});

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
