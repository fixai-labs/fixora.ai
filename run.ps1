Write-Host "Starting Fixora.ai Development Server..." -ForegroundColor Green
Write-Host ""
Write-Host "Backend will run on: http://localhost:3001" -ForegroundColor Cyan
Write-Host "Frontend will run on: http://localhost:5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop both servers" -ForegroundColor Yellow
Write-Host ""

# Set execution policy for this session only
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force

# Run the development servers
npm run dev
