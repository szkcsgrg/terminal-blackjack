@echo off
REM Blackjack Game Launcher for Windows
REM This batch file will open the game folder and start the Node.js blackjack game

echo ========================================
echo    Welcome to Terminal Blackjack!
echo ========================================
echo.

REM Get the directory where this batch file is located
set "GAME_DIR=%~dp0"

REM Change to the game directory
cd /d "%GAME_DIR%"

echo Current directory: %CD%
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo Node.js version:
node --version
echo.

REM Check if package.json exists
if not exist "package.json" (
    echo WARNING: package.json not found
    echo Installing dependencies...
    npm init -y
    npm install blessed chalk
)

REM Check if node_modules exists, if not install dependencies
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
)

REM Check if the main game file exists
if not exist "blackjack.js" (
    echo ERROR: blackjack.js not found in current directory
    echo Make sure this batch file is in the same folder as blackjack.js
    echo.
    pause
    exit /b 1
)

echo Starting Blackjack Game...
echo Press Ctrl+C to quit the game
echo.

REM Start the game
node blackjack.js

REM If the game exits, pause so user can see any error messages
echo.
echo Game ended.
pause
