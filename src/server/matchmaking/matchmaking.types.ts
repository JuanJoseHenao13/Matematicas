export enum MatchmakingStatus {
  QUEUED = "QUEUED",
  MATCHED = "MATCHED",
  CANCELLED = "CANCELLED",
  EXPIRED = "EXPIRED"
}

export interface MatchmakingResult {
  status: MatchmakingStatus;
  ticketId?: string;
  gameId?: string;
}
