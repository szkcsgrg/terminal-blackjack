#!/bin/bash
# Blackjack Game Launcher for macOS/Linux
# This shell script will open the game folder and start the Node.js blackjack game

echo "========================================"
echo "    Welcome to Terminal Blackjack!"
echo "========================================"
echo

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Change to the game directory
cd "$SCRIPT_DIR"

echo "Current directory: $(pwd)"
echo

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed or not in PATH"
    echo "Please install Node.js from https://nodejs.org/"
    echo
    read -p "Press Enter to exit..."
    exit 1
fi

echo "Node.js version:"
node --version
echo

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo "WARNING: package.json not found"
    echo "Installing dependencies..."
    npm init -y
    npm install blessed chalk
fi

# Check if node_modules exists, if not install dependencies
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Check if the main game file exists
if [ ! -f "blackjack.js" ]; then
    echo "ERROR: blackjack.js not found in current directory"
    echo "Make sure this script is in the same folder as blackjack.js"
    echo
    read -p "Press Enter to exit..."
    exit 1
fi

echo "Starting Blackjack Game..."
echo "Press Ctrl+C to quit the game"
echo

# Start the game
node blackjack.js

# If the game exits, pause so user can see any error messages
echo
echo "Game ended."
read -p "Press Enter to exit..."
