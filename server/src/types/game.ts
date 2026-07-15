export interface Player {
  id: string;
  name: string;
  avatar: string;
  color: string;
  score: number;
  roundScore: number;
  isReady: boolean;
  isHost: boolean;
  isDisconnected: boolean;
}

export type GamePhase = 'LOBBY' | 'RANKING' | 'GUESSING' | 'REVEAL' | 'LEADERBOARD' | 'GAME_OVER';

export interface Prompt {
  text: string;
  category: string;
}

export interface RoomState {
  roomId: string;
  phase: GamePhase;
  players: Player[];
  hostId: string;
  currentRound: number;
  maxRounds: number;
  rankerId: string;
  prompt?: Prompt;
  rankingList?: string[]; // Ordered list of player IDs
  choices?: string[]; // Multiple choices for guessers
  guesses: Record<string, string>; // Player ID -> guessed prompt
  roundWinnerId?: string;
  timerSeconds?: number;
}
