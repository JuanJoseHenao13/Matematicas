"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CharactersService = void 0;
const prisma_client_1 = require("../prisma/prisma.client");
/**
 * SERVICIO DE PERSONAJES
 *
 * Gestiona la obtención de los personajes disponibles en el juego.
 */
class CharactersService {
    /**
     * Obtiene todos los personajes activos.
     */
    static async getActiveCharacters() {
        return prisma_client_1.prisma.character.findMany({
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
exports.CharactersService = CharactersService;
