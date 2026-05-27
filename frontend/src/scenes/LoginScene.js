import Phaser from 'phaser';
import api from '../services/api';

export default class LoginScene extends Phaser.Scene {
  constructor() {
    super({ key: 'LoginScene' });
  }

  create() {
    const width = this.scale.width;
    const height = this.scale.height;

    // Animated gradient background
    this.createAnimatedBackground(width, height);

    // Title with glow effect
    this.createTitle(width, height);

    // Form container with glass effect
    const formY = height * 0.38;
    this.createFormContainer(width, height, formY);
    
    // Username input
    this.add.text(width * 0.3, formY - 80, '👤 USUARIO', {
      fontSize: '18px',
      fontFamily: 'Arial Black',
      color: '#00ffff',
      fontStyle: 'bold'
    }).setOrigin(0, 0.5);

    this.usernameInput = this.createStyledInput(width * 0.5, formY - 80, 300, 45, 'player1');

    // Email input
    this.add.text(width * 0.3, formY, '📧 EMAIL', {
      fontSize: '18px',
      fontFamily: 'Arial Black',
      color: '#00ffff',
      fontStyle: 'bold'
    }).setOrigin(0, 0.5);

    this.emailInput = this.createStyledInput(width * 0.5, formY, 300, 45, 'player1@test.com');

    // Password input
    this.add.text(width * 0.3, formY + 80, '🔒 CONTRASEÑA', {
      fontSize: '18px',
      fontFamily: 'Arial Black',
      color: '#00ffff',
      fontStyle: 'bold'
    }).setOrigin(0, 0.5);

    this.passwordInput = this.createStyledInput(width * 0.5, formY + 80, 300, 45, '123456', true);

    // Register button
    this.createStyledButton(width / 2, formY + 170, 220, 55, 'REGISTRARSE', 0x00ff88, () => {
      this.handleRegister();
    });

    // Login button
    this.createStyledButton(width / 2, formY + 240, 220, 55, 'INICIAR SESIÓN', 0x0088ff, () => {
      this.handleLogin();
    });

    // Error message with animation
    this.errorText = this.add.text(width / 2, formY + 320, '', {
      fontSize: '20px',
      fontFamily: 'Arial Black',
      color: '#ff4444',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5).setVisible(false);
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
    // Main title with glow
    const title = this.add.text(width / 2, height * 0.15, 'MATHRIFT', {
      fontSize: '80px',
      fontFamily: 'Arial Black',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#00ffff',
      strokeThickness: 8
    }).setOrigin(0.5);
    
    // Title glow effect
    const titleGlow = this.add.text(width / 2, height * 0.15, 'MATHRIFT', {
      fontSize: '80px',
      fontFamily: 'Arial Black',
      color: '#00ffff',
      fontStyle: 'bold',
      blur: 20
    }).setOrigin(0.5).setAlpha(0.3);
    
    // Subtitle
    this.add.text(width / 2, height * 0.23, '⚔️ BOWMASTERS MATH ⚔️', {
      fontSize: '36px',
      fontFamily: 'Arial Black',
      color: '#ffd700',
      fontStyle: 'bold',
      stroke: '#ff8800',
      strokeThickness: 4
    }).setOrigin(0.5);
    
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

  createFormContainer(width, height, formY) {
    const container = this.add.graphics();
    
    // Glass effect background
    container.fillStyle(0x1a1a3e, 0.8);
    container.fillRoundedRect(width / 2 - 250, formY - 120, 500, 400, 20);
    
    // Border with gradient
    container.lineStyle(3, 0x00ffff, 1);
    container.strokeRoundedRect(width / 2 - 250, formY - 120, 500, 400, 20);
    
    // Corner accents
    const cornerSize = 15;
    container.fillStyle(0x00ffff);
    container.fillRect(width / 2 - 250, formY - 120, cornerSize, 3);
    container.fillRect(width / 2 - 250, formY - 120, 3, cornerSize);
    container.fillRect(width / 2 + 250 - cornerSize, formY - 120, cornerSize, 3);
    container.fillRect(width / 2 + 250 - 3, formY - 120, 3, cornerSize);
    container.fillRect(width / 2 - 250, formY + 280 - 3, cornerSize, 3);
    container.fillRect(width / 2 - 250, formY + 280 - cornerSize, 3, cornerSize);
    container.fillRect(width / 2 + 250 - cornerSize, formY + 280 - 3, cornerSize, 3);
    container.fillRect(width / 2 + 250 - 3, formY + 280 - cornerSize, 3, cornerSize);
  }

  createStyledInput(x, y, width, height, defaultValue, isPassword = false) {
    const input = document.createElement('input');
    input.type = isPassword ? 'password' : 'text';
    input.value = defaultValue;
    input.style.position = 'absolute';
    input.style.left = `${x - width / 2}px`;
    input.style.top = `${y - height / 2}px`;
    input.style.width = `${width}px`;
    input.style.height = `${height}px`;
    input.style.fontSize = '18px';
    input.style.padding = '12px';
    input.style.border = '2px solid #00ffff';
    input.style.borderRadius = '10px';
    input.style.backgroundColor = 'rgba(26, 26, 62, 0.95)';
    input.style.color = '#ffffff';
    input.style.fontFamily = 'Arial';
    input.style.boxShadow = '0 0 10px rgba(0, 255, 255, 0.3)';
    input.style.transition = 'all 0.3s ease';
    input.style.zIndex = '10000';
    document.body.appendChild(input);
    
    // Add focus effect
    input.addEventListener('focus', () => {
      input.style.boxShadow = '0 0 20px rgba(0, 255, 255, 0.6)';
      input.style.borderColor = '#00ff88';
      input.style.transform = 'scale(1.02)';
    });
    
    input.addEventListener('blur', () => {
      input.style.boxShadow = '0 0 10px rgba(0, 255, 255, 0.3)';
      input.style.borderColor = '#00ffff';
      input.style.transform = 'scale(1)';
    });
    
    return input;
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
    button.fillRoundedRect(x - width / 2, y - height / 2, width, height, 10);
    
    // Button border
    button.lineStyle(3, 0xffffff, 0.5);
    button.strokeRoundedRect(x - width / 2, y - height / 2, width, height, 10);
    
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
      button.fillRoundedRect(x - width / 2, y - height / 2, width, height, 10);
      button.lineStyle(3, 0xffffff, 0.8);
      button.strokeRoundedRect(x - width / 2, y - height / 2, width, height, 10);
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
      button.fillRoundedRect(x - width / 2, y - height / 2, width, height, 10);
      button.lineStyle(3, 0xffffff, 0.5);
      button.strokeRoundedRect(x - width / 2, y - height / 2, width, height, 10);
      buttonText.setScale(1);
    });
    
    button.on('pointerdown', callback);
    
    return button;
  }

  async handleRegister() {
    const username = this.usernameInput.value;
    const email = this.emailInput.value;
    const password = this.passwordInput.value;

    if (!username || !email || !password) {
      this.showError('⚠️ Por favor completa todos los campos');
      return;
    }

    this.errorText.setText('🔄 Registrando...');
    this.errorText.setVisible(true);
    this.errorText.setColor('#00ffff');
    
    const result = await api.register(username, email, password);

    if (result.success) {
      this.cleanupInputs();
      this.scene.start('MenuScene');
    } else {
      this.showError('❌ ' + result.error);
    }
  }

  async handleLogin() {
    const email = this.emailInput.value;
    const password = this.passwordInput.value;

    if (!email || !password) {
      this.showError('⚠️ Por favor completa email y contraseña');
      return;
    }

    this.errorText.setText('🔄 Iniciando sesión...');
    this.errorText.setVisible(true);
    this.errorText.setColor('#00ffff');
    
    const result = await api.login(email, password);

    if (result.success) {
      this.cleanupInputs();
      this.scene.start('MenuScene');
    } else {
      this.showError('❌ ' + result.error);
    }
  }

  showError(message) {
    this.errorText.setText(message);
    this.errorText.setVisible(true);
    this.errorText.setColor('#ff4444');
    
    // Shake animation
    this.tweens.add({
      targets: this.errorText,
      x: this.errorText.x + 10,
      duration: 50,
      yoyo: true,
      repeat: 5,
      onComplete: () => {
        this.errorText.x = this.scale.width / 2;
      }
    });
  }

  cleanupInputs() {
    if (this.usernameInput) this.usernameInput.remove();
    if (this.emailInput) this.emailInput.remove();
    if (this.passwordInput) this.passwordInput.remove();
  }

  shutdown() {
    this.cleanupInputs();
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
