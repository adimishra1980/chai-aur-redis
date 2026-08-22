import express from "express";
import Redis from "ioredis";

const app = express();
app.use(express.json());

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

const LEADERBOARD_KEY = "game:leaderboard";

// add a score
app.post("/score/:username", async (req, res) => {
  const { username } = req.params;
  const { points } = req.body;

  const result = await redis.zincrby(LEADERBOARD_KEY, points, username);

  await redis.incr("total:score");

  return res.json({
    status: "success",
    message: `${username} added ${points} points`,
  });
});

// get leaderboard
// app.get("/leaderboard", async (req, res) => {
//   const leaderboard = await redis.zrange(LEADERBOARD_KEY, 0, 9, {
//     REV: true,
//     WITHSCORES: true,
//   });

//   res.json({ leaderboard });
// });

app.get("/leaderboard", async (req, res) => {
  const leaderboard = await redis.zrevrange(
    LEADERBOARD_KEY,
    2,
    4,
    "WITHSCORES",
  );

  res.json({ leaderboard });
});

// get a player's rank
app.get("/rank/:username", async (req, res) => {
  const { username } = req.params;

  const rank = await redis.zrevrank(LEADERBOARD_KEY, username);

  res.json({
    username,
    rank: rank + 1,
  });
});

// get total score
app.get("/score/total", async (req, res) => {
  const total = await redis.get("total:score");

  res.json({
    total,
  });
});

app.listen(3000, () => {
  console.log("server is running on http://localhost:3000");
});
