import React, { useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  LayoutChangeEvent,
  PanResponder,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { clampWeight, getWeightStepConfig, roundWeight } from '../utils/weightControl';

type Props = {
  value: number;
  baseline: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
};

const TICK_COUNT = 32;

export const WeightScaleSlider: React.FC<Props> = ({
  value,
  baseline,
  onChange,
  min = 20,
  max = 300,
}) => {
  const { theme } = useTheme();
  const shuttleX = useRef(new Animated.Value(0)).current;
  const scalePulse = useRef(new Animated.Value(0)).current;
  const railWidth = useRef(0);
  const lastMoveX = useRef<number | null>(null);
  const lastMoveTime = useRef<number | null>(null);
  const accumulatedMovement = useRef(0);
  const currentValue = useRef(value);

  useEffect(() => {
    currentValue.current = value;
    scalePulse.setValue(0);
    Animated.spring(scalePulse, {
      toValue: 1,
      friction: 8,
      tension: 120,
      useNativeDriver: true,
    }).start();
  }, [value, scalePulse]);

  const delta = roundWeight(value - baseline);
  const deltaLabel =
    delta === 0 ? 'Locked to latest' : `${delta > 0 ? '+' : ''}${delta.toFixed(1)} kg from latest`;

  const rulerOffset = useMemo(() => -((Math.round(value * 10) * 7) % 120), [value]);

  const onRailLayout = (event: LayoutChangeEvent) => {
    railWidth.current = event.nativeEvent.layout.width;
  };

  const resetShuttle = () => {
    Animated.spring(shuttleX, {
      toValue: 0,
      friction: 7,
      tension: 90,
      useNativeDriver: true,
    }).start();
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (event, gestureState) => {
          lastMoveX.current = gestureState.x0;
          lastMoveTime.current = event.nativeEvent.timestamp ?? Date.now();
          accumulatedMovement.current = 0;
        },
        onPanResponderMove: (event, gestureState) => {
          const now = event.nativeEvent.timestamp ?? Date.now();
          const currentX = gestureState.moveX;
          const previousX = lastMoveX.current ?? currentX;
          const previousTime = lastMoveTime.current ?? now;
          const deltaX = currentX - previousX;
          const deltaT = Math.max(now - previousTime, 16);
          const velocity = Math.abs(deltaX) / deltaT;
          const step = getWeightStepConfig(velocity);

          accumulatedMovement.current += deltaX;

          let nextValue = currentValue.current;
          while (Math.abs(accumulatedMovement.current) >= step.pxPerStep) {
            const direction = accumulatedMovement.current > 0 ? 1 : -1;
            nextValue = roundWeight(
              clampWeight(nextValue + direction * step.kgStep, min, max)
            );
            accumulatedMovement.current -= direction * step.pxPerStep;
          }

          if (nextValue !== currentValue.current) {
            currentValue.current = nextValue;
            onChange(nextValue);
          }

          const maxTravel = Math.max((railWidth.current - 72) / 2, 0);
          shuttleX.setValue(Math.max(-maxTravel, Math.min(maxTravel, gestureState.dx)));

          lastMoveX.current = currentX;
          lastMoveTime.current = now;
        },
        onPanResponderRelease: resetShuttle,
        onPanResponderTerminate: resetShuttle,
      }),
    [max, min, onChange, shuttleX]
  );

  const pulseScale = scalePulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.03],
  });

  const pulseOpacity = scalePulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 1],
  });

  const ticks = Array.from({ length: TICK_COUNT }, (_, index) => (
    <View
      key={index}
      style={[
        styles.tick,
        {
          height: index % 4 === 0 ? 28 : 16,
          backgroundColor: index % 4 === 0 ? theme.colors.text : theme.colors.chartMuted,
        },
      ]}
    />
  ));

  return (
    <View>
      <Animated.View
        style={[
          styles.scaleCard,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.stroke,
            transform: [{ scale: pulseScale }],
            opacity: pulseOpacity,
          },
        ]}
      >
        <LinearGradient
          colors={
            theme.mode === 'dark'
              ? ['#2A2F35', '#161A1F', '#2B3138']
              : ['#F8F8F5', '#D9DDD6', '#FBFBF8']
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.scaleGlow}
        />
        <Text style={[styles.scaleKicker, { color: theme.colors.textMuted, fontFamily: theme.fonts.bodyMedium }]}>
          Current reading
        </Text>
        <Text style={[styles.scaleValue, { color: theme.colors.text, fontFamily: theme.fonts.heading }]}>
          {value.toFixed(1)}
          <Text style={[styles.scaleUnit, { color: theme.colors.textMuted, fontFamily: theme.fonts.bodyMedium }]}>
            kg
          </Text>
        </Text>
        <Text
          style={[
            styles.scaleDelta,
            {
              color: delta === 0 ? theme.colors.textMuted : delta > 0 ? theme.colors.energy : theme.colors.accentSoft,
              fontFamily: theme.fonts.bodyMedium,
            },
          ]}
        >
          {deltaLabel}
        </Text>

        <View style={[styles.rulerWindow, { backgroundColor: theme.colors.surfaceAlt, borderColor: theme.colors.stroke }]}>
          <View style={[styles.centerNeedle, { backgroundColor: theme.colors.accentSoft }]} />
          <Animated.View style={[styles.tickRow, { transform: [{ translateX: rulerOffset }] }]}>
            {ticks}
            {ticks}
          </Animated.View>
        </View>
      </Animated.View>

      <View style={styles.sliderShell}>
        <Text style={[styles.sliderHint, { color: theme.colors.textMuted, fontFamily: theme.fonts.body }]}>
          Drag right to increase. Drag left to decrease. Faster moves accelerate the change.
        </Text>

        <View
          style={[styles.railFrame, { borderColor: theme.colors.stroke, backgroundColor: theme.colors.surface }]}
          onLayout={onRailLayout}
          {...panResponder.panHandlers}
        >
          <LinearGradient
            colors={
              theme.mode === 'dark'
                ? ['#454C55', '#2C3239', '#14181D', '#394048']
                : ['#D7DBD4', '#F7F8F5', '#C8CEC7', '#EDF0EA']
            }
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.railMetal}
          />
          <View style={[styles.centerLane, { backgroundColor: theme.mode === 'dark' ? '#0D1013' : '#CBD0C9' }]} />
          <View style={styles.ridgeRow}>
            {Array.from({ length: 20 }, (_, index) => (
              <View
                key={index}
                style={[
                  styles.ridge,
                  { backgroundColor: theme.mode === 'dark' ? '#66707A' : '#A0A7A0' },
                ]}
              />
            ))}
          </View>

          <Animated.View style={[styles.shuttleWrap, { transform: [{ translateX: shuttleX }] }]}>
            <LinearGradient
              colors={
                theme.mode === 'dark'
                  ? ['#F2F4EF', '#BBC2C9', '#59616A']
                  : ['#FFFFFF', '#D7DDD6', '#9BA29C']
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.shuttle, { borderColor: theme.colors.stroke }]}
            >
              <View style={styles.shuttleGripRow}>
                {Array.from({ length: 4 }, (_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.shuttleGrip,
                      { backgroundColor: theme.mode === 'dark' ? '#545E68' : '#8D958F' },
                    ]}
                  />
                ))}
              </View>
            </LinearGradient>
          </Animated.View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  scaleCard: {
    borderWidth: 1,
    borderRadius: 28,
    padding: 22,
    overflow: 'hidden',
  },
  scaleGlow: {
    position: 'absolute',
    top: -40,
    right: -20,
    width: 180,
    height: 180,
    borderRadius: 90,
    opacity: 0.18,
  },
  scaleKicker: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  scaleValue: {
    fontSize: 72,
    marginTop: 6,
    lineHeight: 78,
  },
  scaleUnit: {
    fontSize: 18,
  },
  scaleDelta: {
    marginTop: 6,
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  rulerWindow: {
    marginTop: 18,
    borderWidth: 1,
    borderRadius: 18,
    height: 62,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  centerNeedle: {
    position: 'absolute',
    alignSelf: 'center',
    width: 3,
    top: 10,
    bottom: 10,
    borderRadius: 99,
    zIndex: 2,
  },
  tickRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    gap: 10,
  },
  tick: {
    width: 3,
    borderRadius: 99,
    opacity: 0.9,
  },
  sliderShell: {
    marginTop: 20,
  },
  sliderHint: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 14,
  },
  railFrame: {
    height: 92,
    borderRadius: 28,
    borderWidth: 1,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  railMetal: {
    ...StyleSheet.absoluteFillObject,
  },
  centerLane: {
    position: 'absolute',
    left: 18,
    right: 18,
    height: 12,
    borderRadius: 999,
    opacity: 0.45,
  },
  ridgeRow: {
    position: 'absolute',
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ridge: {
    width: 2,
    height: 36,
    borderRadius: 99,
    opacity: 0.45,
  },
  shuttleWrap: {
    alignSelf: 'center',
  },
  shuttle: {
    width: 86,
    height: 54,
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.22,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 18,
    elevation: 5,
  },
  shuttleGripRow: {
    flexDirection: 'row',
    gap: 6,
  },
  shuttleGrip: {
    width: 4,
    height: 18,
    borderRadius: 99,
  },
});
