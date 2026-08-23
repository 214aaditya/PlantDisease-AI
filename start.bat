@echo off
title PlantDiseaseAI - Launcher
color 0A

echo.
echo  ============================================================
echo   🌿  PlantDiseaseAI - Starting Application...
echo  ============================================================
echo.

:: Change to the script's directory (works even if launched from elsewhere)
cd /d "%~dp0"

:: Check if Python is available
python --version >nul 2>&1
if errorlevel 1 (
    echo  ERROR: Python is not installed or not in PATH.
    echo  Please install Python from https://www.python.org
    pause
    exit /b 1
)

:: Check if requirements are installed
python -c "import fastapi" >nul 2>&1
if errorlevel 1 (
    echo  Installing required packages...
    pip install -r requirements.txt
    echo.
)

:: Launch the app
python start.py

:: If server crashes, pause so user can read the error
if errorlevel 1 (
    echo.
    echo  ❌ Server stopped with an error. See message above.
    pause
)
