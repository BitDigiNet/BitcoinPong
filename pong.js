const canvas = document.getElementById('pongGame');
const context = canvas.getContext('2d');
const startBtn = document.getElementById('startBtn');
const instructionsBtn = document.getElementById('instructionsBtn');
const leaderboardBtn = document.getElementById('leaderboardBtn');
const speedSelection = document.getElementById('speedSelection');
const speedBtns = document.querySelectorAll('.speedBtn');

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 100;
let paddleSpeed = 8.75;
let ballSpeed = 5;
let speedMultiplier = 1;

let leftPaddle = { x: 50, y: HEIGHT / 2 - PADDLE_HEIGHT / 2 };
let rightPaddle = { x: WIDTH - 50 - PADDLE_WIDTH, y: HEIGHT / 2 - PADDLE_HEIGHT / 2 };
let ball = { x: WIDTH / 2, y: HEIGHT / 2, dx: ballSpeed, dy: ballSpeed, radius: 7 };

let leftScore = 0;
let rightScore = 0;

let gameActive = false;

// Function to draw paddles, ball, and net
function drawRect(x, y, w, h, color) {
    context.fillStyle = color;
    context.fillRect(x, y, w, h);
}

function drawBall(x, y, r, color) {
    context.fillStyle = color;
    context.beginPath();
    context.arc(x, y, r, 0, Math.PI * 2, false);
    context.closePath();
    context.fill();
}

function drawNet() {
    for (let i = 0; i < HEIGHT; i += 15) {
        drawRect(WIDTH / 2 - 1, i, 2, 10, 'white');
    }
}

// Ball reset function
function resetBall() {
    ball.x = WIDTH / 2;
    ball.y = HEIGHT / 2;
    ball.dx = ballSpeed * (Math.random() > 0.5 ? 1 : -1) * speedMultiplier;
    ball.dy = ballSpeed * (Math.random() > 0.5 ? 1 : -1) * speedMultiplier;
}

// Update the game state (ball and paddle movements)
function updateGame() {
    ball.x += ball.dx;
    ball.y += ball.dy;

    if (ball.y + ball.radius > HEIGHT || ball.y - ball.radius < 0) {
        ball.dy *= -1;
    }

    if (ball.x - ball.radius < leftPaddle.x + PADDLE_WIDTH &&
        ball.y > leftPaddle.y && ball.y < leftPaddle.y + PADDLE_HEIGHT) {
        ball.dx *= -1;
    }

    if (ball.x + ball.radius > rightPaddle.x &&
        ball.y > rightPaddle.y && ball.y < rightPaddle.y + PADDLE_HEIGHT) {
        ball.dx *= -1;
    }

    if (ball.x - ball.radius < 0) {
        rightScore++;
        resetBall();
    }

    if (ball.x + ball.radius > WIDTH) {
        leftScore++;
        resetBall();
    }

    document.onkeydown = function (e) {
        if (e.key === 'w' && leftPaddle.y > 0) {
            leftPaddle.y -= paddleSpeed;
        }
        if (e.key === 's' && leftPaddle.y + PADDLE_HEIGHT < HEIGHT) {
            leftPaddle.y += paddleSpeed;
        }
        if (e.key === 'ArrowUp' && rightPaddle.y > 0) {
            rightPaddle.y -= paddleSpeed;
        }
        if (e.key === 'ArrowDown' && rightPaddle.y + PADDLE_HEIGHT < HEIGHT) {
            rightPaddle.y += paddleSpeed;
        }
    };
}

// Render the game (draw paddles, ball, scores, and net)
function renderGame() {
    context.clearRect(0, 0, WIDTH, HEIGHT);
    drawRect(leftPaddle.x, leftPaddle.y, PADDLE_WIDTH, PADDLE_HEIGHT, 'white');
    drawRect(rightPaddle.x, rightPaddle.y, PADDLE_WIDTH, PADDLE_HEIGHT, 'white');
    drawBall(ball.x, ball.y, ball.radius, 'white');
    drawNet();

    context.font = '36px Arial';
    context.fillText(leftScore, WIDTH / 4, 50);
    context.fillText(rightScore, WIDTH * 3 / 4, 50);
}

// Game loop
function gameLoop() {
    if (gameActive) {
        updateGame();
        renderGame();
    }
}

setInterval(gameLoop, 1000 / 60);

function startGame() {
    resetBall();
    gameActive = true;
    document.getElementById('menu').style.display = 'none';
    speedSelection.style.display = 'block';
}

startBtn.addEventListener('click', startGame);

speedBtns.forEach(btn => {
    btn.addEventListener('click', function() {
        speedMultiplier = parseInt(this.getAttribute('data-speed'));
        paddleSpeed = 8.75 * speedMultiplier;
        ballSpeed = 5 * speedMultiplier;
        gameActive = true;
        speedSelection.style.display = 'none';
    });
});
