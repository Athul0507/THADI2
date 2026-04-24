import React from 'react';
import { LineChart } from 'react-native-chart-kit';
import { useWindowDimensions } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { WeightEntry } from '../services/weights';

export const WeightSparkline: React.FC<{ weights: WeightEntry[] }> = ({ weights }) => {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  if (weights.length === 0) return null;

  const values = weights.map((w) => w.weight);

  return (
    <LineChart
      data={{ labels: [], datasets: [{ data: values }] }}
      width={Math.min(140, width * 0.32)}
      height={60}
      withDots={false}
      withInnerLines={false}
      withOuterLines={false}
      withHorizontalLabels={false}
      withVerticalLabels={false}
      chartConfig={{
        backgroundColor: 'transparent',
        backgroundGradientFrom: 'transparent',
        backgroundGradientTo: 'transparent',
        color: () => theme.colors.accentSoft,
        labelColor: () => theme.colors.textMuted,
      }}
      style={{ paddingRight: 0, paddingLeft: 0 }}
    />
  );
};
