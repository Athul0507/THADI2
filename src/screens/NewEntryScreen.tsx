import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Screen } from '../components/Screen';
import { SectionCard } from '../components/SectionCard';
import { WeightScaleSlider } from '../components/WeightScaleSlider';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { addWeight } from '../services/weights';
import { getCachedWeights } from '../services/cache';

const NewEntryScreen = () => {
  const { theme } = useTheme();
  const { user, profile, refreshProfile } = useAuth();
  const [value, setValue] = useState(profile?.currentWeight ?? 70);
  const [baselineWeight, setBaselineWeight] = useState(profile?.currentWeight ?? 70);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('Locked to your latest logged weight.');

  useEffect(() => {
    if (!user) return;
    getCachedWeights(user.uid).then((weights) => {
      if (weights.length > 0) {
        const latestWeight = weights[weights.length - 1].weight;
        setValue(latestWeight);
        setBaselineWeight(latestWeight);
      }
    });
  }, [user]);

  useEffect(() => {
    const diff = value - baselineWeight;
    if (diff === 0) {
      setStatus('Locked to your latest logged weight.');
      return;
    }

    setStatus(
      `${diff > 0 ? 'Up' : 'Down'} ${Math.abs(diff).toFixed(1)} kg from your last logged entry.`
    );
  }, [baselineWeight, value]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    await addWeight(user.uid, value);
    await refreshProfile();
    setBaselineWeight(value);
    setStatus('Saved. Dashboard stats will reflect the new reading.');
    setSaving(false);
  };

  return (
    <Screen>
      <View style={styles.container}>
        <Text style={[styles.title, { color: theme.colors.text, fontFamily: theme.fonts.heading }]}>Record</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textMuted, fontFamily: theme.fonts.body }]}>
          Slide the metal shuttle like a calibrated scale and dial in today&apos;s reading.
        </Text>

        <SectionCard style={styles.scaleWrap}>
          <WeightScaleSlider value={value} baseline={baselineWeight} onChange={setValue} />
        </SectionCard>

        <Text style={[styles.status, { color: theme.colors.textMuted, fontFamily: theme.fonts.bodyMedium }]}>
          {status}
        </Text>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.colors.accent, opacity: saving ? 0.72 : 1 }]}
          onPress={() => void handleSave()}
          disabled={saving}
        >
          <Text style={[styles.buttonText, { color: theme.colors.background, fontFamily: theme.fonts.bodyMedium }]}>
            {saving ? 'Saving...' : 'Save Entry'}
          </Text>
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
    lineHeight: 20,
  },
  scaleWrap: {
    marginTop: 24,
    padding: 16,
  },
  status: {
    fontSize: 13,
    lineHeight: 20,
    marginTop: 18,
  },
  button: {
    marginTop: 22,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 18,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 14,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
});

export default NewEntryScreen;
