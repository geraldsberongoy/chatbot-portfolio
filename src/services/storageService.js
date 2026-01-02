import { db } from "../config/firebase.js";
import { portfolioData as localPortfolioData } from "../utils/portfolioLoader.js";
import { analytics as localAnalytics } from "../utils/analytics.js";
import { config } from "../config/env.js";

// Collection names
const COLLECTIONS = {
  PORTFOLIO: "portfolio",
  ANALYTICS: "analytics",
  CHATS: "chats"
};

// Document IDs
const DOCS = {
  MAIN_PROFILE: "main_profile",
  STATS: "stats"
};

class StorageService {
  constructor() {
    this.useFirebase = !!db;
  }

  /**
   * Get portfolio data
   * Tries Firebase first, falls back to local JSON
   */
  async getPortfolioData() {
    if (this.useFirebase) {
      try {
        const doc = await db.collection(COLLECTIONS.PORTFOLIO).doc(DOCS.MAIN_PROFILE).get();
        if (doc.exists) {
          return doc.data();
        }
        console.log("ℹ️ Portfolio data not found in Firebase, using local backup.");
      } catch (error) {
        console.error("⚠️ Error fetching portfolio from Firebase:", error.message);
      }
    }
    return localPortfolioData;
  }

  /**
   * Log a chat query for analytics
   */
  async logQuery(message, source, reply) {
    // const timestamp = new Date().toISOString();
    
    // Always update local in-memory analytics
    localAnalytics.totalQueries++;
    localAnalytics.providerUsage[source] = (localAnalytics.providerUsage[source] || 0) + 1;
    
    const words = message.toLowerCase().split(/\s+/);
    words.forEach((word) => {
      if (word.length > 3) {
        localAnalytics.popularKeywords[word] =
          (localAnalytics.popularKeywords[word] || 0) + 1;
      }
    });

    // If Firebase is enabled, persist the chat log
    if (this.useFirebase) {
      try {
        await db.collection(COLLECTIONS.CHATS).add({
          message,
          reply,
          source,
          timestamp: new Date(),
          metadata: {
            provider: source,
            portfolioOwner: config.portfolioOwner
          }
        });

        // Update aggregate stats (atomically if possible, but keeping it simple for now)
        // Note: For high volume, use distributed counters or scheduled cloud functions
        const statsRef = db.collection(COLLECTIONS.ANALYTICS).doc(DOCS.STATS);
        
        // We use set with merge to create if not exists
        await statsRef.set({
           totalQueries: admin.firestore.FieldValue.increment(1),
           lastQuery: new Date(),
           [`providerUsage.${source}`]: admin.firestore.FieldValue.increment(1)
        }, { merge: true });

      } catch (error) {
        console.error("⚠️ Error logging to Firebase:", error.message);
      }
    }
  }

  /**
   * Get Analytics Data
   */
  async getAnalytics() {
    if (this.useFirebase) {
        try {
            const doc = await db.collection(COLLECTIONS.ANALYTICS).doc(DOCS.STATS).get();
            if (doc.exists) {
                const firebaseStats = doc.data();
                // Merge/Overlay with local stats if needed, or just return firebase stats
                // For now, let's return a mix
                return {
                    source: "firebase",
                    ...firebaseStats,
                    currentSession: localAnalytics // Keep track of current session stats too
                };
            }
        } catch (error) {
            console.error("⚠️ Error fetching analytics from Firebase:", error.message);
        }
    }
    return {
        source: "memory",
        ...localAnalytics
    };
  }
}

// Need to import admin for FieldValue, but it's a peer dependency of the config
// Lets just dynamic import or pass it in if needed. 
// Actually, `firebase-admin` is imported in config/firebase.js but we didn't export admin.
// Let's modify the import to get admin from firebase-admin package directly here since we installed it.
import admin from "firebase-admin";

export const storageService = new StorageService();
