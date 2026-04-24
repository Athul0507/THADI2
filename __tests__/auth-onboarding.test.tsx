import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AuthScreen from '../src/screens/AuthScreen';
import OnboardingScreen from '../src/screens/OnboardingScreen';

jest.mock('expo-web-browser', () => ({
  maybeCompleteAuthSession: jest.fn(),
}), { virtual: true });

jest.mock('../src/services/auth', () => ({
  signInWithGoogle: jest.fn(),
  signInWithGoogleNative: jest.fn(),
  configureGoogleSignIn: jest.fn(),
}));

jest.mock('../src/context/ThemeContext', () => {
  const { createTheme } = require('../src/theme');
  const theme = createTheme('dark');
  return {
    useTheme: () => ({ theme, mode: 'dark', toggleMode: jest.fn(), setMode: jest.fn() }),
  };
});

const mockCompleteOnboarding = jest.fn();

jest.mock('../src/context/AuthContext', () => ({
  useAuth: () => ({
    completeOnboarding: mockCompleteOnboarding,
  }),
}));

describe('Auth and onboarding flows', () => {
  it('shows error when Google client id is missing', () => {
    process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID = '';
    const { getByText } = render(<AuthScreen />);
    fireEvent.press(getByText('Continue with Google'));
    expect(getByText(/Missing Google Web client ID/i)).toBeTruthy();
  });

  it('submits onboarding payload', async () => {
    const { getByPlaceholderText, getByText } = render(<OnboardingScreen />);

    fireEvent.changeText(getByPlaceholderText('Name'), 'Jordan');
    fireEvent.changeText(getByPlaceholderText('Age'), '28');
    fireEvent.changeText(getByPlaceholderText('Height (cm)'), '176');
    fireEvent.changeText(getByPlaceholderText('Current weight (kg)'), '72.5');

    fireEvent.press(getByText('Finish setup'));

    await waitFor(() => {
      expect(mockCompleteOnboarding).toHaveBeenCalledWith({
        name: 'Jordan',
        age: 28,
        height: 176,
        currentWeight: 72.5,
      });
    });
  });
});
