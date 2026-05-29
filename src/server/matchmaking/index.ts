import { Router } from 'express';

export const router = Router();

// In‑memory waiting list and matches (persist across requests while server runs)
const waitingPlayers: { id: string }[] = [];
const matches: Record<string, { players: string[] }> = {};

router.post('/find', (req, res) => {
  // Expect a player identifier
  const playerId = req.body.id ?? Math.random().toString(36).substring(2, 10);

  // Check if player is already in a match
  for (const gameId in matches) {
    if (matches[gameId].players.includes(playerId)) {
      return res.json({
        success: true,
        data: {
          gameId,
          players: matches[gameId].players,
          status: 'MATCHED',
        },
      });
    }
  }

  // Add player to waiting list if not already there
  const isWaiting = waitingPlayers.find(p => p.id === playerId);
  if (!isWaiting) {
    waitingPlayers.push({ id: playerId });
  }

  // If we have at least two players, create a match
  if (waitingPlayers.length >= 2) {
    const [p1, p2] = waitingPlayers.splice(0, 2);
    const gameId = `${p1.id}-${p2.id}`;
    matches[gameId] = { players: [p1.id, p2.id] };

    return res.json({
      success: true,
      data: {
        gameId,
        players: [p1.id, p2.id],
        status: 'MATCHED',
      },
    });
  }

  // Otherwise, tell the client we are waiting for an opponent
  return res.json({ success: true, data: { ticketId: playerId, status: 'QUEUED' } });
});

