import { onRequest } from "firebase-functions/v2/https";
import app from "./src/app.js";

// Export the Express app as a Cloud Function
export const api = onRequest({ 
    region: "asia-southeast1", // Adjust region as needed
    memory: "256MiB",
    timeoutSeconds: 30
}, app);
