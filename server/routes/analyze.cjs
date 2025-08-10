const express = require("express");
const { OpenAIService } = require("../services/openaiService.cjs");
const { checkUsageLimit, incrementUsage } = require("../middleware/usageLimit.cjs");

const router = express.Router();
const openaiService = new OpenAIService();

// Analyze resume against job description
router.post("/analyze", checkUsageLimit, incrementUsage, async (req, res) => {
  try {
    const { resumeText, jobDescription, purpose } = req.body;

    // Validate required fields
    if (!resumeText || !jobDescription || !purpose) {
      return res.status(400).json({
        error: "Missing required fields",
        message: "resumeText, jobDescription, and purpose are required",
      });
    }

    // Validate purpose value
    if (!["before-applying", "after-rejection"].includes(purpose)) {
      return res.status(400).json({
        error: "Invalid purpose",
        message:
          'purpose must be either "before-applying" or "after-rejection"',
      });
    }

    // Validate text lengths
    if (resumeText.length < 10) {
      return res.status(400).json({
        error: "Resume too short",
        message: "Resume text must be at least 10 characters long",
      });
    }

    if (jobDescription.length < 10) {
      return res.status(400).json({
        error: "Job description too short",
        message: "Job description must be at least 10 characters long",
      });
    }

    // Create analysis request
    const analysisRequest = {
      resumeText,
      jobDescription,
      purpose,
    };

    // Perform analysis
    const result = await openaiService.analyzeResume(analysisRequest);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Analysis error:", error);

    // Handle specific OpenAI errors
    if (error instanceof Error && error.message.includes("API key")) {
      return res.status(500).json({
        error: "Configuration error",
        message: "OpenAI API is not properly configured",
      });
    }

    res.status(500).json({
      error: "Analysis failed",
      message:
        error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
});

module.exports = { analyzeRoute: router };
