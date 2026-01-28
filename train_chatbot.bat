@echo off
echo ========================================
echo Training RASA Chatbot Model
echo ========================================
echo.

cd /d %~dp0chatbot

echo Activating virtual environment...
call venv\Scripts\activate

echo.
echo Starting training...
echo This may take 5-10 minutes...
echo.

rasa train

echo.
echo ========================================
echo Training complete!
echo ========================================
echo.
echo Model saved in: chatbot/models/
echo.
echo Next step: Run run_chatbot.bat to start the chatbot
echo.
pause
