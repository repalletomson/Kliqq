// // notifications.js
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { collection, query, where, getDocs ,setDoc,doc} from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { auth } from '../config/firebaseConfig';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
// Configure notifications

export const registerForPushNotifications = async () => {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      throw new Error('Permission not granted for notifications');
    }

    const token = (await Notifications.getExpoPushTokenAsync()).data;
    
    // Store token in user's profile
    if (auth.currentUser) {
      await setDoc(doc(db, 'users', auth.currentUser.uid), {
        pushToken: token
      }, { merge: true });
    }

    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
      });
    }

    return token;
  } catch (error) {
    console.error('Error registering for push notifications:', error);
    throw error;
  }
};


async function registerForPushNotificationsAsync() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      handleRegistrationError('Permission not granted to get push token for push notification!');
      return;
    }
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
    if (!projectId) {
      handleRegistrationError('Project ID not found');
      return;
    }
    try {
      const pushTokenString = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      );

      if (auth.currentUser) {
        await setDoc(doc(db, 'users', auth.currentUser.uid), {
          pushToken: pushTokenString
        }, { merge: true });
      }
      console.log(pushTokenString);
      return pushTokenString;
    } catch (e) {
      handleRegistrationError(`${e}`);
    }
  } else {
    handleRegistrationError('Must use physical device for push notifications');
  }
}

function handleRegistrationError(error) {
  console.error(error);
}

export default registerForPushNotificationsAsync;
export const sendNotification = async (targetCollege, notificationType, postData) => {
  try {
    // Get all users from the same college
    console.log("targetCollege",targetCollege)
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('college.name', '==', targetCollege));
    const querySnapshot = await getDocs(q);
    
    const notifications = [];
    console.log("querySnapshot",querySnapshot)
      querySnapshot.forEach((doc) => {
      const userData = doc.data();
      if (userData.pushToken && userData.uid !== auth.currentUser.uid) {
        let message = '';
        console.log("notificationType",notificationType)
        switch (notificationType) {
          case 'new_post':
            message = `New post in ${targetCollege}: ${postData.content.substring(0, 50)}...`;
            break;
          case 'like':
            message = `Someone liked your post: ${postData.content.substring(0, 50)}...`;
            break;
          case 'comment':
            message = `From ${postData.username} you have got New comment on your post: ${postData.content.substring(0, 50)}...`;
            break;
        }

        notifications.push({
          to: userData.pushToken.data,
          sound: 'default',
          title: 'Campus Connect',
          body: message,
          data: { postId: postData.id }
        });
      }
    });

    // Send notifications in batches
    const batchSize = 100;
    for (let i = 0; i < notifications.length; i += batchSize) {
      const batch = notifications.slice(i, i + batchSize);
      await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(batch)
      });
    }
    return true
  } catch (error) {
    console.error('Error sending notifications:', error);
    throw error;
  }
};

// import { Expo } from 'expo-server-sdk';
// // import { doc, updateDoc } from 'firebase/firestore';
// import { db } from '../config/firebaseConfig';
// import { collection, query, where, getDocs ,setDoc,doc,getDoc} from 'firebase/firestore';

// // import { useAuth } from './authContext';
// class NotificationService {
//   constructor() {
//     this.expo = new Expo();
//   }

//   async sendNotifications(messages) {
//     const chunks = this.expo.chunkPushNotifications(messages);
//     const tickets = [];

//     for (const chunk of chunks) {
//       try {
//         const ticketChunk = await this.expo.sendPushNotificationsAsync(chunk);
//         tickets.push(...ticketChunk);
//       } catch (error) {
//         console.error('Error sending notifications:', error);
//       }
//     }

//     return tickets;
//   }

//   createMessage(token, { title, body, data }) {
//     return {
//       to: token,
//       sound: 'default',
//       title,
//       body,
//       data,
//       priority: 'high',
//       channelId: 'default',
//       _displayInForeground: true,
//       badge: 1,
//     };
//   }

//   // Send new post notification to college users
//   async sendNewPostNotification(currentUser, post) {
//     try {
//       const usersRef = collection(db, 'users');
//       const q = query(
//         usersRef, 
//         where('college.name', '==', currentUser.college.name)
//       );
      
//       const querySnapshot = await getDocs(q);
      
//       const messages = querySnapshot.docs.reduce((acc, doc) => {
//         const userData = doc.data();
//         if (userData.expoPushToken && doc.id !== currentUser.uid) {
//           acc.push(this.createMessage(userData.expoPushToken, {
//             title: 'New Post',
//             body: `${currentUser.username} shared a post in your college`,
//             data: { 
//               type: 'new_post',
//               postId: post.id,
//               userId: currentUser.uid
//             }
//           }));
//         }
//         return acc;
//       }, []);

//       return await this.sendNotifications(messages);
//     } catch (error) {
//       console.error('Error sending post notification:', error);
//     }
//   }

//   // Send like notification to post owner
//   async sendLikeNotification(postData, likedByUser) {
//     try {
//       if (postData.userId === likedByUser.uid) return; // Don't notify self-likes
      
//       const userDoc = await getDoc(doc(db, 'users', postData.userId));
//       const userData = userDoc.data();

//       if (userData?.expoPushToken) {
//         const message = this.createMessage(userData.expoPushToken, {
//           title: 'New Like',
//           body: `${likedByUser.username} liked your post`,
//           data: {
//             type: 'post_like',
//             postId: postData.id,
//             userId: likedByUser.uid
//           }
//         });

//         await this.sendNotifications([message]);
//       }
//     } catch (error) {
//       console.error('Error sending like notification:', error);
//     }
//   }

//   // Send comment notification to post owner
//   async sendCommentNotification(postData, commentedByUser) {
//     try {
//       if (postData.userId === commentedByUser.uid) return; // Don't notify self-comments
      
//       const userDoc = await getDoc(doc(db, 'users', postData.userId));
//       const userData = userDoc.data();

//       if (userData?.expoPushToken) {
//         const message = this.createMessage(userData.expoPushToken, {
//           title: 'New Comment',
//           body: `${commentedByUser.username} commented on your post`,
//           data: {
//             type: 'post_comment',
//             postId: postData.id,
//             userId: commentedByUser.uid
//           }
//         });

//         await this.sendNotifications([message]);
//       }
//     } catch (error) {
//       console.error('Error sending comment notification:', error);
//     }
//   }

//   // Send chat message notification
//   async sendChatNotification(recipientId, messageData, sender) {
//     try {
//       const userDoc = await getDoc(doc(db, 'users', recipientId));
//       const userData = userDoc.data();

//       if (userData?.expoPushToken) {
//         const message = this.createMessage(userData.expoPushToken, {
//           title: `Message from ${sender.username}`,
//           body: messageData.text || 'New message',
//           data: {
//             type: 'chat_message',
//             chatId: messageData.chatId,
//             senderId: sender.uid
//           }
//         });

//         await this.sendNotifications([message]);
//       }
//     } catch (error) {
//       console.error('Error sending chat notification:', error);
//     }
//   }
// }

// export const notificationService = new NotificationService();