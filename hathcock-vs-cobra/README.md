# Hathcock vs Cobra

A thrilling 3D sniper duel game built with Three.js, where you take on the role of legendary Marine sniper Carlos Hathcock in a tense showdown against the infamous cobra.

## Features

- First-person sniper gameplay with realistic scope mechanics
- Dynamic enemy AI that responds to your actions
- Realistic ammo management system
  - Single round chamber loading
  - Limited reserve ammo
  - Manual and automatic reloading
- Atmospheric environment with day/night cycle
- Immersive sound effects and visual feedback

## Controls

- **Mouse Movement**: Aim
- **Left Click**: Fire
- **R**: Manual Reload
- **ESC**: Menu

## Game Mechanics

### Sniper Mechanics
- Realistic scope sway and breathing effects
- Wind and distance affect bullet trajectory
- Limited ammo requires strategic shooting

### Ammo System
- Chamber holds 1 round at a time
- 5 rounds in reserve by default
- Auto-reload when chamber is empty
- Manual reload option
- Visual ammo counter and reload indicator

### Enemy AI
- Dynamic positioning and cover usage
- Reactive to player shots and movement
- Progressive difficulty scaling

## Technical Details

### Built With
- Three.js for 3D graphics
- Custom physics for bullet trajectory
- Advanced particle systems for effects
- Spatial audio for immersive sound

### Performance
- Optimized 3D models and textures
- Efficient render pipeline
- Smooth gameplay on modern browsers

## Development Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`
4. Open `http://localhost:3000` in your browser

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Inspired by the real-life duel between Carlos Hathcock and the cobra
- 3D models and textures from various open-source contributors
- Sound effects from open-source libraries