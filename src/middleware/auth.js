import { config } from "../config/env.js";

export function authenticateAPI(req, res, next) {
  const apiKey = config.apiKey;

  if (apiKey) {
    const providedKey = req.headers["x-api-key"] || req.query.apiKey;
    if (!providedKey || providedKey !== apiKey) {
      return res.status(401).json({ error: "Invalid or missing API key" });
    }
  }

  next();
}
