# Arquitectura Frontend ⇄ Backend y Modelado Físico

> **Nota:** Este documento está escrito en Markdown con bloques de LaTeX. Puede convertirse a PDF en Overleaf usando la opción *Compile with pandoc* o importando el archivo `.md` y habilitando el motor **markdown+latex**.

---

## Resumen Ejecutivo

El objetivo del proyecto es ofrecer una experiencia educativa interactiva en la que el usuario lanza un proyectil (lanza, arco, etc.) y observa su trayectoria basada en principios de cinemática y trigonometría.  
Todas las decisiones críticas (cálculo de la parábola, detección de impacto, cálculo de daño y "knockback") se realizan en el **backend** mediante un servidor Express + Prisma.  
El frontend, construido con **React** y **Phaser**, se limita a capturar la entrada del usuario, enviarla al servidor y reproducir visualmente los datos devueltos.

## Stack Tecnológico

- **Frontend**: React 19, Vite, TypeScript, Phaser 3.
- **Backend**: Node.js, Express, TypeScript, Prisma (PostgreSQL), Socket.IO.
- **Comunicación**: REST ( `/api/game/shoot` ) + WebSockets.
- **Autenticación**: JWT (Bearer token) en cabecera `Authorization`.

## Flujo de Interacción

1. El usuario ingresa *velocidad*, *ángulo* y opcionalmente *ubicación del golpe* (`"head"` o `"body"`).
2. Al pulsar "Disparar", el frontend envía una petición POST a `/api/game/shoot` con el cuerpo JSON:

```json
{
  "gameId": "<id>",
  "velocity": 75.5,
  "angleDegrees": 42,
  "direction": 1,
  "weaponId": "spear",
  "hitLocation": "head" // opcional
}
```
3. El backend valida el JWT y verifica la pertenencia a la partida.
4. Se calcula la **trayectoria parabólica** (ver sección **Cálculo de la Trayectoria**).
5. Se detecta proximidad al oponente, se determina si el golpe es exitoso y se calcula **daño** y **knockback** (ver sección **Daño y Knockback**).
6. Se persisten los cambios en la base de datos y se registra el disparo.
7. El servidor emite `game_update` vía Socket.IO para sincronizar al rival.
8. El frontend recibe la respuesta/evento y actualiza UI y animaciones con Phaser.

## Cálculo de la Trayectoria {#trajectory}

$$
\begin{align}
  x(t) &= x_0 + v \cos(\theta) \cdot d \cdot t \\
  y(t) &= y_0 + v \sin(\theta) \cdot t - \frac{1}{2} g \cdot t^{2} + w \cdot t
\end{align}
$$
Donde:
- $x_0, y_0$ posición inicial del lanzador.
- $v$ velocidad inicial.
- $\theta$ ángulo (rad).
- $d$ dirección horizontal (1 o -1).
- $g$ gravedad (hard‑codeado a `0.5`).
- $w$ componente de viento horizontal (actualmente `0`).

El recorrido se genera iterando cada $\Delta t = 0.5\,\text{s}$ hasta que $y$ supera la altura inicial (impacto con el suelo).

## Daño y Knockback {#damage}

$$
d = \sqrt{(x_{impact} - x_{op})^{2} + (y_{impact} - y_{op})^{2}}
$$
Si $d < 55$ px, el disparo se considera exitoso (`isHit = true`).

### Rangos de Daño

```typescript
let damage = 0;
if (isHit) {
  const hitLocation = (req.body as any).hitLocation ?? 'body';
  if (hitLocation === 'head') {
    damage = Math.floor(Math.random() * (30 - 22 + 1)) + 22; // 22‑30
  } else {
    damage = Math.floor(Math.random() * (20 - 14 + 1)) + 14; // 14‑20
  }
}
```

El **knockback** se calcula como:

$$
k = d_{direction} \times \operatorname{round}(damage \times 1.1)
$$

## Comunicación en Tiempo Real

```typescript
socketServer?.to(gameId).emit('game_update', {
  shooterId,
  trajectory,
  impactPoint,
  isHit,
  damage,
  knockback,
  newTargetPositionX
});
```

Cliente:

```javascript
socket.on('game_update', data => {
  // Dibujar trayectoria con Phaser, aplicar daño/knockback
});
```

## Renderizado en Phaser

```javascript
const graphics = this.add.graphics();
graphics.lineStyle(2, 0xffffff);
graphics.beginPath();
trajectory.forEach((p, i) => {
  if (i === 0) graphics.moveTo(p.x, p.y);
  else graphics.lineTo(p.x, p.y);
});
graphics.strokePath();
```

## Extensibilidad del Viento

Para habilitar viento, envíe `wind` en el cuerpo de la petición y ajuste `calculateTrajectory` para incluir `$w \cdot t$` en la ecuación de $x(t)$. La arquitectura permite añadir esta variable sin cambiar la lógica de daño.

## Conclusiones

El proyecto sigue el principio de **backend autoritativo**: toda la física y lógica de juego se calculan en el servidor, mientras el cliente sólo renderiza. Esta separación permite introducir nuevas variables (viento, gravedad variable) con mínimas modificaciones en el cliente.
---
