# QUIZMATE Frontend - Bowmasters Math

Frontend del juego QUIZMATE desarrollado con Phaser 3. Este cliente se conecta al backend de Next.js para proporcionar una experiencia de juego estilo Bowmaster con mecánicas matemáticas educativas.

## 🎮 Características

- **Login/Registro**: Sistema de autenticación conectado al backend
- **Matchmaking**: Sistema de búsqueda de oponentes en tiempo real
- **Juego estilo Bowmaster**: Mecánica de disparo con arrastre del mouse
- **Animación de trayectoria**: Visualización de la trayectoria calculada por el backend
- **UI Educativa**: Panel de análisis de sensibilidad matemática
- **Turnos**: Sistema de turnos entre jugadores

## 🛠️ Tecnologías

- **Phaser 3**: Motor de juego 2D
- **Vite**: Build tool y dev server
- **JavaScript ES6+**: Lógica del juego

## 📋 Requisitos Previos

Antes de ejecutar el frontend, asegúrate de tener:

1. **Backend corriendo**: El backend de Next.js debe estar ejecutándose en `http://localhost:3000`
   - Sigue las instrucciones del README principal para configurar el backend
   - Asegúrate de ejecutar: `npx prisma generate`, `npx prisma migrate dev --name init`, `npx prisma db seed`, `npx pnpm dev`

2. **Node.js**: Versión 18 o superior

## 🚀 Instalación y Ejecución

1. **Instalar dependencias**:
   ```bash
   cd frontend
   npm install
   ```

2. **Iniciar el servidor de desarrollo**:
   ```bash
   npm run dev
   ```

3. **Abrir en el navegador**:
   - El frontend estará disponible en `http://localhost:5173`

## 🎯 Cómo Jugar

1. **Registro/Login**: 
   - Ingresa tu usuario, email y contraseña
   - O inicia sesión si ya tienes cuenta

2. **Menú Principal**:
   - Presiona "JUGAR" para buscar un oponente

3. **Matchmaking**:
   - Espera mientras el sistema busca un oponente
   - Cuando se encuentre, serás redirigido al juego

4. **Juego**:
   - **Apuntar**: Haz clic y arrastra el mouse para definir fuerza y ángulo
   - **Disparar**: Suelta el mouse para disparar
   - La trayectoria es calculada por el backend usando ecuaciones matemáticas
   - Después de cada disparo, verás el análisis de sensibilidad matemática

## 📊 Estructura del Proyecto

```
frontend/
├── src/
│   ├── main.js              # Punto de entrada de Phaser
│   ├── scenes/
│   │   ├── LoginScene.js    # Escena de login/registro
│   │   ├── MenuScene.js     # Menú principal
│   │   ├── MatchmakingScene.js  # Búsqueda de oponentes
│   │   └── GameScene.js     # Escena principal del juego
│   └── services/
│       └── api.js           # Servicio API para conectar con backend
├── index.html               # HTML principal
├── package.json             # Dependencias
└── vite.config.js           # Configuración de Vite
```

## 🔌 Conexión con el Backend

El frontend se conecta al backend a través de los siguientes endpoints:

- **POST /api/auth/register**: Registro de usuarios
- **POST /api/auth/login**: Login de usuarios
- **POST /api/matchmaking/find**: Búsqueda de oponentes
- **POST /api/game/shoot**: Envío de disparos

Todas las peticiones (excepto registro) requieren un token JWT que se almacena en localStorage.

## 🎨 Notas Técnicas

- **Eje Y Invertido**: El backend usa coordenadas matemáticas (Y positivo hacia arriba), mientras que Phaser usa coordenadas de pantalla (Y positivo hacia abajo). El frontend invierte las coordenadas Y al renderizar.
- **Autoritativo**: El frontend no calcula física ni matemáticas. Todo es calculado por el backend.
- **Turnos**: El servidor valida si es el turno del jugador antes de procesar un disparo.

## 🐛 Troubleshooting

**Error conectando al backend**:
- Asegúrate de que el backend esté corriendo en `http://localhost:3000`
- Verifica que hayas ejecutado las migraciones de Prisma y el seed

**Error 403 (No es tu turno)**:
- Espera a que sea tu turno antes de disparar
- El sistema de turnos es validado por el servidor

**Matchmaking no encuentra oponente**:
- Necesitas otro jugador buscando partida al mismo tiempo
- Puedes abrir dos pestañas del navegador para probar

## 📝 Próximas Mejoras

- [ ] Agregar más armas y personajes
- [ ] Mejorar gráficos y animaciones
- [ ] Agregar efectos de sonido
- [ ] Implementar sistema de puntuación
- [ ] Agregar historial de partidas
