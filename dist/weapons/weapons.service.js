"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WeaponsService = void 0;
const prisma_client_1 = require("../prisma/prisma.client");
/**
 * SERVICIO DE ARMAS
 *
 * Gestiona la obtención de las armas disponibles en el juego.
 */
class WeaponsService {
    /**
     * Obtiene todas las armas activas.
     */
    static async getActiveWeapons() {
        return prisma_client_1.prisma.weapon.findMany({
            where: { isActive: true },
            select: {
                id: true,
                code: true,
                name: true,
                baseDamage: true,
                hitRadius: true,
                maxVelocity: true
            }
        });
    }
}
exports.WeaponsService = WeaponsService;
