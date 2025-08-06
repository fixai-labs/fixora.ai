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
import { Sparkles, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface JobDescriptionFormProps {
  jobDescription: string;
  onJobDescriptionChange: (value: string) => void;
  purpose: string;
  onPurposeChange: (value: string) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  canAnalyze: boolean;
  errors?: {
    jobDescription?: string;
    purpose?: string;
  };
}

export function JobDescriptionForm({
  jobDescription,
  onJobDescriptionChange,
  purpose,
  onPurposeChange,
  onAnalyze,
  isAnalyzing,
  canAnalyze,
  errors,
}: JobDescriptionFormProps) {
  console.log("isAnalyzing", isAnalyzing);

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4 text-foreground">
        Job Details
      </h3>

      <div className="space-y-4">
        <div>
          <Label
            htmlFor="job-description"
            className="text-sm font-medium text-foreground"
          >
            Job Description
          </Label>
          <Textarea
            id="job-description"
            placeholder="Paste the job description here..."
            className={cn(
              "min-h-[120px] mt-2 resize-none",
              errors?.jobDescription &&
                "border-destructive focus:border-destructive"
            )}
            value={jobDescription}
            onChange={(e) => onJobDescriptionChange(e.target.value)}
          />
          {errors?.jobDescription && (
            <div className="flex items-center mt-2 text-sm text-destructive">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.jobDescription}
            </div>
          )}
        </div>

        <div>
          <Label
            htmlFor="purpose"
            className="text-sm font-medium text-foreground"
          >
            Analysis Purpose
          </Label>
          <Select value={purpose} onValueChange={onPurposeChange}>
            <SelectTrigger
              className={cn(
                "mt-2",
                errors?.purpose && "border-destructive focus:border-destructive"
              )}
            >
              <SelectValue placeholder="Select purpose" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="before-applying">Before Applying</SelectItem>
              <SelectItem value="after-rejection">After Rejection</SelectItem>
            </SelectContent>
          </Select>
          {errors?.purpose && (
            <div className="flex items-center mt-2 text-sm text-destructive">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.purpose}
            </div>
          )}
        </div>

        <Button
          onClick={onAnalyze}
          disabled={!canAnalyze || isAnalyzing}
          className="w-full bg-gradient-to-r from-primary to-primary-glow hover:shadow-lg transition-all duration-300"
          size="lg"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analyzing Resume...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Analyze Resume
            </>
          )}
        </Button>
      </div>
    </Card>
  );
}
