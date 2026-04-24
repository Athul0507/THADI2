import { clampWeight, getWeightStepConfig, roundWeight } from '../src/utils/weightControl';

describe('weightControl', () => {
  it('uses 0.1 kg steps for slow slider movement', () => {
    expect(getWeightStepConfig(0.08)).toEqual({ kgStep: 0.1, pxPerStep: 18 });
  });

  it('accelerates step size as slider speed increases', () => {
    expect(getWeightStepConfig(0.2)).toEqual({ kgStep: 0.2, pxPerStep: 15 });
    expect(getWeightStepConfig(0.4)).toEqual({ kgStep: 0.5, pxPerStep: 12 });
    expect(getWeightStepConfig(0.9)).toEqual({ kgStep: 1, pxPerStep: 9 });
  });

  it('rounds and clamps weights safely', () => {
    expect(roundWeight(72.349)).toBe(72.3);
    expect(clampWeight(18)).toBe(20);
    expect(clampWeight(305)).toBe(300);
  });
});
