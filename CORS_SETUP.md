# CORS Configuration Guide

## 🚨 CORS Error Resolution

The `Access-Control-Allow-Origin` header error occurs because your backend server doesn't allow requests from your frontend domain. This guide shows you how to fix it.

## 🔧 Frontend Configuration (Already Done)

✅ **Vite Dev Server**: CORS enabled for local development
✅ **API Service**: Ky configured with CORS headers
✅ **Environment Variables**: Properly configured

## 🖥️ Backend CORS Configuration

### **Express.js Backend**

1. **Install CORS middleware:**
   ```bash
   npm install cors
   ```

2. **Configure CORS in your main server file:**
   ```javascript
   const express = require('express');
   const cors = require('cors');
   const app = express();

   // CORS configuration
   app.use(cors({
     origin: [
       'http://localhost:8080',
       'http://localhost:8081',
       'http://localhost:3000',
       'https://fixora-ai.vercel.app'
     ],
     credentials: true,
     methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
     allowedHeaders: ['Content-Type', 'Authorization', 'Origin']
   }));

   // Your routes here
   app.use('/api', apiRoutes);
   ```

### **Next.js API Routes**

1. **Create a CORS utility function:**
   ```typescript
   // utils/cors.ts
   import { NextApiRequest, NextApiResponse } from 'next';

   export function enableCors(req: NextApiRequest, res: NextApiResponse) {
     res.setHeader('Access-Control-Allow-Origin', 'https://fixora-ai.vercel.app');
     res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
     res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
     res.setHeader('Access-Control-Allow-Credentials', 'true');
   }
   ```

2. **Use in each API route:**
   ```typescript
   // pages/api/upload.ts
   import { enableCors } from '../../utils/cors';

   export default function handler(req: NextApiRequest, res: NextApiResponse) {
     enableCors(req, res);
     
     if (req.method === 'OPTIONS') {
       res.status(200).end();
       return;
     }
     
     // Your API logic here
   }
   ```

### **FastAPI (Python)**

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8080",
        "http://localhost:8081",
        "http://localhost:3000",
        "https://fixora-ai.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### **Django (Python)**

```python
# settings.py
CORS_ALLOWED_ORIGINS = [
    "http://localhost:8080",
    "http://localhost:8081",
    "http://localhost:3000",
    "https://fixora-ai.vercel.app",
]

CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]
```

## 🌐 Production CORS Configuration

### **Vercel (Frontend)**
- Frontend automatically deployed with proper CORS headers
- No additional configuration needed

### **Backend Hosting Platforms**

#### **Heroku**
```javascript
// Same as Express.js configuration above
```

#### **Railway**
```javascript
// Same as Express.js configuration above
```

#### **DigitalOcean App Platform**
```javascript
// Same as Express.js configuration above
```

#### **AWS Lambda + API Gateway**
```javascript
// API Gateway handles CORS automatically
// Configure in API Gateway console
```

## 🧪 Testing CORS Configuration

### **1. Check CORS Headers**
```bash
# Test with curl
curl -H "Origin: https://fixora-ai.vercel.app" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     https://your-backend-url.com/api/health
```

### **2. Browser Developer Tools**
1. Open Developer Tools (F12)
2. Go to Network tab
3. Make a request to your backend
4. Check if CORS headers are present in response

### **3. CORS Test Tool**
- Use online CORS testers
- Test from your production domain

## 🚀 Quick Fix Checklist

- [ ] **Backend CORS middleware installed and configured**
- [ ] **Allowed origins include your frontend domains**
- [ ] **Credentials enabled if needed**
- [ **Methods and headers properly configured**
- [ ] **Backend server restarted after changes**
- [ ] **Tested with actual frontend requests**

## 🔍 Common CORS Issues

### **Issue: "No 'Access-Control-Allow-Origin' header"**
**Solution**: Add CORS middleware to your backend

### **Issue: "Credentials not supported"**
**Solution**: Set `credentials: true` in CORS config

### **Issue: "Method not allowed"**
**Solution**: Add all required HTTP methods to allowed methods

### **Issue: "Headers not allowed"**
**Solution**: Add required headers to allowed headers list

## 📚 Additional Resources

- [MDN CORS Documentation](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [Express CORS Middleware](https://github.com/expressjs/cors)
- [Next.js API Routes CORS](https://nextjs.org/docs/api-routes/api-middlewares)
- [FastAPI CORS](https://fastapi.tiangolo.com/tutorial/cors/)

## ⚠️ Security Notes

- **Never use `origin: "*"` in production**
- **Only allow necessary origins**
- **Consider using environment variables for origins**
- **Regularly review and update allowed origins**
