@echo off
echo ========================================
echo Starting RASA Chatbot System
echo ========================================
echo.
echo This will open 4 terminals:
echo 1. RASA Server (port 5005)
echo 2. Actions Server (port 5055)
echo 3. Backend Server (port 5000)
echo 4. Frontend (port 3000)
echo.
echo Press any key to continue...
pause >nul

echo.
echo [1/4] Starting RASA Server...
start "RASA Server" cmd /k "cd /d %~dp0chatbot && venv\Scripts\activate && rasa run --enable-api --cors * --port 5005"

timeout /t 5 >nul

echo [2/4] Starting Actions Server...
start "Actions Server" cmd /k "cd /d %~dp0chatbot && venv\Scripts\activate && rasa run actions --port 5055"

timeout /t 3 >nul

echo [3/4] Starting Backend Server...
start "Backend Server" cmd /k "cd /d %~dp0server && npm run dev"

timeout /t 3 >nul

echo [4/4] Starting Frontend...
start "Frontend" cmd /k "cd /d %~dp0client && npm run dev"

echo.
echo ========================================
echo All services are starting!
echo ========================================
echo.
echo Wait 30 seconds then open: http://localhost:3000
echo.
echo To stop all services: Close all terminal windows
echo.
pause
