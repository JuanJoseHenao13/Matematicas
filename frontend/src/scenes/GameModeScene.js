import Phaser from 'phaser';

export default class GameModeScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameModeScene' });
  }

  create() {
    const width = this.scale.width;
    const height = this.scale.height;

    // Animated background
    this.createAnimatedBackground(width, height);

    // Title
    this.createTitle(width, height);

    // Game mode buttons
    this.createGameModeButtons(width, height);

    // Back button
    this.createStyledButton(80, 40, 120, 50, '← ATRÁS', 0xff4466, () => {
      this.scene.start('ProfileScene');
    });
  }

  createAnimatedBackground(width, height) {
    // Cartoon, parallax-like animated background
    const gradient = this.add.graphics();
    gradient.fillGradientStyle(0x071227, 0x0f2a44, 0x17365a, 0x0b1930);
    gradient.fillRect(0, 0, width, height);

    // Slight grid shimmer
    const grid = this.add.graphics();
    grid.lineStyle(1, 0xffffff, 0.04);
    for (let i = 0; i < width; i += 140) grid.lineBetween(i, 0, i, height);
    for (let j = 0; j < height; j += 140) grid.lineBetween(0, j, width, j);

    // Create reusable particle texture
    if (!this.textures.exists('dot')) {
      const g = this.make.graphics({ add: false });
      g.fillStyle(0xffffff, 1);
      g.fillCircle(3, 3, 3);
      g.generateTexture('dot', 6, 6);
      g.destroy();
    }

    this.particles = this.add.particles(0, 0, 'dot', {
      x: { min: 0, max: width },
      y: { min: 0, max: height },
      speedY: { min: -20, max: -80 },
      lifespan: { min: 4000, max: 14000 },
      scale: { start: 1.2, end: 0.2 },
      alpha: { start: 0.9, end: 0 },
      quantity: 4,
      blendMode: 'ADD'
    });
  }

  createTitle(width, height) {
    const title = this.add.text(width / 2, height * 0.1, '🎮 MODO DE JUEGO', {
      fontSize: '62px',
      fontFamily: 'Arial Black',
      color: '#f8fafc',
      fontStyle: 'bold',
      stroke: '#38bdf8',
      strokeThickness: 8
    }).setOrigin(0.5);

    this.add.text(width / 2, height * 0.18, 'Escoge el modo ideal para tu próxima partida', {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#cbd5e1',
      wordWrap: { width: width * 0.75 }
    }).setOrigin(0.5);

    const titleGlow = this.add.text(width / 2, height * 0.1, '🎮 MODO DE JUEGO', {
      fontSize: '62px',
      fontFamily: 'Arial Black',
      color: '#38bdf8',
      fontStyle: 'bold',
      blur: 28
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

  createGameModeButtons(width, height) {
    const board = this.add.graphics();
    board.fillStyle(0x11203a, 0.8);
    board.fillRoundedRect(width / 2 - 430, height * 0.28, 860, height * 0.58, 36);
    board.lineStyle(2, 0x38bdf8, 0.22);
    board.strokeRoundedRect(width / 2 - 430, height * 0.28, 860, height * 0.58, 36);

    const boardAccent = this.add.graphics();
    boardAccent.fillGradientStyle(0x38bdf8, 0x0f172a, 0x0f172a, 0x38bdf8);
    boardAccent.fillRoundedRect(width / 2 - 430, height * 0.28, 860, 8, 8);

    this.createModeButton(
      width / 2,
      height * 0.42,
      760,
      120,
      '⚔️ JUGADOR VS JUGADOR',
      0x22c55e,
      () => {
        this.registry.set('gameMode', 'pvp');
        this.scene.start('MatchmakingScene');
      },
      'Busca un oponente real en línea y pon a prueba tu estrategia'
    );

    this.createModeButton(
      width / 2,
      height * 0.62,
      760,
      120,
      '🤖 JUGADOR VS CPU',
      0xf97316,
      () => {
        this.registry.set('gameMode', 'cpu');
        this.startCPUGame();
      },
      'Entrena tus tiros con un adversario inteligente'
    );
  }

  createModeButton(x, y, width, height, text, color, callback, description) {
    const button = this.add.graphics();

    const baseColor = Phaser.Display.Color.ValueToColor(color);
    button.fillGradientStyle(
      color,
      baseColor.lighten(18).color,
      baseColor.darken(12).color,
      baseColor.darken(22).color
    );
    button.fillRoundedRect(x - width / 2, y - height / 2, width, height, 24);

    button.lineStyle(3, 0xffffff, 0.35);
    button.strokeRoundedRect(x - width / 2, y - height / 2, width, height, 24);

    const accentBar = this.add.graphics();
    accentBar.fillStyle(color, 0.18);
    accentBar.fillRoundedRect(x - width / 2 + 18, y - height / 2 + 18, width - 36, 8, 6);

    button.setInteractive(
      new Phaser.Geom.Rectangle(x - width / 2, y - height / 2, width, height),
      Phaser.Geom.Rectangle.Contains
    );

    const buttonText = this.add.text(x, y - 18, text, {
      fontSize: '30px',
      fontFamily: 'Arial Black',
      color: '#f8fafc',
      fontStyle: 'bold',
      stroke: '#020617',
      strokeThickness: 5
    }).setOrigin(0.5);

    const descText = this.add.text(x, y + 24, description, {
      fontSize: '17px',
      fontFamily: 'Arial',
      color: '#cbd5e1',
      wordWrap: { width: width - 120 }
    }).setOrigin(0.5);

    button.on('pointerover', () => {
      button.clear();
      button.fillGradientStyle(
        baseColor.lighten(22).color,
        baseColor.lighten(28).color,
        baseColor.lighten(12).color,
        baseColor.lighten(18).color
      );
      button.fillRoundedRect(x - width / 2, y - height / 2, width, height, 24);
      button.lineStyle(3, 0xffffff, 0.7);
      button.strokeRoundedRect(x - width / 2, y - height / 2, width, height, 24);
      buttonText.setScale(1.05);
      descText.setScale(1.02);
    });

    button.on('pointerout', () => {
      button.clear();
      button.fillGradientStyle(
        color,
        baseColor.lighten(18).color,
        baseColor.darken(12).color,
        baseColor.darken(22).color
      );
      button.fillRoundedRect(x - width / 2, y - height / 2, width, height, 24);
      button.lineStyle(3, 0xffffff, 0.35);
      button.strokeRoundedRect(x - width / 2, y - height / 2, width, height, 24);
      buttonText.setScale(1);
      descText.setScale(1);
    });

    button.on('pointerdown', callback);

    return button;
  }

  startCPUGame() {
    // Create a fake gameId for CPU mode
    const fakeGameId = 'cpu-game-' + Date.now();
    this.registry.set('gameId', fakeGameId);
    this.scene.start('GameScene');
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
      fontSize: '22px',
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
