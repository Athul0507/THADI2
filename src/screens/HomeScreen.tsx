import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Screen } from '../components/Screen';
import { SectionCard } from '../components/SectionCard';
import { StatPill } from '../components/StatPill';
import { WeightChart } from '../components/WeightChart';
import { GroupCard } from '../components/GroupCard';
import { GroupActionModal } from '../components/GroupActionModal';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { getCachedWeights } from '../services/cache';
import { createGroup, getUserGroups, Group, joinGroupByInvite } from '../services/groups';
import { syncWeights, WeightEntry } from '../services/weights';
import { getWeeklyStats } from '../utils/stats';
import { RootStackParamList } from '../navigation/RootNavigator';

const HomeScreen = () => {
  const { theme } = useTheme();
  const { user, profile, refreshProfile } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [weights, setWeights] = useState<WeightEntry[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [groupName, setGroupName] = useState('');
  const [inviteValue, setInviteValue] = useState('');
  const [groupError, setGroupError] = useState('');
  const [groupMessage, setGroupMessage] = useState('');
  const [creatingGroup, setCreatingGroup] = useState(false);
  const [joiningGroup, setJoiningGroup] = useState(false);
  const [groupModalVisible, setGroupModalVisible] = useState(false);
  const [groupModalMode, setGroupModalMode] = useState<'create' | 'join'>('create');

  const loadGroups = useCallback(async () => {
    if (!user) return;
    const nextGroups = await getUserGroups(user.uid);
    setGroups(nextGroups);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    getCachedWeights(user.uid).then(setWeights);
    void loadGroups();
  }, [user, loadGroups]);

  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      syncWeights(user.uid).then(setWeights);
      void loadGroups();
      void refreshProfile();
    }, [user, refreshProfile, loadGroups])
  );

  const handleCreateGroup = async () => {
    if (!user) return;
    setCreatingGroup(true);
    setGroupError('');
    setGroupMessage('');
    try {
      const nextGroup = await createGroup(user.uid, groupName);
      setGroupName('');
      setGroupMessage(`Created ${nextGroup.groupName}. Invite code ready to share.`);
      setGroupModalVisible(false);
      await loadGroups();
      navigation.navigate('GroupDetail', { groupId: nextGroup.id });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to create a group right now.';
      setGroupError(message);
    } finally {
      setCreatingGroup(false);
    }
  };

  const handleJoinGroup = async () => {
    if (!user) return;
    setJoiningGroup(true);
    setGroupError('');
    setGroupMessage('');
    try {
      const nextGroup = await joinGroupByInvite(user.uid, inviteValue);
      setInviteValue('');
      setGroupMessage(`Joined ${nextGroup.groupName}. You're in the circle now.`);
      setGroupModalVisible(false);
      await loadGroups();
      navigation.navigate('GroupDetail', { groupId: nextGroup.id });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to join that group right now.';
      setGroupError(message);
    } finally {
      setJoiningGroup(false);
    }
  };

  const stats = getWeeklyStats(weights);
  const latest = weights.length > 0 ? weights[weights.length - 1].weight : profile?.currentWeight ?? 0;

  const openGroupModal = (mode: 'create' | 'join') => {
    setGroupError('');
    setGroupModalMode(mode);
    setGroupModalVisible(true);
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={[styles.kicker, { color: theme.colors.textMuted, fontFamily: theme.fonts.body }]}>Welcome back</Text>
        <Text style={[styles.title, { color: theme.colors.text, fontFamily: theme.fonts.heading }]}>
          {profile?.name ?? 'Athlete'}
        </Text>
        <Text style={[styles.weight, { color: theme.colors.text, fontFamily: theme.fonts.bodyMedium }]}>Current {latest.toFixed(1)} kg</Text>

        <SectionCard style={styles.card}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text, fontFamily: theme.fonts.bodyMedium }]}>Weight signal</Text>
          <WeightChart weights={weights} />
          <View style={styles.statsRow}>
            <StatPill label="Weekly Avg" value={stats.avg ? stats.avg.toFixed(1) + ' kg' : '--'} />
            <StatPill label="7d Delta" value={stats.count ? stats.change.toFixed(1) + ' kg' : '--'} />
            <StatPill label="Entries" value={stats.count ? String(stats.count) : '--'} />
          </View>
        </SectionCard>

        <SectionCard style={styles.groupControlCard}>
          <Text style={[styles.modalKicker, { color: theme.colors.accentSoft, fontFamily: theme.fonts.bodyMedium }]}>Squad Link</Text>
          <Text style={[styles.modalHeadline, { color: theme.colors.text, fontFamily: theme.fonts.heading }]}>
            Crew Up Fast
          </Text>
          <Text style={[styles.sectionSub, { color: theme.colors.textMuted, fontFamily: theme.fonts.body }]}>
            Open the squad console to launch a fresh group or snap into one from an invite.
          </Text>

          <View style={styles.modalButtonRow}>
            <TouchableOpacity
              style={[styles.modalPrimary, { backgroundColor: theme.colors.accentSoft }]}
              onPress={() => openGroupModal('create')}
            >
              <Text style={[styles.modalPrimaryText, { color: theme.colors.background, fontFamily: theme.fonts.bodyMedium }]}>
                Create Group
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalSecondary, { borderColor: theme.colors.stroke, backgroundColor: theme.colors.surfaceAlt }]}
              onPress={() => openGroupModal('join')}
            >
              <Text style={[styles.modalSecondaryText, { color: theme.colors.text, fontFamily: theme.fonts.bodyMedium }]}>
                Join Group
              </Text>
            </TouchableOpacity>
          </View>

          {!!groupMessage && (
            <Text style={[styles.feedback, { color: theme.colors.accentSoft, fontFamily: theme.fonts.body }]}>
              {groupMessage}
            </Text>
          )}

          {!!groupError && (
            <Text style={[styles.feedback, { color: theme.colors.energy, fontFamily: theme.fonts.body }]}>
              {groupError}
            </Text>
          )}
        </SectionCard>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text, fontFamily: theme.fonts.bodyMedium }]}>Groups</Text>
          <Text style={[styles.sectionSub, { color: theme.colors.textMuted, fontFamily: theme.fonts.body }]}>Progress together</Text>
        </View>

        {groups.length === 0 ? (
          <View style={[styles.emptyGroup, { borderColor: theme.colors.stroke }]}> 
            <Text style={[styles.emptyText, { color: theme.colors.textMuted, fontFamily: theme.fonts.body }]}>No groups yet. Create or join one to start tracking together.</Text>
          </View>
        ) : (
          groups.map((group) => (
            <GroupCard
              key={group.id}
              group={group}
              onPress={() => navigation.navigate('GroupDetail', { groupId: group.id })}
            />
          ))
        )}
      </ScrollView>

      <GroupActionModal
        visible={groupModalVisible}
        mode={groupModalMode}
        onModeChange={setGroupModalMode}
        onClose={() => setGroupModalVisible(false)}
        groupName={groupName}
        inviteValue={inviteValue}
        onChangeGroupName={setGroupName}
        onChangeInviteValue={setInviteValue}
        onCreate={() => void handleCreateGroup()}
        onJoin={() => void handleJoinGroup()}
        creatingGroup={creatingGroup}
        joiningGroup={joiningGroup}
        error={groupError}
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    paddingBottom: 120,
  },
  kicker: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  title: {
    fontSize: 44,
  },
  weight: {
    fontSize: 16,
    marginTop: 4,
  },
  card: {
    marginTop: 20,
  },
  groupControlCard: {
    marginTop: 20,
  },
  modalKicker: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  modalHeadline: {
    fontSize: 34,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 16,
  },
  sectionHeader: {
    marginTop: 28,
    marginBottom: 12,
  },
  sectionSub: {
    fontSize: 12,
    marginTop: 4,
  },
  modalButtonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },
  modalPrimary: {
    flex: 1,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
  },
  modalPrimaryText: {
    fontSize: 13,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  modalSecondary: {
    flex: 1,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
  },
  modalSecondaryText: {
    fontSize: 13,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  feedback: {
    marginTop: 12,
    fontSize: 12,
    lineHeight: 18,
  },
  emptyGroup: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
  },
  emptyText: {
    fontSize: 13,
    lineHeight: 18,
  },
});

export default HomeScreen;
