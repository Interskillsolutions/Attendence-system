@echo off
REM Attendence System - Startup Script
REM This script starts both backend and frontend servers

echo Starting Attendance System...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo Error: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Start Backend Server
echo Starting Backend Server...
start cmd /k "cd backend && node index.js"
timeout /t 2 /nobreak

REM Start Frontend Server
echo Starting Frontend Server...
start cmd /k "cd frontend && npm run dev"
timeout /t 3 /nobreak

REM Open Browser (optional - uncomment if you want automatic browser open)
start http://localhost:5173

echo.
echo ============================================
echo Attendance System is starting...
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:5173
echo ============================================
echo.
pause
