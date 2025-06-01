// // import { initializeApp } from 'firebase/app';
// // import { getFirestore,collection } from 'firebase/firestore';

// // // export const auth = getAuth(app);  

// // const firebaseConfig = {
//   //   apiKey: "AIzaSyBPTcPxSPDfJndQcicio2Xb5Ak4PE5j_4E",
//   //   authDomain: "student-connect-app-d52f1.firebaseapp.com",
//   //   databaseURL: "https://student-connect-app-d52f1-default-rtdb.firebaseio.com",
//   //   projectId: "student-connect-app-d52f1",
//   //   // storageBucket: "student-connect-app-d52f1.firebasestorage.app",
//   //   storageBucket: "student-connect-app-d52f1.appspot.com", // Corrected URL
//   //   messagingSenderId: "1076535842721",
//   //   appId: "1:1076535842721:web:89dfd4fca2335e1ba59de0",
//   //   measurementId: "G-6SK2ZWEMQW"
//   // };

//   import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
// import { initializeApp, getApps, getApp } from 'firebase/app';
// import { getFirestore, collection ,onSnapshot, doc, getDoc, getDocs, addDoc, updateDoc, arrayUnion, arrayRemove, where,deleteDoc, Timestamp, query, orderBy, serverTimestamp, setDoc,} from 'firebase/firestore';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { get } from 'react-native/Libraries/TurboModule/TurboModuleRegistry';
// import { getStorage } from 'firebase/storage';
// // import { getReactNativePersistence } from 'firebase/auth/react-native';
// // Your Firebase configuration
// // const firebaseConfig = {
// //     apiKey: "AIzaSyBPTcPxSPDfJndQcicio2Xb5Ak4PE5j_4E",
// //     authDomain: "student-connect-app-d52f1.firebaseapp.com",
// //     databaseURL: "https://student-connect-app-d52f1-default-rtdb.firebaseio.com",
// //     projectId: "student-connect-app-d52f1",
// //     storageBucket: "student-connect-app-d52f1.firebasestorage.app",
// //     messagingSenderId: "1076535842721",
// //     appId: "1:1076535842721:web:89dfd4fca2335e1ba59de0",
// //     measurementId: "G-6SK2ZWEMQW"
// // };
// // Import the functions you need from the SDKs you need
// // import { initializeApp } from "firebase/app";
// // TODO: Add SDKs for Firebase products that you want to use
// // https://firebase.google.com/docps/web/setup#available-libraries

// // Your web app's Firebase configuration
// // const firebaseConfig = {
// //   apiKey: "AIzaSyBrbvx1N_ftZbcsssKPYFol4ojW5AepfN8",
// //   authDomain: "authentication-f38ff.firebaseapp.com",
// //   projectId: "authentication-f38ff",
// //   storageBucket: "authentication-f38ff.firebasestorage.app",
// //   messagingSenderId: "254564561261",
// //   appId: "1:254564561261:web:8328dfb9f8cd9a9d84ea64"
// // };

// // Initialize Firebase
// // const app = initializeApp(firebaseConfig);

// // Initialize Firebase with error handling

// const firebaseConfig = {
//   apiKey: "AIzaSyBPTcPxSPDfJndQcicio2Xb5Ak4PE5j_4E",
//   authDomain: "student-connect-app-d52f1.firebaseapp.com",
//   databaseURL: "https://student-connect-app-d52f1-default-rtdb.firebaseio.com",
//   projectId: "student-connect-app-d52f1",
//   storageBucket: "student-connect-app-d52f1.firebasestorage.app",
//   messagingSenderId: "1076535842721",
//   appId: "1:1076535842721:web:89dfd4fca2335e1ba59de0",
//   measurementId: "G-6SK2ZWEMQW"
// };
// const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
// console.log("app", getApps().length) 
// // const auth = initializeAuth(app, {
// //     persistence: getReactNativePersistence(AsyncStorage)
// // })
// let auth;

// try {
//   auth = initializeAuth(app, {
//     persistence: getReactNativePersistence(AsyncStorage)
//   });
// } catch (error) {
//   console.warn("Auth init error:", error.message);
//   auth = getAuth(app); // fallback to default if initializeAuth fails
// }

// console.log("auth", auth,getApps().length)
// // Initialize Firebase services
// const db = getFirestore(app);


// export const storage= getStorage(app);
// // Export initialization function and service instances
// export { auth, db };
// // B8:43:66:7E:A5:B4:DE:7C:1F:DD:71:E3:41:9B:FC:E4:30:82:CF:20


import { getAuth, initializeAuth } from 'firebase/auth';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

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
  storageBucket: "student-connect-app-d52f1.firebasestorage.app",
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

// Initialize other Firebase services
const db = getFirestore(app);
const storage = getStorage(app);

// Export services
export { auth, db, storage, app };