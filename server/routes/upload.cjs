const express = require("express");
const { upload } = require("../config/multer.cjs");
const { FileProcessor } = require("../utils/fileProcessor.cjs");

const router = express.Router();

// Upload and process resume file
router.post("/upload", upload.single("resume"), async (req, res) => {
  try {
    console.log("Upload request received");

    if (!req.file) {
      console.log("No file in request");
      return res.status(400).json({
        error: "No file uploaded",
        message: "Please select a resume file to upload",
      });
    }

    console.log("File received:", {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    });

    // Validate file
    const validation = FileProcessor.validateFile(req.file);
    if (!validation.isValid) {
      console.log("File validation failed:", validation.error);
      return res.status(400).json({
        error: "Invalid file",
        message: validation.error,
      });
    }

    console.log("File validation passed, processing...");

    // Process file
    const processedFile = await FileProcessor.processFile(req.file);

    res.json({
      success: true,
      data: {
        filename: processedFile.filename,
        size: processedFile.size,
        type: processedFile.type,
        textLength: processedFile.text.length,
        preview: processedFile.text.substring(0, 200) + "...",
      },
      // Store the full text in a way that can be retrieved for analysis
      // In a production app, you'd want to store this in a database or cache
      text: processedFile.text,
    });
  } catch (error) {
    console.error("Upload error details:", {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({
      error: "Upload failed",
      message:
        error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
});

// Test endpoint to check if mammoth is working
router.get("/test-mammoth", async (req, res) => {
  try {
    const mammoth = require("mammoth");
    res.json({
      success: true,
      message: "Mammoth library is available",
      version: require("mammoth/package.json").version
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = { uploadRoute: router };
