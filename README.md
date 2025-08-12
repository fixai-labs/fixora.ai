# Fixora.ai

AI-powered assistant to fix and improve emails, resumes, and proposals with clarity and precision.

## Quick Start

### Single Command Setup

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Run the application:**

   ```bash
   npm start
   ```

   Or use the convenient scripts:

   ```bash
   # Windows Batch
   run.bat

   # PowerShell
   .\run.ps1
   ```

This will start both the frontend and backend servers:

- **Frontend (React/Vite)**: http://localhost:5173
- **Backend (Express/Node.js)**: http://localhost:3001

## Configuration

The application uses `.env.local` for environment variables:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# File Upload Configuration
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain

# Frontend Configuration
VITE_API_URL=http://localhost:3001/api
```

## Features

- ✅ **Resume Analysis**: AI-powered resume analysis using GPT-4
- ✅ **Email Improvement**: Enhance email content for various purposes
- ✅ **File Upload**: Support for PDF, DOCX, and TXT files
- ✅ **Match Score**: Calculate compatibility with job descriptions
- ✅ **Keyword Analysis**: Identify missing keywords
- ✅ **Improvement Suggestions**: Get actionable feedback
- ✅ **PDF Export**: Export analysis results
- ✅ **Modern UI**: Responsive design with Tailwind CSS

## Architecture

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express (CommonJS)
- **AI**: OpenAI GPT-4 API
- **File Processing**: Mammoth (DOCX), PDF2Pic (PDF)
- **UI Components**: Radix UI + shadcn/ui
