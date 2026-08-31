import { onValue, ref } from 'firebase/database';
import { useEffect, useState } from 'react';
import { db } from '../services/firebase';
import { createRoomInDb, joinRoomInDb } from '../services/roomService';
import { GameMode, Player, RoomData, ScreenState } from '../types/game';
export const useGame = () => {
  const [screen, setScreen] = useState<ScreenState>('MENU');
  const [mode, setMode] = useState<GameMode>('SFW');
  const [roomCode, setRoomCode] = useState<string>('');
  const [playerName, setPlayerName] = useState<string>('');
  const [userId, setUserId] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const [playersList, setPlayersList] = useState<Player[]>([]);
  const [roomData, setRoomData] = useState<RoomData | null>(null);

  // Live updates from Firebase for the current room
  useEffect(() => {
    if (!roomCode || screen === 'MENU') return;

    const roomRef = ref(db, `rooms/${roomCode}`);
    const unsubscribe = onValue(roomRef, (snapshot) => {
      const data: RoomData = snapshot.val();
      if (data) {
        setRoomData(data);
        if (data.players) {
          setPlayersList(Object.values(data.players));
        }
      }
    });

    return () => unsubscribe();
  }, [roomCode, screen]);

  // New room creation action (Host)
  const handleCreateGame = async () => {
    console.log('1. Kliknięto STWÓRZ POKÓJ. Imię:', playerName);
    if (!playerName.trim()) {
      setErrorMessage('Wpisz swoje imię!');
      return;
    }
    setErrorMessage('');
    try {
      console.log('3. Wysyłam zapytanie do Firebase...');
      const { roomCode: newCode, userId: newUserId } = await createRoomInDb(playerName, mode);
      console.log('4. Sukces! Kod:', newCode);
      setRoomCode(newCode);
      setUserId(newUserId);
      setScreen('LOBBY');
    } catch (err: any) {
      setErrorMessage(err.message || 'Błąd podczas tworzenia pokoju.');
    }
  };

  // Joining an existing room action (Player)
  const handleJoinGame = async () => {
    if (!playerName.trim()) {
      setErrorMessage('Wpisz swoje imię!');
      return;
    }
    if (roomCode.length < 4) {
      setErrorMessage('Kod pokoju musi mieć 4 znaki!');
      return;
    }

    setErrorMessage('');
    try {
      const { userId: newUserId } = await joinRoomInDb(roomCode, playerName);
      setUserId(newUserId);
      setScreen('LOBBY');
    } catch (err: any) {
      setErrorMessage(err.message || 'Nie udalo się połączyć.');
    }
  };

  const navigateTo = (newScreen: ScreenState) => {
    if (newScreen === 'MENU') {
      setRoomCode('');
      setErrorMessage('');
      setPlayersList([]);
    }
    setScreen(newScreen);
  };

  return {
    screen,
    mode,
    roomCode,
    playerName,
    userId,
    errorMessage,
    playersList,
    roomData,
    setMode,
    setRoomCode,
    setPlayerName,
    handleCreateGame,
    handleJoinGame,
    navigateTo,
  };
};