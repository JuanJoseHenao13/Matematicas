% Advanced Frontend‑Backend Technical Document
% Quizmate – Arquitectura y Modelado Físico
% -------------------------------------------------
% Este documento LaTeX describe con detalle cómo el frontend de Quizmate interactúa con el backend,
% cómo se calculan la trayectoria, el daño, el efecto del viento y cómo se renderiza todo en Phaser.
% Está pensado para la carpeta **docs** del proyecto y sustituye el archivo Markdown existente.

\\documentclass[12pt]{article}
\\usepackage[spanish]{babel}
\\usepackage{amsmath,amssymb}
\\usepackage{geometry}
\\usepackage{hyperref}
\\usepackage{xcolor}
\\geometry{margin=1in}

\\title{Arquitectura Frontend ⇄ Backend y Modelado Físico}
\\author{Quizmate Development Team}
\\date{\\today}

\\begin{document}
\\maketitle

\\section{Resumen Ejecutivo}
El objetivo del proyecto es ofrecer una experiencia educativa interactiva en la que el usuario lanza un proyectil (lanza, arco, etc.) y observa su trayectoria basada en principios de cinemática y trigonometría.  
Todas las decisiones críticas (cálculo de la parábola, detección de impacto, cálculo de daño y "knockback") se realizan en el **backend** mediante un servidor Express + Prisma.  
El frontend, construido con **React** y **Phaser**, se limita a capturar la entrada del usuario, enviarla al servidor y reproducir visualmente los datos devueltos.

\\section{Stack Tecnológico}
\\begin{itemize}
  \\item \textbf{Frontend}: React 19, Vite, TypeScript, Phaser 3.
  \\item \textbf{Backend}: Node.js, Express, TypeScript, Prisma (PostgreSQL), Socket.IO.
  \\item \textbf{Comunicación}: REST para acciones sincrónicas (\texttt{/api/game/shoot}), WebSockets para actualizaciones en tiempo real.
  \\item \textbf{Autenticación}: JWT (Bearer token) en cabecera \texttt{Authorization}.
\\end{itemize}

\\section{Flujo de Interacción}
\\begin{enumerate}
  \\item El usuario ingresa **velocidad**, **ángulo** y opcionalmente **ubicación del golpe** ("head" o "body").
  \\item Al pulsar "Disparar", el frontend envía una petición POST a \texttt{/api/game/shoot} con el cuerpo JSON:
  \\begin{verbatim}
  {
    "gameId": "<id>",
    "velocity": 75.5,
    "angleDegrees": 42,
    "direction": 1,
    "weaponId": "spear",
    "hitLocation": "head" // opcional
  }
  \\end{verbatim}
  \\item El backend valida el JWT mediante \texttt{authMiddleware} y verifica que el jugador pertenezca a la partida.
  \\item Se calcula la **trayectoria parabólica** (ver sección \ref{sec:trajectory}).
  \\item Se detecta la proximidad al oponente, se determina si el golpe es exitoso y se calcula **daño** y **knockback** (sección \ref{sec:damage}).
  \\item Se persisten los cambios en la base de datos (salud, posición X) y se registra el disparo en la tabla \texttt{Shot}.
  \\item El servidor emite un evento Socket.IO llamado \texttt{game_update} con los datos de la jugada, de modo que el rival reciba la animación en tiempo real.
  \\item El frontend recibe la respuesta y/o el evento, actualiza el UI (barra de vida, posición del sprite) y traza la curva mediante Phaser.
\\end{enumerate}

\\section{Cálculo de la Trayectoria}\label{sec:trajectory}
El algoritmo implementado en \texttt{src/server/games/index.ts} emplea la fórmula clásica de movimiento bajo gravedad constante:
\\begin{align}
  x(t) &= x_0 + v \cos(\theta) \cdot d \cdot t \\
  y(t) &= y_0 + v \sin(\theta) \cdot t - \frac{1}{2} g \cdot t^{2} + w \cdot t
\\end{align}
Donde:
\\begin{itemize}
  \\item $x_0, y_0$ = posición inicial del lanzador.
  \\item $v$ = velocidad inicial.
  \\item $\theta$ = ángulo (en radianes).
  \\item $d$ = dirección horizontal (\texttt{1} o \texttt{-1}).
  \\item $g$ = gravedad (valor hard‑codeado a \texttt{0.5} para que la curva sea visible en pantalla).
  \\item $w$ = componente de viento horizontal (actualmente ``0``; está previsto como parámetro extensible).
\\end{itemize}
El recorrido se genera iterando cada $\Delta t = 0.5$ s hasta que $y$ supera la altura inicial (impacto con el suelo).

\\section{Daño y Knockback}\label{sec:damage}
Una vez se determina el punto de impacto, se calcula la distancia euclidiana al oponente:
\\[
  d = \sqrt{(x_{impact} - x_{op})^{2} + (y_{impact} - y_{op})^{2}}
\\]
Si $d < 55$ pixeles, el disparo se considera exitoso (`isHit = true`).

\\subsection{Rangos de Daño}
El backend permite especificar la zona del cuerpo mediante el campo opcional ``hitLocation``:
\\begin{itemize}
  \\item ``head`` → daño aleatorio entre 22 y 30.
  \\item ``body`` (valor por defecto) → daño aleatorio entre 14 y 20.
\\end{itemize}
El código relevante (líneas 84‑92) garantiza que el daño sea coherente con la zona:
\\begin{verbatim}
let damage = 0;
if (isHit) {
  const hitLocation = (req.body as any).hitLocation ?? 'body';
  if (hitLocation === 'head') {
    damage = Math.floor(Math.random() * (30 - 22 + 1)) + 22;
  } else {
    damage = Math.floor(Math.random() * (20 - 14 + 1)) + 14;
  }
}
\\end{verbatim}
El **knockback** se calcula como:
\\[
  k = d_{direction} \times \operatorname{round}(damage \times 1.1)
\\]
Y se aplica al oponente mediante una actualización Prisma (`positionX` incrementado).

\\section{Comunicación en Tiempo Real}
\\begin{itemize}
  \\item Después de registrar el disparo, el backend emite:
  \\begin{verbatim}
  socketServer?.to(gameId).emit('game_update', {
    shooterId,
    trajectory,
    impactPoint,
    isHit,
    damage,
    knockback,
    newTargetPositionX
  });
  \\end{verbatim}
  \\item En el cliente, el socket está escuchando:
  \\begin{verbatim}
  socket.on('game_update', data => {
    // Dibujar trayectoria con Phaser, aplicar damage/knockback
  });
  \\end{verbatim}
\\end{itemize}
Este mecanismo garantiza que ambos jugadores vean la acción simultáneamente sin recargar la página.

\\section{Renderizado en Phaser}
El frontend recibe la lista de puntos \texttt{trajectory} y crea una curva con el plugin ``Graphics`` o mediante un ``Path``:
\\begin{verbatim}
const graphics = this.add.graphics();
graphics.lineStyle(2, 0xffffff);
graphics.beginPath();
trajectory.forEach((p, i) => {
  if (i === 0) graphics.moveTo(p.x, p.y);
  else graphics.lineTo(p.x, p.y);
});
graphics.strokePath();
\\end{verbatim}
El punto de impacto se usa para posicionar una explosión o animación de daño.  
Los valores de ``damage`` y ``knockback`` actualizan la barra de vida y desplazan al sprite del oponente.

\\section{Extensibilidad del Viento}
Aunque actualmente el parámetro ``wind`` se envía como ``0`` desde el frontend, la arquitectura está preparada para que el cliente lo modifique (por ejemplo, un slider de intensidad).  
Para habilitarlo, basta con:
\\begin{enumerate}
  \\item Añadir ``wind`` al cuerpo del request.
  \\item Modificar la función ``calculateTrajectory`` en el backend para incluir el término $w \cdot t$ en la componente $x(t)$.
  \\item Actualizar la UI del cliente para permitir al jugador ajustar el viento.
\\end{enumerate}
Esto demuestra la flexibilidad del diseño: el frontend controla la variable y el backend la incorpora en el modelo físico sin cambiar la lógica de daño.

\\section{Conclusiones}
El proyecto sigue los principios de **backend autoritativo**, delegando toda la física y la lógica de juego al servidor.  
El frontend actúa como una capa de presentación, consumiendo datos estructurados y reproduciéndolos mediante Phaser y WebSockets.  
Gracias a la separación clara, el sistema permite introducir nuevas variables (viento, gravedad variable) con mínimas modificaciones en el cliente.

\\end{document}

**Proyecto:** Quizmate (Juego Educativo Interactivo)
**Área de Desarrollo:** Frontend & Game Logic
**Materia:** Matemáticas 3

---

## 1. Resumen Ejecutivo
El presente documento detalla la arquitectura, el diseño de software y el modelado matemático implementado en el área de **Frontend** del proyecto *Quizmate*. El objetivo de este desarrollo fue construir una aplicación web interactiva (Single Page Application) que integrara una interfaz de usuario moderna con un motor gráfico 2D, permitiendo simular con alta fidelidad física el lanzamiento de proyectiles utilizando principios de trigonometría y cinemática (tiro parabólico).

---

## 2. Stack Tecnológico y Arquitectura del Frontend

Para garantizar un rendimiento óptimo, escalabilidad y una experiencia de usuario (UX) inmersiva, el proyecto se desarrolló bajo el siguiente ecosistema tecnológico:

### 2.1. React.js (v19)
**Función:** Manejo de la Interfaz de Usuario (UI) y Estado Global de la Aplicación.
*   **¿Por qué se usó?:** React nos permite construir la aplicación mediante componentes reutilizables. Maneja eficientemente los cambios de estado (como transiciones entre menús, sistema de emparejamiento y visualización de perfiles) a través de su *Virtual DOM*.
*   **Implementación:** Se encarga de envolver el contenedor del juego y gestionar la comunicación asíncrona con el backend (Autenticación, REST APIs, WebSockets) antes de que el usuario entre a la arena de combate.

### 2.2. Phaser.js (v3)
**Función:** Motor Gráfico 2D y Bucle de Juego (Game Loop).
*   **¿Qué es Phaser?:** Es un robusto framework de desarrollo de juegos en HTML5. Utiliza renderizado acelerado por hardware a través de **WebGL** (con un respaldo a *Canvas API* si WebGL no está disponible).
*   **¿Por qué se usó?:** A diferencia de React, que actualiza el DOM de forma reactiva, un videojuego requiere actualizarse a 60 cuadros por segundo (FPS). Phaser provee un **Game Loop** (ciclo continuo de `update` y `render`), manejo de escenas (Scene Manager) y renderizado de *sprites* de alto rendimiento, ideal para calcular e interpolar el movimiento del proyectil cuadro por cuadro.

### 2.3. Vite
**Función:** Entorno de Desarrollo y Empaquetador (Bundler).
*   **¿Qué es y por qué se usó?:** A diferencia de Webpack, Vite utiliza módulos nativos de ES (ESM) para ofrecer un servidor de desarrollo extremadamente rápido y con HMR (Hot Module Replacement). Esto nos permitió iterar y compilar el código del juego en tiempo real sin demoras, optimizando el producto final en un paquete ligero.

### 2.4. Tailwind CSS
**Función:** Framework de Estilos CSS (Utility-First).
*   **¿Qué es y por qué se usó?:** Nos permitió diseñar toda la interfaz superpuesta al juego (HUD, botones, menús) directamente en el código de los componentes. Se utilizaron efectos visuales modernos como *Glassmorphism* (desenfoque de fondo y transparencias) y layouts responsivos que se adaptan a cualquier resolución de pantalla, sin escribir grandes hojas de estilo CSS tradicionales.

---

## 3. Lógica Matemática del Juego: El Tiro Parabólico

El corazón mecánico del Frontend en *Quizmate* es el sistema de apuntado y disparo. Para simular el lanzamiento balístico con precisión, se programó desde cero un modelo físico basado en la **Cinemática Bidimensional**, demostrando la aplicación práctica de conceptos de **Matemáticas 3** (Cálculo Vectorial y Trigonometría).

### Fase 1: Recolección de Datos mediante Vectores Espaciales
El proceso inicia cuando el usuario presiona y arrastra el mouse. Consideramos el punto de inicio (el personaje, $P_0$) y la posición final del cursor ($P_1$) como coordenadas en un plano cartesiano bidimensional.

1.  **Diferenciales de Posición:**
    Obtenemos las longitudes de los catetos del triángulo rectángulo formado:
    $$ \Delta x = x_{cursor} - x_{personaje} $$
    $$ \Delta y = y_{personaje} - y_{cursor} $$
    *(Nota Técnica: En el sistema de coordenadas de las pantallas, el eje Y crece hacia abajo. Por lo tanto, invertimos el cálculo de $\Delta y$ para trabajar con un modelo cartesiano estándar donde "arriba" es positivo).*

2.  **Cálculo de la Magnitud (Fuerza / Velocidad Inicial $v_0$):**
    Utilizando el **Teorema de Pitágoras**, calculamos la longitud de la hipotenusa (el vector de desplazamiento del mouse), que es proporcional a la velocidad inicial ($v_0$) que tendrá el proyectil:
    $$ v_0 = k \cdot \sqrt{(\Delta x)^2 + (\Delta y)^2} $$
    *(Donde $k$ es una constante escalar para ajustar la jugabilidad).*

3.  **Cálculo del Argumento (Ángulo $\theta$):**
    Para determinar la inclinación exacta del disparo, usamos la función trigonométrica inversa del arco tangente:
    $$ \theta = \arctan\left(\frac{\Delta y}{|\Delta x|}\right) $$

### Fase 2: Descomposición Vectorial
En la cinemática, los movimientos en los ejes $X$ e $Y$ son independientes. Por ello, empleamos trigonometría básica (Seno y Coseno) para proyectar el vector de velocidad inicial ($v_0$) sobre ambos ejes:

*   **Componente Horizontal (Velocidad en X):**
    $$ v_{0x} = v_0 \cdot \cos(\theta) $$
*   **Componente Vertical (Velocidad en Y):**
    $$ v_{0y} = v_0 \cdot \sin(\theta) $$

### Fase 3: Ecuaciones Paramétricas de la Cinemática (El Bucle de Cálculo)
Una vez el proyectil se libera, entra en un estado de movimiento de proyectiles donde actúa una aceleración constante vertical: la **gravedad ($g$)**.

El motor de juego (Phaser) itera sobre el tiempo continuo ($t$). En cada iteración temporal, la posición cartesiana $(x, y)$ del proyectil se actualiza siguiendo estas fórmulas del cálculo diferencial e integral elemental:

1.  **En el eje X (Movimiento Rectilíneo Uniforme):**
    No hay resistencia del aire, por lo que la velocidad es constante.
    $$ x(t) = x_{inicial} + (v_{0x} \cdot t) $$

2.  **En el eje Y (Movimiento Rectilíneo Uniformemente Acelerado):**
    Actúa la gravedad, deformando la trayectoria lineal y convirtiéndola en una **parábola**.
    $$ y(t) = y_{inicial} - \left( v_{0y} \cdot t - \frac{1}{2} g t^2 \right) $$
    *(El signo menos principal antes del paréntesis adapta matemáticamente nuestro modelo clásico al sistema de coordenadas invertido del DOM/Canvas HTML5).*

---

## 4. Implementación Directa en Código (Ingeniería de Software)

Para sustentar la implementación técnica, a continuación se presenta el bloque de código real integrado en el ecosistema de Phaser (dentro de `GameScene.js`). Este código calcula en tiempo real todos los puntos coordenados de la parábola para renderizar la previsualización de la trayectoria.

```javascript
/**
 * @method calculateTrajectory
 * @description Modela la trayectoria parabólica del disparo aplicando física newtoniana.
 *
 * @param {number} startX - Coordenada X inicial
 * @param {number} startY - Coordenada Y inicial
 * @param {number} power - Escalar de la magnitud de fuerza (v0)
 * @param {number} angleDegrees - Ángulo de inclinación en grados (θ)
 * @param {number} direction - 1 si apunta a la derecha, -1 si apunta a la izquierda
 * @returns {Array} Vector de coordenadas {x, y} de la parábola resultante
 */
calculateTrajectory(startX, startY, power, angleDegrees, direction) {
    const points = [];
    const gravity = 0.5; // Constante de aceleración g
    
    // 1. Descomposición Vectorial
    // Se requiere convertir angleDegrees a radianes multiplicando por (π / 180)
    const angleRadian = angleDegrees * (Math.PI / 180);
    const velocityX = (power / 10) * Math.cos(angleRadian) * direction;
    const velocityY = (power / 10) * Math.sin(angleRadian);
    
    // 2. Ejecución de la Ecuación Paramétrica sobre el Tiempo (t)
    // Se itera simulando el paso del tiempo en el espacio bidimensional
    for (let t = 0; t < 100; t += 0.5) {
        
        // Ecuación de MRU para X
        const deltaX = velocityX * t;
        
        // Ecuación de MRUV para Y
        const deltaY = (velocityY * t) - (0.5 * gravity * t * t);
        
        // Transformación al sistema de coordenadas de la pantalla (Canvas)
        const currentX = startX + deltaX;
        const currentY = startY - deltaY; // Y se resta para que el proyectil "suba" visualmente
        
        points.push({ x: currentX, y: currentY });
        
        // 3. Condición límite: el suelo de la pantalla
        if (currentY > this.scale.height) break;
    }
    
    return points;
}
```

## 5. Conclusión para la Sustentación

El desarrollo del **Frontend** en este proyecto no se limitó a "pintar" una interfaz. Requirió establecer una sólida base de **Ingeniería de Software** estructurando un ecosistema robusto con React y Vite, y un dominio avanzado de **Matemáticas y Física** aplicadas.

No dependimos de soluciones prefabricadas o motores físicos de caja negra para este núcleo. Al diseñar el modelo físico, se tradujeron conceptos abstractos de vectores, trigonometría y cálculo diferencial a un lenguaje de programación, ejecutando cientos de cálculos en milisegundos para lograr un resultado visual armónico y gamificado. Esto demuestra la aplicación directa e imprescindible de la matemática en las ciencias de la computación modernas.
