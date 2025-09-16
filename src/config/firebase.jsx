import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBV2Q-_nJIcRHGUbhtwu8eKN9UAeaPvwQw",
  authDomain: "fir-authentication-8abb6.firebaseapp.com",
  projectId: "fir-authentication-8abb6",
  storageBucket: "fir-authentication-8abb6.appspot.com",
  messagingSenderId: "854259513422",
  appId: "1:854259513422:web:9a3d38f04501b643f0ab1f"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);

export { auth, provider, signInWithPopup, signOut, db, setDoc, doc, getDoc };
