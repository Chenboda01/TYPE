// Game variables
let gameState = 'start'; // 'start', 'playing', 'gameOver'
let score = 0;
let level = 1;
let wpm = 0;
let accuracy = 100;
let asteroids = [];
let bullets = [];
let powerups = [];
let startTime;
let totalTyped = 0;
let correctTyped = 0;
let gameInterval;
let spawnInterval;

// DOM elements
const startScreen = document.getElementById('start-screen');
const gameScreen = document.getElementById('game-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const startButton = document.getElementById('start-button');
const restartButton = document.getElementById('restart-button');
const scoreValue = document.getElementById('score-value');
const levelValue = document.getElementById('level-value');
const wpmValue = document.getElementById('wpm-value');
const accuracyValue = document.getElementById('accuracy-value');
const finalScore = document.getElementById('final-score');
const finalLevel = document.getElementById('final-level');
const peakWpm = document.getElementById('peak-wpm');
const finalAccuracy = document.getElementById('final-accuracy');
const wordInput = document.getElementById('word-input');
const asteroidField = document.getElementById('asteroid-field');
const bulletContainer = document.getElementById('bullet-container');

// Initialize game
document.addEventListener('DOMContentLoaded', () => {
    const startBtn = document.getElementById('start-button');
    const restartBtn = document.getElementById('restart-button');
    const wordInput = document.getElementById('word-input');

    startBtn.addEventListener('click', startGame);
    restartBtn.addEventListener('click', startGame);
    wordInput.addEventListener('keydown', handleInput);

    // Global keydown listener to handle Enter key for start/restart
    document.addEventListener('keydown', function(event) {
        // Only allow Enter to start/restart when on the start or game over screen
        if (event.key === 'Enter') {
            if (gameState === 'start') {
                startGame();
            } else if (gameState === 'gameOver') {
                startGame();
            }
        }
    });
});

// Start the game
function startGame() {
    // Reset game state
    gameState = 'playing';
    score = 0;
    level = 1;
    wpm = 0;
    accuracy = 100;
    asteroids = [];
    bullets = [];
    powerups = [];
    totalTyped = 0;
    correctTyped = 0;
    startTime = new Date();

    // Update UI
    updateUI();

    // Switch screens
    startScreen.classList.remove('active');
    gameScreen.classList.add('active');
    gameOverScreen.classList.remove('active');

    // Clear previous game elements
    asteroidField.innerHTML = '';
    bulletContainer.innerHTML = '';

    // Focus on input field
    const input = document.getElementById('word-input');
    input.value = '';
    input.focus();

    // Start game loop
    clearInterval(gameInterval);
    gameInterval = setInterval(updateGame, 1000 / 60); // ~60fps

    // Clear any existing spawn intervals
    if (spawnInterval) {
        clearInterval(spawnInterval);
    }

    // Start spawning asteroids
    spawnAsteroid();
    spawnInterval = setInterval(spawnAsteroid, 2000 - (level * 100)); // Adjust spawn rate based on level
}

// Handle user input
function handleInput(e) {
    if (gameState !== 'playing') return;

    if (e.key === 'Enter') {
        const typedWord = wordInput.value.trim().toLowerCase();
        totalTyped += typedWord.length;

        // Check if the typed word matches any asteroid
        let hit = false;
        for (let i = asteroids.length - 1; i >= 0; i--) {
            const asteroid = asteroids[i];
            if (asteroid.word.toLowerCase() === typedWord) {
                // Correctly typed word - destroy asteroid
                destroyAsteroid(i);
                correctTyped += typedWord.length;
                hit = true;
                break;
            }
        }

        // Update accuracy
        accuracy = Math.round((correctTyped / totalTyped) * 100) || 100;

        // Calculate WPM (words per minute)
        const timeElapsed = (new Date() - startTime) / 60000; // in minutes
        wpm = Math.round((correctTyped / 5) / timeElapsed) || 0;

        // Update UI
        updateUI();

        // Clear input
        wordInput.value = '';

        // If no hit, add penalty or continue
        if (!hit) {
            // Maybe add a miss penalty or feedback here
        }
    }
}

// Spawn a new asteroid
function spawnAsteroid() {
    if (gameState !== 'playing') return;

    // Choose between different space objects
    const imageBank = [
        { name: 'comet', src: 'assets/comet.svg' },
        { name: 'planet', src: 'assets/planet.svg' },
        { name: 'star', src: 'assets/star.svg' },
        { name: 'meteor', src: 'assets/meteor.svg' }
    ];
    const randomObject = imageBank[Math.floor(Math.random() * imageBank.length)];

    const asteroid = document.createElement('div');
    asteroid.className = 'asteroid';

    // Create an img element for the asteroid
    const img = document.createElement('img');
    img.src = randomObject.src;
    img.alt = randomObject.name;
    img.style.width = '40px';
    img.style.height = '40px';

    asteroid.appendChild(img);

    // Store the name separately for matching purposes
    asteroid.setAttribute('data-word', randomObject.name);

    // Position randomly along the top of the screen
    const startPos = Math.random() * window.innerWidth;
    asteroid.style.left = `${startPos}px`;
    asteroid.style.top = '0px';

    // Store asteroid data
    const asteroidData = {
        element: asteroid,
        word: randomObject.name,
        x: startPos,
        y: 0,
        speed: 1 + (level * 0.2) // Increase speed with level
    };

    asteroidField.appendChild(asteroid);
    asteroids.push(asteroidData);
}

// Destroy an asteroid
function destroyAsteroid(index) {
    const asteroid = asteroids[index];
    asteroid.element.classList.add('explode');
    
    // Add to score based on word length
    score += asteroid.word.length * 10;
    
    // Remove asteroid after animation
    setTimeout(() => {
        if (asteroid.element.parentNode) {
            asteroid.element.parentNode.removeChild(asteroid.element);
        }
        asteroids.splice(index, 1);
    }, 500);
}

// Update game state
function updateGame() {
    if (gameState !== 'playing') return;

    // Move asteroids down
    for (let i = asteroids.length - 1; i >= 0; i--) {
        const asteroid = asteroids[i];
        asteroid.y += asteroid.speed;
        asteroid.element.style.top = `${asteroid.y}px`;

        // Check if asteroid reached the spaceship (game over condition)
        // The spaceship is at the bottom of the screen
        if (asteroid.y > window.innerHeight * 0.9) {
            endGame();
            return;
        }
    }

    // Move bullets up
    for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i];
        bullet.y -= bullet.speed;
        bullet.element.style.top = `${bullet.y}px`;

        // Remove bullets that go off-screen
        if (bullet.y < 0) {
            if (bullet.element.parentNode) {
                bullet.element.parentNode.removeChild(bullet.element);
            }
            bullets.splice(i, 1);
        }
    }

    // Level up based on score
    const newLevel = Math.floor(score / 500) + 1;
    if (newLevel > level) {
        level = newLevel;
        // Increase difficulty here
    }

    updateUI();
}

// Update UI elements
function updateUI() {
    scoreValue.textContent = score;
    levelValue.textContent = level;
    wpmValue.textContent = wpm;
    accuracyValue.textContent = `${accuracy}%`;
}

// End the game
function endGame() {
    gameState = 'gameOver';
    clearInterval(gameInterval);
    if (spawnInterval) {
        clearInterval(spawnInterval);
    }

    // Update game over screen
    finalScore.textContent = score;
    finalLevel.textContent = level;
    peakWpm.textContent = wpm;
    finalAccuracy.textContent = `${accuracy}%`;

    // Switch screens
    gameScreen.classList.remove('active');
    gameOverScreen.classList.add('active');
}