import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';

export const Screen: React.FC<{ children: React.ReactNode; style?: ViewStyle }> = ({ children, style }) => {
  const { theme } = useTheme();
  const gradient = theme.mode === 'dark'
    ? ['#0B0D0F', '#0F141A', '#151A1F']
    : ['#F6F7F3', '#F0F1EC', '#FFFFFF'];

  return (
    <LinearGradient colors={gradient} style={styles.fill}>
      <SafeAreaView style={[styles.fill, { backgroundColor: 'transparent' }, style]}>
        <View style={[styles.noise, { borderColor: theme.colors.stroke }]} />
        {children}
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  noise: {
    position: 'absolute',
    top: -120,
    right: -140,
    width: 260,
    height: 260,
    borderRadius: 130,
    borderWidth: 1,
    opacity: 0.2,
  },
});
