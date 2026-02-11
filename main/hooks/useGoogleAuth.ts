import Constants from "expo-constants";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { auth } from "@/firebase/firebase";

// Only load native Google Sign-In when not in Expo Go (native module isn't available there)
const isExpoGo = Constants.appOwnership === "expo";
let GoogleSignin: typeof import("@react-native-google-signin/google-signin").GoogleSignin | null =
  null;
if (!isExpoGo) {
  try {
    GoogleSignin = require("@react-native-google-signin/google-signin")
      .GoogleSignin;
  } catch {
    GoogleSignin = null;
  }
}

const { googleWebClientId, googleIosClientId } =
  Constants.expoConfig?.extra ?? {};

export function configureGoogleSignIn() {
  if (!GoogleSignin) return;
  if (!googleWebClientId) {
    throw new Error("Missing googleWebClientId in expo.extra");
  }
  GoogleSignin.configure({
    webClientId: googleWebClientId,
    iosClientId: googleIosClientId,
  });
}

export async function signInWithGoogle() {
  if (!GoogleSignin) {
    throw new Error(
      "Google Sign-In is not available in Expo Go. Use a development build (npx expo run:ios or run:android) to sign in with Google."
    );
  }
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  await GoogleSignin.signIn();
  const { idToken } = await GoogleSignin.getTokens();
  if (!idToken) throw new Error("Google Sign-In: missing idToken");
  const credential = GoogleAuthProvider.credential(idToken);
  return signInWithCredential(auth, credential);
}

export async function signOutGoogle() {
  if (!GoogleSignin) return;
  await GoogleSignin.signOut();
  await auth.signOut();
}
