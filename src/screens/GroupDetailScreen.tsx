import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Share } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { Screen } from '../components/Screen';
import { SectionCard } from '../components/SectionCard';
import { WeightSparkline } from '../components/WeightSparkline';
import { useTheme } from '../context/ThemeContext';
import { getGroupById, Group } from '../services/groups';
import { getUsersByIds, UserProfile } from '../services/users';
import { fetchRecentWeights, WeightEntry } from '../services/weights';
import { RootStackParamList } from '../navigation/RootNavigator';

const GroupDetailScreen = () => {
  const { theme } = useTheme();
  const route = useRoute<RouteProp<RootStackParamList, 'GroupDetail'>>();
  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<{ profile: UserProfile; weights: WeightEntry[] }[]>([]);
  const [memberError, setMemberError] = useState('');

  useEffect(() => {
    const load = async () => {
      setMemberError('');
      try {
        const groupData = await getGroupById(route.params.groupId);
        if (!groupData) return;
        setGroup(groupData);

        const profiles = await getUsersByIds(groupData.users);
        const settledWeights = await Promise.allSettled(
          profiles.map(async (profile) => ({
            profile,
            weights: await fetchRecentWeights(profile.userId, 7),
          }))
        );

        const enriched = settledWeights
          .filter(
            (
              result
            ): result is PromiseFulfilledResult<{ profile: UserProfile; weights: WeightEntry[] }> =>
              result.status === 'fulfilled'
          )
          .map((result) => result.value);

        const failedCount = settledWeights.length - enriched.length;
        if (failedCount > 0) {
          setMemberError(
            failedCount === profiles.length
              ? 'Member stats are blocked right now. This is usually a Firestore permissions issue.'
              : 'Some member stats could not be loaded. Check Firestore permissions for shared group reads.'
          );
        }

        setMembers(enriched);
      } catch (error) {
        console.warn('Unable to load group member stats', error);
        setMembers([]);
        setMemberError('Member stats are blocked right now. This is usually a Firestore permissions issue.');
      }
    };
    void load();
  }, [route.params.groupId]);

  const handleShare = async () => {
    const link = group?.inviteLink || `thadi2://groups/${group?.id}`;
    await Share.share({ message: `Join my THADI2 group: ${link}` });
  };

  if (!group) {
    return (
      <Screen>
        <View style={styles.loading}>
          <Text style={[styles.loadingText, { color: theme.colors.textMuted, fontFamily: theme.fonts.body }]}>Loading group...</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { color: theme.colors.text, fontFamily: theme.fonts.heading }]}>{group.groupName}</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textMuted, fontFamily: theme.fonts.body }]}>Group pulse and member stats.</Text>
        <Text style={[styles.inviteCode, { color: theme.colors.text, fontFamily: theme.fonts.bodyMedium }]}>
          Invite code {group.inviteCode ?? group.id}
        </Text>
        <Text style={[styles.memberCount, { color: theme.colors.textMuted, fontFamily: theme.fonts.body }]}>
          {group.users.length} member{group.users.length === 1 ? '' : 's'} in this squad
        </Text>

        <TouchableOpacity style={[styles.share, { borderColor: theme.colors.stroke }]} onPress={handleShare}>
          <Text style={[styles.shareText, { color: theme.colors.text, fontFamily: theme.fonts.bodyMedium }]}>Share Invite Link</Text>
        </TouchableOpacity>

        {!!memberError && (
          <Text style={[styles.error, { color: theme.colors.energy, fontFamily: theme.fonts.body }]}>
            {memberError}
          </Text>
        )}

        {members.map(({ profile, weights }) => (
          <SectionCard key={profile.userId} style={styles.memberCard}>
            <View style={styles.memberRow}>
              <View>
                <Text style={[styles.memberName, { color: theme.colors.text, fontFamily: theme.fonts.bodyMedium }]}>{profile.name}</Text>
                <Text style={[styles.memberWeight, { color: theme.colors.textMuted, fontFamily: theme.fonts.body }]}>Current {profile.currentWeight.toFixed(1)} kg</Text>
              </View>
              <WeightSparkline weights={weights} />
            </View>
          </SectionCard>
        ))}
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    paddingBottom: 120,
  },
  title: {
    fontSize: 36,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  inviteCode: {
    fontSize: 13,
    marginTop: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  memberCount: {
    fontSize: 12,
    marginTop: 8,
  },
  share: {
    marginTop: 18,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
  },
  shareText: {
    fontSize: 13,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  memberCard: {
    marginTop: 16,
  },
  error: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 14,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  memberName: {
    fontSize: 16,
  },
  memberWeight: {
    fontSize: 12,
    marginTop: 6,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
  },
});

export default GroupDetailScreen;
