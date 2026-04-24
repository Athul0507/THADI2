import React, { useMemo } from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useTheme } from '../context/ThemeContext';
import { WeightEntry } from '../services/weights';
import { formatShortDate } from '../utils/date';

const compress = (weights: WeightEntry[]) => {
  if (weights.length <= 6) return weights;
  const step = Math.ceil(weights.length / 6);
  return weights.filter((_, index) => index % step === 0 || index === weights.length - 1);
};

export const WeightChart: React.FC<{ weights: WeightEntry[] }> = ({ weights }) => {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const data = useMemo(() => compress(weights), [weights]);

  if (weights.length === 0) {
    return (
      <View style={[styles.empty, { borderColor: theme.colors.stroke }]}> 
        <Text style={[styles.emptyText, { color: theme.colors.textMuted, fontFamily: theme.fonts.body }]}>No weight entries yet.</Text>
      </View>
    );
  }

  const labels = data.map((w) => formatShortDate(w.createdAt));
  const values = data.map((w) => w.weight);

  return (
    <LineChart
      data={{ labels, datasets: [{ data: values }] }}
      width={width - 64}
      height={220}
      withInnerLines={false}
      withOuterLines={false}
      withShadow={false}
      withDots={false}
      withHorizontalLabels={true}
      chartConfig={{
        backgroundColor: 'transparent',
        backgroundGradientFrom: 'transparent',
        backgroundGradientTo: 'transparent',
        decimalPlaces: 1,
        color: () => theme.colors.chart,
        labelColor: () => theme.colors.textMuted,
        propsForBackgroundLines: { stroke: theme.colors.chartMuted },
      }}
      style={styles.chart}
    />
  );
};

const styles = StyleSheet.create({
  chart: {
    marginTop: 12,
    borderRadius: 16,
  },
  empty: {
    height: 180,
    borderWidth: 1,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
  },
});
