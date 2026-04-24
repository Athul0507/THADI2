import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export const SectionCard: React.FC<{ children: React.ReactNode; style?: ViewStyle }> = ({ children, style }) => {
  const { theme } = useTheme();
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.stroke,
          shadowColor: theme.mode === 'dark' ? '#000' : '#C9C9C2',
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 14 },
    shadowRadius: 20,
    elevation: 4,
  },
});
