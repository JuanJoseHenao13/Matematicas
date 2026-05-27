import Phaser from 'phaser';

export default class ProfileScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ProfileScene' });
  }

  create() {
    const width = this.scale.width;
    const height = this.scale.height;

    // Animated background
    this.createAnimatedBackground(width, height);

    // Title
    this.createTitle(width, height);

    // Profile panel
    this.createProfilePanel(width, height);

    // Back button
    this.createStyledButton(80, 40, 120, 50, '← ATRÁS', 0xff4466, () => {
      this.scene.start('MenuScene');
    });

    // Continue button
    this.createStyledButton(width / 2, height * 0.85, 280, 70, 'CONTINUAR →', 0x00ff88, () => {
      this.scene.start('GameModeScene');
    });
  }

  createAnimatedBackground(width, height) {
    // Deep, cartoonish animated background (procedural - no external images needed)
    const sky = this.add.graphics();
    sky.fillGradientStyle(0x06111f, 0x102040, 0x203060, 0x101828);
    sky.fillRect(0, 0, width, height);

    // Generate a small star texture to reuse for particles
    if (!this.textures.exists('tinyStar')) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0xffffff, 1);
      g.fillCircle(4, 4, 4);
      g.generateTexture('tinyStar', 8, 8);
      g.destroy();
    }

    // Big nebula blobs (soft, colorful)
    this.nebulaClouds = [];
    const nebulaColors = [0xff66cc, 0x8844ff, 0x44ddff, 0xffbb44];
    for (let i = 0; i < 6; i++) {
      const cloud = this.add.graphics();
      const color = Phaser.Utils.Array.GetRandom(nebulaColors);
      cloud.fillStyle(color, 0.18);
      const r = Phaser.Math.Between(120, 320);
      cloud.fillEllipse(Phaser.Math.Between(-r * 0.3, width + r * 0.3), Phaser.Math.Between(height * 0.1, height * 0.7), r * 2, r);
      this.nebulaClouds.push(cloud);
      this.tweens.add({
        targets: cloud,
        alpha: 0.08,
        duration: Phaser.Math.Between(9000, 18000),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }

    // Particle field of stars using generated texture
    this.starEmitter = this.add.particles(0, 0, 'tinyStar', {
      x: { min: 0, max: width },
      y: { min: 0, max: height * 0.75 },
      speedY: { min: -10, max: -40 },
      lifespan: { min: 4000, max: 12000 },
      scale: { start: 0.6, end: 0.1 },
      alpha: { start: 1, end: 0 },
      quantity: 2,
      blendMode: 'ADD'
    });

    // Floating decorative emoji/icons for a cartoon feel
    const icons = ['⭐', '🎯', '💥', '💎', '🔥'];
    for (let i = 0; i < 10; i++) {
      const ico = this.add.text(Phaser.Math.Between(50, width - 50), Phaser.Math.Between(50, height - 150), Phaser.Utils.Array.GetRandom(icons), {
        fontSize: `${Phaser.Math.Between(24, 48)}px`
      }).setAlpha(0.9);
      this.tweens.add({
        targets: ico,
        y: ico.y + Phaser.Math.Between(-40, 40),
        x: ico.x + Phaser.Math.Between(-30, 30),
        angle: Phaser.Math.Between(-15, 15),
        duration: Phaser.Math.Between(2000, 6000),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
        delay: Phaser.Math.Between(0, 1200)
      });
    }

    // Ambient glow patch at bottom
    const ambientGlow = this.add.graphics();
    ambientGlow.fillGradientStyle(0x1a1a3e, 0x2a2a5e, 0x3a3a7e, 0x2a2a5e);
    ambientGlow.fillRect(0, height - 240, width, 240);
    ambientGlow.setAlpha(0.28);
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
    const title = this.add.text(width / 2, height * 0.1, '👤 PERFIL PREMIUM', {
      fontSize: '56px',
      fontFamily: 'Arial Black',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#00d4ff',
      strokeThickness: 8
    }).setOrigin(0.5);

    this.add.text(width / 2, height * 0.18, 'Controla tu progreso y alcanza el siguiente nivel', {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#cbd5e1',
      wordWrap: { width: width * 0.8 }
    }).setOrigin(0.5);

    const titleGlow = this.add.text(width / 2, height * 0.1, '👤 PERFIL PREMIUM', {
      fontSize: '56px',
      fontFamily: 'Arial Black',
      color: '#00d4ff',
      fontStyle: 'bold',
      blur: 25
    }).setOrigin(0.5).setAlpha(0.25);

    this.tweens.add({
      targets: [title, titleGlow],
      scale: 1.04,
      duration: 2400,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  createProfilePanel(width, height) {
    const panelY = height * 0.55;
    const panelWidth = 680;
    const panelHeight = 520;

    const panel = this.add.graphics();
    panel.fillGradientStyle(0x111827, 0x0f172a, 0x111827, 0x0b1120);
    panel.fillRoundedRect(width / 2 - panelWidth / 2, panelY - panelHeight / 2, panelWidth, panelHeight, 30);
    panel.lineStyle(3, 0x38bdf8, 0.3);
    panel.strokeRoundedRect(width / 2 - panelWidth / 2, panelY - panelHeight / 2, panelWidth, panelHeight, 30);

    const overlay = this.add.graphics();
    overlay.fillStyle(0xffffff, 0.04);
    overlay.fillRoundedRect(width / 2 - panelWidth / 2, panelY - panelHeight / 2, panelWidth, panelHeight, 30);

    const accent = this.add.graphics();
    accent.fillStyle(0x38bdf8, 0.15);
    accent.fillRoundedRect(width / 2 - panelWidth / 2 + 14, panelY - panelHeight / 2 + 14, panelWidth - 28, 120, 22);

    this.add.circle(width / 2, panelY - 170, 70, 0x0f172a).setStrokeStyle(4, 0x38bdf8, 0.8);
    this.add.circle(width / 2, panelY - 170, 34, 0x38bdf8).setAlpha(0.9);
    this.add.text(width / 2, panelY - 170, 'JM', {
      fontSize: '32px',
      fontFamily: 'Arial Black',
      color: '#0f172a',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const username = userData.username || 'Jugador';

    this.add.text(width / 2, panelY - 90, username, {
      fontSize: '38px',
      fontFamily: 'Arial Black',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(width / 2, panelY - 45, (userData.email || 'Sin correo registrado'), {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#94a3b8'
    }).setOrigin(0.5);

    this.createStat(width / 2 - 180, panelY + 30, 'VICTORIAS', userData.wins || 0, 0x22c55e);
    this.createStat(width / 2, panelY + 30, 'DERROTAS', userData.losses || 0, 0xf97316);
    this.createStat(width / 2 + 180, panelY + 30, 'MONEDAS', userData.coins || 0, 0xfacc15);

    this.add.text(width / 2, panelY + 170, 'Nivel actual', {
      fontSize: '16px',
      fontFamily: 'Arial Black',
      color: '#94a3b8'
    }).setOrigin(0.5);

    this.createProgressBar(width / 2, panelY + 210, 0.78, 0x38bdf8);
    this.add.text(width / 2, panelY + 250, '78% hasta Nivel 8', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#cbd5e1'
    }).setOrigin(0.5);
  }

  createStat(x, y, label, value, color) {
    const bg = this.add.graphics();
    bg.fillStyle(0x111827, 0.85);
    bg.fillRoundedRect(x - 90, y - 55, 180, 110, 18);
    bg.lineStyle(2, color, 0.45);
    bg.strokeRoundedRect(x - 90, y - 55, 180, 110, 18);

    this.add.text(x, y - 20, label, {
      fontSize: '14px',
      fontFamily: 'Arial Black',
      color: '#94a3b8'
    }).setOrigin(0.5);

    this.add.text(x, y + 25, value.toString(), {
      fontSize: '34px',
      fontFamily: 'Arial Black',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
  }

  createProgressBar(x, y, ratio, color) {
    const width = 420;
    const height = 18;

    const barBg = this.add.graphics();
    barBg.fillStyle(0x334155, 0.7);
    barBg.fillRoundedRect(x - width / 2, y - height / 2, width, height, 12);

    const barFg = this.add.graphics();
    barFg.fillStyle(color, 1);
    barFg.fillRoundedRect(x - width / 2, y - height / 2, width * Phaser.Math.Clamp(ratio, 0, 1), height, 12);
  }

  createStyledButton(x, y, width, height, text, color, callback) {
    const button = this.add.graphics();
    
    button.fillGradientStyle(
      color,
      Phaser.Display.Color.ValueToColor(color).lighten(20).color,
      Phaser.Display.Color.ValueToColor(color).darken(10).color,
      Phaser.Display.Color.ValueToColor(color).darken(20).color
    );
    button.fillRoundedRect(x - width / 2, y - height / 2, width, height, 15);
    
    button.lineStyle(3, 0xffffff, 0.5);
    button.strokeRoundedRect(x - width / 2, y - height / 2, width, height, 15);
    
    button.setInteractive(
      new Phaser.Geom.Rectangle(x - width / 2, y - height / 2, width, height),
      Phaser.Geom.Rectangle.Contains
    );
    
    const buttonText = this.add.text(x, y, text, {
      fontSize: '24px',
      fontFamily: 'Arial Black',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);
    
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
    if (this.particles) {
      this.particles.forEach(p => p.destroy());
    }
  }
}
