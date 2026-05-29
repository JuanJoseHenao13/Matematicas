"use strict";
/**
 * SERVICIO DE TRAYECTORIA - MATEMÁTICAS 3
 *
 * Este servicio se encarga de modelar el movimiento parabólico de los proyectiles.
 * En Matemáticas 3, esto se relaciona con:
 * 1. Funciones Vectoriales: R(t) = <x(t), y(t)>
 * 2. Funciones de Varias Variables: f(v, theta, g) = Alcance
 * 3. Derivadas Parciales: Sensibilidad del alcance ante cambios en v, theta o g.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrajectoryService = void 0;
class TrajectoryService {
    /**
     * Calcula la trayectoria completa de un disparo.
     * Utiliza las ecuaciones paramétricas del movimiento:
     * x(t) = x0 + dir * v * cos(theta) * t + wind * t
     * y(t) = y0 + v * sin(theta) * t - 0.5 * g * t^2
     */
    static calculateTrajectory(params) {
        const { v0, angleDegrees, g, wind = 0, direction, origin } = params;
        const theta = (angleDegrees * Math.PI) / 180; // Conversión a radianes
        const vx0 = direction * v0 * Math.cos(theta) + wind;
        const vy0 = v0 * Math.sin(theta);
        // Tiempo de vuelo: resolviendo y(t) = 0 (asumiendo impacto en el suelo y=0)
        // 0 = y0 + vy0*t - 0.5*g*t^2 => 0.5*g*t^2 - vy0*t - y0 = 0
        // Usando fórmula cuadrática: t = (-b +/- sqrt(b^2 - 4ac)) / 2a
        // a = 0.5*g, b = -vy0, c = -origin.y
        const a = 0.5 * g;
        const b = -vy0;
        const c = -origin.y;
        const discriminant = b * b - 4 * a * c;
        const tFlight = (-b + Math.sqrt(discriminant)) / (2 * a);
        const points = [];
        const step = tFlight / 20; // 20 puntos para representar la curva
        for (let t = 0; t <= tFlight; t += step) {
            points.push({
                x: origin.x + vx0 * t,
                y: Math.max(0, origin.y + vy0 * t - 0.5 * g * t * t),
            });
        }
        const impactPoint = {
            x: origin.x + vx0 * tFlight,
            y: 0, // Impacto en el suelo
        };
        return {
            impactPoint,
            timeOfFlight: tFlight,
            maxHeights: origin.y + (vy0 * vy0) / (2 * g),
            horizontalRange: Math.abs(impactPoint.x - origin.x),
            points,
        };
    }
    /**
     * Análisis de sensibilidad mediante DERIVADAS PARCIALES.
     * El alcance R depende de v (velocidad) y theta (ángulo).
     * R(v, theta) = (v^2 * sin(2*theta)) / g
     */
    static calculateSensitivity(v, angleDegrees, g) {
        const theta = (angleDegrees * Math.PI) / 180;
        // dR/dv = (2v * sin(2*theta)) / g
        const dRdv = (2 * v * Math.sin(2 * theta)) / g;
        // dR/dtheta = (2v^2 * cos(2*theta)) / g
        // Nota: El resultado está en metros por radián.
        const dRda = (2 * Math.pow(v, 2) * Math.cos(2 * theta)) / g;
        // dR/dg = -(v^2 * sin(2*theta)) / g^2
        const dRdg = -(Math.pow(v, 2) * Math.sin(2 * theta)) / Math.pow(g, 2);
        return { dRdv, dRda, dRdg };
    }
}
exports.TrajectoryService = TrajectoryService;
