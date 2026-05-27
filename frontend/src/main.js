import Phaser from 'phaser';
import WelcomeScene from './scenes/WelcomeScene';
import LoginScene from './scenes/LoginScene';
import ProfileScene from './scenes/ProfileScene';
import GameModeScene from './scenes/GameModeScene';
import MenuScene from './scenes/MenuScene';
import MatchmakingScene from './scenes/MatchmakingScene';
import GameScene from './scenes/GameScene';

const config = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  parent: 'game-container',
  backgroundColor: '#1a1a2e',
  scene: [WelcomeScene, LoginScene, ProfileScene, GameModeScene, MenuScene, MatchmakingScene, GameScene],
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  }
};

const game = new Phaser.Game(config);

window.addEventListener('resize', () => {
  game.scale.resize(window.innerWidth, window.innerHeight);
});
