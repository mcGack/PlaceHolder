import { ScreenState } from '@/types/game';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface MenuScreenProps {
  onNavigate: (screen: ScreenState) => void;
}

export const MenuScreen = ({ onNavigate }: MenuScreenProps) => (
  <View style={styles.centerContainer}>
    <Text style={styles.title}>Imprezowa Gra</Text>
    
    <TouchableOpacity style={styles.mainButton} onPress={() => onNavigate('CREATE_SETTINGS')}>
      <Text style={styles.mainButtonText}>STWÓRZ GRĘ</Text>
    </TouchableOpacity>

    <TouchableOpacity style={[styles.mainButton, styles.secondaryButton]} onPress={() => onNavigate('JOIN')}>
      <Text style={styles.mainButtonText}>DOŁĄCZ DO GRY</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%', paddingHorizontal: 20 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#FFF', marginBottom: 40 },
  mainButton: { backgroundColor: '#6200EE', width: '85%', paddingVertical: 18, borderRadius: 15, alignItems: 'center', marginBottom: 15 },
  secondaryButton: { backgroundColor: '#3700B3' },
  mainButtonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
});