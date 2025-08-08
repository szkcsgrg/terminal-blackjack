# Blackjack Game Launcher for Windows PowerShell
# This PowerShell script will open the game folder and start the Node.js blackjack game

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    Welcome to Terminal Blackjack!" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Get the directory where this script is located
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Change to the game directory
Set-Location $ScriptDir

Write-Host "Current directory: $(Get-Location)" -ForegroundColor Green
Write-Host ""

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "Node.js version: $nodeVersion" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "ERROR: Node.js is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if package.json exists
if (!(Test-Path "package.json")) {
    Write-Host "WARNING: package.json not found" -ForegroundColor Yellow
    Write-Host "Installing dependencies..." -ForegroundColor Cyan
    npm init -y
    npm install blessed chalk
}

# Check if node_modules exists, if not install dependencies
if (!(Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Cyan
    npm install
}

# Check if the main game file exists
if (!(Test-Path "blackjack.js")) {
    Write-Host "ERROR: blackjack.js not found in current directory" -ForegroundColor Red
    Write-Host "Make sure this script is in the same folder as blackjack.js" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "Starting Blackjack Game..." -ForegroundColor Green
Write-Host "Press Ctrl+C to quit the game" -ForegroundColor Yellow
Write-Host ""

# Start the game
try {
    node blackjack.js
} catch {
    Write-Host "An error occurred while running the game: $_" -ForegroundColor Red
}

# If the game exits, pause so user can see any error messages
Write-Host ""
Write-Host "Game ended." -ForegroundColor Cyan
Read-Host "Press Enter to exit"
