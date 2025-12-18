// Game variables
let gameState = 'start'; // 'start', 'playing', 'gameOver'
let score = 0;
let level = 1;
let wpm = 0;
let accuracy = 100;
let lives = 3; // Number of lives for the player
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

let livesContainer; // Declare livesContainer variable to be initialized after DOM load

// Audio elements
let backgroundMusic;
let currentTrackIndex = 0;
const musicTracks = [
    'assets/Jingle_Bells_Full.mp3',
    'assets/Twelve_Days_of_Christmas_Full_Instrumental.mp3'
];
let isMusicPlaying = false;

// Initialize game
document.addEventListener('DOMContentLoaded', () => {
    const startBtn = document.getElementById('start-button');
    const restartBtn = document.getElementById('restart-button');
    const wordInput = document.getElementById('word-input');

    // Initialize livesContainer after DOM has loaded
    livesContainer = document.getElementById('lives-container');

    // Initialize music elements
    const musicToggle = document.getElementById('music-toggle');
    const volumeSlider = document.getElementById('volume-slider');

    startBtn.addEventListener('click', startGame);
    restartBtn.addEventListener('click', startGame);
    wordInput.addEventListener('keydown', handleInput);

    // Music controls
    musicToggle.addEventListener('click', toggleMusic);
    volumeSlider.addEventListener('input', updateVolume);

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

    // Initialize music
    initMusic();
});

// Start the game
function startGame() {
    // Reset game state
    gameState = 'playing';
    score = 0;
    level = 1;
    wpm = 0;
    accuracy = 100;
    lives = 3; // Reset lives to initial value
    asteroids = [];
    bullets = [];
    powerups = [];
    totalTyped = 0;
    correctTyped = 0;
    startTime = new Date();

    // Update UI
    updateUI();
    updateLivesDisplay(); // Initialize lives display

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
    spawnInterval = setInterval(spawnAsteroid, Math.max(500, 2000 - (level * 100))); // Minimum 500ms interval

    // Start background music if it's enabled
    if (isMusicPlaying) {
        if (!backgroundMusic) {
            initMusic();
        }
        backgroundMusic.currentTime = 0; // Reset to beginning
        backgroundMusic.play().catch(e => console.log("Audio play error:", e));
    }
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

    // Simple word bank for now
    const wordBank = ['comet', 'nebula', 'galaxy', 'planet', 'meteor', 'star', 'orbit', 'space', 'cosmos'];
    const randomWord = wordBank[Math.floor(Math.random() * wordBank.length)];

    const asteroid = document.createElement('div');
    asteroid.className = 'asteroid';
    asteroid.textContent = randomWord;

    // Position randomly along the top of the screen
    const startPos = Math.random() * window.innerWidth;
    asteroid.style.left = `${startPos}px`;
    asteroid.style.top = '0px';

    // Store asteroid data
    const asteroidData = {
        element: asteroid,
        word: randomWord,
        x: startPos,
        y: 0,
        speed: 1 + (level * 0.2), // Increase speed with level
        reachedBottom: false // Flag to track if asteroid reached bottom
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

    // Calculate spaceship position - it's positioned at bottom: 20px from game-container
    // The spaceship height is about 3rem (48px approximately)
    const gameArea = document.getElementById('game-area');
    const gameAreaHeight = gameArea ? gameArea.offsetHeight : window.innerHeight;
    const spaceshipPosition = gameAreaHeight - 68;  // 20px bottom margin + ~48px height

    // Move asteroids down - process from the end to avoid index issues when removing
    for (let i = asteroids.length - 1; i >= 0; i--) {
        const asteroid = asteroids[i];
        asteroid.y += asteroid.speed;
        asteroid.element.style.top = `${asteroid.y}px`;

        // Check if asteroid reached the spaceship (lose a life condition)
        if (asteroid.y > spaceshipPosition && !asteroid.reachedBottom) {
            asteroid.reachedBottom = true; // Mark as reached bottom to prevent multiple triggers

            // Lose a life
            lives--;
            updateLivesDisplay();

            // Remove the asteroid that reached the bottom
            if (asteroid.element.parentNode) {
                asteroid.element.parentNode.removeChild(asteroid.element);
            }
            asteroids.splice(i, 1);

            // Check if game over
            if (lives <= 0) {
                endGame();
                return;  // Exit early to avoid further processing if game over
            }
        }
    }

    // Move bullets up - also process from the end to avoid index issues when removing
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

        // Adjust spawn rate based on level
        if (spawnInterval) {
            clearInterval(spawnInterval);
        }
        spawnInterval = setInterval(spawnAsteroid, Math.max(500, 2000 - (level * 100))); // Minimum 500ms interval
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

// Update the lives display with heart or skull icons
function updateLivesDisplay() {
    if (!livesContainer) return; // Guard clause in case element doesn't exist

    livesContainer.innerHTML = ''; // Clear container

    // Add life icons based on remaining lives
    for (let i = 0; i < 3; i++) { // Assuming max 3 lives
        const lifeIcon = document.createElement('img');

        if (i < lives) {
            // Active life - show heart of life
            lifeIcon.src = 'assets/heart_of_life.jpg'; // Using your specified heart image
            lifeIcon.alt = 'Life';
            lifeIcon.className = 'life-icon active-life';
        } else {
            // Lost life - show death indicator
            lifeIcon.src = 'assets/DIE.jpg'; // Using your specified death image
            lifeIcon.alt = 'Lost Life';
            lifeIcon.className = 'life-icon lost-life';
        }

        livesContainer.appendChild(lifeIcon);
    }
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

    // Pause background music during game over
    if (backgroundMusic) {
        backgroundMusic.pause();
    }
}

// Initialize music
function initMusic() {
    if (!backgroundMusic) {
        backgroundMusic = new Audio(musicTracks[currentTrackIndex]);
        backgroundMusic.volume = 0.5; // Default volume
        backgroundMusic.loop = false; // We'll handle looping manually to switch tracks

        // When one track ends, play the next one
        backgroundMusic.addEventListener('ended', playNextTrack);
    }
}

// Play the next track in the playlist
function playNextTrack() {
    currentTrackIndex = (currentTrackIndex + 1) % musicTracks.length;
    backgroundMusic.src = musicTracks[currentTrackIndex];
    if (isMusicPlaying) {
        backgroundMusic.play().catch(e => console.log("Audio play error:", e));
    }
}

// Toggle music on/off
function toggleMusic() {
    if (isMusicPlaying) {
        backgroundMusic.pause();
        isMusicPlaying = false;
    } else {
        if (!backgroundMusic) {
            initMusic();
        }
        backgroundMusic.play().catch(e => console.log("Audio play error:", e));
        isMusicPlaying = true;
    }
}

// Update volume based on slider
function updateVolume() {
    const volumeSlider = document.getElementById('volume-slider');
    const volume = volumeSlider.value / 100;
    if (backgroundMusic) {
        backgroundMusic.volume = volume;
    }
}