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

set "CHATBOT_DIR=%~dp0chatbot"
set "VENV_DIR=venv310"

if not exist "%CHATBOT_DIR%\%VENV_DIR%\Scripts\python.exe" (
	echo.
	echo [setup] Creating Python 3.10 venv in %VENV_DIR%...
	py -3.10 -m venv "%CHATBOT_DIR%\%VENV_DIR%"
	if errorlevel 1 (
		echo [error] Python 3.10 not found. Please install it and try again.
		pause
		exit /b 1
	)
	call "%CHATBOT_DIR%\%VENV_DIR%\Scripts\activate"
	pip install -r "%CHATBOT_DIR%\requirements.txt"
	if errorlevel 1 (
		echo [error] pip install failed. Please check your internet or pip setup.
		pause
		exit /b 1
	)
)
echo cd D:\KLTN UET\chatbot
echo py -3.10 -m venv venv310
echo venv310\Scripts\activate
echo pip install -r requirements.txt

echo.
echo [1/2] Starting RASA Server...
start "RASA Server" cmd /k "cd /d %CHATBOT_DIR% && %VENV_DIR%\Scripts\activate && rasa run --enable-api --cors * --port 5005"

timeout /t 5 >nul

echo [2/2] Starting Actions Server...
start "Actions Server" cmd /k "cd /d %CHATBOT_DIR% && %VENV_DIR%\Scripts\activate && rasa run actions --port 5055"

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
