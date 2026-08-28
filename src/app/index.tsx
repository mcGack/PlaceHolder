import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGame } from '../hooks/useGame';
import { CreateSettingsScreen } from '../screens/CreateSettingsScreen';
import { GameScreen } from '../screens/GameScreen';
import { JoinScreen } from '../screens/JoinScreen';
import { MenuScreen } from '../screens/MenuScreen';

export default function App() {
  const {
    screen,
    mode,
    roomCode,
    errorMessage,
    currentChallenge,
    currentPlayer,
    setMode,
    setRoomCode,
    setErrorMessage,
    startGame,
    handleJoinGame,
    drawNext,
    navigateTo,
  } = useGame();

  return (
    <SafeAreaView style={styles.container}>
      {screen === 'MENU' && <MenuScreen onNavigate={navigateTo} />}
      
      {screen === 'CREATE_SETTINGS' && (
        <CreateSettingsScreen
          mode={mode}
          onSelectMode={setMode}
          onStartGame={startGame}
          onBack={navigateTo}
        />
      )}

      {screen === 'JOIN' && (
        <JoinScreen
          roomCode={roomCode}
          errorMessage={errorMessage}
          onChangeRoomCode={(code) => {
            setRoomCode(code);
            setErrorMessage('');
          }}
          onJoin={handleJoinGame}
          onBack={navigateTo}
        />
      )}

      {screen === 'GAME' && (
        <GameScreen
          mode={mode}
          currentPlayer={currentPlayer}
          currentChallenge={currentChallenge}
          onDrawNext={drawNext}
          onExit={navigateTo}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
});