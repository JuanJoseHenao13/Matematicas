# Documentación Técnica - QuizMate

## 📋 Índice
1. [Arquitectura General](#arquitectura-general)
2. [Backend](#backend)
3. [Frontend](#frontend)
4. [Flujo de la Aplicación](#flujo-de-la-aplicación)
5. [Escenas del Juego](#escenas-del-juego)
6. [Modo CPU](#modo-cpu)
7. [API Endpoints](#api-endpoints)

---

## 🏗️ Arquitectura General

**Stack Tecnológico:**
- **Backend:** Node.js + Express + MongoDB
- **Frontend:** React + Vite + Phaser 3 (Game Engine)
- **Comunicación:** REST API + Socket.io (para tiempo real)

**Estructura:**
```
Quiz mate/
├── backend/          # API REST + Socket.io
│   ├── src/
│   │   ├── models/   # Modelos MongoDB
│   │   ├── routes/   # Rutas API
│   │   └── socket/   # WebSockets
├── frontend/         # React + Phaser
│   ├── src/
│   │   ├── pages/    # Páginas React
│   │   ├── scenes/   # Escenas Phaser
│   │   └── services/ # Cliente API
```

---

## 🔧 Backend

### Tecnologías
- **Express:** Framework web para API REST
- **MongoDB:** Base de datos NoSQL
- **Socket.io:** Comunicación en tiempo real
- **JWT:** Autenticación

### Funciones Principales

#### 1. Autenticación (`src/routes/auth.js`)
```javascript
POST /api/auth/register
- Crea usuario nuevo
- Encripta contraseña con bcrypt
- Retorna token JWT

POST /api/auth/login
- Valida credenciales
- Genera token JWT
- Retorna datos del usuario
```

#### 2. Matchmaking (`src/socket/matchmaking.js`)
```javascript
socket.on('joinQueue')
- Agrega usuario a cola de espera
- Busca oponente disponible
- Crea partida cuando hay 2 jugadores
- Emite evento 'matchFound' con gameId
```

#### 3. Partidas (`src/routes/games.js`)
```javascript
POST /api/games/shoot
- Recibe datos del disparo (power, angle)
- Calcula trayectoria física
- Determina si acierta al objetivo
- Aplica daño y knockback
- Retorna resultado del disparo

GET /api/games/:gameId
- Obtiene estado actual de la partida
- Retorna posiciones, vidas, turno actual
```

#### 4. Cálculo de Trayectoria
```javascript
function calculateTrajectory(startX, startY, power, angle, direction) {
  const gravity = 0.5;
  const velocityX = (power / 10) * Math.cos(angle * Math.PI / 180) * direction;
  const velocityY = (power / 10) * Math.sin(angle * Math.PI / 180);
  
  const points = [];
  for (let t = 0; t < 100; t++) {
    const x = velocityX * t;
    const y = velocityY * t - 0.5 * gravity * t * t;
    points.push({ x: startX + x, y: startY - y });
  }
  return points;
}
```

---

## 🎮 Frontend

### Tecnologías
- **React:** Framework UI
- **Phaser 3:** Motor de juegos 2D
- **Vite:** Build tool rápido
- **Axios:** Cliente HTTP

### Funciones Principales

#### 1. Cliente API (`src/services/api.js`)
```javascript
const api = {
  register: async (data) => axios.post('/api/auth/register', data),
  login: async (data) => axios.post('/api/auth/login', data),
  shoot: async (gameId, shotData) => axios.post(`/api/games/${gameId}/shoot`, shotData),
  getGame: async (gameId) => axios.get(`/api/games/${gameId}`)
};
```

#### 2. Integración Phaser-React (`src/components/PhaserGame.jsx`)
```javascript
function PhaserGame({ gameId, gameMode }) {
  const gameRef = useRef(null);
  
  useEffect(() => {
    const config = {
      type: Phaser.AUTO,
      parent: gameRef.current,
      width: 1200,
      height: 700,
      scene: [GameScene],
      physics: { default: 'arcade' }
    };
    
    const game = new Phaser.Game(config);
    game.registry.set('gameId', gameId);
    game.registry.set('gameMode', gameMode);
    
    return () => game.destroy();
  }, [gameId, gameMode]);
  
  return <div ref={gameRef} />;
}
```

---

## 🔄 Flujo de la Aplicación

```
1. WelcomeScene
   ↓ (Botón JUGAR)
2. LoginScene
   ↓ (Autenticación exitosa)
3. MenuScene
   ↓ (Botón JUGAR)
4. ProfileScene
   ↓ (Botón CONTINUAR)
5. GameModeScene
   ↓ (Selección: PvP o CPU)
   
   Si PvP:
   → MatchmakingScene
   → Espera oponente
   → GameScene (con gameId del servidor)
   
   Si CPU:
   → GameScene (modo local, gameId fake)
```

---

## 🎬 Escenas del Juego

### 1. WelcomeScene
**Propósito:** Pantalla de bienvenida
**Funciones:**
- `createAnimatedBackground()`: Fondo con nebulosa animada, estrellas, estrellas fugaces
- `createTitle()`: Título con efecto glow
- `createStyledButton()`: Botón JUGAR con hover effects

### 2. LoginScene
**Propósito:** Autenticación de usuarios
**Funciones:**
- `createStyledInput()`: Inputs con z-index alto y animaciones focus
- `handleRegister()`: Llamada a API /api/auth/register
- `handleLogin()`: Llamada a API /api/auth/login
- Guarda token y datos en localStorage

### 3. ProfileScene
**Propósito:** Mostrar estadísticas del usuario
**Funciones:**
- `createProfilePanel()`: Panel con glassmorphism
- Muestra: username, email, wins, losses, coins
- Datos obtenidos de localStorage

### 4. GameModeScene
**Propósito:** Selección de modo de juego
**Funciones:**
- `createModeButton()`: Botones para PvP y CPU
- PvP → MatchmakingScene
- CPU → GameScene (modo local)

### 5. MatchmakingScene
**Propósito:** Buscar oponente (solo PvP)
**Funciones:**
- `startMatchmaking()`: Conecta a Socket.io
- Emite evento 'joinQueue'
- Espera evento 'matchFound'
- Transición a GameScene con gameId

### 6. GameScene
**Propósito:** Escena principal del juego
**Funciones:**

#### Inicialización
```javascript
create() {
  this.createAnimatedBackground();  // Fondo espacial
  this.createGround();             // Suelo con textura
  this.createBowmastersPlayer();   // Personajes detallados
  this.setupInput();               // Input mouse/touch
}
```

#### Sistema de Disparo
```javascript
setupInput() {
  this.input.on('pointerdown', (pointer) => {
    this.isAiming = true;
    this.aimStartX = pointer.x;
    this.aimStartY = pointer.y;
  });
  
  this.input.on('pointermove', (pointer) => {
    if (this.isAiming) {
      this.updateAimLine(pointer.x, pointer.y);
    }
  });
  
  this.input.on('pointerup', async (pointer) => {
    const power = this.calculatePower(pointer);
    const angle = this.calculateAngle(pointer);
    await this.fireShot(power, angle);
  });
}
```

#### Cálculo de Disparo
```javascript
calculatePower(endX, endY) {
  const distance = Phaser.Math.Distance.Between(
    this.aimStartX, this.aimStartY, endX, endY
  );
  return Math.min(Math.round(distance / 3), 200);
}

calculateAngle(endX, endY) {
  const angle = Phaser.Math.Angle.Between(
    this.aimStartX, this.aimStartY, endX, endY
  );
  return Phaser.Math.RadToDeg(angle);
}
```

#### Animación de Proyectil
```javascript
async animateProjectile(points, startX, startY, direction) {
  const projectile = this.add.polygon(startX, startY, arrowPoints, color);
  
  for (let i = 1; i < points.length; i++) {
    const point = points[i];
    const angle = Phaser.Math.Angle.Between(
      projectile.x, projectile.y, point.x, point.y
    );
    projectile.rotation = angle;
    
    await new Promise(resolve => {
      this.tweens.add({
        targets: projectile,
        x: point.x,
        y: point.y,
        duration: 40,
        onComplete: resolve
      });
    });
  }
}
```

#### Sistema de Daño
```javascript
applyDamage(target, damage, knockback) {
  target.health -= damage;
  target.healthBar.scaleX = target.health / 100;
  
  this.tweens.add({
    targets: target.container,
    x: target.container.x + knockback,
    duration: 200,
    ease: 'Power2'
  });
  
  if (target.health <= 0) {
    this.endGame();
  }
}
```

---

## 🤖 Modo CPU

### Lógica de Disparo CPU
```javascript
async cpuShoot() {
  const hitChance = 0.6;  // 60% de acierto (3 de 5)
  const willHit = Math.random() < hitChance;
  
  if (willHit) {
    // Intenta acertar con alta precisión
    let attempt = 0;
    do {
      trajectory = this.calculateTrajectory(power, angle);
      impact = this.findImpactPoint(trajectory, target);
      if (impact) break;
      
      // Ajustes finos
      power += Phaser.Math.Between(-3, 3);
      angle += Phaser.Math.Between(-2, 2);
      attempt++;
    } while (attempt < 10);
  } else {
    // Intenta fallar intencionalmente
    angle += Phaser.Math.Between(12, 20);  // Desvía ángulo
    power += Phaser.Math.Between(10, 20);  // Aumenta potencia
  }
  
  await this.animateProjectile(trajectory);
}
```

### Diferencias PvP vs CPU
| Aspecto | PvP | CPU |
|---------|-----|-----|
| gameId | Del servidor | Fake (cpu-game-timestamp) |
| Disparo | API /api/games/shoot | Cálculo local |
| Oponente | Jugador real | IA simple |
| Matchmaking | Socket.io | N/A |

---

## 📡 API Endpoints

### Autenticación
```
POST /api/auth/register
Body: { username, email, password }
Response: { token, user: { id, username, email, wins, losses, coins } }

POST /api/auth/login
Body: { email, password }
Response: { token, user: { id, username, email, wins, losses, coins } }
```

### Partidas
```
POST /api/games/shoot
Body: { power, angle, direction }
Response: { 
  trajectory: [{ x, y }, ...],
  hit: boolean,
  damage: number,
  knockback: number
}

GET /api/games/:gameId
Response: {
  player1: { health, x, y },
  player2: { health, x, y },
  currentTurn: string
}
```

### Socket.io Events
```
Client → Server:
  joinQueue: { userId }

Server → Client:
  matchFound: { gameId, opponentId }
  opponentShot: { power, angle, trajectory }
  gameEnd: { winnerId }
```

---

## 🎨 Diseño Visual

### Glassmorphism
```javascript
createStyledPanel(x, y, width, height, color) {
  // Capa 1: Fondo semi-transparente
  panel.fillStyle(color, 0.15);
  panel.fillRoundedRect(...);
  
  // Capa 2: Gradiente
  panel.fillGradientStyle(...);
  
  // Capa 3: Inner glow
  innerGlow.fillStyle(color, 0.1);
  
  // Capa 4: Border
  panel.lineStyle(2, 0xffffff, 0.4);
  
  // Capa 5: Outer glow
  outerGlow.lineStyle(6, color, 0.3);
}
```

### Personajes Bowmasters
```javascript
createBowmastersPlayer(x, y, type, isLeft) {
  // Aura animada
  // Cuerpo con armadura
  // Cabeza con pelo, ojos, cejas
  // Sombrero/casco con pluma
  // Arma: ballesta con flecha
  // Barra de vida con icono
  // Animaciones: respiración, rotación
}
```

---

## 🚀 Ejecución del Proyecto

### Backend
```bash
cd backend
npm install
npm run dev  # Puerto 3000
```

### Frontend
```bash
cd frontend
npm install
npm run dev  # Puerto 5173
```

### Script para ambos (Windows)
```bash
start-all.bat  # Abre 2 terminales
```

---

## 📊 Flujo de Datos

### Disparo PvP
```
1. Usuario arrastra mouse → Calcula power/angle
2. Suelta mouse → fireShot()
3. Llama API: POST /api/games/shoot
4. Backend calcula trayectoria física
5. Backend determina impacto y daño
6. Retorna resultado al frontend
7. Frontend anima proyectil
8. Socket.io emite evento al oponente
9. Oponente recibe y anima disparo
```

### Disparo CPU
```
1. CPU decide acertar (60%) o fallar (40%)
2. Calcula power/angle con ajustes finos
3. Genera trayectoria local
4. Anima proyectil
5. Determina impacto localmente
6. Aplica daño al jugador
7. Cambia turno al jugador
```

---

## 🔒 Seguridad

- **Contraseñas:** Encriptadas con bcrypt (salt rounds: 10)
- **Autenticación:** JWT tokens con expiración
- **CORS:** Configurado para permitir frontend
- **Validación:** Joi para validar inputs

---

## 📈 Escalabilidad

### Backend
- MongoDB permite escalado horizontal
- Socket.io soporta múltiples instancias con Redis adapter
- API REST es stateless

### Frontend
- Phaser 3 optimizado para WebGL
- React lazy loading para componentes
- Vite para build rápido

---

## 🎯 Conclusión

QuizMate es un juego de artillería 2D estilo Bowmasters con:
- **Backend robusto:** API REST + WebSockets para tiempo real
- **Frontend moderno:** React + Phaser 3 para gráficos de alta calidad
- **Modo CPU:** IA con 60% de precisión para juego local
- **Diseño profesional:** Glassmorphism, animaciones fluidas, efectos visuales avanzados
- **Arquitectura escalable:** Separa lógica de negocio, presentación y datos
