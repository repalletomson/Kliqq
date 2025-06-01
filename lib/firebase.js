import { initializeApp } from 'firebase/app';

import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy,
  deleteDoc,
  Timestamp
} from 'firebase/firestore';
import { router } from 'expo-router';
import {db, auth} from '../config/firebaseConfig';
import { useAuth } from '../context/authContext';
import { getAuth } from 'firebase/auth';

export const getCurrentUser = async () => {
  const user = auth.currentUser;
  if (!user) return null;
  
  try {
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (userDoc.exists()) {
      return {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || '',
        groups: userDoc.data().groups || [],
      };
    }
    
    // If user document doesn't exist, create one with defaults
    const userData = {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || '',
      groups: [],
      createdAt: serverTimestamp()
    };
    
    await setDoc(doc(db, 'users', user.uid), userData);
    
    return userData;
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error;
  }
};
export const getGroupMembers = async (groupId) => {
    try {
      const groupRef = doc(db, 'groups', groupId);
      const groupDoc = await getDoc(groupRef);
      
      if (!groupDoc.exists()) {
        console.log("Group does not exist");
        return [];
      }
      
      const groupData = groupDoc.data();
      const memberIds = groupData.members || [];
      
      // If you need full user data instead of just IDs
      const memberData = [];
      for (const userId of memberIds) {
        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          memberData.push({
            id: userId,
            ...userDoc.data()
          });
        }
      }
      
      return memberData;
    } catch (error) {
      console.error("Error getting group members:", error);
      throw error;
    }
  };
export const getGroups = async () => {
  try {
    const groupsSnapshot = await getDocs(collection(db, 'groups'));
    const groups = [];
    
    groupsSnapshot.forEach((doc) => {
      const data = doc.data();
      groups.push({
        id: doc.id,
        name: data.name,
        description: data.description,
        memberCount: data.members?.length || 0,
        createdAt: data.createdAt?.toDate().toISOString() || new Date().toISOString(),
      });
    });
    
    return groups;
  } catch (error) {
    console.error("Error fetching groups:", error);
    throw error;
  }
};

export const addReaction = async (groupId, messageId, userId, emoji) => {
  try {
    const messageRef = doc(db, 'groups', groupId, 'messages', messageId);
    
    await updateDoc(messageRef, {
      reactions: arrayUnion({
        userId,
        emoji,
      })
    });
  } catch (error) {
    console.error('Error adding reaction:', error);
    throw error;
  }
};

/**
 * Delete a message
 * @param {string} groupId - The ID of the group
 * @param {string} messageId - The ID of the message to delete
 */
export const deleteMessage = async (groupId, messageId) => {
  try {
    const messageRef = doc(db, 'groups', groupId, 'messages', messageId);
    await deleteDoc(messageRef);
  } catch (error) {
    console.error('Error deleting message:', error);
    throw error;
  }
};

/**
 * Reply to a message
 * @param {string} groupId - The ID of the group
 * @param {Object} messageData - The message data to send
 */
export const replyToMessage = async (groupId, messageData) => {
  try {
    const messagesRef = collection(db, 'groups', groupId, 'messages');
    await addDoc(messagesRef, {
      ...messageData,
      createdAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error sending reply:', error);
    throw error;
  }
};

export const joinGroup = async (userId, groupId) => {
  try {
    // First check if user is already in the group to prevent duplicates
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      if (userData.groups && userData.groups.includes(groupId)) {
        console.log("User is already a member of this group");
        return; // User is already in the group, no need to proceed
      }
    }
    
    // Update the user document to add the groupId
    await updateDoc(userRef, {
      groups: arrayUnion(groupId)
    }, { merge: true });
    
    // Update the group document to add the userId and increment memberCount
    const groupRef = doc(db, 'groups', groupId);
    const groupDoc = await getDoc(groupRef);
    
    // Check if the group document exists
    if (!groupDoc.exists()) {
      // Create the group document if it doesn't exist
      await setDoc(groupRef, {
        members: [userId], // Initialize members array with the userId
        memberCount: 1, // Initialize memberCount to 1
        createdAt: serverTimestamp()
      });
    } else {
      // Group document exists, update it
      const groupData = groupDoc.data();
      const currentMembers = groupData?.members || [];
      
      // Check if the user is already in the members array
      if (!currentMembers.includes(userId)) {
        await updateDoc(groupRef, {
          members: arrayUnion(userId),
          memberCount: (groupData?.memberCount || 0) + 1
        }, { merge: true });
      }
    }
  } catch (error) {
    console.error("Error in joinGroup function:", error);
    throw error;
  }
};

export const checkGroupMembership = async (userId, groupId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      return userData.groups && userData.groups.includes(groupId);
    }
    
    return false;
  } catch (error) {
    console.error("Error checking group membership:", error);
    throw error;
  }
};

export const leaveGroup = async (userId, groupId) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      groups: arrayRemove(groupId)
    });
    
    const groupRef = doc(db, 'groups', groupId);
    const groupDoc = await getDoc(groupRef);
    const currentCount = groupDoc.data()?.memberCount || 0;
    
    await updateDoc(groupRef, {
      members: arrayRemove(userId),
      memberCount: Math.max(0, currentCount - 1)
    });
  } catch (error) {
    console.error("Error leaving group:", error);
    throw error;
  }
};

/*************  ✨ Codeium Command ⭐  *************/
/**
 * Retrieves and subscribes to messages for a specific group in real-time.
 * 
 * @param {string} groupId - The ID of the group whose messages are to be fetched.
 * @param {function} callback - A callback function that receives an array of message objects whenever the messages update.
 * 
 * Each message object includes:
 * - id: The unique identifier of the message.
 * - text: The content of the message.
 * - senderId: The ID of the user who sent the message.
 * - senderName: The display name of the sender.
 * - timestamp: The time when the message was sent, formatted as an ISO string.
 * - reactions: An array of reactions associated with the message.
 * - replyTo: The ID of the message to which this message is a reply, if any.
 * 
 * @returns {function} A function to unsubscribe from the real-time updates.
 * 
 * @throws Will log an error message and rethrow if fetching messages fails.
 */

/******  7d7a068c-19e1-42cd-8417-96d3814ec0eb  *******/
export const getGroupMessages = (groupId, callback) => {
  try {
    const messagesRef = collection(db, 'groups', groupId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));
    
    return onSnapshot(q, (snapshot) => {
      const messages = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        messages.push({
          id: doc.id,
          text: data.text,
          senderId: data.senderId,
          senderName: data.senderName,
          timestamp: data.timestamp instanceof Timestamp 
            ? data.timestamp.toDate().toISOString() 
            : data.timestamp,
          reactions: data.reactions || [],
          replyTo: data.replyTo || null,
        });
      });
      callback(messages);
    });
  } catch (error) {
    console.error("Error getting group messages:", error);
    throw error;
  }
};

export const sendMessage = async (groupId, message) => {
  try {
    const messagesRef = collection(db, 'groups', groupId, 'messages');
    return addDoc(messagesRef, {
      ...message,
      timestamp: serverTimestamp(),
      reactions: []
    });
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};

export const initializeDefaultGroups = async () => {
  try {
    const groupsRef = collection(db, 'groups');
    const groupsSnapshot = await getDocs(groupsRef);
    
    if (groupsSnapshot.empty) {
      const defaultGroups = [
        { id: 'projects', name: 'Projects', description: 'Share and collaborate on projects' },
        { id: 'movies', name: 'Movies', description: 'Discuss movies and TV shows' },
        { id: 'coding', name: 'Coding', description: 'Programming discussions and help' },
        { id: 'funny', name: 'Funny', description: 'Share fun content and memes' },
        { id: 'gaming', name: 'Gaming', description: 'Connect with fellow gamers' },
        { id: 'placements', name: 'Placements', description: 'Discuss job placements and opportunities' }
      ];
      
      for (const group of defaultGroups) {
        await setDoc(doc(groupsRef, group.id), {
          name: group.name,
          description: group.description,
          members: [],
          memberCount: 0,
          createdAt: serverTimestamp()
        });
      }
    }
  } catch (error) {
    console.error("Error initializing default groups:", error);
    throw error;
  }
};