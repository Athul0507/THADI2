export type WeightStepConfig = {
  kgStep: number;
  pxPerStep: number;
};

export const clampWeight = (value: number, min = 20, max = 300) => {
  return Math.min(max, Math.max(min, value));
};

export const roundWeight = (value: number) => {
  return Math.round(value * 10) / 10;
};

export const getWeightStepConfig = (velocityPxPerMs: number): WeightStepConfig => {
  if (velocityPxPerMs < 0.12) {
    return { kgStep: 0.1, pxPerStep: 18 };
  }

  if (velocityPxPerMs < 0.28) {
    return { kgStep: 0.2, pxPerStep: 15 };
  }

  if (velocityPxPerMs < 0.55) {
    return { kgStep: 0.5, pxPerStep: 12 };
  }

  return { kgStep: 1, pxPerStep: 9 };
};
