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
let isGamePaused = false;

// User authentication and data
let currentUser = null;

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
    const pauseButton = document.getElementById('pause-button');

    startBtn.addEventListener('click', startGame);
    restartBtn.addEventListener('click', startGame);
    wordInput.addEventListener('keydown', handleInput);

    // Music controls
    musicToggle.addEventListener('click', toggleMusic);
    volumeSlider.addEventListener('input', updateVolume);

    // Game pause/resume controls
    pauseButton.addEventListener('click', togglePause);

    // Initialize authentication elements
    const authScreen = document.getElementById('auth-screen');
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const loginButton = document.getElementById('login-button');
    const signupButton = document.getElementById('signup-button');
    const showSignupLink = document.getElementById('show-signup');
    const showLoginLink = document.getElementById('show-login');
    const loginUsername = document.getElementById('login-username');
    const loginPassword = document.getElementById('login-password');
    const signupUsername = document.getElementById('signup-username');
    const signupPassword = document.getElementById('signup-password');
    const confirmPassword = document.getElementById('confirm-password');

    // Profile screen elements
    const profileScreen = document.getElementById('profile-screen');
    const viewProfileButton = document.getElementById('view-profile');
    const backToGameButton = document.getElementById('back-to-game');
    const logoutButton = document.getElementById('logout-button');

    // Authentication controls
    loginButton.addEventListener('click', handleLogin);
    signupButton.addEventListener('click', handleSignup);
    showSignupLink.addEventListener('click', showSignupForm);
    showLoginLink.addEventListener('click', showLoginForm);

    // Profile controls
    viewProfileButton.addEventListener('click', showProfileScreen);
    backToGameButton.addEventListener('click', () => {
        profileScreen.classList.remove('active');
        startScreen.classList.add('active');
        gameState = 'start';
    });
    logoutButton.addEventListener('click', handleLogout);

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

        // Add P key to pause/resume during gameplay
        if (event.key === 'p' || event.key === 'P') {
            if (gameState === 'playing') {
                togglePause();
            }
        }
    });

    // Initialize music
    initMusic();

    // Check if user is already logged in
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        showStartScreen();
    }
});

// Show signup form
function showSignupForm(e) {
    e.preventDefault();
    document.getElementById('login-form').classList.add('hidden');
    document.getElementById('signup-form').classList.remove('hidden');
}

// Show login form
function showLoginForm(e) {
    e.preventDefault();
    document.getElementById('signup-form').classList.add('hidden');
    document.getElementById('login-form').classList.remove('hidden');
}

// Handle user signup
function handleSignup() {
    const username = document.getElementById('signup-username').value.trim();
    const password = document.getElementById('signup-password').value;
    const confirmPasswordVal = document.getElementById('confirm-password').value;

    if (!username || !password) {
        alert('Please fill in all fields');
        return;
    }

    if (password !== confirmPasswordVal) {
        alert('Passwords do not match');
        return;
    }

    // Check if user already exists
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    if (users[username]) {
        alert('Username already exists. Please choose another one.');
        return;
    }

    // Create new user
    users[username] = {
        password: password,
        bestScore: 0,
        bestWpm: 0,
        registrationDate: new Date().toISOString()
    };

    localStorage.setItem('users', JSON.stringify(users));

    // Login the new user
    currentUser = {
        username: username,
        bestScore: 0,
        bestWpm: 0
    };
    localStorage.setItem('currentUser', JSON.stringify(currentUser));

    // Switch to start screen
    showStartScreen();
}

// Handle user login
function handleLogin() {
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;

    if (!username || !password) {
        alert('Please fill in all fields');
        return;
    }

    // Check if user exists
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    const user = users[username];

    if (!user || user.password !== password) {
        alert('Invalid username or password');
        return;
    }

    // Login successful
    currentUser = {
        username: username,
        bestScore: user.bestScore || 0,
        bestWpm: user.bestWpm || 0
    };
    localStorage.setItem('currentUser', JSON.stringify(currentUser));

    // Update UI with user stats
    updateStartScreenUserInfo();

    // Switch to start screen
    showStartScreen();
}

// Show start screen after authentication
function showStartScreen() {
    document.getElementById('auth-screen').classList.remove('active');
    document.getElementById('start-screen').classList.add('active');
    gameState = 'start';

    // Update user info in start screen
    updateStartScreenUserInfo();
}

// Update user info in the start screen
function updateStartScreenUserInfo() {
    if (currentUser) {
        document.getElementById('current-username').textContent = currentUser.username;
        document.getElementById('best-score').textContent = currentUser.bestScore || 0;
        document.getElementById('best-wpm').textContent = currentUser.bestWpm || 0;
    }
}

// Start the game
function startGame() {
    // If user is not logged in, show auth screen instead
    if (!currentUser) {
        document.getElementById('start-screen').classList.remove('active');
        document.getElementById('auth-screen').classList.add('active');
        gameState = 'start';
        return;
    }

    // Reset game state
    gameState = 'playing';
    isGamePaused = false; // Reset pause state
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

    // Update pause button state
    const pauseButton = document.getElementById('pause-button');
    const pauseOverlay = document.getElementById('pause-overlay');
    pauseButton.textContent = '⏸️'; // Pause symbol
    pauseButton.title = 'Pause Game';

    // Make sure pause overlay is hidden at start
    pauseOverlay.classList.remove('active');

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
    if (gameState !== 'playing' || isGamePaused) return; // Don't handle input when paused

    if (e.key === 'Enter') {
        const typedWord = wordInput.value.trim();
        if (typedWord) {
            // Add the typed word to the bullet display
            addBulletToDisplay(typedWord);

            const typedWordLower = typedWord.toLowerCase();
            totalTyped += typedWordLower.length;

            // Check if the typed word matches any asteroid
            let hit = false;
            for (let i = asteroids.length - 1; i >= 0; i--) {
                const asteroid = asteroids[i];
                if (asteroid.word.toLowerCase() === typedWordLower) {
                    // Correctly typed word - destroy asteroid
                    destroyAsteroid(i);
                    correctTyped += typedWordLower.length;
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
}

// Add a bullet to the display area and fire it
function addBulletToDisplay(word) {
    const bulletDisplay = document.getElementById('bullet-display');

    // Create a new bullet element in the display area
    const bulletItem = document.createElement('div');
    bulletItem.className = 'bullet-item';
    bulletItem.textContent = word;

    // Add to the display
    bulletDisplay.appendChild(bulletItem);

    // Auto-scroll to show the latest bullet
    bulletDisplay.scrollTop = bulletDisplay.scrollHeight;

    // Remove oldest bullets if we have more than 10
    if (bulletDisplay.children.length > 10) {
        bulletDisplay.removeChild(bulletDisplay.firstChild);
    }

    // Create a visual bullet that fires from the typing area to the game area
    fireVisualBullet(word);
}

// Fire a visual bullet from the typing area to the game area
function fireVisualBullet(word) {
    if (gameState !== 'playing') return; // Only fire bullets during gameplay

    const typingArea = document.getElementById('typing-area');
    const gameArea = document.getElementById('game-area');
    const bulletContainer = document.getElementById('bullet-container');

    if (!typingArea || !gameArea || !bulletContainer) return;

    const typingRect = typingArea.getBoundingClientRect();
    const gameRect = gameArea.getBoundingClientRect();

    // Create the visual bullet element
    const bulletElement = document.createElement('div');
    bulletElement.className = 'bullet';
    bulletElement.textContent = word;  // Show the actual word as the bullet

    // Position the bullet at the typing area (relative to game area)
    const startX = typingRect.left - gameRect.left + (typingRect.width / 2);
    const startY = typingRect.top - gameRect.top;

    bulletElement.style.left = `${startX}px`;
    bulletElement.style.top = `${startY}px`;

    bulletContainer.appendChild(bulletElement);

    // Add bullet data to the bullets array
    const bulletData = {
        element: bulletElement,
        x: startX,
        y: startY,
        word: word,  // Store the word for potential advanced features
        speed: 8,    // Speed at which the bullet travels upward
        targetX: startX,  // We'll aim toward the spaceship's horizontal position
        targetY: 0       // Target y coordinate (top of screen)
    };

    bullets.push(bulletData);
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
    if (gameState !== 'playing' || isGamePaused) return;

    // Calculate spaceship position - it's positioned at bottom: 20px from game-container
    // The spaceship height is about 3rem (48px approximately)
    const gameArea = document.getElementById('game-area');
    const gameAreaHeight = gameArea ? gameArea.offsetHeight : window.innerHeight;
    const spaceshipPosition = gameAreaHeight - 68;  // 20px bottom margin + ~48px height

    // Move asteroids down - process from the end to avoid index issues when removing
    for (let i = asteroids.length - 1; i >= 0; i--) {
        const asteroid = asteroids[i];

        // Only update position if the asteroid hasn't reached the bottom
        if (!asteroid.reachedBottom) {
            asteroid.y += asteroid.speed;
            asteroid.element.style.top = `${asteroid.y}px`;

            // Check if asteroid reached the spaceship (lose a life condition)
            if (asteroid.y > spaceshipPosition) {
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
        // If the asteroid has already reached the bottom but is still in the array,
        // remove it to keep the array clean
        else if (asteroid.reachedBottom) {
            if (asteroid.element.parentNode) {
                asteroid.element.parentNode.removeChild(asteroid.element);
            }
            asteroids.splice(i, 1);
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
    isGamePaused = false; // Ensure pause state is reset
    clearInterval(gameInterval);
    if (spawnInterval) {
        clearInterval(spawnInterval);
    }

    // Update game over screen
    finalScore.textContent = score;
    finalLevel.textContent = level;
    peakWpm.textContent = wpm;
    finalAccuracy.textContent = `${accuracy}%`;

    // If user is logged in, update their best scores
    if (currentUser) {
        // Check if this is a new best score
        if (score > (currentUser.bestScore || 0)) {
            currentUser.bestScore = score;
        }

        // Check if this is a new best WPM
        if (wpm > (currentUser.bestWpm || 0)) {
            currentUser.bestWpm = wpm;
        }

        // Update user in localStorage
        updateUserInStorage();

        // Update start screen display
        updateStartScreenUserInfo();

        // Update game over screen with best scores
        document.getElementById('best-score-final').textContent = currentUser.bestScore || 0;
        document.getElementById('best-wpm-final').textContent = currentUser.bestWpm || 0;
    }

    // Switch screens
    gameScreen.classList.remove('active');
    gameOverScreen.classList.add('active');

    // Pause background music during game over
    if (backgroundMusic) {
        backgroundMusic.pause();
    }

    // Make sure pause overlay is hidden during game over
    const pauseOverlay = document.getElementById('pause-overlay');
    if (pauseOverlay) {
        pauseOverlay.classList.remove('active');
    }
}

// Update user data in localStorage
function updateUserInStorage() {
    if (!currentUser) return;

    // Get all users
    const users = JSON.parse(localStorage.getItem('users') || '{}');

    // Update the current user's data
    if (users[currentUser.username]) {
        users[currentUser.username].bestScore = currentUser.bestScore;
        users[currentUser.username].bestWpm = currentUser.bestWpm;

        // Increment games played counter
        users[currentUser.username].gamesPlayed = (users[currentUser.username].gamesPlayed || 0) + 1;
    }

    // Save updated users back to localStorage
    localStorage.setItem('users', JSON.stringify(users));

    // Also update the current user in localStorage
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
}

// Show profile screen
function showProfileScreen() {
    gameOverScreen.classList.remove('active');
    profileScreen.classList.add('active');

    // Update profile screen with user data
    if (currentUser) {
        document.getElementById('profile-username').textContent = currentUser.username;
        document.getElementById('profile-best-score').textContent = currentUser.bestScore || 0;
        document.getElementById('profile-best-wpm').textContent = currentUser.bestWpm || 0;

        // Get games played from user data
        const users = JSON.parse(localStorage.getItem('users') || '{}');
        const userData = users[currentUser.username];
        const gamesPlayed = userData ? userData.gamesPlayed || 0 : 0;
        document.getElementById('profile-games-played').textContent = gamesPlayed;
    }
}

// Handle user logout
function handleLogout() {
    // Clear current user
    currentUser = null;
    localStorage.removeItem('currentUser');

    // Go back to auth screen
    profileScreen.classList.remove('active');
    document.getElementById('auth-screen').classList.add('active');
    gameState = 'start';
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

// Toggle game pause/resume
function togglePause() {
    if (gameState !== 'playing') return; // Only allow pausing during gameplay

    isGamePaused = !isGamePaused;

    const pauseButton = document.getElementById('pause-button');
    const pauseOverlay = document.getElementById('pause-overlay');

    if (isGamePaused) {
        // Pause the game
        clearInterval(gameInterval);
        if (spawnInterval) {
            clearInterval(spawnInterval);
        }

        // Update button text
        pauseButton.textContent = '▶️'; // Play symbol
        pauseButton.title = 'Resume Game';

        // Show pause overlay
        pauseOverlay.classList.add('active');

        // Pause background music
        if (backgroundMusic && !backgroundMusic.paused) {
            backgroundMusic.pause();
        }
    } else {
        // Resume the game
        gameInterval = setInterval(updateGame, 1000 / 60); // ~60fps

        // Restart asteroid spawning if needed
        if (spawnInterval) {
            clearInterval(spawnInterval);
        }
        spawnInterval = setInterval(spawnAsteroid, Math.max(500, 2000 - (level * 100))); // Minimum 500ms interval

        // Update button text
        pauseButton.textContent = '⏸️'; // Pause symbol
        pauseButton.title = 'Pause Game';

        // Hide pause overlay
        pauseOverlay.classList.remove('active');

        // Resume background music if it was playing
        if (isMusicPlaying && backgroundMusic) {
            backgroundMusic.play().catch(e => console.log("Audio play error:", e));
        }
    }
}