@echo off
echo ========================================
echo Starting RASA Chatbot System
echo ========================================
echo.
echo This will open 2 terminals:
echo 1. RASA Server (port 5005)
echo 2. Actions Server (port 5055)
echo.
echo Press any key to continue...
pause >nul

echo.
echo [1/2] Starting RASA Server...
start "RASA Server" cmd /k "cd /d %~dp0chatbot && venv\Scripts\activate && rasa run --enable-api --cors * --port 5005"

timeout /t 5 >nul

echo [2/2] Starting Actions Server...
start "Actions Server" cmd /k "cd /d %~dp0chatbot && venv\Scripts\activate && rasa run actions --port 5055"

echo.
echo ========================================
echo RASA Chatbot is starting!
echo ========================================
echo.
echo RASA API: http://localhost:5005
echo Actions:  http://localhost:5055
echo.
echo To stop: Close all terminal windows
echo.
pause
