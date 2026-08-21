import express from "express";
import Redis from "ioredis";

const app = express();
app.use(express.json());

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");


function otpKey(phone) {
  return `otp:${phone}`;
}

// set otp in redis
app.post("/otp", async (req, res) => {
  const { phone } = req.body;
  if (!phone) {
    return res
      .status(400)
      .json({ success: false, message: "Phone number is required" });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  console.log("OTP:", otp);

  await redis.set(otpKey(phone), otp, "EX", 20);
  res.json({ success: true, message: "OTP sent successfully", otp });
});

// verify otp
app.post("/otp/verify", async (req, res) => {
  const { phone, otp } = req.body;
  const savedOtp = await redis.get(otpKey(phone));

  if (!savedOtp) {
    return res.status(400).json({
      message: "OTP expired or not found",
    });
  }

  if (savedOtp !== otp) {
    return res.status(400).json({
      message: "Invalid OTP",
    });
  }

  // verify user details

  await redis.del(otpKey(phone));
  return res.status(200).json({
    message: "OTP Verified",
  });
});

// get ttl from redis
app.get("/otp/:phone/ttl", async (req, res) => {
  const { phone } = req.params;

  const ttl = await redis.ttl(otpKey(phone));

  return res.json({ ttl });
});

app.listen(3000, () => {
  console.log("Server running on port http://localhost:3000");
});
