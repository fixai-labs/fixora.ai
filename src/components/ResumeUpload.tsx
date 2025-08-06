import { useState } from "react";
import { Upload, FileText, X, AlertCircle, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface ResumeUploadProps {
  onFileSelect: (file: File | null) => void;
  selectedFile: File | null;
  error?: string;
  isUploading?: boolean;
  uploadProgress?: number;
}

export function ResumeUpload({
  onFileSelect,
  selectedFile,
  error,
  isUploading,
  uploadProgress = 0,
}: ResumeUploadProps) {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (isValidFileType(file)) {
        onFileSelect(file);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (isValidFileType(file)) {
        onFileSelect(file);
      }
    }
  };

  const isValidFileType = (file: File) => {
    const validTypes = [
      // 'application/pdf', // Temporarily disabled
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];
    return validTypes.includes(file.type);
  };

  const removeFile = () => {
    onFileSelect(null);
  };

  console.log("uploadProgress", uploadProgress);
  console.log("isUploading", isUploading);

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4 text-foreground">
        Upload Resume
      </h3>

      {selectedFile && !isUploading ? (
        <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg border border-primary/20">
          <div className="flex items-center space-x-3">
            <FileText className="w-8 h-8 text-primary" />
            <div>
              <p className="font-medium text-foreground">{selectedFile.name}</p>
              <p className="text-sm text-muted-foreground">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={removeFile}
            className="text-muted-foreground hover:text-destructive"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <div>
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
              dragActive
                ? "border-primary bg-primary/5"
                : error
                ? "border-destructive bg-destructive/5"
                : "border-border hover:border-primary/50 hover:bg-muted/30",
              !isUploading && "cursor-pointer"
            )}
            onDragEnter={!isUploading ? handleDrag : undefined}
            onDragLeave={!isUploading ? handleDrag : undefined}
            onDragOver={!isUploading ? handleDrag : undefined}
            onDrop={!isUploading ? handleDrop : undefined}
            onClick={
              !isUploading
                ? () => document.getElementById("resume-upload")?.click()
                : undefined
            }
          >
            {isUploading ? (
              <div className="w-full max-w-sm mx-auto">
                <Loader2 className="w-12 h-12 text-primary mx-auto mb-4 animate-spin" />
                <h4 className="text-lg font-medium mb-2 text-foreground">
                  Processing your resume...
                </h4>
                <p className="text-muted-foreground mb-4">
                  Please wait while we extract the text
                </p>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <Progress value={uploadProgress} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>
                      {uploadProgress < 20
                        ? "Uploading file..."
                        : uploadProgress < 50
                        ? "Uploading..."
                        : uploadProgress < 95
                        ? "Processing file..."
                        : uploadProgress < 100
                        ? "Extracting text..."
                        : "Complete!"}
                    </span>
                    <span>{Math.round(uploadProgress)}%</span>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <Upload
                  className={cn(
                    "w-12 h-12 mx-auto mb-4",
                    error ? "text-destructive" : "text-muted-foreground"
                  )}
                />
                <h4 className="text-lg font-medium mb-2 text-foreground">
                  Drop your resume here
                </h4>
                <p className="text-muted-foreground mb-4">
                  or click to browse files
                </p>
                <p className="text-sm text-muted-foreground">
                  Supports DOCX and TXT files
                </p>
              </>
            )}

            <input
              id="resume-upload"
              type="file"
              className="hidden"
              accept=".doc,.docx,.txt"
              onChange={handleFileChange}
              disabled={isUploading}
            />
          </div>

          {error && (
            <div className="flex items-center mt-3 text-sm text-destructive">
              <AlertCircle className="w-4 h-4 mr-1" />
              {error}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
