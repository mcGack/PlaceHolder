import { useState } from 'react';
import { Challenge, GameMode, ScreenState } from '../types/game';

const challengesData = require('../../challenges.json');
const PLAYERS = ['Ania', 'Bartek', 'Kasia', 'Tomek'];

export const useGame = () => {
  const [screen, setScreen] = useState<ScreenState>('MENU');
  const [mode, setMode] = useState<GameMode>('SFW');
  const [roomCode, setRoomCode] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  
  const [currentChallenge, setCurrentChallenge] = useState<string | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<string>('');

  const startGame = () => {
    setCurrentChallenge(null);
    setScreen('GAME');
  };

  const handleJoinGame = () => {
    setErrorMessage('');
    if (roomCode.length < 4) {
      setErrorMessage('Kod pokoju musi mieć 4 znaki!');
      return;
    }

    if (roomCode === '1111') {
      setMode('SFW'); // Example: Set mode based on room code --- in future change this
      startGame();
    } else {
      setErrorMessage('Nie znaleziono pokoju o podanym kodzie!');
    }
  };

  const drawNext = () => {
    const filtered = (challengesData as Challenge[]).filter((c) => c.mode === mode);
    const randomPlayer = PLAYERS[Math.floor(Math.random() * PLAYERS.length)];
    const randomChallenge = filtered[Math.floor(Math.random() * filtered.length)];

    setCurrentPlayer(randomPlayer);
    setCurrentChallenge(randomChallenge ? randomChallenge.text : 'Brak wyzwań w tym trybie!');
  };

  const navigateTo = (newScreen: ScreenState) => {
    if (newScreen === 'MENU') {
      setRoomCode('');
      setErrorMessage('');
      setMode('SFW'); // Reset mode to default (SFW) when navigating back to menu
    }
    setScreen(newScreen);
  };

  return {
    screen,
    mode,
    roomCode,
    errorMessage,
    currentChallenge,
    currentPlayer,
    setMode,
    setRoomCode,
    setErrorMessage,
    startGame,
    handleJoinGame,
    drawNext,
    navigateTo,
  };
};