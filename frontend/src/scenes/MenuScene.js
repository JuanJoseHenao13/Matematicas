import Phaser from 'phaser';
import api from '../services/api';

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    const width = this.scale.width;
    const height = this.scale.height;

    // Animated gradient background
    this.createAnimatedBackground(width, height);

    // Title with glow effect
    this.createTitle(width, height);

    // Menu buttons with enhanced design
    this.createStyledButton(width / 2, height * 0.45, 280, 70, '🎮 JUGAR', 0x00ff88, () => {
      this.scene.start('ProfileScene');
    });

    this.createStyledButton(width / 2, height * 0.58, 280, 70, '🚪 CERRAR SESIÓN', 0xff4466, () => {
      api.logout();
      this.scene.start('LoginScene');
    });

    // Instructions with glass panel
    this.createInstructionsPanel(width, height);
  }

  createAnimatedBackground(width, height) {
    // Gradient background
    const gradient = this.add.graphics();
    gradient.fillGradientStyle(0x0a0a2e, 0x1a1a4e, 0x2a2a6e, 0x1a1a4e);
    gradient.fillRect(0, 0, width, height);
    
    // Animated particles
    this.particles = [];
    for (let i = 0; i < 60; i++) {
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
    const title = this.add.text(width / 2, height * 0.12, 'MATHRIFT', {
      fontSize: '90px',
      fontFamily: 'Arial Black',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#00ffff',
      strokeThickness: 10
    }).setOrigin(0.5);
    
    // Title glow effect
    const titleGlow = this.add.text(width / 2, height * 0.12, 'MATHRIFT', {
      fontSize: '90px',
      fontFamily: 'Arial Black',
      color: '#00ffff',
      fontStyle: 'bold',
      blur: 25
    }).setOrigin(0.5).setAlpha(0.3);
    
    // Subtitle
    this.add.text(width / 2, height * 0.20, '⚔️ BOWMASTERS MATH ⚔️', {
      fontSize: '40px',
      fontFamily: 'Arial Black',
      color: '#ffd700',
      fontStyle: 'bold',
      stroke: '#ff8800',
      strokeThickness: 5
    }).setOrigin(0.5);
    
    // Animate title
    this.tweens.add({
      targets: [title, titleGlow],
      scale: 1.05,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  createInstructionsPanel(width, height) {
    const panelY = height * 0.75;
    
    // Glass panel
    const panel = this.add.graphics();
    panel.fillStyle(0x1a1a3e, 0.8);
    panel.fillRoundedRect(width / 2 - 300, panelY - 60, 600, 120, 15);
    panel.lineStyle(2, 0x00ffff, 0.5);
    panel.strokeRoundedRect(width / 2 - 300, panelY - 60, 600, 120, 15);
    
    // Instructions text
    this.add.text(width / 2, panelY - 15, '🎯 CÓMO JUGAR', {
      fontSize: '22px',
      fontFamily: 'Arial Black',
      color: '#00ffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    this.add.text(width / 2, panelY + 15, 'Arrastra el mouse para apuntar y suelta para disparar', {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);
    
    this.add.text(width / 2, panelY + 40, '¡Calcula la trayectoria perfecta con matemáticas!', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#ffd700',
      align: 'center',
      fontStyle: 'italic'
    }).setOrigin(0.5);
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
      fontSize: '26px',
      fontFamily: 'Arial Black',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 5
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
      buttonText.setScale(1.15);
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
    if (this.particles) {
      this.particles.forEach(p => p.destroy());
    }
  }
}
