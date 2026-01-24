# TYPE Game - QWEN Documentation

## Project Overview
TYPE is a typing speed game focused on helping players improve their typing skills and compete for the highest words per minute (WPM) score. The game challenges players to type as fast and accurately as possible, with scoring based on typing speed and accuracy. Players can compete with friends to achieve the highest WPM scores.

## Current Status
This project is in early stages with basic documentation in place. The core game mechanics are centered around typing speed and accuracy measurement.

## Technologies & Architecture
- **Frontend**: JavaScript
- **Language**: JavaScript/HTML/CSS
- **Framework**: Vanilla JavaScript with minimal dependencies (recommended for simplicity)

### Framework Recommendation: Vanilla JavaScript

#### Pros:
- Minimal learning curve, pure JavaScript without abstractions
- Lightweight with no external dependencies initially
- Complete control over code and architecture decisions
- Faster initial setup and prototyping
- Easy to debug since there's no abstraction layer
- Perfect for small projects and prototypes
- Better understanding of underlying JavaScript concepts

#### Cons:
- Manual DOM manipulation can become complex
- No built-in state management solution
- Need to implement routing manually if needed
- Less component reusability compared to modern frameworks
- May require more code for complex interactions

### Alternative Simple Framework: Alpine.js

If more interactivity is needed later, Alpine.js provides:
- A lightweight framework with Vue-like reactivity
- Much simpler than React or Vue but with similar features
- Easy transition from vanilla JavaScript
- Small bundle size (~10KB)
- Similar syntax to Vue.js but more lightweight

## Building and Running
The project will be hosted using GitHub Pages for easy access and deployment.

### Development Setup
TODO: Add instructions for setting up the development environment

### Local Development
For local development, you can:
- Create an `index.html` file as the entry point
- Use a simple HTTP server to serve files locally (e.g., Live Server extension in VS Code)
- Or use Python's simple server: `python -m http.server 8000`
- Or use Node's http-server: `npx http-server`

### Building the Project
- No complex build process needed initially with vanilla JavaScript
- Minification and optimization can be added later if needed

### GitHub Pages Deployment
- The game will be deployed to GitHub Pages for public access
- Source code will be in the `main` branch
- Enable GitHub Pages in repository settings, pointing to the `main` branch
- The live game will be accessible at: `https://<username>.github.io/TYPE`

### Running the Game
- The game will be accessible directly in the browser at the GitHub Pages URL
- No installation required - pure web-based application

### Testing
TODO: Add information about testing setup and commands

## Development Conventions
As the codebase hasn't been established yet, here are the planned conventions:
- Follow standard naming conventions for the chosen technology stack
- Write comprehensive unit tests for all major functionality
- Maintain high code quality with linting and formatting tools
- Document all public APIs and user-facing features

## Planned Features
- Real-time typing speed calculation (WPM)
- Accuracy measurement
- Time-based or word-count-based challenges
- Leaderboards to track high scores
- Different difficulty levels and text complexity
- Multiplayer competition modes
- Typing statistics and progress tracking

## File Structure
```
TYPE/
├── README.md          # Basic project description
├── GEMINI.md          # Gemini-specific documentation (currently empty)
├── QWEN.md            # This file - Qwen-specific documentation
├── (Future files)     # Source code, assets, configurations
```

## Version 3.0 Implementation - Settings & Profile Management

Version 3.0 represents a major update focusing on user customization and settings management. The implementation includes:

### New Features Implemented:
1. **Settings Screen Architecture**:
   - Complete settings management interface
   - Profile picture upload and management system
   - Game settings (audio, difficulty, sensitivity)
   - Account settings (username, password changes)

2. **Technical Implementation**:
   - **Frontend**: Pure JavaScript with FileReader API for image handling
   - **Storage**: localStorage for user data and Base64-encoded profile pictures
   - **Validation**: Client-side validation for file uploads and user inputs
   - **State Management**: Automatic settings persistence and application

3. **Key Components**:
   - `showSettingsScreen()`: Main settings screen navigation
   - `handleProfilePictureUpload()`: Image processing and validation
   - `saveSettings()`: Settings persistence management
   - `applySettings()`: Real-time application of game settings

4. **User Experience**:
   - Intuitive interface with clear visual feedback
   - Responsive design for all screen sizes
   - Error handling and user guidance
   - One-click save and reset functionality

### Code Architecture Patterns:
- **Modular Design**: Separate functions for different settings categories
- **Event-Driven**: Button clicks trigger specific handler functions
- **Data Validation**: Comprehensive input validation before processing
- **Error Handling**: Graceful degradation and user-friendly error messages

### Performance Optimizations:
- Profile pictures are compressed when stored
- Settings are loaded on-demand
- Efficient localStorage usage with proper cleanup
- Lazy initialization of settings components

## Future Implementation Notes
When implementing the game, the following aspects should be considered:
- Responsive design for different screen sizes
- Accessibility features for keyboard navigation
- Support for different languages and keyboard layouts
- Performance optimization for real-time feedback
- Data persistence for user profiles and scores

## Contribution Guidelines
To be defined once the codebase is established:
- Preferred development workflow
- Code review process
- Issue tracking and project management
- Communication channels