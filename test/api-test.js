#!/usr/bin/env node

/**
 * Simple API Tests for Portfolio Chatbot
 */

import http from "http";

const API_BASE = "http://localhost:5000";
const TEST_TIMEOUT = 5000;

// Test utilities
function makeRequest(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API_BASE);
    const req = http.request(
      url,
      {
        method: options.method || "GET",
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            const json = data ? JSON.parse(data) : null;
            resolve({
              status: res.statusCode,
              data: json,
              headers: res.headers,
            });
          } catch (_e) {
            resolve({ status: res.statusCode, data, headers: res.headers });
          }
        });
      }
    );

    req.on("error", reject);

    if (options.body) {
      req.write(
        typeof options.body === "string"
          ? options.body
          : JSON.stringify(options.body)
      );
    }

    req.end();
  });
}

// Test cases
const tests = [
  {
    name: "Health Check",
    test: async () => {
      const res = await makeRequest("/api/v1/health");
      if (res.status !== 200)
        throw new Error(`Expected 200, got ${res.status}`);
      if (!res.data.status) throw new Error("Missing status field");
      return `✅ Health check passed - Status: ${res.data.status}`;
    },
  },
  {
    name: "API Documentation",
    test: async () => {
      const res = await makeRequest("/api/v1/docs");
      if (res.status !== 200)
        throw new Error(`Expected 200, got ${res.status}`);
      if (!res.data.name) throw new Error("Missing API name");
      return `✅ API docs accessible - ${res.data.name}`;
    },
  },
  {
    name: "Chat API - Valid Request",
    test: async () => {
      const res = await makeRequest("/api/v1/chat", {
        method: "POST",
        body: { message: "What are your skills?" },
      });
      if (res.status !== 200)
        throw new Error(`Expected 200, got ${res.status}`);
      if (!res.data.reply) throw new Error("Missing reply field");
      return `✅ Chat API works - Provider: ${res.data.provider}`;
    },
  },
  {
    name: "Chat API - Invalid JSON",
    test: async () => {
      const res = await makeRequest("/api/v1/chat", {
        method: "POST",
        body: "{\"message\":\"test\",", // Invalid JSON
      });
      if (res.status !== 400)
        throw new Error(`Expected 400, got ${res.status}`);
      return "✅ Invalid JSON handling works";
    },
  },
  {
    name: "Chat API - Missing Message",
    test: async () => {
      const res = await makeRequest("/api/v1/chat", {
        method: "POST",
        body: {},
      });
      if (res.status !== 400)
        throw new Error(`Expected 400, got ${res.status}`);
      return "✅ Missing message validation works";
    },
  },
  {
    name: "404 Handler",
    test: async () => {
      const res = await makeRequest("/api/v1/nonexistent");
      if (res.status !== 404)
        throw new Error(`Expected 404, got ${res.status}`);
      return "✅ 404 handler works";
    },
  },
];

// Run tests
async function runTests() {
  console.log("🧪 Running Portfolio Chatbot API Tests\n");

  let passed = 0;
  let failed = 0;

  for (const testCase of tests) {
    try {
      const result = await Promise.race([
        testCase.test(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Test timeout")), TEST_TIMEOUT)
        ),
      ]);
      console.log(result);
      passed++;
    } catch (error) {
      console.log(`❌ ${testCase.name} - ${error.message}`);
      failed++;
    }
  }

  console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed`);

  if (failed > 0) {
    process.exit(1);
  }

  console.log("✅ All tests passed!");
}

// Handle unhandled rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch((error) => {
    console.error("❌ Test runner failed:", error.message);
    process.exit(1);
  });
}

export { runTests, makeRequest };
