import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { useTheme } from '../context/ThemeContext';

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const angleFromValue = (value: number, min: number, max: number) => {
  const ratio = (value - min) / (max - min);
  return ratio * Math.PI * 2;
};

const valueFromAngle = (angle: number, min: number, max: number, step: number) => {
  const ratio = (angle % (Math.PI * 2)) / (Math.PI * 2);
  const raw = min + ratio * (max - min);
  const snapped = Math.round(raw / step) * step;
  return clamp(Number(snapped.toFixed(1)), min, max);
};

export const RotaryDial: React.FC<{
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  step?: number;
  size?: number;
}> = ({ value, onChange, min = 35, max = 180, step = 0.5, size = 260 }) => {
  const { theme } = useTheme();
  const angle = useSharedValue(angleFromValue(value, min, max));

  useEffect(() => {
    angle.value = angleFromValue(value, min, max);
  }, [value, min, max, angle]);

  const updateValue = (nextAngle: number) => {
    const next = valueFromAngle(nextAngle, min, max, step);
    onChange(next);
  };

  const pan = Gesture.Pan().onUpdate((e) => {
    const center = size / 2;
    const dx = e.x - center;
    const dy = e.y - center;
    const raw = Math.atan2(dy, dx) + Math.PI / 2;
    const normalized = raw < 0 ? raw + Math.PI * 2 : raw;
    angle.value = normalized;
    runOnJS(updateValue)(normalized);
  });

  const dialStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${angle.value}rad` }],
  }));

  return (
    <View style={[styles.container, { width: size, height: size }]}> 
      <View style={[styles.ring, { borderColor: theme.colors.stroke, backgroundColor: theme.colors.surfaceAlt }]} />
      <GestureDetector gesture={pan}>
        <Animated.View style={[styles.knobWrap, { width: size, height: size }, dialStyle]}>
          <View style={[styles.knob, { backgroundColor: theme.colors.accentSoft }]} />
        </Animated.View>
      </GestureDetector>
      <View style={styles.center}>
        <Text style={[styles.value, { color: theme.colors.text, fontFamily: theme.fonts.heading }]}>{value.toFixed(1)}</Text>
        <Text style={[styles.unit, { color: theme.colors.textMuted, fontFamily: theme.fonts.body }]}>kg</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 999,
    borderWidth: 1,
  },
  knobWrap: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  knob: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginTop: 6,
  },
  center: {
    alignItems: 'center',
  },
  value: {
    fontSize: 44,
    letterSpacing: 2,
  },
  unit: {
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
});
