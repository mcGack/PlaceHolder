import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface JoinScreenProps {
  roomCode: string;
  playerName: string;
  errorMessage: string;
  onChangeRoomCode: (code: string) => void;
  onChangePlayerName: (name: string) => void;
  onJoin: () => void;
  onBack: (screen: 'MENU') => void;
}

export const JoinScreen = ({
  roomCode,
  playerName,
  errorMessage,
  onChangeRoomCode,
  onChangePlayerName,
  onJoin,
  onBack,
}: JoinScreenProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dołącz do gry</Text>

      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

      <Text style={styles.label}>Kod pokoju (4 znaki):</Text>
      <TextInput
        style={styles.input}
        placeholder="np. ABCD"
        placeholderTextColor="#666"
        value={roomCode}
        onChangeText={(text) => onChangeRoomCode(text.toUpperCase())}
        maxLength={4}
        autoCapitalize="characters"
      />

      <Text style={styles.label}>Twoje imię:</Text>
      <TextInput
        style={styles.input}
        placeholder="Wpisz imię..."
        placeholderTextColor="#666"
        value={playerName}
        onChangeText={onChangePlayerName}
      />

      <TouchableOpacity style={styles.button} onPress={onJoin}>
        <Text style={styles.buttonText}>DOŁĄCZ</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => onBack('MENU')}>
        <Text style={styles.backText}>Powrót</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', backgroundColor: '#121212' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#FFF', textAlign: 'center', marginBottom: 20 },
  label: { color: '#AAA', fontSize: 14, marginBottom: 5 },
  input: { backgroundColor: '#1E1E1E', color: '#FFF', padding: 15, borderRadius: 8, marginBottom: 15, borderWidth: 1, borderColor: '#333' },
  button: { backgroundColor: '#FFD700', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#000', fontWeight: 'bold', fontSize: 16 },
  backText: { color: '#AAA', textAlign: 'center', marginTop: 15 },
  errorText: { color: '#FF5252', textAlign: 'center', marginBottom: 10 },
});