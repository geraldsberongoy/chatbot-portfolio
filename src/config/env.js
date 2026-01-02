import dotenv from "dotenv";
dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || "development",
  allowedOrigins: process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",")
    : true,
  portfolioDataPath: process.env.PORTFOLIO_DATA_PATH,
  geminiApiKey: process.env.GEMINI_API_KEY,
  aiProvider: process.env.AI_PROVIDER || "fallback",
  portfolioOwner: process.env.PORTFOLIO_OWNER || "the portfolio owner",
  apiKey: process.env.API_KEY,
  rateLimitPerMinute: parseInt(process.env.RATE_LIMIT_PER_MINUTE) || 30,
  apiVersion: "/api/v1",
  firebase: {
    serviceAccountPath: process.env.FIREBASE_SERVICE_ACCOUNT_PATH,
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY
      ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
      : undefined,
  },
};
