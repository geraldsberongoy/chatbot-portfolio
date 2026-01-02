import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "../config/env.js";
import { FallbackChatbot } from "./fallbackChatbot.js";
import { storageService } from "./storageService.js";

class ChatService {
  constructor() {
    this.geminiClient = config.geminiApiKey
      ? new GoogleGenerativeAI(config.geminiApiKey)
      : null;
    // We'll initialize fallbackBot on the fly or with initial data
  }

  async processMessage(message) {
    if (!message) {
      throw new Error("Message is required");
    }

    // Get latest data (from Firebase or local)
    const currentPortfolioData = await storageService.getPortfolioData();
    const fallbackBot = new FallbackChatbot(currentPortfolioData);

    // Try AI providers in order of preference
    if (config.aiProvider === "gemini" && this.geminiClient) {
      try {
        const prompt = this._buildPrompt(message, currentPortfolioData);
        const model = this.geminiClient.getGenerativeModel({
          model: "gemini-2.5-flash",
        });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        await storageService.logQuery(message, "gemini", text);

        return {
          reply: text,
          source: "gemini",
          provider: "Google Gemini (Free)",
          timestamp: new Date().toISOString(),
          version: "v1",
        };
      } catch (geminiError) {
        console.warn("Gemini API failed:", geminiError.message);
        // Fall through to fallback
      }
    }

    // Fallback to local responses
    const fallbackResponse = fallbackBot.generateResponse(message);
    await storageService.logQuery(message, "fallback", fallbackResponse);

    return {
      reply: fallbackResponse,
      source: "fallback",
      provider: "Smart Local Responses",
      notice: `Using built-in responses for ${config.portfolioOwner}.`,
      timestamp: new Date().toISOString(),
      version: "v1",
    };
  }
  
  async getErrorResponse(error, message) {
      // For error response, we try to use whatever data we can get
      const currentPortfolioData = await storageService.getPortfolioData();
      const fallbackBot = new FallbackChatbot(currentPortfolioData);
      
      const fallbackResponse = fallbackBot.generateResponse(message || "");
      
      // Try to log the error/fallback if possible
      try {
          await storageService.logQuery(message || "error", "error", fallbackResponse);
      } catch (_e) {
          // ignore logging error
      }

      return {
        reply: fallbackResponse,
        source: "fallback",
        provider: "Smart Local Responses",
        notice: "Service temporarily unavailable. Using built-in responses.",
        error: config.nodeEnv === "development" ? error.message : "Internal server error",
        timestamp: new Date().toISOString(),
        version: "v1",
      };
  }

  _buildPrompt(message, data) {
    return `You are ${config.portfolioOwner}'s professional portfolio chatbot. Your ONLY purpose is to provide information about their professional background, skills, education, projects, and career.

STRICT GUIDELINES:
1. ONLY answer questions about ${config.portfolioOwner}'s professional information from the provided data
2. If asked about anything NOT in the portfolio data (like personal life, food preferences, unrelated topics), politely redirect
3. Keep responses professional, concise, and helpful
4. Always stay within the scope of the provided portfolio data

${config.portfolioOwner}'s Portfolio Data:
${JSON.stringify(data, null, 2)}

RESPONSE RULES:
- If the question is about professional background: Answer using ONLY the provided data
- If the question is outside professional scope: Respond with "I'm ${config.portfolioOwner}'s portfolio assistant and can only help with questions about their professional background, skills, projects, education, and career. Please ask me something about their work experience, technical skills, or projects!"

User Question: ${message}
Your Response:`;
  }
}

export const chatService = new ChatService();
