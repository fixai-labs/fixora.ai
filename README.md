# Fixora.ai

AI-powered assistant to fix and improve emails, resumes, and proposals with clarity and precision.

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+
- **npm** 9+

### Installation

1. **Clone the repository:**

   ```bash
   git clone <your-repo-url>
   cd fixora.ai
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up environment variables:**

   ```bash
   # Create .env.local file
   echo "VITE_SERVER_ROOT_URL=http://localhost:3001/api" > .env.local
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

The application will be available at:

- **Frontend**: http://localhost:8080 (or 8081 if 8080 is busy)
- **Backend**: http://localhost:3001 (needs to be running separately)

## ⚙️ Configuration

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# Frontend Configuration
VITE_SERVER_ROOT_URL=http://localhost:3001/api

# For production, this will automatically use:
# https://fixora-ai-be.vercel.app/api
```

### Backend Configuration

The backend needs to be configured separately with:

- CORS enabled for your frontend domain
- The API endpoints listed below

## 🎯 Features

### Core Functionality

- ✅ **Resume Analysis**: AI-powered resume analysis against job descriptions
- ✅ **Email Improvement**: Enhance email drafts for various purposes
- ✅ **File Upload**: Support for PDF, DOCX, and TXT files
- ✅ **Match Score**: Calculate compatibility with job descriptions
- ✅ **Keyword Analysis**: Identify missing keywords and suggestions
- ✅ **Improvement Suggestions**: Get actionable feedback and rewrite examples
- ✅ **PDF Export**: Export analysis results as downloadable PDFs
- ✅ **Usage Tracking**: Monitor daily usage limits and upgrade options

### User Experience

- ✅ **Modern UI**: Responsive design with Tailwind CSS and shadcn/ui
- ✅ **Progress Tracking**: Upload progress indicators and loading states
- ✅ **Error Handling**: Graceful fallbacks and user-friendly error messages
- ✅ **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🏗️ Architecture

### Frontend Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite 5
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui + Radix UI
- **HTTP Client**: Ky (with automatic retries and error handling)
- **State Management**: React hooks + Context
- **Routing**: React Router v6

### Backend Requirements

- **API Endpoints**: 6 REST endpoints (see API documentation)
- **CORS**: Must allow requests from your frontend domain
- **File Processing**: PDF, DOCX, and TXT parsing capabilities
- **AI Integration**: OpenAI GPT-4 or similar AI service

## 📡 API Endpoints

The application expects the following backend endpoints:

| Method | Endpoint             | Purpose            | Used By                |
| ------ | -------------------- | ------------------ | ---------------------- |
| `POST` | `/api/upload`        | Resume file upload | ResumeUpload component |
| `POST` | `/api/analyze`       | Resume analysis    | Main analysis flow     |
| `POST` | `/api/export-pdf`    | PDF export         | Export functionality   |
| `POST` | `/api/improve-email` | Email improvement  | EmailFixModule         |
| `GET`  | `/api/health`        | Health check       | Monitoring             |
| `GET`  | `/api/usage`         | Usage tracking     | UsageTracker           |

### Data Structures

All endpoints return standardized responses with `success` boolean and `data` payload. See `API_ROUTES.md` for detailed specifications.

## 🔧 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # shadcn/ui components
│   ├── ResumeUpload.tsx
│   ├── JobDescriptionForm.tsx
│   ├── FeedbackDisplay.tsx
│   ├── EmailFixModule.tsx
│   ├── UsageTracker.tsx
│   └── PricingModal.tsx
├── pages/              # Page components
│   ├── Index.tsx       # Main application page
│   └── NotFound.tsx    # 404 page
├── services/           # API services
│   └── api.ts          # Ky-based HTTP client
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
└── App.tsx             # Main application component
```

### HTTP Client (Ky)

The application uses **Ky** for all HTTP requests, providing:

- **Automatic retries** (2 attempts with exponential backoff)
- **Timeout handling** (60 seconds)
- **Better error handling** with custom hooks
- **Simpler API** with method chaining
- **Built-in JSON parsing** and type safety

## 🚀 Deployment

### Frontend (Vercel)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Backend Requirements

1. Implement the 6 API endpoints listed above
2. Enable CORS for your frontend domain
3. Set up file processing and AI integration
4. Deploy to your preferred hosting platform

## 📊 Current Status

### ✅ Completed

- **Frontend Application**: Fully functional React app with TypeScript
- **UI Components**: Complete set of reusable components using shadcn/ui
- **API Service**: Ky-based HTTP client with error handling and retries
- **File Upload**: Resume file processing with progress tracking
- **Usage Tracking**: Mock data fallback when backend is unavailable
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Responsive Design**: Mobile-first design that works on all devices

### 🔄 In Progress

- **Backend Development**: API endpoints need to be implemented
- **AI Integration**: OpenAI GPT-4 integration for analysis
- **File Processing**: PDF, DOCX, and TXT parsing on backend

### 📋 Next Steps

1. **Backend Development**: Implement the 6 API endpoints
2. **CORS Configuration**: Enable cross-origin requests
3. **AI Service**: Integrate with OpenAI or similar AI provider
4. **File Processing**: Set up document parsing capabilities
5. **Testing**: End-to-end testing of the complete system
6. **Production Deployment**: Deploy both frontend and backend

## 📚 Documentation

- **API Routes**: See `API_ROUTES.md` for detailed endpoint specifications
- **Component Usage**: Each component has TypeScript interfaces and props
- **Error Handling**: Comprehensive error handling with user-friendly fallbacks

## 🔧 Troubleshooting

### Common Issues

#### Environment Variables Not Loading

```bash
# Make sure .env.local exists and has correct format
echo "VITE_SERVER_ROOT_URL=http://localhost:3001/api" > .env.local

# Restart the dev server after changing environment variables
npm run dev
```

#### CORS Errors

- Ensure your backend has CORS enabled for your frontend domain
- For local development: `http://localhost:8080` or `http://localhost:8081`
- For production: `https://fixora-ai.vercel.app`

#### API Endpoints Not Found (404)

- The frontend gracefully falls back to mock data for missing endpoints
- Implement the required backend endpoints (see API documentation)
- Check that your backend is running and accessible

#### Build Errors

```bash
# Clear dependencies and reinstall
rm -rf node_modules package-lock.json
npm install

# Check TypeScript errors
npm run build
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
