import Phaser from 'phaser';
import api from '../services/api';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    const width = this.scale.width;
    const height = this.scale.height;

    this.gameId = this.registry.get('gameId');
    this.gameMode = this.registry.get('gameMode') || 'cpu';
    this.isMyTurn = true;
    this.isAiming = false;
    this.isAnimating = false;
    this.gameOver = false;
    this.groundHeight = 140;
    this.turnSeconds = 15;
    this.turnRemaining = this.turnSeconds;
    this.endTurnQueued = false;
    this.wind = 0;

    this.backgroundStyles = ['desert', 'forest', 'snow'];
    this.backgroundStyle = Phaser.Utils.Array.GetRandom(this.backgroundStyles);
    this.createBackground(width, height, this.backgroundStyle);
    this.createGround(width, height);
    this.createPlayers(width, height);
    this.createHud(width, height);
    this.createAimingUI(width, height);
    this.createSceneEffects(width, height);
    this.setupInput();

    this.trajectoryPreview = [];

    this.hintText.setText('Arrastra hacia atrás y suelta para disparar');

    this.sceneWidth = width;
    this.sceneHeight = height;

    this.beginTurn();

    if (this.gameMode === 'cpu' && !this.isMyTurn) {
      this.scheduleCPUTurn();
    }
  }

  beginTurn() {
    if (this.gameOver) return;

    this.turnRemaining = this.turnSeconds;
    this.wind = Phaser.Math.Between(-22, 22);
    this.turnText.setText(this.isMyTurn ? 'TU TURNO' : 'TURNO OPONENTE');
    this.turnText.setColor(this.isMyTurn ? '#22c55e' : '#3b82f6');
    this.updateHudDetails();

    if (this.turnTimerEvent) {
      this.turnTimerEvent.remove(false);
    }

    this.turnTimerEvent = this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
        if (this.gameOver) return;
        this.turnRemaining = Math.max(0, this.turnRemaining - 1);
        this.updateHudDetails();

        if (this.turnRemaining === 0) {
          if (this.isAnimating) {
            this.endTurnQueued = true;
          } else {
            this.endTurnDueToTimeout();
          }
        }
      }
    });
  }

  endTurnDueToTimeout() {
    if (this.gameOver) return;

    this.showFeedback('TIEMPO', '#f97316');
    this.isMyTurn = !this.isMyTurn;
    this.beginTurn();

    if (this.gameMode === 'cpu' && !this.isMyTurn) {
      this.scheduleCPUTurn();
    }
  }

  createBackground(width, height, style = 'desert') {
    // Clear any previous background elements container
    if (!this.bgElements) this.bgElements = [];
    // draw different styles
    if (style === 'desert') {
      this.sun = this.add.circle(width * 0.8, height * 0.18, 70, 0xfff1a5).setBlendMode(Phaser.BlendModes.ADD).setDepth(0);
      this.tweens.add({
        targets: this.sun,
        scale: 1.08,
        alpha: 0.85,
        duration: 2600,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });

      this.dunes = [];
      const duneColors = [0xff9c4a, 0xff7b3b, 0xffb96d];
      for (let i = 0; i < 3; i++) {
        const dune = this.add.graphics().setDepth(0);
        dune.fillStyle(duneColors[i], 1 - i * 0.16);
        const duneHeight = height * (0.18 + i * 0.08);
        dune.fillEllipse(width * (0.25 + i * 0.25), height - duneHeight / 2 - 60, width * (0.95 - i * 0.2), duneHeight);
        this.dunes.push(dune);
        this.tweens.add({
          targets: dune,
          x: '+=24',
          duration: 16000 + i * 1200,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
      }

      if (!this.textures.exists('dust')) {
        const dust = this.make.graphics({ add: false });
        dust.fillStyle(0xffffff, 1);
        dust.fillCircle(2, 2, 2);
        dust.generateTexture('dust', 5, 5);
        dust.destroy();
      }

      this.dustParticles = this.add.particles(0, height - 80, 'dust', {
        x: { min: 0, max: width },
        y: { min: height - 90, max: height - 70 },
        lifespan: { min: 2600, max: 5000 },
        speedX: { min: -12, max: 12 },
        scale: { start: 0.65, end: 0.12 },
        alpha: { start: 0.45, end: 0 },
        quantity: 1,
        frequency: 280,
        blendMode: 'NORMAL'
      }).setDepth(0);
      this.bgElements.push(this.sun, ...this.dunes, this.dustParticles);
    } else if (style === 'forest') {
      // simple forest background
      const sky = this.add.graphics();
      sky.fillGradientStyle(0x8ec5ff, 0xcfe9ff, 0x8ec5ff, 0xcfe9ff);
      sky.fillRect(0, 0, width, height);
      const trees = [];
      for (let i = 0; i < 6; i++) {
        const tree = this.add.graphics();
        const tx = width * (i / 6) + Phaser.Math.Between(-40, 40);
        tree.fillStyle(0x145214, 1);
        tree.fillTriangle(tx, height - 80, tx - 30, height, tx + 30, height);
        trees.push(tree);
      }
      this.bgElements.push(sky, ...trees);
    } else if (style === 'snow') {
      const sky = this.add.graphics();
      sky.fillGradientStyle(0xdbeaff, 0xf2f8ff, 0xdbeaff, 0xf2f8ff);
      sky.fillRect(0, 0, width, height);
      const hills = this.add.graphics();
      hills.fillStyle(0xffffff, 1);
      hills.fillEllipse(width * 0.5, height - 40, width * 1.2, 140);
      this.bgElements.push(sky, hills);
    }
  }

  createGround(width, height) {
    const ground = this.add.graphics();
    ground.fillStyle(0x8d2a16);
    ground.fillRect(0, height - this.groundHeight, width, this.groundHeight);

    ground.fillGradientStyle(0xcc5f32, 0xae3715, 0x8d2a16, 0xbd5b2f, 1);
    ground.fillRect(0, height - this.groundHeight, width, 32);

    for (let x = 0; x < width; x += 20) {
      ground.fillStyle(0xffffff, 0.07);
      ground.fillCircle(x + Phaser.Math.Between(-8, 8), height - this.groundHeight + Phaser.Math.Between(12, 40), Phaser.Math.Between(1, 3));
    }
  }

  clearBackground() {
    if (!this.bgElements) return;
    this.bgElements.forEach((el) => {
      if (el && el.destroy) el.destroy();
    });
    this.bgElements.length = 0;
    this.dunes = null;
    if (this.dustParticles) {
      try { this.dustParticles.destroy(); } catch (e) {}
      this.dustParticles = null;
    }
    if (this.sun) { try { this.sun.destroy(); } catch (e) {} this.sun = null; }
  }

  createPlayers(width, height) {
    const playerY = height - this.groundHeight - 40;
    this.playerLeft = this.createCharacter(width * 0.18, playerY, 0x22c55e, 'JUGADOR');
    this.playerRight = this.createCharacter(width * 0.82, playerY, 0x3b82f6, 'OPONENTE');
  }

  /**
   * Crea un personaje detallado con diseño profesional estilo Bowmasters
   * @param {number} x - Posición X del personaje
   * @param {number} y - Posición Y del personaje
   * @param {number} color - Color principal del personaje (hexadecimal)
   * @param {string} label - Nombre/etiqueta del personaje
   * @returns {object} Objeto con el contenedor, barra de vida y propiedades del personaje
   */
  createCharacter(x, y, color, label) {
    const container = this.add.container(x, y);
    
    // ===== AURA ANIMADA =====
    // Crea un efecto de brillo alrededor del personaje
    const aura = this.add.graphics();
    aura.fillStyle(color, 0.15);
    aura.fillCircle(0, -20, 70);
    aura.lineStyle(3, color, 0.4);
    aura.strokeCircle(0, -20, 70);
    container.add(aura);
    
    // Anima el aura con pulsación
    this.tweens.add({
      targets: aura,
      scale: 1.15,
      alpha: 0.25,
      duration: 1800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
    
    // ===== SOMBRA =====
    // Sombra debajo del personaje para dar profundidad
    const shadow = this.add.graphics();
    shadow.fillStyle(0x000000, 0.4);
    shadow.fillEllipse(0, 25, 65, 18);
    container.add(shadow);
    
    // ===== PIERNAS =====
    // Piernas con gradiente y detalles
    const legColor = Phaser.Display.Color.ValueToColor(color).darken(35).color;
    const leftLeg = this.add.graphics();
    leftLeg.fillGradientStyle(legColor, Phaser.Display.Color.ValueToColor(legColor).lighten(15).color, legColor, Phaser.Display.Color.ValueToColor(legColor).darken(15).color);
    leftLeg.fillEllipse(-14, 8, 14, 22);
    leftLeg.lineStyle(2, 0x000000, 0.2);
    leftLeg.strokeEllipse(-14, 8, 14, 22);
    
    const rightLeg = this.add.graphics();
    rightLeg.fillGradientStyle(legColor, Phaser.Display.Color.ValueToColor(legColor).lighten(15).color, legColor, Phaser.Display.Color.ValueToColor(legColor).darken(15).color);
    rightLeg.fillEllipse(14, 8, 14, 22);
    rightLeg.lineStyle(2, 0x000000, 0.2);
    rightLeg.strokeEllipse(14, 8, 14, 22);
    
    container.add([leftLeg, rightLeg]);
    
    // ===== CUERPO =====
    // Cuerpo principal con armadura detallada
    const body = this.add.graphics();
    body.fillGradientStyle(
      color,
      Phaser.Display.Color.ValueToColor(color).lighten(25).color,
      Phaser.Display.Color.ValueToColor(color).darken(15).color,
      Phaser.Display.Color.ValueToColor(color).darken(25).color
    );
    body.fillEllipse(0, -15, 65, 55);
    body.lineStyle(4, 0xffffff, 0.5);
    body.strokeEllipse(0, -15, 65, 55);
    container.add(body);
    
    // Armadura en el pecho
    const armor = this.add.graphics();
    armor.fillStyle(0x2a2a2a, 0.7);
    armor.fillEllipse(0, -15, 38, 38);
    armor.lineStyle(3, 0xffd700, 0.8);
    armor.strokeEllipse(0, -15, 38, 38);
    container.add(armor);
    
    // Detalles de la armadura
    armor.fillStyle(0x1a1a1a, 0.6);
    armor.fillEllipse(0, -15, 28, 28);
    armor.lineStyle(2, 0xffd700, 0.6);
    armor.strokeEllipse(0, -15, 28, 28);
    
    // Cinturón
    const belt = this.add.graphics();
    belt.fillStyle(0x5c3a21);
    belt.fillRect(-28, 2, 56, 10);
    belt.lineStyle(2, 0x3d2512);
    belt.strokeRect(-28, 2, 56, 10);
    // Hebilla del cinturón
    belt.fillStyle(0xffd700);
    belt.fillCircle(0, 7, 8);
    belt.lineStyle(2, 0xb8860b);
    belt.strokeCircle(0, 7, 8);
    container.add(belt);
    
    // ===== CABEZA =====
    // Cabeza con piel detallada
    const head = this.add.graphics();
    head.fillGradientStyle(0xffd7b7, 0xffe4d4, 0xe8c4a4, 0xd4a574);
    head.fillCircle(0, -55, 30);
    head.lineStyle(3, 0x000000, 0.25);
    head.strokeCircle(0, -55, 30);
    container.add(head);
    
    // ===== PELO =====
    // Pelo con múltiples capas para volumen
    const hair = this.add.graphics();
    const hairColor = label === 'JUGADOR' ? 0x3d2817 : 0x1a0a0a;
    hair.fillGradientStyle(hairColor, Phaser.Display.Color.ValueToColor(hairColor).lighten(20).color, hairColor, Phaser.Display.Color.ValueToColor(hairColor).darken(20).color);
    hair.fillCircle(0, -65, 32);
    hair.fillEllipse(-12, -60, 18, 24);
    hair.fillEllipse(12, -60, 18, 24);
    hair.fillEllipse(-8, -70, 14, 18);
    hair.fillEllipse(8, -70, 14, 18);
    container.add(hair);
    
    // ===== OJOS =====
    // Ojos con iris, pupilas y brillo
    const eyeWhite = this.add.graphics();
    eyeWhite.fillStyle(0xffffff);
    eyeWhite.fillCircle(-12, -58, 8);
    eyeWhite.fillCircle(12, -58, 8);
    eyeWhite.lineStyle(2, 0x000000, 0.4);
    eyeWhite.strokeCircle(-12, -58, 8);
    eyeWhite.strokeCircle(12, -58, 8);
    container.add(eyeWhite);
    
    // Iris con color del equipo
    const irisColor = label === 'JUGADOR' ? 0x22c55e : 0x3b82f6;
    const iris = this.add.graphics();
    iris.fillStyle(irisColor);
    iris.fillCircle(-12, -58, 5);
    iris.fillCircle(12, -58, 5);
    container.add(iris);
    
    // Pupilas
    const pupil = this.add.graphics();
    pupil.fillStyle(0x000000);
    pupil.fillCircle(-12, -58, 3);
    pupil.fillCircle(12, -58, 3);
    container.add(pupil);
    
    // Brillo en los ojos
    const eyeShine = this.add.graphics();
    eyeShine.fillStyle(0xffffff);
    eyeShine.fillCircle(-14, -60, 2);
    eyeShine.fillCircle(10, -60, 2);
    container.add(eyeShine);
    
    // ===== CEJAS =====
    // Cejas expresivas
    const eyebrows = this.add.graphics();
    eyebrows.lineStyle(3, hairColor, 1);
    eyebrows.beginPath();
    eyebrows.moveTo(-22, -68);
    eyebrows.lineTo(-4, -65);
    eyebrows.moveTo(22, -68);
    eyebrows.lineTo(4, -65);
    eyebrows.strokePath();
    container.add(eyebrows);
    
    // ===== NARIZ =====
    // Nariz sutil
    const nose = this.add.graphics();
    nose.lineStyle(2, 0xc4a882, 0.6);
    nose.beginPath();
    nose.moveTo(0, -52);
    nose.lineTo(-2, -48);
    nose.lineTo(2, -48);
    nose.strokePath();
    container.add(nose);
    
    // ===== BOCA =====
    // Boca con sonrisa
    const mouth = this.add.graphics();
    mouth.lineStyle(3, 0x8b4513, 1);
    mouth.beginPath();
    mouth.moveTo(-10, -42);
    mouth.lineTo(-5, -38);
    mouth.lineTo(0, -37);
    mouth.lineTo(5, -38);
    mouth.lineTo(10, -42);
    mouth.strokePath();
    container.add(mouth);
    
    // ===== BARBILLA =====
    // Barbilla sutil
    const chin = this.add.graphics();
    chin.fillStyle(0xe8c4a4, 0.5);
    chin.fillEllipse(0, -38, 10, 6);
    container.add(chin);
    
    // ===== GORRA/CASCO =====
    // Gorra con diseño detallado
    const cap = this.add.graphics();
    const capColor = label === 'JUGADOR' ? 0x1e40af : 0x7c2d12;
    cap.fillGradientStyle(capColor, Phaser.Display.Color.ValueToColor(capColor).lighten(20).color, capColor, Phaser.Display.Color.ValueToColor(capColor).darken(20).color);
    // Visera
    cap.fillRect(-32, -82, 64, 12);
    cap.lineStyle(2, 0x000000, 0.3);
    cap.strokeRect(-32, -82, 64, 12);
    // Cuerpo de la gorra
    cap.fillEllipse(0, -92, 56, 24);
    cap.lineStyle(3, 0x000000, 0.3);
    cap.strokeEllipse(0, -92, 56, 24);
    cap.setDepth(3);
    container.add(cap);
    
    // Logo en la gorra
    const capLogo = this.add.graphics();
    capLogo.fillStyle(0xffd700, 0.9);
    capLogo.fillCircle(0, -92, 10);
    capLogo.lineStyle(2, 0xb8860b, 1);
    capLogo.strokeCircle(0, -92, 10);
    capLogo.setDepth(4);
    container.add(capLogo);
    
    // Pluma en la gorra
    const feather = this.add.graphics();
    feather.fillStyle(color, 0.9);
    feather.beginPath();
    feather.moveTo(0, -104);
    feather.lineTo(8, -118);
    feather.lineTo(12, -104);
    feather.fillPath();
    feather.setDepth(4);
    container.add(feather);
    
    // ===== BRAZOS =====
    // Brazos con detalles de músculos
    const armColor = 0xffd7b7;
    const leftArm = this.add.graphics();
    leftArm.fillGradientStyle(armColor, Phaser.Display.Color.ValueToColor(armColor).lighten(10).color, armColor, Phaser.Display.Color.ValueToColor(armColor).darken(10).color);
    leftArm.fillEllipse(-22, -5, 12, 28);
    leftArm.lineStyle(2, 0x000000, 0.2);
    leftArm.strokeEllipse(-22, -5, 12, 28);
    
    const rightArm = this.add.graphics();
    rightArm.fillGradientStyle(armColor, Phaser.Display.Color.ValueToColor(armColor).lighten(10).color, armColor, Phaser.Display.Color.ValueToColor(armColor).darken(10).color);
    rightArm.fillEllipse(22, -5, 12, 28);
    rightArm.lineStyle(2, 0x000000, 0.2);
    rightArm.strokeEllipse(22, -5, 12, 28);
    
    container.add([leftArm, rightArm]);
    
    // ===== ARCO =====
    // Arco compuesto detallado
    const bow = this.add.graphics();
    // Cuerpo del arco
    bow.lineStyle(8, 0x5c3a21);
    bow.beginPath();
    bow.moveTo(-35, -20);
    bow.lineTo(-45, -30);
    bow.lineTo(-45, 30);
    bow.lineTo(-35, 20);
    bow.strokePath();
    // Curva del arco (usando líneas rectas)
    bow.lineStyle(6, 0x4a2a17);
    bow.beginPath();
    bow.moveTo(-45, -30);
    bow.lineTo(-52, -35);
    bow.lineTo(-55, -20);
    bow.lineTo(-55, 0);
    bow.lineTo(-55, 20);
    bow.lineTo(-52, 35);
    bow.lineTo(-45, 30);
    bow.strokePath();
    // Cuerda del arco
    bow.lineStyle(3, 0xcccccc, 0.95);
    bow.beginPath();
    bow.moveTo(-50, -38);
    bow.lineTo(-50, 38);
    bow.strokePath();
    container.add(bow);
    
    // ===== FLECHA =====
    // Flecha con punta y plumas
    const arrow = this.add.graphics();
    arrow.lineStyle(4, 0xcccccc);
    arrow.beginPath();
    arrow.moveTo(-45, 0);
    arrow.lineTo(-75, -5);
    arrow.strokePath();
    // Punta de flecha
    arrow.fillStyle(0xc0c0c0);
    arrow.beginPath();
    arrow.moveTo(-75, -5);
    arrow.lineTo(-85, -8);
    arrow.lineTo(-75, -2);
    arrow.fillPath();
    // Plumaje
    arrow.fillStyle(color);
    arrow.beginPath();
    arrow.moveTo(-45, 0);
    arrow.lineTo(-40, -3);
    arrow.lineTo(-45, 3);
    arrow.fillPath();
    container.add(arrow);
    
    // ===== ETIQUETA DE NOMBRE =====
    // Panel de nombre con glassmorphism
    const labelBg = this.add.graphics();
    labelBg.fillStyle(0x000000, 0.7);
    labelBg.fillRoundedRect(-70, 20, 140, 32, 12);
    labelBg.lineStyle(2, color, 0.8);
    labelBg.strokeRoundedRect(-70, 20, 140, 32, 12);
    // Esquinas decorativas
    labelBg.fillStyle(color, 0.9);
    labelBg.fillRect(-70, 20, 12, 3);
    labelBg.fillRect(-70, 20, 3, 12);
    labelBg.fillRect(58, 20, 12, 3);
    labelBg.fillRect(67, 20, 3, 12);
    labelBg.fillRect(-70, 49, 12, 3);
    labelBg.fillRect(-70, 46, 3, 12);
    labelBg.fillRect(58, 49, 12, 3);
    labelBg.fillRect(67, 46, 3, 12);
    container.add(labelBg);
    
    const labelText = this.add.text(0, 36, label, {
      fontFamily: 'Arial Black',
      fontSize: '20px',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);
    container.add(labelText);
    
    // ===== BARRA DE VIDA =====
    // Fondo de la barra de vida con gradiente
    const healthBarBg = this.add.graphics();
    healthBarBg.fillGradientStyle(0x1a1a1a, 0x2a2a2a, 0x1a1a1a, 0x2a2a2a);
    healthBarBg.fillRoundedRect(-72, -70, 144, 18, 12);
    healthBarBg.lineStyle(2, 0x000000, 0.5);
    healthBarBg.strokeRoundedRect(-72, -70, 144, 18, 12);
    container.add(healthBarBg);

    // Barra de vida con gradiente verde
    const healthBar = this.add.graphics();
    healthBar.fillGradientStyle(0x22c55e, 0x4ade80, 0x16a34a, 0x22c55e);
    healthBar.fillRoundedRect(-70, -68, 140, 14, 10);
    healthBar.lineStyle(2, 0xffffff, 0.3);
    healthBar.strokeRoundedRect(-70, -68, 140, 14, 10);
    container.add(healthBar);

    // Icono de corazón
    const heartIcon = this.add.text(-60, -61, '❤️', {
      fontSize: '14px'
    }).setOrigin(0.5);
    container.add(heartIcon);

    // ===== ANIMACIONES IDLE =====
    // Animación de respiración suave
    this.tweens.add({
      targets: container,
      y: y + 6,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Animación de rotación sutil
    this.tweens.add({
      targets: container,
      rotation: 0.03,
      duration: 2500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // ===== RETORNO =====
    // Retorna el objeto del personaje con todas sus propiedades
    container.setDepth(10);
    return {
      container,
      head,
      hair,
      leftArm,
      rightArm,
      bow,
      healthBar,
      health: 100,
      maxHealth: 100,
      x,
      y
    };
  }

  /**
   * Crea el HUD (Heads-Up Display) del juego
   * Muestra información del juego en la parte superior
   * @param {number} width - Ancho de la pantalla
   * @param {number} height - Alto de la pantalla
   */
  createHud(width, height) {
    // Panel principal del HUD con glassmorphism
    const panel = this.add.graphics();
    panel.fillStyle(0x091420, 0.82);
    panel.fillRoundedRect(16, 16, width - 32, 84, 24);
    panel.lineStyle(2, 0xffffff, 0.15);
    panel.strokeRoundedRect(16, 16, width - 32, 84, 24);

    this.turnText = this.add.text(36, 30, '', {
      fontFamily: 'Arial Black',
      fontSize: '28px',
      color: '#f8fafc'
    });

    this.timerText = this.add.text(36, 62, '', {
      fontFamily: 'Arial',
      fontSize: '16px',
      color: '#cbd5e1'
    });

    this.windText = this.add.text(width - 36, 62, '', {
      fontFamily: 'Arial',
      fontSize: '16px',
      color: '#cbd5e1'
    }).setOrigin(1, 0);

    this.modeText = this.add.text(width - 36, 30, '', {
      fontFamily: 'Arial Black',
      fontSize: '24px',
      color: '#f8fafc'
    }).setOrigin(1, 0);

    this.hintText = this.add.text(width / 2, 50, '', {
      fontFamily: 'Arial',
      fontSize: '18px',
      color: '#cbd5e1'
    }).setOrigin(0.5, 0);

    this.feedbackText = this.add.text(width / 2, height * 0.15, '', {
      fontFamily: 'Arial Black',
      fontSize: '42px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5).setAlpha(0);
  }

  /**
   * Actualiza los detalles del HUD (tiempo, viento, modo)
   * Se llama cada frame para mantener la información actualizada
   */
  updateHudDetails() {
    if (!this.timerText || !this.windText || !this.modeText) return;

    const seconds = `${this.turnRemaining}`.padStart(2, '0');
    this.timerText.setText(`Tiempo: ${seconds}s`);

    const arrow = this.wind === 0 ? '•' : this.wind > 0 ? '→' : '←';
    const windLabel = Math.abs(this.wind);
    this.windText.setText(`Viento: ${arrow} ${windLabel}`);

    this.modeText.setText(this.gameMode === 'cpu' ? 'VS CPU' : 'PVP');
  }

  /**
   * Crea la interfaz de apuntado (línea de mira, marcador, textos)
   * Permite al usuario visualizar la dirección y fuerza del disparo
   * @param {number} width - Ancho de la pantalla
   * @param {number} height - Alto de la pantalla
   */
  createAimingUI(width, height) {
    // Línea de apuntado con estilo punteado
    this.aimLine = this.add.graphics().setVisible(false);

    // Marcador de destino (círculo brillante)
    this.aimMarker = this.add.circle(0, 0, 12, 0xffffff, 0.9)
      .setStrokeStyle(3, 0xffd700)
      .setVisible(false);

    // Panel de potencia y ángulo
    this.powerAnglePanel = this.add.graphics();
    this.powerAnglePanel.fillStyle(0xffffff, 0.95);
    this.powerAnglePanel.fillRoundedRect(width / 2 - 100, height - 250, 200, 60, 15);
    this.powerAnglePanel.lineStyle(3, 0x000000, 0.3);
    this.powerAnglePanel.strokeRoundedRect(width / 2 - 100, height - 250, 200, 60, 15);
    this.powerAnglePanel.setVisible(false);

    // Texto de fórmula sobre el mouse
    this.formulaText = this.add.text(0, 0, '', {
      fontSize: '14px',
      fontFamily: 'monospace',
      color: '#00ffff',
      backgroundColor: '#000000aa',
      padding: { x: 8, y: 4 },
      align: 'center'
    }).setOrigin(0.5, 1).setVisible(false).setDepth(20);

    // Texto de potencia
    this.powerText = this.add.text(width / 2, height - 235, '', {
      fontSize: '18px',
      fontFamily: 'Arial Black',
      color: '#000000',
      fontStyle: 'bold'
    }).setOrigin(0.5).setVisible(false);

    // Texto de ángulo
    this.angleText = this.add.text(width / 2, height - 210, '', {
      fontSize: '18px',
      fontFamily: 'Arial Black',
      color: '#000000',
      fontStyle: 'bold'
    }).setOrigin(0.5).setVisible(false);

    // Array para almacenar puntos de previsualización de trayectoria
    this.trajectoryPreview = [];
  }

  /**
   * Configura el sistema de input (mouse/touch)
   * Maneja los eventos de apuntado y disparo
   */
  setupInput() {
    // Al presionar: inicia el apuntado
    this.input.on('pointerdown', (pointer) => {
      if (this.isAnimating || !this.isMyTurn) return;
      this.isAiming = true;
      this.aimStartX = this.playerLeft.container.x + 38;
      this.aimStartY = this.playerLeft.container.y - 18;
      this.aimLine.setVisible(true);
      this.aimMarker.setVisible(true);
      this.powerAnglePanel.setVisible(true);
      this.powerText.setVisible(true);
      this.angleText.setVisible(true);
      this.formulaText.setVisible(true);
    });

    // Al mover: actualiza la línea de apuntado
    this.input.on('pointermove', (pointer) => {
      if (!this.isAiming) return;
      this.updateAiming(pointer);
    });

    // Al soltar: ejecuta el disparo
    this.input.on('pointerup', async (pointer) => {
      if (!this.isAiming) return;
      this.isAiming = false;
      this.aimLine.clear().setVisible(false);
      this.aimMarker.setVisible(false);
      this.powerAnglePanel.setVisible(false);
      this.powerText.setVisible(false);
      this.angleText.setVisible(false);
      this.formulaText.setVisible(false);
      this.clearTrajectoryPreview();

      const dx = pointer.x - this.aimStartX;
      const dy = this.aimStartY - pointer.y;
      const distance = Phaser.Math.Clamp(Math.sqrt(dx * dx + dy * dy), 36, 600);
      const power = Phaser.Math.Clamp(distance / 2, 18, 300);
      const direction = dx >= 0 ? 1 : -1;
      const angle = Phaser.Math.Clamp(Math.abs(Math.atan2(dy, Math.abs(dx))), 0.17, Math.PI * 0.42);
      const angleDegrees = Phaser.Math.RadToDeg(angle);

      await this.fireShot(power, angleDegrees, direction);
    });
  }

  /**
   * Actualiza la línea de apuntado y la previsualización de trayectoria
   * @param {object} pointer - Objeto del puntero (mouse/touch)
   */
  updateAiming(pointer) {
    const dx = pointer.x - this.aimStartX;
    const dy = this.aimStartY - pointer.y;
    const rawDistance = Math.sqrt(dx * dx + dy * dy);
    const distance = Phaser.Math.Clamp(rawDistance, 16, 600);

    let targetX = this.aimStartX;
    let targetY = this.aimStartY;
    if (rawDistance > 0.001) {
      targetX = this.aimStartX + (dx / rawDistance) * distance;
      targetY = this.aimStartY - (dy / rawDistance) * distance;
    }

    this.aimLine.clear();
    this.aimLine.lineStyle(6, 0xffffff, 0.72);
    this.aimLine.beginPath();
    this.aimLine.moveTo(this.aimStartX, this.aimStartY);
    this.aimLine.lineTo(targetX, targetY);
    this.aimLine.strokePath();
    this.aimLine.setVisible(true);
    this.aimMarker.setPosition(targetX, targetY);

    const power = Phaser.Math.Clamp(distance / 2, 0, 300);
    const rawAngle = Math.atan2(dy, Math.abs(dx));
    const direction = dx >= 0 ? 1 : -1;
    const angleDegrees = Phaser.Math.RadToDeg(Math.abs(rawAngle));
    this.powerText.setText(`FUERZA ${Math.round(power)}%`);
    this.angleText.setText(`ÁNGULO ${Math.round(angleDegrees)}°`);
    
    const v0 = (power / 10).toFixed(1);
    const theta = Math.round(angleDegrees);
    const dirSign = direction === 1 ? '' : '-';
    this.formulaText.setText(`x(t) = ${dirSign}${v0}*cos(${theta}°)*t\ny(t) = ${v0}*sin(${theta}°)*t - ½(0.5)*t²`);
    this.formulaText.setPosition(pointer.x, pointer.y - 25);

    this.updateTrajectoryPreview(
      this.isMyTurn ? this.playerLeft.container.x + 38 : this.playerRight.container.x - 38,
      this.isMyTurn ? this.playerLeft.container.y - 18 : this.playerRight.container.y - 18,
      power,
      angleDegrees,
      direction
    );
  }

  /**
   * Actualiza la previsualización de la trayectoria del proyectil
   * Muestra puntos donde pasará el proyectil
   * @param {number} startX - Posición X inicial
   * @param {number} startY - Posición Y inicial
   * @param {number} power - Potencia del disparo
   * @param {number} angleDegrees - Ángulo en grados
   * @param {number} direction - Dirección (1 o -1)
   */
  updateTrajectoryPreview(startX, startY, power, angleDegrees, direction) {
    this.clearTrajectoryPreview();
    const points = this.calculateTrajectory(startX, startY, power, angleDegrees, direction);
    for (let i = 3; i < points.length; i += 3) {
      const dot = this.add.circle(points[i].x, points[i].y, 5, 0xffffff, 0.3).setDepth(8);
      this.trajectoryPreview.push(dot);
    }
  }

  /**
   * Limpia la previsualización de trayectoria
   */
  clearTrajectoryPreview() {
    this.trajectoryPreview.forEach((dot) => dot.destroy());
    this.trajectoryPreview.length = 0;
  }

  /**
   * Crea efectos de escena (partículas ambientales, etc.)
   * @param {number} width - Ancho de la pantalla
   * @param {number} height - Alto de la pantalla
   */
  createSceneEffects(width, height) {
    // Partículas flotantes ambientales
    this.ambientParticles = [];
    for (let i = 0; i < 30; i++) {
      const particle = this.add.circle(
        Phaser.Math.Between(0, width),
        Phaser.Math.Between(0, height),
        Phaser.Math.Between(2, 5),
        Phaser.Utils.Array.GetRandom([0x00ffff, 0xff00ff, 0x00ff88, 0xff8800])
      ).setAlpha(Phaser.Math.Between(0.2, 0.5));
      
      this.ambientParticles.push(particle);
      
      this.tweens.add({
        targets: particle,
        y: particle.y - Phaser.Math.Between(30, 80),
        alpha: 0.1,
        duration: Phaser.Math.Between(4000, 8000),
        yoyo: true,
        repeat: -1,
        delay: Phaser.Math.Between(0, 3000),
        ease: 'Sine.easeInOut'
      });
    }
  }

  /**
   * Calcula la trayectoria del proyectil usando física de proyectiles
   * @param {number} startX - Posición X inicial
   * @param {number} startY - Posición Y inicial
   * @param {number} power - Potencia del disparo
   * @param {number} angleDegrees - Ángulo en grados
   * @param {number} direction - Dirección (1 o -1)
   * @returns {Array} Array de puntos {x, y} de la trayectoria
   */
  calculateTrajectory(startX, startY, power, angleDegrees, direction) {
    const points = [];
    const gravity = 0.5;
    const velocityX = (power / 10) * Math.cos(angleDegrees * Math.PI / 180) * direction;
    const velocityY = (power / 10) * Math.sin(angleDegrees * Math.PI / 180);
    
    // Usar pasos más pequeños para una mayor resolución y evitar "saltar" sobre el objetivo
    for (let t = 0; t < 100; t += 0.5) {
      const x = velocityX * t;
      const y = velocityY * t - 0.5 * gravity * t * t;
      points.push({ x: startX + x, y: startY - y });
      
      // Detener si sale de la pantalla
      if (startY - y > this.scale.height) break;
    }
    
    return points;
  }

  /**
   * Ejecuta un disparo con la potencia y ángulo especificados
   * @param {number} power - Potencia del disparo (18-200)
   * @param {number} angleDegrees - Ángulo en grados
   * @param {number} direction - Dirección (1 o -1)
   */
  async fireShot(power, angleDegrees, direction) {
    if (this.isAnimating) return;
    
    this.isAnimating = true;
    
    // Guardar el turno actual (no cambiar `isMyTurn` aún; el turno se alternará al finalizar)
    const wasMyTurn = this.isMyTurn;

    // Pausar temporizador mientras se anima el proyectil para que el tiempo no avance
    if (this.turnTimerEvent) {
      this.turnTimerEvent.paused = true;
    }
    
    const startX = wasMyTurn ? this.playerLeft.container.x + 38 : this.playerRight.container.x - 38;
    const startY = wasMyTurn ? this.playerLeft.container.y - 18 : this.playerRight.container.y - 18;
    const target = wasMyTurn ? this.playerRight : this.playerLeft;

    let points, impact, hit, damageToApply, knockbackToApply, newTargetHealth;

    if (this.gameId && this.gameMode !== 'cpu') {
      // LLAMADA AL BACKEND PARA PARTIDAS MULTIJUGADOR / PVP
      const response = await api.shoot(this.gameId, power, angleDegrees, direction, 'spear');
      
      if (!response.success) {
        this.showFeedback('ERROR EN DISPARO', '#ec3131');
        this.isAnimating = false;
        if (this.turnTimerEvent) this.turnTimerEvent.paused = false;
        return;
      }
      
      const data = response.data;
      
      // Si el backend provee la trayectoria array (por README.md), invertir Y
      if (data.trajectory && data.trajectory.length > 0) {
        const baseY = this.scale.height - this.groundHeight;
        points = data.trajectory.map(pt => ({
          x: pt.x,
          y: baseY - pt.y
        }));
      } else {
        points = this.calculateTrajectory(startX, startY, power, angleDegrees, direction);
      }
      
      await this.animateProjectile(points, startX, startY, direction, target);
      
      // Resolver impacto y daño desde backend
      const baseY = this.scale.height - this.groundHeight;
      if (data.impactPoint) {
        impact = { x: data.impactPoint.x, y: baseY - data.impactPoint.y };
      } else if (data.impactX !== undefined) {
        impact = { x: data.impactX, y: baseY - data.impactY };
      } else {
        impact = points[points.length - 1];
      }
      
      hit = data.isHit;
      damageToApply = data.damage || 0;
      knockbackToApply = data.knockback || (direction * Math.round(damageToApply * 1.1));
      newTargetHealth = data.newTargetHealth !== undefined ? data.newTargetHealth : data.targetHealthAfterShot;
      
      // Mostrar info matemática si existe
      if (data.mathAnalysis) {
        console.log("Análisis matemático (Matemáticas 3):", data.mathAnalysis);
        // Podríamos mostrar esto en pantalla con un texto o panel pequeño
      }
      
    } else {
      // MODO LOCAL / CPU / PRÁCTICA
      points = this.calculateTrajectory(startX, startY, power, angleDegrees, direction);
      const result = await this.animateProjectile(points, startX, startY, direction, target);
      impact = result.impact || points[points.length - 1];
      hit = result.hit || this.isHitTarget(impact, target);
      damageToApply = Phaser.Math.Between(14, 26);
      knockbackToApply = direction * Math.round(damageToApply * 1.1);
    }

    this.createImpactEffect(impact.x, impact.y, hit);

    if (hit) {
      if (newTargetHealth !== undefined) {
        // Ajustamos la vida actual del target para que applyDamage cuadre exacto al restar
        target.health = newTargetHealth + damageToApply; 
      }
      this.applyDamage(target, damageToApply, knockbackToApply);
    } else {
      this.showFeedback('FALLASTE', '#ec3131');
    }
    
    this.isAnimating = false;
    // Reiniciar temporizador para el siguiente turno (se hará en beginTurn al cambiar turno)
    if (this.turnTimerEvent) {
      this.turnTimerEvent.remove(false);
      this.turnTimerEvent = null;
    }
    if (this.endTurnQueued) {
      this.endTurnQueued = false;
      this.endTurnDueToTimeout();
    } else {
      this.switchTurn();
    }
  }

  /**
   * Anima el proyectil a lo largo de la trayectoria calculada
   * @param {Array} points - Array de puntos de la trayectoria
   * @param {number} startX - Posición X inicial
   * @param {number} startY - Posición Y inicial
   * @param {number} direction - Dirección del disparo
   */
  async animateProjectile(points, startX, startY, direction, target = null) {
    // Crear flecha con forma de polígono
    const arrowPoints = [-16, -6, 24, 0, -16, 6];
    const projectile = this.add.polygon(startX, startY, arrowPoints, 0xff6d00).setDepth(11);
    
    const trails = [];
    let actualImpact = points[points.length - 1];
    let hit = false;
    let targetHitX;
    let targetHitY;

    if (target) {
      targetHitX = target.container.x;
      targetHitY = target.container.y - 18;
    }

    for (let i = 1; i < points.length; i++) {
      const point = points[i];
      const duration = Phaser.Math.Clamp(900 / points.length, 12, 40);
      
      // Crear trail
      const trail = this.add.circle(projectile.x, projectile.y, 6, 0xffc76b, 0.45).setDepth(9);
      trails.push(trail);
      this.tweens.add({
        targets: trail,
        x: point.x,
        y: point.y,
        alpha: 0,
        scale: 0.3,
        duration: duration * 1.2,
        ease: 'Sine.easeOut',
        onComplete: () => trail.destroy()
      });
      
      // Orientar flecha hacia el siguiente punto
      const angle = Phaser.Math.Angle.Between(projectile.x, projectile.y, point.x, point.y);
      projectile.rotation = angle;
      
      await new Promise((resolve) => {
        this.tweens.add({
          targets: projectile,
          x: point.x,
          y: point.y,
          duration,
          ease: 'Linear',
          onComplete: resolve
        });
      });

      if (target) {
        const distance = Phaser.Math.Distance.Between(point.x, point.y, targetHitX, targetHitY);
        actualImpact = point;
        if (distance < 55) {
          hit = true;
          break;
        }
      }
    }
    
    projectile.destroy();
    return { impact: actualImpact, hit };
  }

  /**
   * Verifica si el impacto golpeó al objetivo
   * @param {object} impact - Punto de impacto {x, y}
   * @param {object} target - Personaje objetivo
   * @returns {boolean} True si golpeó, False si falló
   */
  isHitTarget(impact, target) {
    const targetHitX = target.container.x;
    const targetHitY = target.container.y - 18;
    const distance = Phaser.Math.Distance.Between(impact.x, impact.y, targetHitX, targetHitY);
    return distance < 55;
  }

  /**
   * Crea efecto de impacto en la posición especificada
   * @param {number} x - Posición X del impacto
   * @param {number} y - Posición Y del impacto
   * @param {boolean} isHit - True si fue un golpe, False si fue fallo
   */
  createImpactEffect(x, y, isHit) {
    const explosion = this.add.graphics();
    const color = isHit ? 0xff4400 : 0x888888;
    
    explosion.fillStyle(color);
    explosion.fillCircle(x, y, 30);
    
    // Animar explosión
    this.tweens.add({
      targets: explosion,
      scale: 2,
      alpha: 0,
      duration: 500,
      onComplete: () => explosion.destroy()
    });
    
    // Screen shake si fue golpe
    if (isHit) {
      const wave = this.add.graphics();
      wave.lineStyle(3, 0xffd27f, 0.9);
      wave.strokeCircle(x, y, 16);
      this.tweens.add({
        targets: wave,
        scale: 3,
        alpha: 0,
        duration: 600,
        ease: 'Cubic.easeOut',
        onComplete: () => wave.destroy()
      });
      this.cameras.main.shake(200, 0.01);
    }
  }

  /**
   * Aplica daño al personaje objetivo
   * @param {object} target - Personaje objetivo
   * @param {number} damage - Cantidad de daño
   * @param {number} knockback - Fuerza de retroceso
   */
  applyDamage(target, damage, knockback) {
    target.health -= damage;
    target.healthBar.scaleX = target.health / 100;
    
    // Animación de knockback
    this.tweens.add({
      targets: target.container,
      x: target.container.x + knockback,
      duration: 200,
      ease: 'Power2'
    });
    
    this.showFeedback(`-${damage}`, '#ef4444');
    // Floating damage number
    const dmgText = this.add.text(target.container.x, target.container.y - 50, `-${damage}`, {
      fontSize: '22px',
      fontFamily: 'Arial Black',
      color: '#ff4444',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5).setDepth(14);
    this.tweens.add({
      targets: dmgText,
      y: dmgText.y - 30,
      alpha: 0,
      duration: 900,
      ease: 'Cubic.easeOut',
      onComplete: () => dmgText.destroy()
    });
    
    if (target.health <= 0) {
      this.endGame(target === this.playerLeft ? 'OPONENTE' : 'JUGADOR');
    }
  }

  /**
   * Cambia el turno entre jugadores
   */
  switchTurn() {
    this.isMyTurn = !this.isMyTurn;

    if (this.turnTimerEvent) {
      this.turnTimerEvent.remove(false);
      this.turnTimerEvent = null;
    }

    this.beginTurn();
    this.tweens.add({
      targets: this.turnText,
      scale: 1.3,
      duration: 300,
      yoyo: true,
      ease: 'Elastic.easeOut'
    });

    if (this.cpuTurnEvent && this.isMyTurn) {
      this.cpuTurnEvent.remove(false);
      this.cpuTurnEvent = null;
    }
    
    // Si es modo CPU y es turno del oponente, activar CPU
    if (this.gameMode === 'cpu' && !this.isMyTurn) {
      this.scheduleCPUTurn();
    }
  }

  /**
   * Programa el turno de la CPU
   */
  scheduleCPUTurn() {
    if (this.cpuTurnEvent) {
      this.cpuTurnEvent.remove(false);
      this.cpuTurnEvent = null;
    }
    this.cpuTurnEvent = this.time.delayedCall(1400, () => {
      this.cpuShoot();
    });
  }

  /**
   * Ejecuta el disparo de la CPU
   */
  async cpuShoot() {
    if (this.isAnimating || this.gameMode !== 'cpu') {
      return;
    }

    this.isAnimating = true;
    this.turnText.setText('CPU DISPARANDO...');
    this.turnText.setColor('#f97316');

    if (this.turnTimerEvent) {
      this.turnTimerEvent.paused = true;
    }

    const direction = -1;
    const startX = this.playerRight.container.x - 28;
    const startY = this.playerRight.container.y - 40;
    const target = this.playerLeft;
    const targetX = target.container.x + 8;
    const targetY = target.container.y - 18;
    const horizontalDistance = Math.abs(targetX - startX);

    // Usamos una fórmula directa para el lanzamiento.
    // El motor usa V = power / 10 y g = 0.5.
    const baseAngle = Phaser.Math.Clamp(40 + (horizontalDistance - 260) * 0.02 + Phaser.Math.Between(-2, 2), 28, 68);
    let angle = baseAngle;
    const radians = Phaser.Math.DegToRad(angle);
    const requiredPower = Phaser.Math.Clamp(
      Math.round(10 * Math.sqrt(horizontalDistance / Math.max(0.01, 2 * Math.sin(2 * radians)))),
      35,
      300
    );

    let power = Phaser.Math.Clamp(requiredPower + Phaser.Math.Between(-6, 6), 35, 300);
    let trajectory = this.calculateTrajectory(startX, startY, power, angle, direction);
    let impact = this.findImpactPoint(trajectory, target);

    if (!impact) {
      for (let attempt = 0; attempt < 8 && !impact; attempt++) {
        if (trajectory[trajectory.length - 1].x < targetX) {
          power = Phaser.Math.Clamp(power + Phaser.Math.Between(12, 22), 35, 300);
        } else {
          power = Phaser.Math.Clamp(power + Phaser.Math.Between(-6, 4), 35, 300);
          angle = Phaser.Math.Clamp(angle + Phaser.Math.Between(-4, 4), 28, 68);
        }
        trajectory = this.calculateTrajectory(startX, startY, power, angle, direction);
        impact = this.findImpactPoint(trajectory, target);
      }
    }

    if (!impact) {
      impact = trajectory[trajectory.length - 1];
    }

    const result = await this.animateProjectile(trajectory, startX, startY, direction, target);
    const impactPoint = result.impact || impact;
    const hit = result.hit || this.isHitTarget(impactPoint, target);
    this.createImpactEffect(impactPoint.x, impactPoint.y, hit);

    if (hit) {
      const damage = Phaser.Math.Between(14, 26);
      const knockback = direction * Math.round(damage * 1.1);
      this.applyDamage(target, damage, knockback);
    } else {
      this.showFeedback('CPU FALLA', '#f87171');
    }

    this.isAnimating = false;
    if (this.turnTimerEvent) {
      this.turnTimerEvent.remove(false);
      this.turnTimerEvent = null;
    }
    if (this.endTurnQueued) {
      this.endTurnQueued = false;
      this.endTurnDueToTimeout();
    } else {
      this.switchTurn();
    }
  }

  /**
   * Encuentra el punto de impacto en la trayectoria
   * @param {Array} trajectory - Array de puntos de la trayectoria
   * @param {object} target - Personaje objetivo
   * @returns {object|null} Punto de impacto o null
   */
  findImpactPoint(trajectory, target) {
    const targetHitX = target.container.x;
    const targetHitY = target.container.y - 18;
    for (let i = 0; i < trajectory.length; i++) {
      const point = trajectory[i];
      const distance = Phaser.Math.Distance.Between(point.x, point.y, targetHitX, targetHitY);
      if (distance < 55) {
        return point;
      }
    }
    return null;
  }

  /**
   * Muestra un mensaje de feedback en pantalla
   * @param {string} message - Mensaje a mostrar
   * @param {string} color - Color del texto (hexadecimal)
   */
  showFeedback(message, color) {
    this.feedbackText.setText(message);
    this.feedbackText.setColor(color);
    this.feedbackText.setAlpha(1);
    
    this.tweens.add({
      targets: this.feedbackText,
      y: this.feedbackText.y - 30,
      alpha: 0,
      duration: 1500,
      ease: 'Sine.easeOut'
    });
  }

  /**
   * Finaliza el juego y muestra el ganador
   * @param {string} winner - Nombre del ganador
   */
  endGame(winner) {
    this.gameOver = true;
    if (this.turnTimerEvent) {
      this.turnTimerEvent.remove(false);
      this.turnTimerEvent = null;
    }
    if (this.cpuTurnEvent) {
      this.cpuTurnEvent.remove(false);
      this.cpuTurnEvent = null;
    }

    const message = winner === 'JUGADOR' ? 'GANASTE EL DUELO' : 'PERDISTE EL DUELO';
    this.showVictoryBanner(message);

    this.time.delayedCall(3000, () => {
      try {
        if (this.scene && this.scene.manager && this.scene.manager.keys && this.scene.manager.keys['MenuScene']) {
          this.scene.start('MenuScene');
        } else {
          window.location.reload();
        }
      } catch (error) {
        window.location.reload();
      }
    });
  }

  /**
   * Muestra un banner de victoria o derrota en pantalla
   * @param {string} message - Texto del banner
   */
  showVictoryBanner(message) {
    const width = this.scale.width;
    const height = this.scale.height;

    const banner = this.add.container(width / 2, height * 0.28).setDepth(25);
    const background = this.add.rectangle(0, 0, width * 0.7, 110, 0x111827, 0.95)
      .setStrokeStyle(4, 0xf59e0b);
    const text = this.add.text(0, 0, message, {
      fontFamily: 'Arial Black',
      fontSize: '42px',
      color: '#ffffff',
      align: 'center',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5);

    banner.add([background, text]);
    banner.setAlpha(0).setScale(0.8);

    this.tweens.add({
      targets: banner,
      alpha: 1,
      scale: 1,
      duration: 600,
      ease: 'Back.out'
    });
    this.tweens.add({
      targets: banner,
      y: height * 0.22,
      duration: 600,
      ease: 'Power2'
    });
  }

  /**
   * Limpia recursos al destruir la escena
   */
  shutdown() {
    if (this.ambientParticles) {
      this.ambientParticles.forEach(p => p.destroy());
    }
    if (this.trajectoryPreview) {
      this.trajectoryPreview.forEach(d => d.destroy());
    }
    if (this.cpuTurnEvent) {
      this.cpuTurnEvent.remove();
    }
  }
}
