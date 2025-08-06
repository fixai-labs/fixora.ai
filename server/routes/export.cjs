const express = require('express');
const { PDFService } = require('../services/pdfService.cjs');

const router = express.Router();

// Export analysis results as PDF
router.post('/export-pdf', async (req, res) => {
  try {
    const { resumeFilename, analysisResult, jobDescription, purpose } = req.body;

    // Validate required fields
    if (!resumeFilename || !analysisResult || !jobDescription || !purpose) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'resumeFilename, analysisResult, jobDescription, and purpose are required'
      });
    }

    // Validate analysis result structure
    if (!analysisResult.matchScore || !analysisResult.missingKeywords || 
        !analysisResult.suggestions || !analysisResult.overallFeedback) {
      return res.status(400).json({
        error: 'Invalid analysis result',
        message: 'Analysis result must contain matchScore, missingKeywords, suggestions, and overallFeedback'
      });
    }

    const exportData = {
      resumeFilename,
      analysisResult,
      jobDescription,
      purpose
    };

    // Generate PDF
    const pdfBuffer = await PDFService.generatePDF(exportData);

    // Set response headers for PDF download
    const filename = `resume-analysis-${Date.now()}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    // Send PDF
    res.send(pdfBuffer);

  } catch (error) {
    console.error('PDF export error:', error);
    res.status(500).json({
      error: 'Export failed',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
});

module.exports = { exportRoute: router };
