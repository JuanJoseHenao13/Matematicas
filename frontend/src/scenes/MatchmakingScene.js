import Phaser from 'phaser';
import api from '../services/api';

export default class MatchmakingScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MatchmakingScene' });
  }

  create() {
    const width = this.scale.width;
    const height = this.scale.height;

    // Animated gradient background
    this.createAnimatedBackground(width, height);

    // Title with glow effect
    this.createTitle(width, height);

    // Enhanced loading animation
    this.createLoadingAnimation(width, height);

    // Cancel button
    this.createStyledButton(width / 2, height * 0.75, 220, 55, '❌ CANCELAR', 0xff4466, () => {
      this.scene.start('MenuScene');
    });

    // Start matchmaking
    this.startMatchmaking();
  }

  createAnimatedBackground(width, height) {
    // Gradient background
    const gradient = this.add.graphics();
    gradient.fillGradientStyle(0x0a0a2e, 0x1a1a4e, 0x2a2a6e, 0x1a1a4e);
    gradient.fillRect(0, 0, width, height);
    
    // Animated particles
    this.particles = [];
    for (let i = 0; i < 70; i++) {
      const particle = this.add.circle(
        Phaser.Math.Between(0, width),
        Phaser.Math.Between(0, height),
        Phaser.Math.Between(2, 6),
        Phaser.Utils.Array.GetRandom([0x00ffff, 0xff00ff, 0x00ff88, 0xff8800, 0xffd700])
      ).setAlpha(Phaser.Math.Between(0.2, 0.6));
      
      this.particles.push(particle);
      
      // Float animation
      this.tweens.add({
        targets: particle,
        y: particle.y - Phaser.Math.Between(50, 200),
        alpha: 0,
        duration: Phaser.Math.Between(4000, 8000),
        yoyo: true,
        repeat: -1,
        delay: Phaser.Math.Between(0, 3000)
      });
    }
  }

  createTitle(width, height) {
    // Main title with glow
    const title = this.add.text(width / 2, height * 0.25, '🔍 BUSCANDO OPONENTE', {
      fontSize: '56px',
      fontFamily: 'Arial Black',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#00ffff',
      strokeThickness: 8
    }).setOrigin(0.5);
    
    // Title glow effect
    const titleGlow = this.add.text(width / 2, height * 0.25, '🔍 BUSCANDO OPONENTE', {
      fontSize: '56px',
      fontFamily: 'Arial Black',
      color: '#00ffff',
      fontStyle: 'bold',
      blur: 20
    }).setOrigin(0.5).setAlpha(0.3);
    
    // Animate title
    this.tweens.add({
      targets: [title, titleGlow],
      scale: 1.05,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  createLoadingAnimation(width, height) {
    // Create spinning circles
    this.circles = [];
    const centerX = width / 2;
    const centerY = height * 0.5;
    const radius = 60;
    
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 / 8) * i;
      const circle = this.add.circle(
        centerX + Math.cos(angle) * radius,
        centerY + Math.sin(angle) * radius,
        12,
        Phaser.Utils.Array.GetRandom([0x00ffff, 0xff00ff, 0x00ff88, 0xffd700])
      );
      
      this.circles.push(circle);
      
      // Animate each circle
      this.tweens.add({
        targets: circle,
        scale: 0.5,
        alpha: 0.3,
        duration: 1000,
        yoyo: true,
        repeat: -1,
        delay: i * 100
      });
    }
    
    // Rotate the entire group
    this.rotationGroup = this.add.container(centerX, centerY, this.circles);
    this.tweens.add({
      targets: this.rotationGroup,
      rotation: Math.PI * 2,
      duration: 3000,
      repeat: -1,
      ease: 'Linear'
    });
    
    // Loading text
    this.loadingText = this.add.text(centerX, centerY + 120, 'BUSCANDO JUGADOR...', {
      fontSize: '28px',
      fontFamily: 'Arial Black',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#00ffff',
      strokeThickness: 4
    }).setOrigin(0.5);
    
    // Pulse text
    this.tweens.add({
      targets: this.loadingText,
      alpha: 0.5,
      duration: 1000,
      yoyo: true,
      repeat: -1
    });
  }

  async startMatchmaking() {
    // Poll for match
    this.matchmakingEvent = this.time.addEvent({
      delay: 2000,
      callback: async () => {
        const result = await api.findMatch();
        
        if (result.success) {
          if (result.data.status === 'MATCHED') {
            this.matchmakingEvent.remove();
            
            // Store gameId in registry for GameScene
            this.registry.set('gameId', result.data.gameId);
            
            // Show matched animation
            this.showMatchedAnimation();
          }
          // If still QUEUED, continue polling
        } else {
          this.matchmakingEvent.remove();
          this.showError(result.error);
        }
      },
      loop: true
    });
  }

  showMatchedAnimation() {
    const width = this.scale.width;
    const height = this.scale.height;
    
    // Stop rotation
    if (this.rotationGroup) {
      this.tweens.killTweensOf(this.rotationGroup);
    }
    
    // Show matched message
    const matchedText = this.add.text(width / 2, height * 0.5, '✅ ¡OPONENTE ENCONTRADO!', {
      fontSize: '48px',
      fontFamily: 'Arial Black',
      color: '#00ff88',
      fontStyle: 'bold',
      stroke: '#ffffff',
      strokeThickness: 6
    }).setOrigin(0.5);
    
    // Animate matched text
    this.tweens.add({
      targets: matchedText,
      scale: 1.5,
      duration: 500,
      yoyo: true,
      repeat: 2,
      ease: 'Elastic.easeOut',
      onComplete: () => {
        this.scene.start('GameScene');
      }
    });
  }

  showError(error) {
    const width = this.scale.width;
    const height = this.scale.height;
    
    // Stop rotation
    if (this.rotationGroup) {
      this.tweens.killTweensOf(this.rotationGroup);
    }
    
    // Show error
    const errorText = this.add.text(width / 2, height * 0.6, '❌ ' + error, {
      fontSize: '24px',
      fontFamily: 'Arial Black',
      color: '#ff4444',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);
    
    // Shake animation
    this.tweens.add({
      targets: errorText,
      x: errorText.x + 10,
      duration: 50,
      yoyo: true,
      repeat: 5,
      onComplete: () => {
        errorText.x = width / 2;
      }
    });
  }

  createStyledButton(x, y, width, height, text, color, callback) {
    const button = this.add.graphics();
    
    // Button gradient
    button.fillGradientStyle(
      color,
      Phaser.Display.Color.ValueToColor(color).lighten(20).color,
      Phaser.Display.Color.ValueToColor(color).darken(10).color,
      Phaser.Display.Color.ValueToColor(color).darken(20).color
    );
    button.fillRoundedRect(x - width / 2, y - height / 2, width, height, 15);
    
    // Button border
    button.lineStyle(3, 0xffffff, 0.5);
    button.strokeRoundedRect(x - width / 2, y - height / 2, width, height, 15);
    
    // Make interactive
    button.setInteractive(
      new Phaser.Geom.Rectangle(x - width / 2, y - height / 2, width, height),
      Phaser.Geom.Rectangle.Contains
    );
    
    // Button text
    const buttonText = this.add.text(x, y, text, {
      fontSize: '22px',
      fontFamily: 'Arial Black',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);
    
    // Hover effect
    button.on('pointerover', () => {
      button.clear();
      button.fillGradientStyle(
        Phaser.Display.Color.ValueToColor(color).lighten(30).color,
        Phaser.Display.Color.ValueToColor(color).lighten(40).color,
        Phaser.Display.Color.ValueToColor(color).lighten(10).color,
        Phaser.Display.Color.ValueToColor(color).lighten(20).color
      );
      button.fillRoundedRect(x - width / 2, y - height / 2, width, height, 15);
      button.lineStyle(3, 0xffffff, 0.8);
      button.strokeRoundedRect(x - width / 2, y - height / 2, width, height, 15);
      buttonText.setScale(1.1);
    });
    
    button.on('pointerout', () => {
      button.clear();
      button.fillGradientStyle(
        color,
        Phaser.Display.Color.ValueToColor(color).lighten(20).color,
        Phaser.Display.Color.ValueToColor(color).darken(10).color,
        Phaser.Display.Color.ValueToColor(color).darken(20).color
      );
      button.fillRoundedRect(x - width / 2, y - height / 2, width, height, 15);
      button.lineStyle(3, 0xffffff, 0.5);
      button.strokeRoundedRect(x - width / 2, y - height / 2, width, height, 15);
      buttonText.setScale(1);
    });
    
    button.on('pointerdown', callback);
    
    return button;
  }

  shutdown() {
    if (this.matchmakingEvent) this.matchmakingEvent.remove();
    if (this.particles) {
      this.particles.forEach(p => p.destroy());
    }
    if (this.circles) {
      this.circles.forEach(c => c.destroy());
    }
  }
}
