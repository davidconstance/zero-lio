// import the functions needed from the SDKs
import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signOut,
  signInWithEmailAndPassword,
  getIdToken,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";

// web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAWEp92KogXBS8uebXcZJZTqz2EulwW_p8",
  authDomain: "zero-lio-422ea.firebaseapp.com",
  projectId: "zero-lio-422ea",
  storageBucket: "zero-lio-422ea.firebasestorage.app",
  messagingSenderId: "271981909282",
  appId: "1:271981909282:web:0dcc59f4c7b05d638a417b",
  measurementId: "G-5V8KWJNPVS",
};

// initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth, onAuthStateChanged };

export async function registerUser(email: string, password: string) {
  // create user with email and password thru firebase
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;
    return user;
  } catch (error: unknown) {
    console.error("error creating account", error);
    throw error;
  }
}

export async function logInUser(email: string, password: string) {
  // sign in with email and password thru firebase
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;
    return user;
  } catch (error: unknown) {
    console.error(`error logging in account ${email}`, error);
    throw error;
  }
}

export async function logOutUser() {
  // call signOut on auth instance
  try {
    await signOut(auth);
  } catch (error: unknown) {
    console.error("error signing out", error);
    throw error;
  }
}

export async function getUserId(forceRefresh = false) {
  // get current user's ID token
  const user = auth.currentUser;
  if (user) {
    try {
      const token = await getIdToken(user, forceRefresh);
      return token;
    } catch (error: unknown) {
      console.error("error getting user ID", error);
      throw error;
    }
  }
}

export async function updateUserInfo(displayName: string) {
  const user = auth.currentUser;
  if (user) {
    try {
      await updateProfile(user, { displayName: displayName });
    } catch (error: unknown) {
      console.error("error updating profile", error);
      throw error;
    }
  }
}
