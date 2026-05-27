export enum GameStatus {
  WAITING = "WAITING",
  READY = "READY",
  IN_PROGRESS = "IN_PROGRESS",
  FINISHED = "FINISHED",
  CANCELLED = "CANCELLED"
}

export interface GamePlayerState {
  userId: string;
  username: string;
  characterId: string | null;
  weaponId: string | null;
  positionX: number;
  positionY: number;
  health: number;
  maxHealth: number;
  isReady: boolean;
  isCurrentTurn: boolean;
}

export interface GameState {
  gameId: string;
  status: GameStatus;
  currentTurnUserId: string | null;
  gravity: number;
  wind: number;
  round: number;
  players: GamePlayerState[];
  lastShot?: any; // To be populated later with actual shot logic
}
