import { onValue, ref } from 'firebase/database';
import { useEffect, useState } from 'react';
import { db } from '../services/firebase';
import { closeRoomInDb, createRoomInDb, joinRoomInDb, leaveRoomInDb, startGameInDb } from '../services/roomService';
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
    if (!roomCode || screen === 'MENU' || screen === 'JOIN' || screen === 'CREATE_SETTINGS') {
      return;
    }

    const roomRef = ref(db, `rooms/${roomCode}`);
    const unsubscribe = onValue(roomRef, (snapshot) => {
      const data: RoomData | null = snapshot.val();
    
      if (!data) {
        setErrorMessage('Pokój został zamknięty.');
        setScreen('MENU');
        setRoomCode('');
        return;
      }

      setRoomData(data);
      if (data.players) {
        setPlayersList(Object.values(data.players));
      
      }
      // If the game has started, navigate to the GAME screen
      if (data.status === 'IN_GAME' && screen !== 'GAME') {
      setScreen('GAME');
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

  const navigateTo = (targetScreen: ScreenState) => {
    setErrorMessage('');
    if (targetScreen === 'MENU' || targetScreen === 'JOIN' || targetScreen === 'CREATE_SETTINGS') {
      setRoomCode('');
      setRoomData(null);
    }
    setScreen(targetScreen);
  };


  const handleLeaveRoom = async () => {
    console.log('Rozpoczynam opuszczanie pokoju...', { roomCode, userId });
    try {
      if (roomCode && userId) {
        const isHost = roomData?.hostId === userId;
        if (isHost) {
          await closeRoomInDb(roomCode);
        } else {
          await leaveRoomInDb(roomCode, userId);
        }
      }
    } catch (err) {
    console.error('Błąd usuwania wpisu z bazy:', err);
  } finally {
    // Reset state after leaving the room
    setRoomCode('');
    setRoomData(null);
    setPlayersList([]);
    setErrorMessage('');
    setScreen('MENU');
    }
  };


  const handleStartGame = async () => {
    if (!roomCode) {
      alert('Błąd: Brak kodu pokoju!');
      return;
    }

  // Forcefully determine the first player to start the game (randomly selected)
    const currentPlayers = playersList.length > 0 
      ? playersList 
      : roomData?.players ? Object.values(roomData.players) : [];

    if (currentPlayers.length === 0) {
      alert('Błąd: Brak graczy w pokoju!');
      return;
    }

    const randomIndex = Math.floor(Math.random() * currentPlayers.length);
    const firstPlayerId = currentPlayers[randomIndex].id;

    try {
      await startGameInDb(roomCode, firstPlayerId);
      setScreen('GAME'); // Forcefully navigate to the game screen for the host
    } catch (err: any) {
      alert('Błąd Firebase: ' + err.message);
    }
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
    handleLeaveRoom,
  };
};