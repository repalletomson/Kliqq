// // // app/(apis)/streaks.js

// // import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
// // import { db } from '../../config/firebaseConfig';

// // /**
// //  * Get the current streak data for a user
// //  * @param {string} userId - The user ID
// //  * @returns {Promise<Object>} The streak data
// //  */
// // export const getUserStreak = async (userId) => {
// //   try {
// //     const streakRef = doc(db, 'streaks', userId);
// //     const streakDoc = await getDoc(streakRef);
    
// //     if (streakDoc.exists()) {
// //       return streakDoc.data();
// //     } else {
// //       // Initialize streak data if it doesn't exist
// //       const initialStreakData = {
// //         currentStreak: 0,
// //         highestStreak: 0,
// //         lastPostDate: null,
// //         createdAt: serverTimestamp(),
// //         updatedAt: serverTimestamp(),
// //       };
      
// //       await setDoc(streakRef, initialStreakData);
// //       return initialStreakData;
// //     }
// //   } catch (error) {
// //     console.error('Error getting user streak:', error);
// //     throw error;
// //   }
// // };

// // /**
// //  * Increment a user's streak when they create a post
// //  * @param {string} userId - The user ID
// //  * @returns {Promise<Object>} Updated streak information
// //  */
// // export const incrementUserStreak = async (userId) => {
// //   try {
// //     const streakRef = doc(db, 'streaks', userId);
// //     const streakDoc = await getDoc(streakRef);
    
// //     const now = new Date();
// //     const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
// //     // Initialize streak data if it doesn't exist
// //     if (!streakDoc.exists()) {
// //       const initialStreak = {
// //         currentStreak: 1,
// //         highestStreak: 1,
// //         lastPostDate: today.toISOString(),
// //         createdAt: serverTimestamp(),
// //         updatedAt: serverTimestamp(),
// //       };
      
// //       await setDoc(streakRef, initialStreak);
// //       return { ...initialStreak, streakIncreased: true };
// //     }
    
// //     const streakData = streakDoc.data();
// //     const lastPostDate = streakData.lastPostDate ? new Date(streakData.lastPostDate) : null;
    
// //     // If lastPostDate is null, this is the first post
// //     if (!lastPostDate) {
// //       const updatedStreak = {
// //         currentStreak: 1,
// //         highestStreak: Math.max(1, streakData.highestStreak || 0),
// //         lastPostDate: today.toISOString(),
// //         updatedAt: serverTimestamp(),
// //       };
      
// //       await updateDoc(streakRef, updatedStreak);
// //       return { ...updatedStreak, streakIncreased: true };
// //     }
    
// //     // Get the date components (year, month, day) to compare dates properly
// //     const lastPostDay = new Date(
// //       lastPostDate.getFullYear(), 
// //       lastPostDate.getMonth(), 
// //       lastPostDate.getDate()
// //     );
    
// //     // Yesterday's date for comparison
// //     const yesterday = new Date(today);
// //     yesterday.setDate(yesterday.getDate() - 1);
    
// //     // Check if the user has already posted today
// //     if (lastPostDay.getTime() === today.getTime()) {
// //       // Already posted today, no streak change
// //       return { 
// //         currentStreak: streakData.currentStreak,
// //         highestStreak: streakData.highestStreak,
// //         streakIncreased: false 
// //       };
// //     } 
// //     // If they posted yesterday, increment streak
// //     else if (lastPostDay.getTime() === yesterday.getTime()) {
// //       const newStreak = streakData.currentStreak + 1;
// //       const updatedStreak = {
// //         currentStreak: newStreak,
// //         highestStreak: Math.max(newStreak, streakData.highestStreak || 0),
// //         lastPostDate: today.toISOString(),
// //         updatedAt: serverTimestamp(),
// //       };
      
// //       await updateDoc(streakRef, updatedStreak);
// //       return { ...updatedStreak, streakIncreased: true };
// //     } 
// //     // If they missed a day or more, reset streak to 1
// //     else {
// //       const updatedStreak = {
// //         currentStreak: 1,
// //         highestStreak: streakData.highestStreak || 0,
// //         lastPostDate: today.toISOString(),
// //         updatedAt: serverTimestamp(),
// //       };
      
// //       await updateDoc(streakRef, updatedStreak);
// //       return { ...updatedStreak, streakIncreased: true };
// //     }
// //   } catch (error) {
// //     console.error('Error incrementing user streak:', error);
// //     throw error;
// //   }
// // };

// // /**
// //  * Reset a user's streak
// //  * @param {string} userId - The user ID
// //  * @returns {Promise<void>}
// //  */
// // export const resetUserStreak = async (userId) => {
// //   try {
// //     const streakRef = doc(db, 'streaks', userId);
    
// //     await updateDoc(streakRef, {
// //       currentStreak: 0,
// //       lastPostDate: null,
// //       updatedAt: serverTimestamp(),
// //     });
// //   } catch (error) {
// //     console.error('Error resetting user streak:', error);
// //     throw error;
// //   }
// // };

// // app/(apis)/streaks.js

// import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
// import { db } from '../../config/firebaseConfig';

// /**
//  * Get the current streak data for a user
//  * @param {string} userId - The user ID
//  * @returns {Promise<Object>} The streak data
//  */
// export const getUserStreak = async (userId) => {
//   try {
//     const streakRef = doc(db, 'streaks', userId);
//     const streakDoc = await getDoc(streakRef);
    
//     if (streakDoc.exists()) {
//       return streakDoc.data();
//     } else {
//       // Initialize streak data if it doesn't exist
//       const initialStreakData = {
//         currentStreak: 0,
//         highestStreak: 0,
//         lastActivityDate: null,
//         activityCounts: {
//           posts: 0,
//           comments: 0,
//           likes: 0
//         },
//         createdAt: serverTimestamp(),
//         updatedAt: serverTimestamp(),
//       };
      
//       await setDoc(streakRef, initialStreakData);
//       return initialStreakData;
//     }
//   } catch (error) {
//     console.error('Error getting user streak:', error);
//     throw error;
//   }
// };

// /**
//  * Check if user has already performed any activity today to update streak
//  * @param {string} userId - The user ID
//  * @returns {Promise<boolean>} Whether user has already recorded an activity today
//  */
// const hasActivityToday = async (userId) => {
//   try {
//     const streakRef = doc(db, 'streaks', userId);
//     const streakDoc = await getDoc(streakRef);
    
//     if (!streakDoc.exists()) return false;
    
//     const streakData = streakDoc.data();
//     const lastActivityDate = streakData.lastActivityDate ? new Date(streakData.lastActivityDate) : null;
    
//     if (!lastActivityDate) return false;
    
//     const now = new Date();
//     const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
//     const lastActivityDay = new Date(
//       lastActivityDate.getFullYear(), 
//       lastActivityDate.getMonth(), 
//       lastActivityDate.getDate()
//     );
    
//     return lastActivityDay.getTime() === today.getTime();
//   } catch (error) {
//     console.error('Error checking today activity:', error);
//     return false;
//   }
// };

// /**
//  * Update user streak and activity counts based on activity type
//  * @param {string} userId - The user ID
//  * @param {string} activityType - Type of activity ('posts', 'comments', 'likes')
//  * @returns {Promise<Object>} Updated streak information
//  */
// export const updateUserActivityStreak = async (userId, activityType) => {
//   try {
//     if (!userId) throw new Error('User ID is required');
//     if (!['posts', 'comments', 'likes'].includes(activityType)) {
//       throw new Error('Invalid activity type');
//     }
    
//     const streakRef = doc(db, 'streaks', userId);
//     const streakDoc = await getDoc(streakRef);
    
//     const now = new Date();
//     const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
//     // Check if user already had an activity today
//     const hadActivityToday = await hasActivityToday(userId);
    
//     // Initialize streak data if it doesn't exist
//     if (!streakDoc.exists()) {
//       const initialStreak = {
//         currentStreak: 1,
//         highestStreak: 1,
//         lastActivityDate: today.toISOString(),
//         activityCounts: {
//           posts: activityType === 'posts' ? 1 : 0,
//           comments: activityType === 'comments' ? 1 : 0,
//           likes: activityType === 'likes' ? 1 : 0
//         },
//         createdAt: serverTimestamp(),
//         updatedAt: serverTimestamp(),
//       };
      
//       await setDoc(streakRef, initialStreak);
//       return { ...initialStreak, streakIncreased: true };
//     }
    
//     const streakData = streakDoc.data();
//     const lastActivityDate = streakData.lastActivityDate ? new Date(streakData.lastActivityDate) : null;
    
//     // Always update the activity count
//     const updatedActivityCounts = {
//       ...streakData.activityCounts || {
//         posts: 0,
//         comments: 0,
//         likes: 0
//       }
//     };
//     updatedActivityCounts[activityType] = (updatedActivityCounts[activityType] || 0) + 1;
    
//     // If user already had an activity today, just update the activity count
//     if (hadActivityToday) {
//       const updateData = {
//         activityCounts: updatedActivityCounts,
//         updatedAt: serverTimestamp(),
//       };
      
//       await updateDoc(streakRef, updateData);
//       return { 
//         currentStreak: streakData.currentStreak,
//         highestStreak: streakData.highestStreak,
//         streakIncreased: false,
//         activityCounts: updatedActivityCounts
//       };
//     }
    
//     // If lastActivityDate is null, this is the first activity
//     if (!lastActivityDate) {
//       const updatedStreak = {
//         currentStreak: 1,
//         highestStreak: Math.max(1, streakData.highestStreak || 0),
//         lastActivityDate: today.toISOString(),
//         activityCounts: updatedActivityCounts,
//         updatedAt: serverTimestamp(),
//       };
      
//       await updateDoc(streakRef, updatedStreak);
//       return { ...updatedStreak, streakIncreased: true };
//     }
    
//     // Get the date components (year, month, day) to compare dates properly
//     const lastActivityDay = new Date(
//       lastActivityDate.getFullYear(), 
//       lastActivityDate.getMonth(), 
//       lastActivityDate.getDate()
//     );
    
//     // Yesterday's date for comparison
//     const yesterday = new Date(today);
//     yesterday.setDate(yesterday.getDate() - 1);
    
//     // If they had activity yesterday, increment streak
//     if (lastActivityDay.getTime() === yesterday.getTime()) {
//       const newStreak = streakData.currentStreak + 1;
//       const updatedStreak = {
//         currentStreak: newStreak,
//         highestStreak: Math.max(newStreak, streakData.highestStreak || 0),
//         lastActivityDate: today.toISOString(),
//         activityCounts: updatedActivityCounts,
//         updatedAt: serverTimestamp(),
//       };
      
//       await updateDoc(streakRef, updatedStreak);
//       return { ...updatedStreak, streakIncreased: true };
//     } 
//     // If they missed a day or more, reset streak to 1
//     else if (lastActivityDay.getTime() < yesterday.getTime()) {
//       const updatedStreak = {
//         currentStreak: 1,
//         highestStreak: streakData.highestStreak || 0,
//         lastActivityDate: today.toISOString(),
//         activityCounts: updatedActivityCounts,
//         updatedAt: serverTimestamp(),
//       };
      
//       await updateDoc(streakRef, updatedStreak);
//       return { ...updatedStreak, streakIncreased: true };
//     }
    
//     // Shouldn't reach here, but just in case
//     return { 
//       currentStreak: streakData.currentStreak,
//       highestStreak: streakData.highestStreak,
//       streakIncreased: false,
//       activityCounts: updatedActivityCounts
//     };
//   } catch (error) {
//     console.error('Error updating user activity streak:', error);
//     throw error;
//   }
// };

// /**
//  * Increment user streak for posting
//  * @param {string} userId - The user ID
//  * @returns {Promise<Object>} Updated streak information
//  */
// export const incrementUserStreak = async (userId) => {
//   return updateUserActivityStreak(userId, 'posts');
// };

// /**
//  * Increment user streak for commenting
//  * @param {string} userId - The user ID
//  * @returns {Promise<Object>} Updated streak information
//  */
// export const incrementCommentStreak = async (userId) => {
//   return updateUserActivityStreak(userId, 'comments');
// };

// /**
//  * Increment user streak for liking
//  * @param {string} userId - The user ID
//  * @returns {Promise<Object>} Updated streak information
//  */
// export const incrementLikeStreak = async (userId) => {
//   return updateUserActivityStreak(userId, 'likes');
// };

// /**
//  * Reset a user's streak
//  * @param {string} userId - The user ID
//  * @returns {Promise<void>}
//  */
// export const resetUserStreak = async (userId) => {
//   try {
//     const streakRef = doc(db, 'streaks', userId);
    
//     await updateDoc(streakRef, {
//       currentStreak: 0,
//       lastActivityDate: null,
//       updatedAt: serverTimestamp(),
//     });
//   } catch (error) {
//     console.error('Error resetting user streak:', error);
//     throw error;
//   }
// };

// /**
//  * Get user's activity counts
//  * @param {string} userId - The user ID
//  * @returns {Promise<Object>} Activity counts
//  */
// export const getUserActivityCounts = async (userId) => {
//   try {
//     const streakData = await getUserStreak(userId);
//     return streakData.activityCounts || {
//       posts: 0,
//       comments: 0,
//       likes: 0
//     };
//   } catch (error) {
//     console.error('Error getting user activity counts:', error);
//     throw error;
//   }
// };

// /**
//  * Check if user has achieved milestone (target number of activities)
//  * @param {string} userId - The user ID
//  * @param {string} activityType - Type of activity ('posts', 'comments', 'likes')
//  * @param {number} targetCount - Target count to check
//  * @returns {Promise<boolean>} Whether the milestone is achieved
//  */
// export const checkActivityMilestone = async (userId, activityType, targetCount) => {
//   try {
//     const activityCounts = await getUserActivityCounts(userId);
//     return (activityCounts[activityType] || 0) >= targetCount;
//   } catch (error) {
//     console.error('Error checking activity milestone:', error);
//     return false;
//   }
// };
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

/**
 * Get the current streak data for a user
 * @param {string} userId - The user ID
 * @returns {Promise<Object>} The streak data
 */
export const getUserStreak = async (userId) => {
  try {
    const streakRef = doc(db, 'streaks', userId);
    const streakDoc = await getDoc(streakRef);
    
    if (streakDoc.exists()) {
      const streakData = streakDoc.data();
      
      // Check if streak needs to be reset due to inactivity
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const lastActivityDate = streakData.lastActivityDate ? new Date(streakData.lastActivityDate) : null;
      
      // If there's no activity date or the last activity was more than a day ago, reset streak
      if (!lastActivityDate) {
        return streakData;
      }
      
      const lastActivityDay = new Date(
        lastActivityDate.getFullYear(), 
        lastActivityDate.getMonth(), 
        lastActivityDate.getDate()
      );
      
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      // If the last activity was before yesterday, reset streak
      if (lastActivityDay.getTime() < yesterday.getTime()) {
        const resetData = {
          currentStreak: 0,
          lastActivityDate: null,
          updatedAt: serverTimestamp(),
        };
        
        await updateDoc(streakRef, resetData);
        return { ...streakData, ...resetData, streakActive: false };
      }
      
      // Check if they have activity today to mark streak as active
      const streakActive = lastActivityDay.getTime() === today.getTime();
      return { ...streakData, streakActive };
    } else {
      // Initialize streak data if it doesn't exist
      const initialStreakData = {
        currentStreak: 0,
        highestStreak: 0,
        lastActivityDate: null,
        activityCounts: {
          posts: 0,
          comments: 0,
          likes: 0
        },
        streakActive: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      
      await setDoc(streakRef, initialStreakData);
      return initialStreakData;
    }
  } catch (error) {
    console.error('Error getting user streak:', error);
    throw error;
  }
};

/**
 * Check if user has already performed any activity today to update streak
 * @param {string} userId - The user ID
 * @returns {Promise<boolean>} Whether user has already recorded an activity today
 */
const hasActivityToday = async (userId) => {
  try {
    const streakRef = doc(db, 'streaks', userId);
    const streakDoc = await getDoc(streakRef);
    
    if (!streakDoc.exists()) return false;
    
    const streakData = streakDoc.data();
    const lastActivityDate = streakData.lastActivityDate ? new Date(streakData.lastActivityDate) : null;
    
    if (!lastActivityDate) return false;
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const lastActivityDay = new Date(
      lastActivityDate.getFullYear(), 
      lastActivityDate.getMonth(), 
      lastActivityDate.getDate()
    );
    
    return lastActivityDay.getTime() === today.getTime();
  } catch (error) {
    console.error('Error checking today activity:', error);
    return false;
  }
};

/**
 * Update user streak and activity counts based on activity type
 * @param {string} userId - The user ID
 * @param {string} activityType - Type of activity ('posts', 'comments', 'likes')
 * @returns {Promise<Object>} Updated streak information
 */
export const updateUserActivityStreak = async (userId, activityType) => {
  try {
    if (!userId) throw new Error('User ID is required');
    if (!['posts', 'comments', 'likes'].includes(activityType)) {
      throw new Error('Invalid activity type');
    }
    
    const streakRef = doc(db, 'streaks', userId);
    const streakDoc = await getDoc(streakRef);
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Check if user already had an activity today
    const hadActivityToday = await hasActivityToday(userId);
    
    // Initialize streak data if it doesn't exist
    if (!streakDoc.exists()) {
      const initialStreak = {
        currentStreak: 1,
        highestStreak: 1,
        lastActivityDate: today.toISOString(),
        activityCounts: {
          posts: activityType === 'posts' ? 1 : 0,
          comments: activityType === 'comments' ? 1 : 0,
          likes: activityType === 'likes' ? 1 : 0
        },
        streakActive: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      
      await setDoc(streakRef, initialStreak);
      return { ...initialStreak, streakIncreased: true, streakStarted: true };
    }
    
    const streakData = streakDoc.data();
    const lastActivityDate = streakData.lastActivityDate ? new Date(streakData.lastActivityDate) : null;
    
    // Always update the activity count
    const updatedActivityCounts = {
      ...streakData.activityCounts || {
        posts: 0,
        comments: 0,
        likes: 0
      }
    };
    updatedActivityCounts[activityType] = (updatedActivityCounts[activityType] || 0) + 1;
    
    // If user already had an activity today, just update the activity count
    if (hadActivityToday) {
      const updateData = {
        activityCounts: updatedActivityCounts,
        updatedAt: serverTimestamp(),
        streakActive: true
      };
      
      await updateDoc(streakRef, updateData);
      return { 
        currentStreak: streakData.currentStreak,
        highestStreak: streakData.highestStreak,
        streakIncreased: false,
        streakActive: true,
        activityCounts: updatedActivityCounts
      };
    }
    
    // If lastActivityDate is null, this is the first activity
    if (!lastActivityDate) {
      const updatedStreak = {
        currentStreak: 1,
        highestStreak: Math.max(1, streakData.highestStreak || 0),
        lastActivityDate: today.toISOString(),
        activityCounts: updatedActivityCounts,
        streakActive: true,
        updatedAt: serverTimestamp(),
      };
      
      await updateDoc(streakRef, updatedStreak);
      return { ...updatedStreak, streakIncreased: true, streakStarted: true };
    }
    
    // Get the date components (year, month, day) to compare dates properly
    const lastActivityDay = new Date(
      lastActivityDate.getFullYear(), 
      lastActivityDate.getMonth(), 
      lastActivityDate.getDate()
    );
    
    // Yesterday's date for comparison
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // If they had activity yesterday, increment streak
    if (lastActivityDay.getTime() === yesterday.getTime()) {
      const newStreak = streakData.currentStreak + 1;
      const updatedStreak = {
        currentStreak: newStreak,
        highestStreak: Math.max(newStreak, streakData.highestStreak || 0),
        lastActivityDate: today.toISOString(),
        activityCounts: updatedActivityCounts,
        streakActive: true,
        updatedAt: serverTimestamp(),
      };
      
      await updateDoc(streakRef, updatedStreak);
      return { ...updatedStreak, streakIncreased: true, streakContinued: true };
    } 
    // If they missed a day or more, reset streak to 1
    else if (lastActivityDay.getTime() < yesterday.getTime()) {
      const updatedStreak = {
        currentStreak: 1,
        highestStreak: streakData.highestStreak || 0,
        lastActivityDate: today.toISOString(),
        activityCounts: updatedActivityCounts,
        streakActive: true,
        updatedAt: serverTimestamp(),
      };
      
      await updateDoc(streakRef, updatedStreak);
      return { ...updatedStreak, streakIncreased: true, streakRestarted: true };
    }
    
    // Shouldn't reach here, but just in case
    return { 
      currentStreak: streakData.currentStreak,
      highestStreak: streakData.highestStreak,
      streakIncreased: false,
      streakActive: true,
      activityCounts: updatedActivityCounts
    };
  } catch (error) {
    console.error('Error updating user activity streak:', error);
    throw error;
  }
};

/**
 * Increment user streak for posting
 * @param {string} userId - The user ID
 * @returns {Promise<Object>} Updated streak information
 */
export const incrementUserStreak = async (userId) => {
  return updateUserActivityStreak(userId, 'posts');
};

/**
 * Increment user streak for commenting
 * @param {string} userId - The user ID
 * @returns {Promise<Object>} Updated streak information
 */
export const incrementCommentStreak = async (userId) => {
  return updateUserActivityStreak(userId, 'comments');
};

/**
 * Increment user streak for liking
 * @param {string} userId - The user ID
 * @returns {Promise<Object>} Updated streak information
 */
export const incrementLikeStreak = async (userId) => {
  return updateUserActivityStreak(userId, 'likes');
};

/**
 * Reset a user's streak
 * @param {string} userId - The user ID
 * @returns {Promise<void>}
 */
export const resetUserStreak = async (userId) => {
  try {
    const streakRef = doc(db, 'streaks', userId);
    
    await updateDoc(streakRef, {
      currentStreak: 0,
      lastActivityDate: null,
      streakActive: false,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error resetting user streak:', error);
    throw error;
  }
};

/**
 * Get user's activity counts
 * @param {string} userId - The user ID
 * @returns {Promise<Object>} Activity counts
 */
export const getUserActivityCounts = async (userId) => {
  try {
    const streakData = await getUserStreak(userId);
    return streakData.activityCounts || {
      posts: 0,
      comments: 0,
      likes: 0
    };
  } catch (error) {
    console.error('Error getting user activity counts:', error);
    throw error;
  }
};

/**
 * Check if user has achieved milestone (target number of activities)
 * @param {string} userId - The user ID
 * @param {string} activityType - Type of activity ('posts', 'comments', 'likes')
 * @param {number} targetCount - Target count to check
 * @returns {Promise<boolean>} Whether the milestone is achieved
 */
export const checkActivityMilestone = async (userId, activityType, targetCount) => {
  try {
    const activityCounts = await getUserActivityCounts(userId);
    return (activityCounts[activityType] || 0) >= targetCount;
  } catch (error) {
    console.error('Error checking activity milestone:', error);
    return false;
  }
};