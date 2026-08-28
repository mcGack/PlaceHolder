export type ScreenState = 'MENU' | 'CREATE_SETTINGS' | 'JOIN' | 'GAME';
export type GameMode = 'SFW' | 'NSFW';

export interface Challenge {
  id: number;
  text: string;
  mode: GameMode;
}