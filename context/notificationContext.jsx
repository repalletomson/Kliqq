// import React, { useState, useEffect } from 'react';
// import messaging from '@react-native-firebase/messaging';
// import { doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
// import { auth, db } from '../config/firebaseConfig';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// export const NotificationManager = {
//   async checkPermissionStatus() {
//     try {
//       const authStatus = await messaging().hasPermission();
//       return authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
//              authStatus === messaging.AuthorizationStatus.PROVISIONAL;
//     } catch (error) {
//       console.error('Error checking permission status:', error);
//       return false;
//     }
//   },

//   async requestPermissions() {
//     try {
//       const authStatus = await messaging().requestPermission();
//       const enabled =
//         authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
//         authStatus === messaging.AuthorizationStatus.PROVISIONAL;

//       if (enabled) {
//         console.log('Authorization status:', authStatus);
//         const token = await this.getDeviceToken();
//         if (token) {
//           await this.storeLocalToken(token);
//         }
//         return token;
//       }
//       return null;
//     } catch (error) {
//       console.error('Permission request failed:', error);
//       return null;
//     }
//   },

//   async storeLocalToken(token) {
//     try {
//       await AsyncStorage.setItem('fcmToken', token);
//     } catch (error) {
//       console.error('Error storing local token:', error);
//     }
//   },

//   async getLocalToken() {
//     try {
//       return await AsyncStorage.getItem('fcmToken');
//     } catch (error) {
//       console.error('Error getting local token:', error);
//       return null;
//     }
//   },

//   async registerDeviceToken(userId, token) {
//     try {
//       const userRef = doc(db, 'users', userId);
//       const userDoc = await getDoc(userRef);

//       if (userDoc.exists()) {
//         await updateDoc(userRef, {
//           deviceToken: token,
//           notificationsEnabled: true,
//           lastTokenUpdate: new Date(),
//         }, { merge: true });
//       } else {
//         await setDoc(userRef, {
//           deviceToken: token,
//           notificationsEnabled: true,
//           lastTokenUpdate: new Date(),
//         }, { merge: true });
//       }
//     } catch (error) {
//       console.error('Error registering device token:', error);
//     }
//   },

//   setupForegroundHandler(callback) {
//     return messaging().onMessage((remoteMessage) => {
//       if (callback) {
//         callback(remoteMessage);
//       }
//     });
//   },

//   setupBackgroundHandler() {
//     messaging().setBackgroundMessageHandler(async (remoteMessage) => {
//       console.log('Message handled in the background:', remoteMessage);
//     });
//   },
// };

// export const NotificationProvider = ({ children, navigation }) => {
//   const [fcmToken, setFcmToken] = useState('');
//   const [permissionStatus, setPermissionStatus] = useState(null);

//   useEffect(() => {
//     const initializeNotifications = async () => {
//       try {
//         const hasPermission = await NotificationManager.checkPermissionStatus();
//         setPermissionStatus(hasPermission);

//         if (!hasPermission) {
//           const token = await NotificationManager.requestPermissions();
//           if (token) {
//             setFcmToken(token);
//             if (auth.currentUser) {
//               await NotificationManager.registerDeviceToken(auth.currentUser.uid, token);
//             }
//           }
//         } else {
//           const token = await messaging().getToken();
//           setFcmToken(token);
//           if (auth.currentUser) {
//             await NotificationManager.registerDeviceToken(auth.currentUser.uid, token);
//           }
//         }
//       } catch (error) {
//         console.error('Notification initialization failed:', error);
//       }
//     };

//     initializeNotifications();

//     const foregroundUnsubscribe = NotificationManager.setupForegroundHandler((remoteMessage) => {
//       if (remoteMessage.data.type === 'message' && navigation) {
//         navigation.navigate('ChatRoom', {
//           chatId: remoteMessage.data.chatId,
//           recipientId: remoteMessage.data.senderId,
//         });
//       }
//     });

//     NotificationManager.setupBackgroundHandler();

//     return () => {
//       foregroundUnsubscribe();
//     };
//   }, [navigation]);

//   return <>{children}</>;
// };
import React, { createContext, useContext, useEffect, useState } from 'react';
import * as Notifications from 'expo-notifications';

import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { useAuth } from './authContext';
import { router } from 'expo-router';

const NotificationContext = createContext({});

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [pushToken, setPushToken] = useState(null);

  // Initialize notifications
  useEffect(() => {
    if (user?.uid) {
      initializeNotifications();
    }
  }, [user]);

  const initializeNotifications = async () => {
    try {
      // Configure handler
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        }),
      });

      // Request permissions
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.log('Notification permissions not granted');
        return;
      }

      // Get token
      const tokenData = await Notifications.getExpoPushTokenAsync();
      setPushToken(tokenData.data);
      console.log('Push token:', tokenData.data);
      // Save token to user document
      await updateDoc(doc(db, 'users', user.uid), {
        expoPushToken: tokenData.data
      },{merge:true});

      // Set up listeners
      setupNotificationListeners();
    } catch (error) {
      console.error('Error initializing notifications:', error);
    }
  };

  const setupNotificationListeners = () => {
    const foregroundSubscription = Notifications.addNotificationReceivedListener(
      handleForegroundNotification
    );

    const responseSubscription = Notifications.addNotificationResponseReceivedListener(
      handleNotificationResponse
    );

    return () => {
      foregroundSubscription.remove();
      responseSubscription.remove();
    };
  };

  const handleForegroundNotification = (notification) => {
    // Custom handling for foreground notifications
    console.log('Received foreground notification:', notification);
  };

  const handleNotificationResponse = (response) => {
    const data = response.notification.request.content.data;
    
    switch (data.type) {
      case 'new_post':
        router.push('/home');
        break;
      case 'chat_message':
        router.push(`/chat/${data.senderId}`);
        break;
      case 'post_like':
        router.push(`/postDetailView/${data.postId}`)
        break;
      case 'post_comment':
        router.push(`/postDetailView/${data.postId}`)
        break;
    }
  };

  return (
    <NotificationContext.Provider value={{ pushToken }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);