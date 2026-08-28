import { GameMode, ScreenState } from '@/types/game';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface GameScreenProps {
  mode: GameMode;
  currentPlayer: string;
  currentChallenge: string | null;
  onDrawNext: () => void;
  onExit: (screen: ScreenState) => void;
}

export const GameScreen = ({ mode, currentPlayer, currentChallenge, onDrawNext, onExit }: GameScreenProps) => (
  <View style={styles.gameContainer}>
    <View style={styles.topInfo}>
      <Text style={styles.modeBadge}>Tryb: {mode}</Text>
    </View>

    <View style={styles.card}>
      {currentChallenge ? (
        <>
          <Text style={styles.playerText}>{currentPlayer}, Twoje zadanie:</Text>
          <Text style={styles.challengeText}>{currentChallenge}</Text>
        </>
      ) : (
        <Text style={styles.placeholderText}>Kliknij przycisk poniżej, aby rozpocząć!</Text>
      )}
    </View>

    <TouchableOpacity style={styles.actionButton} onPress={onDrawNext}>
      <Text style={styles.actionButtonText}>LOSUJ ZADANIE</Text>
    </TouchableOpacity>

    <TouchableOpacity onPress={() => onExit('MENU')}>
      <Text style={styles.backText}>Wyjdź z gry</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  gameContainer: { flex: 1, justifyContent: 'space-between', alignItems: 'center', paddingVertical: 20 },
  topInfo: { marginTop: 10 },
  modeBadge: { color: '#888', fontSize: 14, fontWeight: '600', textTransform: 'uppercase' },
  card: { width: '85%', height: 300, backgroundColor: '#1E1E1E', borderRadius: 20, padding: 25, alignItems: 'center', justifyContent: 'center', borderRightWidth: 1, borderBottomWidth: 3, borderColor: '#333' },
  playerText: { color: '#FFD700', fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  challengeText: { color: '#FFF', fontSize: 22, textAlign: 'center', lineHeight: 30 },
  placeholderText: { color: '#888', fontSize: 18, textAlign: 'center' },
  actionButton: { backgroundColor: '#6200EE', width: '85%', paddingVertical: 18, borderRadius: 15, alignItems: 'center', marginBottom: 15 },
  actionButtonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  backText: { color: '#888', marginTop: 10, fontSize: 15 },
});