import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export const StatPill: React.FC<{ label: string; value: string }> = ({ label, value }) => {
  const { theme } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surfaceAlt }]}>
      <Text style={[styles.label, { color: theme.colors.textMuted, fontFamily: theme.fonts.body }]}>{label}</Text>
      <Text style={[styles.value, { color: theme.colors.text, fontFamily: theme.fonts.bodyMedium }]}>{value}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginRight: 10,
    minWidth: 90,
  },
  label: {
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  value: {
    fontSize: 16,
    marginTop: 4,
  },
});
