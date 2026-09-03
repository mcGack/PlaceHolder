import { GameScreen } from '@/screens/GameScreen';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGame } from '../hooks/useGame';
import { CreateSettingsScreen } from '../screens/CreateSettingsScreen';
import { JoinScreen } from '../screens/JoinScreen';
import { LobbyScreen } from '../screens/LobbyScreen';
import { MenuScreen } from '../screens/MenuScreen';

export default function App() {
  const {
    screen,
    mode,
    roomCode,
    playerName,
    userId,
    errorMessage,
    playersList,
    roomData,
    setMode,
    setRoomCode,
    setPlayerName,
    handleCreateGame,
    handleJoinGame,
    navigateTo,
    handleLeaveRoom,
    handleStartGame,
  } = useGame();

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ backgroundColor: '#222', padding: 10, alignItems: 'center' }}>
        <Text style={{ color: '#00FF00', fontWeight: 'bold' }}>
          AKTUALNY EKRAN: {screen} | KOD: {roomCode || 'BRAK'}
        </Text>
      </View>
      {screen === 'MENU' && <MenuScreen onNavigate={navigateTo} />}

      {screen === 'CREATE_SETTINGS' && (
        <CreateSettingsScreen
          mode={mode}
          playerName={playerName}
          errorMessage={errorMessage}
          onSelectMode={setMode}
          onChangePlayerName={setPlayerName}
          onCreateGame={handleCreateGame}
          onBack={navigateTo}
        />
      )}

      {screen === 'JOIN' && (
        <JoinScreen
          roomCode={roomCode}
          playerName={playerName}
          errorMessage={errorMessage}
          onChangeRoomCode={setRoomCode}
          onChangePlayerName={setPlayerName}
          onJoin={handleJoinGame}
          onBack={navigateTo}
        />
      )}

      {screen === 'LOBBY' && (
        <LobbyScreen
          roomCode={roomCode}
          players={playersList}
          userId={userId}
          hostId={roomData?.hostId}
          onLeave={handleLeaveRoom}
          onStartGame={handleStartGame}
        />
      )}
      {screen === 'GAME' && (
        <GameScreen
          roomCode={roomCode}
          activePlayerId={roomData?.activePlayerId}
          userId={userId}
          players={playersList}
          turnStage={roomData?.turnStage}
          currentChallenge={roomData?.currentChallenge ?? undefined}
          selectedPoints={roomData?.selectedPoints ?? undefined}
          isNsfw={roomData?.mode === 'NSFW'}
          votes={roomData?.votes || {}}
          hostId={roomData?.hostId}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
});