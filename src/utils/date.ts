export const formatShortDate = (timestamp: number) => {
  const date = new Date(timestamp);
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

export const formatFullDate = (timestamp: number) => {
  const date = new Date(timestamp);
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

export const isWithinDays = (timestamp: number, days: number) => {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return timestamp >= cutoff;
};
