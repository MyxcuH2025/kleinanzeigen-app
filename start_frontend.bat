@echo off
echo Starting Frontend Server...
cd /d "%~dp0frontend"
echo Current directory: %CD%
echo Starting npm dev server...
npm run dev
pause
