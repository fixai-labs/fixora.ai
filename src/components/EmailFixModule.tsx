import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Mail,
  Copy,
  Download,
  Sparkles,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { apiService, EmailFixResult, UsageLimitError } from "@/services/api";

interface EmailFixModuleProps {
  className?: string;
  onUpgradeClick?: () => void;
}

export function EmailFixModule({
  className,
  onUpgradeClick,
}: EmailFixModuleProps) {
  const [emailDraft, setEmailDraft] = useState("");
  const [purpose, setPurpose] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<EmailFixResult | null>(null);
  const [errors, setErrors] = useState<{
    email?: string;
    purpose?: string;
    general?: string;
  }>({});
  const { toast } = useToast();

  const emailPurposes = [
    { value: "job-followup", label: "Job Follow-up" },
    { value: "apology", label: "Apology" },
    { value: "client-pitch", label: "Client Pitch" },
    { value: "meeting-request", label: "Meeting Request" },
    { value: "thank-you", label: "Thank You" },
    { value: "complaint", label: "Complaint/Concern" },
    { value: "networking", label: "Networking" },
    { value: "proposal", label: "Business Proposal" },
    { value: "general", label: "General Professional" },
  ];

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!emailDraft.trim()) {
      newErrors.email = "Email draft is required";
    } else if (emailDraft.trim().length < 10) {
      newErrors.email = "Email must be at least 10 characters long";
    }

    if (!purpose) {
      newErrors.purpose = "Please select an email purpose";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFixEmail = async () => {
    setErrors({});

    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors below and try again.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const response = await apiService.improveEmail(emailDraft, purpose);
      setResult(response.data);
      toast({
        title: "Email Improved!",
        description: "Your email has been professionally enhanced.",
      });
    } catch (error) {
      console.error("Email fix error:", error);

      // Handle usage limit errors
      if (error instanceof UsageLimitError) {
        onUpgradeClick?.();
        toast({
          title: "Usage Limit Reached",
          description:
            "You've reached your daily limit. Upgrade for unlimited access!",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Processing Failed",
        description:
          error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyToClipboard = () => {
    if (result?.improvedEmail) {
      navigator.clipboard.writeText(result.improvedEmail);
      toast({
        title: "Copied!",
        description: "Email copied to clipboard.",
      });
    }
  };

  const handleDownloadPDF = () => {
    toast({
      title: "Download Coming Soon",
      description: "PDF download will be available soon.",
    });
  };

  const resetForm = () => {
    setEmailDraft("");
    setPurpose("");
    setResult(null);
    setErrors({});
  };

  const handleEmailChange = (value: string) => {
    setEmailDraft(value);
    if (errors.email) {
      setErrors((prev) => ({ ...prev, email: undefined }));
    }
  };

  const handlePurposeChange = (value: string) => {
    setPurpose(value);
    if (errors.purpose) {
      setErrors((prev) => ({ ...prev, purpose: undefined }));
    }
  };

  const canProcess = !!(emailDraft.trim() && purpose) && !isProcessing;

  return (
    <div className={cn("space-y-6", className)}>
      {!result ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Email Input */}
          <Card className="p-6">
            <div className="flex items-center mb-4">
              <Mail className="w-5 h-5 text-primary mr-2" />
              <h3 className="text-lg font-semibold">Email Draft</h3>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="email-draft" className="text-sm font-medium">
                  Your Email Draft
                </Label>
                <Textarea
                  id="email-draft"
                  placeholder="Paste your email draft here..."
                  className={cn(
                    "min-h-[200px] mt-2 resize-none",
                    errors?.email &&
                      "border-destructive focus:border-destructive"
                  )}
                  value={emailDraft}
                  onChange={(e) => handleEmailChange(e.target.value)}
                />
                {errors?.email && (
                  <div className="flex items-center mt-2 text-sm text-destructive">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.email}
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="email-purpose" className="text-sm font-medium">
                  Email Purpose
                </Label>
                <Select value={purpose} onValueChange={handlePurposeChange}>
                  <SelectTrigger
                    className={cn(
                      "mt-2",
                      errors?.purpose &&
                        "border-destructive focus:border-destructive"
                    )}
                  >
                    <SelectValue placeholder="Select email purpose" />
                  </SelectTrigger>
                  <SelectContent>
                    {emailPurposes.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors?.purpose && (
                  <div className="flex items-center mt-2 text-sm text-destructive">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.purpose}
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Action Panel */}
          <Card className="p-6">
            <div className="flex items-center mb-4">
              <Sparkles className="w-5 h-5 text-primary mr-2" />
              <h3 className="text-lg font-semibold">AI Enhancement</h3>
            </div>

            <div className="space-y-4">
              <p className="text-muted-foreground text-sm">
                Our AI will analyze your email and improve its clarity, tone,
                and effectiveness based on the selected purpose.
              </p>

              <Button
                onClick={handleFixEmail}
                disabled={!canProcess}
                className="w-full bg-gradient-to-r from-primary to-primary-glow hover:shadow-lg transition-all duration-300"
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Improving Email...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Fix My Email
                  </>
                )}
              </Button>

              {emailDraft && purpose && (
                <div className="text-xs text-muted-foreground text-center">
                  Ready to enhance your{" "}
                  {emailPurposes
                    .find((p) => p.value === purpose)
                    ?.label.toLowerCase()}{" "}
                  email
                </div>
              )}
            </div>
          </Card>
        </div>
      ) : (
        /* Results Display */
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">Improved Email</h3>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCopyToClipboard}>
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </Button>
              <Button variant="outline" onClick={handleDownloadPDF}>
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
              <Button variant="outline" onClick={resetForm}>
                New Email
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Improved Email */}
            <Card className="p-6">
              <h4 className="font-semibold mb-3 text-green-700">
                Improved Version
              </h4>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <pre className="whitespace-pre-wrap text-sm font-mono">
                  {result.improvedEmail}
                </pre>
              </div>
            </Card>

            {/* Explanation & Improvements */}
            <div className="space-y-4">
              <Card className="p-6">
                <h4 className="font-semibold mb-3">What We Improved</h4>
                <ul className="space-y-2">
                  {result?.improvements?.map((improvement, index) => (
                    <li key={index} className="flex items-start">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0" />
                      <span className="text-sm">{improvement}</span>
                    </li>
                  ))}
                </ul>
              </Card>

              <Card className="p-6">
                <h4 className="font-semibold mb-3">Explanation</h4>
                <p className="text-sm text-muted-foreground">
                  {result.explanation}
                </p>
                <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <span className="text-sm font-medium text-blue-700">
                    Tone: {result.tone}
                  </span>
                </div>

                {/* Email Scores */}
                {(result.professionalismScore ||
                  result.clarityScore ||
                  result.effectivenessScore) && (
                  <div className="mt-4 space-y-3">
                    <h5 className="font-semibold text-sm">
                      Email Quality Scores:
                    </h5>
                    <div className="grid grid-cols-3 gap-3">
                      {result.professionalismScore && (
                        <div className="text-center p-2 bg-green-50 rounded border border-green-200">
                          <div className="text-lg font-bold text-green-700">
                            {result.professionalismScore}%
                          </div>
                          <div className="text-xs text-green-600">
                            Professional
                          </div>
                        </div>
                      )}
                      {result.clarityScore && (
                        <div className="text-center p-2 bg-blue-50 rounded border border-blue-200">
                          <div className="text-lg font-bold text-blue-700">
                            {result.clarityScore}%
                          </div>
                          <div className="text-xs text-blue-600">Clarity</div>
                        </div>
                      )}
                      {result.effectivenessScore && (
                        <div className="text-center p-2 bg-purple-50 rounded border border-purple-200">
                          <div className="text-lg font-bold text-purple-700">
                            {result.effectivenessScore}%
                          </div>
                          <div className="text-xs text-purple-600">
                            Effective
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
