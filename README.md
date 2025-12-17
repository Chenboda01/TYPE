# TYPE - Space Typing Game

This game is about typing as fast as you can! The faster you type, the higher your score. Compete with friends and see who can achieve the highest words per minute (WPM)! You are in outer space. One word equals 1 bullet. Longer words equal more powerful bullets. Shoot down the asteroids by typing the words before they reach your spaceship. But that is not all that is just level 1! As you progress through the levels, the asteroids will get faster and more frequent. Power-ups will also appear that can help you out, such as shields, x2 more powerful bullets, and also slow down time. Can you survive the asteroid field and become the ultimate typing champion?

## Current Status

The basic game structure is now implemented with:

- Main menu with difficulty selection
- Gameplay screen with spaceship, space objects (comets, planets, stars, meteors), and typing input
- Scoring system based on space object names length
- WPM (Words Per Minute) calculation
- Accuracy tracking
- Level progression as score increases
- Space object movement and collision detection
- Game over screen with stats

## Technologies Used

- HTML5
- CSS3
- JavaScript (ES6+)

## How to Play

1. Click "START MISSION" to begin the game
2. Type the words shown on the falling asteroids and press Enter
3. Successfully typing a word destroys the asteroid and increases your score
4. Longer words give more points
5. Don't let asteroids reach the bottom of the screen
6. Try to survive as long as possible to achieve the highest score!

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
- Multiplayer functionality
- Leaderboard integration
