import { prisma } from "@/server/prisma/prisma.client";

export class MatchmakingService {
  /**
   * Busca una partida para un usuario.
   * Si hay alguien en cola, crea la partida.
   * Si no, crea un ticket de espera.
   */
  static async findMatch(userId: string) {
    // 1. Buscar tickets activos (que no sean del mismo usuario)
    const pendingTicket = await prisma.matchmakingTicket.findFirst({
      where: {
        status: "QUEUED",
        userId: { not: userId }
      },
      orderBy: { createdAt: "asc" }
    });

    if (pendingTicket) {
      // 2. Crear partida
      const game = await prisma.game.create({
        data: {
          status: "IN_PROGRESS",
          currentTurnUserId: userId, // El que encuentra partida empieza
          players: {
            create: [
              { userId, positionX: 100, positionY: 0, health: 100 },
              { userId: pendingTicket.userId, positionX: 800, positionY: 0, health: 100 }
            ]
          }
        }
      });

      // 3. Actualizar tickets
      await prisma.matchmakingTicket.update({
        where: { id: pendingTicket.id },
        data: { status: "MATCHED", gameId: game.id }
      });

      return { status: "MATCHED", gameId: game.id };
    } else {
      // 4. Crear ticket de espera
      const ticket = await prisma.matchmakingTicket.create({
        data: {
          userId,
          status: "QUEUED"
        }
      });

      return { status: "QUEUED", ticketId: ticket.id };
    }
  }

  /**
   * Cancela la búsqueda de partida de un usuario.
   */
  static async cancelMatch(userId: string) {
    return prisma.matchmakingTicket.updateMany({
      where: {
        userId,
        status: "QUEUED"
      },
      data: {
        status: "CANCELLED"
      }
    });
  }
}
