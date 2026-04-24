import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import SettingsScreen from '../src/screens/SettingsScreen';

const mockToggleMode = jest.fn();
const mockSignOut = jest.fn();

jest.mock('../src/context/ThemeContext', () => {
  const { createTheme } = require('../src/theme');
  const theme = createTheme('dark');
  return {
    useTheme: () => ({ theme, mode: 'dark', toggleMode: mockToggleMode, setMode: jest.fn() }),
  };
});

jest.mock('../src/context/AuthContext', () => ({
  useAuth: () => ({
    signOut: mockSignOut,
  }),
}));

describe('SettingsScreen', () => {
  it('toggles dark mode', () => {
    const { getByRole } = render(<SettingsScreen />);
    const toggle = getByRole('switch');
    fireEvent(toggle, 'valueChange', true);
    expect(mockToggleMode).toHaveBeenCalled();
  });

  it('logs out', () => {
    const { getByText } = render(<SettingsScreen />);
    fireEvent.press(getByText('Log out'));
    expect(mockSignOut).toHaveBeenCalled();
  });
});
