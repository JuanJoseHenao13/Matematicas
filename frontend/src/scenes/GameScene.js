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
    this.groundHeight = 140;

    this.createBackground(width, height);
    this.createGround(width, height);
    this.createPlayers(width, height);
    this.createHud(width, height);
    this.createAimingUI(width, height);
    this.createSceneEffects(width, height);
    this.setupInput();

    this.trajectoryPreview = [];
    this.createIdleAnimations();

    this.hintText.setText('Arrastra hacia atrás y suelta para disparar');

    if (this.gameMode === 'cpu' && !this.isMyTurn) {
      this.scheduleCPUTurn();
    }
  }

  createBackground(width, height) {
    const sky = this.add.graphics();
    sky.fillGradientStyle(0xffc87e, 0xffd9aa, 0xffa14d, 0xffb96d);
    sky.fillRect(0, 0, width, height);

    const sun = this.add.circle(width * 0.8, height * 0.18, 70, 0xfff1a5).setBlendMode(Phaser.BlendModes.ADD);
    this.tweens.add({
      targets: sun,
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
      const dune = this.add.graphics();
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
    });
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

  createPlayers(width, height) {
    const playerY = height - this.groundHeight - 40;
    this.playerLeft = this.createCharacter(width * 0.18, playerY, 0x22c55e, 'JUGADOR');
    this.playerRight = this.createCharacter(width * 0.82, playerY, 0x3b82f6, 'OPONENTE');
  }

  createCharacter(x, y, color, label) {
    const container = this.add.container(x, y);
    const body = this.add.graphics();
    body.fillStyle(color);
    body.fillEllipse(0, 0, 58, 48);
    body.lineStyle(4, 0xffffff, 0.35);
    body.strokeEllipse(0, 0, 58, 48);

    const head = this.add.graphics();
    head.fillStyle(0xffd7b7);
    head.fillCircle(0, -28, 24);
    head.lineStyle(3, 0x000000, 0.18);
    head.strokeCircle(0, -28, 24);

    const eyes = this.add.graphics();
    eyes.fillStyle(0xffffff);
    eyes.fillCircle(-10, -32, 6);
    eyes.fillCircle(10, -32, 6);
    eyes.fillStyle(0x000000);
    eyes.fillCircle(-10, -32, 3);
    eyes.fillCircle(10, -32, 3);

    const mouth = this.add.graphics();
    mouth.lineStyle(3, 0x5f2a0a);
    mouth.beginPath();
    mouth.moveTo(-8, -12);
    mouth.lineTo(-2, -14);
    mouth.lineTo(2, -14);
    mouth.lineTo(8, -12);
    mouth.strokePath();

    const leftArm = this.add.graphics();
    leftArm.lineStyle(8, 0x7a3e14);
    leftArm.lineBetween(-18, -8, -34, 16);
    leftArm.lineStyle(6, 0x7a3e14);
    leftArm.strokeCircle(-34, 16, 5);

    const rightArm = this.add.graphics();
    rightArm.lineStyle(8, 0x7a3e14);
    rightArm.lineBetween(18, -8, 34, 16);
    rightArm.lineStyle(6, 0x7a3e14);
    rightArm.strokeCircle(34, 16, 5);

    const bow = this.add.graphics();
    bow.lineStyle(6, 0x7a3e14);
    bow.beginPath();
    bow.moveTo(-28, -10);
    bow.lineTo(-38, -18);
    bow.lineTo(-38, 18);
    bow.lineTo(-28, 10);
    bow.strokePath();

    const bowString = this.add.graphics();
    bowString.lineStyle(2, 0xffffff, 0.9);
    bowString.beginPath();
    bowString.moveTo(-32, -16);
    bowString.lineTo(-32, 14);
    bowString.strokePath();

    container.add([body, head, eyes, mouth, leftArm, rightArm, bow, bowString]);

    // hair added after face to render on top
    const hair = this.add.graphics();
    hair.fillStyle(0x2b2b2b, 1);
    hair.fillEllipse(0, -40, 44, 16);
    container.add(hair);

    // cap (gorra) drawn above the hair to give a 'hat' look
    const cap = this.add.graphics();
    cap.fillStyle(0x1f3b6f, 1); // dark blue cap color
    // brim
    cap.fillRect(-26, -52, 52, 8);
    // cap body (rounded)
    cap.fillEllipse(0, -62, 48, 20);
    cap.lineStyle(2, 0x000000, 0.12);
    cap.strokeEllipse(0, -62, 48, 20);
    cap.setDepth(2);
    container.add(cap);

    const labelBg = this.add.graphics();
    labelBg.fillStyle(0x000000, 0.3);
    labelBg.fillRoundedRect(-60, 10, 120, 28, 10);
    container.add(labelBg);

    const labelText = this.add.text(0, 24, label, {
      fontFamily: 'Arial Black',
      fontSize: '18px',
      color: '#ffffff'
    }).setOrigin(0.5);
    container.add(labelText);

    const healthBarBg = this.add.graphics();
    healthBarBg.fillStyle(0x111111, 0.9);
    healthBarBg.fillRoundedRect(-72, -70, 144, 18, 12);
    container.add(healthBarBg);

    const healthBar = this.add.graphics();
    healthBar.fillStyle(0x4ade80, 1);
    healthBar.fillRoundedRect(-70, -68, 140, 14, 10);
    container.add(healthBar);

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

  createHud(width, height) {
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

  createAimingUI(width, height) {
    this.aimLine = this.add.graphics().setDepth(10).setVisible(false);
    this.aimMarker = this.add.circle(0, 0, 12, 0xffffff, 0.75).setDepth(10).setVisible(false);

    this.powerText = this.add.text(width / 2, height - 120, '', {
      fontFamily: 'Arial Black',
      fontSize: '20px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5).setVisible(false);

    this.angleText = this.add.text(width / 2, height - 90, '', {
      fontFamily: 'Arial Black',
      fontSize: '20px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5).setVisible(false);
  }

  createSceneEffects(width, height) {
    if (!this.textures.exists('star')) {
      const star = this.make.graphics({ add: false });
      star.fillStyle(0xffffff, 1);
      star.fillCircle(2, 2, 2);
      star.generateTexture('star', 5, 5);
      star.destroy();
    }

    for (let i = 0; i < 18; i++) {
      const x = Phaser.Math.Between(40, width - 40);
      const y = Phaser.Math.Between(60, height * 0.5);
      const star = this.add.image(x, y, 'star').setAlpha(0.25);
      this.tweens.add({
        targets: star,
        alpha: { from: 0.1, to: 0.6 },
        y: y + Phaser.Math.Between(-12, 12),
        duration: Phaser.Math.Between(2400, 4000),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
  }

  setupInput() {
    this.input.on('pointerdown', (pointer) => {
      if (this.isAnimating) {
        return;
      }

      this.clearTrajectoryPreview();
      this.isAiming = true;
      const start = this.isMyTurn ? this.playerLeft : this.playerRight;
      this.aimStartX = start.container.x + (this.isMyTurn ? 38 : -38);
      this.aimStartY = start.container.y - 18;
      this.aimLine.setVisible(true);
      this.aimMarker.setVisible(true);
      this.powerText.setVisible(true);
      this.angleText.setVisible(true);
      this.updateAiming(pointer);
    });

    this.input.on('pointermove', (pointer) => {
      if (!this.isAiming) {
        return;
      }
      this.updateAiming(pointer);
    });

    this.input.on('pointerup', async (pointer) => {
      if (!this.isAiming) {
        return;
      }

      this.isAiming = false;
      this.aimLine.clear().setVisible(false);
      this.aimMarker.setVisible(false);
      this.powerText.setVisible(false);
      this.angleText.setVisible(false);
      this.clearTrajectoryPreview();

      const dx = pointer.x - this.aimStartX;
      const dy = this.aimStartY - pointer.y;
      const distance = Phaser.Math.Clamp(Math.sqrt(dx * dx + dy * dy), 36, 400);
      const power = Phaser.Math.Clamp(distance / 2, 18, 200);
      const direction = dx >= 0 ? 1 : -1;
      const angle = Phaser.Math.Clamp(Math.abs(Math.atan2(dy, Math.abs(dx))), 0.15, Math.PI * 0.68);
      const angleDegrees = Phaser.Math.RadToDeg(angle);

      await this.fireShot(power, angleDegrees, direction);
    });
  }

  updateAiming(pointer) {
    const dx = pointer.x - this.aimStartX;
    const dy = this.aimStartY - pointer.y;
    const rawDistance = Math.sqrt(dx * dx + dy * dy);
    const distance = Phaser.Math.Clamp(rawDistance, 16, 400);

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

    this.aimMarker.setPosition(targetX, targetY);

    const power = Phaser.Math.Clamp(distance / 2, 0, 200);
    const rawAngle = Math.atan2(dy, Math.abs(dx));
    const direction = dx >= 0 ? 1 : -1;
    const angleDegrees = Phaser.Math.RadToDeg(Math.abs(rawAngle));
    this.powerText.setText(`FUERZA ${Math.round(power)}%`);
    this.angleText.setText(`ÁNGULO ${Math.round(angleDegrees)}°`);
    this.updateTrajectoryPreview(
      this.isMyTurn ? this.playerLeft.container.x + 38 : this.playerRight.container.x - 38,
      this.isMyTurn ? this.playerLeft.container.y - 18 : this.playerRight.container.y - 18,
      power,
      angleDegrees,
      direction
    );
  }

  updateTrajectoryPreview(startX, startY, power, angleDegrees, direction) {
    this.clearTrajectoryPreview();
    const points = this.calculateTrajectory(startX, startY, power, angleDegrees, direction);
    for (let i = 3; i < points.length; i += 3) {
      const dot = this.add.circle(points[i].x, points[i].y, 5, 0xffffff, 0.3).setDepth(8);
      this.trajectoryPreview.push(dot);
    }
  }

  clearTrajectoryPreview() {
    this.trajectoryPreview.forEach((dot) => dot.destroy());
    this.trajectoryPreview.length = 0;
  }

  createIdleAnimations() {
    [this.playerLeft, this.playerRight].forEach((player, index) => {
      const delay = index * 220;
      this.tweens.add({
        targets: player.container,
        y: player.y + 6,
        duration: 1800,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
        delay
      });

      this.tweens.add({
        targets: player.container,
        angle: { from: -2, to: 2 },
        duration: 2400,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
        delay
      });

      if (player.head) {
        this.tweens.add({
          targets: player.head,
          angle: { from: -4, to: 4 },
          duration: 2000,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
          delay: delay + 120
        });
      }

      if (player.leftArm && player.rightArm) {
        this.tweens.add({
          targets: [player.leftArm, player.rightArm],
          angle: { from: -6, to: 6 },
          duration: 1600,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
          delay: delay + 160
        });

        this.tweens.add({
          targets: [player.leftArm, player.rightArm],
          y: '+=4',
          duration: 1800,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
          delay: delay + 200
        });
      }

      if (player.bow) {
        this.tweens.add({
          targets: player.bow,
          angle: { from: -2, to: 2 },
          duration: 1800,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
          delay: delay + 150
        });
      }

      if (player.hair) {
        this.tweens.add({
          targets: player.hair,
          y: '+=2',
          duration: 1800,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
          delay: delay + 180
        });
      }
    });
  }

  async fireShot(power, angleDegrees, direction) {
    if (this.isAnimating) {
      return;
    }

    this.isAnimating = true;
    this.turnText.setText('DISPARANDO...');
    this.turnText.setColor('#facc15');

    const start = this.isMyTurn ? this.playerLeft : this.playerRight;
    const target = this.isMyTurn ? this.playerRight : this.playerLeft;
    const startX = start.container.x + (direction === 1 ? 38 : -38);
    const startY = start.container.y - 18;

    let shotData = {
      power,
      angle: angleDegrees,
      direction,
      damage: 0,
      isHit: false,
      impact: { x: startX, y: startY }
    };

    if (this.gameMode === 'pvp' && this.gameId) {
      try {
        const result = await api.shoot(this.gameId, power, angleDegrees, direction, 'spear');
        if (result && result.success && result.data) {
          shotData = {
            ...shotData,
            ...result.data,
            isHit: result.data.isHit ?? shotData.isHit
          };
        }
      } catch (error) {
        console.warn('API shoot fallback:', error);
      }
    }

    const trajectory = this.calculateTrajectory(startX, startY, power, angleDegrees, direction);
    const foundImpact = this.findImpactPoint(trajectory, target);
    const impact = foundImpact || trajectory[trajectory.length - 1];
    shotData.impact = impact;

    const hit = foundImpact !== null;
    shotData.isHit = shotData.isHit || hit;
    shotData.damage = shotData.isHit ? Phaser.Math.Between(18, 32) : 0;

    // Prefer server-provided knockback, otherwise compute a client fallback proportional to damage
    let knockback = typeof shotData.knockback === 'number' ? shotData.knockback : 0;
    if (!knockback && shotData.damage) {
      knockback = direction * Math.round(shotData.damage * 1.8);
    }
    shotData.knockback = knockback;

    this.clearTrajectoryPreview();

    // quick firing pose: pull bow and tilt arm, then release
    try {
      if (start.leftArm || start.rightArm || start.bow) {
        const armTargets = [];
        if (start.leftArm) armTargets.push(start.leftArm);
        if (start.rightArm) armTargets.push(start.rightArm);
        if (start.bow) armTargets.push(start.bow);
        this.tweens.add({
          targets: armTargets,
          angle: { from: 0, to: -12 * direction },
          duration: 140,
          yoyo: true,
          ease: 'Power2.easeOut'
        });
      }
    } catch (e) {
      console.warn('Arm animation failed', e);
    }

    await this.animateProjectile(trajectory, startX, startY, direction);
    this.createImpactEffect(impact.x, impact.y, shotData.isHit);

    if (shotData.isHit) {
      // apply damage and knockback so the character moves depending on force
      this.applyDamage(target, shotData.damage, knockback);
    } else {
      this.showFeedback('¡FALLASTE!', '#f87171');
    }

    this.isMyTurn = !this.isMyTurn;
    this.updateTurnText();

    if (this.gameMode === 'cpu' && !this.isMyTurn) {
      this.scheduleCPUTurn();
    }

    this.isAnimating = false;
  }

  calculateTrajectory(startX, startY, power, angleDegrees, direction) {
    const points = [];
    const radians = Phaser.Math.DegToRad(angleDegrees);
    const speed = power * 7.5;
    const vx = Math.cos(radians) * speed * direction;
    const vy = -Math.sin(radians) * speed;
    const gravity = 420;

    let t = 0;
    const step = 0.04;
    let lastPoint = { x: startX, y: startY };
    points.push(lastPoint);

    while (t < 3.6) {
      t += step;
      const x = startX + vx * t;
      const y = startY + vy * t + 0.5 * gravity * t * t;
      const clampedX = Phaser.Math.Clamp(x, -80, this.scale.width + 80);
      const clampedY = Math.min(y, this.scale.height - this.groundHeight + 6);
      const point = { x: clampedX, y: clampedY };
      points.push(point);

      if (clampedY >= this.scale.height - this.groundHeight + 4) {
        break;
      }

      lastPoint = point;
    }

    return points;
  }

  async animateProjectile(points, startX, startY, direction) {
    // create an arrow-shaped polygon (points: tail-left, head, tail-right)
    const arrowPoints = [-16, -6, 24, 0, -16, 6];
    const projectile = this.add.polygon(startX, startY, arrowPoints, 0xff6d00).setDepth(11);

    const trails = [];

    for (let i = 1; i < points.length; i++) {
      const point = points[i];
      const duration = Phaser.Math.Clamp(2400 / points.length, 40, 120);

      // trail
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

      // orient arrow towards next point
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
    }

    // destroy projectile and any remaining trails
    projectile.destroy();
    trails.forEach((t) => t.destroy());
  }

  findImpactPoint(trajectory, target) {
    const targetY = target.container.y - 18;
    for (const point of trajectory) {
      const distance = Phaser.Math.Distance.Between(point.x, point.y, target.container.x, targetY);
      if (distance < 110) {
        return point;
      }
    }
    return null;
  }

  isHitTarget(impact, target) {
    const targetY = target.container.y - 18;
    const distance = Phaser.Math.Distance.Between(impact.x, impact.y, target.container.x, targetY);
    return distance < 110;
  }

  applyDamage(target, damage, knockback = 0) {
    target.health = Phaser.Math.Clamp(target.health - damage, 0, target.maxHealth);
    this.updateHealthBar(target);
    this.showDamageText(target.container.x, target.container.y - 90, damage);

    // animate knockback if present
    if (Math.abs(knockback) > 0.5) {
      const newX = Phaser.Math.Clamp(target.container.x + knockback, 40, this.scale.width - 40);
      this.tweens.add({
        targets: target.container,
        x: newX,
        duration: 320,
        ease: 'Power2.easeOut'
      });
    }

    // Determine winner based on current turn (shooter still set when this is called)
    if (target.health <= 0) {
      const won = (this.isMyTurn && target === this.playerRight) || (!this.isMyTurn && target === this.playerLeft);
      const message = won ? 'GANASTE' : 'PERDISTE';
      const color = won ? '#22c55e' : '#f87171';
      this.handleGameOver(message, color);
    } else {
      this.showFeedback('¡IMPACTO!', '#34d399');
    }
  }

  handleGameOver(message, color) {
    this.isAnimating = true;
    this.gameOver = true;
    if (this.cpuTurnEvent) {
      this.cpuTurnEvent.remove(false);
    }

    this.updateLocalStats(message === 'GANASTE');

    this.turnText.setText('');
    this.showFeedback(message, color);

    this.time.delayedCall(1600, () => {
      window.location.href = '/menu';
    });
  }

  updateLocalStats(won) {
    try {
      const userString = localStorage.getItem('user');
      if (!userString) return;
      const user = JSON.parse(userString);
      const updatedUser = {
        ...user,
        wins: (user.wins ?? 0) + (won ? 1 : 0),
        losses: (user.losses ?? 0) + (won ? 0 : 1)
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (error) {
      console.warn('No se pudo actualizar las estadísticas de perfil local', error);
    }
  }

  updateHealthBar(player) {
    const ratio = player.health / player.maxHealth;
    player.healthBar.clear();
    player.healthBar.fillStyle(0x22c55e, 1);
    player.healthBar.fillRoundedRect(-70, -68, 140 * ratio, 14, 10);
  }

  createImpactEffect(x, y, isHit) {
    const explosion = this.add.graphics();
    explosion.fillStyle(isHit ? 0xff9d00 : 0xffffff, 1);
    explosion.fillCircle(x, y, 32);

    const ring = this.add.graphics();
    ring.lineStyle(4, isHit ? 0xffcd38 : 0xffffff, 0.9);
    ring.strokeCircle(x, y, 38);

    for (let i = 0; i < 16; i++) {
      const angle = Phaser.Math.DegToRad((360 / 16) * i);
      const particle = this.add.circle(x, y, Phaser.Math.Between(4, 8), isHit ? 0xffb347 : 0xffffff, 0.9);
      const distance = Phaser.Math.Between(60, 110);
      this.tweens.add({
        targets: particle,
        x: x + Math.cos(angle) * distance,
        y: y + Math.sin(angle) * distance,
        alpha: 0,
        scale: 0.3,
        duration: Phaser.Math.Between(420, 760),
        ease: 'Power2.easeOut',
        onComplete: () => particle.destroy()
      });
    }

    this.tweens.add({
      targets: [explosion, ring],
      scale: 1.6,
      alpha: 0,
      duration: 450,
      ease: 'Power2.easeOut',
      onComplete: () => {
        explosion.destroy();
        ring.destroy();
      }
    });
  }

  showDamageText(x, y, damage) {
    const text = this.add.text(x, y, `-${damage}`, {
      fontFamily: 'Arial Black',
      fontSize: '40px',
      color: '#fb7185',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5);

    this.tweens.add({
      targets: text,
      y: y - 60,
      alpha: 0,
      scale: 1.3,
      duration: 900,
      ease: 'Power2.easeOut',
      onComplete: () => text.destroy()
    });
  }

  showFeedback(message, color) {
    this.feedbackText.setText(message);
    this.feedbackText.setStyle({ color });
    this.feedbackText.setAlpha(1);
    this.feedbackText.setScale(1);

    this.tweens.killTweensOf(this.feedbackText);
    this.tweens.add({
      targets: this.feedbackText,
      alpha: 0,
      scale: 1.08,
      duration: 1400,
      delay: 400,
      ease: 'Sine.easeInOut'
    });
  }

  updateTurnText() {
    this.turnText.setText(this.isMyTurn ? 'TU TURNO' : 'TURNO OPONENTE');
    this.turnText.setColor(this.isMyTurn ? '#34d399' : '#f97316');
  }

  scheduleCPUTurn() {
    if (this.cpuTurnEvent) {
      this.cpuTurnEvent.remove(false);
    }

    this.cpuTurnEvent = this.time.delayedCall(1400, () => {
      this.cpuShoot();
    });
  }

  async cpuShoot() {
    if (this.isAnimating || this.gameMode !== 'cpu') {
      return;
    }

    this.isAnimating = true;
    this.turnText.setText('CPU DISPARANDO...');
    this.turnText.setColor('#f97316');

    const direction = -1;
    const startX = this.playerRight.container.x - 38;
    const startY = this.playerRight.container.y - 18;
    const target = this.playerLeft;
    const targetY = target.container.y - 18;
    const targetDistance = Phaser.Math.Distance.Between(startX, startY, target.container.x, targetY);

    const hitChance = 0.6;
    const willHit = Math.random() < hitChance;

    let angle = Phaser.Math.Clamp(Math.round(26 + (targetDistance - 220) * 0.04 + Phaser.Math.Between(-4, 4)), 22, 52);
    let radians = Phaser.Math.DegToRad(angle);
    let requiredV = Math.sqrt((targetDistance * 420) / Math.max(0.1, Math.sin(2 * radians)));
    let requiredPower = requiredV / 7.5;
    let power = Phaser.Math.Clamp(Math.round(requiredPower + Phaser.Math.Between(-2, 2)), 10, 200);

    let trajectory;
    let impact;

    if (willHit) {
      let attempt = 0;
      do {
        trajectory = this.calculateTrajectory(startX, startY, power, angle, direction);
        impact = this.findImpactPoint(trajectory, target);
        if (impact) {
          break;
        }

        power = Phaser.Math.Clamp(power + Phaser.Math.Between(-5, 5), 76, 115);
        angle = Phaser.Math.Clamp(angle + Phaser.Math.Between(-4, 4), 22, 52);
        attempt += 1;
      } while (attempt < 6);

      if (!impact) {
        trajectory = this.calculateTrajectory(startX, startY, power, angle, direction);
        impact = trajectory[trajectory.length - 1];
      }
    } else {
      // intentionally miss by shifting the shot away from the target
      let missAngle = Phaser.Math.Clamp(angle + Phaser.Math.Between(10, 18), 30, 58);
      let missPower = Phaser.Math.Clamp(power + Phaser.Math.Between(8, 18), 86, 120);
      let attempt = 0;

      do {
        trajectory = this.calculateTrajectory(startX, startY, missPower, missAngle, direction);
        impact = this.findImpactPoint(trajectory, target);
        if (!impact) {
          break;
        }
        missAngle = Phaser.Math.Clamp(missAngle + Phaser.Math.Between(6, 10), 32, 60);
        missPower = Phaser.Math.Clamp(missPower + Phaser.Math.Between(6, 10), 88, 125);
        attempt += 1;
      } while (attempt < 6);

      impact = trajectory[trajectory.length - 1];
    }

    await this.animateProjectile(trajectory, startX, startY, direction);
    this.createImpactEffect(impact.x, impact.y, this.isHitTarget(impact, target));

    const hit = this.isHitTarget(impact, target);
    if (hit) {
      const damage = Phaser.Math.Between(14, 26);
      const knockback = direction * Math.round(damage * 1.6);
      this.applyDamage(target, damage, knockback);
    } else {
      this.showFeedback('CPU FALLA', '#f87171');
    }

    this.isMyTurn = true;
    this.updateTurnText();
    this.isAnimating = false;
  }

  shutdown() {
    if (this.cpuTurnEvent) {
      this.cpuTurnEvent.remove(false);
    }
  }
}
