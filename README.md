# TYPE - Space Typing Game

This game is about typing as fast as you can! The faster you type, the higher your score. Compete with friends and see who can achieve the highest words per minute (WPM)! You are in outer space. One word equals 1 bullet. Longer words equal more powerful bullets. Shoot down the asteroids by typing the words before they reach your spaceship. But that is not all that is just level 1! As you progress through the levels, the asteroids will get faster and more frequent. Power-ups will also appear that can help you out, such as shields, x2 more powerful bullets, and also slow down time. Can you survive the asteroid field and become the ultimate typing champion?

## Current Status

The basic game structure is now implemented with:

- Main menu with difficulty selection
- Gameplay screen with spaceship, asteroids, and typing input
- Scoring system based on word length
- WPM (Words Per Minute) calculation
- Accuracy tracking
- Level progression as score increases
- Asteroid movement and collision detection
- Game over screen with stats

## Technologies Used

- HTML5
- CSS3
- JavaScript (ES6+)

## How to Play

1. Create an account or sign in using the authentication screen
2. Click "START MISSION" to begin the game
3. Type the words shown on the falling asteroids and press Enter
4. Successfully typing a word destroys the asteroid and increases your score
5. Longer words give more points
6. Don't let asteroids reach the bottom of the screen - each asteroid that reaches the bottom costs you one life
7. You start with 3 lives - try to survive as long as possible to achieve the highest score!
8. Press P on your keyboard to pause/resume the game during gameplay
9. Toggle music on/off using the music button (🎵) and adjust volume with the slider
10. View your profile and personal best scores from the game over screen

## File Structure

```
TYPE/
├── index.html      # Main game HTML structure
├── styles.css      # Styling for the game
├── script.js       # Game logic and mechanics
├── README.md       # This file
├── GEMINI.md       # Gemini-specific documentation
└── QWEN.md         # Qwen-specific documentation
```

## Future Improvements

Planned enhancements include:
- Power-up system (shields, double damage, slow motion)
- More sophisticated bullet mechanics
- Visual effects for explosions and hits
- Sound effects
- Improved asteroid generation with more diverse words
- Leaderboard integration

## Multiplayer Functionality

The game now includes multiplayer functionality with join codes:

- Click "COMPETE WITH FRIENDS!" to generate a unique join code to share with friends
- Friends can use "ENTER JOIN CODE FOR GAME SIMULATION" to join the game using the provided code
- Valid join codes will start the game after a 3-2-1 countdown
- Invalid join codes will display an error message
