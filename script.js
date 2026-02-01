// Game variables
console.log('TYPE game script loading...');
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

// Versioning
const LATEST_VERSION = '3.0';
const LATEST_VERSION_DISPLAY = 'TYPEos 3.0';
const GUEST_SETTINGS_KEY = 'guestSettings';

// DOM elements
let startScreen;
let gameScreen;
let gameOverScreen;
let startButton;
let restartButton;
let scoreValue;
let levelValue;
let wpmValue;
let accuracyValue;
let finalScore;
let finalLevel;
let peakWpm;
let finalAccuracy;
let wordInput;
let asteroidField;
let bulletContainer;
let powerupContainer;
let storeScreen;
let profileScreen;

let livesContainer; // Declare livesContainer variable to be initialized after DOM load
let playersList;
let adminPanel;
let reportsList;
let hostScreen;
let helpCenterScreen;
let updatesScreen;
let settingsScreen;

// Settings screen elements
let settingsButton;
let settingsBackButton;
let uploadPictureBtn;
let removePictureBtn;
let profilePictureInput;
let profilePictureImg;
let profilePicturePlaceholder;
let soundToggle;
let musicToggle;
let difficultySelect;
let typingSensitivity;
let sensitivityValue;
let usernameChange;
let updateUsernameBtn;
let passwordChange;
let updatePasswordBtn;
let saveSettingsBtn;
let resetSettingsBtn;

// Game UI elements
let inGameMusicToggle;
let startDifficultySelect;

// Audio elements
let backgroundMusic;
let currentTrackIndex = 0;
const musicTracks = [
    'assets/Jingle_Bells_Full.mp3',
    'assets/Twelve_Days_of_Christmas_Full_Instrumental.mp3'
];
let isMusicPlaying = false;
let musicEnabled = true;
let isGamePaused = false;

// Sound effects system
let audioContext;
let gainNode;
let soundEnabled = true;

// Sound effect parameters
const soundEffects = {
    typing: { frequency: 800, duration: 0.1, type: 'sine' },
    asteroidHit: { frequency: 300, duration: 0.3, type: 'square' },
    bulletFire: { frequency: 600, duration: 0.05, type: 'sawtooth' },
    powerupCollect: { frequency: 1000, duration: 0.2, type: 'triangle' },
    lifeLost: { frequency: 200, duration: 0.5, type: 'sawtooth' },
    error: { frequency: 400, duration: 0.2, type: 'square' },
    levelUp: { frequency: 1200, duration: 0.3, type: 'sine' },
    gameOver: { frequency: 150, duration: 1.0, type: 'sawtooth' }
};

// User authentication and data
let currentUser = null;

// Multiplayer join code variables
let activeJoinCodes = []; // Store active join codes
let currentJoinCode = null; // Store the current join code for this session

// Initialize game
document.addEventListener('DOMContentLoaded', () => {
    try {
        console.log('DOMContentLoaded: Initializing game...');
    const startBtn = document.getElementById('start-button');
    const restartBtn = document.getElementById('restart-button');
    const competeFriendsBtn = document.getElementById('compete-friends-button');
    const enterCodeBtn = document.getElementById('enter-code-button');
    const joinCodeSection = document.getElementById('join-code-section');
    const joinCodeInput = document.getElementById('join-code-input');
    const joinCodeSubmit = document.getElementById('join-code-submit');
    const joinCodeValidation = document.getElementById('join-code-validation');

    // Host screen elements
    hostScreen = document.getElementById('host-screen');
    const currentJoinCodeDisplay = document.getElementById('current-join-code');
    playersList = document.getElementById('players-list');
    const startGameButton = document.getElementById('start-game-button');
    const endGameButton = document.getElementById('end-game-button');
    const playerNameInput = document.getElementById('player-name-input');
    const addPlayerButton = document.getElementById('add-player-button');
    const copyJoinCodeButton = document.getElementById('copy-join-code-button');

    // Help Center elements
    const helpCenterButton = document.getElementById('help-center-button');
    const updatesButton = document.getElementById('updates-button');
    helpCenterScreen = document.getElementById('help-center-screen');
    updatesScreen = document.getElementById('updates-screen');
    settingsScreen = document.getElementById('settings-screen');
    settingsButton = document.getElementById('settings-button');
    settingsBackButton = document.getElementById('settings-back-button');
    uploadPictureBtn = document.getElementById('upload-picture-btn');
    removePictureBtn = document.getElementById('remove-picture-btn');
    profilePictureInput = document.getElementById('profile-picture-input');
    profilePictureImg = document.getElementById('profile-picture-img');
    profilePicturePlaceholder = document.getElementById('profile-picture-placeholder');
    
    // Set up profile picture error handling
    if (profilePictureImg) {
        profilePictureImg.onerror = function() {
            console.error('Failed to load profile picture');
            profilePictureImg.style.display = 'none';
            if (profilePicturePlaceholder) {
                profilePicturePlaceholder.style.display = 'block';
            }
            // Clear corrupted image data from settings
            if (currentUser && currentUser.settings) {
                delete currentUser.settings.profilePicture;
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
                // Also update users object
                const users = JSON.parse(localStorage.getItem('users') || '{}');
                const userData = users[currentUser.username];
                if (userData && userData.settings) {
                    delete userData.settings.profilePicture;
                    localStorage.setItem('users', JSON.stringify(users));
                }
            }
        };
    }
    soundToggle = document.getElementById('sound-toggle');
    musicToggle = document.getElementById('settings-music-toggle');
    difficultySelect = document.getElementById('difficulty-select');
    startDifficultySelect = document.getElementById('difficulty');
    typingSensitivity = document.getElementById('typing-sensitivity');
    sensitivityValue = document.getElementById('sensitivity-value');
    usernameChange = document.getElementById('username-change');
    updateUsernameBtn = document.getElementById('update-username-btn');
    passwordChange = document.getElementById('password-change');
    updatePasswordBtn = document.getElementById('update-password-btn');
    saveSettingsBtn = document.getElementById('save-settings-btn');
    resetSettingsBtn = document.getElementById('reset-settings-btn');
    const helpCenterBackButton = document.getElementById('help-center-back-button');
    const updatesBackButton = document.getElementById('updates-back-button');
    const checkUpdatesButton = document.getElementById('check-updates-button');
    const updateNowBtnScreen = document.getElementById('update-now-btn-screen');
    const updateLaterBtnScreen = document.getElementById('update-later-btn-screen');
    const reportForm = document.getElementById('report-form');
    const reportType = document.getElementById('report-type');
    const reportDescription = document.getElementById('report-description');
    const reportEmail = document.getElementById('report-email');
    const adminPassword = document.getElementById('admin-password');
    const adminLoginBtn = document.getElementById('admin-login-btn');
    adminPanel = document.getElementById('admin-panel');
    reportsList = document.getElementById('reports-list');

    // Loading indicator elements
    const loadingBackButton = document.getElementById('loading-back-button');

    // Initialize livesContainer after DOM has loaded
    livesContainer = document.getElementById('lives-container');
    startScreen = document.getElementById('start-screen');
    gameScreen = document.getElementById('game-screen');
    gameOverScreen = document.getElementById('game-over-screen');
    startButton = document.getElementById('start-button');
    restartButton = document.getElementById('restart-button');
    scoreValue = document.getElementById('score-value');
    levelValue = document.getElementById('level-value');
    wpmValue = document.getElementById('wpm-value');
    accuracyValue = document.getElementById('accuracy-value');
    finalScore = document.getElementById('final-score');
    finalLevel = document.getElementById('final-level');
    peakWpm = document.getElementById('peak-wpm');
    finalAccuracy = document.getElementById('final-accuracy');
    asteroidField = document.getElementById('asteroid-field');
    bulletContainer = document.getElementById('bullet-container');
    powerupContainer = document.getElementById('powerup-container');
    storeScreen = document.getElementById('store-screen');
    wordInput = document.getElementById('word-input');

    // Validate critical DOM elements
    const requiredElements = {
        startScreen, gameScreen, gameOverScreen, wordInput, asteroidField,
        bulletContainer, powerupContainer, storeScreen, livesContainer
    };
    for (const [name, element] of Object.entries(requiredElements)) {
        if (!element) {
            console.error(`Critical DOM element not found: ${name}`);
        }
    }
    console.log('DOM elements assigned successfully');

    // Initialize music elements
    inGameMusicToggle = document.getElementById('music-toggle');
    const volumeSlider = document.getElementById('volume-slider');
    const pauseButton = document.getElementById('pause-button');

    startBtn.addEventListener('click', startGame);
    restartBtn.addEventListener('click', startGame);
    wordInput.addEventListener('keydown', handleInput);

    // Main menu shop button
    const shopMainMenuButton = document.getElementById('shop-button-main-menu');
    shopMainMenuButton.addEventListener('click', () => {
        // If user is not logged in, show auth screen first
        if (!currentUser) {
            startScreen.classList.remove('active');
            document.getElementById('auth-screen').classList.add('active');
            gameState = 'start';
            return;
        }

        // Store the previous game state to return to the start screen
        window.previousGameState = 'start';

        // Navigate to profile screen first, then to store
        startScreen.classList.remove('active');
        document.getElementById('profile-screen').classList.add('active');

        // Then navigate to store screen
        showStoreScreen();
    });


    // Multiplayer functionality
    competeFriendsBtn.addEventListener('click', showHostScreen);

    // Initialize player list with current user
    if (currentUser) {
        addPlayerToList(currentUser.username);
    }

    // Add event listener for start game button to handle countdown
        startGameButton.addEventListener('click', () => {
            // Start a 3-2-1 countdown before starting the game
            const countdownElement = document.getElementById('countdown');
            if (countdownElement) {
                countdownElement.style.display = 'block';
                let count = 3;

                const countdownInterval = setInterval(() => {
                    countdownElement.textContent = count;
                    count--;

                    if (count < 0) {
                        clearInterval(countdownInterval);
                        countdownElement.style.display = 'none';

                        // Start the game after countdown
                        startGame();
                    }
                }, 1000);
            } else {
                // If countdown element doesn't exist, just start the game
                startGame();
            }
        });

    enterCodeBtn.addEventListener('click', showJoinCodeInput);
    joinCodeSubmit.addEventListener('click', validateJoinCode);

    // Host screen functionality

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

    // Copy join code button functionality
    copyJoinCodeButton.addEventListener('click', copyJoinCodeToClipboard);

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

    // Updates functionality
    updatesButton.addEventListener('click', () => {
        startScreen.classList.remove('active');
        updatesScreen.classList.add('active');
        gameState = 'updates';
        // Update version display
        updateVersionDisplay();
        // Check for updates automatically
        checkForUpdates();
    });

    updatesBackButton.addEventListener('click', () => {
        updatesScreen.classList.remove('active');
        startScreen.classList.add('active');
        gameState = 'start';
    });

    checkUpdatesButton.addEventListener('click', checkForUpdates);

    if (updateNowBtnScreen) {
        updateNowBtnScreen.addEventListener('click', updateToLatestVersion);
    }

    if (updateLaterBtnScreen) {
        updateLaterBtnScreen.addEventListener('click', () => {
            document.getElementById('update-available-section').classList.add('hidden');
        });
    }

    // Settings screen navigation
    if (settingsButton) {
        settingsButton.addEventListener('click', showSettingsScreen);
    }
    if (settingsBackButton) {
        settingsBackButton.addEventListener('click', hideSettingsScreen);
    }
    if (uploadPictureBtn) {
        uploadPictureBtn.addEventListener('click', () => profilePictureInput.click());
    }
    if (profilePictureInput) {
        profilePictureInput.addEventListener('change', handleProfilePictureUpload);
    }
    if (removePictureBtn) {
        removePictureBtn.addEventListener('click', removeProfilePicture);
    }
    if (typingSensitivity) {
        typingSensitivity.addEventListener('input', updateSensitivityValue);
    }
    if (updateUsernameBtn) {
        updateUsernameBtn.addEventListener('click', updateUsername);
    }
    if (updatePasswordBtn) {
        updatePasswordBtn.addEventListener('click', updatePassword);
    }
    if (saveSettingsBtn) {
        saveSettingsBtn.addEventListener('click', saveSettings);
    }
    if (resetSettingsBtn) {
        resetSettingsBtn.addEventListener('click', resetSettings);
    }
    // Load settings when settings screen is shown
    // (handled in showSettingsScreen function)

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

        // Also update the admin panel if it's currently visible
        if (adminPanel && !adminPanel.classList.contains('hidden')) {
            loadReports();
        }

        // Ensure the help center screen is still active after submitting report
        helpCenterScreen.classList.add('active');
        startScreen.classList.remove('active');
        gameState = 'help';
    });

    // Admin login
    adminLoginBtn.addEventListener('click', () => {
        const password = adminPassword.value;
        if (password === '771122') {
            console.log('Admin login successful');
            
            // Ensure we have fresh references to DOM elements
            adminPanel = document.getElementById('admin-panel');
            reportsList = document.getElementById('reports-list');
            
            console.log('adminPanel found:', !!adminPanel);
            console.log('reportsList found:', !!reportsList);
            
            adminPanel.classList.remove('hidden');
            adminPassword.value = ''; // Clear password field
            
            // Load existing reports after successful authentication
            loadReports();

            // Ensure the admin panel is properly secured - add additional security measures
            // Add a timestamp to track when the admin session started
            window.adminSessionStart = Date.now();

            // Add a timeout for admin session (30 minutes)
            setTimeout(() => {
                if (adminPanel && !adminPanel.classList.contains('hidden')) {
                    adminPanel.classList.add('hidden');
                    alert('Admin session expired. Please log in again.');
                }
            }, 30 * 60 * 1000); // 30 minutes
        } else {
            alert('Incorrect password. Access denied.');
        }
    });

    // Loading back button functionality
    loadingBackButton.addEventListener('click', () => {
        // Clear any existing timers
        if (window.hostScreenTimer) {
            clearTimeout(window.hostScreenTimer);
        }
        // Clear update progress interval if it exists
        if (window.updateProgressInterval) {
            clearInterval(window.updateProgressInterval);
            window.updateProgressInterval = null;
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
    inGameMusicToggle.addEventListener('click', toggleMusic);
    volumeSlider.addEventListener('input', updateVolume);
    // Set initial music button appearance
    updateMusicButtonAppearance();

    // Game pause/resume controls
    pauseButton.addEventListener('click', function() {
        console.log('Pause button clicked, gameState:', gameState, 'isGamePaused:', isGamePaused);
        togglePause();
    });

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

    // Add event listeners for authentication elements
    loginButton.addEventListener('click', handleLogin);
    signupButton.addEventListener('click', handleSignup);
    showSignupLink.addEventListener('click', showSignupForm);
    showLoginLink.addEventListener('click', showLoginForm);

    // Add form submission handlers to prevent default behavior
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        handleLogin();
    });

    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        handleSignup();
    });

    // Logo click handlers for fullscreen viewing
    const authLogos = document.querySelectorAll('.auth-logo');
    authLogos.forEach(logo => {
        logo.addEventListener('click', (e) => {
            e.preventDefault();
            const imageSrc = logo.getAttribute('src');
            const altText = logo.getAttribute('alt') || logo.getAttribute('title') || 'Logo';
            showImageModal(imageSrc, altText);
        });
    });

    // Profile screen elements
    profileScreen = document.getElementById('profile-screen');
    const viewProfileButton = document.getElementById('view-profile');
    const backToGameButton = document.getElementById('back-to-game');
    const logoutButton = document.getElementById('logout-button');



    // Profile controls
    viewProfileButton.addEventListener('click', showProfileScreen);
    
    // View profile button on start screen
    const viewProfileStartButton = document.getElementById('view-profile-start');
    if (viewProfileStartButton) {
        viewProfileStartButton.addEventListener('click', () => {
            console.log('View Profile button clicked from start screen');
            // If user is not logged in, show auth screen first
            if (!currentUser) {
                console.log('No current user, redirecting to auth');
                startScreen.classList.remove('active');
                document.getElementById('auth-screen').classList.add('active');
                gameState = 'start';
                return;
            }

            // Store the previous game state to return to the start screen
            window.previousGameState = 'start';

            // Navigate to profile screen
            console.log('Showing profile screen for user:', currentUser.username);
            startScreen.classList.remove('active');
            showProfileScreen();
        });
    } else {
        console.error('View Profile Start button not found!');
    }
    
    // Settings button on start screen
    const settingsStartButton = document.getElementById('settings-button-start');
    if (settingsStartButton) {
        settingsStartButton.addEventListener('click', () => {
            console.log('Settings button clicked from start screen');
            // Store the previous game state to return to the start screen
            window.previousGameState = 'start';
            
            // Navigate to settings screen (works for both logged in and guest users)
            console.log('Showing settings screen');
            startScreen.classList.remove('active');
            showSettingsScreen();
        });
    } else {
        console.error('Settings Start button not found!');
    }
    
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
        gameState = window.previousGameState || 'start';
    });

    backToGameFromStoreButton.addEventListener('click', () => {
        storeScreen.classList.remove('active');
        // If the previous game state was start or game over, we should go back to that screen
        if (window.previousGameState === 'start' || window.previousGameState === 'gameOver') {
            if (window.previousGameState === 'start') {
                startScreen.classList.add('active');
            } else {
                gameOverScreen.classList.add('active');
            }
            gameState = window.previousGameState;
        } else {
            // Otherwise, go back to the game screen
            gameScreen.classList.add('active');
            gameState = window.previousGameState || 'playing';

            // Check if the game was paused when we went to the shop
            if (window.wasGamePausedWhenGoingToShop) {
                // If the game was paused when going to the shop, keep it paused
                // Ensure the pause UI is shown
                isGamePaused = true;
                const pauseButton = document.getElementById('pause-button');
                const pauseOverlay = document.getElementById('pause-overlay');

                if (pauseButton) {
                    pauseButton.textContent = '▶️'; // Play symbol
                    pauseButton.title = 'Resume Game';
                }

                if (pauseOverlay) {
                    pauseOverlay.classList.add('active');
                }

                // Make sure game intervals are cleared when game remains paused
                clearInterval(gameInterval);
                if (spawnInterval) {
                    clearInterval(spawnInterval);
                }
                if (powerupSpawnInterval) {
                    clearInterval(powerupSpawnInterval);
                }
            } else {
                // If the game was not paused when going to the shop, ensure it's running
                isGamePaused = false;

                // Resume the game
                clearInterval(gameInterval);
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

                // Ensure the pause UI is hidden
                const pauseButton = document.getElementById('pause-button');
                const pauseOverlay = document.getElementById('pause-overlay');

                if (pauseButton) {
                    pauseButton.textContent = '⏸️'; // Pause symbol
                    pauseButton.title = 'Pause Game';
                }

                if (pauseOverlay) {
                    pauseOverlay.classList.remove('active');
                }

                // Resume background music if it was playing
                if (isMusicPlaying && backgroundMusic) {
                    backgroundMusic.play().catch(e => console.log("Audio play error:", e));
                }
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
        // Check version first - require TYPEos 3.0 for store
        if (!checkVersionForFeatureAccess()) {
            return; // User needs to update, exit early
        }
        
        // If on start screen or game over screen, go to profile first, then shop
        if (gameState === 'start' || gameState === 'gameOver') {
            if (currentUser) {
                // Store the previous game state to return to it later
                window.previousGameState = gameState;
                // Switch to profile screen first, then shop
                if (gameState === 'start') {
                    startScreen.classList.remove('active');
                    document.getElementById('profile-screen').classList.add('active');
                } else {
                    gameOverScreen.classList.remove('active');
                    document.getElementById('profile-screen').classList.add('active');
                }
                // Then switch to store
                document.getElementById('profile-screen').classList.remove('active');
                storeScreen.classList.add('active');
                gameState = 'shop';
            }
        } else {
            // If in gameplay, handle the shop access
            if (gameState === 'playing') {
                // Store the previous game state and pause status to return to it later
                window.previousGameState = 'playing';
                // Store whether the game was paused when going to the shop
                window.wasGamePausedWhenGoingToShop = isGamePaused;

                // If the game is currently running, we need to pause it
                if (!isGamePaused) {
                    // Pause the game by calling togglePause without changing the pause state
                    // We'll manually pause the game here
                    isGamePaused = true;

                    // Pause the game
        console.log('Clearing gameInterval:', gameInterval);
        clearInterval(gameInterval);
        if (spawnInterval) {
            console.log('Clearing spawnInterval:', spawnInterval);
            clearInterval(spawnInterval);
        }
                    if (powerupSpawnInterval) {
                        clearInterval(powerupSpawnInterval);
                    }

                    // Track when the game was paused
                    lastPauseTime = Date.now();

                    // Update button text
                    const pauseButton = document.getElementById('pause-button');
                    if (pauseButton) {
                        pauseButton.textContent = '▶️'; // Play symbol
                        pauseButton.title = 'Resume Game';
                    }

                    // Show pause overlay
                    const pauseOverlay = document.getElementById('pause-overlay');
                    if (pauseOverlay) {
                        pauseOverlay.classList.add('active');
                    }

                    // Pause background music
                    if (backgroundMusic && !backgroundMusic.paused) {
                        backgroundMusic.pause();
                    }
                }
            } else {
                // For any other state, store it as the previous state
                window.previousGameState = gameState;
            }

            // Show store screen
            gameScreen.classList.remove('active');
            storeScreen.classList.add('active');
            gameState = 'shop';
        }

        // Ensure the store screen is properly displayed
        storeScreen.classList.add('active');
        gameScreen.classList.remove('active');

        // Update power-up counts in store
        updatePowerupCounts();
    });

    // Add resume button event listener
    const resumeButton = document.getElementById('resume-button');
    resumeButton.addEventListener('click', function() {
        console.log('Resume button clicked, gameState:', gameState, 'isGamePaused:', isGamePaused);
        togglePause();
    });

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
                console.log('Enter key pressed to resume, gameState:', gameState, 'isGamePaused:', isGamePaused);
                togglePause();
            }
        }

        // Add P key to pause/resume during gameplay
        if (event.key === 'p' || event.key === 'P') {
            console.log('P key pressed, gameState:', gameState, 'isGamePaused:', isGamePaused);
            if (gameState === 'playing') {
                togglePause();
            }
        }
    });

    // Initialize global state variables to prevent conflicts
    window.previousGameState = null;
    window.wasGamePausedWhenGoingToShop = false;

    // Global error handling
    window.addEventListener('error', (event) => {
        console.error('Global error caught:', event.error || event.message, 'at', event.filename, ':', event.lineno);
    });
    window.addEventListener('unhandledrejection', (event) => {
        console.error('Unhandled promise rejection:', event.reason);
    });

    // Check if user is already logged in
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        showStartScreen();
        // Apply user settings for auto-logged in user
        applySettings();
    } else {
        // Apply guest settings if any
        applySettings();
    }

    // Check for updates
    checkForUpdates();
} catch (error) {
    console.error('Error during initialization:', error);
}
});

// Function to check for updates
function checkForUpdates() {
    // Get current version from currentUser if logged in, else localStorage, default to 1.0
    let currentVersion = '1.0';
    if (currentUser && currentUser.version) {
        currentVersion = currentUser.version;
    } else {
        currentVersion = localStorage.getItem('gameVersion') || '1.0';
    }
    console.log('checkForUpdates: currentVersion=', currentVersion, 'LATEST_VERSION=', LATEST_VERSION);

    // Check if there's a new version available
    if (currentVersion !== LATEST_VERSION) {
        // Show update notification
        showUpdateNotification(currentVersion, LATEST_VERSION);
    }
    // Update version display in updates screen
    updateVersionDisplay();
}

// Function to update version display in updates screen
function updateVersionDisplay() {
    let currentVersion = '1.0';
    if (currentUser && currentUser.version) {
        currentVersion = currentUser.version;
    } else {
        currentVersion = localStorage.getItem('gameVersion') || '1.0';
    }
    const versionDisplay = document.getElementById('current-version-display');
    if (versionDisplay) {
        versionDisplay.textContent = currentVersion;
    }
    // Also show/hide update available section based on version
    const updateAvailableSection = document.getElementById('update-available-section');
    if (updateAvailableSection) {
        if (currentVersion !== LATEST_VERSION) {
            updateAvailableSection.classList.remove('hidden');
        } else {
            updateAvailableSection.classList.add('hidden');
        }
    }
}

// Helper function to check if user is on the latest version
// Returns true if on latest version, false otherwise
// If not on latest version, redirects to updates screen
function checkVersionForFeatureAccess() {
    let currentVersion = '1.0';
    if (currentUser && currentUser.version) {
        currentVersion = currentUser.version;
    } else {
        currentVersion = localStorage.getItem('gameVersion') || '1.0';
    }
    
    if (currentVersion !== LATEST_VERSION) {
        // Redirect to updates screen
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        if (updatesScreen) {
            updatesScreen.classList.add('active');
            gameState = 'updates';
            updateVersionDisplay();
            checkForUpdates();
            
            // Show a message about the required update
            setTimeout(() => {
                alert(`This feature requires ${LATEST_VERSION_DISPLAY}. Please update to continue.`);
            }, 100);
        }
        return false;
    }
    return true;
}

// Function to show update notification
function showUpdateNotification(currentVersion, latestVersion) {
    // Create update notification element if it doesn't exist
    let updateNotification = document.getElementById('update-notification');
    if (!updateNotification) {
        updateNotification = document.createElement('div');
        updateNotification.id = 'update-notification';
        updateNotification.className = 'update-notification';
        updateNotification.innerHTML = `
            <div class="update-content">
                <h3>🎉 New Version Available!</h3>
                <p>Version ${latestVersion} is now available with settings and profile picture management!</p>
                <div class="update-buttons">
                    <button id="update-now-btn">Update Now</button>
                    <button id="update-later-btn">Update Later</button>
                </div>
            </div>
        `;

        // Add to start screen
        const startScreen = document.getElementById('start-screen');
        if (startScreen) {
            startScreen.appendChild(updateNotification);
        }

        // Add event listeners to buttons - determine which update function to call based on latestVersion
        document.getElementById('update-now-btn').addEventListener('click', () => {
            if (latestVersion === '2.0') {
                updateToVersion2();
            } else if (latestVersion === '3.0') {
                updateToVersion3();
            }
        });
        document.getElementById('update-later-btn').addEventListener('click', () => {
            updateNotification.style.display = 'none';
            // Store that user chose to update later
            localStorage.setItem('updateLater', 'true');
        });
    }

    // Show the notification
    updateNotification.style.display = 'block';
}

// Function to update to version 2.0
function updateToVersion2() {
    // Clear any existing update progress interval
    if (window.updateProgressInterval) {
        clearInterval(window.updateProgressInterval);
        window.updateProgressInterval = null;
    }

    // Show loading indicator
    const loadingIndicator = document.getElementById('loading-indicator');
    if (loadingIndicator) {
        loadingIndicator.classList.remove('hidden');
        // Update the text to show updating message
        const statusText = loadingIndicator.querySelector('p:first-of-type');
        if (statusText) {
            statusText.textContent = 'Updating to TYPEos 2.0...';
        }
    }

    // Get progress elements
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    const countdownText = document.getElementById('countdown-text');
    
    // Reset progress
    let progress = 0;
    const totalSeconds = 100;
    let secondsRemaining = totalSeconds;
    
    if (progressBar) {
        progressBar.style.width = '0%';
    }
    if (progressText) {
        progressText.textContent = '0%';
    }
    if (countdownText) {
        countdownText.textContent = `${secondsRemaining} second${secondsRemaining !== 1 ? 's' : ''} remaining`;
    }

    // Start progress interval - update every 1000ms (1 second)
    window.updateProgressInterval = setInterval(() => {
        progress += 1;
        secondsRemaining = totalSeconds - progress;
        
        // Update progress bar
        if (progressBar) {
            progressBar.style.width = `${progress}%`;
        }
        
        // Update progress text
        if (progressText) {
            progressText.textContent = `${progress}%`;
        }
        
        // Update countdown text
        if (countdownText) {
        countdownText.textContent = `${secondsRemaining} second${secondsRemaining !== 1 ? 's' : ''} remaining`;
        }
        
        // Check if update is complete
        if (progress >= 100) {
            clearInterval(window.updateProgressInterval);
            window.updateProgressInterval = null;
            
            // Update version in localStorage and user object
            localStorage.setItem('gameVersion', '2.0');
            if (currentUser && currentUser.username) {
                // Update currentUser object
                currentUser.version = '2.0';
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
                // Update users object
                const users = JSON.parse(localStorage.getItem('users') || '{}');
                if (users[currentUser.username]) {
                    users[currentUser.username].version = '2.0';
                    localStorage.setItem('users', JSON.stringify(users));
                }
            }

            // Hide update notification
            const updateNotification = document.getElementById('update-notification');
            if (updateNotification) {
                updateNotification.style.display = 'none';
            }

            // Hide loading indicator
            if (loadingIndicator) {
                loadingIndicator.classList.add('hidden');
            }

            // Show success message
            alert('Successfully updated to TYPEos 2.0! Enjoy the improved performance!');

            // Reload the page to apply changes
            location.reload();
        }
    }, 1000); // Update every second (1000ms)
}

// Function to update to version 3.0
function updateToVersion3() {
    console.log('updateToVersion3 called, starting migration...');
    // Clear any existing update progress interval
    if (window.updateProgressInterval) {
        clearInterval(window.updateProgressInterval);
        window.updateProgressInterval = null;
    }

    // Show loading indicator
    const loadingIndicator = document.getElementById('loading-indicator');
    if (loadingIndicator) {
        loadingIndicator.classList.remove('hidden');
        // Update the text to show updating message
        const statusText = loadingIndicator.querySelector('p:first-of-type');
        if (statusText) {
            statusText.textContent = 'Updating to TYPEos 3.0...';
        }
    }

    // Migrate existing user data to include scoreHistory, settings, and gamesPlayed
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    let migratedCount = 0;
    for (const username in users) {
        const user = users[username];
        let needsUpdate = false;
        
        // Ensure scoreHistory exists
        if (!user.scoreHistory) {
            user.scoreHistory = [];
            needsUpdate = true;
        }
        
        // Ensure settings exists with defaults
        if (!user.settings) {
            user.settings = {
                soundEnabled: true,
                musicEnabled: true,
                difficulty: 'medium',
                typingSensitivity: 5
            };
            needsUpdate = true;
        }
        
        // Ensure gamesPlayed exists
        if (user.gamesPlayed === undefined) {
            user.gamesPlayed = 0;
            needsUpdate = true;
        }
        
        if (needsUpdate) {
            users[username] = user;
            migratedCount++;
        }
    }
    if (migratedCount > 0) {
        localStorage.setItem('users', JSON.stringify(users));
        console.log(`Migrated ${migratedCount} user(s) to version 3.0 data structure`);
    }

    // Get progress elements
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    const countdownText = document.getElementById('countdown-text');
    
    // Reset progress
    let progress = 0;
    const totalSeconds = 100;
    let secondsRemaining = totalSeconds;
    
    if (progressBar) {
        progressBar.style.width = '0%';
    }
    if (progressText) {
        progressText.textContent = '0%';
    }
    if (countdownText) {
        countdownText.textContent = `${secondsRemaining} second${secondsRemaining !== 1 ? 's' : ''} remaining`;
    }

    // Start progress interval - update every 1000ms (1 second)
    window.updateProgressInterval = setInterval(() => {
        progress += 1;
        secondsRemaining = totalSeconds - progress;
        
        // Update progress bar
        if (progressBar) {
            progressBar.style.width = `${progress}%`;
        }
        
        // Update progress text
        if (progressText) {
            progressText.textContent = `${progress}%`;
        }
        
        // Update countdown text
        if (countdownText) {
        countdownText.textContent = `${secondsRemaining} second${secondsRemaining !== 1 ? 's' : ''} remaining`;
        }
        
        // Check if update is complete
        if (progress >= 100) {
            clearInterval(window.updateProgressInterval);
            window.updateProgressInterval = null;
            
            // Update version in localStorage and user object
            localStorage.setItem('gameVersion', '3.0');
            if (currentUser && currentUser.username) {
                // Update currentUser object
                currentUser.version = '3.0';
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
                // Update users object
                const users = JSON.parse(localStorage.getItem('users') || '{}');
                if (users[currentUser.username]) {
                    users[currentUser.username].version = '3.0';
                    localStorage.setItem('users', JSON.stringify(users));
                }
            }

            // Hide update notification
            const updateNotification = document.getElementById('update-notification');
            if (updateNotification) {
                updateNotification.style.display = 'none';
            }

            // Hide loading indicator
            if (loadingIndicator) {
                loadingIndicator.classList.add('hidden');
            }

            // Show success message
            alert('Successfully updated to TYPEos 3.0! Enjoy new settings and profile picture management!');

            // Reload the page to apply changes
            location.reload();
        }
    }, 1000); // Update every second (1000ms)
}

// Show signup form
// Function to update to the latest version
function updateToLatestVersion() {
    console.log('updateToLatestVersion called, LATEST_VERSION:', LATEST_VERSION);
    alert('Starting update to ' + LATEST_VERSION_DISPLAY + '...');
    if (LATEST_VERSION === '2.0') {
        updateToVersion2();
    } else if (LATEST_VERSION === '3.0') {
        updateToVersion3();
    }
}

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

// Handle user signup with device restriction logic with device restriction logic
function handleSignup() {
    // Get or generate device ID
    let currentDeviceID = localStorage.getItem('deviceID');
    if (!currentDeviceID) {
        currentDeviceID = generateDeviceID();
        localStorage.setItem('deviceID', currentDeviceID);
    }

    // Rest of the signup logic follows

// Show the message immediately after signup
alert('THIS ACCOUNT CAN ONLY BE LOGGED IN IN THIS DEVICE');
// Store device ID
localStorage.setItem('deviceID', currentDeviceID);
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
        scoreHistory: [],
        version: '1.0',
        registrationDate: new Date().toISOString(),
        settings: {
            soundEnabled: true,
            musicEnabled: true,
            difficulty: 'medium',
            typingSensitivity: 5
        }
    };

    localStorage.setItem('users', JSON.stringify(users));

    // Login the new user
    currentUser = {
        username: username,
        bestScore: 0,
        bestWpm: 0,
        shieldCount: 0,
        doubleDamageCount: 0,
        slowMotionCount: 0,
        scoreHistory: [],
        version: '1.0',
        settings: {
            soundEnabled: true,
            musicEnabled: true,
            difficulty: 'medium',
            typingSensitivity: 5
        }
    };
    localStorage.setItem('currentUser', JSON.stringify(currentUser));

    // Initialize global state variables to prevent conflicts after signup
    window.previousGameState = null;
    window.wasGamePausedWhenGoingToShop = false;

    // Switch to start screen
    showStartScreen();
    updatePowerupCounts();
    
    // Apply user settings
    applySettings();
}

// Handle user login with device restriction check with device restriction check with device restriction check with device restriction check with device restriction check
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

    // Ensure user has version field (backward compatibility)
    if (user.version === undefined) {
        user.version = localStorage.getItem('gameVersion') || '1.0';
        users[username] = user;
        localStorage.setItem('users', JSON.stringify(users));
    }

    // Ensure user has required fields for version 3.0
    let needsUpdate = false;
    if (!user.scoreHistory) {
        user.scoreHistory = [];
        needsUpdate = true;
    }
    if (!user.settings) {
        user.settings = {
            soundEnabled: true,
            musicEnabled: true,
            difficulty: 'medium',
            typingSensitivity: 5
        };
        needsUpdate = true;
    }
    if (user.gamesPlayed === undefined) {
        user.gamesPlayed = 0;
        needsUpdate = true;
    }
    if (needsUpdate) {
        users[username] = user;
        localStorage.setItem('users', JSON.stringify(users));
        console.log('Migrated user data for', username);
    }

    // Login successful
    currentUser = {
        username: username,
        bestScore: user.bestScore || 0,
        bestWpm: user.bestWpm || 0,
        shieldCount: user.shieldCount || 0,
        doubleDamageCount: user.doubleDamageCount || 0,
        slowMotionCount: user.slowMotionCount || 0,
        scoreHistory: user.scoreHistory || [],
        version: user.version || '1.0',
        settings: user.settings || {
            soundEnabled: true,
            musicEnabled: true,
            difficulty: 'medium',
            typingSensitivity: 5
        }
    };
    localStorage.setItem('currentUser', JSON.stringify(currentUser));

    // Update UI with user stats
    updateStartScreenUserInfo();
    updatePowerupCounts();

    // Initialize global state variables to prevent conflicts after login
    window.previousGameState = null;
    window.wasGamePausedWhenGoingToShop = false;

    // Switch to start screen
    showStartScreen();
    
    // Apply user settings
    applySettings();
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
        gameState = 'playing';
        // If game was paused when going to the shop, ensure it stays paused
        if (window.wasGamePausedWhenGoingToShop) {
            // Make sure the game remains paused
            isGamePaused = true;
            const pauseButton = document.getElementById('pause-button');
            const pauseOverlay = document.getElementById('pause-overlay');

            if (pauseButton) {
                pauseButton.textContent = '▶️'; // Play symbol
                pauseButton.title = 'Resume Game';
            }

            if (pauseOverlay) {
                pauseOverlay.classList.add('active');
            }

            // Make sure game intervals are cleared when game remains paused
            clearInterval(gameInterval);
            if (spawnInterval) {
                clearInterval(spawnInterval);
            }
            if (powerupSpawnInterval) {
                clearInterval(powerupSpawnInterval);
            }
        } else {
            // If game was not paused when going to the shop, ensure it's running
            isGamePaused = false;

            // Resume the game
            clearInterval(gameInterval);
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

            // Ensure the pause UI is hidden
            const pauseButton = document.getElementById('pause-button');
            const pauseOverlay = document.getElementById('pause-overlay');

            if (pauseButton) {
                pauseButton.textContent = '⏸️'; // Pause symbol
                pauseButton.title = 'Pause Game';
            }

            if (pauseOverlay) {
                pauseOverlay.classList.remove('active');
            }

            // Resume background music if it was playing
            if (isMusicPlaying && backgroundMusic) {
                backgroundMusic.play().catch(e => console.log("Audio play error:", e));
            }
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

    // Switch screens - hide all screens first, then show game screen
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    gameScreen.classList.add('active');

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
    if (musicEnabled) {
        if (!backgroundMusic) {
            initMusic();
        }
        backgroundMusic.currentTime = 0; // Reset to beginning
        backgroundMusic.play().catch(e => console.log("Audio play error:", e));
        isMusicPlaying = true;
    }

    // Update powerup counts display
    updatePowerupCounts();

    // Add a small delay before starting the game to ensure all elements are properly initialized
    setTimeout(() => {
        // Ensure the game is properly initialized and not paused
        if (gameState === 'playing' && !isGamePaused) {
            // Start the game loop again to ensure it's running
            clearInterval(gameInterval);
            gameInterval = setInterval(updateGame, 1000 / 60);
        }
    }, 100);
}

// Handle user input
function handleInput(e) {
    if (gameState !== 'playing' || isGamePaused) return; // Don't handle input when paused
    if (!wordInput) return; // Safety check

    if (e.key === 'Enter') {
        const typedWord = wordInput.value.trim();
        if (typedWord) {
            // Add the typed word to the bullet display
            addBulletToDisplay(typedWord);
            playSound('bulletFire');

            const typedWordLower = typedWord.toLowerCase();
            totalTyped += typedWordLower.length;

            // Check if the typed word matches any asteroid
            let hit = false;
            for (let i = asteroids.length - 1; i >= 0; i--) {
                const asteroid = asteroids[i];
                if (asteroid.word.toLowerCase() === typedWordLower) {
                    // Correctly typed word - destroy asteroid
                    destroyAsteroid(i);
                    playSound('asteroidHit');
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
                playSound('error');

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
                    playSound('lifeLost');
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
    console.log('updateGame called, gameState:', gameState, 'isGamePaused:', isGamePaused);
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
                    playSound('lifeLost');
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
                playSound('powerupCollect');

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
        playSound('levelUp');

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
    playSound('gameOver');
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



    // Reset global state variables after game ends
    window.previousGameState = null;
    window.wasGamePausedWhenGoingToShop = false;

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
        
        // Add current game score to history
        if (!users[currentUser.username].scoreHistory) {
            users[currentUser.username].scoreHistory = [];
        }
        
        // Create score entry with current game data
        const scoreEntry = {
            score: score,
            wpm: wpm,
            level: level,
            accuracy: accuracy,
            timestamp: new Date().toISOString()
        };
        
        // Add to beginning of array (newest first)
        users[currentUser.username].scoreHistory.unshift(scoreEntry);
        
        // Keep only the last 10 scores to avoid storage bloat
        if (users[currentUser.username].scoreHistory.length > 10) {
            users[currentUser.username].scoreHistory = users[currentUser.username].scoreHistory.slice(0, 10);
        }
        
        // Also update currentUser's scoreHistory to keep it in sync
        currentUser.scoreHistory = users[currentUser.username].scoreHistory;
    }

    // Save updated users back to localStorage
    localStorage.setItem('users', JSON.stringify(users));

    // Also update the current user in localStorage
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
}

// Settings screen functions
function showSettingsScreen() {
    // Check version first - require version 3.0 for settings
    if (!checkVersionForFeatureAccess()) {
        return; // User needs to update, exit early
    }
    
    // Check if settings screen element is available
    if (!settingsScreen) {
        console.error('Settings screen element not found!');
        return;
    }
    
    // Hide all screens first
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    settingsScreen.classList.add('active');
    console.log('Settings screen activated');

    // Load current settings
    loadSettings();
}

function hideSettingsScreen() {
    if (settingsScreen) {
        settingsScreen.classList.remove('active');
        // Go back to profile screen if we came from there
        if (profileScreen && document.getElementById('settings-button')) {
            profileScreen.classList.add('active');
        } else {
            startScreen.classList.add('active');
        }
    }
}

function loadSettings() {
    if (!currentUser) {
        console.log('No user logged in, loading guest settings');
        // Try to load guest settings from localStorage
        const guestSettings = JSON.parse(localStorage.getItem(GUEST_SETTINGS_KEY) || '{}');
        
        if (Object.keys(guestSettings).length > 0) {
            // Apply guest settings to UI
            if (soundToggle) soundToggle.checked = guestSettings.soundEnabled !== false;
            if (musicToggle) musicToggle.checked = guestSettings.musicEnabled !== false;
            if (difficultySelect) difficultySelect.value = guestSettings.difficulty || 'medium';
            if (typingSensitivity && guestSettings.typingSensitivity) {
                typingSensitivity.value = guestSettings.typingSensitivity;
                if (sensitivityValue) sensitivityValue.textContent = guestSettings.typingSensitivity;
            }
            // Profile picture not available for guests
            if (profilePictureImg) profilePictureImg.style.display = 'none';
            if (profilePicturePlaceholder) profilePicturePlaceholder.style.display = 'block';
        } else {
            loadDefaultSettings();
        }
        // Hide account settings section for guest users
        const accountSection = document.querySelector('.settings-section:nth-child(3)');
        if (accountSection) accountSection.style.display = 'none';
        return;
    }

    // Get user settings from localStorage
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    const userData = users[currentUser.username];
    
    if (userData && userData.settings) {
        const settings = userData.settings;
        
        // Load profile picture
        if (settings.profilePicture) {
            profilePictureImg.src = settings.profilePicture;
            profilePictureImg.style.display = 'block';
            profilePicturePlaceholder.style.display = 'none';
        } else {
            profilePictureImg.style.display = 'none';
            profilePicturePlaceholder.style.display = 'block';
        }
        
        // Load game settings
        if (soundToggle) soundToggle.checked = settings.soundEnabled !== false;
        if (musicToggle) musicToggle.checked = settings.musicEnabled !== false;
        if (difficultySelect) difficultySelect.value = settings.difficulty || 'medium';
        if (typingSensitivity && settings.typingSensitivity) {
            typingSensitivity.value = settings.typingSensitivity;
            if (sensitivityValue) sensitivityValue.textContent = settings.typingSensitivity;
        }
    } else {
        loadDefaultSettings();
    }
    // Show account settings section for logged in users
    const accountSection = document.querySelector('.settings-section:nth-child(3)');
    if (accountSection) accountSection.style.display = '';
}

function loadDefaultSettings() {
    // Set default values
    if (profilePictureImg) profilePictureImg.style.display = 'none';
    if (profilePicturePlaceholder) profilePicturePlaceholder.style.display = 'block';
    if (soundToggle) soundToggle.checked = true;
    if (musicToggle) musicToggle.checked = true;
    if (difficultySelect) difficultySelect.value = 'medium';
    if (typingSensitivity) {
        typingSensitivity.value = 5;
        if (sensitivityValue) sensitivityValue.textContent = '5';
    }
}

function updateSensitivityValue() {
    if (typingSensitivity && sensitivityValue) {
        sensitivityValue.textContent = typingSensitivity.value;
    }
}

function handleProfilePictureUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
        alert('File too large! Please choose a file smaller than 2MB.');
        return;
    }
    
    // Check file type
    if (!file.type.match('image.*')) {
        alert('Please select an image file (JPG, PNG, etc.).');
        return;
    }
    
    // Create a FileReader to read the file
    const reader = new FileReader();
    reader.onload = function(e) {
        const imageDataUrl = e.target.result;
        
        // Display the image
        profilePictureImg.onload = function() {
            // Image loaded successfully
            profilePictureImg.style.display = 'block';
            profilePicturePlaceholder.style.display = 'none';
            
            // Save to settings
            if (currentUser) {
                saveProfilePictureToSettings(imageDataUrl);
            }
        };
        
        profilePictureImg.onerror = function() {
            // Image failed to load
            alert('Failed to load image. Please try a different image file.');
            profilePictureImg.style.display = 'none';
            profilePicturePlaceholder.style.display = 'block';
            // Clear the file input
            profilePictureInput.value = '';
        };
        
        profilePictureImg.src = imageDataUrl;
    };
    
    reader.onerror = function() {
        alert('Error reading file. Please try a different image.');
        profilePictureInput.value = '';
    };
    
    reader.readAsDataURL(file);
}

function saveProfilePictureToSettings(imageDataUrl) {
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    const userData = users[currentUser.username];
    
    if (!userData) return;
    
    if (!userData.settings) {
        userData.settings = {};
    }
    
    userData.settings.profilePicture = imageDataUrl;
    
    // Update localStorage
    users[currentUser.username] = userData;
    localStorage.setItem('users', JSON.stringify(users));
    
    // Also update currentUser
    if (!currentUser.settings) {
        currentUser.settings = {};
    }
    currentUser.settings.profilePicture = imageDataUrl;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
}

function removeProfilePicture() {
    if (!confirm('Are you sure you want to remove your profile picture?')) {
        return;
    }
    // Reset profile picture display
    profilePictureImg.src = '';
    profilePictureImg.style.display = 'none';
    profilePicturePlaceholder.style.display = 'block';
    
    // Remove from settings
    if (currentUser) {
        const users = JSON.parse(localStorage.getItem('users') || '{}');
        const userData = users[currentUser.username];
        
        if (userData && userData.settings) {
            delete userData.settings.profilePicture;
            
            // Update localStorage
            users[currentUser.username] = userData;
            localStorage.setItem('users', JSON.stringify(users));
            
            // Also update currentUser
            if (currentUser.settings) {
                delete currentUser.settings.profilePicture;
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
            }
        }
    }
}

function updateUsername() {
    if (!currentUser) {
        alert('Please log in to change username.');
        return;
    }
    
    const newUsername = usernameChange.value.trim();
    if (!newUsername) {
        alert('Please enter a new username.');
        return;
    }
    
    if (newUsername === currentUser.username) {
        alert('New username is the same as current username.');
        return;
    }
    
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    
    // Check if new username already exists
    if (users[newUsername]) {
        alert('Username already exists. Please choose another one.');
        return;
    }
    
    // Get current user data
    const userData = users[currentUser.username];
    if (!userData) {
        alert('Error: User data not found.');
        return;
    }
    
    // Delete old user entry and create new one
    delete users[currentUser.username];
    users[newUsername] = userData;
    
    // Update currentUser
    currentUser.username = newUsername;
    
    // Save to localStorage
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    alert('Username updated successfully!');
    usernameChange.value = '';
    
    // Update profile screen if visible
    const profileUsernameElement = document.getElementById('profile-username');
    if (profileUsernameElement) {
        profileUsernameElement.textContent = newUsername;
    }
    
    // Update start screen username
    updateStartScreenUserInfo();
}

function updatePassword() {
    if (!currentUser) {
        alert('Please log in to change password.');
        return;
    }
    
    const newPassword = passwordChange.value;
    if (!newPassword) {
        alert('Please enter a new password.');
        return;
    }
    
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    const userData = users[currentUser.username];
    
    if (!userData) {
        alert('Error: User data not found.');
        return;
    }
    
    // Update password
    userData.password = newPassword;
    
    // Save to localStorage
    users[currentUser.username] = userData;
    localStorage.setItem('users', JSON.stringify(users));
    
    alert('Password updated successfully!');
    passwordChange.value = '';
}

function saveSettings() {
    if (!currentUser) {
        // Guest user: save settings to guestSettings in localStorage
        const guestSettings = {
            soundEnabled: soundToggle ? soundToggle.checked : true,
            musicEnabled: musicToggle ? musicToggle.checked : true,
            difficulty: difficultySelect ? difficultySelect.value : 'medium',
            typingSensitivity: typingSensitivity ? typingSensitivity.value : 5
        };
        localStorage.setItem(GUEST_SETTINGS_KEY, JSON.stringify(guestSettings));
        alert('Settings applied for this session. Log in to save permanently.');
    } else {
        const users = JSON.parse(localStorage.getItem('users') || '{}');
        const userData = users[currentUser.username];
        
        if (!userData) {
            alert('Error: User data not found.');
            return;
        }
        
        // Create or update settings object
        if (!userData.settings) {
            userData.settings = {};
        }
        
        // Save current settings
        userData.settings.soundEnabled = soundToggle ? soundToggle.checked : true;
        userData.settings.musicEnabled = musicToggle ? musicToggle.checked : true;
        userData.settings.difficulty = difficultySelect ? difficultySelect.value : 'medium';
        userData.settings.typingSensitivity = typingSensitivity ? typingSensitivity.value : 5;
        
        // Save profile picture if exists
        if (profilePictureImg && profilePictureImg.src && profilePictureImg.style.display !== 'none') {
            userData.settings.profilePicture = profilePictureImg.src;
        }
        
        // Update localStorage
        users[currentUser.username] = userData;
        localStorage.setItem('users', JSON.stringify(users));
        
        // Also update currentUser
        if (!currentUser.settings) {
            currentUser.settings = {};
        }
        currentUser.settings = userData.settings;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        alert('Settings saved successfully!');
    }
    
    // Apply settings to game (works for both guest and logged in users)
    applySettings();
}

function resetSettings() {
    if (confirm('Are you sure you want to reset all settings to defaults?')) {
        loadDefaultSettings();
        
        // Remove profile picture
        removeProfilePicture();
        
        // Clear saved settings
        if (currentUser) {
            const users = JSON.parse(localStorage.getItem('users') || '{}');
            const userData = users[currentUser.username];
            
            if (userData) {
                delete userData.settings;
                users[currentUser.username] = userData;
                localStorage.setItem('users', JSON.stringify(users));
                
                // Also update currentUser
                delete currentUser.settings;
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
            }
        } else {
            // Clear guest settings
            localStorage.removeItem(GUEST_SETTINGS_KEY);
        }
        
        alert('Settings reset to defaults!');
        
        // Apply default settings to game
        applySettings();
    }
}

function applySettings() {
    let settings = null;
    if (currentUser && currentUser.settings) {
        settings = currentUser.settings;
    } else {
        // Load guest settings
        const guestSettings = JSON.parse(localStorage.getItem(GUEST_SETTINGS_KEY) || '{}');
        if (Object.keys(guestSettings).length === 0) return;
        settings = guestSettings;
    }
    
    // Apply game settings
    if (typeof settings.soundEnabled === 'boolean') {
        soundEnabled = settings.soundEnabled;
        toggleSoundEffects(settings.soundEnabled);
        console.log('Sound enabled:', settings.soundEnabled);
    }
    
    if (typeof settings.musicEnabled === 'boolean') {
        // Apply music settings
        console.log('Applying music settings:', settings.musicEnabled);
        musicEnabled = settings.musicEnabled;
        
        if (!musicEnabled && isMusicPlaying && backgroundMusic) {
            // Music preference is disabled but music is currently playing
            backgroundMusic.pause();
            isMusicPlaying = false;
        }
        
        // If music is enabled, ensure backgroundMusic is initialized if needed
        if (musicEnabled && !backgroundMusic) {
            initMusic();
        }
    }
    updateMusicButtonAppearance();
    
    if (settings.difficulty) {
        difficulty = settings.difficulty;
        console.log('Difficulty set to:', difficulty);
        // Update start screen difficulty dropdown
        if (startDifficultySelect) {
            startDifficultySelect.value = difficulty;
        }
    }
    
    // Apply typing sensitivity if present
    if (settings.typingSensitivity) {
        // typingSensitivity variable is used elsewhere; ensure it's updated
        // This is a global variable used by the game logic
        // We'll store it in a global variable for consistency
        window.typingSensitivityValue = settings.typingSensitivity;
    }
}

// Show profile screen
function showProfileScreen() {
    console.log('showProfileScreen called, currentUser:', currentUser ? currentUser.username : 'null');
    
    // Check version first - require version 3.0 for profile
    if (!checkVersionForFeatureAccess()) {
        return; // User needs to update, exit early
    }
    
    // Check if profile screen element is available
    if (!profileScreen) {
        console.error('Profile screen element not found!');
        return;
    }
    
    // Hide all screens first
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    profileScreen.classList.add('active');
    console.log('Profile screen activated');

    // Update profile screen with user data
    if (currentUser) {
        console.log('Updating profile data for user:', currentUser.username);
        document.getElementById('profile-username').textContent = currentUser.username;
        document.getElementById('profile-best-score').textContent = currentUser.bestScore || 0;
        document.getElementById('profile-best-wpm').textContent = currentUser.bestWpm || 0;

        // Get games played from user data
        const users = JSON.parse(localStorage.getItem('users') || '{}');
        console.log('All users from localStorage:', users);
        const userData = users[currentUser.username];
        console.log('userData for', currentUser.username, ':', userData);
        const gamesPlayed = userData ? userData.gamesPlayed || 0 : 0;
        document.getElementById('profile-games-played').textContent = gamesPlayed;

        // Update power-up counts
        updatePowerupCounts();
        
        // Display score history if available
        displayScoreHistory(userData);
    } else {
        console.log('No current user found, profile screen will be empty');
    }
}

// Display score history in profile screen
function displayScoreHistory(userData) {
    console.log('displayScoreHistory called with userData:', userData);
    const scoreHistoryList = document.getElementById('score-history-list');
    if (!scoreHistoryList) {
        console.error('Score history list element not found');
        return;
    }
    
    // Clear existing content
    scoreHistoryList.innerHTML = '';
    
    // Check if there's score history
    if (!userData) {
        console.log('No userData provided');
        scoreHistoryList.innerHTML = '<p class="no-scores">No user data available</p>';
        return;
    }
    
    if (!userData.scoreHistory) {
        console.log('No scoreHistory property in userData');
        scoreHistoryList.innerHTML = '<p class="no-scores">No scores recorded yet</p>';
        return;
    }
    
    if (userData.scoreHistory.length === 0) {
        console.log('scoreHistory array is empty');
        scoreHistoryList.innerHTML = '<p class="no-scores">No scores recorded yet</p>';
        return;
    }
    
    console.log('Found score history with', userData.scoreHistory.length, 'entries:', userData.scoreHistory);
    
    // Create a list of scores
    userData.scoreHistory.forEach((entry, index) => {
        const scoreItem = document.createElement('div');
        scoreItem.className = 'score-item';
        
        // Format date
        const date = new Date(entry.timestamp);
        const dateStr = date.toLocaleDateString();
        const timeStr = date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
        
        scoreItem.innerHTML = `
            <div class="score-rank">${index + 1}.</div>
            <div class="score-details">
                <div class="score-value">Score: ${entry.score}</div>
                <div class="score-stats">WPM: ${entry.wpm} | Level: ${entry.level} | Accuracy: ${entry.accuracy}%</div>
                <div class="score-time">${dateStr} ${timeStr}</div>
            </div>
        `;
        
        scoreHistoryList.appendChild(scoreItem);
    });
}

// Handle user logout
function handleLogout() {
    // Clear current user
    currentUser = null;
    localStorage.removeItem('currentUser');

    // Reset global state variables after logout
    window.previousGameState = null;
    window.wasGamePausedWhenGoingToShop = false;

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
            playSound('powerupCollect');

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
    // Check version first - require version 3.0 for store
    if (!checkVersionForFeatureAccess()) {
        return; // User needs to update, exit early
    }
    
    // Store the previous game state to return to it later
    window.previousGameState = gameState;
    profileScreen.classList.remove('active');
    storeScreen.classList.add('active');
    gameState = 'shop';

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
        musicEnabled = false;
    } else {
        if (!backgroundMusic) {
            initMusic();
        }
        backgroundMusic.play().catch(e => console.log("Audio play error:", e));
        isMusicPlaying = true;
        musicEnabled = true;
    }
    
    // Save music preference to user settings
    if (currentUser) {
        if (!currentUser.settings) {
            currentUser.settings = {};
        }
        currentUser.settings.musicEnabled = musicEnabled;
        
        // Update localStorage
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        // Also update users object
        const users = JSON.parse(localStorage.getItem('users') || '{}');
        if (users[currentUser.username]) {
            users[currentUser.username].settings = currentUser.settings;
            localStorage.setItem('users', JSON.stringify(users));
        }
    } else {
        // Save guest music preference
        const guestSettings = JSON.parse(localStorage.getItem(GUEST_SETTINGS_KEY) || '{}');
        guestSettings.musicEnabled = musicEnabled;
        localStorage.setItem(GUEST_SETTINGS_KEY, JSON.stringify(guestSettings));
    }
    
    // Update in-game button appearance
    updateMusicButtonAppearance();
}

// Update in-game music button appearance based on musicEnabled setting
function updateMusicButtonAppearance() {
    if (!inGameMusicToggle) return;
    if (musicEnabled) {
        inGameMusicToggle.textContent = '🎵';
        inGameMusicToggle.title = 'Music Enabled (click to mute)';
    } else {
        inGameMusicToggle.textContent = '🔇';
        inGameMusicToggle.title = 'Music Disabled (click to enable)';
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

// Initialize sound effects system
function initSoundEffects() {
    if (!audioContext) {
        try {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            gainNode = audioContext.createGain();
            gainNode.connect(audioContext.destination);
            gainNode.gain.value = soundEnabled ? 0.3 : 0;
        } catch (error) {
            console.error('Failed to initialize audio context:', error);
            // Disable sound effects if audio context fails
            soundEnabled = false;
            audioContext = null;
            gainNode = null;
        }
    }
}

// Play a sound effect
function playSound(effectName) {
    if (!soundEnabled) return;
    
    // Initialize audio context if needed
    if (!audioContext) {
        initSoundEffects();
    }
    
    // If audio context failed to initialize, exit
    if (!audioContext || !gainNode) return;
    
    // Check if audio context is suspended (browsers require user interaction)
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
    
    const effect = soundEffects[effectName];
    if (!effect) return;
    
    try {
        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();
        
        oscillator.connect(gain);
        gain.connect(gainNode);
        
        oscillator.frequency.setValueAtTime(effect.frequency, audioContext.currentTime);
        oscillator.type = effect.type;
        
        // Apply envelope
        gain.gain.setValueAtTime(0.3, audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + effect.duration);
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + effect.duration);
    } catch (error) {
        console.error('Failed to play sound effect:', error);
    }
}

// Toggle sound effects on/off
function toggleSoundEffects(enabled) {
    soundEnabled = enabled;
    // Initialize audio context if needed
    if (!audioContext) {
        initSoundEffects();
    }
    // Update gain node if available
    if (gainNode) {
        gainNode.gain.value = enabled ? 0.3 : 0;
    }
}

// Toggle game pause/resume
function togglePause() {
    console.log('togglePause called, gameState:', gameState, 'isGamePaused:', isGamePaused, 'gameInterval:', gameInterval);
    // Only allow pausing/resuming during gameplay
    if (gameState !== 'playing') {
        // If we're in the shop state, we should return to the game first
        if (gameState === 'shop') {
            // Switch back to game screen
            storeScreen.classList.remove('active');
            gameScreen.classList.add('active');
            gameState = 'playing';
            // Don't change the pause state here, just return to the game screen
            // The game should remain in whatever pause state it was in before
            return;
        } else {
            // For any other state (like hosting), just return without doing anything
            return;
        }
    }

    isGamePaused = !isGamePaused;

    const pauseButton = document.getElementById('pause-button');
    const pauseOverlay = document.getElementById('pause-overlay');

    if (isGamePaused) {
        console.log('Pausing game, clearing intervals');
        // Pause the game
        console.log('Pause: clearing gameInterval:', gameInterval);
        clearInterval(gameInterval);
        gameInterval = null;
        if (spawnInterval) {
            console.log('Pause: clearing spawnInterval:', spawnInterval);
            clearInterval(spawnInterval);
            spawnInterval = null;
        }
        if (powerupSpawnInterval) {
            console.log('Clearing powerupSpawnInterval:', powerupSpawnInterval);
            clearInterval(powerupSpawnInterval);
            powerupSpawnInterval = null;
        }

        // Track when the game was paused
        lastPauseTime = Date.now();

        // Update button text
        if (pauseButton) {
            pauseButton.textContent = '▶️'; // Play symbol
            pauseButton.title = 'Resume Game';
        }

        // Show pause overlay
        if (pauseOverlay) {
            pauseOverlay.classList.add('active');
        }

        // Pause background music
        if (backgroundMusic && !backgroundMusic.paused) {
            backgroundMusic.pause();
        }
    } else {
        console.log('Resuming game, creating new intervals');
        // Calculate how long the game was paused
        if (lastPauseTime > 0) {
            pausedTime += Date.now() - lastPauseTime;
            lastPauseTime = 0; // Reset the pause start time
        }

        // Resume the game
        console.log('Resume: clearing gameInterval:', gameInterval);
        clearInterval(gameInterval);
        gameInterval = setInterval(updateGame, 1000 / 60); // ~60fps
        console.log('New gameInterval created:', gameInterval);
        
        // Ensure word input is focused
        if (wordInput) {
            wordInput.focus();
        }

        // Restart asteroid spawning if needed
        if (spawnInterval) {
            console.log('Resume: clearing spawnInterval:', spawnInterval);
            clearInterval(spawnInterval);
        }
        spawnInterval = setInterval(spawnAsteroid, Math.max(500, 2000 - (level * 100))); // Minimum 500ms interval

        // Restart powerup spawning if needed (only if level >= 3)
        if (level >= 3) {
            if (powerupSpawnInterval) {
                console.log('Resume: clearing powerupSpawnInterval:', powerupSpawnInterval);
                clearInterval(powerupSpawnInterval);
            }
            powerupSpawnInterval = setInterval(spawnPowerup, 15000); // Spawn powerup every 15 seconds
        }

        // Update button text
        if (pauseButton) {
            pauseButton.textContent = '⏸️'; // Pause symbol
            pauseButton.title = 'Pause Game';
        }

        // Hide pause overlay
        if (pauseOverlay) {
            pauseOverlay.classList.remove('active');
        }

        // Resume background music if it was playing
        if (isMusicPlaying && backgroundMusic) {
            backgroundMusic.play().catch(e => console.log("Audio play error:", e));
        }
    }
}

// Show the host screen with generated join code
function showHostScreen() {
    console.log("showHostScreen function called"); // Debug log
    
    // Check version first - require version 3.0 for multiplayer/hosting
    if (!checkVersionForFeatureAccess()) {
        return; // User needs to update, exit early
    }

    // Simple immediate implementation to test functionality
    try {
        // Show loading indicator
        const loadingIndicator = document.getElementById('loading-indicator');
        console.log("Loading indicator element:", loadingIndicator); // Debug log
        if (loadingIndicator) {
            loadingIndicator.classList.remove('hidden');
            console.log("Loading indicator shown"); // Debug log
        } else {
            console.error("Loading indicator element not found"); // Debug log
            // Continue without loading indicator if not found
        }

        // Generate a new join code in format: 4 letters (mixed case) + 4 digits
        let attempts = 0;
        const maxAttempts = 5;
        let code = '';
        
        do {
            code = generateJoinCode();
            attempts++;
        } while (isDuplicateCode(code) && attempts < maxAttempts);
        
        // If still duplicate after max attempts, append suffix
        if (isDuplicateCode(code)) {
            let suffix = 1;
            let uniqueCode = '';
            do {
                uniqueCode = code + '_' + suffix.toString().padStart(2, '0');
                suffix++;
            } while (isDuplicateCode(uniqueCode) && suffix <= 99);
            code = uniqueCode;
        }
        
        currentJoinCode = code;
        console.log("Generated join code:", currentJoinCode); // Debug log

        // Add to active codes
        activeJoinCodes.push(currentJoinCode);

        // Get the host screen element
        const hostScreenElement = document.getElementById('host-screen');
        console.log("Host screen element:", hostScreenElement); // Debug log
        if (!hostScreenElement) {
            console.error("hostScreen element not found"); // Debug log
            return; // Exit early if host screen doesn't exist
        }

        // Clear existing players and add the host to the players list
        if (playersList) playersList.innerHTML = '';
        addPlayerToList(currentUser ? currentUser.username : 'HOST');

        // Set game state to hosting
        gameState = 'hosting';
        console.log("Game state set to hosting"); // Debug log

        // Switch screens: hide all screens first, then show host screen
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        // Add the active class for the transition (animation is handled by CSS)
        hostScreenElement.classList.add('active');
        console.log("Host screen activated"); // Debug log

        // Update the join code display
        const currentJoinCodeDisplay = document.getElementById('current-join-code');
        console.log("Current join code display element:", currentJoinCodeDisplay); // Debug log
        if (currentJoinCodeDisplay) {
            currentJoinCodeDisplay.textContent = currentJoinCode;
            console.log("Join code displayed:", currentJoinCode); // Debug log
        } else {
            console.error("currentJoinCodeDisplay element not found"); // Debug log
        }

        // Hide loading indicator after a short delay
        setTimeout(() => {
            if (loadingIndicator) {
                loadingIndicator.classList.add('hidden');
            }
        }, 1000); // Wait 1 second before hiding

    } catch (error) {
        console.error("Error in showHostScreen:", error);

        // Ensure loading indicator is hidden even if there's an error
        const loadingIndicator = document.getElementById('loading-indicator');
        if (loadingIndicator) {
            loadingIndicator.classList.add('hidden');
        }
    }
}

// Generate a new join code in format: 4 letters (mixed case) + 4 digits
function generateJoinCode() {
    // Letters pool: A-Z and a-z
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    // Digits pool: 0-9
    const digits = '0123456789';
    
    let code = '';
    
    // Generate 4 random letters
    for (let i = 0; i < 4; i++) {
        code += letters.charAt(Math.floor(Math.random() * letters.length));
    }
    
    // Generate 4 random digits
    for (let i = 0; i < 4; i++) {
        code += digits.charAt(Math.floor(Math.random() * digits.length));
    }
    
    return code;
}

// Check if a code is duplicate (case-insensitive)
function isDuplicateCode(code) {
    return activeJoinCodes.some(c => c.toLowerCase() === code.toLowerCase());
}

// Copy join code to clipboard with visual feedback
function copyJoinCodeToClipboard() {
    const joinCodeDisplay = document.getElementById('current-join-code');
    const copyButton = document.getElementById('copy-join-code-button');
    
    if (!joinCodeDisplay || !copyButton) {
        console.error('Copy join code elements not found');
        return;
    }
    
    const joinCode = joinCodeDisplay.textContent;
    
    // Check if join code is still "Generating..." or empty
    if (!joinCode || joinCode === 'Generating...') {
        console.warn('No valid join code to copy');
        copyButton.textContent = 'NO CODE';
        setTimeout(() => {
            copyButton.textContent = 'COPY CODE';
        }, 2000);
        return;
    }
    
    // Function to show success feedback
    const showSuccess = () => {
        const originalText = copyButton.textContent;
        console.log('Join code copied to clipboard:', joinCode);
        copyButton.textContent = 'COPIED!';
        copyButton.classList.add('copied');
        
        setTimeout(() => {
            copyButton.textContent = originalText;
            copyButton.classList.remove('copied');
        }, 2000);
    };
    
    // Function to show error feedback
    const showError = (message) => {
        console.error('Failed to copy join code:', message);
        copyButton.textContent = 'FAILED';
        setTimeout(() => {
            copyButton.textContent = 'COPY CODE';
        }, 2000);
    };
    
    // Try modern Clipboard API first
    if (navigator.clipboard && navigator.clipboard.writeText) {
        console.log('Using Clipboard API for join code:', joinCode);
        navigator.clipboard.writeText(joinCode).then(() => {
            showSuccess();
        }).catch(err => {
            // If Clipboard API fails, fall back to execCommand
            fallbackCopy(joinCode, showSuccess, showError);
        });
    } else {
        // No Clipboard API, use fallback directly
        fallbackCopy(joinCode, showSuccess, showError);
    }
    
    // Fallback method using execCommand
    function fallbackCopy(text, successCallback, errorCallback) {
        try {
            // Create a temporary textarea element
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.top = '-1000px';
            textarea.style.left = '-1000px';
            document.body.appendChild(textarea);
            
            // Select and copy
            textarea.select();
            textarea.setSelectionRange(0, 99999); // For mobile devices
            
            console.log('Using fallback copy method (execCommand) for join code:', text);
            const success = document.execCommand('copy');
            document.body.removeChild(textarea);
            
            if (success) {
                successCallback();
            } else {
                errorCallback('execCommand copy failed');
            }
        } catch (err) {
            errorCallback(err.message || 'Unknown error');
        }
    }
}

// Add a player to the players list on the host screen
function addPlayerToList(username) {
    const playerItem = document.createElement('div');
    playerItem.className = 'player-item';
    playerItem.dataset.username = username;

    const playerName = document.createElement('span');
    playerName.className = 'player-name';
    playerName.textContent = username;

    const playerStatus = document.createElement('span');
    playerStatus.className = 'player-status';
    playerStatus.textContent = 'Connected';

    playerItem.appendChild(playerName);
    playerItem.appendChild(playerStatus);

    const hostUsername = currentUser ? currentUser.username : 'HOST';
    if (username !== hostUsername) {
        const removeButton = document.createElement('button');
        removeButton.className = 'player-remove-btn';
        removeButton.textContent = '×';
        removeButton.title = 'Remove player';
        removeButton.addEventListener('click', () => confirmRemovePlayer(username, playerItem));
        playerItem.appendChild(removeButton);
    }

    playersList.appendChild(playerItem);
}



// Helper function to hide the modal
function hideModal(modalOverlay) {
    if (modalOverlay) {
        modalOverlay.classList.add('hidden');
    }
}

// Show image in full screen modal
function showImageModal(imageSrc, altText) {
    let modalOverlay = document.getElementById('image-modal-overlay');
    if (!modalOverlay) {
        modalOverlay = document.createElement('div');
        modalOverlay.id = 'image-modal-overlay';
        modalOverlay.className = 'image-modal-overlay hidden';
        modalOverlay.innerHTML = `
            <div class="image-modal-content">
                <img src="" alt="" class="image-modal-img">
                <div class="image-modal-caption"></div>
            </div>
        `;
        document.body.appendChild(modalOverlay);
        
        // Close modal when clicking outside the image
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                hideModal(modalOverlay);
            }
        });
        
        // Close modal with Escape key
        const handleEscape = (e) => {
            if (e.key === 'Escape' && !modalOverlay.classList.contains('hidden')) {
                hideModal(modalOverlay);
            }
        };
        
        modalOverlay._escapeHandler = handleEscape;
        document.addEventListener('keydown', handleEscape);
    }
    
    const img = modalOverlay.querySelector('.image-modal-img');
    const caption = modalOverlay.querySelector('.image-modal-caption');
    
    img.src = imageSrc;
    img.alt = altText;
    caption.textContent = altText;
    
    modalOverlay.classList.remove('hidden');
}

// Show confirmation dialog before removing a player
function confirmRemovePlayer(username, playerItem) {
    // Prevent removing the host
    const hostUsername = currentUser ? currentUser.username : 'HOST';
    if (username === hostUsername) {
        alert('Cannot remove the host from the game');
        return;
    }
    
    // Create or get confirmation modal
    let modalOverlay = document.getElementById('confirmation-modal-overlay');
    if (!modalOverlay) {
        modalOverlay = document.createElement('div');
        modalOverlay.id = 'confirmation-modal-overlay';
        modalOverlay.className = 'confirmation-modal-overlay hidden';
        modalOverlay.innerHTML = `
            <div class="confirmation-modal">
                <h3>Confirm Removal</h3>
                <p></p>
                <div class="confirmation-buttons">
                    <button class="confirm-yes-button">YES</button>
                    <button class="confirm-no-button">NO</button>
                </div>
            </div>
        `;
        document.body.appendChild(modalOverlay);
    }
    
    // Get modal elements
    const message = modalOverlay.querySelector('p');
    const yesButton = modalOverlay.querySelector('.confirm-yes-button');
    const noButton = modalOverlay.querySelector('.confirm-no-button');
    const modalContent = modalOverlay.querySelector('.confirmation-modal');
    
    // Update message with player name
    if (message) {
        message.textContent = `Just for confirmation are you sure you want to remove ${username}?`;
    }
    
    // Remove any existing click listeners by cloning buttons
    if (yesButton && noButton) {
        const newYesButton = yesButton.cloneNode(true);
        const newNoButton = noButton.cloneNode(true);
        yesButton.parentNode.replaceChild(newYesButton, yesButton);
        noButton.parentNode.replaceChild(newNoButton, noButton);
        
        // Add new event listeners
        newYesButton.addEventListener('click', () => {
            // Remove the player item from the DOM
            if (playerItem && playerItem.parentNode === playersList) {
                playersList.removeChild(playerItem);
            }
            hideModal(modalOverlay);
        });
        
        newNoButton.addEventListener('click', () => {
            hideModal(modalOverlay);
        });
    }
    
    // Setup modal close handlers (only once)
    if (!modalOverlay._initialized) {
        const modalContent = modalOverlay.querySelector('.confirmation-modal');
        if (modalContent) {
            // Close modal when clicking outside the modal content
            modalOverlay.addEventListener('click', (e) => {
                if (!modalContent.contains(e.target)) {
                    hideModal(modalOverlay);
                }
            });
        }
        
        // Close modal with Escape key
        const handleEscape = (e) => {
            if (e.key === 'Escape' && !modalOverlay.classList.contains('hidden')) {
                hideModal(modalOverlay);
            }
        };
        
        // Store handler reference for cleanup
        modalOverlay._escapeHandler = handleEscape;
        document.addEventListener('keydown', handleEscape);
        
        modalOverlay._initialized = true;
    }
    
    // Show the modal
    modalOverlay.classList.remove('hidden');
}



// Save a report to localStorage
function saveReport(report) {
    try {
        // Get existing reports or initialize an empty array
        let reports;
        try {
            const reportsStr = localStorage.getItem('reports');
            reports = reportsStr ? JSON.parse(reportsStr) : [];
            if (!Array.isArray(reports)) {
                console.warn('Stored reports is not an array, resetting');
                reports = [];
            }
        } catch (e) {
            console.error('Error parsing reports from localStorage:', e);
            reports = [];
        }

        // Add the new report
        reports.push(report);

        // Save back to localStorage
        localStorage.setItem('reports', JSON.stringify(reports));

        // Log for debugging purposes
        console.log('Report saved:', report);
        console.log('Total reports in localStorage:', reports.length);
        console.log('adminPanel exists:', !!adminPanel);
        console.log('adminPanel hidden?', adminPanel ? adminPanel.classList.contains('hidden') : 'N/A');

        // Ensure the admin panel is updated if it's currently visible
        if (adminPanel && !adminPanel.classList.contains('hidden')) {
            console.log('Admin panel visible, calling loadReports()');
            loadReports();
        } else {
            console.log('Admin panel not visible, skipping loadReports()');
        }
    } catch (error) {
        console.error('Error saving report:', error);
        alert('Error saving report. Please try again.');
    }
}

// Load reports from localStorage and display them
function loadReports() {
    try {
        console.log('loadReports called');
        console.log('reportsList exists:', !!reportsList);
        
        // Get reports from localStorage with error handling
        let reports;
        try {
            const reportsStr = localStorage.getItem('reports');
            if (!reportsStr) {
                reports = [];
            } else {
                reports = JSON.parse(reportsStr);
                if (!Array.isArray(reports)) {
                    console.warn('Stored reports is not an array, resetting');
                    reports = [];
                }
            }
        } catch (e) {
            console.error('Error parsing reports from localStorage:', e);
            reports = [];
        }
        
        console.log('Found reports in localStorage:', reports.length);

        // Ensure reportsList exists
        if (!reportsList) {
            console.log('reportsList not found, attempting to get fresh reference');
            reportsList = document.getElementById('reports-list');
        }
        
        if (!reportsList) {
            console.error('Could not find reports-list element');
            return;
        }
        
        // Clear the reports list
        reportsList.innerHTML = '';

        // If no reports, show a message
        if (reports.length === 0) {
            reportsList.innerHTML = '<p>No reports yet.</p>';
            console.log('No reports to display');
            return;
        }

        // Sort reports by timestamp descending (newest first)
        const sortedReports = [...reports].sort((a, b) => {
            return new Date(b.timestamp) - new Date(a.timestamp);
        });

        console.log('Displaying', sortedReports.length, 'reports (newest first)');

        // Add each report to the list
        sortedReports.forEach(report => {
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
        
        console.log('Reports displayed successfully');
    } catch (error) {
        console.error('Error loading reports:', error);
        if (reportsList) {
            reportsList.innerHTML = '<p class="error">Error loading reports. Please try again.</p>';
        }
    }
}

// Delete a report by ID
function deleteReport(reportId) {
    try {
        console.log('Deleting report with ID:', reportId);
        
        // Get existing reports with error handling
        let reports;
        try {
            const reportsStr = localStorage.getItem('reports');
            if (!reportsStr) {
                reports = [];
            } else {
                reports = JSON.parse(reportsStr);
                if (!Array.isArray(reports)) {
                    console.warn('Stored reports is not an array, resetting');
                    reports = [];
                }
            }
        } catch (e) {
            console.error('Error parsing reports from localStorage:', e);
            reports = [];
        }

        // Filter out the report with the specified ID
        const initialLength = reports.length;
        reports = reports.filter(report => report.id !== reportId);
        const removedCount = initialLength - reports.length;
        
        console.log(`Removed ${removedCount} report(s)`);

        // Save back to localStorage
        localStorage.setItem('reports', JSON.stringify(reports));

        // Reload the reports list
        loadReports();
    } catch (error) {
        console.error('Error deleting report:', error);
        alert('Error deleting report. Please try again.');
    }
}

// Show the join code input section
function showJoinCodeInput() {
    // Check version first - require version 3.0 for multiplayer
    if (!checkVersionForFeatureAccess()) {
        return; // User needs to update, exit early
    }
    
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
    // Step 2: When user types in a join code, scan for any matches (case-insensitive)
    const isValid = activeJoinCodes.some(code => code.toLowerCase() === enteredCode.toLowerCase());

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