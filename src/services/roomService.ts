import { get, onDisconnect, ref, remove, set, update } from 'firebase/database';
import { GameMode, Player, RoomData } from '../types/game';
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
  const roomRef = ref(db, `rooms/${roomCode}`);
  const snapshot = await get(roomRef);

  if (!snapshot.exists()) return;

  const updates: Record<string, any> = {
    [`players/${userId}`]: null,
    [`votes/${userId}`]: null, // Remove the user's vote if they have voted
  };
  await update(roomRef, updates);
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
// Voting
export const startVotingInDb = async (roomCode: string) => {
  const roomRef = ref(db, `rooms/${roomCode}`);
  await update(roomRef, {
    turnStage: 'VOTING',
    votes: null, // Reset votes for the new voting stage
  });
};
// Yes or No vote for the current challenge in the database.
export const castVoteInDb = async (roomCode: string, userId: string, approved: boolean) => {
  const voteRef = ref(db, `rooms/${roomCode}/votes`);
  await update(voteRef, {
    [userId]: approved,
  });
};
// Finishing the turn in the database by updating the active player's score and setting the turn stage to 'SUMMARY'.
export const finishTurnInDb = async (
  roomCode: string,
  activePlayerId: string,
  pointsDelta: number,
  currentPlayers: Player[]
) => {
  const player = currentPlayers.find((p) => p.id === activePlayerId);
  const currentScore = player?.score || 0;
  const newScore = currentScore + pointsDelta;

  const roomRef = ref(db, `rooms/${roomCode}`);
  await update(roomRef, {
    [`players/${activePlayerId}/score`]: newScore,
    turnStage: 'SUMMARY',
  });
};

// Move to the next player's turn in the database by updating the active player ID and resetting the turn stage and challenge-related fields.
export const nextTurnInDb = async (roomCode: string, currentPlayers: Player[], activePlayerId: string) => {
  if (currentPlayers.length === 0) return;

  const currentIndex = currentPlayers.findIndex((p) => p.id === activePlayerId);
  const nextIndex = (currentIndex + 1) % currentPlayers.length;
  const nextPlayerId = currentPlayers[nextIndex].id;

  const roomRef = ref(db, `rooms/${roomCode}`);
  await update(roomRef, {
    activePlayerId: nextPlayerId,
    turnStage: 'DRAWING',
    currentChallenge: null,
    selectedPoints: null,
    votes: null,
  });
};
// Register the player's presence in the room and set up onDisconnect handlers to clean up their presence and vote when they leave unexpectedly.
export const registerPresence = (roomCode: string, userId: string) => {
  const playerRef = ref(db, `rooms/${roomCode}/players/${userId}`);
  const voteRef = ref(db, `rooms/${roomCode}/votes/${userId}`);

  // On disconnect, remove the player's presence and their vote from the database to ensure clean-up when they leave unexpectedly.
  onDisconnect(playerRef).remove();
  onDisconnect(voteRef).remove();
};
// End the game in the database by updating the room's status and turn stage to 'FINISHED'.
export const endGameInDb = async (roomCode: string, currentPlayers: Player[]) => {
  const roomRef = ref(db, `rooms/${roomCode}`);
  await update(roomRef, {
    status: 'FINISHED',
    turnStage: 'FINISHED',
    finalLeaderboard: currentPlayers,
    currentChallenge: null,
    votes: null,
    activePlayerId: null,
  });
};