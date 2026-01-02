import app from "./src/app.js";
import { config } from "./src/config/env.js";

// Only start the server if we're not in production (for local development)
// Or just start it. The original code had a check.
// Start the server if file is run directly
import { fileURLToPath } from "url";

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const PORT = config.port;
  app.listen(PORT, () => {
    console.log(`🚀 Portfolio Chatbot Microservice running on port ${PORT}`);
    console.log(`👤 Portfolio Owner: ${config.portfolioOwner}`);
    console.log(`🤖 AI Provider: ${config.aiProvider}`);
    console.log(
      `🌐 API Documentation: http://localhost:${PORT}${config.apiVersion}/docs`
    );
    console.log(
      `💚 Health Check: http://localhost:${PORT}${config.apiVersion}/health`
    );
  });
}

// Export for Vercel/Serverless
export default app;
