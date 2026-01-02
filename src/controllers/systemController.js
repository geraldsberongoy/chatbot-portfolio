import { storageService } from "../services/storageService.js";
import { config } from "../config/env.js";

export const getHealth = (req, res) => {
  const status = {
    status: "healthy",
    server: "running",
    providers: {
      gemini: !!config.geminiApiKey,
      fallback: true,
      firebase: !!config.firebase.projectId || !!config.firebase.serviceAccountPath
    },
    activeProvider: config.aiProvider,
    portfolioOwner: config.portfolioOwner,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    version: "v1",
  };
  res.json(status);
};

export const getAnalytics = async (req, res) => {
  const analytics = await storageService.getAnalytics();
  
  const popularKeywords = analytics.popularKeywords || {};
  const topKeywords = Object.entries(popularKeywords)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([word, count]) => ({ word, count }));

  res.json({
    ...analytics,
    topKeywords,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    version: "v1",
  });
};

export const getDocs = (req, res) => {
  res.json({
    name: `${config.portfolioOwner}'s Portfolio Chatbot API`,
    version: "v1",
    description: "Microservice API for portfolio chatbot integration",
    endpoints: {
      "POST /api/v1/chat": {
        description: "Send a message to the chatbot",
        parameters: {
          message: "string (required) - The message to send",
          context: "object (optional) - Additional context",
        },
        example: {
          message: "What projects has the developer built?",
        },
      },
      "GET /api/v1/portfolio": {
        description: "Get portfolio data",
        auth: "API key required if configured",
      },
      "GET /api/v1/health": {
        description: "Health check endpoint",
      },
      "GET /api/v1/analytics": {
        description: "Get usage analytics",
        auth: "API key required if configured",
      },
    },
    authentication: config.apiKey
      ? "API key required in X-API-Key header"
      : "No authentication required",
    rateLimit: `${config.rateLimitPerMinute} requests per minute per IP`,
    storage: config.firebase.projectId ? "Firebase Firestore" : "Local Memory/File",
  });
};

export const getRoot = (req, res) => {
    res.json({
        name: `${config.portfolioOwner}'s Portfolio Chatbot API`,
        version: "v1",
        status: "running",
        documentation: `${req.protocol}://${req.get("host")}${config.apiVersion}/docs`,
        health: `${req.protocol}://${req.get("host")}${config.apiVersion}/health`,
    });
};
