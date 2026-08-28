import { GameMode, ScreenState } from '@/types/game';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface CreateSettingsScreenProps {
  mode: GameMode;
  onSelectMode: (mode: GameMode) => void;
  onStartGame: () => void;
  onBack: (screen: ScreenState) => void;
}

export const CreateSettingsScreen = ({ mode, onSelectMode, onStartGame, onBack }: CreateSettingsScreenProps) => (
  <View style={styles.centerContainer}>
    <Text style={styles.subtitle}>Ustawienia nowej gry</Text>
    <Text style={styles.label}>Wybierz tryb pytań:</Text>

    <View style={styles.modeContainer}>
      <TouchableOpacity 
        style={[styles.modeButton, mode === 'SFW' && styles.activeSFW]} 
        onPress={() => onSelectMode('SFW')}>
        <Text style={styles.modeText}>SFW</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[styles.modeButton, mode === 'NSFW' && styles.activeNSFW]} 
        onPress={() => onSelectMode('NSFW')}>
        <Text style={styles.modeText}>NSFW</Text>
      </TouchableOpacity>
    </View>

    <TouchableOpacity style={styles.actionButton} onPress={onStartGame}>
      <Text style={styles.actionButtonText}>ROZPOCZNIJ GRĘ</Text>
    </TouchableOpacity>

    <TouchableOpacity onPress={() => onBack('MENU')}>
      <Text style={styles.backText}>‹ Powrót do menu</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%', paddingHorizontal: 20 },
  subtitle: { fontSize: 24, fontWeight: 'bold', color: '#FFF', marginBottom: 20 },
  label: { color: '#AAA', fontSize: 16, marginBottom: 15 },
  modeContainer: { flexDirection: 'row', gap: 15, marginBottom: 30 },
  modeButton: { paddingVertical: 12, paddingHorizontal: 30, borderRadius: 20, backgroundColor: '#2A2A2A' },
  activeSFW: { backgroundColor: '#2E7D32' },
  activeNSFW: { backgroundColor: '#C62828' },
  modeText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  actionButton: { backgroundColor: '#6200EE', width: '85%', paddingVertical: 18, borderRadius: 15, alignItems: 'center', marginBottom: 15 },
  actionButtonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  backText: { color: '#888', marginTop: 10, fontSize: 15 },
});