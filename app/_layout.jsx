// import React, { useEffect, useState, createContext, useContext } from 'react';
// import { AppState, StatusBar, Text } from 'react-native';
// import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
// import { db, auth } from '../config/firebaseConfig';
// import { useSegments, useRouter, Slot, Stack } from 'expo-router';
// import AuthContextProvider, { useAuth } from '../context/authContext';
// import ErrorBoundary from '../components/ErrorBoundary';
// import { usePushNotifications } from '../hooks/usePushNotifications';
// import '../global.css';
// import { ThemeProvider, useTheme } from "../context/ThemeContext"
// import * as Font from 'expo-font';

// // Font context and provider
// const FontContext = createContext({ loaded: false });
// export function useFont() {
//   return useContext(FontContext);
// }

// export function AppText(props) {
//   const { loaded } = useFont();
//   return <Text {...props} style={[{ fontFamily: loaded ? 'GeneralSans-Regular' : undefined }, props.style]}>{props.children}</Text>;
// }

// function FontProvider({ children }) {
//   const [loaded, setLoaded] = useState(false);
//   useEffect(() => {
//     Font.loadAsync({
//       'GeneralSans-Regular': require('../assets/fonts/GeneralSans-Regular.otf'),
//       'GeneralSans-Medium': require('../assets/fonts/GeneralSans-Medium.otf'),
//       'GeneralSans-SemiBold': require('../assets/fonts/GeneralSans-Semibold.otf'),
//       'GeneralSans-Bold': require('../assets/fonts/GeneralSans-Bold.otf'),
//       'GeneralSans-Light': require('../assets/fonts/GeneralSans-Light.otf'),
//       'GeneralSans-Extralight': require('../assets/fonts/GeneralSans-Extralight.otf'),
//       'GeneralSans-Italic': require('../assets/fonts/GeneralSans-Italic.otf'),
//       'GeneralSans-MediumItalic': require('../assets/fonts/GeneralSans-MediumItalic.otf'),
//       'GeneralSans-SemiboldItalic': require('../assets/fonts/GeneralSans-SemiboldItalic.otf'),
//       'GeneralSans-BoldItalic': require('../assets/fonts/GeneralSans-BoldItalic.otf'),
//       'GeneralSans-LightItalic': require('../assets/fonts/GeneralSans-LightItalic.otf'),
//       'GeneralSans-ExtralightItalic': require('../assets/fonts/GeneralSans-ExtralightItalic.otf'),
//     }).then(() => setLoaded(true));
//   }, []);
//   return <FontContext.Provider value={{ loaded }}>{children}</FontContext.Provider>;
// }

// function RootLayoutNav() {
//   const { isAuthenticated, user } = useAuth();
//   const segments = useSegments();
//   const router = useRouter();
  
//   // Initialize push notifications hook
//   usePushNotifications();

//   useEffect(() => {
//     if (typeof isAuthenticated === 'undefined') return;
//     const inApp = segments[0] === '(root)';
//     if (isAuthenticated && !inApp) {
//       router.replace('(root)/home');
//     } else if (isAuthenticated === false) {
//       router.replace('signin');
//     }
//   }, [isAuthenticated]);

//   useEffect(() => {
//     if (!user) return;

//     const userRef = doc(db, 'users', user.uid);

//     const subscription = AppState.addEventListener('change', (nextAppState) => {
//       const isOnline = nextAppState === 'active';
//       updateDoc(userRef, {
//         isOnline,
//         lastSeen: serverTimestamp(),
//       }, { merge: true }).catch(console.error);
//     });

//     return () => {
//       subscription.remove();
//       updateDoc(userRef, {
//         isOnline: false,
//         lastSeen: serverTimestamp(),
//       }, { merge: true }).catch(console.error);
//     };
//   }, [user]);

//   return (
//     <>
//       <Stack>
//         <Stack.Screen name="index" options={{ headerShown: false }} />
//         <Stack.Screen name="(auth)" options={{ headerShown: false }} />
//         <Stack.Screen name="(root)" options={{ headerShown: false }} />
//       </Stack>
//       <StatusBar style="auto" />
//     </>
//   );
// }

// export default function RootLayout() {
//   return (
//     <FontProvider>
//       <AuthContextProvider>
//         <ThemeProvider>
//           <ErrorBoundary>
//             <RootLayoutNav />
//           </ErrorBoundary>
//         </ThemeProvider>
//       </AuthContextProvider>
//     </FontProvider>
//   );
// }

import React, { useEffect, useState, createContext, useContext } from 'react';
import { AppState, StatusBar, Text } from 'react-native';
// Temporarily disabled Firebase imports during onboarding transition
// import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
// import { db } from '../config/firebaseConfig';
import { useSegments, useRouter, Stack } from 'expo-router';
import AuthContextProvider, { useAuth } from '../context/authContext';
import ErrorBoundary from '../components/ErrorBoundary';
import { usePushNotifications } from '../hooks/usePushNotifications';
import '../global.css';
import { ThemeProvider } from "../context/ThemeContext"
import * as Font from 'expo-font';

// Font context and provider
const FontContext = createContext({ loaded: false });
export function useFont() {
  return useContext(FontContext);
}

export function AppText(props) {
  const { loaded } = useFont();
  return <Text {...props} style={[{ fontFamily: loaded ? 'GeneralSans-Regular' : undefined }, props.style]}>{props.children}</Text>;
}

function FontProvider({ children }) {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    Font.loadAsync({
      'GeneralSans-Regular': require('../assets/fonts/GeneralSans-Regular.otf'),
      'GeneralSans-Medium': require('../assets/fonts/GeneralSans-Medium.otf'),
      'GeneralSans-SemiBold': require('../assets/fonts/GeneralSans-Semibold.otf'),
      'GeneralSans-Bold': require('../assets/fonts/GeneralSans-Bold.otf'),
      'GeneralSans-Light': require('../assets/fonts/GeneralSans-Light.otf'),
      'GeneralSans-Extralight': require('../assets/fonts/GeneralSans-Extralight.otf'),
      'GeneralSans-Italic': require('../assets/fonts/GeneralSans-Italic.otf'),
      'GeneralSans-MediumItalic': require('../assets/fonts/GeneralSans-MediumItalic.otf'),
      'GeneralSans-SemiboldItalic': require('../assets/fonts/GeneralSans-SemiboldItalic.otf'),
      'GeneralSans-BoldItalic': require('../assets/fonts/GeneralSans-BoldItalic.otf'),
      'GeneralSans-LightItalic': require('../assets/fonts/GeneralSans-LightItalic.otf'),
      'GeneralSans-ExtralightItalic': require('../assets/fonts/GeneralSans-ExtralightItalic.otf'),
    }).then(() => setLoaded(true));
  }, []);
  return <FontContext.Provider value={{ loaded }}>{children}</FontContext.Provider>;
}

function RootLayoutNav() {
  const { isAuthenticated, user, isProfileComplete } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  
  // Initialize push notifications hook
  usePushNotifications();

  useEffect(() => {
    if (typeof isAuthenticated === 'undefined') return;
    
    const inApp = segments[0] === '(root)';
    const inAuth = segments[0] === '(auth)';
    
    if (isAuthenticated && !inApp && !inAuth) {
      // If authenticated but not in app or auth, check profile completion
      if (isProfileComplete === false) {
        router.replace('/(auth)/onboarding');
      } else if (isProfileComplete === true) {
        router.replace('/(root)/(tabs)/home');
      }
    } else if (isAuthenticated === false) {
      router.replace('/(auth)/signin');
    }
  }, [isAuthenticated, user, isProfileComplete]);

  // Disabled Firebase user status updates during onboarding transition
  // TODO: Re-enable after migrating user status to Supabase
  useEffect(() => {
    if (!user || !isProfileComplete) return; // Only update status for complete profiles
    
    // Skip Firebase updates during onboarding to prevent document errors
    console.log('User status updates disabled during onboarding transition');
    
    // Uncomment below when ready to migrate user status to Supabase
    /*
    const userRef = doc(db, 'users', user.uid);

    const subscription = AppState.addEventListener('change', (nextAppState) => {
      const isOnline = nextAppState === 'active';
      updateDoc(userRef, {
        isOnline,
        lastSeen: serverTimestamp(),
      }, { merge: true }).catch(console.error);
    });

    return () => {
      subscription.remove();
      updateDoc(userRef, {
        isOnline: false,
        lastSeen: serverTimestamp(),
      }, { merge: true }).catch(console.error);
    };
    */
  }, [user, isProfileComplete]);

  return (
    <>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(root)" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}

export default function RootLayout() {
  return (
    <FontProvider>
      <AuthContextProvider>
        <ThemeProvider>
          <ErrorBoundary>
            <RootLayoutNav />
          </ErrorBoundary>
        </ThemeProvider>
      </AuthContextProvider>
    </FontProvider>
  );
}