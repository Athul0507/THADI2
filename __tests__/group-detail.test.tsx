import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import { Share } from 'react-native';
import GroupDetailScreen from '../src/screens/GroupDetailScreen';

jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return {
    ...actual,
    useRoute: () => ({ params: { groupId: 'group-1' } }),
  };
});

jest.mock('../src/context/ThemeContext', () => {
  const { createTheme } = require('../src/theme');
  const theme = createTheme('dark');
  return {
    useTheme: () => ({ theme, mode: 'dark', toggleMode: jest.fn(), setMode: jest.fn() }),
  };
});

const mockGetGroupById = jest.fn().mockResolvedValue({
  id: 'group-1',
  groupName: 'Squad Alpha',
  inviteCode: 'group-1',
  inviteLink: 'https://invite',
  users: ['user-1'],
});

const mockGetUsersByIds = jest.fn().mockResolvedValue([
  { userId: 'user-1', name: 'Aya', currentWeight: 66 },
]);

const mockFetchRecentWeights = jest.fn().mockResolvedValue([
  { weight: 66, createdAt: 10 },
  { weight: 65.5, createdAt: 20 },
]);

jest.mock('../src/services/groups', () => ({
  getGroupById: (...args: any[]) => mockGetGroupById(...args),
}));

jest.mock('../src/services/users', () => ({
  getUsersByIds: (...args: any[]) => mockGetUsersByIds(...args),
}));

jest.mock('../src/services/weights', () => ({
  fetchRecentWeights: (...args: any[]) => mockFetchRecentWeights(...args),
}));

describe('GroupDetailScreen', () => {
  it('renders member stats and shares invite link', async () => {
    const shareSpy = jest.spyOn(Share, 'share').mockResolvedValue({ action: 'sharedAction' } as any);

    const { getByText } = render(<GroupDetailScreen />);

    await waitFor(() => {
      expect(getByText('Squad Alpha')).toBeTruthy();
      expect(getByText('Aya')).toBeTruthy();
      expect(getByText(/Invite code group-1/i)).toBeTruthy();
    });

    fireEvent.press(getByText('Share Invite Link'));
    expect(shareSpy).toHaveBeenCalled();
  });
});
