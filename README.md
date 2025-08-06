# 🃏 Terminal Blackjack Game

A fully-featured, interactive blackjack game built for the terminal using Node.js. Experience classic casino blackjack with beautiful ASCII card art, comprehensive logging, and a polished user interface.

![Blackjack Game](https://img.shields.io/badge/Game-Blackjack-red?style=for-the-badge)
![Node.js](https://img.shields.io/badge/Node.js-18+-green?style=for-the-badge)
![Terminal](https://img.shields.io/badge/Interface-Terminal-blue?style=for-the-badge)

## ✨ Features

### 🎮 Gameplay
- **Classic Blackjack Rules**: Standard casino blackjack with dealer hitting on soft 17
- **Natural Blackjacks**: Automatic detection with 3:2 payout
- **Auto-Stand on 21**: Automatically stands when reaching 21
- **Smart Ace Handling**: Automatic ace value adjustment (11 or 1)
- **Persistent Player Data**: Your chips, wins, and statistics are saved between sessions

### 🎨 Visual Experience
- **Beautiful ASCII Card Art**: Colorful card representations with proper suits
- **Red/Black Suit Colors**: Hearts and diamonds in red, spades and clubs in black
- **Hidden Hole Card**: Dealer's first card hidden until reveal
- **Professional Styling**: Orange chips, italic hints, bold text, and gray messages
- **Responsive Interface**: Adapts to terminal size

### 🎯 User Interface
- **Multiple Quit Options**: 
  - `Ctrl+C` or `Ctrl+Q`: Universal quit (works anywhere)
  - `Q` key: Context-specific quit (betting, gameplay, end screens)
- **Intuitive Controls**: 
  - `↑/↓`: Adjust bet amount
  - `H`: Hit (take another card)
  - `S`: Stand (keep current hand)
  - `R`: Restart game
  - `Enter/Backspace`: Confirm/change actions
- **Real-time Feedback**: Immediate visual response to all actions

### 🔍 Development Features
- **Comprehensive Logging**: Detailed game state tracking in `blackjack.log`
- **Fresh Session Logs**: Log file cleared on each startup
- **Debug Information**: Player actions, card deals, and game outcomes logged
- **Error Handling**: Graceful handling of edge cases and user input

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Terminal with Unicode support
- NPM or similar package manager

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/szkcsgrg/terminal-blackjack.git
   cd terminal-blackjack
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run the game**:
   ```bash
   node blackjack.js
   ```

### Global Installation (Optional)

Add to your shell configuration (`.zshrc`, `.bashrc`, etc.):
```bash
alias blackjack="node /path/to/blackjack/blackjack.js"
```

Then run from anywhere:
```bash
blackjack
```

## 🎲 How to Play

1. **Start the Game**: Run `node blackjack.js`
2. **Place Your Bet**: Use ↑/↓ arrows to adjust, Enter to confirm
3. **Play Your Hand**: 
   - Press `H` to hit (take another card)
   - Press `S` to stand (keep current total)
   - Automatic stand when reaching 21
4. **Dealer's Turn**: Watch the dealer play automatically
5. **See Results**: Win, lose, or tie - your chips are updated automatically
6. **Continue or Quit**: Press `R` to play again or `Q` to quit

## 📁 Project Structure

```
blackjack/
├── blackjack.js          # Main game file
├── player.json           # Player data persistence
├── package.json          # Dependencies and project info
├── blackjack.log         # Game session logs (auto-generated)
└── README.md            # This file
```

## 🎯 Game Rules

- **Objective**: Get as close to 21 as possible without going over
- **Card Values**: 
  - Number cards: Face value (2-10)
  - Face cards (J, Q, K): 10 points
  - Aces: 11 or 1 (automatically adjusted)
- **Natural Blackjack**: 21 with first two cards pays 3:2
- **Dealer Rules**: Hits on 16, stands on 17
- **Push**: Tie games return your bet

## 🔧 Dependencies

- **[blessed](https://github.com/chjj/blessed)**: Terminal interface framework
- **[chalk](https://github.com/chalk/chalk)**: Terminal string styling

## 🎮 Game Files

### `blackjack.js`
The main game file with all features:
- Full blackjack implementation
- ASCII card art
- Comprehensive logging
- Multiple quit options
- Professional styling

### `player.json`
Stores your game data:
```json
{
  "chips": 1000,
  "gamesPlayed": 0,
  "gamesWon": 0,
  "gamesLost": 0,
  "gamesTied": 0
}
```

### Common Issues

**Cards not displaying properly**:
- Ensure your terminal supports Unicode characters
- Try a different terminal emulator

**Game not quitting**:
- Use `Ctrl+Q` as universal quit options
- Check that your terminal is processing key events correctly

## 🎨 Customization

### Modify Starting Chips
Edit `player.json`:
```json
{
  "chips": 5000
}
```

### View Game Logs
Check `blackjack.log` for detailed game information:
```bash
tail -f blackjack.log
```

## 📜 License

This project is open source. Feel free to use, modify, and distribute.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

## 🎯 Future Features

- [ ] Multiple deck support
- [ ] Split hands functionality
- [ ] Double down option
- [ ] Insurance betting
- [ ] Online multiplayer
- [ ] Custom card themes

## 📞 Support

If you encounter any issues or have questions, please open an issue on GitHub.

---

**Enjoy playing Terminal Blackjack! 🃏**
