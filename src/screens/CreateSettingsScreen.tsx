import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { GameMode, ScreenState } from '../types/game';

interface CreateSettingsScreenProps {
  mode: GameMode;
  playerName: string;
  errorMessage: string;
  onSelectMode: (mode: GameMode) => void;
  onChangePlayerName: (name: string) => void;
  onCreateGame: () => void;
  onBack: (screen: ScreenState) => void;
}

export const CreateSettingsScreen = ({
  mode,
  playerName,
  errorMessage,
  onSelectMode,
  onChangePlayerName,
  onCreateGame,
  onBack,
}: CreateSettingsScreenProps) => (
  <View style={styles.centerContainer}>
    <Text style={styles.subtitle}>Ustawienia nowej gry</Text>

    <TextInput
      style={styles.input}
      placeholder="Twoje imię"
      placeholderTextColor="#666"
      value={playerName}
      onChangeText={onChangePlayerName}
    />

    <Text style={styles.label}>Wybierz tryb pytań:</Text>
    <View style={styles.modeContainer}>
      <TouchableOpacity style={[styles.modeButton, mode === 'SFW' && styles.activeSFW]} onPress={() => onSelectMode('SFW')}>
        <Text style={styles.modeText}>SFW</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.modeButton, mode === 'NSFW' && styles.activeNSFW]} onPress={() => onSelectMode('NSFW')}>
        <Text style={styles.modeText}>NSFW</Text>
      </TouchableOpacity>
    </View>

    {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

    <TouchableOpacity style={styles.actionButton} onPress={onCreateGame}>
      <Text style={styles.actionButtonText}>STWÓRZ POKÓJ</Text>
    </TouchableOpacity>

    <TouchableOpacity onPress={() => onBack('MENU')}>
      <Text style={styles.backText}>‹ Powrót do menu</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%', paddingHorizontal: 20 },
  subtitle: { fontSize: 24, fontWeight: 'bold', color: '#FFF', marginBottom: 20 },
  input: { backgroundColor: '#1E1E1E', color: '#FFF', width: '85%', padding: 15, borderRadius: 12, fontSize: 18, textAlign: 'center', marginBottom: 20, borderWidth: 1, borderColor: '#333' },
  label: { color: '#AAA', fontSize: 16, marginBottom: 15 },
  modeContainer: { flexDirection: 'row', gap: 15, marginBottom: 30 },
  modeButton: { paddingVertical: 12, paddingHorizontal: 30, borderRadius: 20, backgroundColor: '#2A2A2A' },
  activeSFW: { backgroundColor: '#2E7D32' },
  activeNSFW: { backgroundColor: '#C62828' },
  modeText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  errorText: { color: '#FF5252', marginBottom: 15, fontWeight: '600' },
  actionButton: { backgroundColor: '#6200EE', width: '85%', paddingVertical: 18, borderRadius: 15, alignItems: 'center', marginBottom: 15 },
  actionButtonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  backText: { color: '#888', marginTop: 10, fontSize: 15 },
});