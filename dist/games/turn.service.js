"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TurnService = void 0;
const prisma_client_1 = require("../prisma/prisma.client");
const client_1 = require("@prisma/client");
/**
 * SERVICIO DE TURNOS
 *
 * Se encarga de cambiar el turno de un jugador a otro
 * después de un disparo válido.
 */
class TurnService {
    /**
     * Cambia el turno al siguiente jugador y avanza la ronda si es necesario.
     */
    static async advanceTurn(gameId, currentUserId) {
        const game = await prisma_client_1.prisma.game.findUnique({
            where: { id: gameId },
            include: { players: true }
        });
        if (!game || game.status !== client_1.GameStatus.IN_PROGRESS) {
            throw new Error("La partida no está en curso.");
        }
        // Encontrar al otro jugador
        const nextPlayer = game.players.find(p => p.userId !== currentUserId);
        if (!nextPlayer)
            throw new Error("No se encontró oponente.");
        // Avanzar la ronda si ambos tiraron (simplificación)
        // En este caso, simplemente cambiamos el turno
        return prisma_client_1.prisma.game.update({
            where: { id: gameId },
            data: {
                currentTurnUserId: nextPlayer.userId,
                wind: Math.floor(Math.random() * 5) - 2 // Cambiamos el viento ligeramente cada turno
            }
        });
    }
}
exports.TurnService = TurnService;
