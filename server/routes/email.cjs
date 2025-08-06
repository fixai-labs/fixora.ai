const express = require("express");
const { OpenAIService } = require("../services/openaiService.cjs");
const { checkUsageLimit, incrementUsage } = require("../middleware/usageLimit.cjs");

const router = express.Router();
const openaiService = new OpenAIService();

// Improve email content
router.post(
  "/improve-email",
  checkUsageLimit,
  incrementUsage,
  async (req, res) => {
    try {
      const { emailDraft, purpose } = req.body;

      // Validate required fields
      if (!emailDraft || !purpose) {
        return res.status(400).json({
          error: "Missing required fields",
          message: "emailDraft and purpose are required",
        });
      }

      // Validate email length
      if (emailDraft.length < 10) {
        return res.status(400).json({
          error: "Email too short",
          message: "Email draft must be at least 10 characters long",
        });
      }

      // Validate purpose
      const validPurposes = [
        "job-followup",
        "apology",
        "client-pitch",
        "meeting-request",
        "thank-you",
        "complaint",
        "networking",
        "proposal",
        "general",
      ];

      if (!validPurposes.includes(purpose)) {
        return res.status(400).json({
          error: "Invalid purpose",
          message: `Purpose must be one of: ${validPurposes.join(", ")}`,
        });
      }

      // Create email fix request
      const emailRequest = {
        emailDraft,
        purpose,
      };

      // Perform email improvement
      const result = await openaiService.improveEmail(emailRequest);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error("Email improvement error:", error);

      // Handle specific OpenAI errors
      if (error instanceof Error && error.message.includes("API key")) {
        return res.status(500).json({
          error: "Configuration error",
          message: "OpenAI API is not properly configured",
        });
      }

      res.status(500).json({
        error: "Email improvement failed",
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  }
);

module.exports = { emailRoute: router };
