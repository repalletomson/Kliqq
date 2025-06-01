import React, { useEffect } from 'react';
import { AppState,StatusBar } from 'react-native';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../config/firebaseConfig';
import { useSegments, useRouter } from 'expo-router';
import { Slot, Stack } from 'expo-router';
import AuthContextProvider from '../context/authContext';
import { NotificationProvider } from '../context/notificationContext';
import ErrorBoundary from '../components/ErrorBoundary';
import * as Notifications from 'expo-notifications';
import registerForPushNotificationsAsync from '../(apis)/notifications';
import '../global.css';
import { ThemeProvider, useTheme } from "../context/ThemeContext"
import { registerRootComponent } from 'expo';
export default function RootLayout() {
  const segments = useSegments();
  const router = useRouter();

  console.log("layout");
  console.log(segments);

  // Handle push notifications
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });

  useEffect(() => {
    // Register for push notifications
    (async () => {
      const { token } = await registerForPushNotificationsAsync();
      // console.log('Expo Push Token:', token.data);
    })();
  }, []);

  useEffect(() => {
    if (!auth.currentUser) return;

    const userRef = doc(db, 'users', auth.currentUser.uid);

    // Handle app state changes
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        // App came to foreground
        console.log('App is in the foreground');
        updateDoc(userRef, {
          isOnline: true,
          lastSeen: serverTimestamp(),
        },{ merge: true }).catch((error) => {
          console.error('Error updating online status:', error);
        });
      } else if (nextAppState === 'background' || nextAppState === 'inactive') {
        // App went to background or became inactive
        updateDoc(userRef, {
          isOnline: false,
          lastSeen: serverTimestamp(),
        },{ merge: true }).catch((error) => {
          console.error('Error updating offline status:', error);
        });
      }
    });

    // Set initial online status
    updateDoc(userRef, {
      isOnline: true,
      lastSeen: serverTimestamp(),
    },{ merge: true }).catch((error) => {
      console.error('Error setting initial online status:', error);
    });

    // Cleanup on unmount
    return () => {
      subscription.remove();
      updateDoc(userRef, {
        isOnline: false,
        lastSeen: serverTimestamp(),
      }).catch((error) => {
        console.error('Error updating offline status on unmount:', error);
      });
    };
  }, [auth.currentUser]);
  const { isDark, colors } = useTheme()

  return (

    // <Slot />
    <ErrorBoundary>
      <AuthContextProvider>
        <NotificationProvider>
            {/* <Slot /> */}
          {/* <ThemeProvider> */}
            {/* <AppContent /> */}

            <Stack>
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="(auth)" options={{ headerShown: false }} />
              <Stack.Screen name="(root)" options={{ headerShown: false }} />
              {/* <Stack.Screen name="postDetailView" options={{ headerShown: false }} /> */}
            </Stack>
          {/* </ThemeProvider> */}
          <StatusBar style="auto" />
          </NotificationProvider>
      </AuthContextProvider>
    </ErrorBoundary>
  );
}

// registerRootComponent(RootLayout);

// // export default RootLayout;
