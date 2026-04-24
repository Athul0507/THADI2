import { isWithinDays } from './date';
import { WeightEntry } from '../services/weights';

export const getWeeklyStats = (weights: WeightEntry[]) => {
  const recent = weights.filter((w) => isWithinDays(w.createdAt, 7));
  if (recent.length === 0) {
    return {
      avg: 0,
      min: 0,
      max: 0,
      change: 0,
      count: 0,
    };
  }

  const total = recent.reduce((sum, w) => sum + w.weight, 0);
  const avg = total / recent.length;
  const min = Math.min(...recent.map((w) => w.weight));
  const max = Math.max(...recent.map((w) => w.weight));
  const change = recent[recent.length - 1].weight - recent[0].weight;

  return {
    avg,
    min,
    max,
    change,
    count: recent.length,
  };
};
