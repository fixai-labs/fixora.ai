const mammoth = require("mammoth");

class FileProcessor {
  static async processFile(file) {
    let text = "";

    console.log("Processing file:", {
      filename: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      bufferLength: file.buffer?.length
    });

    try {
      switch (file.mimetype) {
        case "application/pdf":
          throw new Error(
            "PDF processing is temporarily unavailable. Please upload a Word document (.docx) or text file (.txt) instead."
          );
          break;
        case "application/msword":
        case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
          try {
            text = await this.processWord(file.buffer);
            if (!text || text.trim().length === 0) {
              throw new Error("No text extracted from Word document");
            }
          } catch (wordError) {
            console.error("Word processing failed, trying fallback:", wordError.message);
            // Fallback: try to extract as plain text
            try {
              text = file.buffer.toString("utf-8");
              console.log("Fallback text extraction, length:", text.length);
            } catch (fallbackError) {
              throw new Error(`Failed to process Word document: ${wordError.message}`);
            }
          }
          break;
        case "text/plain":
          console.log("Processing text file");
          text = file.buffer.toString("utf-8");
          console.log("Text file content length:", text.length);
          break;
        default:
          throw new Error(`Unsupported file type: ${file.mimetype}`);
      }

      // Clean up the extracted text
      text = this.cleanText(text);

      console.log("Cleaned text length:", text.length);
      console.log("Cleaned text preview:", text.substring(0, 100));

      if (!text || !text.trim() || text.trim().length < 10) {
        throw new Error(`No meaningful text content could be extracted from the file. Extracted text length: ${text ? text.length : 0}`);
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
      console.log("Processing Word document, buffer size:", buffer.length);
      const result = await mammoth.extractRawText({ buffer });
      console.log("Extracted text length:", result.value?.length || 0);
      console.log("Extracted text preview:", result.value?.substring(0, 100) || "No text");
      return result.value || "";
    } catch (error) {
      console.error("Word processing error:", error);
      throw new Error(`Failed to extract text from Word document: ${error.message}`);
    }
  }

  static cleanText(text) {
    if (!text || typeof text !== 'string') {
      return "";
    }

    return (
      text
        // Remove excessive whitespace
        .replace(/\s+/g, " ")
        // Remove special characters that might interfere with processing
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, "")
        // Remove any remaining null bytes or weird characters
        .replace(/\0/g, "")
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
