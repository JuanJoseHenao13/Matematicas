import { prisma } from "../prisma/prisma.client";

/**
 * SERVICIO DE PERSONAJES
 * 
 * Gestiona la obtención de los personajes disponibles en el juego.
 */
export class CharactersService {
  /**
   * Obtiene todos los personajes activos.
   */
  static async getActiveCharacters() {
    return prisma.character.findMany({
      where: { isActive: true },
      select: {
        id: true,
        code: true,
        name: true,
        avatarUrl: true,
        baseHealth: true
      }
    });
  }
}
