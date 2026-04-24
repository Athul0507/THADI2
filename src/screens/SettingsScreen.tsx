import React from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity } from 'react-native';
import { Screen } from '../components/Screen';
import { SectionCard } from '../components/SectionCard';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const SettingsScreen = () => {
  const { theme, mode, toggleMode } = useTheme();
  const { signOut } = useAuth();

  return (
    <Screen>
      <View style={styles.container}>
        <Text style={[styles.title, { color: theme.colors.text, fontFamily: theme.fonts.heading }]}>Studio</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textMuted, fontFamily: theme.fonts.body }]}>Adjust your environment.</Text>

        <SectionCard style={styles.card}>
          <View style={styles.row}>
            <Text style={[styles.label, { color: theme.colors.text, fontFamily: theme.fonts.bodyMedium }]}>Dark mode</Text>
            <Switch
              value={mode === 'dark'}
              onValueChange={toggleMode}
              trackColor={{ true: theme.colors.accentSoft, false: theme.colors.stroke }}
              thumbColor={theme.colors.accent}
            />
          </View>
        </SectionCard>

        <TouchableOpacity style={[styles.logout, { borderColor: theme.colors.stroke }]} onPress={signOut}>
          <Text style={[styles.logoutText, { color: theme.colors.energy, fontFamily: theme.fonts.bodyMedium }]}>Log out</Text>
        </TouchableOpacity>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  title: {
    fontSize: 40,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 6,
  },
  card: {
    marginTop: 24,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 16,
  },
  logout: {
    marginTop: 32,
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  logoutText: {
    fontSize: 14,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});

export default SettingsScreen;
