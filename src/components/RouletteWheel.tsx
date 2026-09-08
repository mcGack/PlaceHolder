import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { Player } from '../types/game';

interface RouletteWheelProps {
  players: Player[];
  activePlayerId?: string;
}

export const RouletteWheel = ({ players, activePlayerId }: RouletteWheelProps) => {
  const spinValue = useRef(new Animated.Value(0)).current;
  const [isSpinning, setIsSpinning] = useState(true);

  const activeIndex = players.findIndex((p) => p.id === activePlayerId);
  const targetIndex = activeIndex >= 0 ? activeIndex : 0;

  const numPlayers = players.length || 1;
  const segmentAngle = 360 / numPlayers;
  const targetDegree = 360 * 5 + (360 - targetIndex * segmentAngle - segmentAngle / 2);

  const activePlayer = players.find((p) => p.id === activePlayerId);

  useEffect(() => {
    if (!activePlayerId) return;


    setIsSpinning(true);
    spinValue.setValue(0);

    Animated.timing(spinValue, {
      toValue: targetDegree,
      duration: 3500,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start(() => {

      setIsSpinning(false);
    });
  }, [activePlayerId]);

  const rotate = spinValue.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <View style={styles.pointer} />

      <Animated.View style={[styles.wheel, { transform: [{ rotate }] }]}>
        {players.map((p, index) => {
          const angle = index * segmentAngle;
          return (
            <View
              key={p.id}
              style={[styles.segment, { transform: [{ rotate: `${angle}deg` }] }]}
            >
              <Text style={styles.playerText}>{p.name}</Text>
            </View>
          );
        })}
      </Animated.View>


      <Text style={styles.winnerText}>
        {isSpinning || !activePlayer
          ? '🎲 Losowanie gracza...'
          : `🎯 Wylosowano: ${activePlayer.name}!`}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', marginVertical: 20 },
  pointer: {
    width: 0,
    height: 0,
    borderLeftWidth: 12,
    borderRightWidth: 12,
    borderTopWidth: 20,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#FFD700',
    zIndex: 10,
    marginBottom: -10,
  },
  wheel: {
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 4,
    borderColor: '#FFD700',
    backgroundColor: '#1E1E1E',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  segment: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    alignItems: 'center',
    paddingTop: 15,
  },
  playerText: { color: '#FFF', fontWeight: 'bold', fontSize: 13 },
  winnerText: { color: '#FFD700', fontSize: 20, fontWeight: 'bold', marginTop: 20, textAlign: 'center' },
});