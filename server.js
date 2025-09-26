import express from "express";
import cors from "cors";
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { FallbackChatbot } from "./src/fallbackResponses.js";

dotenv.config();

// Fix for ES modules __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Enhanced CORS configuration for microservice
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(",")
      : true,
    credentials: true,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-API-Key"],
  })
);

// Backend-only microservice - no static file serving needed

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// JSON parsing error handler
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({
      error: "Invalid JSON format",
      message:
        "Please check your JSON syntax. Common issues: missing quotes around property names, trailing commas, or malformed structure.",
      example: {
        correct: { message: "What is your experience?" },
        received: err.body ? err.body.substring(0, 100) : "Invalid JSON",
      },
      timestamp: new Date().toISOString(),
    });
  }
  next(err);
});

// API versioning
const API_VERSION = "/api/v1";

// Load portfolio data (make it configurable)
const portfolioDataPath = process.env.PORTFOLIO_DATA_PATH
  ? path.resolve(__dirname, process.env.PORTFOLIO_DATA_PATH)
  : path.resolve(__dirname, "data", "portfolioData.json");
let portfolioData;

try {
  console.log(`Loading portfolio data from: ${portfolioDataPath}`);
  portfolioData = JSON.parse(fs.readFileSync(portfolioDataPath, "utf8"));
  console.log(
    `✅ Portfolio data loaded successfully for: ${
      portfolioData.profile
        ? portfolioData.profile.substring(0, 50) + "..."
        : "Unknown"
    }`
  );
} catch (error) {
  console.error("❌ Failed to load portfolio data:", error.message);
  console.error("Attempted path:", portfolioDataPath);
  portfolioData = {
    profile: "Portfolio data not configured",
    projects: [],
    skills: { languages: [], frameworks: [], databases: [], tools: [] },
    experience: [],
    education: {},
    certifications: [],
    contact: {},
  };
}

// Initialize fallback chatbot
const fallbackBot = new FallbackChatbot(portfolioData);

// Initialize AI clients
const geminiClient = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

// Configuration
const AI_PROVIDER = process.env.AI_PROVIDER || "fallback";
const PORTFOLIO_OWNER = process.env.PORTFOLIO_OWNER || "the portfolio owner";

// Simple analytics tracking
const analytics = {
  totalQueries: 0,
  popularKeywords: {},
  outOfScopeCount: 0,
  providerUsage: { gemini: 0, fallback: 0 },
  startTime: new Date().toISOString(),
};

function trackQuery(message, source) {
  analytics.totalQueries++;
  analytics.providerUsage[source] = (analytics.providerUsage[source] || 0) + 1;

  const words = message.toLowerCase().split(/\s+/);
  words.forEach((word) => {
    if (word.length > 3) {
      analytics.popularKeywords[word] =
        (analytics.popularKeywords[word] || 0) + 1;
    }
  });
}

// API Key authentication (optional)
function authenticateAPI(req, res, next) {
  const apiKey = process.env.API_KEY;

  if (apiKey) {
    const providedKey = req.headers["x-api-key"] || req.query.apiKey;
    if (!providedKey || providedKey !== apiKey) {
      return res.status(401).json({ error: "Invalid or missing API key" });
    }
  }

  next();
}

// Rate limiting (simple implementation)
const rateLimitMap = new Map();

function rateLimit(req, res, next) {
  const clientIP = req.ip || req.connection.remoteAddress;
  const limit = parseInt(process.env.RATE_LIMIT_PER_MINUTE) || 30;
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

// Main chat endpoint
app.post(
  `${API_VERSION}/chat`,
  rateLimit,
  authenticateAPI,
  async (req, res) => {
    try {
      const { message } = req.body;

      if (!message) {
        return res.status(400).json({
          error: "Message is required",
          example: { message: "What projects has the developer built?" },
        });
      }

      const prompt = `You are ${PORTFOLIO_OWNER}'s professional portfolio chatbot. Your ONLY purpose is to provide information about their professional background, skills, education, projects, and career.

STRICT GUIDELINES:
1. ONLY answer questions about ${PORTFOLIO_OWNER}'s professional information from the provided data
2. If asked about anything NOT in the portfolio data (like personal life, food preferences, unrelated topics), politely redirect
3. Keep responses professional, concise, and helpful
4. Always stay within the scope of the provided portfolio data

${PORTFOLIO_OWNER}'s Portfolio Data:
${JSON.stringify(portfolioData, null, 2)}

RESPONSE RULES:
- If the question is about professional background: Answer using ONLY the provided data
- If the question is outside professional scope: Respond with "I'm ${PORTFOLIO_OWNER}'s portfolio assistant and can only help with questions about their professional background, skills, projects, education, and career. Please ask me something about their work experience, technical skills, or projects!"

User Question: ${message}
Your Response:`;

      // Try AI providers in order of preference
      if (AI_PROVIDER === "gemini" && geminiClient) {
        try {
          const model = geminiClient.getGenerativeModel({
            model: "gemini-2.5-pro",
          });
          const result = await model.generateContent(prompt);
          const response = await result.response;
          const text = response.text();

          trackQuery(message, "gemini");

          return res.json({
            reply: text,
            source: "gemini",
            provider: "Google Gemini (Free)",
            timestamp: new Date().toISOString(),
            version: "v1",
          });
        } catch (geminiError) {
          console.warn("Gemini API failed:", geminiError.message);
        }
      }

      // Fallback to local responses
      const fallbackResponse = fallbackBot.generateResponse(message);

      trackQuery(message, "fallback");

      res.json({
        reply: fallbackResponse,
        source: "fallback",
        provider: "Smart Local Responses",
        notice: `Using built-in responses for ${PORTFOLIO_OWNER}.`,
        timestamp: new Date().toISOString(),
        version: "v1",
      });
    } catch (error) {
      console.error("Error:", error);

      const fallbackResponse = fallbackBot.generateResponse(
        req.body.message || ""
      );
      res.status(500).json({
        reply: fallbackResponse,
        source: "fallback",
        provider: "Smart Local Responses",
        notice: "Service temporarily unavailable. Using built-in responses.",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Internal server error",
        timestamp: new Date().toISOString(),
        version: "v1",
      });
    }
  }
);

// Portfolio data endpoint (for integration)
app.get(`${API_VERSION}/portfolio`, authenticateAPI, (req, res) => {
  res.json({
    data: portfolioData,
    owner: PORTFOLIO_OWNER,
    timestamp: new Date().toISOString(),
    version: "v1",
  });
});

// Health check endpoint
app.get(`${API_VERSION}/health`, (req, res) => {
  const status = {
    status: "healthy",
    server: "running",
    providers: {
      gemini: !!geminiClient,
      fallback: true,
    },
    activeProvider: AI_PROVIDER,
    portfolioOwner: PORTFOLIO_OWNER,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    version: "v1",
  };
  res.json(status);
});

// Analytics endpoint
app.get(`${API_VERSION}/analytics`, authenticateAPI, (req, res) => {
  const topKeywords = Object.entries(analytics.popularKeywords)
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
});

// API documentation endpoint
app.get(`${API_VERSION}/docs`, (req, res) => {
  res.json({
    name: `${PORTFOLIO_OWNER}'s Portfolio Chatbot API`,
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
    authentication: process.env.API_KEY
      ? "API key required in X-API-Key header"
      : "No authentication required",
    rateLimit: `${
      process.env.RATE_LIMIT_PER_MINUTE || 30
    } requests per minute per IP`,
  });
});

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    name: `${PORTFOLIO_OWNER}'s Portfolio Chatbot API`,
    version: "v1",
    status: "running",
    documentation: `${req.protocol}://${req.get("host")}${API_VERSION}/docs`,
    health: `${req.protocol}://${req.get("host")}${API_VERSION}/health`,
  });
});

// Error handling middleware
app.use((err, req, res, _next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    error: "Internal server error",
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Endpoint not found",
    availableEndpoints: [
      `${API_VERSION}/chat`,
      `${API_VERSION}/health`,
      `${API_VERSION}/portfolio`,
      `${API_VERSION}/analytics`,
      `${API_VERSION}/docs`,
    ],
  });
});

// Export the Express app for Vercel
export default app;

// Only start the server if we're not in production (for local development)
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Portfolio Chatbot Microservice running on port ${PORT}`);
    console.log(`👤 Portfolio Owner: ${PORTFOLIO_OWNER}`);
    console.log(`🤖 AI Provider: ${AI_PROVIDER}`);
    console.log("📊 Available providers:", {
      gemini: !!geminiClient,
      fallback: true,
    });
    console.log(
      `🌐 API Documentation: http://localhost:${PORT}${API_VERSION}/docs`
    );
    console.log(
      `💚 Health Check: http://localhost:${PORT}${API_VERSION}/health`
    );
  });
}
