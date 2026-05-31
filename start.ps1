# Start server and client (local dev, no Docker for code execution)
Write-Host "Installing dependencies..."
npm run install:all

Write-Host "Starting server (port 4000) and client (port 3000)..."
npm run dev
