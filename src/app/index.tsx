import { useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import challenges from '../../challenges.json';

const PLAYERS = ['Ania', 'Bartek', 'Kasia', 'Tomek'];
interface Challenge {
  id: number;
  text: string;
  mode: string;
}

export default function App() {
  const [currentChallenge, setCurrentChallenge] = useState<string | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState('');
  const [mode, setMode] = useState('SFW');

  const drawNext = () => {
  const filtered = (challenges as Challenge[]).filter((c: Challenge) => c.mode === mode);
  const randomPlayer = PLAYERS[Math.floor(Math.random() * PLAYERS.length)];
  const randomChallenge = filtered[Math.floor(Math.random() * filtered.length)];

  setCurrentPlayer(randomPlayer);
  setCurrentChallenge(randomChallenge ? randomChallenge.text : 'Brak wyzwań w tym trybie!');
};

  return (
    <SafeAreaView style={styles.container}>
      {/* Przełącznik SFW / NSFW */}
      <View style={styles.modeContainer}>
        <TouchableOpacity 
          style={[styles.modeButton, mode === 'SFW' && styles.activeSFW]} 
          onPress={() => setMode('SFW')}>
          <Text style={styles.modeText}>SFW</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.modeButton, mode === 'NSFW' && styles.activeNSFW]} 
          onPress={() => setMode('NSFW')}>
          <Text style={styles.modeText}>NSFW</Text>
        </TouchableOpacity>
      </View>

      {/* Karta z zadaniem */}
      <View style={styles.card}>
        {currentChallenge ? (
          <>
            <Text style={styles.playerText}>{currentPlayer}, Twoje zadanie:</Text>
            <Text style={styles.challengeText}>{currentChallenge}</Text>
          </>
        ) : (
          <Text style={styles.placeholderText}>Kliknij przycisk poniżej, aby losować!</Text>
        )}
      </View>

      {/* Przycisk losowania */}
      <TouchableOpacity style={styles.drawButton} onPress={drawNext}>
        <Text style={styles.drawButtonText}>LOSUJ ZADANIE</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 40 },
  modeContainer: { flexDirection: 'row', gap: 10, marginTop: 20 },
  modeButton: { paddingVertical: 10, paddingHorizontal: 25, borderRadius: 20, backgroundColor: '#2A2A2A' },
  activeSFW: { backgroundColor: '#2E7D32' },
  activeNSFW: { backgroundColor: '#C62828' },
  modeText: { color: '#FFF', fontWeight: 'bold' },
  card: { width: '85%', height: 300, backgroundColor: '#1E1E1E', borderRadius: 20, padding: 25, alignItems: 'center', justifyContent: 'center', borderRightWidth: 1, borderBottomWidth: 3, borderColor: '#333' },
  playerText: { color: '#FFD700', fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  challengeText: { color: '#FFF', fontSize: 22, textAlign: 'center', lineHeight: 30 },
  placeholderText: { color: '#888', fontSize: 18, textAlign: 'center' },
  drawButton: { backgroundColor: '#6200EE', width: '85%', paddingVertical: 18, borderRadius: 15, alignItems: 'center', marginBottom: 20 },
  drawButtonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
});