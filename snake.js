const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');
const highScoreDisplay = document.getElementById('highScore');
const gameStatusDisplay = document.getElementById('gameStatus');

// Game variables
const gridSize = 20;
const tileCount = canvas.width / gridSize;
let snake = [{x: 10, y: 10}];
let food = {x: 15, y: 15};
let dx = 1;
let dy = 0;
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let gameRunning = false;
let gameOver = false;
let nextDx = 1;
let nextDy = 0;

highScoreDisplay.textContent = highScore;

// Keyboard input
window.addEventListener('keydown', (e) => {
    if (!gameRunning && !gameOver) {
        gameRunning = true;
        gameStatusDisplay.textContent = '';
    }

    if (e.key === 'ArrowUp' && dy === 0) {
        nextDx = 0;
        nextDy = -1;
    } else if (e.key === 'ArrowDown' && dy === 0) {
        nextDx = 0;
        nextDy = 1;
    } else if (e.key === 'ArrowLeft' && dx === 0) {
        nextDx = -1;
        nextDy = 0;
    } else if (e.key === 'ArrowRight' && dx === 0) {
        nextDx = 1;
        nextDy = 0;
    }
});

function update() {
    if (!gameRunning || gameOver) return;

    dx = nextDx;
    dy = nextDy;

    const head = {x: snake[0].x + dx, y: snake[0].y + dy};

    // Check collision with walls
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        endGame();
        return;
    }

    // Check collision with self
    for (let segment of snake) {
        if (head.x === segment.x && head.y === segment.y) {
            endGame();
            return;
        }
    }

    snake.unshift(head);

    // Check if food eaten
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        scoreDisplay.textContent = score;
        generateFood();
    } else {
        snake.pop();
    }
}

function generateFood() {
    let newFood;
    let validPosition = false;

    while (!validPosition) {
        newFood = {
            x: Math.floor(Math.random() * tileCount),
            y: Math.floor(Math.random() * tileCount)
        };

        validPosition = !snake.some(segment => segment.x === newFood.x && segment.y === newFood.y);
    }

    food = newFood;
}

function draw() {
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= tileCount; i++) {
        ctx.beginPath();
        ctx.moveTo(i * gridSize, 0);
        ctx.lineTo(i * gridSize, canvas.height);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, i * gridSize);
        ctx.lineTo(canvas.width, i * gridSize);
        ctx.stroke();
    }

    // Draw snake
    ctx.fillStyle = '#00ff00';
    for (let i = 0; i < snake.length; i++) {
        const segment = snake[i];
        ctx.fillRect(segment.x * gridSize + 1, segment.y * gridSize + 1, gridSize - 2, gridSize - 2);
        
        // Draw head differently
        if (i === 0) {
            ctx.fillStyle = '#00dd00';
            ctx.fillRect(segment.x * gridSize + 2, segment.y * gridSize + 2, gridSize - 4, gridSize - 4);
            ctx.fillStyle = '#00ff00';
        }
    }

    // Draw food
    ctx.fillStyle = '#ff0000';
    ctx.beginPath();
    ctx.arc(food.x * gridSize + gridSize / 2, food.y * gridSize + gridSize / 2, gridSize / 2 - 2, 0, Math.PI * 2);
    ctx.fill();
}

function endGame() {
    gameRunning = false;
    gameOver = true;
    gameStatusDisplay.textContent = `Game Over! Final Score: ${score}`;

    if (score > highScore) {
        highScore = score;
        localStorage.setItem('snakeHighScore', highScore);
        highScoreDisplay.textContent = highScore;
        gameStatusDisplay.textContent += ' - NEW HIGH SCORE!';
    }
}

function resetGame() {
    snake = [{x: 10, y: 10}];
    food = {x: 15, y: 15};
    dx = 1;
    dy = 0;
    nextDx = 1;
    nextDy = 0;
    score = 0;
    scoreDisplay.textContent = score;
    gameRunning = false;
    gameOver = false;
    gameStatusDisplay.textContent = 'Press any key to start!';
}

function gameLoop() {
    update();
    draw();
    setTimeout(gameLoop, 100);
}

gameLoop();