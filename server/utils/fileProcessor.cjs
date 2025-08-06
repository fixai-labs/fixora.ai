const mammoth = require("mammoth");

class FileProcessor {
  static async processFile(file) {
    let text = "";

    try {
      switch (file.mimetype) {
        case "application/pdf":
          throw new Error(
            "PDF processing is temporarily unavailable. Please upload a Word document (.docx) or text file (.txt) instead."
          );
          break;
        case "application/msword":
        case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
          text = await this.processWord(file.buffer);
          break;
        case "text/plain":
          text = file.buffer.toString("utf-8");
          break;
        default:
          throw new Error(`Unsupported file type: ${file.mimetype}`);
      }

      // Clean up the extracted text
      text = this.cleanText(text);

      if (!text.trim()) {
        throw new Error("No text content could be extracted from the file");
      }

      return {
        text,
        filename: file.originalname,
        size: file.size,
        type: file.mimetype,
      };
    } catch (error) {
      console.error("File processing error:", error);
      throw new Error(
        `Failed to process file: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  static async processWord(buffer) {
    try {
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    } catch (error) {
      throw new Error("Failed to extract text from Word document");
    }
  }

  static cleanText(text) {
    return (
      text
        // Remove excessive whitespace
        .replace(/\s+/g, " ")
        // Remove special characters that might interfere with processing
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, "")
        // Trim whitespace
        .trim()
    );
  }

  static validateFile(file) {
    const allowedTypes = [
      // "application/pdf", // Temporarily disabled
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      return {
        isValid: false,
        error:
          "Invalid file type. Only PDF, DOC, DOCX, and TXT files are allowed.",
      };
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return {
        isValid: false,
        error: "File too large. Maximum size is 10MB.",
      };
    }

    return { isValid: true };
  }
}

module.exports = { FileProcessor };
