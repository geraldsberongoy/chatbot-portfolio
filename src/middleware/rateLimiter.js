import { config } from "../config/env.js";

const rateLimitMap = new Map();

export function rateLimiter(req, res, next) {
  const clientIP = req.ip || req.connection.remoteAddress;
  const limit = config.rateLimitPerMinute;
  const windowMs = 60000; // 1 minute

  const now = Date.now();
  const clientData = rateLimitMap.get(clientIP) || {
    count: 0,
    resetTime: now + windowMs,
  };

  if (now > clientData.resetTime) {
    clientData.count = 0;
    clientData.resetTime = now + windowMs;
  }

  if (clientData.count >= limit) {
    return res.status(429).json({
      error: "Rate limit exceeded. Please try again later.",
      retryAfter: Math.ceil((clientData.resetTime - now) / 1000),
    });
  }

  clientData.count++;
  rateLimitMap.set(clientIP, clientData);
  next();
}
