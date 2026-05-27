import Phaser from 'phaser';

export default class WelcomeScene extends Phaser.Scene {
  constructor() {
    super({ key: 'WelcomeScene' });
  }

  create() {
    const width = this.scale.width;
    const height = this.scale.height;

    // Animated gradient background
    this.createAnimatedBackground(width, height);

    // Title with glow
    this.createTitle(width, height);

    // Play button
    this.createStyledButton(width / 2, height * 0.6, 300, 80, '🎮 JUGAR', 0x00ff88, () => {
      this.scene.start('LoginScene');
    });

    // Subtitle
    this.add.text(width / 2, height * 0.85, 'Bowmasters Math - MathRift', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffd700',
      fontStyle: 'italic'
    }).setOrigin(0.5);
  }

  createAnimatedBackground(width, height) {
    // Deep space gradient with multiple layers
    const sky = this.add.graphics();
    
    // Layer 1: Deep purple/blue gradient
    sky.fillGradientStyle(0x050510, 0x101030, 0x202050, 0x151535);
    sky.fillRect(0, 0, width, height);
    
    // Layer 2: Nebula effect
    const nebula1 = this.add.graphics();
    nebula1.fillGradientStyle(0x1a0033, 0x330066, 0x1a0033, 0x330066);
    nebula1.fillCircle(width * 0.3, height * 0.4, 350);
    nebula1.setAlpha(0.3);
    
    const nebula2 = this.add.graphics();
    nebula2.fillGradientStyle(0x001a33, 0x003366, 0x001a33, 0x003366);
    nebula2.fillCircle(width * 0.7, height * 0.5, 300);
    nebula2.setAlpha(0.25);
    
    // Layer 3: Animated nebula clouds
    this.nebulaClouds = [];
    for (let i = 0; i < 6; i++) {
      const cloud = this.add.graphics();
      const colors = [0x4a0080, 0x004a80, 0x804a00, 0x80004a];
      const color = Phaser.Utils.Array.GetRandom(colors);
      
      cloud.fillStyle(color, 0.15);
      cloud.fillCircle(
        Phaser.Math.Between(0, width),
        Phaser.Math.Between(0, height * 0.6),
        Phaser.Math.Between(150, 350)
      );
      
      this.nebulaClouds.push(cloud);
      
      this.tweens.add({
        targets: cloud,
        x: cloud.x + Phaser.Math.Between(-60, 60),
        y: cloud.y + Phaser.Math.Between(-40, 40),
        alpha: 0.1,
        scale: 1.2,
        duration: Phaser.Math.Between(8000, 15000),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
    
    // Layer 4: Stars with different sizes and colors
    this.stars = [];
    const starColors = [0xffffff, 0xffffcc, 0xccffff, 0xffcccc, 0xccffcc];
    
    for (let i = 0; i < 180; i++) {
      const star = this.add.circle(
        Phaser.Math.Between(0, width),
        Phaser.Math.Between(0, height * 0.7),
        Phaser.Math.Between(1, 4),
        Phaser.Utils.Array.GetRandom(starColors)
      ).setAlpha(Phaser.Math.Between(0.4, 1));
      
      this.stars.push(star);
      
      this.tweens.add({
        targets: star,
        alpha: 0.2,
        scale: 0.5,
        duration: Phaser.Math.Between(1000, 3000),
        yoyo: true,
        repeat: -1,
        delay: Phaser.Math.Between(0, 2000),
        ease: 'Sine.easeInOut'
      });
    }
    
    // Layer 5: Shooting stars
    this.createShootingStars(width, height);
    
    // Layer 6: Ambient glow at bottom
    const ambientGlow = this.add.graphics();
    ambientGlow.fillGradientStyle(0x1a1a3e, 0x2a2a5e, 0x3a3a7e, 0x2a2a5e);
    ambientGlow.fillRect(0, height - 250, width, 250);
    ambientGlow.setAlpha(0.3);
  }

  createShootingStars(width, height) {
    this.time.addEvent({
      delay: 3000,
      callback: () => {
        this.createShootingStar(width, height);
      },
      loop: true
    });
  }

  createShootingStar(width, height) {
    const startX = Phaser.Math.Between(0, width);
    const startY = Phaser.Math.Between(0, height * 0.3);
    
    const shootingStar = this.add.graphics();
    shootingStar.lineStyle(3, 0xffffff, 1);
    shootingStar.moveTo(startX, startY);
    shootingStar.lineTo(startX - 100, startY + 50);
    shootingStar.strokePath();
    
    const glow = this.add.graphics();
    glow.fillStyle(0xffffff, 0.3);
    glow.fillCircle(startX, startY, 15);
    
    this.tweens.add({
      targets: [shootingStar, glow],
      x: startX - 300,
      y: startY + 150,
      alpha: 0,
      duration: 1000,
      ease: 'Linear',
      onComplete: () => {
        shootingStar.destroy();
        glow.destroy();
      }
    });
  }

  createTitle(width, height) {
    const title = this.add.text(width / 2, height * 0.25, 'MATHRIFT', {
      fontSize: '100px',
      fontFamily: 'Arial Black',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#00ffff',
      strokeThickness: 12
    }).setOrigin(0.5);
    
    const titleGlow = this.add.text(width / 2, height * 0.25, 'MATHRIFT', {
      fontSize: '100px',
      fontFamily: 'Arial Black',
      color: '#00ffff',
      fontStyle: 'bold',
      blur: 30
    }).setOrigin(0.5).setAlpha(0.3);
    
    this.add.text(width / 2, height * 0.35, '⚔️ BOWMASTERS MATH ⚔️', {
      fontSize: '45px',
      fontFamily: 'Arial Black',
      color: '#ffd700',
      fontStyle: 'bold',
      stroke: '#ff8800',
      strokeThickness: 6
    }).setOrigin(0.5);
    
    this.tweens.add({
      targets: [title, titleGlow],
      scale: 1.05,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  createStyledButton(x, y, width, height, text, color, callback) {
    const button = this.add.graphics();
    
    button.fillGradientStyle(
      color,
      Phaser.Display.Color.ValueToColor(color).lighten(20).color,
      Phaser.Display.Color.ValueToColor(color).darken(10).color,
      Phaser.Display.Color.ValueToColor(color).darken(20).color
    );
    button.fillRoundedRect(x - width / 2, y - height / 2, width, height, 20);
    
    button.lineStyle(4, 0xffffff, 0.5);
    button.strokeRoundedRect(x - width / 2, y - height / 2, width, height, 20);
    
    button.setInteractive(
      new Phaser.Geom.Rectangle(x - width / 2, y - height / 2, width, height),
      Phaser.Geom.Rectangle.Contains
    );
    
    const buttonText = this.add.text(x, y, text, {
      fontSize: '32px',
      fontFamily: 'Arial Black',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5);
    
    button.on('pointerover', () => {
      button.clear();
      button.fillGradientStyle(
        Phaser.Display.Color.ValueToColor(color).lighten(30).color,
        Phaser.Display.Color.ValueToColor(color).lighten(40).color,
        Phaser.Display.Color.ValueToColor(color).lighten(10).color,
        Phaser.Display.Color.ValueToColor(color).lighten(20).color
      );
      button.fillRoundedRect(x - width / 2, y - height / 2, width, height, 20);
      button.lineStyle(4, 0xffffff, 0.8);
      button.strokeRoundedRect(x - width / 2, y - height / 2, width, height, 20);
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
      button.fillRoundedRect(x - width / 2, y - height / 2, width, height, 20);
      button.lineStyle(4, 0xffffff, 0.5);
      button.strokeRoundedRect(x - width / 2, y - height / 2, width, height, 20);
      buttonText.setScale(1);
    });
    
    button.on('pointerdown', callback);
    
    return button;
  }

  shutdown() {
    if (this.particles) {
      this.particles.forEach(p => p.destroy());
    }
    if (this.stars) {
      this.stars.forEach(s => s.destroy());
    }
    if (this.nebulaClouds) {
      this.nebulaClouds.forEach(c => c.destroy());
    }
  }
}
