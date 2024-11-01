import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyAbp7iv9pO5Oyvcg9CNxlD-S8wQSSTTQIA",
  authDomain: "spendo-93ece.firebaseapp.com",
  projectId: "spendo-93ece",
  storageBucket: "spendo-93ece.firebasestorage.app",
  messagingSenderId: "1057274457534",
  appId: "1:1057274457534:web:62b701d891c77d64a85def",
};

const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication with persistence
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// Initialize Firestore
export const db = getFirestore(app);
