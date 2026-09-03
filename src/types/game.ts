export type ScreenState = 'MENU' | 'CREATE_SETTINGS' | 'JOIN' | 'LOBBY'| 'GAME';
export type GameMode = 'SFW' | 'NSFW';

export interface Challenge {
  id: number;
  text: string;
  mode: GameMode;
}
export interface Player {
  id: string;
  name: string;
  score: number;
}

export interface RoomData {
  hostId: string;
  status: 'LOBBY' | 'IN_GAME';
  mode: GameMode;
  players: Record<string, Player>;
  createdAt: number;
  activePlayerId?: string;
  turnStage?: 'DRAWING' | 'PERFORMING' | 'VOTING' | 'SUMMARY';
  currentChallenge?: string | null;
  selectedPoints?: number | null;
  isNsfw?: boolean;
  votes?: Record<string, boolean> | null;
}