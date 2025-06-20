import { getAuth, initializeAuth } from 'firebase/auth';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Try to import AsyncStorage only if we're in a React Native environment
let AsyncStorage;
let getReactNativePersistence;

try {
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
  getReactNativePersistence = require('firebase/auth').getReactNativePersistence;
} catch (e) {
  console.log("Not in React Native environment, skipping AsyncStorage");
}

const firebaseConfig = {
  apiKey: "AIzaSyBPTcPxSPDfJndQcicio2Xb5Ak4PE5j_4E",
  authDomain: "student-connect-app-d52f1.firebaseapp.com",
  databaseURL: "https://student-connect-app-d52f1-default-rtdb.firebaseio.com",
  projectId: "student-connect-app-d52f1",
  messagingSenderId: "1076535842721",
  appId: "1:1076535842721:web:89dfd4fca2335e1ba59de0",
  measurementId: "G-6SK2ZWEMQW"
};

// Initialize Firebase app with proper error handling
let app;
try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  console.log("Firebase app initialized successfully, app count:", getApps().length);
} catch (error) {
  console.error("Firebase app initialization error:", error);
  throw new Error("Failed to initialize Firebase: " + error.message);
}

// Initialize auth based on environment
let auth;
try {
  if (AsyncStorage && getReactNativePersistence) {
    // In React Native environment
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage)
    });
    console.log("Auth initialized with React Native persistence");
  } else {
    // In web or other environment
    auth = getAuth(app);
    console.log("Auth initialized with default persistence");
  }
} catch (error) {
  console.error("Auth initialization error:", error);
  auth = getAuth(app); // fallback to default
  console.log("Falling back to default auth initialization");
}

// Initialize Firestore for chat functionality only
let db;
try {
  db = getFirestore(app);
  console.log("Firestore initialized successfully");
} catch (error) {
  console.error("Firestore initialization error:", error);
  throw new Error("Failed to initialize Firestore: " + error.message);
}

// Export services (no storage needed for text-only chat)
export { auth, db, app };

// Safe wrapper for Firebase operations
export const monitorNewMessages = (userId) => {
  try {
    // This is a placeholder for Firebase messaging
    // Since we're using Supabase for main functionality, 
    // we'll only keep Firebase for existing chat features
    console.log('Firebase messaging monitoring for user:', userId);
    // Add actual Firebase messaging logic here if needed
  } catch (error) {
    console.warn('Firebase messaging not available:', error.message);
  }
};