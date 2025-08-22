import { useState } from "react";
import { ResumeUpload } from "@/components/ResumeUpload";
import { JobDescriptionForm } from "@/components/JobDescriptionForm";
import { FeedbackDisplay } from "@/components/FeedbackDisplay";
import { EmailFixModule } from "@/components/EmailFixModule";
import { UsageTracker } from "@/components/UsageTracker";
import { PricingModal } from "@/components/PricingModal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Brain, AlertCircle, FileText, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiService, AnalysisResult, UsageLimitError } from "@/services/api";

const Index = () => {
  const [activeTab, setActiveTab] = useState("realfix");
  const [showPricingModal, setShowPricingModal] = useState(false);

  // RealFix AI states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState<string>("");
  const [jobDescription, setJobDescription] = useState("");
  const [purpose, setPurpose] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [feedback, setFeedback] = useState<AnalysisResult | null>(null);
  const [errors, setErrors] = useState<{
    file?: string;
    jobDescription?: string;
    purpose?: string;
    general?: string;
  }>({});
  const { toast } = useToast();

  // Validation functions
  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!selectedFile) {
      newErrors.file = "Please upload a resume file";
    }

    if (!resumeText.trim()) {
      newErrors.file = "Resume file could not be processed or is empty";
    }

    if (!jobDescription.trim()) {
      newErrors.jobDescription = "Job description is required";
    } else if (jobDescription.trim().length < 10) {
      newErrors.jobDescription =
        "Job description must be at least 10 characters long";
    }

    if (!purpose) {
      newErrors.purpose = "Please select an analysis purpose";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const canAnalyze =
    !!(resumeText.trim() && jobDescription.trim() && purpose) &&
    !isAnalyzing &&
    !isUploading;

  const handleAnalyze = async () => {
    // Clear previous errors
    setErrors({});

    // Validate form before proceeding
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors below and try again.",
        variant: "destructive",
      });
      return;
    }

    if (!canAnalyze) return;

    setIsAnalyzing(true);

    try {
      const response = await apiService.analyzeResume(
        resumeText,
        jobDescription,
        purpose as "before-applying" | "after-rejection"
      );

      setFeedback(response.data);
      setErrors({}); // Clear any previous errors
      toast({
        title: "Analysis Complete!",
        description: "Your resume has been analyzed successfully.",
      });
    } catch (error) {
      console.error("Analysis error:", error);

      // Handle usage limit errors
      if (error instanceof UsageLimitError) {
        setShowPricingModal(true);
        toast({
          title: "Usage Limit Reached",
          description:
            "You've reached your daily limit. Upgrade for unlimited access!",
          variant: "destructive",
        });
        return;
      }

      // Handle specific error types
      let errorMessage = "Please try again or check your connection.";

      if (error instanceof Error) {
        if (error.message.includes("Job description too short")) {
          setErrors({ jobDescription: "Job description must be longer" });
          errorMessage =
            "Job description is too short. Please provide more details.";
        } else if (error.message.includes("Resume too short")) {
          setErrors({
            file: "Resume content is too short or could not be processed",
          });
          errorMessage =
            "Resume content is insufficient. Please upload a more detailed resume.";
        } else if (error.message.includes("OPENAI_API_KEY")) {
          setErrors({ general: "AI service is not configured properly" });
          errorMessage =
            "AI analysis service is not available. Please contact support.";
        } else {
          errorMessage = error.message;
        }
      }

      toast({
        title: "Analysis Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleExportPDF = async () => {
    if (!feedback || !selectedFile) return;

    try {
      const blob = await apiService.exportPDF(
        selectedFile.name,
        feedback,
        jobDescription,
        purpose as "before-applying" | "after-rejection"
      );

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `resume-analysis-${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "PDF Exported",
        description: "Your resume analysis report has been downloaded.",
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export Failed",
        description:
          error instanceof Error ? error.message : "Failed to export PDF",
        variant: "destructive",
      });
    }
  };

  const handleFileSelect = async (file: File | null) => {
    // Clear previous errors
    setErrors((prev) => ({ ...prev, file: undefined }));
    setSelectedFile(file);
    setResumeText("");

    if (file) {
      // Validate file before upload
      const maxSize = 10 * 1024 * 1024; // 10MB
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain",
      ];

      if (file.size > maxSize) {
        const error = "File size must be less than 10MB";
        setErrors((prev) => ({ ...prev, file: error }));
        toast({
          title: "File Too Large",
          description: error,
          variant: "destructive",
        });
        setSelectedFile(null);
        return;
      }

      if (!allowedTypes.includes(file.type)) {
        const error =
          "Only PDF, Word documents (.docx), and text files (.txt) are supported";
        setErrors((prev) => ({ ...prev, file: error }));
        toast({
          title: "Unsupported File Type",
          description: error,
          variant: "destructive",
        });
        setSelectedFile(null);
        return;
      }

      setIsUploading(true);
      console.log("Uploading file...");

      setUploadProgress(0);

      try {
        const response = await apiService.uploadResume(file, (progress) => {
          setUploadProgress(progress);
        });

        // Small delay to show completion
        if (uploadProgress >= 100) {
          await new Promise((resolve) => setTimeout(resolve, 800));
        }

        setResumeText(response.text);

        // Validate extracted text
        if (!response.text || response.text.trim().length < 10) {
          throw new Error(
            "Could not extract sufficient text from the file. Please ensure your resume contains readable text."
          );
        }

        toast({
          title: "File Uploaded",
          description: `Successfully processed ${response.data.filename}`,
        });
      } catch (error) {
        console.error("Upload error:", error);

        let errorMessage = "Failed to process file";

        if (error instanceof Error) {
          if (error.message.includes("Invalid file type")) {
            errorMessage =
              "Only PDF, Word documents (.docx), and text files (.txt) are supported";
          } else if (error.message.includes("File too large")) {
            errorMessage = "File size must be less than 10MB";
          } else if (error.message.includes("extract")) {
            errorMessage =
              "Could not extract text from file. Please try a different format.";
          } else {
            errorMessage = error.message;
          }
        }

        setErrors((prev) => ({ ...prev, file: errorMessage }));
        toast({
          title: "Upload Failed",
          description: errorMessage,
          variant: "destructive",
        });
        setSelectedFile(null);
        setResumeText("");
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
      }
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setResumeText("");
    setJobDescription("");
    setPurpose("");
    setFeedback(null);
    setErrors({});
    setIsAnalyzing(false);
    setIsUploading(false);
    setUploadProgress(0);
  };

  // Clear specific field errors when user starts typing
  const handleJobDescriptionChange = (value: string) => {
    setJobDescription(value);
    if (errors.jobDescription) {
      setErrors((prev) => ({ ...prev, jobDescription: undefined }));
    }
  };

  const handlePurposeChange = (value: string) => {
    setPurpose(value);
    if (errors.purpose) {
      setErrors((prev) => ({ ...prev, purpose: undefined }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-gradient-to-r from-primary to-primary-glow rounded-2xl shadow-lg">
              <Brain className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent mb-4">
            Fixora.ai
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            AI-powered platform to fix and optimize your professional content.
            Transform resumes and emails with intelligent analysis.
          </p>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 max-w-3xl mx-auto">
            <div className="flex items-center space-x-3 p-4 bg-card/50 rounded-xl border">
              <FileText className="w-6 h-6 text-primary" />
              <span className="text-sm font-medium">
                RealFix AI - Resume Optimizer
              </span>
            </div>
            <div className="flex items-center space-x-3 p-4 bg-card/50 rounded-xl border">
              <Mail className="w-6 h-6 text-primary" />
              <span className="text-sm font-medium">
                EmailFix AI - Email Enhancer
              </span>
            </div>
            <div className="flex items-center space-x-3 p-4 bg-card/50 rounded-xl border">
              <Sparkles className="w-6 h-6 text-primary" />
              <span className="text-sm font-medium">Professional Results</span>
            </div>
          </div>
        </div>

        {/* Usage Tracker */}
        <div className="max-w-md mx-auto mb-8">
          <UsageTracker onUpgradeClick={() => setShowPricingModal(true)} />
        </div>

        {/* Module Tabs */}
        <div className="max-w-6xl mx-auto">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="realfix" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                RealFix AI
              </TabsTrigger>
              <TabsTrigger value="emailfix" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                EmailFix AI
              </TabsTrigger>
            </TabsList>

            <TabsContent value="realfix" className="space-y-6">
              {!feedback ? (
                // RealFix Input Form
                <div>
                  {/* General Error Display */}
                  {errors.general && (
                    <Card className="mb-6 p-4 bg-destructive/5 border-destructive/20">
                      <div className="flex items-center text-destructive">
                        <AlertCircle className="w-5 h-5 mr-2" />
                        <span className="font-medium">Error:</span>
                        <span className="ml-2">{errors.general}</span>
                      </div>
                    </Card>
                  )}

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <ResumeUpload
                      onFileSelect={handleFileSelect}
                      selectedFile={selectedFile}
                      error={errors.file}
                      isUploading={isUploading}
                      uploadProgress={uploadProgress}
                    />
                    <JobDescriptionForm
                      jobDescription={jobDescription}
                      onJobDescriptionChange={handleJobDescriptionChange}
                      purpose={purpose}
                      onPurposeChange={handlePurposeChange}
                      onAnalyze={handleAnalyze}
                      isAnalyzing={isAnalyzing}
                      canAnalyze={canAnalyze}
                      errors={{
                        jobDescription: errors.jobDescription,
                        purpose: errors.purpose,
                      }}
                    />
                  </div>
                </div>
              ) : (
                // RealFix Results Display
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-foreground">
                      Resume Analysis Results
                    </h2>
                    <Button onClick={resetForm} variant="outline">
                      Analyze Another Resume
                    </Button>
                  </div>
                  <FeedbackDisplay
                    feedback={feedback}
                    onExportPDF={handleExportPDF}
                  />
                </div>
              )}

              {/* RealFix Integration Notice */}
              {!feedback && (
                <Card className="mt-8 p-6 bg-primary/5 border-primary/20">
                  <div className="text-center">
                    <h3 className="font-semibold text-primary mb-2">
                      AI-Powered Resume Analysis
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Upload your resume and job description to get instant
                      AI-powered feedback and optimization suggestions.
                    </p>
                  </div>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="emailfix" className="space-y-6">
              <EmailFixModule
                onUpgradeClick={() => setShowPricingModal(true)}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-border/50">
          <div className="text-center text-muted-foreground">
            <p className="text-sm">
              © 2024 Fixora.ai - AI-Powered Professional Content Optimizer
            </p>
            <p className="text-xs mt-2">
              Transform your career with intelligent resume and email
              enhancement
            </p>
          </div>
        </footer>
      </div>

      {/* Pricing Modal */}
      <PricingModal
        isOpen={showPricingModal}
        onClose={() => setShowPricingModal(false)}
      />
    </div>
  );
};

export default Index;
