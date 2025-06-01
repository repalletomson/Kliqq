import { collection, query, where, orderBy, addDoc, getDocs, doc, updateDoc, arrayUnion, getDoc, arrayRemove,increment ,deleteDoc, limit,serverTimestamp} from 'firebase/firestore';
// import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';
// import { db } from '../config/firebase';
import { ref, uploadBytes, getDownloadURL,deleteObject } from 'firebase/storage';
import { db, storage } from '../config/firebaseConfig';
import { Alert } from 'react-native';
import { useAuth } from '../context/authContext';
// import firestore from '@react-native-firebase/firestore'
export  async function createPost( postData, mediaFile,user) {
  // Ensure this is correctly fetching the authenticated user
  try {
    // const { user } = useAuth();
    let mediaUrl = null;
// console.log("postAPP data",userData,postData,mediaFile)
    if (mediaFile) {
      const response = await fetch(mediaFile.uri);
      const blob = await response.blob();
      
      const fileName = `${Date.now()}_${mediaFile.fileName || 'image.jpg'}`;
      const storageRef = ref(storage, `posts/${userData.userId}/${fileName}`);
      
      const uploadTask = await uploadBytes(storageRef, blob);
      mediaUrl = await getDownloadURL(uploadTask.ref);
    }
      
    const post = {
      userId: user?.userId ,
      content: postData?.content,
      category: postData?.category,
      mediaUrl,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
      likes: 0,
      comments: [],
      // Add user information to the post
      userName: user?.fullName || 'Anonymous',
      userAvatar:user?.profileUrl || 'https://via.placeholder.com/40',
    };

    // console.log("Creating post with data:", post ,"user",user);

    if (user?.uid) {
    const addedPost = await addDoc(collection(db, 'posts'), post);
    return addedPost;
    }
  } catch (error) {
     console.log("Error creating post:", error.message);
  }
}

// export async function getFeedPosts() {
//   try {
//     const now = new Date().toISOString();
//     const q = query(
//       collection(db, 'posts'),
//       where('expiresAt', '>', now),
//       orderBy('createdAt', 'desc')
//     );

//     const snapshot = await getDocs(q);
//     return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
//   } catch (error) {
//     console.error("Error fetching feed posts:", error.message);
//     return []; // Returning an empty array as a fallback
//   }
// }
// export const incrementViews = async (postId) => {
//   const postRef = doc(db, 'posts', postId);
//   return increment(postRef, 'views', 1);
// };
export const getFeedPosts = async () => {
  try {
    console.log("Fetching feed posts...");
    const now = new Date().toISOString();
    const q = query(
      collection(db, 'posts')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data(),
      createdAt: doc.data().createdAt || now,
      expiresAt: doc.data().expiresAt || new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()
    }));
  } catch (error) {
    console.error("Error fetching feed posts:", error);
    return [];
  }
};
  // const snapshot = await getDocs(q);
  // return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

// Function to add a comment to a post
const addComment = async (postId, commentData, user) => {
  try {
    // Validate inputs
    console.log("commentData in addcomments",commentData)
    if (!postId || !commentData || !user) {
      console.error("Missing required data for adding comment");
      return null;
    }
    console.log("user in addcomments",user)
    // Create the comment object
    const comment = {
      id: Math.random().toString(36) ,// Generate a random ID for the comment
      userId: user.uid,
      userName: user.fullName|| 'Anonymous',
      userAvatar: user.photoURL || 'default_avatar_url',
      content: commentData.content,
      createdAt: new Date().toISOString(),
    };

    // Get reference to the post document
    const postRef = doc(db, "posts", postId);
  console.log("comment",comment)
    // Add the comment to the post's comments array
    await updateDoc(postRef, {
      comments: arrayUnion(comment)
    });

    console.log("Comment added successfully");
    return comment;

  } catch (error) {
    console.error("Error adding comment:", error);
    throw error;
  }
};

// Function to get all comments for a post
const getComments = async (postId) => {
  try {
    const postRef = doc(db, "posts", postId);
    const postSnap = await getDoc(postRef);

    if (postSnap.exists()) {
      return postSnap.data().comments || [];
    }
    return [];
  } catch (error) {
    console.error("Error fetching comments:", error);
    return [];
  }
};

// Function to delete a comment
const deleteComment = async (postId, commentId) => {
  try {
    const postRef = doc(db, "posts", postId);
    const postSnap = await getDoc(postRef);

    if (postSnap.exists()) {
      const post = postSnap.data();
      const updatedComments = post.comments.filter(
        comment => comment.id !== commentId
      );

      await updateDoc(postRef, {
        comments: updatedComments
      });

      console.log("Comment deleted successfully");
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error deleting comment:", error);
    throw error;
  }
};

// Add like to post
const addLike = async (postId, user) => {
  try {
    if (!postId || !user) {
      console.error("Missing required data for adding like");
      return null;
    }

    const postRef = doc(db, "posts", postId);
    const postSnap = await getDoc(postRef);

    if (!postSnap.exists()) {
      console.error("Post not found");
      return null;
    }

    const like = {
      userId: user.uid,
      userName: user.displayName || 'Anonymous',
      createdAt: new Date().toISOString()
    };

    await updateDoc(postRef, {
      likes: arrayUnion(like)
    });

    return like;
  } catch (error) {
    console.error("Error adding like:", error);
    throw error;
  }
};

// Remove like from post
const removeLike = async (postId, user) => {
  try {
    if (!postId || !user) {
      console.error("Missing required data for removing like");
      return null;
    }

    const postRef = doc(db, "posts", postId);
    const postSnap = await getDoc(postRef);

    if (!postSnap.exists()) {
      console.error("Post not found");
      return null;
    }

    // Find the existing like object
    const currentLikes = postSnap.data().likes || [];
    const updatedLikes = currentLikes.filter(like => like.userId !== user.uid);

    // Update with the filtered likes array
    await updateDoc(postRef, {
      likes: updatedLikes
    });

    return true;
  } catch (error) {
    console.error("Error removing like:", error);
    throw error;
  }
};

// Get likes for a post
const getLikes = async (postId) => {
  try {
    const postRef = doc(db, "posts", postId);
    const postSnap = await getDoc(postRef);

    if (postSnap.exists()) {
      return postSnap.data().likes || [];
    }
    return [];
  } catch (error) {
    console.error("Error fetching likes:", error);
    return [];
  }
};

// In ../app/(apis)/post.js

export const deletePost = async (postId) => {
  try {
    const postRef = doc(db, "posts", postId);

    // Fetch the post document
    const postSnap = await getDoc(postRef);
    if (!postSnap.exists()) {
      throw new Error("Post not found");
    }

    const postData = postSnap.data();
    const mediaUrls = postData.mediaUrls || []; // Ensure it's an array

    // Delete each image from Firebase Storage
    for (const url of mediaUrls) {
      const storagePath = extractStoragePath(url);
      if (storagePath) {
        const imageRef = ref(storage, storagePath);
        await deleteObject(imageRef);
      }
    }

    // Delete the post document from Firestore
    await deleteDoc(postRef);

    console.log("Post and associated images deleted successfully");
  } catch (error) {
    console.error("Error deleting post:", error);
    throw new Error("Failed to delete post and images");
  }
};

// Function to extract storage path from Firebase Storage URL
const extractStoragePath = (url) => {
  try {
    const decodedUrl = decodeURIComponent(url); // Decode URL
    const match = decodedUrl.match(/o\/([^?]*)/); // Extract the path after 'o/'
    return match ? match[1] : null; // Return the storage path
  } catch (error) {
    console.error("Error extracting storage path:", error);
    return null;
  }
};

// Get the current share count for a post
export const getShareCount = async (postId) => {
  try {
    const postRef = doc(db, 'posts', postId);
    const postDoc = await getDoc(postRef);
    
    if (postDoc.exists()) {
      return postDoc.data().shareCount || 0;
    }
    return 0;
  } catch (error) {
    console.error('Error getting share count:', error);
    throw error;
  }
};

// Increment the share count for a post
export const incrementShareCount = async (postId) => {
  try {
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, {
      shareCount: increment(1)
    });
  } catch (error) {
    console.error('Error incrementing share count:', error);
    throw error;
  }
};

// Check if user has liked post
const hasUserLiked = (likes, userId) => {
  return likes.some(like => like.userId === userId);
};




// export const fetchHotPosts = async () => {
//   try {
//     // Create a query to fetch most engaging posts
//     const hotPostsQuery = query(
//       collection(db, 'posts'),
//       orderBy('likes', 'desc'),  // Sort by likes
//       orderBy('comments', 'desc'),  // Then by comments
//       limit(10)  // Fetch top 10 hot posts
//     );

//     const hotPostsSnapshot = await getDocs(hotPostsQuery);
    
//     return hotPostsSnapshot.docs.map(doc => ({
//       id: doc.id,
//       ...doc.data()
//     }));
//   } catch (error) {
//     console.error('Error fetching hot posts:', error);
//     return [];
//   }
// };
export const fetchHotPosts = async (collegeId) => {
  try {
    // Check if there are enough posts first
    const postsCountSnapshot = await getCountFromServer(query(collection(db, 'posts'), where('college', '==', collegeId)));
    
    if (postsCountSnapshot.data().count < 10) {
      return null; // Not enough posts to determine a hot post
    }
    
    // Get the current date at midnight
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get the previous day date
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Create a query to fetch the most engaging post from the previous day
    const hotPostsQuery = query(
      collection(db, 'posts'),
      where('college', '==', collegeId),
      where('createdAt', '>=', yesterday),
      where('createdAt', '<', today)
    );
    
    const hotPostsSnapshot = await getDocs(hotPostsQuery);
    
    if (hotPostsSnapshot.empty) {
      return null;
    }
    
    // Sort the posts by engagement (likes + comments)
    const posts = hotPostsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      // Calculate total engagement score
      engagementScore: (doc.data().likes || 0) + (doc.data().comments?.length || 0)
    }));
    
    // Sort by engagement score, then by timestamp if tied
    posts.sort((a, b) => {
      if (b.engagementScore !== a.engagementScore) {
        return b.engagementScore - a.engagementScore;
      }
      // If engagement is the same, sort by most recent
      return b.createdAt.toDate() - a.createdAt.toDate();
    });
    
    // Return only the top post
    return posts.length > 0 ? posts[0] : null;
    
  } catch (error) {
    console.error('Error fetching hot post:', error);
    return null;
  }
};
export const reportPost = async (postId, reporterId) => {
  try {
    const reportsRef = collection(db, 'postReports');
    return await addDoc(reportsRef, {
      postId,
      reporterId,
      timestamp: new Date(),
      status: 'pending'
    });
  } catch (error) {
    console.error('Error reporting post:', error);
    throw error;
  }
};

export const incrementViews = async (postId, userId) => {
  try {
    const postRef = doc(db, 'posts', postId);
    
    // Increment views atomically
    await updateDoc(postRef, {
      views: increment(1),
      viewedBy: arrayUnion(userId)
    });
  } catch (error) {
    console.error('Error incrementing views:', error);
  }
};

export const getViews = async (postId) => {
  try {
    const postRef = doc(db, 'posts', postId);
    const postSnap = await getDoc(postRef);
    
    return postSnap.data()?.views || 0;
  } catch (error) {
    console.error('Error fetching views:', error);
    return 0;
  }
};

// const handleAddPost = async (postData) => {
//   try {
//     const postRef = await firestore.collection("posts").add(postData)
//     return postRef.id
//   } catch (error) {
//     console.error("Error adding post:", error)
//     throw error
//   }
// }

// const handleDeletePost = async (postId) => {
//   try {
//     // Delete associated likes
//     const likesSnapshot = await firestore.collection("likes").where("postId", "==", postId).get()
//     const batch = firestore.batch()
//     likesSnapshot.forEach((doc) => batch.delete(doc.ref))
//     await batch.commit()

//     // Delete associated saves
//     const savesSnapshot = await firestore.collection("savedPosts").where("postId", "==", postId).get()
//     const saveBatch = firestore.batch()
//     savesSnapshot.forEach((doc) => saveBatch.delete(doc.ref))
//     await saveBatch.commit()

//     // Delete associated reports
//     const reportsSnapshot = await firestore.collection("reports").where("postId", "==", postId).get()
//     const reportBatch = firestore.batch()
//     reportsSnapshot.forEach((doc) => reportBatch.delete(doc.ref))
//     await reportBatch.commit()

//     // Delete the post
//     await firestore.collection("posts").doc(postId).delete()
//   } catch (error) {
//     console.error("Error deleting post:", error)
//     throw error
//   }
// }

// // Report Post
// const handleReportPost = async (postId, userId, reason) => {
//   try {
//     await firestore.collection("reports").add({
//       reported_by: userId,
//       postId: postId,
//       reason: reason,
//       timestamp: new Date(),
//     })
//   } catch (error) {
//     console.error("Error reporting post:", error)
//     throw error
//   }
// }

// // Save/Unsave Post
// const handleSavePost = async (postId, userId) => {
//   try {
//     await firestore.collection("savedPosts").add({
//       userId: userId,
//       postId: postId,
//       timestamp: new Date(),
//     })
//   } catch (error) {
//     console.error("Error saving post:", error)
//     throw error
//   }
// }

// const handleUnsavePost = async (postId, userId) => {
//   try {
//     const snapshot = await firestore
//       .collection("savedPosts")
//       .where("userId", "==", userId)
//       .where("postId", "==", postId)
//       .get()
//     const batch = firestore.batch()
//     snapshot.forEach((doc) => batch.delete(doc.ref))
//     await batch.commit()
//   } catch (error) {
//     console.error("Error unsaving post:", error)
//     throw error
//   }
// }

// const getSavedPosts = async (userId) => {
//   try {
//     const snapshot = await firestore
//       .collection("savedPosts")
//       .where("userId", "==", userId)
//       .get()
//     const savedPosts = []
//     for (const doc of snapshot.docs) {
//       const postData = await firestore.collection("posts").doc(doc.data().postId).get()
//       if (postData.exists) {
//         savedPosts.push({ id: postData.id, ...postData.data() })
//       }
//     }
//     return savedPosts
//   } catch (error) {
//     console.error("Error fetching saved posts:", error)
//     throw error
//   }
// }
const handleDeletePost = async (postId) => {
  try {
    // Delete associated likes
    const likesRef = collection(db, "likes");
    const likesQuery = query(likesRef, where("postId", "==", postId));
    const likesSnapshot = await getDocs(likesQuery);
    
    for (const document of likesSnapshot.docs) {
      await deleteDoc(doc(db, "likes", document.id));
    }

    // Delete associated saves
    const savesRef = collection(db, "savedPosts");
    const savesQuery = query(savesRef, where("postId", "==", postId));
    const savesSnapshot = await getDocs(savesQuery);
    
    for (const document of savesSnapshot.docs) {
      await deleteDoc(doc(db, "savedPosts", document.id));
    }

    // Delete associated reports
    const reportsRef = collection(db, "reports");
    const reportsQuery = query(reportsRef, where("postId", "==", postId));
    const reportsSnapshot = await getDocs(reportsQuery);
    
    for (const document of reportsSnapshot.docs) {
      await deleteDoc(doc(db, "reports", document.id));
    }

    // Delete the post itself
    await deleteDoc(doc(db, "posts", postId));
  } catch (error) {
    console.error("Error deleting post:", error);
    throw error;
  }
};

/**
 * Reports a post
 * @param {string} postId - The post ID to report
 * @param {string} userId - The user ID reporting the post
 * @param {string} reason - The reason for reporting
 * @returns {Promise<void>}
 */
const handleReportPost = async (postId, userId, reason) => {
  try {
    const reportsRef = collection(db, "reports");
    await addDoc(reportsRef, {
      reported_by: userId,
      postId: postId,
      reason: reason,
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error reporting post:", error);
    throw error;
  }
};

/**
 * Saves a post for a user
 * @param {string} postId - The post ID to save
 * @param {string} userId - The user ID saving the post
 * @returns {Promise<void>}
 */
const savePost = async (postId, userId) => {
  try {
    const savedPostsRef = collection(db, "savedPosts");
    await addDoc(savedPostsRef, {
      userId: userId,
      postId: postId,
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error saving post:", error);
    throw error;
  }
};

/**
 * Unsaves a post for a user
 * @param {string} postId - The post ID to unsave
 * @param {string} userId - The user ID unsaving the post
 * @returns {Promise<void>}
 */
const unsavePost = async (postId, userId) => {
  try {
    const savedPostsRef = collection(db, "savedPosts");
    const q = query(savedPostsRef, where("userId", "==", userId), where("postId", "==", postId));
    const snapshot = await getDocs(q);
    
    snapshot.forEach(async (document) => {
      await deleteDoc(doc(db, "savedPosts", document.id));
    });
  } catch (error) {
    console.error("Error unsaving post:", error);
    throw error;
  }
};

/**
 * Gets all saved posts for a user
 * @param {string} userId - The user ID to get saved posts for
 * @returns {Promise<Array>} - Array of saved posts
 */
const getSavedPosts = async (userId) => {
  try {
    const savedPostsRef = collection(db, "savedPosts");
    const q = query(savedPostsRef, where("userId", "==", userId));
    const snapshot = await getDocs(q);
    
    const savedPosts = [];
    for (const document of snapshot.docs) {
      const postData = await getDoc(doc(db, "posts", document.data().postId));
      if (postData.exists()) {
        savedPosts.push({ id: postData.id, ...postData.data() });
      }
    }
    return savedPosts;
  } catch (error) {
    console.error("Error fetching saved posts:", error);
    throw error;
  }
};



export {  handleDeletePost,
  handleReportPost,
  savePost,
  unsavePost,
  getSavedPosts,addComment, getComments, deleteComment, addLike, removeLike, getLikes, hasUserLiked  };



// const handleDeletePost = async (postId) => {
//     try {
//       // Delete associated likes
//       const likesSnapshot = await firestore().collection("likes").where("postId", "==", postId).get();
//       const batch = firestore().batch();
//       likesSnapshot.forEach((doc) => batch.delete(doc.ref));
//       await batch.commit();
  
//       // Delete associated saves
//       const savesSnapshot = await firestore().collection("savedPosts").where("postId", "==", postId).get();
//       const saveBatch = firestore().batch();
//       savesSnapshot.forEach((doc) => saveBatch.delete(doc.ref));
//       await saveBatch.commit();
  
//       // Delete associated reports
//       const reportsSnapshot = await firestore().collection("reports").where("postId", "==", postId).get();
//       const reportBatch = firestore().batch();
//       reportsSnapshot.forEach((doc) => reportBatch.delete(doc.ref));
//       await reportBatch.commit();
  
//       // Delete the post
//       await firestore().collection("posts").doc(postId).delete();
//     } catch (error) {
//       console.error("Error deleting post:", error);
//       throw error;
//     }
//   };
  
//   /** Report a post to Firestore */
//    const handleReportPost = async (postId, userId, reason) => {
//     try {
//       await firestore().collection("reports").add({
//         reported_by: userId,
//         postId: postId,
//         reason: reason,
//         timestamp: firestore.FieldValue.serverTimestamp(),
//       });
//     } catch (error) {
//       console.error("Error reporting post:", error);
//       throw error;
//     }
//   };
  
//   /** Save a post to Firestore */
//    const handleSavePost = async (postId, userId) => {
//     try {
//       await firestore().collection("savedPosts").add({
//         userId: userId,
//         postId: postId,
//         timestamp: firestore.FieldValue.serverTimestamp(),
//       });
//     } catch (error) {
//       console.error("Error saving post:", error);
//       throw error;
//     }
//   };
  
//   /** Unsave a post from Firestore */
//    const handleUnsavePost = async (postId, userId) => {
//     try {
//       const snapshot = await firestore()
//         .collection("savedPosts")
//         .where("userId", "==", userId)
//         .where("postId", "==", postId)
//         .get();
//       const batch = firestore().batch();
//       snapshot.forEach((doc) => batch.delete(doc.ref));
//       await batch.commit();
//     } catch (error) {
//       console.error("Error unsaving post:", error);
//       throw error;
//     }
//   };
  
//   /** Get all saved posts for a user */
//    const getSavedPosts = async (userId) => {
//     try {
//       const snapshot = await firestore()
//         .collection("savedPosts")
//         .where("userId", "==", userId)
//         .get();
//       const savedPosts = [];
//       for (const doc of snapshot.docs) {
//         const postData = await firestore().collection("posts").doc(doc.data().postId).get();
//         if (postData.exists) {
//           savedPosts.push({ id: postData.id, ...postData.data() });
//         }
//       }
//       return savedPosts;
//     } catch (error) {
//       console.error("Error fetching saved posts:", error);
//       throw error;
//     }
//   };
  
//   /** Add a comment to a post */
//  const addComment = async (postId, commentData) => {
//     try {
//       await firestore()
//         .collection("posts")
//         .doc(postId)
//         .collection("comments")
//         .add(commentData);
//     } catch (error) {
//       console.error("Error adding comment:", error);
//       throw error;
//     }
//   };
  