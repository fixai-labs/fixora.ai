import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Download,
  Edit2,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FeedbackData {
  matchScore: number;
  missingKeywords: string[];
  suggestions: string[];
  rewriteExamples: { original: string; improved: string }[];
  overallFeedback: string;
  coverLetter?: string;
  atsScore?: number;
  atsOptimizations?: string[];
}

interface FeedbackDisplayProps {
  feedback: FeedbackData;
  onExportPDF: () => void;
}

export function FeedbackDisplay({
  feedback,
  onExportPDF,
}: FeedbackDisplayProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editedSuggestions, setEditedSuggestions] = useState(
    feedback.suggestions
  );

  const handleEditSuggestion = (index: number) => {
    setEditingIndex(index);
  };

  const handleSaveSuggestion = (index: number, newText: string) => {
    const newSuggestions = [...editedSuggestions];
    newSuggestions[index] = newText;
    setEditedSuggestions(newSuggestions);
    setEditingIndex(null);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-warning";
    return "text-destructive";
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return CheckCircle;
    if (score >= 60) return AlertCircle;
    return Target;
  };

  const ScoreIcon = getScoreIcon(feedback.matchScore);

  return (
    <div className="space-y-6">
      {/* Match Score */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">
            Resume Match Score
          </h3>
          <Button onClick={onExportPDF} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <ScoreIcon
              className={cn("w-8 h-8", getScoreColor(feedback.matchScore))}
            />
            <span
              className={cn(
                "text-3xl font-bold",
                getScoreColor(feedback.matchScore)
              )}
            >
              {feedback.matchScore}%
            </span>
          </div>
          <div className="flex-1">
            <Progress value={feedback.matchScore} className="h-3" />
          </div>
        </div>
      </Card>

      {/* ATS Score */}
      {feedback.atsScore !== undefined && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 text-foreground">
            ATS Optimization Score
          </h3>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <span className="text-3xl font-bold text-green-600">
                {feedback.atsScore}%
              </span>
            </div>
            <div className="flex-1">
              <Progress
                value={feedback.atsScore}
                className="h-3 [&>div]:bg-green-500"
              />
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-3">
            How well your resume will perform with Applicant Tracking Systems
          </p>

          {feedback.atsOptimizations &&
            feedback.atsOptimizations.length > 0 && (
              <div className="mt-4">
                <h4 className="font-semibold mb-2 text-sm">
                  ATS Optimizations:
                </h4>
                <ul className="space-y-1">
                  {feedback.atsOptimizations.map((optimization, index) => (
                    <li key={index} className="flex items-start">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">
                        {optimization}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
        </Card>
      )}

      {/* Missing Keywords */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-foreground">
          Missing Keywords
        </h3>
        <div className="flex flex-wrap gap-2">
          {feedback.missingKeywords.map((keyword, index) => (
            <Badge key={index} variant="destructive" className="text-sm">
              {keyword}
            </Badge>
          ))}
        </div>
      </Card>

      {/* Improvement Suggestions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-foreground">
          Improvement Suggestions
        </h3>
        <div className="space-y-4">
          {editedSuggestions.map((suggestion, index) => (
            <div key={index} className="p-4 bg-muted/30 rounded-lg">
              {editingIndex === index ? (
                <div className="space-y-2">
                  <Textarea
                    defaultValue={suggestion}
                    className="min-h-[80px]"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && e.ctrlKey) {
                        handleSaveSuggestion(index, e.currentTarget.value);
                      }
                    }}
                    id={`suggestion-${index}`}
                  />
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        const textarea = document.getElementById(
                          `suggestion-${index}`
                        ) as HTMLTextAreaElement;
                        handleSaveSuggestion(index, textarea.value);
                      }}
                    >
                      <Save className="w-3 h-3 mr-1" />
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditingIndex(null)}
                    >
                      <X className="w-3 h-3 mr-1" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-start">
                  <p className="text-foreground flex-1">{suggestion}</p>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEditSuggestion(index)}
                    className="ml-2"
                  >
                    <Edit2 className="w-3 h-3" />
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Rewrite Examples */}
      {feedback.rewriteExamples.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 text-foreground">
            Rewrite Examples
          </h3>
          <div className="space-y-4">
            {feedback.rewriteExamples.map((example, index) => (
              <div
                key={index}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                <div className="p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
                  <h4 className="font-medium text-destructive mb-2">
                    Original
                  </h4>
                  <p className="text-sm text-foreground">{example.original}</p>
                </div>
                <div className="p-4 bg-success/5 border border-success/20 rounded-lg">
                  <h4 className="font-medium text-success mb-2">Improved</h4>
                  <p className="text-sm text-foreground">{example.improved}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Cover Letter */}
      {feedback.coverLetter && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">
              Generated Cover Letter
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(feedback.coverLetter || "");
                // You could add a toast notification here
              }}
            >
              Copy
            </Button>
          </div>
          <div className="bg-muted/30 p-4 rounded-lg border">
            <pre className="whitespace-pre-wrap text-sm font-mono text-foreground">
              {feedback.coverLetter}
            </pre>
          </div>
        </Card>
      )}

      {/* Overall Feedback */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-foreground">
          Overall Feedback
        </h3>
        <p className="text-foreground leading-relaxed">
          {feedback.overallFeedback}
        </p>
      </Card>
    </div>
  );
}
