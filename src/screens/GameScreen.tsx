import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import challengesData from '../../challenges.json';

interface GameScreenProps {
  roomCode: string;
  activePlayerId?: string;
  userId: string;
}

export const GameScreen = ({ roomCode, activePlayerId, userId }: GameScreenProps) => {
  const [currentChallenge, setCurrentChallenge] = useState<any>(null);
  const isMyTurn = activePlayerId === userId;

  const drawChallenge = (type: 'truth' | 'dare') => {
    // Filtrowanie wyzwań z pliku JSON
    const list = challengesData.filter((item: any) => item.type === type);
    if (list.length > 0) {
      const random = list[Math.floor(Math.random() * list.length)];
      setCurrentChallenge(random);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.roomBadge}>POKÓJ: {roomCode}</Text>
      
      <Text style={styles.turnTitle}>
        {isMyTurn ? 'TWOJA TURA!' : 'TURA INNEGO GRACZA'}
      </Text>

      {!currentChallenge ? (
        <View style={styles.choiceContainer}>
          <Text style={styles.subtitle}>Wybierz rodzaj zadania:</Text>
          <TouchableOpacity 
            style={[styles.btn, styles.truthBtn]} 
            onPress={() => drawChallenge('truth')}
          >
            <Text style={styles.btnText}>PRAWDA</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.btn, styles.dareBtn]} 
            onPress={() => drawChallenge('dare')}
          >
            <Text style={styles.btnText}>WYZWANIE</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.card}>
          <Text style={styles.cardType}>
            {currentChallenge.type === 'truth' ? 'PRAWDA' : 'WYZWANIE'} ({currentChallenge.points || 1} PKT)
          </Text>
          <Text style={styles.cardText}>{currentChallenge.text || currentChallenge.content}</Text>
          
          <TouchableOpacity 
            style={styles.nextBtn} 
            onPress={() => setCurrentChallenge(null)}
          >
            <Text style={styles.nextBtnText}>NASTĘPNE ZADANIE</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' },
  roomBadge: { color: '#888', fontSize: 14, marginBottom: 10 },
  turnTitle: { fontSize: 26, fontWeight: 'bold', color: '#FFD700', marginBottom: 30 },
  subtitle: { color: '#FFF', fontSize: 18, marginBottom: 20 },
  choiceContainer: { width: '100%', alignItems: 'center' },
  btn: { width: '100%', padding: 20, borderRadius: 12, alignItems: 'center', marginBottom: 15 },
  truthBtn: { backgroundColor: '#2196F3' },
  dareBtn: { backgroundColor: '#E91E63' },
  btnText: { color: '#FFF', fontWeight: 'bold', fontSize: 18 },
  card: { backgroundColor: '#1E1E1E', padding: 25, borderRadius: 16, borderLeftWidth: 5, borderLeftColor: '#FFD700', width: '100%', alignItems: 'center' },
  cardType: { color: '#FFD700', fontWeight: 'bold', marginBottom: 15 },
  cardText: { color: '#FFF', fontSize: 20, textAlign: 'center', marginBottom: 25 },
  nextBtn: { backgroundColor: '#333', padding: 12, borderRadius: 8 },
  nextBtnText: { color: '#FFF', fontWeight: 'bold' },
});