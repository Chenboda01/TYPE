// Game variables
let gameState = 'start'; // 'start', 'playing', 'gameOver', 'help', 'hosting'
let score = 0;
let level = 1;
let wpm = 0;
let accuracy = 100;
let lives = 3; // Number of lives for the player
let difficulty = 'medium'; // Current difficulty level ('easy', 'medium', 'hard')
let consecutiveMistakes = 0; // Track consecutive typing mistakes
let asteroids = [];
let bullets = [];
let powerups = [];
let startTime;
let pausedTime = 0; // Total time the game has been paused
let lastPauseTime = 0; // Time when the game was last paused
let totalTyped = 0;
let correctTyped = 0;
let gameInterval;
let spawnInterval;

// Power-up variables
let activePowerups = {
    shield: { active: false, endTime: null },
    doubleDamage: { active: false, endTime: null },
    slowMotion: { active: false, endTime: null }
};
let powerupSpawnInterval;

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
const powerupContainer = document.getElementById('powerup-container');
const storeScreen = document.getElementById('store-screen');

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

// Multiplayer join code variables
let activeJoinCodes = []; // Store active join codes
let currentJoinCode = null; // Store the current join code for this session

// Initialize game
document.addEventListener('DOMContentLoaded', () => {
    const startBtn = document.getElementById('start-button');
    const restartBtn = document.getElementById('restart-button');
    const wordInput = document.getElementById('word-input');
    const competeFriendsBtn = document.getElementById('compete-friends-button');
    const enterCodeBtn = document.getElementById('enter-code-button');
    const joinCodeSection = document.getElementById('join-code-section');
    const joinCodeInput = document.getElementById('join-code-input');
    const joinCodeSubmit = document.getElementById('join-code-submit');
    const joinCodeValidation = document.getElementById('join-code-validation');

    // Host screen elements
    const hostScreen = document.getElementById('host-screen');
    const currentJoinCodeDisplay = document.getElementById('current-join-code');
    const playersList = document.getElementById('players-list');
    const startGameButton = document.getElementById('start-game-button');
    const endGameButton = document.getElementById('end-game-button');
    const playerNameInput = document.getElementById('player-name-input');
    const addPlayerButton = document.getElementById('add-player-button');

    // Help Center elements
    const helpCenterButton = document.getElementById('help-center-button');
    const helpCenterScreen = document.getElementById('help-center-screen');
    const helpCenterBackButton = document.getElementById('help-center-back-button');
    const reportForm = document.getElementById('report-form');
    const reportType = document.getElementById('report-type');
    const reportDescription = document.getElementById('report-description');
    const reportEmail = document.getElementById('report-email');
    const adminPassword = document.getElementById('admin-password');
    const adminLoginBtn = document.getElementById('admin-login-btn');
    const adminPanel = document.getElementById('admin-panel');
    const reportsList = document.getElementById('reports-list');

    // Loading indicator elements
    const loadingBackButton = document.getElementById('loading-back-button');

    // Initialize livesContainer after DOM has loaded
    livesContainer = document.getElementById('lives-container');

    // Initialize music elements
    const musicToggle = document.getElementById('music-toggle');
    const volumeSlider = document.getElementById('volume-slider');
    const pauseButton = document.getElementById('pause-button');

    startBtn.addEventListener('click', startGame);
    restartBtn.addEventListener('click', startGame);
    wordInput.addEventListener('keydown', handleInput);

    // Multiplayer functionality
    competeFriendsBtn.addEventListener('click', showHostScreen);
    enterCodeBtn.addEventListener('click', showJoinCodeInput);
    joinCodeSubmit.addEventListener('click', validateJoinCode);

    // Host screen functionality
    startGameButton.addEventListener('click', startGame);
    endGameButton.addEventListener('click', () => {
        // Return to start screen when ending the game
        hostScreen.classList.remove('active');
        startScreen.classList.add('active');
        gameState = 'start';
    });

    // Add player button functionality (for demo purposes)
    addPlayerButton.addEventListener('click', () => {
        const playerName = playerNameInput.value.trim();
        if (playerName) {
            addPlayerToList(playerName);
            playerNameInput.value = ''; // Clear the input
        }
    });

    // Allow adding player by pressing Enter in the input field
    playerNameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addPlayerButton.click();
        }
    });

    // Help Center functionality
    helpCenterButton.addEventListener('click', () => {
        startScreen.classList.remove('active');
        helpCenterScreen.classList.add('active');
        gameState = 'help';
    });

    helpCenterBackButton.addEventListener('click', () => {
        helpCenterScreen.classList.remove('active');
        startScreen.classList.add('active');
        gameState = 'start';
    });

    // Report form submission
    reportForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const type = reportType.value;
        const description = reportDescription.value.trim();
        const email = reportEmail.value.trim();

        if (!type || !description) {
            alert('Please fill in all required fields.');
            return;
        }

        // Create a new report object
        const report = {
            id: Date.now(), // Use timestamp as unique ID
            type: type,
            description: description,
            email: email || 'Not provided',
            timestamp: new Date().toISOString()
        };

        // Save the report to localStorage
        saveReport(report);

        // Show confirmation and reset form
        alert('Your report has been submitted successfully!');
        reportForm.reset();
    });

    // Admin login
    adminLoginBtn.addEventListener('click', () => {
        const password = adminPassword.value;
        if (password === '771122') {
            adminPanel.classList.remove('hidden');
            adminPassword.value = ''; // Clear password field
        } else {
            alert('Incorrect password. Access denied.');
        }
    });

    // Load existing reports when admin panel is shown
    adminLoginBtn.addEventListener('click', loadReports);

    // Loading back button functionality
    loadingBackButton.addEventListener('click', () => {
        // Clear any existing timers
        if (window.hostScreenTimer) {
            clearTimeout(window.hostScreenTimer);
        }

        // Hide the loading indicator
        const loadingIndicator = document.getElementById('loading-indicator');
        if (loadingIndicator) {
            loadingIndicator.classList.add('hidden');
        }

        // Switch back to the start screen
        if (hostScreen) hostScreen.classList.remove('active');
        if (helpCenterScreen) helpCenterScreen.classList.remove('active');
        startScreen.classList.add('active');
        gameState = 'start';
    });

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

    // Store controls
    const viewStoreButton = document.getElementById('view-store');
    const backToProfileButton = document.getElementById('back-to-profile');
    const backToGameFromStoreButton = document.getElementById('back-to-game-from-store');
    const buyButtons = document.querySelectorAll('.buy-button');

    viewStoreButton.addEventListener('click', showStoreScreen);
    backToProfileButton.addEventListener('click', () => {
        storeScreen.classList.remove('active');
        profileScreen.classList.add('active');

        // If we came from gameplay, we should return to gameplay when going back
        // Don't change the game state here, just switch screens
    });

    backToGameFromStoreButton.addEventListener('click', () => {
        storeScreen.classList.remove('active');
        gameScreen.classList.add('active');
        // Restore the previous game state
        gameState = window.previousGameState || 'playing';
        // If game was paused and we're returning to gameplay, unpause it
        if (gameState === 'playing' && isGamePaused) {
            togglePause();
        } else if (gameState === 'playing' && !isGamePaused) {
            // If game wasn't paused, ensure it's running by restarting the game interval if needed
            if (!gameInterval) {
                gameInterval = setInterval(updateGame, 1000 / 60); // ~60fps
            }
        }
    });

    // Add event listeners to buy buttons
    buyButtons.forEach(button => {
        // Remove any existing listeners to avoid duplicates
        button.replaceWith(button.cloneNode(true));
        const newButton = button.parentNode.lastElementChild;
        newButton.addEventListener('click', function() {
            const packageCard = this.closest('.package-card');
            const sets = parseInt(packageCard.dataset.sets);
            initiatePurchase(sets);
        });
    });

    // Add click handlers for power-up indicators to activate power-ups during gameplay
    document.getElementById('shield-indicator').addEventListener('click', () => {
        if (currentUser && currentUser.shieldCount > 0) {
            activatePowerup('shield');
        }
    });

    document.getElementById('double-damage-indicator').addEventListener('click', () => {
        if (currentUser && currentUser.doubleDamageCount > 0) {
            activatePowerup('doubleDamage');
        }
    });

    document.getElementById('slow-motion-indicator').addEventListener('click', () => {
        if (currentUser && currentUser.slowMotionCount > 0) {
            activatePowerup('slowMotion');
        }
    });

    // Add shop button event listener
    const shopButton = document.getElementById('shop-button');
    shopButton.addEventListener('click', () => {
        // If on start screen or game over screen, go to profile first, then shop
        if (gameState === 'start' || gameState === 'gameOver') {
            if (currentUser) {
                // Switch to profile screen first, then shop
                if (gameState === 'start') {
                    startScreen.classList.remove('active');
                    profileScreen.classList.add('active');
                } else {
                    gameOverScreen.classList.remove('active');
                    profileScreen.classList.add('active');
                }
                // Then switch to store
                profileScreen.classList.remove('active');
                storeScreen.classList.add('active');
            }
        } else {
            // If in gameplay, pause the game and show the shop
            if (gameState === 'playing' && !isGamePaused) {
                togglePause();
            }
            // Store the previous game state to return to it later
            window.previousGameState = gameState;
            // Show store screen
            gameScreen.classList.remove('active');
            storeScreen.classList.add('active');
            gameState = 'shop';
        }
    });

    // Add resume button event listener
    const resumeButton = document.getElementById('resume-button');
    resumeButton.addEventListener('click', togglePause);

    // Global keydown listener to handle Enter key for start/restart and pause
    document.addEventListener('keydown', function(event) {
        // Only allow Enter to start/restart when on the start or game over screen
        if (event.key === 'Enter') {
            if (gameState === 'start') {
                startGame();
            } else if (gameState === 'gameOver') {
                startGame();
            }
            // Also allow Enter to resume when paused
            else if (gameState === 'playing' && isGamePaused) {
                togglePause();
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
        shieldCount: 0,
        doubleDamageCount: 0,
        slowMotionCount: 0,
        registrationDate: new Date().toISOString()
    };

    localStorage.setItem('users', JSON.stringify(users));

    // Login the new user
    currentUser = {
        username: username,
        bestScore: 0,
        bestWpm: 0,
        shieldCount: 0,
        doubleDamageCount: 0,
        slowMotionCount: 0
    };
    localStorage.setItem('currentUser', JSON.stringify(currentUser));

    // Switch to start screen
    showStartScreen();
    updatePowerupCounts();
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
        bestWpm: user.bestWpm || 0,
        shieldCount: user.shieldCount || 0,
        doubleDamageCount: user.doubleDamageCount || 0,
        slowMotionCount: user.slowMotionCount || 0
    };
    localStorage.setItem('currentUser', JSON.stringify(currentUser));

    // Update UI with user stats
    updateStartScreenUserInfo();
    updatePowerupCounts();

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

// Update user's power-up counts in the UI
function updatePowerupCounts() {
    if (currentUser) {
        // Update store screen
        document.getElementById('shield-count').textContent = currentUser.shieldCount || 0;
        document.getElementById('double-damage-count').textContent = currentUser.doubleDamageCount || 0;
        document.getElementById('slow-motion-count').textContent = currentUser.slowMotionCount || 0;

        // Update game UI indicators
        document.getElementById('shield-count-display').textContent = currentUser.shieldCount || 0;
        document.getElementById('double-damage-count-display').textContent = currentUser.doubleDamageCount || 0;
        document.getElementById('slow-motion-count-display').textContent = currentUser.slowMotionCount || 0;

        // Update active indicators
        updatePowerupIndicators();
    }
}

// Update power-up indicators in the game UI
function updatePowerupIndicators() {
    // Update shield indicator
    const shieldIndicator = document.getElementById('shield-indicator');
    if ((currentUser.shieldCount || 0) > 0 || activePowerups.shield.active) {
        shieldIndicator.classList.add('active');
    } else {
        shieldIndicator.classList.remove('active');
    }

    // Update double damage indicator
    const ddIndicator = document.getElementById('double-damage-indicator');
    if ((currentUser.doubleDamageCount || 0) > 0 || activePowerups.doubleDamage.active) {
        ddIndicator.classList.add('active');
    } else {
        ddIndicator.classList.remove('active');
    }

    // Update slow motion indicator
    const smIndicator = document.getElementById('slow-motion-indicator');
    if ((currentUser.slowMotionCount || 0) > 0 || activePowerups.slowMotion.active) {
        smIndicator.classList.add('active');
    } else {
        smIndicator.classList.remove('active');
    }
}

// Start the game
function startGame() {
    // If user is not logged in and not in hosting mode, show auth screen instead
    if (!currentUser && gameState !== 'hosting' && gameState !== 'help') {
        document.getElementById('start-screen').classList.remove('active');
        document.getElementById('auth-screen').classList.add('active');
        gameState = 'start';
        return;
    }

    // If returning from shop, just switch screens but keep gameplay going
    if (gameState === 'shop') {
        storeScreen.classList.remove('active');
        gameScreen.classList.add('active');
        // If game was paused, unpause it
        if (isGamePaused) {
            togglePause();
        }
        return;
    }

    // If in hosting mode, switch from host screen to game screen
    if (gameState === 'hosting') {
        hostScreen.classList.remove('active');
    }

    // If in help mode, switch from help screen to game screen
    if (gameState === 'help') {
        helpCenterScreen.classList.remove('active');
    }

    // Get selected difficulty
    const difficultySelect = document.getElementById('difficulty');
    difficulty = difficultySelect ? difficultySelect.value : 'medium';

    // Reset game state for a new game
    gameState = 'playing';
    isGamePaused = false; // Reset pause state
    score = 0;
    level = 1;
    wpm = 0;
    accuracy = 100;
    lives = 3; // Reset lives to initial value
    consecutiveMistakes = 0; // Reset consecutive mistakes counter
    asteroids = [];
    bullets = [];
    powerups = [];
    totalTyped = 0;
    correctTyped = 0;
    startTime = new Date();
    pausedTime = 0; // Reset paused time
    lastPauseTime = 0; // Reset last pause time

    // Reset active powerups
    activePowerups.shield = { active: false, endTime: null };
    activePowerups.doubleDamage = { active: false, endTime: null };
    activePowerups.slowMotion = { active: false, endTime: null };

    // Update UI
    updateUI();
    updateLivesDisplay(); // Initialize lives display
    updatePowerupCounts(); // Update power-up counts in UI

    // Switch screens
    if (hostScreen) hostScreen.classList.remove('active');
    if (helpCenterScreen) helpCenterScreen.classList.remove('active');
    startScreen.classList.remove('active');
    gameScreen.classList.add('active');
    gameOverScreen.classList.remove('active');

    // Clear previous game elements
    asteroidField.innerHTML = '';
    bulletContainer.innerHTML = '';
    powerupContainer.innerHTML = ''; // Clear powerups

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

    // Clear any existing powerup spawn interval
    if (powerupSpawnInterval) {
        clearInterval(powerupSpawnInterval);
    }

    // Start spawning asteroids
    spawnAsteroid();
    spawnInterval = setInterval(spawnAsteroid, Math.max(500, 2000 - (level * 100))); // Minimum 500ms interval

    // Start spawning powerups (starting at level 3)
    if (level >= 3) {
        powerupSpawnInterval = setInterval(spawnPowerup, 15000); // Spawn powerup every 15 seconds
    }

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

    // Update powerup counts display
    updatePowerupCounts();
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
            // Account for time when the game was paused
            const actualGameTime = (new Date() - startTime - pausedTime) / 60000; // in minutes
            wpm = Math.round((correctTyped / 5) / actualGameTime) || 0;

            // Update UI
            updateUI();

            // Clear input
            wordInput.value = '';

            // If no hit, track the mistake and apply penalties based on difficulty
            if (!hit) {
                // Add visual feedback for the mistake
                wordInput.style.backgroundColor = '#ffcccc'; // Light red background
                setTimeout(() => {
                    wordInput.style.backgroundColor = ''; // Reset background
                }, 300); // Reset after 300ms

                // Small score penalty for incorrect typing
                score = Math.max(0, score - 2);

                // Apply life penalty based on difficulty only
                let shouldLoseLife = false;

                switch(difficulty) {
                    case 'easy':
                        // On easy, lose life for every 5th mistake
                        consecutiveMistakes++;
                        if (consecutiveMistakes >= 5) {
                            shouldLoseLife = true;
                            consecutiveMistakes = 0; // Reset counter after penalty
                        }
                        break;
                    case 'medium':
                        // On medium, lose life for every 3rd mistake
                        consecutiveMistakes++;
                        if (consecutiveMistakes >= 3) {
                            shouldLoseLife = true;
                            consecutiveMistakes = 0; // Reset counter after penalty
                        }
                        break;
                    case 'hard':
                        // On hard, lose life for every mistake
                        shouldLoseLife = true;
                        break;
                    default:
                        // Default to medium difficulty behavior
                        consecutiveMistakes++;
                        if (consecutiveMistakes >= 3) {
                            shouldLoseLife = true;
                            consecutiveMistakes = 0; // Reset counter after penalty
                        }
                }

                if (shouldLoseLife) {
                    lives = Math.max(0, lives - 1);
                    updateLivesDisplay();

                    // Check if game over due to no lives remaining
                    if (lives <= 0) {
                        endGame();
                        return;  // Exit early to avoid further processing if game over
                    }
                }
            } else {
                // If the player made a correct input, reset the consecutive mistake counter
                consecutiveMistakes = 0;

                // Add visual feedback for correct input
                wordInput.style.backgroundColor = '#ccffcc'; // Light green background
                setTimeout(() => {
                    wordInput.style.backgroundColor = ''; // Reset background
                }, 300); // Reset after 300ms
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

    // Calculate score based on word length and active powerups
    let baseScore = asteroid.word.length * 10;

    // Apply double damage if active
    if (activePowerups.doubleDamage.active) {
        baseScore *= 2;
    }

    score += baseScore;

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

    // Calculate spaceship position reliably
    // Spaceship is positioned with bottom: 20px and has ~48px height (3rem)
    const gameArea = document.getElementById('game-area');
    const gameAreaHeight = gameArea ? gameArea.offsetHeight : window.innerHeight;
    const spaceshipPosition = gameAreaHeight - 68;  // 20px bottom margin + ~48px height

    // Slow motion effect - modify game speed
    const speedFactor = activePowerups.slowMotion.active ? 0.5 : 1; // Half speed during slow motion

    // Move asteroids down - process from the end to avoid index issues when removing
    for (let i = asteroids.length - 1; i >= 0; i--) {
        const asteroid = asteroids[i];

        // Only update position if the asteroid hasn't reached the bottom
        if (!asteroid.reachedBottom) {
            asteroid.y += asteroid.speed * speedFactor;  // Apply speed factor
            asteroid.element.style.top = `${asteroid.y}px`;

            // Check if asteroid reached the spaceship (lose a life condition)
            // Use a more precise check to prevent multiple collisions
            if (asteroid.y >= spaceshipPosition && !asteroid.reachedBottom) {
                asteroid.reachedBottom = true; // Mark as reached bottom to prevent multiple triggers

                // If shield is active, protect the player instead of losing a life
                if (activePowerups.shield.active) {
                    // Remove the asteroid without losing a life
                    if (asteroid.element.parentNode) {
                        asteroid.element.parentNode.removeChild(asteroid.element);
                    }
                    asteroids.splice(i, 1);
                } else {
                    // Lose a life (with safety check to prevent negative lives)
                    lives = Math.max(0, lives - 1);
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
        bullet.y -= bullet.speed * speedFactor;  // Apply speed factor
        bullet.element.style.top = `${bullet.y}px`;

        // Remove bullets that go off-screen
        if (bullet.y < 0) {
            if (bullet.element.parentNode) {
                bullet.element.parentNode.removeChild(bullet.element);
            }
            bullets.splice(i, 1);
        }
    }

    // Move powerups down and check for spaceship collision
    for (let i = powerups.length - 1; i >= 0; i--) {
        const powerup = powerups[i];
        powerup.y += powerup.speed * speedFactor;  // Apply speed factor
        powerup.element.style.top = `${powerup.y}px`;

        // Check if powerup reached the bottom (spaceship area)
        const gameArea = document.getElementById('game-area');
        const gameAreaHeight = gameArea ? gameArea.offsetHeight : window.innerHeight;
        const spaceshipPosition = gameAreaHeight - 68;  // 20px bottom margin + ~48px height

        if (powerup.y >= spaceshipPosition) {
            // Apply the powerup to the player
            if (currentUser) {
                // Add the powerup to the user's inventory
                const powerupType = powerup.type;
                currentUser[powerupType + 'Count'] = (currentUser[powerupType + 'Count'] || 0) + 1;

                // Remove the powerup from the game
                if (powerup.element.parentNode) {
                    powerup.element.parentNode.removeChild(powerup.element);
                }
                powerups.splice(i, 1);

                // Update the UI
                updatePowerupCounts();
            }
        }
        // Remove powerups that go off-screen at the bottom (but not as far as asteroids)
        else if (powerup.y > window.innerHeight) {
            if (powerup.element.parentNode) {
                powerup.element.parentNode.removeChild(powerup.element);
            }
            powerups.splice(i, 1);
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

        // Start spawning powerups at level 3
        if (level >= 3 && !powerupSpawnInterval) {
            powerupSpawnInterval = setInterval(spawnPowerup, 15000); // Spawn powerup every 15 seconds
        }
    }

    // Check if any active powerups should end
    checkPowerupTimers();

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

    // Clear powerup spawn interval
    if (powerupSpawnInterval) {
        clearInterval(powerupSpawnInterval);
    }

    // Reset pause tracking variables
    pausedTime = 0;
    lastPauseTime = 0;

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

    // If player was in the shop, return to game over screen
    if (gameState === 'shop') {
        storeScreen.classList.remove('active');
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

        // Save powerup counts to user data
        users[currentUser.username].shieldCount = currentUser.shieldCount || 0;
        users[currentUser.username].doubleDamageCount = currentUser.doubleDamageCount || 0;
        users[currentUser.username].slowMotionCount = currentUser.slowMotionCount || 0;
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

        // Update power-up counts
        updatePowerupCounts();
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

// Spawn a power-up
function spawnPowerup() {
    if (gameState !== 'playing' || isGamePaused) return;

    // Power-up types
    const powerupTypes = ['shield', 'doubleDamage', 'slowMotion'];
    const randomType = powerupTypes[Math.floor(Math.random() * powerupTypes.length)];

    // Create power-up element
    const powerup = document.createElement('div');
    powerup.className = 'powerup';
    powerup.dataset.type = randomType;

    // Add appropriate icon/text based on type
    switch(randomType) {
        case 'shield':
            powerup.textContent = '🛡️';
            powerup.title = 'Shield';
            break;
        case 'doubleDamage':
            powerup.textContent = '⚔️';
            powerup.title = 'Double Damage';
            break;
        case 'slowMotion':
            powerup.textContent = '⏱️';
            powerup.title = 'Slow Motion';
            break;
    }

    // Position randomly along the top of the screen
    const startPos = Math.random() * window.innerWidth;
    powerup.style.left = `${startPos}px`;
    powerup.style.top = '0px';

    // Store power-up data
    const powerupData = {
        element: powerup,
        type: randomType,
        x: startPos,
        y: 0,
        speed: 1 + (level * 0.1) // Power-ups move slightly slower than asteroids
    };

    powerupContainer.appendChild(powerup);
    powerups.push(powerupData);
}

// Function to activate a power-up
function activatePowerup(type) {
    // Reduce the count of this power-up type
    if (currentUser[type + 'Count'] > 0) {
        currentUser[type + 'Count']--;
        updatePowerupCounts();

        // Apply the power-up effect
        const duration = 10000; // 10 seconds duration
        const endTime = Date.now() + duration;

        switch(type) {
            case 'shield':
                activePowerups.shield = { active: true, endTime: endTime };
                // Visual feedback could be added here
                break;
            case 'doubleDamage':
                activePowerups.doubleDamage = { active: true, endTime: endTime };
                // Visual feedback could be added here
                break;
            case 'slowMotion':
                activePowerups.slowMotion = { active: true, endTime: endTime };
                // Visual feedback could be added here
                break;
        }
    }
}

// Check and end active power-ups
function checkPowerupTimers() {
    const now = Date.now();

    // Check shield
    if (activePowerups.shield.active && now >= activePowerups.shield.endTime) {
        activePowerups.shield.active = false;
        updatePowerupIndicators();
    }

    // Check double damage
    if (activePowerups.doubleDamage.active && now >= activePowerups.doubleDamage.endTime) {
        activePowerups.doubleDamage.active = false;
        updatePowerupIndicators();
    }

    // Check slow motion
    if (activePowerups.slowMotion.active && now >= activePowerups.slowMotion.endTime) {
        activePowerups.slowMotion.active = false;
        updatePowerupIndicators();
    }
}

// Show store screen
function showStoreScreen() {
    profileScreen.classList.remove('active');
    storeScreen.classList.add('active');

    // Update powerup counts in the store
    updatePowerupCounts();

    // Add event listeners for buy buttons
    const buyButtons = document.querySelectorAll('.buy-button');
    buyButtons.forEach(button => {
        button.addEventListener('click', function() {
            const packageCard = this.closest('.package-card');
            const sets = parseInt(packageCard.dataset.sets);
            initiatePurchase(sets);
        });
    });

    // Add event listener for cancel payment button
    const cancelPaymentButton = document.getElementById('cancel-payment');
    if (cancelPaymentButton) {
        cancelPaymentButton.addEventListener('click', function() {
            document.getElementById('payment-form').classList.add('hidden');
        });
    }

    // Add event listener for the payment form
    const paymentForm = document.getElementById('card-payment-form');
    if (paymentForm) {
        paymentForm.addEventListener('submit', handlePayment);
    }
}

// Initiate purchase process
function initiatePurchase(sets) {
    // Show the payment form
    document.getElementById('payment-form').classList.remove('hidden');

    // Store the number of sets being purchased for later use
    window.currentPurchaseSets = sets;
}

// Handle payment submission
function handlePayment(event) {
    event.preventDefault(); // Prevent default form submission

    // Get form values
    const cardNumber = document.getElementById('card-number').value;
    const expiryDate = document.getElementById('expiry-date').value;
    const cvv = document.getElementById('cvv').value;
    const cardholderName = document.getElementById('cardholder-name').value;
    const billingZip = document.getElementById('billing-zip').value;

    // Basic validation
    if (!validateCardInfo(cardNumber, expiryDate, cvv, cardholderName, billingZip)) {
        alert('Please enter valid card information.');
        return;
    }

    // In a real implementation, you would send this data to a payment processor
    // For now, we'll simulate a successful payment
    processPayment(cardNumber, expiryDate, cvv, cardholderName, billingZip, window.currentPurchaseSets);
}

// Validate card information
function validateCardInfo(cardNumber, expiryDate, cvv, cardholderName, billingZip) {
    // Basic validation checks
    const cardNumberClean = cardNumber.replace(/\s/g, ''); // Remove spaces

    // Check if card number is valid (basic check)
    if (!/^\d{13,19}$/.test(cardNumberClean)) {
        return false;
    }

    // Check if expiry date is valid (basic check)
    if (!/^(0[1-9]|1[0-2])\/?([0-9]{2})$/.test(expiryDate)) {
        return false;
    }

    // Check if CVV is valid (basic check)
    if (!/^\d{3,4}$/.test(cvv)) {
        return false;
    }

    // Check if cardholder name is provided
    if (!cardholderName.trim()) {
        return false;
    }

    // Check if billing ZIP is provided
    if (!billingZip.trim()) {
        return false;
    }

    return true;
}

// Process the payment (simulated)
function processPayment(cardNumber, expiryDate, cvv, cardholderName, billingZip, sets) {
    // In a real implementation, you would send this data to a payment processor
    // For this demo, we'll simulate a successful transaction

    // Show a loading state or processing message
    const submitButton = document.querySelector('#card-payment-form button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.textContent = 'Processing...';
    submitButton.disabled = true;

    // Simulate payment processing delay
    setTimeout(() => {
        // Simulate successful payment
        // In a real app, this would be the response from the payment processor
        const paymentSuccessful = true; // This would come from the payment processor response

        if (paymentSuccessful) {
            // Add the purchased power-ups to the user's account
            if (currentUser) {
                currentUser.shieldCount = (currentUser.shieldCount || 0) + sets;
                currentUser.doubleDamageCount = (currentUser.doubleDamageCount || 0) + sets;
                currentUser.slowMotionCount = (currentUser.slowMotionCount || 0) + sets;

                // Save to localStorage
                updateUserInStorage();

                // Update UI
                updatePowerupCounts();

                // Hide the payment form
                document.getElementById('payment-form').classList.add('hidden');

                // Reset form
                document.getElementById('card-payment-form').reset();

                // Show confirmation
                alert(`Payment successful! You've purchased ${sets} set(s) of power-ups!`);
            }
        } else {
            // Payment failed
            alert('Payment failed. Please try again with a different card.');
        }

        // Reset button
        submitButton.textContent = originalText;
        submitButton.disabled = false;
    }, 2000); // Simulate 2 seconds of processing time
}

// Purchase a power-up package
function purchasePowerupPackage(sets) {
    // This function is now deprecated in favor of the new payment flow
    // For now, just add the power-ups to the user's account
    // In a real implementation, this would connect to a payment processor
    if (currentUser) {
        currentUser.shieldCount = (currentUser.shieldCount || 0) + sets;
        currentUser.doubleDamageCount = (currentUser.doubleDamageCount || 0) + sets;
        currentUser.slowMotionCount = (currentUser.slowMotionCount || 0) + sets;

        // Save to localStorage
        updateUserInStorage();

        // Update UI
        updatePowerupCounts();

        // Show confirmation
        alert(`Successfully purchased ${sets} set(s) of power-ups!`);
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
        if (powerupSpawnInterval) {
            clearInterval(powerupSpawnInterval);
        }

        // Track when the game was paused
        lastPauseTime = Date.now();

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
        // Calculate how long the game was paused
        if (lastPauseTime > 0) {
            pausedTime += Date.now() - lastPauseTime;
            lastPauseTime = 0; // Reset the pause start time
        }

        // Resume the game
        gameInterval = setInterval(updateGame, 1000 / 60); // ~60fps

        // Restart asteroid spawning if needed
        if (spawnInterval) {
            clearInterval(spawnInterval);
        }
        spawnInterval = setInterval(spawnAsteroid, Math.max(500, 2000 - (level * 100))); // Minimum 500ms interval

        // Restart powerup spawning if needed (only if level >= 3)
        if (level >= 3) {
            if (powerupSpawnInterval) {
                clearInterval(powerupSpawnInterval);
            }
            powerupSpawnInterval = setInterval(spawnPowerup, 15000); // Spawn powerup every 15 seconds
        }

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

// Show the host screen with generated join code
function showHostScreen() {
    console.log("showHostScreen function called"); // Debug log

    // Show loading indicator
    const loadingIndicator = document.getElementById('loading-indicator');
    console.log("Loading indicator element:", loadingIndicator); // Debug log
    if (loadingIndicator) {
        loadingIndicator.classList.remove('hidden');
        console.log("Loading indicator shown"); // Debug log
    } else {
        console.error("Loading indicator element not found"); // Debug log
        return; // Exit if loading indicator doesn't exist
    }

    // Initialize progress bar
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    console.log("Progress bar element:", progressBar); // Debug log
    console.log("Progress text element:", progressText); // Debug log

    if (progressBar) {
        progressBar.style.width = '0%';
    }

    if (progressText) {
        progressText.textContent = '0%';
    }

    // Function to update progress with smooth animation
    function updateProgress(percentage) {
        if (progressBar) {
            progressBar.style.width = percentage + '%';
        }
        if (progressText) {
            progressText.textContent = percentage + '%';
        }
    }

    // Generate a new join code
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 16; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    // Add a random number to make it unique
    const randomNum = Math.floor(Math.random() * 1000000);
    currentJoinCode = result + '.' + randomNum;
    console.log("Generated join code:", currentJoinCode); // Debug log

    // Add to active codes
    activeJoinCodes.push(currentJoinCode);

    // Update the join code display on the host screen
    // We'll do this later after the loading completes
    const hostScreenElement = document.getElementById('host-screen');
    console.log("Host screen element:", hostScreenElement); // Debug log
    if (!hostScreenElement) {
        console.error("hostScreen element not found"); // Debug log

        // Hide loading indicator if host screen is not found
        if (loadingIndicator) {
            loadingIndicator.classList.add('hidden');
        }

        return; // Exit early if host screen doesn't exist
    }

    // Add the host to the players list
    addPlayerToList(currentUser ? currentUser.username : 'HOST');

    // Set game state to hosting
    gameState = 'hosting';
    console.log("Game state set to hosting"); // Debug log

    // Animate the progress to 100% over 1.5 seconds using setInterval for better reliability
    const duration = 1500; // 1.5 seconds
    const startTime = Date.now();
    const interval = 16; // ~60fps for smooth animation

    console.log("Starting progress animation"); // Debug log
    const progressInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progressPercentage = Math.min(100, (elapsed / duration) * 100);

        updateProgress(progressPercentage);

        if (progressPercentage >= 100) {
            console.log("Progress reached 100%"); // Debug log
            clearInterval(progressInterval);

            // At 100%, update the join code display and show the host screen
            const currentJoinCodeDisplay = document.getElementById('current-join-code');
            console.log("Current join code display element:", currentJoinCodeDisplay); // Debug log
            if (currentJoinCodeDisplay) {
                currentJoinCodeDisplay.textContent = currentJoinCode;
                console.log("Join code displayed:", currentJoinCode); // Debug log
            } else {
                console.error("currentJoinCodeDisplay element not found"); // Debug log
            }

            // Switch to host screen after progress completes
            const startScreenElement = document.getElementById('start-screen');
            if (startScreenElement) startScreenElement.classList.remove('active');
            hostScreenElement.classList.add('active');
            console.log("Host screen activated"); // Debug log

            // Hide loading indicator after a short delay to allow user to see completion
            setTimeout(() => {
                if (loadingIndicator) {
                    loadingIndicator.classList.add('hidden');
                    // Reset the message text and progress
                    const messageElement = loadingIndicator.querySelector('p');
                    if (messageElement) {
                        messageElement.textContent = "Preparing host session...";
                    }
                    if (progressBar) {
                        progressBar.style.width = '0%';
                    }
                    if (progressText) {
                        progressText.textContent = '0%';
                    }
                }
            }, 500); // Wait 500ms to show completion before hiding
        }
    }, interval);
}

// Add a player to the players list on the host screen
function addPlayerToList(username) {
    const playerItem = document.createElement('div');
    playerItem.className = 'player-item';

    const playerName = document.createElement('span');
    playerName.className = 'player-name';
    playerName.textContent = username;

    const playerStatus = document.createElement('span');
    playerStatus.className = 'player-status';
    playerStatus.textContent = 'Connected';

    playerItem.appendChild(playerName);
    playerItem.appendChild(playerStatus);
    playersList.appendChild(playerItem);
}

// Save a report to localStorage
function saveReport(report) {
    // Get existing reports or initialize an empty array
    const reports = JSON.parse(localStorage.getItem('reports') || '[]');

    // Add the new report
    reports.push(report);

    // Save back to localStorage
    localStorage.setItem('reports', JSON.stringify(reports));
}

// Load reports from localStorage and display them
function loadReports() {
    // Get reports from localStorage
    const reports = JSON.parse(localStorage.getItem('reports') || '[]');

    // Clear the reports list
    reportsList.innerHTML = '';

    // If no reports, show a message
    if (reports.length === 0) {
        reportsList.innerHTML = '<p>No reports yet.</p>';
        return;
    }

    // Add each report to the list
    reports.forEach(report => {
        const reportElement = document.createElement('div');
        reportElement.className = 'report-item';

        // Format the date for display
        const date = new Date(report.timestamp);
        const formattedDate = date.toLocaleString();

        reportElement.innerHTML = `
            <div class="report-item-header">
                <span>${report.type.toUpperCase()} - ${formattedDate}</span>
                <button class="delete-report-btn" data-id="${report.id}">DELETE</button>
            </div>
            <div class="report-item-content">${report.description}</div>
            <div class="report-item-email">Email: ${report.email}</div>
        `;

        reportsList.appendChild(reportElement);
    });

    // Add event listeners to delete buttons
    document.querySelectorAll('.delete-report-btn').forEach(button => {
        button.addEventListener('click', function() {
            const reportId = parseInt(this.getAttribute('data-id'));
            deleteReport(reportId);
        });
    });
}

// Delete a report by ID
function deleteReport(reportId) {
    // Get existing reports
    let reports = JSON.parse(localStorage.getItem('reports') || '[]');

    // Filter out the report with the specified ID
    reports = reports.filter(report => report.id !== reportId);

    // Save back to localStorage
    localStorage.setItem('reports', JSON.stringify(reports));

    // Reload the reports list
    loadReports();
}

// Show the join code input section
function showJoinCodeInput() {
    const joinCodeSection = document.getElementById('join-code-section');
    const joinCodeValidation = document.getElementById('join-code-validation');

    // Show the join code section
    joinCodeSection.classList.remove('hidden');

    // Hide any previous validation messages
    joinCodeValidation.classList.add('hidden');
    joinCodeValidation.classList.remove('error');
    joinCodeValidation.textContent = '';

    // Clear the input field
    const joinCodeInput = document.getElementById('join-code-input');
    joinCodeInput.value = '';

    // Focus on the input field
    joinCodeInput.focus();
}

// Validate the join code entered by the user
function validateJoinCode() {
    const joinCodeInput = document.getElementById('join-code-input');
    const joinCodeValidation = document.getElementById('join-code-validation');
    const enteredCode = joinCodeInput.value.trim();

    // Step 1: Scan for join codes
    // Step 2: When user types in a join code, scan for any matches
    const isValid = activeJoinCodes.includes(enteredCode);

    // Step 3: Report to user if valid or invalid
    if (isValid) {
        // Valid join code - add player to host's player list (if we could access it)
        // For demo purposes, we'll just start the game
        joinCodeValidation.classList.remove('hidden');
        joinCodeValidation.classList.remove('error');
        joinCodeValidation.textContent = 'VALID JOIN CODE. JUMPING TO GAME IN 3... 2... 1...';
        joinCodeValidation.style.color = '#00ff00'; // Green color for valid

        // Start countdown and then start the game
        setTimeout(() => {
            startGame();
        }, 3000); // 3 seconds for countdown
    } else {
        // Only show error for empty codes
        if (enteredCode === '') {
            // Invalid join code - show error message
            joinCodeValidation.classList.remove('hidden');
            joinCodeValidation.classList.add('error');
            joinCodeValidation.textContent = 'INVALID JOIN CODE PLEASE USE A VALID ONE.';
            joinCodeValidation.style.color = '#ff0000'; // Red color for error
        } else {
            // Invalid join code - show error message
            joinCodeValidation.classList.remove('hidden');
            joinCodeValidation.classList.add('error');
            joinCodeValidation.textContent = 'INVALID JOIN CODE PLEASE USE A VALID ONE.';
            joinCodeValidation.style.color = '#ff0000'; // Red color for error
        }
    }
}

// Clean up old join codes periodically to prevent memory issues
function cleanupJoinCodes() {
    // In a real implementation, you might want to remove codes that are older than a certain time
    // For now, we'll just keep the last 100 codes
    if (activeJoinCodes.length > 100) {
        activeJoinCodes = activeJoinCodes.slice(-100); // Keep only the last 100 codes
    }
}