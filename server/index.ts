import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(
  cors({
    origin: [
      process.env.CLIENT_URL || "http://localhost:5173",
      "http://localhost:8080",
      "http://localhost:8081",
    ],
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Import multer configuration
import { upload } from "./config/multer";
import { UsageService } from "./services/usageService";

// Import routes
import { analyzeRoute } from "./routes/analyze";
import { uploadRoute } from "./routes/upload";
import { exportRoute } from "./routes/export";
import { emailRoute } from "./routes/email";

// Routes
app.use("/api", analyzeRoute);
app.use("/api", uploadRoute);
app.use("/api", exportRoute);
app.use("/api", emailRoute);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Server is running",
    openaiConfigured: !!process.env.OPENAI_API_KEY,
  });
});

// Usage status endpoint
app.get("/api/usage", (req, res) => {
  try {
    const clientIP = req.ip || req.connection.remoteAddress || "unknown";
    const usageStatus = UsageService.getUsageStatus(clientIP);

    res.json({
      success: true,
      usage: usageStatus,
      upgrade:
        usageStatus.remaining === 0
          ? {
              message: "Upgrade to unlimited usage",
              price: "₹399/month",
              features: [
                "Unlimited resume analysis",
                "Unlimited email improvements",
                "Priority processing",
                "Advanced features",
              ],
            }
          : null,
    });
  } catch (error) {
    console.error("Usage status error:", error);
    res.status(500).json({ error: "Failed to get usage status" });
  }
});

// Error handling middleware
app.use(
  (
    error: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error("Error:", error);

    if (error instanceof multer.MulterError) {
      if (error.code === "LIMIT_FILE_SIZE") {
        return res
          .status(400)
          .json({ error: "File too large. Maximum size is 10MB." });
      }
    }

    res.status(500).json({
      error: "Internal server error",
      message:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Something went wrong",
    });
  }
);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📝 API endpoints available at http://localhost:${PORT}/api`);
});
