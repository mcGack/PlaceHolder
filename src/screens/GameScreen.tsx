import { useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import challengesData from '../../challenges.json';
import {
  castVoteInDb,
  finishTurnInDb,
  nextTurnInDb,
  setChallengeInDb,
  startVotingInDb
} from '../services/roomService';
import { Player } from '../types/game';

interface GameScreenProps {
  roomCode: string;
  activePlayerId?: string;
  userId: string;
  players: Player[];
  turnStage?: string;
  currentChallenge?: string;
  selectedPoints?: number;
  isNsfw?: boolean;
  votes?: Record<string, boolean>;
  hostId?: string;
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
}: GameScreenProps) => {
  const safePoints = selectedPoints ?? 0;
  const isMyTurn = activePlayerId === userId;
  const isHost = userId === hostId;
  const activePlayer = players.find((p) => p.id === activePlayerId);
  const activePlayerName = activePlayer ? activePlayer.name : 'Gracz';

 
  useEffect(() => {
    if (turnStage === 'SUMMARY' && isHost) {
      const timer = setTimeout(() => {
        nextTurnInDb(roomCode, players, activePlayerId || '');
      }, 3000); //

      return () => clearTimeout(timer);
    }
  }, [turnStage, isHost]);

  useEffect(() => {
    if (turnStage === 'VOTING' && isHost) {
      const voterIds = Object.keys(votes);
      const otherPlayersCount = players.filter((p) => p.id !== activePlayerId).length;

      
      if (voterIds.length >= otherPlayersCount && otherPlayersCount > 0) {
        const yesVotes = Object.values(votes).filter((v) => v === true).length;
        const noVotes = Object.values(votes).filter((v) => v === false).length;

        
        const passed = yesVotes >= noVotes;
        const delta = passed ? safePoints : -safePoints;

        finishTurnInDb(roomCode, activePlayerId || '', delta, players);
      }
    }
  }, [votes, turnStage, isHost]);

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

  return (
    <View style={styles.container}>
      <Text style={styles.roomBadge}>POKÓJ: {roomCode}</Text>

      
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
          <Text style={styles.cardHeader}>ZADANIE DLA {activePlayerName} ({selectedPoints} PKT):</Text>
          <Text style={styles.cardText}>{currentChallenge}</Text>

          {isMyTurn ? (
            <View style={styles.actionRow}>
              <TouchableOpacity style={[styles.actionBtn, styles.successBtn]} onPress={() => startVotingInDb(roomCode)}>
                <Text style={styles.btnText}>WYKONANE!</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, styles.dangerBtn]} onPress={handleForfeit}>
                <Text style={styles.btnText}>PODDAJĘ SIĘ (-{selectedPoints} PKT)</Text>
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
                style={[styles.actionBtn, styles.successBtn, votes[userId] === true && styles.selectedBtn]} 
                onPress={() => castVoteInDb(roomCode, userId, true)}
              >
                <Text style={styles.btnText}>TAK (+{selectedPoints} PKT)</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.actionBtn, styles.dangerBtn, votes[userId] === false && styles.selectedBtn]} 
                onPress={() => castVoteInDb(roomCode, userId, false)}
              >
                <Text style={styles.btnText}>NIE (-{selectedPoints} PKT)</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <Text style={styles.waitingText}>Gracze głosują nad Twoim wykonaniem...</Text>
          )}
        </View>
      )}

      
      {turnStage === 'SUMMARY' && (
        <View style={styles.content}>
          <Text style={styles.turnTitle}>TABELA WYNIKÓW</Text>
          <View style={styles.leaderboard}>
            {players
              .sort((a, b) => (b.score || 0) - (a.score || 0))
              .map((p, index) => (
                <View key={p.id} style={styles.leaderboardRow}>
                  <Text style={styles.rankText}>#{index + 1} {p.name}</Text>
                  <Text style={styles.scoreText}>{p.score || 0} PKT</Text>
                </View>
              ))}
          </View>
          <Text style={styles.nextTurnNotice}>Nastepna tura za chwilę...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' },
  content: { width: '100%', alignItems: 'center' },
  roomBadge: { color: '#666', fontSize: 14, marginBottom: 15 },
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
});