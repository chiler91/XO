const cells = document.querySelectorAll('[data-cell]');
const statusMessage = document.getElementById('statusMessage');
const restartButton = document.getElementById('restartButton');
const toggleModeButton = document.getElementById('toggleModeButton');

// Scoreboard elements
const scoreXElement = document.getElementById('scoreX');
const scoreOElement = document.getElementById('scoreO');
const scoreDrawElement = document.getElementById('scoreDraw');

// Scores
let scoreX = 0;
let scoreO = 0;
let scoreDraw = 0;

let currentPlayer = 'X';
let board = ['', '', '', '', '', '', '', '', ''];
let isGameActive = true;
let isAIMode = true; // AI mode enabled by default

const winConditions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
];

function handleClick(event) {
    const cell = event.target;
    const cellIndex = Array.from(cells).indexOf(cell);

    if (board[cellIndex] !== '' || !isGameActive) {
        return;
    }

    updateCell(cell, cellIndex);
    checkWinner();

    // If AI mode is enabled and it's AI's turn (currentPlayer is 'O'), make AI move
    if (isGameActive && isAIMode && currentPlayer === 'O') {
        setTimeout(computerMove, 500); // Computer makes a move after a delay
    }
}

function updateCell(cell, index) {
    board[index] = currentPlayer;
    cell.textContent = currentPlayer;
    
    // Apply color based on whether the current player is 'X' or 'O'
    if (currentPlayer === 'X') {
        cell.style.color = 'black'; // X will be black
    } else {
        cell.style.color = 'blue'; // O will be blue
    }
}

function checkWinner() {
    let roundWon = false;

    for (let i = 0; i < winConditions.length; i++) {
        const winCondition = winConditions[i];
        const a = board[winCondition[0]];
        const b = board[winCondition[1]];
        const c = board[winCondition[2]];

        if (a === '' || b === '' || c === '') {
            continue;
        }

        if (a === b && b === c) {
            roundWon = true;
            break;
        }
    }

    if (roundWon) {
        statusMessage.textContent = `Играч ${currentPlayer} печели!`;
        statusMessage.style.color = 'green';  // Change the text color to green when a player wins
        isGameActive = false;

        // Update scores
        if (currentPlayer === 'X') {
            scoreX++;
            scoreXElement.textContent = scoreX; // Update X's score
        } else {
            scoreO++;
            scoreOElement.textContent = scoreO; // Update O's score
        }

        return;
    }

    if (!board.includes('')) {
        statusMessage.textContent = "Играта е Равна!"; // Display "Играта е Равна!" when the game is a draw
        statusMessage.style.color = 'lightgreen';  // Set the draw message to light green
        isGameActive = false;

        // Update draw score
        scoreDraw++;
        scoreDrawElement.textContent = scoreDraw; // Update draw score

        return;
    }

    switchPlayer();
}

function switchPlayer() {
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    statusMessage.textContent = `Ред на ${currentPlayer}`;
    statusMessage.style.color = 'white';  // Reset the text color to white during normal play
}

function computerMove() {
    if (!isGameActive) return;

    const bestMove = minimax(board, 'O').index;
    const cell = cells[bestMove];

    updateCell(cell, bestMove);
    checkWinner();
}

// Minimax Algorithm for AI
function minimax(newBoard, player) {
    const availSpots = newBoard.map((val, index) => val === '' ? index : null).filter(val => val !== null);

    // Base cases: check for terminal states (win, lose, or draw)
    if (checkWinnerSim(newBoard, 'X')) {
        return { score: -10 };
    } else if (checkWinnerSim(newBoard, 'O')) {
        return { score: 10 };
    } else if (availSpots.length === 0) {
        return { score: 0 };
    }

    const moves = [];
    for (let i = 0; i < availSpots.length; i++) {
        const move = {};
        move.index = availSpots[i];
        newBoard[availSpots[i]] = player;

        if (player === 'O') {
            const result = minimax(newBoard, 'X');
            move.score = result.score;
        } else {
            const result = minimax(newBoard, 'O');
            move.score = result.score;
        }

        newBoard[availSpots[i]] = ''; // Reset the spot
        moves.push(move);
    }

    // Choose the best move
    let bestMove;
    if (player === 'O') {
        let bestScore = -Infinity;
        for (let i = 0; i < moves.length; i++) {
            if (moves[i].score > bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < moves.length; i++) {
            if (moves[i].score < bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    }

    return moves[bestMove];
}

// Simulates a board and checks for a winner
function checkWinnerSim(board, player) {
    for (let i = 0; i < winConditions.length; i++) {
        const winCondition = winConditions[i];
        const a = board[winCondition[0]];
        const b = board[winCondition[1]];
        const c = board[winCondition[2]];

        if (a === player && b === player && c === player) {
            return true;
        }
    }
    return false;
}

function restartGame() {
    currentPlayer = 'X';
    board = ['', '', '', '', '', '', '', '', ''];
    isGameActive = true;
    statusMessage.textContent = `Ред на ${currentPlayer}`;
    statusMessage.style.color = 'white';  // Reset to white when the game restarts

    cells.forEach(cell => {
        cell.textContent = '';
        cell.style.backgroundColor = ''; // Reset cell background color
        cell.style.color = ''; // Reset text color
    });

    // If in AI mode, change cell background color to blue
    if (isAIMode) {
        cells.forEach(cell => cell.style.backgroundColor = 'lightblue');
    } else {
        // If playing with a friend, set cell background to light gray
        cells.forEach(cell => cell.style.backgroundColor = '#d3d3d3');
    }

    // Set the correct button text and color for AI mode or Player vs Player mode
    toggleModeButton.textContent = isAIMode ? 'Играй с приятел' : 'Играй срещу изкуствен интелект';
    toggleModeButton.style.backgroundColor = isAIMode ? 'green' : ''; // Set green background in AI mode
}

function toggleMode() {
    isAIMode = !isAIMode; // Toggle AI mode on or off
    restartGame(); // Reset the game whenever the mode is changed
}

cells.forEach(cell => cell.addEventListener('click', handleClick));
restartButton.addEventListener('click', restartGame);
toggleModeButton.addEventListener('click', toggleMode);

// Set initial state for the button and background color at the start
restartGame();
