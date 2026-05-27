import { prisma } from "../prisma/prisma.client";
import { GameStatus } from "@prisma/client";
import { GameState } from "./games.types";

/**
 * SERVICIO DE JUEGOS
 * 
 * Gestiona la creación de partidas, el estado de las mismas
 * y la conexión de los jugadores.
 */
export class GamesService {
  /**
   * Crea una nueva partida en estado WAITING
   */
  static async createGame(user1Id: string, user2Id: string) {
    // Para simplificar, posiciones iniciales fijas: user1 izquierda, user2 derecha
    return prisma.game.create({
      data: {
        status: GameStatus.WAITING,
        gravity: 9.8,
        wind: Math.floor(Math.random() * 5) - 2, // Viento aleatorio entre -2 y 2
        players: {
          create: [
            { userId: user1Id, positionX: 100, health: 100, maxHealth: 100 },
            { userId: user2Id, positionX: 900, health: 100, maxHealth: 100 }
          ]
        }
      },
      include: { players: true }
    });
  }

  /**
   * Un jugador se marca como READY. Si ambos están listos, la partida empieza.
   */
  static async setPlayerReady(gameId: string, userId: string) {
    await prisma.gamePlayer.update({
      where: { gameId_userId: { gameId, userId } },
      data: { isReady: true }
    });

    const game = await prisma.game.findUnique({
      where: { id: gameId },
      include: { players: true }
    });

    if (game && game.players.every(p => p.isReady) && game.status === GameStatus.WAITING) {
      // Iniciar partida
      // Sortear turno
      const firstTurnUserId = game.players[Math.floor(Math.random() * 2)].userId;
      
      return prisma.game.update({
        where: { id: gameId },
        data: { 
          status: GameStatus.IN_PROGRESS,
          currentTurnUserId: firstTurnUserId
        },
        include: { players: { include: { user: true } } }
      });
    }

    return game;
  }

  /**
   * Obtiene el estado actual de la partida, formateado para el Frontend.
   */
  static async getGameState(gameId: string): Promise<GameState | null> {
    const game = await prisma.game.findUnique({
      where: { id: gameId },
      include: {
        players: { include: { user: true } }
      }
    });

    if (!game) return null;

    return {
      gameId: game.id,
      status: game.status as unknown as GameState["status"],
      currentTurnUserId: game.currentTurnUserId,
      gravity: game.gravity,
      wind: game.wind,
      round: game.round,
      players: game.players.map(p => ({
        userId: p.userId,
        username: p.user.username,
        characterId: p.characterId || p.user.selectedCharacterId,
        weaponId: p.weaponId || p.user.selectedWeaponId,
        positionX: p.positionX,
        positionY: p.positionY,
        health: p.health,
        maxHealth: p.maxHealth,
        isReady: p.isReady,
        isCurrentTurn: game.currentTurnUserId === p.userId
      }))
    };
  }

  /**
   * Finaliza la partida estableciendo un ganador.
   */
  static async finishGame(gameId: string, winnerUserId: string) {
    return prisma.game.update({
      where: { id: gameId },
      data: {
        status: GameStatus.FINISHED,
        winnerUserId
      }
    });
  }
}
