"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const client_1 = require("@prisma/client");
const index_1 = require("../index");
const prisma = new client_1.PrismaClient();
exports.router = (0, express_1.Router)();
function calculateTrajectory(params) {
    const { initialVelocity, angleDegrees, direction, gravity, originX, originY } = params;
    const angleRad = (angleDegrees * Math.PI) / 180;
    const vx = initialVelocity * Math.cos(angleRad) * direction;
    const vy = initialVelocity * Math.sin(angleRad);
    const points = [];
    const step = 0.5; // seconds per iteration
    for (let t = 0; t < 10; t += step) {
        const x = originX + vx * t;
        const y = originY - (vy * t - 0.5 * gravity * t * t);
        points.push({ x, y });
        if (y > originY)
            break; // hits ground
    }
    return points;
}
/**
 * POST /shoot
 * Body: { gameId, velocity, angleDegrees, direction, weaponId }
 * Returns trajectory data, impact point, damage, knockback, newTargetPositionX and math analysis.
 */
exports.router.post('/shoot', auth_1.authMiddleware, async (req, res) => {
    var _a, _b, _c;
    const { gameId, velocity, angleDegrees, direction, weaponId } = req.body;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
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
        const distanceToOpponent = Math.sqrt(Math.pow(impactPoint.x - opponent.positionX, 2) + Math.pow(impactPoint.y - opponent.positionY, 2));
        const isHit = distanceToOpponent < 55;
        let damage = 0;
        if (isHit) {
            const hitLocation = (_b = req.body.hitLocation) !== null && _b !== void 0 ? _b : 'body';
            if (hitLocation === 'head') {
                damage = Math.floor(Math.random() * (30 - 22 + 1)) + 22;
            }
            else {
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
            newTargetPositionX = (_c = updatedOpp === null || updatedOpp === void 0 ? void 0 : updatedOpp.positionX) !== null && _c !== void 0 ? _c : opponent.positionX;
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
                    explanation: 'Parábola calculada con fórmula y = v_y*t - 0.5*g*t²; x = v_x*t; gravedad = 0.5.',
                },
            },
        });
        // Emit real‑time update
        index_1.socketServer === null || index_1.socketServer === void 0 ? void 0 : index_1.socketServer.to(gameId).emit('game_update', {
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
                mathAnalysis: 'Ecuación de movimiento parabólico: y = v_y*t - 0.5*g*t²; x = v_x*t; con g=0.5.',
            },
        });
    }
    catch (err) {
        console.error('Shoot error:', err);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
});
exports.default = exports.router;
