// Firebase initialization
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { getFirestore, collection, getDocs, addDoc, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAfgzj4j0mdHkMQ9q7GJTeuN7BEJQVvG6Q",
    authDomain: "bitcoin-pong.firebaseapp.com",
    projectId: "bitcoin-pong",
    storageBucket: "bitcoin-pong.appspot.com",
    messagingSenderId: "525545700153",
    appId: "1:525545700153:web:4a75c1b9123cf3298e06e8",
    measurementId: "G-Q47WZCFVZ9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore();

// DOM elements
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const menu = document.getElementById('menu');
const playerNameDisplay = document.getElementById('playerName');
const loginSection = document.getElementById('login');

// Auth provider
const provider = new GoogleAuthProvider();

// Event listener for login button
loginBtn.addEventListener('click', async () => {
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        showMainMenu(user.displayName);
    } catch (error) {
        console.error('Login failed:', error.message);
    }
});

// Event listener for logout button
logoutBtn.addEventListener('click', () => {
    signOut(auth).then(() => {
        alert('You have been logged out.');
        menu.style.display = 'none';
        loginSection.style.display = 'block';
    }).catch((error) => {
        console.error('Logout failed:', error.message);
    });
});

auth.onAuthStateChanged((user) => {
    if (user) {
        showMainMenu(user.displayName);
    }
});

function showMainMenu(name) {
    playerNameDisplay.textContent = name;
    loginSection.style.display = 'none';
    menu.style.display = 'block';
}

// Pong game variables and logic
const canvas = document.getElementById('pongGame');
const context = canvas.getContext('2d');

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 100;
const PADDLE_SPEED = 7;
let paddleSpeed = PADDLE_SPEED;
let ballSpeed = 1.5;

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
let keys = {};

// Event listeners for keys
document.addEventListener('keydown', (event) => {
    keys[event.key] = true;
});

document.addEventListener('keyup', (event) => {
    keys[event.key] = false;
    if (event.code === 'Space') {
        showMainMenu();
    }
});

// Event listeners for menu buttons
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

// Game functions
function drawRect(x, y, w, h, color) {
    context.fillStyle = color;
    context.fillRect(x, y, w, h);
}

function drawBall(x, y, r) {
    context.fillStyle = '#f7931a';
    context.beginPath();
    context.arc(x, y, r, 0, Math.PI * 2, false);
    context.closePath();
    context.fill();

    context.fillStyle = 'black';
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

function resetBall() {
    ball.x = WIDTH / 2;
    ball.y = HEIGHT / 2;
    ball.dx = (Math.random() > 0.5 ? 1 : -1) * ballSpeed;
    ball.dy = (Math.random() > 0.5 ? 1 : -1) * ballSpeed;
}

function updateGame() {
    ball.x += ball.dx;
    ball.y += ball.dy;

    if (ball.y + ball.radius > HEIGHT || ball.y - ball.radius < 0) {
        ball.dy *= -1;
    }

    if (checkPaddleCollision(ball, leftPaddle)) {
        ball.dx = Math.abs(ball.dx);
    } else if (checkPaddleCollision(ball, rightPaddle)) {
        ball.dx = -Math.abs(ball.dx);
    }

    if (ball.x - ball.radius < 0) {
        rightScore++;
        resetBall();
    }

    if (ball.x + ball.radius > WIDTH) {
        leftScore++;
        resetBall();
    }

    checkGameWinner();
}

function updatePaddlePositions() {
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

function checkGameWinner() {
    if (leftScore >= maxScore || rightScore >= maxScore) {
        gameOver = true;
        gameActive = false;
        showMainMenu();
    }
}

function checkPaddleCollision(ball, paddle) {
    return ball.x - ball.radius < paddle.x + paddle.width &&
           ball.x + ball.radius > paddle.x &&
           ball.y + ball.radius > paddle.y &&
           ball.y - ball.radius < paddle.y + paddle.height;
}

function gameLoop() {
    if (gameActive) {
        updateGame();
        updatePaddlePositions();
        renderGame();
    }
    requestAnimationFrame(gameLoop);
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

function startPongGame() {
    gameOver = false;
    gameActive = true;
    resetBall();
    gameLoop();
}

function clearLeaderboard() {
    leaderboard = [];
    alert('Leaderboard cleared!');
    showLeaderboard();
}

function showLeaderboard() {
    const leaderboardContent = document.getElementById('leaderboardContent');
    leaderboardContent.innerHTML = '<h3>Top Players</h3>';

    leaderboard.forEach((entry, index) => {
        leaderboardContent.innerHTML += `<p>${index + 1}. ${entry.player} - ${entry.time.toFixed(2)} seconds</p>`;
    });
}
