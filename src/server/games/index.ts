import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import { PrismaClient } from '@prisma/client';
import { socketServer } from '../index';

const prisma = new PrismaClient();
export const router = Router();

// Helper to calculate trajectory (parabolic motion)
interface TrajectoryPoint {
  x: number;
  y: number;
}
function calculateTrajectory(params: {
  initialVelocity: number;
  angleDegrees: number;
  direction: number;
  gravity: number;
  originX: number;
  originY: number;
}): TrajectoryPoint[] {
  const { initialVelocity, angleDegrees, direction, gravity, originX, originY } = params;
  const angleRad = (angleDegrees * Math.PI) / 180;
  const vx = initialVelocity * Math.cos(angleRad) * direction;
  const vy = initialVelocity * Math.sin(angleRad);
  const points: TrajectoryPoint[] = [];
  const step = 0.5; // seconds per iteration
  for (let t = 0; t < 10; t += step) {
    const x = originX + vx * t;
    const y = originY - (vy * t - 0.5 * gravity * t * t);
    points.push({ x, y });
    if (y > originY) break; // hits ground
  }
  return points;
}

/**
 * POST /shoot
 * Body: { gameId, velocity, angleDegrees, direction, weaponId }
 * Returns trajectory data, impact point, damage, knockback, newTargetPositionX and math analysis.
 */
router.post('/shoot', authMiddleware, async (req: Request, res: Response) => {
  const { gameId, velocity, angleDegrees, direction, weaponId } = req.body;
  const userId = (req as any).user?.id;
  if (!gameId || !velocity || angleDegrees === undefined || direction === undefined) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }
  try {
    // Load game and verify player participation
    const game = await prisma.game.findUnique({
      where: { id: gameId },
      include: { players: true },
    });
    if (!game) {
      return res.status(404).json({ success: false, message: 'Game not found' });
    }
    const shooter = game.players.find(p => p.userId === userId);
    if (!shooter) {
      return res.status(403).json({ success: false, message: 'Player not part of this game' });
    }
    // Simple turn check (optional)
    if (game.currentTurnUserId && game.currentTurnUserId !== userId) {
      return res.status(403).json({ success: false, message: "Not this player's turn" });
    }
    const opponent = game.players.find(p => p.userId !== userId);
  if (!opponent) {
    return res.status(400).json({ success: false, message: 'Opponent not found' });
  }
    // Calculate trajectory
    const trajectory = calculateTrajectory({
      initialVelocity: velocity,
      angleDegrees,
      direction,
      gravity: 0.5, // same constant used in frontend
      originX: shooter.positionX,
      originY: shooter.positionY,
    });
    const impactPoint = trajectory[trajectory.length - 1];
    // Hit detection (distance < 55)
    const distanceToOpponent = Math.sqrt(
      Math.pow(impactPoint.x - opponent.positionX, 2) + Math.pow(impactPoint.y - opponent.positionY, 2)
    );
    const isHit = distanceToOpponent < 55;
    let damage = 0;
if (isHit) {
  const hitLocation = (req.body as any).hitLocation ?? 'body';
  if (hitLocation === 'head') {
    damage = Math.floor(Math.random() * (30 - 22 + 1)) + 22;
  } else {
    damage = Math.floor(Math.random() * (20 - 14 + 1)) + 14;
  }
}
const knockback = direction * Math.round(damage * 1.1);
    let newTargetPositionX = opponent.positionX;
    if (isHit) {
      await prisma.gamePlayer.update({
        where: { id: opponent.id },
        data: {
          health: { decrement: damage },
          positionX: { increment: knockback },
        },
      });
      const updatedOpp = await prisma.gamePlayer.findUnique({ where: { id: opponent.id } });
      newTargetPositionX = updatedOpp?.positionX ?? opponent.positionX;
    }
    // Record shot
    await prisma.shot.create({
        data: {
          gameId,
          shooterUserId: userId,
          targetUserId: opponent.userId,
          weaponId,
          velocity,
          angleDegrees,
          angleRadians: angleDegrees * Math.PI / 180,
          direction,
          gravity: 0.5,
          wind: 0,
          originX: shooter.positionX,
          originY: shooter.positionY,
          targetX: opponent.positionX,
          targetY: opponent.positionY,
          impactX: impactPoint.x,
          impactY: impactPoint.y,
          distanceToTarget: distanceToOpponent,
          damage,
          isHit,
          mathAnalysisJson: {
            explanation:
              'Parábola calculada con fórmula y = v_y*t - 0.5*g*t²; x = v_x*t; gravedad = 0.5.',
          },
        },
    });
    // Emit real‑time update
    socketServer?.to(gameId).emit('game_update', {
      shooterId: userId,
      trajectory,
      impactPoint,
      isHit,
      damage,
      knockback,
      newTargetPositionX,
    });
    return res.json({
      success: true,
      data: {
        trajectory,
        impactPoint,
        isHit,
        damage,
        knockback,
        newTargetPositionX,
        mathAnalysis:
          'Ecuación de movimiento parabólico: y = v_y*t - 0.5*g*t²; x = v_x*t; con g=0.5.',
      },
    });
  } catch (err) {
    console.error('Shoot error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
