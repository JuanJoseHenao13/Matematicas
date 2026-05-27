import { z } from "zod";

export const createGameSchema = z.object({
  opponentId: z.string().optional(),
});

export const joinGameSchema = z.object({
  gameId: z.string(),
});

export const readySchema = z.object({
  gameId: z.string(),
});
