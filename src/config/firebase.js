import admin from "firebase-admin";
import { config } from "./env.js";
import fs from "fs";
import path from "path";

let db = null;

try {
  let credential = null;

  // Option 1: Path to service account file
  if (config.firebase.serviceAccountPath) {
    const serviceAccountPath = path.resolve(config.firebase.serviceAccountPath);
    if (fs.existsSync(serviceAccountPath)) {
      const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));
      credential = admin.credential.cert(serviceAccount);
    }
  }

  // Option 2: Environment variables (better for production/Vercel)
  if (!credential && config.firebase.projectId && config.firebase.clientEmail && config.firebase.privateKey) {
    credential = admin.credential.cert({
      projectId: config.firebase.projectId,
      clientEmail: config.firebase.clientEmail,
      privateKey: config.firebase.privateKey,
    });
  }

  if (credential) {
    admin.initializeApp({
      credential,
    });
    db = admin.firestore();
    console.log("🔥 Firebase initialized successfully");
  } else {
    console.log("⚠️ Firebase credentials not found. Usage of Firebase features will be disabled.");
  }
} catch (error) {
  console.error("❌ Firebase initialization failed:", error.message);
}

export { db };
