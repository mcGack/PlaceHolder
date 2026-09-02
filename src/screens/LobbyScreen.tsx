import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Player } from '../types/game';

interface LobbyScreenProps {
  roomCode: string;
  players: Player[];
  userId: string;
  hostId?: string;
  onLeave: () => void;
  onStartGame?: () => void;
}

export const LobbyScreen = ({ roomCode, players, userId, hostId, onLeave, onStartGame }: LobbyScreenProps) => {
  const handlePress = () => {

    onLeave();
  };
  const isHost = userId === hostId;
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Poczekalnia</Text>
        <Text style={styles.codeLabel}>Kod pokoju:</Text>
        <Text style={styles.codeText}>{roomCode}</Text>
        <Text style={styles.subtitle}>Gracze w pokoju ({players.length}):</Text>
      </View>

      <View style={styles.listContainer}>
        <FlatList
          data={players}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.playerCard}>
              <Text style={styles.playerName}>
                {item.name} {item.id === hostId ? '(Host)' : ''} {item.id === userId ? '(Ty)' : ''}
              </Text>
            </View>
          )}
        />
      </View>

      {isHost && (
        <TouchableOpacity 
          style={[styles.startButton, players.length < 2 && styles.buttonDisabled]}
          onPress={onStartGame}
          disabled={players.length < 2}
        >
          <Text style={styles.startButtonText}>
            {players.length < 2 ? 'OCZEKIWANIE NA GRACZY...' : 'WYSTARTUJ GRĘ'}
          </Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity style={styles.leaveButton} onPress={handlePress}>
        <Text style={styles.backText}>OPUŚĆ POKÓJ</Text>
      </TouchableOpacity>
    </View>
  );
};
const styles = StyleSheet.create({
  header: { alignItems: 'center', width: '100%' },
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#FFF', marginBottom: 10 },
  codeLabel: { color: '#888', fontSize: 16 },
  codeText: { fontSize: 36, fontWeight: 'bold', color: '#FFD700', letterSpacing: 4, marginBottom: 30 },
  subtitle: { fontSize: 18, color: '#FFF', alignSelf: 'flex-start', marginBottom: 15 },
  list: { width: '100%', marginBottom: 20 },
  playerCard: { backgroundColor: '#1E1E1E', padding: 15, borderRadius: 10, marginBottom: 10, borderWidth: 1, borderColor: '#333' },
  playerName: { color: '#FFF', fontSize: 18, fontWeight: '600' },
  startButton: { backgroundColor: '#4CAF50', width: '100%', padding: 16, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#45a049' },
  startButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  buttonDisabled: { backgroundColor: '#cccccc', borderColor: '#999999' },
  leaveButton: { backgroundColor: '#331111', width: '100%', padding: 16, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#FF5252' },
  backText: { color: '#FF5252', fontSize: 16, marginTop: 10 },
  listContainer: { flex: 1, width: '100%', marginBottom: 15 },
});
