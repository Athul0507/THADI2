import AsyncStorage from '@react-native-async-storage/async-storage';
import { appendCachedWeights, getCachedWeights, getLastSync, setCachedWeights } from '../src/services/cache';

const uid = 'user-1';

describe('cache service', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('stores and retrieves cached weights with last sync', async () => {
    const weights = [
      { weight: 70, createdAt: 1000 },
      { weight: 71, createdAt: 2000 },
    ];

    await setCachedWeights(uid, weights, 2000);

    const stored = await getCachedWeights(uid);
    const lastSync = await getLastSync(uid);

    expect(stored).toEqual(weights);
    expect(lastSync).toBe(2000);
  });

  it('appends new weights in order', async () => {
    await setCachedWeights(uid, [{ weight: 70, createdAt: 1000 }], 1000);
    const merged = await appendCachedWeights(uid, [{ weight: 69.5, createdAt: 900 }], 900);

    expect(merged).toEqual([
      { weight: 69.5, createdAt: 900 },
      { weight: 70, createdAt: 1000 },
    ]);
  });
});
