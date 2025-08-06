import blessed from 'blessed';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';

// Logging system
const __dirname = path.dirname(new URL(import.meta.url).pathname);
const logFilePath = path.join(__dirname, 'blackjack.log');

// Clear log file at startup
function clearLogFile() {
  try {
    fs.writeFileSync(logFilePath, '');
    console.log(chalk.gray('Log file cleared for new session.'));
  } catch (error) {
    console.error('Failed to clear log file:', error);
  }
}

function log(level, message, data = {}) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level,
    message,
    data
  };
  
  const logLine = `[${timestamp}] ${level.toUpperCase()}: ${message} ${Object.keys(data).length > 0 ? JSON.stringify(data) : ''}\n`;
  
  try {
    fs.appendFileSync(logFilePath, logLine);
  } catch (error) {
    console.error('Failed to write to log:', error);
  }
  
  // Console logging removed for cleaner game interface
}

// Convenience functions for different log levels
const logger = {
  info: (message, data) => log('info', message, data),
  warn: (message, data) => log('warn', message, data),
  error: (message, data) => log('error', message, data),
  debug: (message, data) => log('debug', message, data),
  game: (message, data) => log('game', message, data)
};

// Clear log file at startup for fresh session
clearLogFile();

const playerFilePath = path.join(__dirname, 'player.json');
const playerData = JSON.parse(fs.readFileSync(playerFilePath, 'utf8'));

// Log game initialization
logger.info('Blackjack game initialized', { 
  playerChips: playerData.chips, 
  gamesPlayed: playerData.gamesPlayed 
});

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function savePlayerData() {
  logger.debug('Saving player data', { 
    chips: playerData.chips, 
    gamesPlayed: playerData.gamesPlayed,
    gamesWon: playerData.gamesWon,
    gamesLost: playerData.gamesLost,
    gamesTied: playerData.gamesTied
  });
  fs.writeFileSync(playerFilePath, JSON.stringify(playerData, null, 2));
}

async function dealerTurn(deck, playerCards, dealerCards, bet) {
  logger.game('Dealer turn started', { 
    playerTotal: calculateTotal(playerCards),
    dealerCards: dealerCards.map(c => `${c.rank}${c.suit}`),
    bet 
  });
  
  // Reveal dealer hole card by showing all dealer cards
  showGameScreen(playerCards, dealerCards, playerData.chips, bet, false, false);

  let dealerTotal = calculateTotal(dealerCards);
  logger.game('Dealer initial total', { dealerTotal });

  // Dealer hits until total >= 17 with delay after each card
  while (dealerTotal < 17) {
    await delay(2000); // wait 1 second between dealer draws
    const newCard = deck.pop();
    dealerCards.push(newCard);
    dealerTotal = calculateTotal(dealerCards);
    
    logger.game('Dealer drew card', { 
      card: `${newCard.rank}${newCard.suit}`, 
      newTotal: dealerTotal 
    });

    // Show updated dealer hand after each hit
    showGameScreen(playerCards, dealerCards, playerData.chips, bet, false, false);
  }

  await delay(2500); // a small pause before showing result

  const playerTotal = calculateTotal(playerCards);
  let resultMessage = '';
  let gameResult = '';

  logger.game('Final totals', { playerTotal, dealerTotal });

  if (dealerTotal > 21 || playerTotal > dealerTotal) {
    // Player wins
    playerData.chips += bet;
    playerData.gamesWon++;
    resultMessage = 'You won!';
    gameResult = 'win';
  } else if (dealerTotal === playerTotal) {
    playerData.gamesTied++;
    resultMessage = 'Push (Tie).';
    gameResult = 'tie';
  } else {
    // Dealer wins
    playerData.chips -= bet;
    playerData.gamesLost++;
    resultMessage = 'You lost.';
    gameResult = 'loss';
  }
  
  playerData.gamesPlayed++;

  logger.game('Game ended', { 
    result: gameResult, 
    playerTotal, 
    dealerTotal, 
    bet, 
    newChips: playerData.chips 
  });

  savePlayerData();

  // Show final result
  box.setContent(
    chalk.hex('#FFA500').bold(` Chips: ${playerData.chips}`) + '\n\n' +
    chalk.magenta('Dealer\'s cards:') + '\n' + formatCardsArt(dealerCards, { hideHoleCard: false }) + '\n\n' +
    chalk.green('Your cards:') + '\n' + formatCardsArt(playerCards) + '\n\n' +
    chalk.magenta(`Dealer total: ${dealerTotal}`) + '\n' +
    chalk.green(`Your total: ${playerTotal}`) + '\n\n' +
    chalk.gray.bold(`${resultMessage}`) + '\n\n' +
    chalk.gray.italic('Press (r) to restart, (q) to quit.')
  );
  screen.render();

  // Remove previous game key listeners to prevent interference
  screen.removeAllListeners('keypress');

  // Single clean restart handler
  const restartHandler = (ch, key) => {
    if (key.name === 'r') {
      logger.game('Player chose to restart');
      screen.removeAllListeners('keypress');
      startBetting();
    } else if (key.name === 'q') {
      logger.warn('Player quit game');
      process.exit(0);
    }
  };

  // Add keys for restart and quit
  screen.key(['r', 'q'], restartHandler);
}


const width = process.stdout.columns;
const line = '─'.repeat(width);

const screen = blessed.screen({
  smartCSR: true,
  title: 'Blackjack TUI'
});

screen.key(['C-c', 'C-q'], function(ch, key) {
  const method = key.name === 'c' ? 'Ctrl+C' : 'Ctrl+Q';
  logger.warn(`Game terminated by user (${method})`);
  return process.exit(0);
});

const box = blessed.box({
  top: 'center',
  left: 'center',
  width: '100%',
  height: '100%',
  style: {
    fg: 'gray',
    border: {
      fg: 'white'
    }
  },
  align: 'center',   // horizontal center
  valign: 'middle'   // vertical center
});

screen.append(box);
box.setContent(
  chalk.yellow.bold('Welcome to the Blackjack Game!') + '\n\n' +
  chalk.hex('#FFA500').bold(` Chips: ${playerData.chips}`) + '\n' +
  chalk.blue(`Games Played: ${playerData.gamesPlayed}`) + '\n' +
  chalk.green(`Wins: ${playerData.gamesWon}`) + '  ' + 
  chalk.red(`Losses: ${playerData.gamesLost}`) + '  ' + 
  chalk.magenta(`Ties: ${playerData.gamesTied}`) + '\n\n' +
  chalk.gray.italic('Press any key to continue...')
);
screen.render();
screen.once('keypress', () => {
  screen.removeAllListeners('keypress');
  startBetting();
});


function startBetting() {
  // Clean up ALL listeners to prevent duplicates
  screen.removeAllListeners('keypress');
  screen.removeAllListeners();
  
  logger.game('Betting phase started', { currentChips: playerData.chips });
  
  box.setContent('');
  screen.render();

  let bet = 50;
  let state = 'betting';
  let isProcessing = false; // Prevent double processing

  function showBetScreen() {
    state = 'betting';
    box.setContent(
      chalk.hex('#FFA500').bold(` Chips: ${playerData.chips}`) + '\n\n' +
      chalk.yellow('Place your bet:') + '\n\n' +
      chalk.green(`${bet} chips`) + '\n\n' +
      chalk.gray.italic('Use ↑/↓ to adjust, Enter to confirm')
    );
    screen.render();
  }

  function showConfirmScreen() {
    state = 'confirmed';
    box.setContent(
      chalk.hex('#FFA500').bold(` Chips: ${playerData.chips}`) + '\n\n' +
      chalk.green('Bet confirmed: ') + chalk.yellow(`${bet} chips`) + '\n\n' +
      chalk.gray.italic('Press Backspace to change bet or Enter to start.')
    );
    screen.render();
  }

  showBetScreen();

  // Use a single key handler to prevent duplicates
  const keyHandler = (ch, key) => {
    if (isProcessing) return; // Prevent double processing
    
    // Global quit handler for betting screens
    if (key.name === 'q') {
      logger.warn('Player quit during betting');
      process.exit(0);
    }
    
    if(state === 'betting') {
      if (key.name === 'up') {
        bet = Math.min(bet + 25, playerData.chips);
        logger.debug('Bet increased', { newBet: bet });
        showBetScreen();
      } else if (key.name === 'down') {
        bet = Math.max(bet - 25, 50);
        logger.debug('Bet decreased', { newBet: bet });
        showBetScreen();
      } else if (key.name === 'enter') {
        logger.debug('Bet confirmed', { bet });
        showConfirmScreen();
      }
    } else if (state === 'confirmed') {
      if (key.name === 'backspace') {
        logger.debug('Bet change requested');
        showBetScreen();
      } else if (key.name === 'enter') {
        isProcessing = true;
        logger.game('Game starting', { bet, chips: playerData.chips });
        screen.removeAllListeners('keypress');
        startGame(bet);
      }
    }
  };

  screen.key(['up', 'down', 'enter', 'backspace', 'q'], keyHandler);
}

function createDeck() {
  const suits = ['♠', '♥', '♦', '♣'];
  const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
  const deck = [];

  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push({ suit, rank });
    }
  }
  return deck;
}

function shuffleDeck(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
}

function startGame(bet) {
  logger.game('New game started', { bet });
  
  // Complete cleanup of all listeners to prevent duplicates
  screen.removeAllListeners('keypress');
  screen.removeAllListeners();
  
  // Create and shuffle deck
  const deck = shuffleDeck(createDeck());
  logger.debug('Deck created and shuffled', { deckSize: deck.length });

  // Deal initial cards
  const playerCards = [deck.pop(), deck.pop()];
  const dealerCards = [deck.pop(), deck.pop()];
  
  logger.game('Initial cards dealt', {
    playerCards: playerCards.map(c => `${c.rank}${c.suit}`),
    dealerCards: dealerCards.map(c => `${c.rank}${c.suit}`),
    playerTotal: calculateTotal(playerCards),
    dealerVisible: calculateTotal(dealerCards.slice(1))
  });

  // Check for natural blackjacks (21 with first 2 cards)
  const playerTotal = calculateTotal(playerCards);
  const dealerTotal = calculateTotal(dealerCards);
  
  if (playerTotal === 21 || dealerTotal === 21) {
    // Handle natural blackjacks immediately
    return handleNaturalBlackjacks(playerCards, dealerCards, bet, deck);
  }

  // Show initial game screen
  showGameScreen(playerCards, dealerCards, playerData.chips, bet);

  let gameActive = true; // Game state flag
  let isProcessing = false; // Prevent double processing

  // Single key handler to prevent duplicates
  const gameKeyHandler = async (ch, key) => {
    if (!gameActive || isProcessing) return;
    
    logger.debug('Player action', { action: key.name });
    
    // Global quit handler during game
    if (key.name === 'q') {
      logger.warn('Player quit during game');
      process.exit(0);
    }
    
    if (key.name === 'h') {
      isProcessing = true;
      const newCard = deck.pop();
      playerCards.push(newCard);
      const newTotal = calculateTotal(playerCards);
      
      logger.game('Player hit', { 
        card: `${newCard.rank}${newCard.suit}`, 
        newTotal,
        cardsCount: playerCards.length 
      });
      
      if (newTotal > 21) {
        gameActive = false;
        logger.game('Player busted', { finalTotal: newTotal });
        
        // Show the bust immediately without hit/stand options
        showGameScreen(playerCards, dealerCards, playerData.chips, bet);
        screen.removeAllListeners('keypress');
        await delay(1500);

        playerData.chips -= bet;
        playerData.gamesPlayed++;
        playerData.gamesLost++;
        savePlayerData();
        
        box.setContent(
          chalk.hex('#FFA500').bold(`Chips: ${playerData.chips}`) + '\n\n' +
          chalk.gray.bold('Bust! You lose.') + '\n\n' +
          chalk.gray.italic('Press (r) to restart, (q) to quit.')
        );
        screen.render();

        // Clean restart handler
        const restartHandler = (ch, key) => {
          if (key.name === 'r') {
            logger.game('Player chose to restart after bust');
            screen.removeAllListeners('keypress');
            startBetting();
          } else if (key.name === 'q') {
            logger.warn('Player quit after bust');
            process.exit(0);
          }
        };
        screen.key(['r', 'q'], restartHandler);
      } else if (newTotal === 21) {
        // Auto-stand when player reaches 21
        gameActive = false;
        logger.game('Player reached 21 - auto stand', { 
          finalTotal: newTotal,
          cardsCount: playerCards.length 
        });
        
        // Show the 21 with "Standing automatically..." message
        showGameScreen(playerCards, dealerCards, playerData.chips, bet);
        screen.removeAllListeners('keypress');
        await delay(1500); // Longer pause to show the 21
        await dealerTurn(deck, playerCards, dealerCards, bet);
      } else {
        // Normal hit - show updated screen with hit/stand options
        showGameScreen(playerCards, dealerCards, playerData.chips, bet);
        isProcessing = false;
      }
        
    } else if (key.name === 's') {
      gameActive = false;
      logger.game('Player stands', { 
        finalTotal: calculateTotal(playerCards),
        cardsCount: playerCards.length 
      });
      
      // Show the screen without action prompts since player has stood
      showGameScreen(playerCards, dealerCards, playerData.chips, bet, true, false);
      screen.removeAllListeners('keypress');
      await delay(1000); // Brief pause to show the stand state
      await dealerTurn(deck, playerCards, dealerCards, bet);
    }
  };

  // Listen for h (hit), s (stand), and q (quit) keys
  screen.key(['h', 's', 'q'], gameKeyHandler);
}

async function handleNaturalBlackjacks(playerCards, dealerCards, bet, deck) {
  const playerTotal = calculateTotal(playerCards);
  const dealerTotal = calculateTotal(dealerCards);
  
  logger.game('Natural blackjack scenario', { 
    playerTotal, 
    dealerTotal,
    playerBlackjack: playerTotal === 21,
    dealerBlackjack: dealerTotal === 21
  });

  // Show both hands revealed since we're checking for naturals
  showGameScreen(playerCards, dealerCards, playerData.chips, bet, false, false);
  
  await delay(2000); // Let player see the cards

  let resultMessage = '';
  let gameResult = '';

  if (playerTotal === 21 && dealerTotal === 21) {
    // Both have blackjack - tie
    playerData.gamesTied++;
    resultMessage = 'Both have Blackjack! Push (Tie).';
    gameResult = 'tie';
    logger.game('Double blackjack - tie');
  } else if (playerTotal === 21) {
    // Player blackjack wins (pays 3:2)
    const blackjackPayout = Math.floor(bet * 1.5);
    playerData.chips += bet + blackjackPayout;
    playerData.gamesWon++;
    resultMessage = `Blackjack! You win ${bet + blackjackPayout} chips!`;
    gameResult = 'blackjack';
    logger.game('Player blackjack wins', { payout: bet + blackjackPayout });
  } else if (dealerTotal === 21) {
    // Dealer blackjack wins
    playerData.chips -= bet;
    playerData.gamesLost++;
    resultMessage = 'Dealer has Blackjack! You lose.';
    gameResult = 'loss';
    logger.game('Dealer blackjack wins');
  }
  
  playerData.gamesPlayed++;

  logger.game('Natural blackjack game ended', { 
    result: gameResult, 
    playerTotal, 
    dealerTotal, 
    bet, 
    newChips: playerData.chips 
  });

  savePlayerData();

  // Show final result
  box.setContent(
    chalk.hex('#FFA500').bold(`Chips: ${playerData.chips}`) + '\n\n' +
    chalk.magenta('Dealer\'s cards:') + '\n' + formatCardsArt(dealerCards, { hideHoleCard: false }) + '\n\n' +
    chalk.green('Your cards:') + '\n' + formatCardsArt(playerCards) + '\n\n' +
    chalk.magenta(`Dealer total: ${dealerTotal}`) + '\n' +
    chalk.green(`Your total: ${playerTotal}`) + '\n\n' +
    chalk.gray.bold(`${resultMessage}`) + '\n\n' +
    chalk.gray.italic('Press (r) to restart, (q) to quit.')
  );
  screen.render();

  // Remove previous game key listeners to prevent interference
  screen.removeAllListeners('keypress');

  // Single clean restart handler
  const restartHandler = (ch, key) => {
    if (key.name === 'r') {
      logger.game('Player chose to restart after natural blackjack');
      screen.removeAllListeners('keypress');
      startBetting();
    } else if (key.name === 'q') {
      logger.warn('Player quit after natural blackjack');
      process.exit(0);
    }
  };

  // Add keys for restart and quit
  screen.key(['r', 'q'], restartHandler);
}


function showGameScreen(playerCards, dealerCards, chips, bet, hideDealerHole = true, showActions = true) {
  // Calculate player total
  const playerTotal = calculateTotal(playerCards);

  // Calculate dealer total based on hidden hole card or not
  let dealerTotal;
  if (hideDealerHole) {
    dealerTotal = calculateTotal(dealerCards.slice(1)); // visible cards only
  } else {
    dealerTotal = calculateTotal(dealerCards); // all cards revealed
  }

  const dealerCardsArt = formatCardsArt(dealerCards, { hideHoleCard: hideDealerHole });
  const playerCardsArt = formatCardsArt(playerCards);

  let content = '';
  content += chalk.hex('#FFA500').bold(` Chips: ${chips}`) + '    ' + chalk.yellow(`Bet: ${bet}`) + '\n\n';
  content += chalk.magenta('Dealer\'s cards:') + '\n';
  content += dealerCardsArt + '\n';
  content += chalk.magenta(`Dealer's total: ${dealerTotal}`) + '\n\n';
  content += chalk.green('Your cards:') + '\n';
  content += playerCardsArt + '\n';
  content += chalk.green(`Your total: ${playerTotal}`) + '\n\n';
  
  // Only show actions if we're still in the player action phase
  if (showActions && playerTotal < 21) {
    content += chalk.gray.italic('Press (h) to Hit, (s) to Stand');
  } else if (showActions && playerTotal === 21) {
    content += chalk.yellow.bold('21! Standing automatically...');
  } else if (!showActions) {
    content += chalk.gray.italic('Dealer\'s turn...');
  }

  box.setContent(content);
  screen.render();
}

function calculateTotal(cards) {
  let total = 0;
  let aces = 0;

  for (const card of cards) {
    if (card.rank === 'A') {
      aces += 1;
      total += 11;
    } else if (['K', 'Q', 'J'].includes(card.rank)) {
      total += 10;
    } else {
      total += Number(card.rank);
    }
  }

  // Adjust for Aces if total > 21
  while (total > 21 && aces > 0) {
    total -= 10;
    aces -= 1;
  }

  return total;
}

function cardArt(card) {
  if (!card || typeof card.rank !== 'string' || typeof card.suit !== 'string') {
    return [
      chalk.bgWhite.black('┌─────┐'),
      chalk.bgWhite.black('│?????│'),
      chalk.bgWhite.black('│?????│'),
      chalk.bgWhite.black('│?????│'),
      chalk.bgWhite.black('└─────┘'),
    ].join('\n');
  }

  const suitColors = {
    '♠': chalk.bgWhite.black,  // black text on white bg
    '♣': chalk.bgWhite.black,
    '♥': chalk.bgWhite.red,    // red text on white bg
    '♦': chalk.bgWhite.red,
  };

  const color = suitColors[card.suit] || chalk.bgWhite.black;

  const rankLeft = card.rank.padEnd(2, ' ');
  const rankRight = card.rank.padStart(2, ' ');

  const top = chalk.bgWhite.black('┌─────┐');
  const line1 = chalk.bgWhite.black(`│${rankLeft}   │`);
  const line2 = color(`│  ${card.suit}  │`);
  const line3 = chalk.bgWhite.black(`│   ${rankRight}│`);
  const bottom = chalk.bgWhite.black('└─────┘');

  return [top, line1, line2, line3, bottom].join('\n');
}

function formatCardsArt(cards, options = {}) {
  if (options.hideHoleCard) {
    cards = ['hidden', ...cards.slice(1)];
  }

  const cardLines = cards.map(card => {
    if (card === 'hidden') {
      return [
        chalk.bgWhite.black('┌─────┐'),
        chalk.bgWhite.black('│░░░░░│'),
        chalk.bgWhite.black('│░░░░░│'),
        chalk.bgWhite.black('│░░░░░│'),
        chalk.bgWhite.black('└─────┘')
      ];
    }
    if (!card || typeof card.rank !== 'string' || typeof card.suit !== 'string') {
      return [
        chalk.bgWhite.black('┌─────┐'),
        chalk.bgWhite.black('│?????│'),
        chalk.bgWhite.black('│?????│'),
        chalk.bgWhite.black('│?????│'),
        chalk.bgWhite.black('└─────┘')
      ];
    }
    return cardArt(card).split('\n').filter(Boolean);
  });

  const combinedLines = [];
  for (let i = 0; i < 5; i++) {
    combinedLines.push(cardLines.map(lines => lines[i]).join(' '));
  }

  return combinedLines.join('\n');
}


function formatCards(cards, options = {}) {
  // If hideHoleCard is true, hide first dealer card as 🂠 (back of card)
  if (options.hideHoleCard) {
    return ['🂠', ...cards.slice(1).map(cardToEmoji)].join(' ');
  }
  return cards.map(cardToEmoji).join(' ');
}

// Map a card object to a simple emoji or text representation
function cardToEmoji(card) {
  const rankMap = {
    'A': 'A',
    'K': '♔',
    'Q': '♕',
    'J': '♖',
    '10': '10'
  };
  const suitMap = {
    '♠': '♠',
    '♥': '♥',
    '♦': '♦',
    '♣': '♣'
  };

  const rank = rankMap[card.rank] || card.rank;
  const suit = suitMap[card.suit] || card.suit;
  return `${rank}${suit}`;
}



console.clear();
console.log(chalk.gray(line));
console.log("");
console.log(chalk.white.bold("Thank your for playing Blackjack!"));
console.log("");
console.log(chalk.gray("Player data loaded from:"));
console.log(chalk.gray.italic(playerFilePath));
console.log(chalk.gray("If you want to reset your player data, change the numbers in the player.json file."));
console.log(chalk.gray(line));