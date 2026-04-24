import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import HomeScreen from '../src/screens/HomeScreen';

const mockNavigate = jest.fn();

jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  const React = require('react');
  return {
    ...actual,
    useNavigation: () => ({ navigate: mockNavigate }),
    useFocusEffect: (cb: any) => React.useEffect(() => cb(), [cb]),
  };
});

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
    profile: { name: 'Tara', currentWeight: 70 },
    refreshProfile: mockRefreshProfile,
  }),
}));

const mockGetCachedWeights = jest.fn().mockResolvedValue([
  { weight: 70, createdAt: 1000 },
  { weight: 69.5, createdAt: 2000 },
]);
const mockSyncWeights = jest.fn().mockResolvedValue([
  { weight: 70, createdAt: 1000 },
  { weight: 69.5, createdAt: 2000 },
]);
const mockGetUserGroups = jest.fn().mockResolvedValue([
  { id: 'group-1', groupName: 'Sprint Crew', users: ['user-1'] },
]);
const mockCreateGroup = jest.fn().mockResolvedValue({
  id: 'group-2',
  groupName: 'Night Riders',
  inviteCode: 'group-2',
  inviteLink: 'thadi2://join?groupId=group-2',
  users: ['user-1'],
});
const mockJoinGroupByInvite = jest.fn().mockResolvedValue({
  id: 'group-3',
  groupName: 'Morning Pack',
  inviteCode: 'group-3',
  inviteLink: 'thadi2://join?groupId=group-3',
  users: ['user-1'],
});

let consoleErrorSpy: jest.SpyInstance | undefined;
const originalConsoleError = console.error.bind(console);

beforeAll(() => {
  consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation((...args: unknown[]) => {
    const first = args[0];
    if (typeof first === 'string' && first.includes('not wrapped in act')) {
      return;
    }
    // Forward any other console errors so real failures still surface.
    originalConsoleError(...(args as Parameters<typeof console.error>));
  });
});

afterAll(() => {
  consoleErrorSpy?.mockRestore();
});

beforeEach(() => {
  jest.clearAllMocks();
});

jest.mock('../src/services/cache', () => ({
  getCachedWeights: (...args: any[]) => mockGetCachedWeights(...args),
}));

jest.mock('../src/services/weights', () => ({
  syncWeights: (...args: any[]) => mockSyncWeights(...args),
}));

jest.mock('../src/services/groups', () => ({
  getUserGroups: (...args: any[]) => mockGetUserGroups(...args),
  createGroup: (...args: any[]) => mockCreateGroup(...args),
  joinGroupByInvite: (...args: any[]) => mockJoinGroupByInvite(...args),
}));

describe('HomeScreen', () => {
  it('renders dashboard data and groups', async () => {
    const { getByText } = render(<HomeScreen />);

    await waitFor(() => {
      expect(mockGetUserGroups).toHaveBeenCalledWith('user-1');
      expect(mockSyncWeights).toHaveBeenCalledWith('user-1');
    });

    expect(getByText(/Current 69.5 kg/)).toBeTruthy();
  });

  it('creates a group and navigates to it', async () => {
    const { getAllByText, getByPlaceholderText, getByText } = render(<HomeScreen />);

    fireEvent.press(getByText('Create Group'));
    fireEvent.changeText(getByPlaceholderText('Name your squad'), 'Night Riders');
    fireEvent.press(getAllByText('Create Group')[1]);

    await waitFor(() => {
      expect(mockCreateGroup).toHaveBeenCalledWith('user-1', 'Night Riders');
      expect(mockNavigate).toHaveBeenCalledWith('GroupDetail', { groupId: 'group-2' });
    });
  });

  it('joins a group from an invite link and navigates to it', async () => {
    const { getByPlaceholderText, getByText } = render(<HomeScreen />);

    fireEvent.press(getByText('Join Group'));
    fireEvent.changeText(getByPlaceholderText('Paste invite code or thadi2:// link'), 'thadi2://join?groupId=group-3');
    fireEvent.press(getByText('Join With Invite'));

    await waitFor(() => {
      expect(mockJoinGroupByInvite).toHaveBeenCalledWith('user-1', 'thadi2://join?groupId=group-3');
      expect(mockNavigate).toHaveBeenCalledWith('GroupDetail', { groupId: 'group-3' });
    });
  });
});
