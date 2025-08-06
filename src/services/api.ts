const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3001/api";

export interface AnalysisResult {
  matchScore: number;
  missingKeywords: string[];
  suggestions: string[];
  rewriteExamples: Array<{
    original: string;
    improved: string;
  }>;
  overallFeedback: string;
  coverLetter?: string;
}

export interface EmailFixResult {
  improvedEmail: string;
  explanation: string;
  improvements: string[];
  tone: string;
  professionalismScore?: number;
  clarityScore?: number;
  effectivenessScore?: number;
}

export interface EmailFixResponse {
  success: boolean;
  data: EmailFixResult;
}

export interface UploadResponse {
  success: boolean;
  data: {
    filename: string;
    size: number;
    type: string;
    textLength: number;
    preview: string;
  };
  text: string;
}

export interface AnalysisResponse {
  success: boolean;
  data: AnalysisResult;
}

export interface ApiError {
  error: string;
  message: string;
}

export class UsageLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UsageLimitError";
  }
}

class ApiService {
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData: ApiError = await response.json().catch(() => ({
        error: "Network Error",
        message: `HTTP ${response.status}: ${response.statusText}`,
      }));

      // Handle usage limit errors specially
      if (response.status === 429) {
        throw new UsageLimitError(errorData.message || "Usage limit exceeded");
      }

      throw new Error(
        errorData.message || errorData.error || "An error occurred"
      );
    }
    return response.json();
  }

  async uploadResume(
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append("resume", file);

    try {
      // Create XMLHttpRequest for progress tracking
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        // Track upload progress
        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable && onProgress) {
            const progress = (event.loaded / event.total) * 100;
            onProgress(Math.min(progress, 95)); // Cap at 95% for upload, leave 5% for processing
          }
        });

        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText);
              if (onProgress) onProgress(100); // Complete
              resolve(response);
            } catch (error) {
              reject(new Error("Invalid response format"));
            }
          } else {
            try {
              const errorData = JSON.parse(xhr.responseText);
              reject(
                new Error(
                  errorData.message || errorData.error || `HTTP ${xhr.status}`
                )
              );
            } catch {
              reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`));
            }
          }
        });

        xhr.addEventListener("error", () => {
          reject(new Error("Network error occurred"));
        });

        xhr.addEventListener("timeout", () => {
          reject(new Error("Upload timeout"));
        });

        xhr.open("POST", `${API_BASE_URL}/upload`);
        xhr.timeout = 60000; // 60 second timeout
        xhr.send(formData);
      });
    } catch (error) {
      console.error("Upload error:", error);
      throw new Error(
        error instanceof Error
          ? error.message
          : "Failed to upload resume. Please try again."
      );
    }
  }

  async analyzeResume(
    resumeText: string,
    jobDescription: string,
    purpose: "before-applying" | "after-rejection"
  ): Promise<AnalysisResponse> {
    console.log("Analyzing resume...");

    try {
      const response = await fetch(`${API_BASE_URL}/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resumeText,
          jobDescription,
          purpose,
        }),
      });

      return this.handleResponse<AnalysisResponse>(response);
    } catch (error) {
      console.error("Analysis error:", error);
      throw new Error(
        error instanceof Error
          ? error.message
          : "Failed to analyze resume. Please try again."
      );
    }
  }

  async exportPDF(
    resumeFilename: string,
    analysisResult: AnalysisResult,
    jobDescription: string,
    purpose: "before-applying" | "after-rejection"
  ): Promise<Blob> {
    try {
      const response = await fetch(`${API_BASE_URL}/export-pdf`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resumeFilename,
          analysisResult,
          jobDescription,
          purpose,
        }),
      });

      if (!response.ok) {
        const errorData: ApiError = await response.json().catch(() => ({
          error: "Export Error",
          message: `HTTP ${response.status}: ${response.statusText}`,
        }));
        throw new Error(
          errorData.message || errorData.error || "Export failed"
        );
      }

      return response.blob();
    } catch (error) {
      console.error("PDF export error:", error);
      throw new Error(
        error instanceof Error
          ? error.message
          : "Failed to export PDF. Please try again."
      );
    }
  }

  async improveEmail(
    emailDraft: string,
    purpose: string
  ): Promise<EmailFixResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/improve-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          emailDraft,
          purpose,
        }),
      });

      return this.handleResponse<EmailFixResponse>(response);
    } catch (error) {
      console.error("Email improvement error:", error);
      throw new Error(
        error instanceof Error
          ? error.message
          : "Failed to improve email. Please try again."
      );
    }
  }

  async healthCheck(): Promise<{ status: string; message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      return this.handleResponse(response);
    } catch (error) {
      console.error("Health check error:", error);
      throw new Error("Unable to connect to server");
    }
  }
}

export const apiService = new ApiService();
