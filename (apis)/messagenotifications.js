// // import React, { useState, useEffect } from 'react';
// // import * as Notifications from 'expo-notifications';
// // import * as Device from 'expo-device';
// // import { 
// //   doc, 
// //   setDoc, 
// //   updateDoc, 
// //   collection, 
// //   query, 
// //   where, 
// //   onSnapshot,
// //   getDoc
// // } from 'firebase/firestore';
// // import { db, auth, storage } from '../config/firebaseConfig';

// // // Notification Configuration
// // export const NotificationManager = {
// //   // Configure notification handling
// //   async configure() {
// //     Notifications.setNotificationHandler({
// //       handleNotification: async () => ({
// //         shouldShowAlert: true,
// //         shouldPlaySound: true,
// //         shouldSetBadge: true,
// //       }),
// //     });
// //   },

// //   // Request notification permissions
// //   async requestPermissions() {
// //     if (Device.isDevice) {
// //       const { status: existingStatus } = await Notifications.getPermissionsAsync();
// //       let finalStatus = existingStatus;

// //       if (existingStatus !== 'granted') {
// //         const { status } = await Notifications.requestPermissionsAsync();
// //         finalStatus = status;
// //       }

// //       if (finalStatus !== 'granted') {
// //         throw new Error('Notification permissions not granted');
// //       }

// //       return await this.getDeviceToken();
// //     } else {
// //       throw new Error('Must use physical device for push notifications');
// //     }
// //   },

// //   // Get device token for push notifications
// //   async getDeviceToken() {
// //     const token = await Notifications.getExpoPushTokenAsync({
// //       projectId: 'YOUR_EXPO_PROJECT_ID' // Replace with your actual project ID
// //     });
// //     return token.data;
// //   },

// //   // Register device token for a user
// //   async registerDeviceToken(userId, token) {
// //     try {
// //       const userRef = doc(db, 'users', userId);
// //       await updateDoc(userRef, {
// //         deviceTokens: firebase.firestore.FieldValue.arrayUnion(token)
// //       });
// //     } catch (error) {
// //       console.error('Error registering device token:', error);
// //     }
// //   }
// // };

// // // Notification Service for Creating and Sending Notifications
// // export const NotificationService = {
// //   // Create notification payload for a message
// //   createMessageNotification(sender, message, recipientTokens) {
// //     return {
// //       to: recipientTokens,
// //       sound: 'default',
// //       title: `New message from ${sender.username || 'Someone'}`,
// //       body: message.type === 'text' 
// //         ? message.text 
// //         : (message.type === 'image' ? 'Sent an image' : 'Sent a message'),
// //       data: {
// //         chatId: message.chatId,
// //         senderId: sender.uid,
// //         type: 'message'
// //       }
// //     };
// //   },

// //   // Send push notification
// //   async sendPushNotification(payload) {
// //     try {
// //       const response = await fetch('https://exp.host/--/api/v2/push/send', {
// //         method: 'POST',
// //         headers: {
// //           Accept: 'application/json',
// //           'Accept-encoding': 'gzip, deflate',
// //           'Content-Type': 'application/json',
// //         },
// //         body: JSON.stringify(payload)
// //       });

// //       const results = await response.json();
// //       return results;
// //     } catch (error) {
// //       console.error('Notification send error:', error);
// //     }
// //   }
// // };

// // // Notification Listener for Handling Incoming Notifications
// // export const NotificationListener = {
// //   // Setup notification event listeners
// //   setupListeners(navigation) {
// //     // Foreground notification listener
// //     Notifications.addNotificationReceivedListener(notification => {
// //       console.log('Notification received in foreground:', notification);
// //     });

// //     // Notification tap listener
// //     Notifications.addNotificationResponseReceivedListener(response => {
// //       const { data } = response.notification.request.content;
      
// //       // Navigate to chat room when message notification is tapped
// //       if (data.type === 'message' && navigation) {
// //         navigation.navigate('ChatRoom', { 
// //           chatId: data.chatId,
// //           recipientId: data.senderId 
// //         });
// //       }
// //     });
// //   },

// //   // Handle initial notification that opened the app
// //   async getInitialNotification(navigation) {
// //     const initialNotification = 
// //       await Notifications.getLastNotificationResponseAsync();
    
// //     if (initialNotification && navigation) {
// //       const { data } = initialNotification.notification.request.content;
// //       if (data.type === 'message') {
// //         navigation.navigate('ChatRoom', { 
// //           chatId: data.chatId,
// //           recipientId: data.senderId 
// //         });
// //       }
// //     }
// //   }
// // };

// // // Notification Context Wrapper for App
// // export const NotificationProvider = ({ children, navigation }) => {
// //   const [expoPushToken, setExpoPushToken] = useState('');

// //   useEffect(() => {
// //     // Initialize notification system
// //     NotificationManager.configure();

// //     // Request permissions and register token
// //     const registerForPushNotifications = async () => {
// //       try {
// //         const token = await NotificationManager.requestPermissions();
// //         setExpoPushToken(token);

// //         // Store token for current user
// //         if (auth.currentUser) {
// //           await NotificationManager.registerDeviceToken(
// //             auth.currentUser.uid, 
// //             token
// //           );
// //         }
// //       } catch (error) {
// //         console.error('Notification registration failed:', error);
// //       }
// //     };

// //     // Setup notification listeners
// //     NotificationListener.setupListeners(navigation);
// //     NotificationListener.getInitialNotification(navigation);

// //     registerForPushNotifications();
// //   }, []);

// //   return <>{children}</>;
// // };

// // // Utility function to send message with notification
// // export const sendMessageWithNotification = async (
// //   chatId, 
// //   messageData, 
// //   recipientId
// // ) => {
// //   try {
// //     // Save message to Firestore
// //     const messageRef = await addDoc(
// //       collection(db, 'chats', chatId, 'messages'), 
// //       messageData
// //     );

// //     // Fetch recipient's device tokens
// //     const recipientDoc = await getDoc(doc(db, 'users', recipientId));
// //     const recipientTokens = recipientDoc.data()?.deviceTokens || [];

// //     // Check if notifications are allowed (you can implement this logic)
// //     if (recipientTokens.length) {
// //       // Create and send notification
// //       const notificationPayload = NotificationService.createMessageNotification(
// //         auth.currentUser, 
// //         { ...messageData, chatId },
// //         recipientTokens
// //       );

// //       await NotificationService.sendPushNotification(notificationPayload);
// //     }

// //     return messageRef;
// //   } catch (error) {
// //     console.error('Message send error:', error);
// //     throw error;
// //   }
// // };
// import * as Device from 'expo-device';
// import * as Notifications from 'expo-notifications';
// import { doc, updateDoc, getDoc } from 'firebase/firestore';
// import { db } from '../(apis)/messagenotifications';

// export class NotificationManager {
//   // Initialize notification settings
//   static async initializeNotifications() {
//     if (Device.isDevice) {
//       // Set how notifications should be handled when app is foregrounded
//       Notifications.setNotificationHandler({
//         handleNotification: async () => ({
//           shouldShowAlert: true,
//           shouldPlaySound: true,
//           shouldSetBadge: true,
//         }),
//       });
//     }
//   }

//   // Request permissions and store token
//   static async registerForPushNotifications(userId) {
//     try {
//       if (!Device.isDevice) {
//         console.log('Must use physical device for notifications');
//         return;
//       }

//       // Check existing permissions
//       const { status: existingStatus } = await Notifications.getPermissionsAsync();
//       let finalStatus = existingStatus;

//       // Request permissions if not granted
//       if (existingStatus !== 'granted') {
//         const { status } = await Notifications.requestPermissionsAsync();
//         finalStatus = status;
//       }

//       if (finalStatus !== 'granted') {
//         console.log('Failed to get push token permissions');
//         return;
//       }

//       // Get Expo push token
//       const tokenData = await Notifications.getExpoPushTokenAsync({
//         projectId: process.env.EXPO_PROJECT_ID // Add your Expo project ID
//       });

//       // Store token in Firestore
//       await this.storeUserToken(userId, tokenData.data);
      
//       return tokenData.data;
//     } catch (error) {
//       console.error('Error registering for notifications:', error);
//       throw error;
//     }
//   }

//   // Store user's token in Firestore
//   static async storeUserToken(userId, token) {
//     try {
//       const userRef = doc(db, 'users', userId);
//       await updateDoc(userRef, {
//         pushToken: token,
//         tokenUpdatedAt: new Date()
//       });
//     } catch (error) {
//       console.error('Error storing push token:', error);
//       throw error;
//     }
//   }
// }
