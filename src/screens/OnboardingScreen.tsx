import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { Screen } from '../components/Screen';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const OnboardingScreen = () => {
  const { theme } = useTheme();
  const { completeOnboarding } = useAuth();

  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const isValid = useMemo(() => {
    return name.trim().length > 0 && Number(age) > 0 && Number(height) > 0 && Number(weight) > 0;
  }, [name, age, height, weight]);

  const handleSubmit = async () => {
    if (!isValid) {
      setError('Please fill in all fields with valid numbers.');
      return;
    }
    setError('');
    setSaving(true);
    await completeOnboarding({
      name: name.trim(),
      age: Number(age),
      height: Number(height),
      currentWeight: Number(weight),
    });
    setSaving(false);
  };

  return (
    <Screen>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Text style={[styles.title, { color: theme.colors.text, fontFamily: theme.fonts.heading }]}>Set your baseline</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textMuted, fontFamily: theme.fonts.body }]}>We need a starting point to tune your progress.</Text>

        <View style={styles.form}>
          <TextInput
            placeholder="Name"
            placeholderTextColor={theme.colors.textMuted}
            style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.stroke, fontFamily: theme.fonts.body }]}
            value={name}
            onChangeText={setName}
          />
          <TextInput
            placeholder="Age"
            placeholderTextColor={theme.colors.textMuted}
            keyboardType="number-pad"
            style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.stroke, fontFamily: theme.fonts.body }]}
            value={age}
            onChangeText={setAge}
          />
          <TextInput
            placeholder="Height (cm)"
            placeholderTextColor={theme.colors.textMuted}
            keyboardType="decimal-pad"
            style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.stroke, fontFamily: theme.fonts.body }]}
            value={height}
            onChangeText={setHeight}
          />
          <TextInput
            placeholder="Current weight (kg)"
            placeholderTextColor={theme.colors.textMuted}
            keyboardType="decimal-pad"
            style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.stroke, fontFamily: theme.fonts.body }]}
            value={weight}
            onChangeText={setWeight}
          />

          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.colors.accent, opacity: isValid ? 1 : 0.6 }]}
            onPress={handleSubmit}
            disabled={!isValid || saving}
          >
            <Text style={[styles.buttonText, { color: theme.colors.background, fontFamily: theme.fonts.bodyMedium }]}>
              {saving ? 'Saving...' : 'Finish setup'}
            </Text>
          </TouchableOpacity>

          {!!error && <Text style={[styles.error, { color: theme.colors.energy, fontFamily: theme.fonts.body }]}>{error}</Text>}
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 42,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 6,
  },
  form: {
    marginTop: 24,
  },
  input: {
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 14,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 14,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  error: {
    marginTop: 12,
    fontSize: 12,
  },
});

export default OnboardingScreen;
