import React from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

type GroupActionMode = 'create' | 'join';

type Props = {
  visible: boolean;
  mode: GroupActionMode;
  onModeChange: (mode: GroupActionMode) => void;
  onClose: () => void;
  groupName: string;
  inviteValue: string;
  onChangeGroupName: (value: string) => void;
  onChangeInviteValue: (value: string) => void;
  onCreate: () => void;
  onJoin: () => void;
  creatingGroup: boolean;
  joiningGroup: boolean;
  error: string;
};

export const GroupActionModal: React.FC<Props> = ({
  visible,
  mode,
  onModeChange,
  onClose,
  groupName,
  inviteValue,
  onChangeGroupName,
  onChangeInviteValue,
  onCreate,
  onJoin,
  creatingGroup,
  joiningGroup,
  error,
}) => {
  const { theme } = useTheme();
  const isCreate = mode === 'create';

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.scrim, { backgroundColor: theme.mode === 'dark' ? 'rgba(5, 8, 10, 0.84)' : 'rgba(16, 18, 20, 0.22)' }]} />

        <View style={[styles.shell, { borderColor: theme.colors.stroke, backgroundColor: theme.colors.surface }]}>
          <View style={[styles.orb, { borderColor: theme.colors.stroke }]} />

          <View style={styles.topRow}>
            <View>
              <Text style={[styles.kicker, { color: theme.colors.accentSoft, fontFamily: theme.fonts.bodyMedium }]}>
                Squad Mode
              </Text>
              <Text style={[styles.title, { color: theme.colors.text, fontFamily: theme.fonts.heading }]}>
                {isCreate ? 'Build The Circle' : 'Enter The Circle'}
              </Text>
            </View>

            <TouchableOpacity
              accessibilityRole="button"
              onPress={onClose}
              style={[styles.closeButton, { borderColor: theme.colors.stroke, backgroundColor: theme.colors.surfaceAlt }]}
            >
              <Text style={[styles.closeLabel, { color: theme.colors.text, fontFamily: theme.fonts.bodyMedium }]}>Close</Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.subtitle, { color: theme.colors.textMuted, fontFamily: theme.fonts.body }]}>
            {isCreate
              ? 'Name the crew, lock the link, and move as one.'
              : 'Paste an invite code or link and drop straight into the squad.'}
          </Text>

          <View style={[styles.modeRail, { borderColor: theme.colors.stroke, backgroundColor: theme.colors.surfaceAlt }]}>
            <TouchableOpacity
              accessibilityRole="button"
              style={[
                styles.modeButton,
                isCreate && { backgroundColor: theme.colors.accentSoft },
              ]}
              onPress={() => onModeChange('create')}
            >
              <Text
                style={[
                  styles.modeLabel,
                  {
                    color: isCreate ? theme.colors.background : theme.colors.text,
                    fontFamily: theme.fonts.bodyMedium,
                  },
                ]}
              >
                Create
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              accessibilityRole="button"
              style={[
                styles.modeButton,
                !isCreate && { backgroundColor: theme.colors.accentSoft },
              ]}
              onPress={() => onModeChange('join')}
            >
              <Text
                style={[
                  styles.modeLabel,
                  {
                    color: !isCreate ? theme.colors.background : theme.colors.text,
                    fontFamily: theme.fonts.bodyMedium,
                  },
                ]}
              >
                Join
              </Text>
            </TouchableOpacity>
          </View>

          {isCreate ? (
            <>
              <TextInput
                value={groupName}
                onChangeText={onChangeGroupName}
                placeholder="Name your squad"
                placeholderTextColor={theme.colors.textMuted}
                style={[
                  styles.input,
                  {
                    color: theme.colors.text,
                    borderColor: theme.colors.stroke,
                    backgroundColor: theme.colors.surfaceAlt,
                    fontFamily: theme.fonts.body,
                  },
                ]}
              />

              <TouchableOpacity
                accessibilityRole="button"
                disabled={creatingGroup}
                style={[
                  styles.primaryButton,
                  { backgroundColor: theme.colors.accentSoft, opacity: creatingGroup ? 0.72 : 1 },
                ]}
                onPress={onCreate}
              >
                <Text style={[styles.primaryLabel, { color: theme.colors.background, fontFamily: theme.fonts.bodyMedium }]}>
                  {creatingGroup ? 'Creating...' : 'Create Group'}
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TextInput
                value={inviteValue}
                onChangeText={onChangeInviteValue}
                placeholder="Paste invite code or thadi2:// link"
                placeholderTextColor={theme.colors.textMuted}
                autoCapitalize="none"
                autoCorrect={false}
                style={[
                  styles.input,
                  {
                    color: theme.colors.text,
                    borderColor: theme.colors.stroke,
                    backgroundColor: theme.colors.surfaceAlt,
                    fontFamily: theme.fonts.body,
                  },
                ]}
              />

              <TouchableOpacity
                accessibilityRole="button"
                disabled={joiningGroup}
                style={[
                  styles.primaryButton,
                  { backgroundColor: theme.colors.text, opacity: joiningGroup ? 0.72 : 1 },
                ]}
                onPress={onJoin}
              >
                <Text style={[styles.primaryLabel, { color: theme.colors.background, fontFamily: theme.fonts.bodyMedium }]}>
                  {joiningGroup ? 'Joining...' : 'Join With Invite'}
                </Text>
              </TouchableOpacity>
            </>
          )}

          {!!error && (
            <Text style={[styles.error, { color: theme.colors.energy, fontFamily: theme.fonts.body }]}>
              {error}
            </Text>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
  },
  shell: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderWidth: 1,
    paddingHorizontal: 22,
    paddingTop: 22,
    paddingBottom: 30,
    overflow: 'hidden',
  },
  orb: {
    position: 'absolute',
    top: -110,
    right: -80,
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 1,
    opacity: 0.16,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  kicker: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  title: {
    fontSize: 42,
    marginTop: 6,
  },
  closeButton: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  closeLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 20,
    marginTop: 10,
    maxWidth: '88%',
  },
  modeRail: {
    marginTop: 22,
    borderWidth: 1,
    borderRadius: 20,
    padding: 4,
    flexDirection: 'row',
    gap: 6,
  },
  modeButton: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  modeLabel: {
    fontSize: 12,
    letterSpacing: 1.3,
    textTransform: 'uppercase',
  },
  input: {
    marginTop: 18,
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 14,
  },
  primaryButton: {
    marginTop: 14,
    borderRadius: 18,
    alignItems: 'center',
    paddingVertical: 16,
  },
  primaryLabel: {
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  error: {
    marginTop: 14,
    fontSize: 12,
    lineHeight: 18,
  },
});
