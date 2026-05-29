# Documento Técnico y de Sustentación: Arquitectura Frontend y Modelado Físico
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
