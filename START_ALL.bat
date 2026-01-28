@echo off
REM ===================================
REM QUICK START - FULL RASA CHATBOT
REM ===================================
REM Script nhanh để khởi động toàn bộ hệ thống
REM ===================================

echo ============================================
echo   KLTN Travel Chatbot - Quick Start
echo ============================================
echo.

REM Check if model exists
if not exist "chatbot\models\travel_chatbot.tar.gz" (
    echo ============================================
    echo   FIRST TIME SETUP
    echo ============================================
    echo.
    echo Model chua duoc train! Dang train model...
    echo Thoi gian uoc tinh: 5-15 phut
    echo.
    
    cd chatbot
    call train.bat
    cd ..
    
    if %ERRORLEVEL% NEQ 0 (
        echo.
        echo Training that bai! Vui long kiem tra loi.
        pause
        exit /b 1
    )
)

echo.
echo ============================================
echo   KHOI DONG CAC SERVERS
echo ============================================
echo.
echo Se mo 3 cua so terminal:
echo   1. RASA Server (Port 5005)
echo   2. Actions Server (Port 5055)
echo   3. Backend Server (Port 5000)
echo.
echo Frontend: Ban tu chay "npm run dev" trong folder client
echo.

REM Start RASA Server
echo [1/3] Starting RASA Server...
start "RASA Server" cmd /k "cd chatbot && venv\Scripts\activate && rasa run --model models\travel_chatbot.tar.gz --enable-api --cors * --port 5005"

timeout /t 5 /nobreak >nul

REM Start Actions Server
echo [2/3] Starting Actions Server...
start "Actions Server" cmd /k "cd chatbot && venv\Scripts\activate && rasa run actions --port 5055"

timeout /t 3 /nobreak >nul

REM Start Backend Server
echo [3/3] Starting Backend Server...
start "Backend Server" cmd /k "cd server && npm run dev"

timeout /t 3 /nobreak >nul

echo.
echo ============================================
echo   SERVERS DANG CHAY!
echo ============================================
echo.
echo RASA Server:    http://localhost:5005
echo Actions Server: http://localhost:5055
echo Backend API:    http://localhost:5000
echo.
echo BUOC TIEP THEO:
echo   1. Mo terminal moi
echo   2. cd client
echo   3. npm run dev
echo   4. Mo browser: http://localhost:3000
echo.
echo De dung servers: Dong cac cua so terminal
echo.

pause
