import express from "express";
import { chatController } from "../controllers/chatController.js";
import { getPortfolio } from "../controllers/portfolioController.js";
import { getHealth, getAnalytics, getDocs } from "../controllers/systemController.js";
import { authenticateAPI } from "../middleware/auth.js";
import { rateLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

router.post("/chat", rateLimiter, authenticateAPI, chatController);
router.get("/portfolio", authenticateAPI, getPortfolio);
router.get("/health", getHealth);
router.get("/analytics", authenticateAPI, getAnalytics);
router.get("/docs", getDocs);

export default router;
