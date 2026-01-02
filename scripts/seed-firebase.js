import { db } from "../src/config/firebase.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const seedPortfolioData = async () => {
    if (!db) {
        console.error("❌ Firebase not initialized. Please check your .env configuration.");
        process.exit(1);
    }

    const dataPath = path.resolve(__dirname, "../data/portfolioData.json");
    
    try {
        console.log(`📖 Reading portfolio data from ${dataPath}...`);
        const rawData = fs.readFileSync(dataPath, "utf8");
        const portfolioData = JSON.parse(rawData);

        console.log("🚀 Uploading data to Firebase Firestore...");
        
        // Use the same collection/doc structure as StorageService
        await db.collection("portfolio").doc("main_profile").set(portfolioData);

        console.log("✅ Successfully seeded portfolio data to Firestore!");
        console.log("   Collection: portfolio");
        console.log("   Document ID: main_profile");
        
        process.exit(0);

    } catch (error) {
        console.error("❌ Error seeding data:", error.message);
        process.exit(1);
    }
};

seedPortfolioData();
