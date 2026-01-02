import { storageService } from "../services/storageService.js";
import { config } from "../config/env.js";

export const getPortfolio = async (req, res) => {
  const data = await storageService.getPortfolioData();
  res.json({
    data: data,
    owner: config.portfolioOwner,
    timestamp: new Date().toISOString(),
    version: "v1",
  });
};
