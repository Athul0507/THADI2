import '@testing-library/jest-native/extend-expect';
import 'react-native-gesture-handler/jestSetup';

jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));

jest.mock('@react-native-async-storage/async-storage', () => {
  let store = {};
  return {
    __esModule: true,
    default: {
      getItem: jest.fn(async (key) => (key in store ? store[key] : null)),
      setItem: jest.fn(async (key, value) => {
        store[key] = value;
      }),
      removeItem: jest.fn(async (key) => {
        delete store[key];
      }),
      clear: jest.fn(async () => {
        store = {};
      }),
    },
  };
});

jest.mock('expo-linear-gradient', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    LinearGradient: (props) => React.createElement(View, props, props.children),
  };
}, { virtual: true });

jest.mock('react-native-chart-kit', () => {
  const React = require('react');
  return {
    LineChart: () => React.createElement('LineChart'),
  };
});

jest.mock('@react-native-google-signin/google-signin', () => ({
  GoogleSignin: {
    configure: jest.fn(),
    hasPlayServices: jest.fn(async () => true),
    signIn: jest.fn(async () => ({})),
    getTokens: jest.fn(async () => ({ idToken: 'test-id-token', accessToken: 'test-access-token' })),
    signOut: jest.fn(async () => undefined),
  },
}));
