import { get, ref, set } from 'firebase/database';
import { GameMode, RoomData } from '../types/game';
import { db } from './firebase';

export const generateRoomCode = (): string => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return code;
};

// Host creates a new room in the database with the provided host name and game mode. Returns the room code and host ID.
export const createRoomInDb = async (hostName: string, mode: GameMode) => {
  try {
    const roomCode = generateRoomCode();
    const hostId = `player_${Date.now()}`;

    const initialRoomData: RoomData = {
      hostId,
      status: 'LOBBY',
      mode,
      players: {
        [hostId]: {
          id: hostId,
          name: hostName,
          score: 0,
        },
      },
    };

    console.log('Próba zapisu pokoju do bazy...', roomCode);
    await set(ref(db, `rooms/${roomCode}`), initialRoomData);
    console.log('Zapis zakończony sukcesem!');

    return { roomCode, userId: hostId };
  } catch (error) {
    console.error('SZCZEGÓŁY BŁĘDU FIREBASE:', error);
    throw error;
  }
};    

// Join an existing room in the database with the provided room code and player name. Returns the player ID.
export const joinRoomInDb = async (roomCode: string, playerName: string) => {
  const roomRef = ref(db, `rooms/${roomCode}`);
  const snapshot = await get(roomRef);

  if (!snapshot.exists()) {
    throw new Error('Pokój o podanym kodzie nie istnieje!');
  }

  const userId = `player_${Date.now()}`;
  const playerRef = ref(db, `rooms/${roomCode}/players/${userId}`);

  await set(playerRef, {
    id: userId,
    name: playerName,
    score: 0,
  });

  return { userId };
};