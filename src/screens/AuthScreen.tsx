import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { Screen } from '../components/Screen';
import { useTheme } from '../context/ThemeContext';
import { configureGoogleSignIn, signInWithGoogle, signInWithGoogleNative } from '../services/auth';

WebBrowser.maybeCompleteAuthSession();

const AuthCard = ({
  error,
  onPress,
  buttonDisabled,
}: {
  error: string;
  onPress: () => void;
  buttonDisabled?: boolean;
}) => {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.colors.text, fontFamily: theme.fonts.heading }]}>THADI2</Text>
      <Text style={[styles.subtitle, { color: theme.colors.textMuted, fontFamily: theme.fonts.body }]}>Track. Align. Rise.</Text>

      <View style={[styles.panel, { backgroundColor: theme.colors.surface, borderColor: theme.colors.stroke }]}>
        <Text style={[styles.panelTitle, { color: theme.colors.text, fontFamily: theme.fonts.bodyMedium }]}>Unlock your signal</Text>
        <Text style={[styles.panelBody, { color: theme.colors.textMuted, fontFamily: theme.fonts.body }]}>
          Sign in with Google to start logging weight and progress with your groups.
        </Text>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.colors.accent }]}
          disabled={buttonDisabled}
          onPress={onPress}
        >
          <Text style={[styles.buttonText, { color: theme.colors.background, fontFamily: theme.fonts.bodyMedium }]}>
            Continue with Google
          </Text>
        </TouchableOpacity>

        {!!error && (
          <Text style={[styles.error, { color: theme.colors.energy, fontFamily: theme.fonts.body }]}>{error}</Text>
        )}
      </View>
    </View>
  );
};

const NativeAuthScreen = () => {
  const [error, setError] = useState('');

  useEffect(() => {
    configureGoogleSignIn();
  }, []);

  const handleSignIn = async () => {
    if (!process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID) {
      setError('Missing Google Web client ID. Check your Expo public env vars.');
      return;
    }

    setError('');

    try {
      await signInWithGoogleNative();
    } catch (nextError) {
      const message = nextError instanceof Error ? nextError.message : 'Unable to sign in. Please try again.';
      setError(message);
    }
  };

  return (
    <Screen>
      <AuthCard error={error} onPress={() => void handleSignIn()} />
    </Screen>
  );
};

const WebAuthScreen = () => {
  const [error, setError] = useState('');
  const expoClientId = process.env.EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID;
  const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;

  const config = useMemo(
    () => ({
      expoClientId,
      webClientId,
      responseType: 'id_token' as const,
      scopes: ['openid', 'profile', 'email'],
      selectAccount: true,
      redirectUri: AuthSession.makeRedirectUri(),
    }),
    [expoClientId, webClientId]
  );

  const [request, response, promptAsync] = Google.useAuthRequest(config);

  useEffect(() => {
    if (response?.type === 'success') {
      const { idToken, accessToken } = response.authentication || {};
      if (!idToken) {
        setError('Google auth succeeded but returned no ID token. Check client IDs.');
        return;
      }

      signInWithGoogle(idToken, accessToken).catch(() => {
        setError('Unable to sign in. Please try again.');
      });
    }
  }, [response]);

  const handleSignIn = () => {
    if (!webClientId && !expoClientId) {
      setError('Missing Google Web client ID. Check your Expo public env vars.');
      return;
    }

    setError('');
    void promptAsync();
  };

  return (
    <Screen>
      <AuthCard error={error} onPress={handleSignIn} buttonDisabled={!request} />
    </Screen>
  );
};

const AuthScreen = () => {
  return Platform.OS === 'web' ? <WebAuthScreen /> : <NativeAuthScreen />;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 52,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 16,
    marginTop: 6,
  },
  panel: {
    marginTop: 32,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
  },
  panelTitle: {
    fontSize: 18,
  },
  panelBody: {
    fontSize: 14,
    marginTop: 8,
    lineHeight: 20,
  },
  button: {
    marginTop: 20,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 14,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  error: {
    marginTop: 12,
    fontSize: 12,
  },
});

export default AuthScreen;
