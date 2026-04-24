import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { GoogleAuthProvider, signInWithCredential, signOut as firebaseSignOut } from 'firebase/auth';
import { Platform } from 'react-native';
import { auth } from './firebase';

export const signInWithGoogle = async (idToken: string, accessToken?: string) => {
  const credential = GoogleAuthProvider.credential(idToken, accessToken);
  return signInWithCredential(auth, credential);
};

let googleConfigured = false;

export const configureGoogleSignIn = () => {
  if (Platform.OS === 'web' || googleConfigured) {
    return;
  }

  GoogleSignin.configure({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  });

  googleConfigured = true;
};

export const signInWithGoogleNative = async () => {
  if (Platform.OS === 'web') {
    throw new Error('Native Google sign-in is only available on iOS and Android.');
  }

  configureGoogleSignIn();
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  await GoogleSignin.signIn();
  const { idToken, accessToken } = await GoogleSignin.getTokens();

  if (!idToken) {
    throw new Error('Google sign-in returned no ID token.');
  }

  return signInWithGoogle(idToken, accessToken);
};

export const signOut = async () => {
  if (Platform.OS !== 'web') {
    try {
      await GoogleSignin.signOut();
    } catch {
      // Ignore Google session cleanup failures and always clear Firebase auth.
    }
  }

  return firebaseSignOut(auth);
};
