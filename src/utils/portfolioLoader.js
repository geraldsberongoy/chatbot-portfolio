import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { config } from "../config/env.js";

const __filename = fileURLToPath(import.meta.url);
// Go up two levels from src/utils to root
const __dirname = path.dirname(path.dirname(path.dirname(__filename)));

let portfolioData;

const loadPortfolioData = () => {
    // If already loaded, return it
    if (portfolioData) return portfolioData;

    const dataPath = config.portfolioDataPath
      ? path.resolve(__dirname, config.portfolioDataPath)
      : path.resolve(__dirname, "data", "portfolioData.json");

    try {
      console.log(`Loading portfolio data from: ${dataPath}`);
      const rawData = fs.readFileSync(dataPath, "utf8");
      portfolioData = JSON.parse(rawData);
      console.log(
        `✅ Portfolio data loaded successfully for: ${
          portfolioData.profile
            ? portfolioData.profile.substring(0, 50) + "..."
            : "Unknown"
        }`
      );
    } catch (error) {
      console.error("❌ Failed to load portfolio data:", error.message);
      console.error("Attempted path:", dataPath);
      // Fallback empty data
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
    return portfolioData;
};

// Load immediately on module evaluation or wait? 
// It was synchronous in original file, so let's keep it that way for simplicity.
portfolioData = loadPortfolioData();

export { portfolioData };
