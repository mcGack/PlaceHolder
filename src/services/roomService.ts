import { get, onDisconnect, ref, remove, set, update } from 'firebase/database';
import { GameMode, RoomData } from '../types/game';
import { db } from './firebase';



// Generates a random 4-character room code consisting of uppercase letters and digits.
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
  const roomCode = generateRoomCode();
  const hostId = `player_${Date.now()}`;
  const roomRef = ref(db, `rooms/${roomCode}`);

  const initialRoomData: RoomData = {
    hostId,
    status: 'LOBBY',
    mode,
    isNsfw: mode === 'NSFW',
    players: {
      [hostId]: { id: hostId, name: hostName, score: 0 },
    },
    createdAt: Date.now(),
  };

  await set(roomRef, initialRoomData);

  // On disconnect from host, remove the room from the database to clean up.
  onDisconnect(roomRef).remove();

  return { roomCode, userId: hostId };
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
// Leave a room in the database by removing the player from the room's players list.
export const leaveRoomInDb = async (roomCode: string, userId: string) => {
  if (!roomCode || !userId) return;
  console.log(`Usuwanie gracza ${userId} z pokoju ${roomCode} w Firebase...`);
  const playerRef = ref(db, `rooms/${roomCode}/players/${userId}`);
  await remove(playerRef);
  console.log('Gracz został usunięty z pokoju w Firebase.');
};
// Host closes the room in the database by removing the entire room entry.
export const closeRoomInDb = async (roomCode: string) => {
  if (!roomCode) return;
  console.log('Usuwanie całego pokoju z Firebase:', roomCode);
  const roomRef = ref(db, `rooms/${roomCode}`);
  await remove(roomRef);
  console.log('Pokój został usunięty z Firebase:');
};

// Start the game in the database by updating the room's status, turn stage, and active player ID.
export const startGameInDb = async (roomCode: string, firstPlayerId: string) => {
  if (!roomCode) return;
  const roomRef = ref(db, `rooms/${roomCode}`);

  await update(roomRef, {
    status: 'IN_GAME',
    turnStage: 'DRAWING',
    activePlayerId: firstPlayerId,
    votes: null,
  });
};
// Set the challenge for the current turn in the database.
export const setChallengeInDb = async (
  roomCode: string, 
  challengeText: string, 
  points: number
) => {
  if (!roomCode) return;
  const roomRef = ref(db, `rooms/${roomCode}`);

  await update(roomRef, {
    turnStage: 'PERFORMING',
    currentChallenge: challengeText,
    selectedPoints: points,
  });
};