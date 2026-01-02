import express from "express";
import cors from "cors";
import { config } from "./config/env.js";
import { errorHandler } from "./middleware/errorHandler.js";
import apiRoutes from "./routes/api.js";
import { getRoot } from "./controllers/systemController.js";

const app = express();

// Enhanced CORS configuration
app.use(
  cors({
    origin: config.allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-API-Key"],
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Root endpoint
app.get("/", getRoot);

// API Routes
app.use(config.apiVersion, apiRoutes);

// Error Handling (must be last)
app.use(errorHandler);

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Endpoint not found",
    availableEndpoints: [
      `${config.apiVersion}/chat`,
      `${config.apiVersion}/health`,
      `${config.apiVersion}/portfolio`,
      `${config.apiVersion}/analytics`,
      `${config.apiVersion}/docs`,
    ],
  });
});

export default app;
