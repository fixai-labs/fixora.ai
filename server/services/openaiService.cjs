const OpenAI = require("openai");

class OpenAIService {

  constructor() {
    console.log("OpenAI API Key present:", !!process.env.OPENAI_API_KEY);
    console.log(
      "OpenAI API Key length:",
      process.env.OPENAI_API_KEY?.length || 0
    );

    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY environment variable is required");
    }

    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async analyzeResume(request) {
    try {
      const prompt = this.buildResumePrompt(request);

      const completion = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content:
              "You are an expert resume analyst and career coach. Analyze resumes against job descriptions and provide detailed, actionable feedback.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error("No response from OpenAI");
      }

      return this.parseResumeResponse(response);
    } catch (error) {
      console.error("OpenAI API error:", error);
      throw new Error(
        `Failed to analyze resume: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async improveEmail(request) {
    try {
      const prompt = this.buildEmailPrompt(request);

      const completion = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content:
              "You are an expert professional communication coach. Improve emails to be clear, professional, and effective for their intended purpose.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1500,
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error("No response from OpenAI");
      }

      return this.parseEmailResponse(response);
    } catch (error) {
      console.error("OpenAI API error:", error);
      throw new Error(
        `Failed to improve email: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  buildResumePrompt(request) {
    const purposeContext =
      request.purpose === "before-applying"
        ? "The candidate is preparing to apply for this position and wants to optimize their resume."
        : "The candidate was rejected for this position and wants to understand how to improve their resume for similar roles.";

    return `
${purposeContext}

Please analyze the following resume against the job description and provide a comprehensive analysis in the following JSON format:

{
  "matchScore": <number between 0-100>,
  "missingKeywords": ["keyword1", "keyword2", ...],
  "suggestions": ["suggestion1", "suggestion2", ...],
  "rewriteExamples": [
    {
      "original": "original text from resume",
      "improved": "improved version"
    }
  ],
  "overallFeedback": "detailed overall assessment",
  "coverLetter": "professionally written cover letter tailored to this job",
  "atsScore": <number between 0-100>,
  "atsOptimizations": ["ats optimization1", "ats optimization2", ...]
}

**Job Description:**
${request.jobDescription}

**Resume Content:**
${request.resumeText}

**Analysis Requirements:**
1. Calculate a match score (0-100) based on how well the resume aligns with the job requirements
2. Identify 3-7 missing keywords or skills that are mentioned in the job description but not in the resume
3. Provide 4-6 specific, actionable suggestions for improvement
4. Give 2-3 concrete rewrite examples showing how to improve specific sections
5. Provide overall feedback that is constructive and specific
6. Generate a professional cover letter (200-300 words) tailored to this specific job and the candidate's background
7. Calculate an ATS (Applicant Tracking System) score (0-100) based on keyword density, formatting, and structure
8. Provide 3-5 specific ATS optimization recommendations

Please ensure your response is valid JSON and focuses on practical, actionable advice.`;
  }

  parseResumeResponse(response) {
    try {
      // Try to extract JSON from the response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON found in response");
      }

      const parsed = JSON.parse(jsonMatch[0]);

      // Validate the structure
      if (!this.isValidAnalysisResult(parsed)) {
        throw new Error("Invalid response structure");
      }

      return parsed;
    } catch (error) {
      console.error("Failed to parse OpenAI response:", error);
      console.error("Raw response:", response);

      // Return a fallback response
      return {
        matchScore: 50,
        missingKeywords: ["Unable to analyze - please try again"],
        suggestions: [
          "There was an error analyzing your resume. Please try uploading again.",
        ],
        rewriteExamples: [],
        overallFeedback:
          "We encountered an issue analyzing your resume. Please try again or contact support if the problem persists.",
      };
    }
  }

  isValidAnalysisResult(obj) {
    return (
      typeof obj === "object" &&
      typeof obj.matchScore === "number" &&
      Array.isArray(obj.missingKeywords) &&
      Array.isArray(obj.suggestions) &&
      Array.isArray(obj.rewriteExamples) &&
      typeof obj.overallFeedback === "string"
    );
  }

  buildEmailPrompt(request) {
    const purposeMap = {
      "job-followup": "following up on a job application",
      apology: "apologizing professionally",
      "client-pitch": "pitching to a potential client",
      "meeting-request": "requesting a meeting",
      "thank-you": "expressing gratitude",
      complaint: "addressing a concern or complaint",
      networking: "networking and building professional relationships",
      proposal: "presenting a business proposal",
      general: "general professional communication",
    };

    const purposeDescription =
      purposeMap[request.purpose] || "professional communication";

    return `
Please improve the following email for ${purposeDescription}. Provide your response in the following JSON format:

{
  "improvedEmail": "the improved email content",
  "explanation": "explanation of what was improved and why",
  "improvements": ["improvement1", "improvement2", ...],
  "tone": "description of the tone used",
  "professionalismScore": <number between 0-100>,
  "clarityScore": <number between 0-100>,
  "effectivenessScore": <number between 0-100>
}

**Original Email:**
${request.emailDraft}

**Improvement Requirements:**
1. Make the email clear, concise, and professional
2. Ensure the tone is appropriate for ${purposeDescription}
3. Improve structure and flow
4. Fix any grammar or spelling issues
5. Make the message more effective for its purpose
6. Add appropriate subject line if missing
7. Ensure proper email etiquette
8. Score the improved email on professionalism (0-100)
9. Score the improved email on clarity (0-100)
10. Score the improved email on effectiveness for its purpose (0-100)

Please provide specific improvements and explain your changes.`;
  }

  parseEmailResponse(response) {
    try {
      // Try to extract JSON from the response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON found in response");
      }

      const parsed = JSON.parse(jsonMatch[0]);

      // Validate the structure
      if (!this.isValidEmailResult(parsed)) {
        throw new Error("Invalid response structure");
      }

      return parsed;
    } catch (error) {
      console.error("Failed to parse email response:", error);
      console.error("Raw response:", response);

      // Return a fallback response
      return {
        improvedEmail:
          "We encountered an issue improving your email. Please try again.",
        explanation:
          "There was an error processing your email. Please try again or contact support.",
        improvements: ["Unable to process - please try again"],
        tone: "Professional",
      };
    }
  }

  isValidEmailResult(obj) {
    return (
      typeof obj === "object" &&
      typeof obj.improvedEmail === "string" &&
      typeof obj.explanation === "string" &&
      Array.isArray(obj.improvements) &&
      typeof obj.tone === "string" &&
      (obj.professionalismScore === undefined ||
        typeof obj.professionalismScore === "number") &&
      (obj.clarityScore === undefined ||
        typeof obj.clarityScore === "number") &&
      (obj.effectivenessScore === undefined ||
        typeof obj.effectivenessScore === "number")
    );
  }
}

module.exports = { OpenAIService };
