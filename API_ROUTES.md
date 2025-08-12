# API Routes Documentation

## Base URL

- **Production**: `https://fixora-ai-be.vercel.app/api`
- **Local Development**: `http://localhost:3001/api` (fallback)

## HTTP Client

The application now uses **ky** as the HTTP client instead of native fetch. Ky provides:
- **Automatic retries** for failed requests (2 attempts)
- **Timeout handling** (60 seconds)
- **Better error handling** with hooks
- **Simpler API** with method chaining
- **Built-in JSON parsing**

## API Endpoints

### 1. Resume Upload

- **Route**: `POST /upload`
- **Purpose**: Upload and process resume files
- **Used by**: `ResumeUpload` component
- **Method**: `apiService.uploadResume()`
- **Implementation**: Uses ky with FormData, simulated progress for UX

### 2. Resume Analysis

- **Route**: `POST /analyze`
- **Purpose**: Analyze resume against job description
- **Used by**: `Index` page (main analysis)
- **Method**: `apiService.analyzeResume()`
- **Implementation**: Uses ky.post() with JSON payload

### 3. PDF Export

- **Route**: `POST /export-pdf`
- **Purpose**: Export analysis results as PDF
- **Used by**: `Index` page (export functionality)
- **Method**: `apiService.exportPDF()`
- **Implementation**: Uses ky.post() with JSON payload, returns Blob

### 4. Email Improvement

- **Route**: `POST /improve-email`
- **Purpose**: Improve email drafts using AI
- **Used by**: `EmailFixModule` component
- **Method**: `apiService.improveEmail()`
- **Implementation**: Uses ky.post() with JSON payload

### 5. Health Check

- **Route**: `GET /health`
- **Purpose**: Check backend service health
- **Used by**: Health monitoring (if implemented)
- **Method**: `apiService.healthCheck()`
- **Implementation**: Uses ky.get()

### 6. Usage Tracking

- **Route**: `GET /usage`
- **Purpose**: Get user usage statistics and upgrade info
- **Used by**: `UsageTracker` component
- **Method**: `apiService.getUsageStatus()`
- **Implementation**: Uses ky.get(), falls back to mock data on error

## Data Structures

### Analysis Result

```typescript
interface AnalysisResult {
  matchScore: number;
  missingKeywords: string[];
  suggestions: string[];
  rewriteExamples: Array<{
    original: string;
    improved: string;
  }>;
  overallFeedback: string;
  coverLetter?: string;
}
```

### Usage Status

```typescript
interface UsageStatus {
  used: number;
  limit: number;
  remaining: number;
}

interface UpgradeInfo {
  price: string;
  features: string[];
}
```

## Error Handling

- **429**: Usage limit exceeded (handled specially via ky hooks)
- **Network errors**: Automatic retry with exponential backoff
- **Timeout errors**: 60-second timeout with retry logic
- **Other errors**: Generic error handling with fallback to mock data for usage tracking

## Environment Configuration

- Set `VITE_SERVER_ROOT_URL` in `.env.local` for local development
- Production fallback is hardcoded in the API service
- Ky instance automatically uses the configured prefixUrl

## Ky Configuration

```typescript
const api = ky.create({
  prefixUrl: API_BASE_URL,
  timeout: 60000, // 60 second timeout
  retry: {
    limit: 2,
    methods: ['get', 'post', 'put', 'delete'],
    statusCodes: [408, 413, 429, 500, 502, 503, 504],
  },
  hooks: {
    beforeError: [/* custom error handling */]
  }
});
```
