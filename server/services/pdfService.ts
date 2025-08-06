import puppeteer from 'puppeteer';
import { AnalysisResult } from './openaiService';

export interface PDFExportData {
  resumeFilename: string;
  analysisResult: AnalysisResult;
  jobDescription: string;
  purpose: string;
}

export class PDFService {
  private static generateHTML(data: PDFExportData): string {
    const { resumeFilename, analysisResult, jobDescription, purpose } = data;
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Resume Analysis Report</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #3b82f6;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .header h1 {
            color: #3b82f6;
            margin: 0;
            font-size: 2.5em;
        }
        .header p {
            color: #666;
            margin: 10px 0 0 0;
        }
        .section {
            margin-bottom: 30px;
            padding: 20px;
            border-radius: 8px;
            background: #f8fafc;
            border-left: 4px solid #3b82f6;
        }
        .section h2 {
            color: #1e40af;
            margin-top: 0;
            font-size: 1.5em;
        }
        .score-section {
            text-align: center;
            background: linear-gradient(135deg, #3b82f6, #1d4ed8);
            color: white;
            border-left: none;
        }
        .score {
            font-size: 3em;
            font-weight: bold;
            margin: 10px 0;
        }
        .keywords {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-top: 10px;
        }
        .keyword {
            background: #ef4444;
            color: white;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.9em;
        }
        .suggestions {
            list-style: none;
            padding: 0;
        }
        .suggestions li {
            background: white;
            margin: 10px 0;
            padding: 15px;
            border-radius: 6px;
            border-left: 3px solid #10b981;
        }
        .rewrite-example {
            margin: 20px 0;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .original, .improved {
            padding: 15px;
        }
        .original {
            background: #fef2f2;
            border-left: 4px solid #ef4444;
        }
        .improved {
            background: #f0fdf4;
            border-left: 4px solid #10b981;
        }
        .original h4, .improved h4 {
            margin: 0 0 10px 0;
            font-size: 1em;
        }
        .original h4 {
            color: #dc2626;
        }
        .improved h4 {
            color: #059669;
        }
        .meta-info {
            background: #f1f5f9;
            padding: 15px;
            border-radius: 6px;
            margin-bottom: 20px;
            font-size: 0.9em;
            color: #64748b;
        }
        .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
            color: #64748b;
            font-size: 0.9em;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Resume Analysis Report</h1>
        <p>AI-Powered Resume Optimization</p>
    </div>

    <div class="meta-info">
        <strong>Resume File:</strong> ${resumeFilename}<br>
        <strong>Analysis Purpose:</strong> ${purpose === 'before-applying' ? 'Before Applying' : 'After Rejection'}<br>
        <strong>Generated:</strong> ${new Date().toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}
    </div>

    <div class="section score-section">
        <h2>Match Score</h2>
        <div class="score">${analysisResult.matchScore}%</div>
        <p>Resume alignment with job requirements</p>
    </div>

    <div class="section">
        <h2>Missing Keywords</h2>
        <p>These important keywords from the job description are missing from your resume:</p>
        <div class="keywords">
            ${analysisResult.missingKeywords.map(keyword => 
              `<span class="keyword">${keyword}</span>`
            ).join('')}
        </div>
    </div>

    <div class="section">
        <h2>Improvement Suggestions</h2>
        <ul class="suggestions">
            ${analysisResult.suggestions.map(suggestion => 
              `<li>${suggestion}</li>`
            ).join('')}
        </ul>
    </div>

    ${analysisResult.rewriteExamples.length > 0 ? `
    <div class="section">
        <h2>Rewrite Examples</h2>
        ${analysisResult.rewriteExamples.map(example => `
        <div class="rewrite-example">
            <div class="original">
                <h4>Original</h4>
                <p>${example.original}</p>
            </div>
            <div class="improved">
                <h4>Improved</h4>
                <p>${example.improved}</p>
            </div>
        </div>
        `).join('')}
    </div>
    ` : ''}

    <div class="section">
        <h2>Overall Feedback</h2>
        <p>${analysisResult.overallFeedback}</p>
    </div>

    <div class="section">
        <h2>Job Description Reference</h2>
        <p style="font-size: 0.9em; color: #666; white-space: pre-wrap;">${jobDescription}</p>
    </div>

    <div class="footer">
        <p>Generated by RealFix AI - Resume Analysis Tool</p>
    </div>
</body>
</html>`;
  }

  static async generatePDF(data: PDFExportData): Promise<Buffer> {
    let browser;
    
    try {
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      const page = await browser.newPage();
      const html = this.generateHTML(data);
      
      await page.setContent(html, { waitUntil: 'networkidle0' });
      
      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20px',
          right: '20px',
          bottom: '20px',
          left: '20px'
        }
      });
      
      return pdf;
    } catch (error) {
      console.error('PDF generation error:', error);
      throw new Error('Failed to generate PDF report');
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }
}
