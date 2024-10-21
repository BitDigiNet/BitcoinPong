// Get references to HTML elements
const canvas = document.getElementById('pongGame');
const context = canvas.getContext('2d');

// Game settings and variables
const WIDTH = canvas.width;
const HEIGHT = canvas.height;

const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 100;
const PADDLE_SPEED = 7;  // Paddle speed
let paddleSpeed = PADDLE_SPEED;
let ballSpeed = 1.5;  // Ball speed for Level 1

let paddle1Y = (HEIGHT - PADDLE_HEIGHT) / 2;
let paddle2Y = (HEIGHT - PADDLE_HEIGHT) / 2;

let leftPaddle = { x: 50, y: paddle1Y, width: PADDLE_WIDTH, height: PADDLE_HEIGHT };
let rightPaddle = { x: WIDTH - 50 - PADDLE_WIDTH, y: paddle2Y, width: PADDLE_WIDTH, height: PADDLE_HEIGHT };
let ball = { x: WIDTH / 2, y: HEIGHT / 2, dx: ballSpeed, dy: ballSpeed, radius: 7 };

let leftScore = 0;
let rightScore = 0;
let maxScore = 10;
let gameActive = false;
let gameOver = false;
let firstServe = true;
let keys = {};

// Time tracking variables
let gameStartTime = 0;
let gameEndTime = 0;

// Leaderboard will store up to the top 3 players
// Each entry includes: player name, time taken
let leaderboard = [];

// Load leaderboard from localStorage if available
const savedLeaderboard = localStorage.getItem('pongLeaderboard');
if (savedLeaderboard) {
    leaderboard = JSON.parse(savedLeaderboard);
}

// Event listeners for key presses
document.addEventListener('keydown', (event) => {
    keys[event.key] = true;
});

document.addEventListener('keyup', (event) => {
    keys[event.key] = false;
    if (event.code === 'Space') {
        showMainMenu();
    }
});

// Event Listeners for Menu Buttons
document.getElementById('startBtn').addEventListener('click', function() {
    document.getElementById('menu').style.display = 'none';
    document.getElementById('pongGame').style.display = 'block';
    startPongGame();
});

document.getElementById('leaderboardBtn').addEventListener('click', function() {
    document.getElementById('menu').style.display = 'none';
    document.getElementById('leaderboard').style.display = 'block';
    showLeaderboard();
});

document.getElementById('clearLeaderboardBtn').addEventListener('click', function() {
    clearLeaderboard();
});

document.getElementById('backLeaderboardBtn').addEventListener('click', function() {
    document.getElementById('leaderboard').style.display = 'none';
    document.getElementById('menu').style.display = 'block';
});

// Function definitions

function drawRect(x, y, w, h, color) {
    context.fillStyle = color;
    context.fillRect(x, y, w, h);
}

function drawBall(x, y, r) {
    context.fillStyle = '#f7931a';  // Bitcoin orange color
    context.beginPath();
    context.arc(x, y, r, 0, Math.PI * 2, false);
    context.closePath();
    context.fill();

    context.fillStyle = 'black';  // Black for the Bitcoin symbol
    context.font = `${r * 1.5}px Arial`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText('₿', x, y);
}

function drawNet() {
    for (let i = 0; i < HEIGHT; i += 15) {
        drawRect(WIDTH / 2 - 1, i, 2, 10, 'white');
    }
}

function resetBall(randomizeDirection = true) {
    ball.x = WIDTH / 2;
    ball.y = HEIGHT / 2;

    if (randomizeDirection) {
        ball.dx = (Math.random() > 0.5 ? 1 : -1) * ballSpeed;
        ball.dy = (Math.random() > 0.5 ? 1 : -1) * ballSpeed;
    }
}

function showCountdown(callback) {
    let countdown = 3;
    const countdownInterval = setInterval(() => {
        context.clearRect(0, 0, WIDTH, HEIGHT);
        renderGame();

        context.fillStyle = 'white';
        context.font = '60px Arial';
        context.textAlign = 'center';
        context.fillText(countdown > 0 ? countdown : 'GO!', WIDTH / 2, HEIGHT / 2);

        countdown--;
        if (countdown < 0) {
            clearInterval(countdownInterval);
            callback();
        }
    }, 1000);
}

function updateGame() {
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Ball collision with top and bottom walls
    if (ball.y + ball.radius > HEIGHT || ball.y - ball.radius < 0) {
        ball.dy *= -1;
    }

    // Ball collision with paddles
    if (checkPaddleCollision(ball, leftPaddle)) {
        ball.dx = Math.abs(ball.dx);  // Ensure ball moves right
    } else if (checkPaddleCollision(ball, rightPaddle)) {
        ball.dx = -Math.abs(ball.dx);  // Ensure ball moves left
    }

    // Ball out of bounds
    if (ball.x - ball.radius < 0) {
        rightScore++;
        delayNextServe();
    }

    if (ball.x + ball.radius > WIDTH) {
        leftScore++;
        delayNextServe();
    }

    checkGameWinner();
}

function updatePaddlePositions() {
    if (!gameOver) {
        if (keys['w'] && paddle1Y > 0) {
            paddle1Y -= paddleSpeed;
        }
        if (keys['s'] && paddle1Y < HEIGHT - PADDLE_HEIGHT) {
            paddle1Y += paddleSpeed;
        }
        if (keys['ArrowUp'] && paddle2Y > 0) {
            paddle2Y -= paddleSpeed;
        }
        if (keys['ArrowDown'] && paddle2Y < HEIGHT - PADDLE_HEIGHT) {
            paddle2Y += paddleSpeed;
        }

        leftPaddle.y = paddle1Y;
        rightPaddle.y = paddle2Y;
    }
}

function checkGameWinner() {
    if (!gameOver) {
        if (leftScore >= maxScore) {
            gameOver = true;
            gameActive = false;
            gameEndTime = Date.now();  // Record end time
            let timeTaken = (gameEndTime - gameStartTime) / 1000;  // Time in seconds
            promptForUsername('Left Player', timeTaken);
            showMainMenu();
        } else if (rightScore >= maxScore) {
            gameOver = true;
            gameActive = false;
            gameEndTime = Date.now();  // Record end time
            let timeTaken = (gameEndTime - gameStartTime) / 1000;  // Time in seconds
            promptForUsername('Right Player', timeTaken);
            showMainMenu();
        }
    }
}

function delayNextServe() {
    gameActive = false;
    setTimeout(() => {
        resetBall();
        gameActive = true;
    }, 1000);
}

function renderGame() {
    context.clearRect(0, 0, WIDTH, HEIGHT);
    drawRect(leftPaddle.x, paddle1Y, PADDLE_WIDTH, PADDLE_HEIGHT, 'white');
    drawRect(rightPaddle.x, paddle2Y, PADDLE_WIDTH, PADDLE_HEIGHT, 'white');
    drawBall(ball.x, ball.y, ball.radius);
    drawNet();

    context.font = '36px Arial';
    context.fillStyle = 'white';
    context.fillText(leftScore, WIDTH / 4, 50);
    context.fillText(rightScore, WIDTH * 3 / 4, 50);
}

function gameLoop() {
    if (gameActive && !gameOver) {
        updateGame();
        updatePaddlePositions();
        renderGame();
    }
    requestAnimationFrame(gameLoop);
}

function startPongGame() {
    paddleSpeed = PADDLE_SPEED;  // Paddle speed
    ballSpeed = 1.5;             // Ball speed
    maxScore = 10;               // Max score

    resetGame();
    gameOver = false; // Reset the gameOver flag
    firstServe = true;
    showCountdown(() => {
        gameActive = true;
        firstServe = false;
        gameStartTime = Date.now();  // Record start time
    });
    requestAnimationFrame(gameLoop);
}

function resetGame() {
    leftScore = 0;
    rightScore = 0;
    paddle1Y = (HEIGHT - PADDLE_HEIGHT) / 2;
    paddle2Y = (HEIGHT - PADDLE_HEIGHT) / 2;
    leftPaddle.y = paddle1Y;
    rightPaddle.y = paddle2Y;
    resetBall();
}

function showMainMenu() {
    gameActive = false;
    gameOver = true;
    context.clearRect(0, 0, WIDTH, HEIGHT); // Clear the canvas
    document.getElementById('pongGame').style.display = 'none';
    document.getElementById('menu').style.display = 'block';
}

function promptForUsername(winner, timeTaken) {
    let username = prompt(`${winner} wins in ${timeTaken.toFixed(2)} seconds!\nEnter your name:`);
    if (username !== null && username.trim() !== '') {
        updateLeaderboardData(username.trim(), timeTaken);
    }
}

function updateLeaderboardData(username, timeTaken) {
    leaderboard.push({ player: username, time: timeTaken });
    // Sort by time taken (shortest time first)
    leaderboard.sort((a, b) => a.time - b.time);

    // Only keep top 3 players
    if (leaderboard.length > 3) {
        leaderboard = leaderboard.slice(0, 3);
    }

    // Save to localStorage
    localStorage.setItem('pongLeaderboard', JSON.stringify(leaderboard));
}

function showLeaderboard() {
    let leaderboardContent = document.getElementById('leaderboardContent');
    leaderboardContent.innerHTML = '';

    leaderboardContent.innerHTML += `<h3>Top Players</h3>`;
    if (leaderboard.length === 0) {
        leaderboardContent.innerHTML += '<p>No players yet.</p>';
    } else {
        leaderboard.forEach((entry, index) => {
            leaderboardContent.innerHTML += `<p>${index + 1}. ${entry.player} - Time: ${entry.time.toFixed(2)} seconds</p>`;
        });
    }
}

function clearLeaderboard() {
    leaderboard = [];
    localStorage.removeItem('pongLeaderboard');
    alert('Leaderboard cleared!');
    showLeaderboard();
}

// Collision detection between ball and paddles
function checkPaddleCollision(ball, paddle) {
    return ball.x - ball.radius < paddle.x + paddle.width &&
           ball.x + ball.radius > paddle.x &&
           ball.y + ball.radius > paddle.y &&
           ball.y - ball.radius < paddle.y + paddle.height;
}
