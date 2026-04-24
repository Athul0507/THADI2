import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Group } from '../services/groups';

export const GroupCard: React.FC<{ group: Group; onPress: () => void }> = ({ group, onPress }) => {
  const { theme } = useTheme();
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.card, { backgroundColor: theme.colors.surfaceAlt, borderColor: theme.colors.stroke }]}> 
        <Text style={[styles.title, { color: theme.colors.text, fontFamily: theme.fonts.bodyMedium }]}>{group.groupName}</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textMuted, fontFamily: theme.fonts.body }]}>
          {group.users.length} member{group.users.length === 1 ? '' : 's'}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
  },
  subtitle: {
    fontSize: 12,
    marginTop: 6,
  },
});
