import { useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import challengesData from '../../challenges.json';
import {
  castVoteInDb,
  closeRoomInDb,
  endGameInDb,
  finishTurnInDb,
  leaveRoomInDb,
  nextTurnInDb,
  registerPresence,
  setChallengeInDb,
  startVotingInDb,
} from '../services/roomService';
import { Player } from '../types/game';

interface GameScreenProps {
  roomCode: string;
  activePlayerId?: string;
  userId: string;
  players: Player[];
  turnStage?: string;
  currentChallenge?: string | null;
  selectedPoints?: number | null;
  isNsfw?: boolean;
  votes?: Record<string, boolean> | null;
  hostId?: string;
  finalLeaderboard?: Player[] | null;
  onLeaveRoom?: () => void;
}

export const GameScreen = ({
  roomCode,
  activePlayerId,
  userId,
  players,
  turnStage,
  currentChallenge,
  selectedPoints,
  isNsfw = false,
  votes = {},
  hostId,
  finalLeaderboard,
  onLeaveRoom,
}: GameScreenProps) => {
  const safePoints = selectedPoints ?? 0;
  const safeVotes = votes ?? {};
  const currentHostId = players.some((p) => p.id === hostId) ? hostId : players[0]?.id;
  const isHost = userId === currentHostId;
  const isMyTurn = activePlayerId === userId;

  const activePlayer = players.find((p) => p.id === activePlayerId);
  const activePlayerName = activePlayer ? activePlayer.name : 'Gracz';

  
  const displayLeaderboard =
    turnStage === 'FINISHED' && finalLeaderboard && finalLeaderboard.length > 0
      ? finalLeaderboard
      : [...players].sort((a, b) => (b.score || 0) - (a.score || 0));

  const winner = displayLeaderboard[0];

  useEffect(() => {
    if (roomCode && userId) {
      registerPresence(roomCode, userId);
    }
  }, [roomCode, userId]);

  useEffect(() => {
    if (!isHost || players.length === 0 || turnStage === 'FINISHED') return;

    const isActivePlayerStillHere = players.some((p) => p.id === activePlayerId);
    if (!isActivePlayerStillHere) {
      nextTurnInDb(roomCode, players, activePlayerId || '');
      return;
    }

    if (turnStage === 'VOTING') {
      const otherPlayers = players.filter((p) => p.id !== activePlayerId);

      if (otherPlayers.length === 0) {
        finishTurnInDb(roomCode, activePlayerId || '', 0, players);
        return;
      }

      const validVoterIds = Object.keys(safeVotes).filter((voterId) =>
        otherPlayers.some((p) => p.id === voterId)
      );

      if (validVoterIds.length >= otherPlayers.length) {
        const yesVotes = validVoterIds.filter((id) => safeVotes[id] === true).length;
        const noVotes = validVoterIds.filter((id) => safeVotes[id] === false).length;

        const passed = yesVotes >= noVotes;
        const delta = passed ? safePoints : -safePoints;

        finishTurnInDb(roomCode, activePlayerId || '', delta, players);
      }
    }
  }, [safeVotes, turnStage, isHost, players, activePlayerId, safePoints, roomCode]);

  useEffect(() => {
    if (turnStage === 'SUMMARY' && isHost) {
      const timer = setTimeout(() => {
        nextTurnInDb(roomCode, players, activePlayerId || '');
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [turnStage, isHost, roomCode, players, activePlayerId]);

  const handleSelectPoints = async (points: number) => {
    if (!Array.isArray(challengesData) || challengesData.length === 0) return;

    const filtered = challengesData.filter((item: any) => {
      const matchesPoints = Number(item.points) === Number(points);
      const itemIsNsfw = item.mode?.toUpperCase() === 'NSFW';
      return matchesPoints && (isNsfw ? itemIsNsfw : !itemIsNsfw);
    });

    if (filtered.length === 0) {
      alert(`Brak kart za ${points} pkt! Wybierz inną stawkę.`);
      return;
    }

    const randomItem = filtered[Math.floor(Math.random() * filtered.length)] as any;
    const text = typeof randomItem === 'string' ? randomItem : randomItem.text || '';
    await setChallengeInDb(roomCode, text, points);
  };

  const handleForfeit = async () => {
    await finishTurnInDb(roomCode, activePlayerId || '', -safePoints, players);
  };

  const handleForceFinishVoting = async () => {
    if (!isHost) return;

    const otherPlayers = players.filter((p) => p.id !== activePlayerId);
    const validVoterIds = Object.keys(safeVotes).filter((voterId) =>
      otherPlayers.some((p) => p.id === voterId)
    );

    const yesVotes = validVoterIds.filter((id) => safeVotes[id] === true).length;
    const noVotes = validVoterIds.filter((id) => safeVotes[id] === false).length;

    const passed = yesVotes >= noVotes;
    const delta = passed ? safePoints : -safePoints;

    await finishTurnInDb(roomCode, activePlayerId || '', delta, players);
  };


  const handleEndGame = async () => {
    await endGameInDb(roomCode, players);
  };

  
  const handleExitGame = async () => {
    if (isHost) {
      await closeRoomInDb(roomCode); 
    } else {
      await leaveRoomInDb(roomCode, userId);
    }
    if (onLeaveRoom) onLeaveRoom();
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.roomBadge}>POKÓJ: {roomCode}</Text>
        {isHost && turnStage !== 'FINISHED' && (
          <TouchableOpacity style={styles.endGameHeaderBtn} onPress={handleEndGame}>
            <Text style={styles.endGameHeaderBtnText}>ZAKOŃCZ GRĘ</Text>
          </TouchableOpacity>
        )}
      </View>

      
      {turnStage === 'FINISHED' ? (
        <View style={styles.content}>
          <Text style={styles.winnerTitle}>👑 ZWYCIĘZCA 👑</Text>
          <Text style={styles.winnerName}>{winner?.name || 'Brak'} ({winner?.score || 0} PKT)</Text>

          <Text style={styles.turnTitle}>WYNIKI KOŃCOWE (ZAMROŻONE)</Text>
          <View style={styles.leaderboard}>
            {displayLeaderboard.map((p, index) => (
              <View key={p.id} style={styles.leaderboardRow}>
                <Text style={styles.rankText}>
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`} {p.name}
                </Text>
                <Text style={styles.scoreText}>{p.score || 0} PKT</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity style={styles.exitBtn} onPress={handleExitGame}>
            <Text style={styles.btnText}>WRÓĆ DO MENU GŁÓWNEGO</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          
          {turnStage !== 'PERFORMING' && turnStage !== 'VOTING' && turnStage !== 'SUMMARY' && (
            <View style={styles.content}>
              <Text style={styles.turnTitle}>{isMyTurn ? 'TWOJA TURA!' : `TURA GRACZA: ${activePlayerName}`}</Text>
              {isMyTurn ? (
                <View style={styles.buttonGroup}>
                  <TouchableOpacity style={styles.pointBtn} onPress={() => handleSelectPoints(1)}>
                    <Text style={styles.pointText}>1 PKT</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.pointBtn} onPress={() => handleSelectPoints(3)}>
                    <Text style={styles.pointText}>3 PKT</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.pointBtn} onPress={() => handleSelectPoints(5)}>
                    <Text style={styles.pointText}>5 PKT</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <Text style={styles.waitingText}>{activePlayerName} wybiera stawkę punktową...</Text>
              )}
            </View>
          )}

          
          {turnStage === 'PERFORMING' && (
            <View style={styles.card}>
              <Text style={styles.cardHeader}>ZADANIE DLA {activePlayerName} ({safePoints} PKT):</Text>
              <Text style={styles.cardText}>{currentChallenge}</Text>

              {isMyTurn ? (
                <View style={styles.actionRow}>
                  <TouchableOpacity style={[styles.actionBtn, styles.successBtn]} onPress={() => startVotingInDb(roomCode)}>
                    <Text style={styles.btnText}>WYKONANE!</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.actionBtn, styles.dangerBtn]} onPress={handleForfeit}>
                    <Text style={styles.btnText}>PODDAJĘ SIĘ (-{safePoints} PKT)</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <Text style={styles.waitingText}>{activePlayerName} wykonuje zadanie...</Text>
              )}
            </View>
          )}

          
          {turnStage === 'VOTING' && (
            <View style={styles.content}>
              <Text style={styles.turnTitle}>GŁOSOWANIE!</Text>
              <Text style={styles.subtitle}>Czy {activePlayerName} poprawnie wykonał(a) zadanie?</Text>

              {!isMyTurn ? (
                <View style={styles.actionRow}>
                  <TouchableOpacity 
                    style={[styles.actionBtn, styles.successBtn, safeVotes[userId] === true && styles.selectedBtn]} 
                    onPress={() => castVoteInDb(roomCode, userId, true)}
                  >
                    <Text style={styles.btnText}>TAK (+{safePoints} PKT)</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.actionBtn, styles.dangerBtn, safeVotes[userId] === false && styles.selectedBtn]} 
                    onPress={() => castVoteInDb(roomCode, userId, false)}
                  >
                    <Text style={styles.btnText}>NIE (-{safePoints} PKT)</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <Text style={styles.waitingText}>Gracze głosują nad Twoim wykonaniem...</Text>
              )}

              {isHost && (
                <TouchableOpacity 
                  style={[styles.actionBtn, { backgroundColor: '#444', marginTop: 25 }]} 
                  onPress={handleForceFinishVoting}
                >
                  <Text style={styles.btnText}>ZAKOŃCZ GŁOSOWANIE TERAZ (HOST)</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

         
          {turnStage === 'SUMMARY' && (
            <View style={styles.content}>
              <Text style={styles.turnTitle}>TABELA WYNIKÓW</Text>
              <View style={styles.leaderboard}>
                {displayLeaderboard.map((p, index) => (
                  <View key={p.id} style={styles.leaderboardRow}>
                    <Text style={styles.rankText}>#{index + 1} {p.name}</Text>
                    <Text style={styles.scoreText}>{p.score || 0} PKT</Text>
                  </View>
                ))}
              </View>
              <Text style={styles.nextTurnNotice}>Następna tura za chwilę...</Text>
            </View>
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' },
  content: { width: '100%', alignItems: 'center' },
  headerRow: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  roomBadge: { color: '#666', fontSize: 14 },
  endGameHeaderBtn: { backgroundColor: '#8B0000', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6 },
  endGameHeaderBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 12 },
  turnTitle: { fontSize: 24, fontWeight: 'bold', color: '#FFD700', marginBottom: 15, textAlign: 'center' },
  subtitle: { color: '#FFF', fontSize: 16, marginBottom: 20, textAlign: 'center' },
  buttonGroup: { width: '100%', gap: 12 },
  pointBtn: { backgroundColor: '#1E1E1E', padding: 18, borderRadius: 12, borderWidth: 1, borderColor: '#FFD700', alignItems: 'center' },
  pointText: { color: '#FFD700', fontSize: 20, fontWeight: 'bold' },
  card: { backgroundColor: '#1E1E1E', padding: 25, borderRadius: 16, borderLeftWidth: 5, borderLeftColor: '#FFD700', width: '100%', alignItems: 'center' },
  cardHeader: { color: '#FFD700', fontWeight: 'bold', marginBottom: 15, fontSize: 14 },
  cardText: { color: '#FFF', fontSize: 20, textAlign: 'center', marginBottom: 25 },
  actionRow: { flexDirection: 'column', gap: 10, width: '100%' },
  actionBtn: { padding: 16, borderRadius: 10, alignItems: 'center', width: '100%' },
  successBtn: { backgroundColor: '#2E7D32' },
  dangerBtn: { backgroundColor: '#C62828' },
  selectedBtn: { borderWidth: 3, borderColor: '#FFF' },
  btnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  waitingText: { color: '#AAA', fontSize: 16, fontStyle: 'italic', marginTop: 10, textAlign: 'center' },
  leaderboard: { width: '100%', backgroundColor: '#1E1E1E', borderRadius: 12, padding: 15, gap: 10 },
  leaderboardRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#333' },
  rankText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  scoreText: { color: '#FFD700', fontSize: 18, fontWeight: 'bold' },
  nextTurnNotice: { color: '#888', marginTop: 20, fontStyle: 'italic' },
  winnerTitle: { fontSize: 22, fontWeight: 'bold', color: '#FFD700', marginBottom: 5 },
  winnerName: { fontSize: 28, fontWeight: 'bold', color: '#FFF', marginBottom: 25 },
  exitBtn: { backgroundColor: '#333', padding: 16, borderRadius: 10, marginTop: 25, width: '100%', alignItems: 'center' },
});