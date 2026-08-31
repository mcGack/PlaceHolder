import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Player, ScreenState } from '../types/game';

interface LobbyScreenProps {
  roomCode: string;
  players: Player[];
  userId: string;
  hostId?: string;
  onLeave: (screen: ScreenState) => void;
}

export const LobbyScreen = ({ roomCode, players, userId, hostId, onLeave }: LobbyScreenProps) => (
  <View style={styles.container}>
    <Text style={styles.title}>Poczekalnia</Text>
    <Text style={styles.codeLabel}>Kod pokoju:</Text>
    <Text style={styles.codeText}>{roomCode}</Text>

    <Text style={styles.subtitle}>Gracze w pokoju ({players.length}):</Text>

    <FlatList
      data={players}
      keyExtractor={(item) => item.id}
      style={styles.list}
      renderItem={({ item }) => (
        <View style={styles.playerCard}>
          <Text style={styles.playerName}>
            {item.name} {item.id === hostId ? '(Host)' : ''} {item.id === userId ? '(Ty)' : ''}
          </Text>
        </View>
      )}
    />

    <TouchableOpacity onPress={() => onLeave('MENU')}>
      <Text style={styles.backText}>Opuść pokój</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#FFF', marginBottom: 10 },
  codeLabel: { color: '#888', fontSize: 16 },
  codeText: { fontSize: 36, fontWeight: 'bold', color: '#FFD700', letterSpacing: 4, marginBottom: 30 },
  subtitle: { fontSize: 18, color: '#FFF', alignSelf: 'flex-start', marginBottom: 15 },
  list: { width: '100%', marginBottom: 20 },
  playerCard: { backgroundColor: '#1E1E1E', padding: 15, borderRadius: 10, marginBottom: 10, borderWidth: 1, borderColor: '#333' },
  playerName: { color: '#FFF', fontSize: 18, fontWeight: '600' },
  backText: { color: '#FF5252', fontSize: 16, marginTop: 10 },
});