import { prisma } from "../prisma/prisma.client";

/**
 * SERVICIO DE ARMAS
 * 
 * Gestiona la obtención de las armas disponibles en el juego.
 */
export class WeaponsService {
  /**
   * Obtiene todas las armas activas.
   */
  static async getActiveWeapons() {
    return prisma.weapon.findMany({
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
