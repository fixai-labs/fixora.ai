# RealFix AI Resume Analyzer - Setup Guide

## Prerequisites

1. **Node.js and Bun**: Make sure you have Node.js (v18+) and Bun installed
2. **OpenAI API Key**: You'll need an OpenAI API key to use the AI analysis features

## Installation

1. **Install Dependencies**:
   ```bash
   bun install
   ```

2. **Environment Configuration**:
   - Copy `.env.example` to `.env`
   - Add your OpenAI API key to the `.env` file:
     ```
     OPENAI_API_KEY=your_openai_api_key_here
     ```

## Running the Application

### Development Mode (Recommended)

Run both frontend and backend simultaneously:
```bash
bun run dev
```

This will start:
- Frontend (React/Vite) on `http://localhost:5173`
- Backend (Express) on `http://localhost:3001`

### Individual Services

**Frontend Only**:
```bash
bun run dev:client
```

**Backend Only**:
```bash
bun run dev:server
```

## Testing the Application

### 1. Health Check
First, verify the backend is running:
```bash
curl http://localhost:3001/api/health
```

Expected response:
```json
{"status":"OK","message":"Server is running"}
```

### 2. File Upload Test
Test file upload with a sample resume (PDF, DOCX, or TXT):
```bash
curl -X POST -F "resume=@path/to/your/resume.pdf" http://localhost:3001/api/upload
```

### 3. Full Integration Test
1. Open `http://localhost:5173` in your browser
2. Upload a resume file (PDF, DOCX, or TXT)
3. Paste a job description
4. Select analysis purpose (Before Applying or After Rejection)
5. Click "Analyze Resume"
6. Review the AI-generated feedback
7. Test PDF export functionality

## API Endpoints

- `GET /api/health` - Health check
- `POST /api/upload` - Upload and process resume file
- `POST /api/analyze` - Analyze resume against job description
- `POST /api/export-pdf` - Export analysis results as PDF

## Troubleshooting

### Common Issues

1. **OpenAI API Errors**:
   - Verify your API key is correct
   - Check your OpenAI account has sufficient credits
   - Ensure the API key has proper permissions

2. **File Upload Issues**:
   - Supported formats: PDF, DOC, DOCX, TXT
   - Maximum file size: 10MB
   - Check file permissions

3. **PDF Export Issues**:
   - Puppeteer requires additional system dependencies on some platforms
   - On Linux: `sudo apt-get install -y libgbm-dev`
   - On Windows: Usually works out of the box

4. **CORS Issues**:
   - Frontend and backend must be running on expected ports
   - Check CORS configuration in `server/index.ts`

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Backend server port | 3001 |
| `CLIENT_URL` | Frontend URL for CORS | http://localhost:5173 |
| `OPENAI_API_KEY` | OpenAI API key | Required |
| `VITE_API_URL` | Backend API URL (frontend) | http://localhost:3001/api |

## Project Structure

```
├── src/                    # Frontend React application
│   ├── components/         # React components
│   ├── services/          # API service layer
│   └── pages/             # Page components
├── server/                # Backend Express application
│   ├── routes/            # API route handlers
│   ├── services/          # Business logic services
│   └── utils/             # Utility functions
├── package.json           # Dependencies and scripts
└── .env                   # Environment variables
```

## Features

- ✅ File upload and processing (PDF, DOCX, TXT)
- ✅ AI-powered resume analysis using GPT-4
- ✅ Match score calculation
- ✅ Missing keywords identification
- ✅ Improvement suggestions
- ✅ Rewrite examples
- ✅ PDF export of analysis results
- ✅ Responsive UI with modern design
- ✅ Error handling and validation

## Next Steps

1. Add your OpenAI API key to `.env`
2. Run `bun run dev` to start the application
3. Test with your own resume and job descriptions
4. Customize the AI prompts in `server/services/openaiService.ts` if needed
