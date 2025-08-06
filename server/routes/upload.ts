import express from "express";
import { upload } from "../config/multer";
import { FileProcessor } from "../utils/fileProcessor";

const router = express.Router();

// Upload and process resume file
router.post("/upload", upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: "No file uploaded",
        message: "Please select a resume file to upload",
      });
    }

    // Validate file
    const validation = FileProcessor.validateFile(req.file);
    if (!validation.isValid) {
      return res.status(400).json({
        error: "Invalid file",
        message: validation.error,
      });
    }

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
    console.error("Upload error:", error);
    res.status(500).json({
      error: "Upload failed",
      message:
        error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
});

export { router as uploadRoute };
