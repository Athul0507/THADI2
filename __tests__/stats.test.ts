import { getWeeklyStats } from '../src/utils/stats';
import { WeightEntry } from '../src/services/weights';

const daysAgo = (days: number) => Date.now() - days * 24 * 60 * 60 * 1000;

describe('getWeeklyStats', () => {
  it('returns zeros when there are no recent entries', () => {
    const stats = getWeeklyStats([]);
    expect(stats.avg).toBe(0);
    expect(stats.min).toBe(0);
    expect(stats.max).toBe(0);
    expect(stats.change).toBe(0);
    expect(stats.count).toBe(0);
  });

  it('calculates stats for the last 7 days', () => {
    const weights: WeightEntry[] = [
      { weight: 70, createdAt: daysAgo(6) },
      { weight: 71, createdAt: daysAgo(4) },
      { weight: 69.5, createdAt: daysAgo(1) },
      { weight: 68.8, createdAt: Date.now() },
    ];

    const stats = getWeeklyStats(weights);
    expect(stats.count).toBe(4);
    expect(stats.min).toBeCloseTo(68.8, 1);
    expect(stats.max).toBeCloseTo(71, 1);
    expect(stats.avg).toBeCloseTo(69.825, 2);
    expect(stats.change).toBeCloseTo(-1.2, 1);
  });
});
