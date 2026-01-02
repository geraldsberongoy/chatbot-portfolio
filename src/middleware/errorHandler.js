export const errorHandler = (err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({
      error: "Invalid JSON format",
      message:
        "Please check your JSON syntax. Common issues: missing quotes around property names, trailing commas, or malformed structure.",
      example: {
        correct: { message: "What is your experience?" },
        received: err.body ? err.body.substring(0, 100) : "Invalid JSON",
      },
      timestamp: new Date().toISOString(),
    });
  }
  
  console.error("Unhandled error:", err);
  // Default error handler
  res.status(500).json({
    error: "Internal server error",
    message: process.env.NODE_ENV === "development" ? err.message : undefined,
    timestamp: new Date().toISOString(),
  });
};
