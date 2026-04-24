import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import NewEntryScreen from '../src/screens/NewEntryScreen';

jest.mock('../src/components/WeightScaleSlider', () => ({
  WeightScaleSlider: ({ value }: any) => {
    const React = require('react');
    return React.createElement('Text', { testID: 'scale-slider' }, String(value));
  },
}));

jest.mock('../src/context/ThemeContext', () => {
  const { createTheme } = require('../src/theme');
  const theme = createTheme('dark');
  return {
    useTheme: () => ({ theme, mode: 'dark', toggleMode: jest.fn(), setMode: jest.fn() }),
  };
});

const mockRefreshProfile = jest.fn();

jest.mock('../src/context/AuthContext', () => ({
  useAuth: () => ({
    user: { uid: 'user-1' },
    profile: { currentWeight: 70 },
    refreshProfile: mockRefreshProfile,
  }),
}));

const mockAddWeight = jest.fn().mockResolvedValue({ weight: 88, createdAt: 1 });
const mockGetCachedWeights = jest.fn().mockResolvedValue([{ weight: 88, createdAt: 1 }]);

jest.mock('../src/services/weights', () => ({
  addWeight: (...args: any[]) => mockAddWeight(...args),
}));

jest.mock('../src/services/cache', () => ({
  getCachedWeights: (...args: any[]) => mockGetCachedWeights(...args),
}));

describe('NewEntryScreen', () => {
  it('saves the latest weight entry', async () => {
    const { getByText, getByTestId } = render(<NewEntryScreen />);

    await waitFor(() => {
      expect(mockGetCachedWeights).toHaveBeenCalled();
    });

    expect(getByTestId('scale-slider')).toHaveTextContent('88');
    fireEvent.press(getByText('Save Entry'));

    await waitFor(() => {
      expect(mockAddWeight).toHaveBeenCalledWith('user-1', 88);
      expect(mockRefreshProfile).toHaveBeenCalled();
    });
  });
});
