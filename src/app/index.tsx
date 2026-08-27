import { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const challenges = require('../../challenges.json');

interface Challenge {
  id: number;
  text: string;
  mode: string;
}

const PLAYERS = ['Ania', 'Bartek', 'Kasia', 'Tomek'];

type ScreenState = 'MENU' | 'CREATE_SETTINGS' | 'JOIN' | 'GAME';

export default function App() {
  const [screen, setScreen] = useState<ScreenState>('MENU');
  const [mode, setMode] = useState<string>('SFW');
  const [roomCode, setRoomCode] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [currentChallenge, setCurrentChallenge] = useState<string | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<string>('');
  const handleJoinGame = () => {
  setErrorMessage(''); // Czyszczenie starych błędów

  if (roomCode.length < 4) {
    setErrorMessage('Kod pokoju musi mieć 4 znaki!');
    return;
  }

  // TUTAJ w przyszłości zapytamy Firebase:
  // const roomExists = await checkRoomInFirebase(roomCode);
  
  // Na razie symulujemy: jeśli kod to "TEST", wpuszczamy do gry
  if (roomCode === 'TEST') {
    setScreen('GAME');
  } else {
    setErrorMessage('Nie znaleziono pokoju o podanym kodzie!');
  }
};
  const startGame = () => {
    setCurrentChallenge(null);
    setScreen('GAME');
  };

  const drawNext = () => {
    const filtered = (challenges as Challenge[]).filter((c: Challenge) => c.mode === mode);
    const randomPlayer = PLAYERS[Math.floor(Math.random() * PLAYERS.length)];
    const randomChallenge = filtered[Math.floor(Math.random() * filtered.length)];

    setCurrentPlayer(randomPlayer);
    setCurrentChallenge(randomChallenge ? randomChallenge.text : 'Brak wyzwań w tym trybie!');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 1. EKRAN GŁÓWNY (MENU) */}
      {screen === 'MENU' && (
        <View style={styles.centerContainer}>
          <Text style={styles.title}>Imprezowa Gra</Text>
          
          <TouchableOpacity 
            style={styles.mainButton} 
            onPress={() => setScreen('CREATE_SETTINGS')}>
            <Text style={styles.mainButtonText}>STWÓRZ GRĘ</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.mainButton, styles.secondaryButton]} 
            onPress={() => setScreen('JOIN')}>
            <Text style={styles.mainButtonText}>DOŁĄCZ DO GRY</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 2. EKRAN TWORZENIA GRY (USTAWIENIA) */}
      {screen === 'CREATE_SETTINGS' && (
        <View style={styles.centerContainer}>
          <Text style={styles.subtitle}>Ustawienia nowej gry</Text>
          <Text style={styles.label}>Wybierz tryb pytań:</Text>

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

          <TouchableOpacity style={styles.actionButton} onPress={startGame}>
            <Text style={styles.actionButtonText}>ROZPOCZNIJ GRĘ</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setScreen('MENU')}>
            <Text style={styles.backText}>‹ Powrót do menu</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 3. EKRAN DOŁĄCZANIA DO POKOJU */}
      {screen === 'JOIN' && (
        <View style={styles.centerContainer}>
          <Text style={styles.subtitle}>Wpisz kod pokoju</Text>

          <TextInput
            style={styles.input}
            placeholder="np. X7K2"
            placeholderTextColor="#666"
            value={roomCode}
            onChangeText={(text) => {
              setRoomCode(text.toUpperCase());
              setErrorMessage('');
            }}

            autoCapitalize="characters"
            maxLength={4}
          />
          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
          <TouchableOpacity style={styles.actionButton} onPress={handleJoinGame}>
            <Text style={styles.actionButtonText}>WEJDŹ DO POKOJU</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setScreen('MENU')}>
            <Text style={styles.backText}>‹ Powrót do menu</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 4. EKRAN WŁAŚCIWEJ GRY */}
      {screen === 'GAME' && (
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

          <TouchableOpacity style={styles.actionButton} onPress={drawNext}>
            <Text style={styles.actionButtonText}>LOSUJ ZADANIE</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setScreen('MENU')}>
            <Text style={styles.backText}>Wyjdź z gry</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  errorText: { color: '#FF5252', marginBottom: 15, fontWeight: '600' },
  container: { flex: 1, backgroundColor: '#121212' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%', paddingHorizontal: 20 },
  gameContainer: { flex: 1, justifyContent: 'space-between', alignItems: 'center', paddingVertical: 20 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#FFF', marginBottom: 40 },
  subtitle: { fontSize: 24, fontWeight: 'bold', color: '#FFF', marginBottom: 20 },
  label: { color: '#AAA', fontSize: 16, marginBottom: 15 },
  mainButton: { backgroundColor: '#6200EE', width: '85%', paddingVertical: 18, borderRadius: 15, alignItems: 'center', marginBottom: 15 },
  secondaryButton: { backgroundColor: '#3700B3' },
  mainButtonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  modeContainer: { flexDirection: 'row', gap: 15, marginBottom: 30 },
  modeButton: { paddingVertical: 12, paddingHorizontal: 30, borderRadius: 20, backgroundColor: '#2A2A2A' },
  activeSFW: { backgroundColor: '#2E7D32' },
  activeNSFW: { backgroundColor: '#C62828' },
  modeText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  input: { backgroundColor: '#1E1E1E', color: '#FFF', width: '85%', padding: 15, borderRadius: 12, fontSize: 22, textAlign: 'center', marginBottom: 25, borderWidth: 1, borderColor: '#333' },
  actionButton: { backgroundColor: '#6200EE', width: '85%', paddingVertical: 18, borderRadius: 15, alignItems: 'center', marginBottom: 15 },
  actionButtonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  backText: { color: '#888', marginTop: 10, fontSize: 15 },
  topInfo: { marginTop: 10 },
  modeBadge: { color: '#888', fontSize: 14, fontWeight: '600', textTransform: 'uppercase' },
  card: { width: '85%', height: 300, backgroundColor: '#1E1E1E', borderRadius: 20, padding: 25, alignItems: 'center', justifyContent: 'center', borderRightWidth: 1, borderBottomWidth: 3, borderColor: '#333' },
  playerText: { color: '#FFD700', fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  challengeText: { color: '#FFF', fontSize: 22, textAlign: 'center', lineHeight: 30 },
  placeholderText: { color: '#888', fontSize: 18, textAlign: 'center' },
});