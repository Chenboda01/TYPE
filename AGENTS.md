# AGENTS.md - Development Guide for TYPE

This file provides guidelines for agentic coding agents working on the TYPE space typing game.

## Project Overview

TYPE is a browser-based typing game built with vanilla JavaScript, HTML5, and CSS3. It features:
- User authentication (login/signup) with localStorage persistence
- Gameplay with typing mechanics, scoring, WPM tracking
- Multiple difficulty levels and power-up system
- Settings management and profile customization
- Multiplayer simulation with join codes
- Store interface for power-up purchases

## Build, Lint, and Test Commands

This project uses vanilla JavaScript with no build system or testing framework.

**Running the game:**
```bash
# Open the game in a browser
open index.html
# or
python3 -m http.server 8000
# Then visit http://localhost:8000
```

**No linting configured** - The codebase does not use ESLint or any linter.

**No tests** - The project has no automated tests. To test manually:
1. Open the game in a browser
2. Test user flows: authentication, gameplay, settings, store
3. Check console for errors
4. Verify localStorage operations work correctly

## Code Style Guidelines

### JavaScript

**Variable declarations:**
- Use `const` for values that don't change
- Use `let` for variables that need reassignment
- All DOM elements are declared at module scope, then initialized in DOMContentLoaded

```javascript
// Global game state
let gameState = 'start';
const LATEST_VERSION = '3.0';

// DOM element declarations (top of file)
let startScreen;
let gameScreen;

// Initialization in DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    startScreen = document.getElementById('start-screen');
    gameScreen = document.getElementById('game-screen');
});
```

**Function declarations:**
- Use function declarations for all functions (not arrow functions)
- Naming: camelCase, descriptive names based on action
- Group related functions together

```javascript
function startGame() {
    // Game initialization logic
}

function handleInput(e) {
    // Input handling
}

function showProfileScreen() {
    // UI navigation
}
```

**Event listeners:**
- Always attach event listeners inside DOMContentLoaded
- Prevent default form submissions
- Use arrow functions for simple callbacks

```javascript
startButton.addEventListener('click', startGame);
wordInput.addEventListener('keydown', handleInput);

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    handleLogin();
});
```

**State management:**
- Use global variables for game state at top of file
- State variables: `gameState`, `score`, `level`, `wpm`, `accuracy`, `lives`
- Game states: 'start', 'playing', 'gameOver', 'help', 'hosting', 'updates'

**Error handling:**
- Use try-catch for operations that may fail (file uploads, localStorage)
- Add console.error messages for debugging
- Validate DOM elements exist before using them

```javascript
try {
    const users = JSON.parse(localStorage.getItem('users') || '{}');
} catch (error) {
    console.error('Failed to parse users from localStorage:', error);
}

// Validate DOM elements
if (!element) {
    console.error(`Critical DOM element not found: ${name}`);
}
```

**LocalStorage:**
- Store user data in 'users' object
- Store current user in 'currentUser' key
- Store settings in nested user.settings object
- Always include try-catch when parsing JSON

```javascript
const users = JSON.parse(localStorage.getItem('users') || '{}');
localStorage.setItem('currentUser', JSON.stringify(currentUser));
```

**Comments:**
- Use `//` for inline comments
- Add comments for complex logic sections
- Keep comments concise and relevant

### HTML

**Structure:**
- Single page application with multiple screens (div.screen)
- Each screen has a unique ID
- Use semantic HTML elements
- All screens hidden by default, one marked as '.active'

```html
<div id="game-screen" class="screen">
    <!-- Screen content -->
</div>
```

**Screen management:**
- Use CSS class `.active` to show current screen
- Remove `.active` from old screen before adding to new screen
- Update gameState variable when switching screens

**Input elements:**
- Use autocomplete="off" for game inputs
- Use appropriate input types (text, password, email)
- Add placeholder text for user guidance

### CSS

**Styling conventions:**
- Theme: Black background (#000), green text (#00ff00)
- Font: 'Courier New', Courier, monospace
- Use flexbox for layouts
- Border color: #00ff00 for all interactive elements

```css
body {
    font-family: 'Courier New', Courier, monospace;
    background-color: #000;
    color: #00ff00;
}

.screen {
    position: absolute;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}
```

**Class naming:**
- Use kebab-case for CSS classes
- BEM-like naming for components (e.g., `.auth-form`, `.auth-form button`)
- Screen-specific classes prefixed with screen name (e.g., `.profile-screen`)

**Transitions and animations:**
- Use CSS transitions for state changes (0.2s-0.3s)
- Hover effects: background-color swap and glow effect

```css
button:hover {
    background-color: #00ff00;
    color: #000;
    box-shadow: 0 0 10px #00ff00;
}
```

**Utility classes:**
- `.hidden` - display: none
- `.active` - visible screen
- Use inline styles for dynamic values only

### File Organization

**script.js structure:**
1. Game variables and state
2. Power-up variables
3. Version constants
4. DOM element declarations
5. Audio variables and settings
6. User authentication variables
7. DOMContentLoaded event listener with:
   - Element initialization
   - Event listener setup
8. Function definitions grouped by feature

**Styles sections:**
1. Reset and base styles
2. Game container
3. Screen styles (common)
4. Individual screen styles
5. Component styles (buttons, inputs, cards)

### Feature Implementation Patterns

**Adding a new screen:**
1. Add HTML structure with unique ID and `.screen` class
2. Add CSS styles for the screen
3. Declare DOM element variables at top of script.js
4. Initialize element in DOMContentLoaded
5. Add navigation buttons with event listeners
6. Implement screen show/hide functions

**Adding a new feature:**
1. Add HTML elements to appropriate screen
2. Add CSS styling
3. Declare DOM variables at top
4. Initialize in DOMContentLoaded
5. Add event listeners
6. Implement handler functions
7. Update state variables if needed
8. Persist to localStorage if user data

**Modifying existing features:**
1. Check existing patterns in similar features
2. Maintain naming consistency
3. Update state variables appropriately
4. Test all affected user flows
5. Check localStorage operations

### Best Practices

- Always validate DOM elements exist before using them
- Use descriptive variable and function names
- Keep functions focused on single responsibility
- Add error handling for localStorage operations
- Test in multiple browsers if possible
- Check console for errors during development
- Maintain the green-on-black retro theme
- Use transitions for smooth UI changes
- Clear intervals when game ends or pauses
- Update UI after every state change
