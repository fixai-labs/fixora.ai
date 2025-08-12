import ky from "ky";

const API_BASE_URL =
  import.meta.env.VITE_SERVER_ROOT_URL || "https://fixora-ai-be.vercel.app/api";

// Create a ky instance with default configuration
const api = ky.create({
  prefixUrl: API_BASE_URL,
  timeout: 60000, // 60 second timeout
  retry: {
    limit: 2,
    methods: ["get", "post", "put", "delete"],
    statusCodes: [408, 413, 429, 500, 502, 503, 504],
  },
  hooks: {
    beforeError: [
      async (error: any) => {
        const { response } = error;
        if (response && response.status === 429) {
          const errorData = await response.json().catch(() => ({
            error: "Usage Limit Error",
            message: "Usage limit exceeded",
          }));
          throw new UsageLimitError(
            errorData.message || "Usage limit exceeded"
          );
        }
        return error;
      },
    ],
  },
});

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
  async uploadResume(
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append("resume", file);

    try {
      // Simulate progress for better UX (ky doesn't support upload progress natively)
      if (onProgress) {
        onProgress(25);
        setTimeout(() => onProgress(50), 500);
        setTimeout(() => onProgress(75), 1000);
        setTimeout(() => onProgress(95), 1500);
      }

      const response = await api
        .post("upload", {
          body: formData,
        })
        .json<UploadResponse>();

      if (onProgress) onProgress(100);
      return response;
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
      const response = await api
        .post("analyze", {
          json: {
            resumeText,
            jobDescription,
            purpose,
          },
        })
        .json<AnalysisResponse>();

      return response;
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
      const response = await api.post("export-pdf", {
        json: {
          resumeFilename,
          analysisResult,
          jobDescription,
          purpose,
        },
      });

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
      const response = await api
        .post("improve-email", {
          json: {
            emailDraft,
            purpose,
          },
        })
        .json<EmailFixResponse>();

      return response;
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
      const response = await api
        .get("health")
        .json<{ status: string; message: string }>();
      return response;
    } catch (error) {
      console.error("Health check error:", error);
      throw new Error("Unable to connect to server");
    }
  }

  async getUsageStatus(): Promise<{
    success: boolean;
    usage: {
      used: number;
      limit: number;
      remaining: number;
    };
    upgrade?: {
      price: string;
      features: string[];
    };
  }> {
    try {
      const response = await api.get("usage").json<{
        success: boolean;
        usage: {
          used: number;
          limit: number;
          remaining: number;
        };
        upgrade?: {
          price: string;
          features: string[];
        };
      }>();
      return response;
    } catch (error) {
      console.error("Usage status error:", error);
      // Return mock data if the endpoint doesn't exist yet or CORS issues
      console.log("Falling back to mock data due to backend unavailability");
      return {
        success: true,
        usage: {
          used: 0,
          limit: 5,
          remaining: 5,
        },
        upgrade: {
          price: "$9.99/month",
          features: [
            "Unlimited resume analyses",
            "Priority support",
            "Advanced AI insights",
            "PDF export",
          ],
        },
      };
    }
  }
}

export const apiService = new ApiService();
