import { ScreenState } from '@/types/game';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface JoinScreenProps {
  roomCode: string;
  errorMessage: string;
  onChangeRoomCode: (code: string) => void;
  onJoin: () => void;
  onBack: (screen: ScreenState) => void;
}

export const JoinScreen = ({ roomCode, errorMessage, onChangeRoomCode, onJoin, onBack }: JoinScreenProps) => (
  <View style={styles.centerContainer}>
    <Text style={styles.subtitle}>Wpisz kod pokoju</Text>

    <TextInput
      style={styles.input}
      placeholder="np. 1111"
      placeholderTextColor="#666"
      value={roomCode}
      onChangeText={(text) => onChangeRoomCode(text.toUpperCase())}
      maxLength={4}
      keyboardType="number-pad"
    />

    {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

    <TouchableOpacity style={styles.actionButton} onPress={onJoin}>
      <Text style={styles.actionButtonText}>WEJDŹ DO POKOJU</Text>
    </TouchableOpacity>

    <TouchableOpacity onPress={() => onBack('MENU')}>
      <Text style={styles.backText}>‹ Powrót do menu</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%', paddingHorizontal: 20 },
  subtitle: { fontSize: 24, fontWeight: 'bold', color: '#FFF', marginBottom: 20 },
  input: { backgroundColor: '#1E1E1E', color: '#FFF', width: '85%', padding: 15, borderRadius: 12, fontSize: 22, textAlign: 'center', marginBottom: 15, borderWidth: 1, borderColor: '#333' },
  errorText: { color: '#FF5252', marginBottom: 15, fontWeight: '600' },
  actionButton: { backgroundColor: '#6200EE', width: '85%', paddingVertical: 18, borderRadius: 15, alignItems: 'center', marginBottom: 15 },
  actionButtonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  backText: { color: '#888', marginTop: 10, fontSize: 15 },
});