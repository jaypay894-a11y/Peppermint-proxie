const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');
const highScoreDisplay = document.getElementById('highScore');
const gameStatusDisplay = document.getElementById('gameStatus');

// Game variables
const gravity = 0.6;
const jump = -12;
const pipeGap = 120;
const pipeWidth = 60;
const pipeDistance = 200;

let bird = {
    x: 50,
    y: canvas.height / 2,
    width: 30,
    height: 30,
    velocity: 0
};

let pipes = [];
let score = 0;
let highScore = localStorage.getItem('flappyHighScore') || 0;
let gameRunning = false;
let gameOver = false;

highScoreDisplay.textContent = highScore;

// Input handling
window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        if (!gameRunning && !gameOver) {
            startGame();
        } else if (gameRunning) {
            bird.velocity = jump;
        }
    }
});

canvas.addEventListener('click', () => {
    if (!gameRunning && !gameOver) {
        startGame();
    } else if (gameRunning) {
        bird.velocity = jump;
    }
});

function startGame() {
    gameRunning = true;
    gameStatusDisplay.textContent = '';
}

function generatePipe() {
    const minHeight = 50;
    const maxHeight = canvas.height - pipeGap - minHeight;
    const randomHeight = Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;

    pipes.push({
        x: canvas.width,
        topHeight: randomHeight,
        bottomY: randomHeight + pipeGap,
        scored: false
    });
}

function update() {
    if (!gameRunning) return;

    // Apply gravity
    bird.velocity += gravity;
    bird.y += bird.velocity;

    // Check collision with ground and ceiling
    if (bird.y + bird.height >= canvas.height || bird.y <= 0) {
        endGame();
        return;
    }

    // Update pipes
    for (let i = pipes.length - 1; i >= 0; i--) {
        pipes[i].x -= 5;

        // Remove off-screen pipes
        if (pipes[i].x + pipeWidth < 0) {
            pipes.splice(i, 0);
            continue;
        }

        // Check collision
        if (
            bird.x < pipes[i].x + pipeWidth &&
            bird.x + bird.width > pipes[i].x &&
            (bird.y < pipes[i].topHeight || bird.y + bird.height > pipes[i].bottomY)
        ) {
            endGame();
            return;
        }

        // Score point
        if (!pipes[i].scored && pipes[i].x + pipeWidth < bird.x) {
            pipes[i].scored = true;
            score++;
            scoreDisplay.textContent = score;
        }
    }

    // Generate new pipes
    if (pipes.length === 0 || pipes[pipes.length - 1].x < canvas.width - pipeDistance) {
        generatePipe();
    }
}

function draw() {
    // Clear canvas
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw ground
    ctx.fillStyle = '#228B22';
    ctx.fillRect(0, canvas.height - 30, canvas.width, 30);

    // Draw bird
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(bird.x + bird.width / 2, bird.y + bird.height / 2, bird.width / 2, 0, Math.PI * 2);
    ctx.fill();

    // Draw bird eye
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(bird.x + bird.width / 2 + 5, bird.y + bird.height / 2 - 3, 3, 0, Math.PI * 2);
    ctx.fill();

    // Draw pipes
    ctx.fillStyle = '#228B22';
    for (let pipe of pipes) {
        // Top pipe
        ctx.fillRect(pipe.x, 0, pipeWidth, pipe.topHeight);
        // Bottom pipe
        ctx.fillRect(pipe.x, pipe.bottomY, pipeWidth, canvas.height - pipe.bottomY - 30);

        // Pipe decoration
        ctx.fillStyle = '#1a6b1a';
        ctx.fillRect(pipe.x - 2, pipe.topHeight - 10, pipeWidth + 4, 10);
        ctx.fillRect(pipe.x - 2, pipe.bottomY, pipeWidth + 4, 10);
        ctx.fillStyle = '#228B22';
    }
}

function endGame() {
    gameRunning = false;
    gameOver = true;
    gameStatusDisplay.textContent = `Game Over! Score: ${score}`;

    if (score > highScore) {
        highScore = score;
        localStorage.setItem('flappyHighScore', highScore);
        highScoreDisplay.textContent = highScore;
        gameStatusDisplay.textContent += ' - NEW HIGH SCORE!';
    }
}

function resetGame() {
    bird = {
        x: 50,
        y: canvas.height / 2,
        width: 30,
        height: 30,
        velocity: 0
    };
    pipes = [];
    score = 0;
    scoreDisplay.textContent = score;
    gameRunning = false;
    gameOver = false;
    gameStatusDisplay.textContent = 'Click to start!';
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();