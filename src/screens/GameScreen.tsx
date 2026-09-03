import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import challengesData from '../../challenges.json';
import { setChallengeInDb } from '../services/roomService';
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
}: GameScreenProps) => {
  const isMyTurn = activePlayerId === userId;
  const activePlayer = players.find((p) => p.id === activePlayerId);
  const activePlayerName = activePlayer ? activePlayer.name : 'Gracz';

  
const handleSelectPoints = async (points: number) => {
  if (!Array.isArray(challengesData) || challengesData.length === 0) {
    alert('Brak wyzwań w pliku challenges.json');
    return;
  }

  const isRoomNsfw = Boolean(isNsfw);

  const filtered = challengesData.filter((item: any) => {
    
    const matchesPoints = Number(item.points) === Number(points);

    
    const itemIsNsfw = item.mode?.toUpperCase() === 'NSFW';

    
    const matchesMode = isRoomNsfw ? itemIsNsfw : !itemIsNsfw;

    return matchesPoints && matchesMode;
  });

  if (filtered.length === 0) {
    alert(`Brak wyzwań za ${points} pkt dla trybu ${isRoomNsfw ? 'NSFW' : 'SFW'}. Wybierz inną stawkę!`);
    return;
  }

  const randomItem = filtered[Math.floor(Math.random() * filtered.length)] as any;
  const text = typeof randomItem === 'string' ? randomItem : randomItem.text || randomItem.content || '';

  await setChallengeInDb(roomCode, text, points);
};

  return (
    <View style={styles.container}>
      <Text style={styles.roomBadge}>POKÓJ: {roomCode}</Text>

      {isMyTurn ? (
        <View style={styles.content}>
          <Text style={styles.turnTitle}>TWOJA TURA!</Text>

          {turnStage !== 'PERFORMING' ? (
            <View style={styles.section}>
              <Text style={styles.subtitle}>Wybierz stawkę punktową:</Text>
              <View style={styles.buttonGroup}>
                <TouchableOpacity style={styles.pointBtn} onPress={() => handleSelectPoints(1)}>
                  <Text style={styles.pointText}>1 PKT</Text>
                  <Text style={styles.pointSub}>Łatwe</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.pointBtn} onPress={() => handleSelectPoints(3)}>
                  <Text style={styles.pointText}>3 PKT</Text>
                  <Text style={styles.pointSub}>Średnie</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.pointBtn} onPress={() => handleSelectPoints(5)}>
                  <Text style={styles.pointText}>5 PKT</Text>
                  <Text style={styles.pointSub}>Trudne</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.card}>
              <Text style={styles.cardHeader}>TWOJE ZADANIE ({selectedPoints} PKT):</Text>
              <Text style={styles.cardText}>{currentChallenge}</Text>
            </View>
          )}
        </View>
      ) : (
       
        <View style={styles.content}>
          <Text style={styles.turnTitle}>TURA GRACZA: {activePlayerName.toUpperCase()}</Text>

          {turnStage !== 'PERFORMING' ? (
            <View style={styles.waitingBox}>
              <Text style={styles.waitingText}>
                {activePlayerName} wybiera poziom trudności...
              </Text>
            </View>
          ) : (
            <View style={styles.card}>
              <Text style={styles.cardHeader}>ZADANIE DLA {activePlayerName.toUpperCase()} ({selectedPoints} PKT):</Text>
              <Text style={styles.cardText}>{currentChallenge}</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' },
  content: { width: '100%', alignItems: 'center' },
  roomBadge: { color: '#666', fontSize: 14, marginBottom: 15 },
  turnTitle: { fontSize: 24, fontWeight: 'bold', color: '#FFD700', marginBottom: 25, textAlign: 'center' },
  subtitle: { color: '#FFF', fontSize: 18, marginBottom: 20, textAlign: 'center' },
  section: { width: '100%', alignItems: 'center' },
  buttonGroup: { width: '100%', gap: 12 },
  pointBtn: { backgroundColor: '#1E1E1E', padding: 18, borderRadius: 12, borderWidth: 1, borderColor: '#FFD700', alignItems: 'center' },
  pointText: { color: '#FFD700', fontSize: 22, fontWeight: 'bold' },
  pointSub: { color: '#AAA', fontSize: 12, marginTop: 2 },
  waitingBox: { padding: 30, backgroundColor: '#1E1E1E', borderRadius: 12, borderWidth: 1, borderColor: '#333' },
  waitingText: { color: '#AAA', fontSize: 18, fontStyle: 'italic', textAlign: 'center' },
  card: { backgroundColor: '#1E1E1E', padding: 25, borderRadius: 16, borderLeftWidth: 5, borderLeftColor: '#FFD700', width: '100%', alignItems: 'center' },
  cardHeader: { color: '#FFD700', fontWeight: 'bold', marginBottom: 15, fontSize: 14 },
  cardText: { color: '#FFF', fontSize: 20, textAlign: 'center' },
});