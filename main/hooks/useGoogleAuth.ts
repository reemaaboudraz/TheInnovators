import Constants from "expo-constants";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { auth } from "@/firebase/firebase";

const { googleWebClientId, googleIosClientId } =
  Constants.expoConfig?.extra ?? {};
export function configureGoogleSignIn() {
  if (!googleWebClientId) {
    throw new Error("Missing googleWebClientId in expo.extra");
  }

  GoogleSignin.configure({
    webClientId: googleWebClientId,
    iosClientId: googleIosClientId,
  });
}

export async function signInWithGoogle() {
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

  await GoogleSignin.signIn();
  const { idToken } = await GoogleSignin.getTokens();
  if (!idToken) throw new Error("Google Sign-In: missing idToken");

  const credential = GoogleAuthProvider.credential(idToken);
  return signInWithCredential(auth, credential);
}

export async function signOutGoogle() {
  await GoogleSignin.signOut();
  await auth.signOut();
}
