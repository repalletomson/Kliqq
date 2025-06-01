import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  Image, 
  TextInput, 
  TouchableOpacity, 
  Modal, 
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Pressable
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { doc, getDoc, collection, onSnapshot, query, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../config/firebaseConfig';
import { useAuth } from '../../../context/authContext';
import {
  addComment,
  getComments,
  addLike,
  removeLike,
  getLikes,
  incrementViews,
  getViews,
  deletePost,
  reportPost,
  fetchHotPosts,
  incrementShareCount,
  getShareCount,
  savePost,
  unsavePost,
  getSavedPosts,
} from "../../../(apis)/post"

// const secondaryTextColor='#815ac0'
const secondaryTextColor='#B2B3B2'
export default function  PostDetailView  ()  {
  const { postId } = useLocalSearchParams();
  const router = useRouter();  
  const { user } = useAuth();  
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [isSaved,setIsSaved]=useState(false)
  const scrollViewRef = useRef();
  const commentInputRef = useRef();
const [isLikeProcessing, setIsLikeProcessing] = useState(false);
const [likes, setLikes] = useState(0);
const[isLike,setIsLike]=useState(false)

  useEffect(() => {
    const fetchPostDetails = async () => {
      try {
        const postRef = doc(db, 'posts', postId);
        const postSnap = await getDoc(postRef);
        
        if (postSnap.exists()) {
          const postData = { id: postSnap.id, ...postSnap.data() };
          setPost(postData);
          
          // Check if user has liked this post
          const userLikes = postData.likes || [];
          setIsLiked(userLikes.includes(user?.uid));
        }
      } catch (error) {
        console.error('Error fetching post details:', error);
      }
    };

    fetchPostDetails();
    
    // Real-time comments listener
    const commentsRef = collection(db, 'posts', postId, 'comments');
    const q = query(commentsRef, orderBy('timestamp', 'asc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const commentsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        replies: []
      }));
      
      // Fetch replies for each comment
      commentsData.forEach(comment => {
        const repliesRef = collection(db, 'posts', postId, 'comments', comment.id, 'replies');
        const repliesQuery = query(repliesRef, orderBy('timestamp', 'asc'));
        
        onSnapshot(repliesQuery, (repliesSnapshot) => {
          const replies = repliesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          
          setComments(prevComments => 
            prevComments.map(c => 
              c.id === comment.id ? { ...c, replies } : c
            )
          );
        });
      });
      
      setComments(commentsData);
    });
    
    return () => unsubscribe();
  }, [postId, user]);
  // useEffect(() => {
  //   const fetchInitialData = async () => {
  //     try {
  //       // Fetch Comments
  //       setIsLoading(true)
  //       // const fetchedComments = await getComments(post.id)
  //       // setComments(fetchedComments)

  //       // Fetch Likes
  //       const fetchedLikes = await getLikes(postId)
  //       setLikes(fetchedLikes.length)

  //       // Check if User has Liked
  //       const userLiked = fetchedLikes.some((like) => like.userId === user?.uid)
  //       setIsLiked(userLiked)

  //       // Fetch Views
        
  //       // Fetch Share Count
  //       // const fetchedShareCount = await getShareCount(post.id)
  //       // setShareCount(fetchedShareCount || 0)
         
  //       setIsLoading(false)
  //       // Check if post is saved by user
  //       // const savedPosts = await getSavedPosts(user?.uid)
  //       // setIsSaved(savedPosts.some(savedPost => savedPost.postId === post.id))
  //     } catch (error) {
  //       console.error("Error fetching initial data:", error)
  //     }
  //   }

  //   fetchInitialData()
  // }, [post.id, user])

  const renderCommentItem = (item, isReply = false) => (
    <View key={item.id} className={`border-b border-gray-800 ${isReply ? 'ml-8 mt-1' : 'mt-3'}`}>
      <View className="flex-row justify-between items-start">
        <View className="flex-row items-start">
          <Image 
            source={{ uri: item.isAnonymous ? 'https://cdn-icons-png.flaticon.com/512/149/149071.png' : item.userAvatar }} 
            className="w-10 h-10 rounded-full mr-3" 
          />
          <View className="flex-1">
            <View className="flex-row items-center">
              <Text className="text-white font-bold">
                {item.isAnonymous ? 'Anonymous' : item.userName}
              </Text>
              {item.isCurrentUser && (
                <View className="bg-gray-700 rounded-full px-2 py-0.5 ml-2">
                  <Text className="text-gray-300 text-xs">Me</Text>
                </View>
              )}
              <Text className="text-gray-500 ml-2 text-xs">
                {formatTimestamp(item.timestamp)}
              </Text>
            </View>
            <Text className="text-white py-1">{item.content}</Text>
          </View>
        </View>
        <TouchableOpacity className="px-2">
          <MaterialIcons name="more-vert" size={20} color="#999" />
        </TouchableOpacity>
      </View>
      
      {!isReply && (
        <View className="flex-row ml-12 mb-2">
          <TouchableOpacity className="flex-row items-center mr-4" onPress={() => handleLikeComment(item.id)}>
            <Ionicons name={item.liked ? "heart" : "heart-outline"} size={18} color={item.liked ? "#f44" : "#999"} />
            <Text className="text-gray-400 ml-1 text-xs">{item.likes || 0}</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            className="flex-row items-center" 
            onPress={() => handleReplyPress(item.id, item.isAnonymous ? 'Anonymous' : item.userName)}
          >
            <Ionicons name="chatbubble-outline" size={16} color="#999" />
            <Text className="text-gray-400 ml-1 text-xs">Reply</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {!isReply && item.replies && item.replies.map(reply => renderCommentItem(reply, true))}
    </View>
  );

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    
    const now = new Date();
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHrs = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHrs / 24);
    
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHrs < 24) return `${diffHrs}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  const renderImageGrid = () => {
    if (!post?.mediaUrls?.length) return null;

    const images = post.mediaUrls;
    const imageCount = images.length;
    
    return (
      <View className="mt-3 rounded-lg overflow-hidden">
        {imageCount === 1 && (
          <TouchableOpacity onPress={() => setSelectedImage(images[0])}>
            <Image 
              source={{ uri: images[0] }} 
              className="w-full h-72 rounded-lg"
              resizeMode="cover"
            />
          </TouchableOpacity>
        )}
        
        {imageCount === 2 && (
          <View className="flex-row">
            {images.map((url, index) => (
              <TouchableOpacity 
                key={index} 
                onPress={() => setSelectedImage(url)}
                className="flex-1 h-60 p-0.5"
              >
                <Image 
                  source={{ uri: url }} 
                  className="w-full h-full rounded-lg"
                  resizeMode="cover"
                />
              </TouchableOpacity>
            ))}
          </View>
        )}
        
        {imageCount === 3 && (
          <View className="flex-row flex-wrap">
            <TouchableOpacity 
              onPress={() => setSelectedImage(images[0])}
              className="w-1/2 h-80 p-0.5"
            >
              <Image 
                source={{ uri: images[0] }} 
                className="w-full h-full rounded-lg"
                resizeMode="cover"
              />
            </TouchableOpacity>
            <View className="w-1/2 h-80">
              <TouchableOpacity 
                onPress={() => setSelectedImage(images[1])}
                className="w-full h-1/2 p-0.5"
              >
                <Image 
                  source={{ uri: images[1] }} 
                  className="w-full h-full rounded-lg"
                  resizeMode="cover"
                />
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => setSelectedImage(images[2])}
                className="w-full h-1/2 p-0.5"
              >
                <Image 
                  source={{ uri: images[2] }} 
                  className="w-full h-full rounded-lg"
                  resizeMode="cover"
                />
              </TouchableOpacity>
            </View>
          </View>
        )}
        
        {imageCount >= 4 && (
          <View className="flex-row flex-wrap">
            <View className="w-1/2 h-60">
              <TouchableOpacity 
                onPress={() => setSelectedImage(images[0])}
                className="w-full h-full p-0.5"
              >
                <Image 
                  source={{ uri: images[0] }} 
                  className="w-full h-full rounded-lg"
                  resizeMode="cover"
                />
              </TouchableOpacity>
            </View>
            <View className="w-1/2 h-60">
              <TouchableOpacity 
                onPress={() => setSelectedImage(images[1])}
                className="w-full h-1/2 p-0.5"
              >
                <Image 
                  source={{ uri: images[1] }} 
                  className="w-full h-full rounded-lg"
                  resizeMode="cover"
                />
              </TouchableOpacity>
              <View className="flex-row h-1/2">
                <TouchableOpacity 
                  onPress={() => setSelectedImage(images[2])}
                  className="w-1/2 h-full p-0.5"
                >
                  <Image 
                    source={{ uri: images[2] }} 
                    className="w-full h-full rounded-lg"
                    resizeMode="cover"
                  />
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => setSelectedImage(images[3])}
                  className="w-1/2 h-full p-0.5 relative"
                >
                  <Image 
                    source={{ uri: images[3] }} 
                    className="w-full h-full rounded-lg"
                    resizeMode="cover"
                  />
                  {imageCount > 4 && (
                    <View className="absolute inset-0 bg-black/60 items-center justify-center rounded-lg">
                      <Text className="text-white text-xl font-bold">+{imageCount - 4}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </View>
    );
  };
 const handleLike = async () => {
    if (!user) {
      Alert.alert("Sign In Required", "Please sign in to like posts");
      return;
    }
    
    // Prevent multiple rapid clicks by disabling interaction temporarily
    if (isLikeProcessing) return;
    
    try {
      setIsLikeProcessing(true); // Add this state to track like processing
      
      if (isLiked) {
        await removeLike(post.id, user);
        setLikes((prev) => Math.max(0, prev - 1));
        setIsLiked(false);
      } else {
        await addLike(post.id, user);
        setLikes((prev) => prev + 1);
        setIsLiked(true);
      }
    } catch (error) {
      console.error("Like error:", error);
      Alert.alert("Error", "Unable to process like. Please try again.");
    } finally {
      // Allow new like actions after a short delay
      setTimeout(() => {
        setIsLikeProcessing(false);
      }, 500);
    }
  };
  
  // const handleLike = async () => {
  //   try {
  //     if (isLiked) {
  //       await removeLike(post.id, user);
  //     } else {
  //       await addLike(post.id, user);
  //     }
  //     setIsLiked(!isLiked);
      
  //     // Update post data to reflect like change
  //     setPost(prev => {
  //       const updatedLikes = prev.likes || [];
  //       if (isLiked) {
  //         const filtered = updatedLikes.filter(id => id !== user?.uid);
  //         return { ...prev, likes: filtered, likeCount: (prev.likeCount || 0) - 1 };
  //       } else {
  //         return { ...prev, likes: [...updatedLikes, user?.uid], likeCount: (prev.likeCount || 0) + 1 };
  //       }
  //     });
  //   } catch (error) {
  //     console.error('Like error:', error);
  //   }
  // };
    const handleSavePost = async () => {
      try {
        if (isSaved) {
          await unsavePost(post.id, user.uid)
          setIsSaved(false)
        } else {
          await savePost(post.id, user.uid)
          setIsSaved(true)
        }
      } catch (error) {
        console.error("Save post error:", error)
        Alert.alert("Error", "Unable to save post. Please try again.")
      }
    }

  const handleLikeComment = async (commentId) => {
    // Implementation for liking comments would go here
    console.log("Like comment:", commentId);
  };

  const handleReplyPress = (commentId, userName) => {
    setReplyingTo({ id: commentId, name: userName });
    setNewComment(`@${userName} `);
    if (commentInputRef.current) {
      commentInputRef.current.focus();
    }
    // Scroll to bottom
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      const commentData = {
        content: newComment,
        userName: user?.displayName || 'User',
        userAvatar: user?.photoURL || 'https://cdn-icons-png.flaticon.com/512/149/149071.png',
        timestamp: serverTimestamp(),
        isAnonymous: isAnonymous,
        isCurrentUser: true,
        uid: user?.uid,
        likes: 0
      };

      if (replyingTo) {
        // Add as reply to specific comment
        await addDoc(
          collection(db, 'posts', postId, 'comments', replyingTo.id, 'replies'), 
          commentData
        );
        setReplyingTo(null);
      } else {
        // Add as main comment
        await addDoc(collection(db, 'posts', postId, 'comments'), commentData);
      }
      
      setNewComment('');
    } catch (error) {
      console.error('Comment error:', error);
    }
  };

  const handleBookmark = async () => {
    // Implementation for bookmarking posts would go here
    console.log("Bookmark post:", postId);
  };

  const handleShare = async () => {
    // Implementation for sharing posts would go here
    console.log("Share post:", postId);
  };

  if (!post) return (
    <SafeAreaView className="flex-1 bg-black justify-center items-center">
      <Text className="text-white text-lg">Loading...</Text>
    </SafeAreaView>
  );

  return (
    <SafeAreaView className="flex-1 bg-black">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-800">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-lg font-semibold">Post</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView 
          ref={scrollViewRef} 
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 16 }}
        >
          {/* Post Author */}
          <View className="flex-row justify-between items-center p-4">
            <View className="flex-row items-center">
              <Image 
                source={{ uri: post.userAvatar || 'https://cdn-icons-png.flaticon.com/512/149/149071.png' }} 
                className="w-12 h-12 rounded-full mr-3" 
              />
              <View>
                <Text className="text-white font-bold text-lg">{post.userName || 'Anonymous'}</Text>
                <Text className="text-gray-400">{formatTimestamp(post.timestamp)}</Text>
              </View>
            </View>
            <TouchableOpacity>
              <MaterialIcons name="more-vert" size={24} color="white" />
            </TouchableOpacity>
          </View>

          {/* Post Content */}
          <View className="px-4">
            <Text className="text-white text-lg font-semibold mb-1">{post.title}</Text>
            <Text className="text-gray-300 mb-2">{post.content}</Text>
            {renderImageGrid()}
          </View>

          {/* Post Stats */}
          {/* <View className="flex-row justify-between items-center px-4 py-3 border-t border-b border-gray-800 mt-3">
            <Text className="text-gray-400">{post.likeCount || 0} likes</Text>
            <View className="flex-row">
              <Text className="text-gray-400 mr-3">{comments.length} comments</Text>
              <Text className="text-gray-400">{post.shareCount || 0} shares</Text>
            </View>
          </View> */}

          {/* Action Buttons */}
          {/* <View className="flex-row justify-between items-center px-6 py-3 border-b border-gray-800">
            <TouchableOpacity onPress={handleLike} className="flex-row items-center">
              <Ionicons name={isLiked ? "heart" : "heart-outline"} size={24} color={isLiked ? "#f44" : "white"} />
              <Text className="text-white ml-2">Like</Text>
            </TouchableOpacity>
            
            <TouchableOpacity className="flex-row items-center">
              <Ionicons name="chatbubble-outline" size={22} color="white" />
              <Text className="text-white ml-2">Comment</Text>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={handleShare} className="flex-row items-center">
              <Ionicons name="arrow-redo-outline" size={24} color="white" />
              <Text className="text-white ml-2">Share</Text>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={handleBookmark}>
              <Ionicons name="bookmark-outline" size={24} color="white" />
            </TouchableOpacity>
          </View> */}
             {/* theme */}
              <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-around",
                      paddingVertical: 8,
                      borderTopWidth: 1,
                      borderTopColor:  '#333333',
                    }}
                  >
                    <TouchableOpacity style={{ flexDirection: "row", alignItems: "center" }} onPress={handleLike}>
                      <Ionicons
                        name={isLiked ? "heart" : "heart-outline"}
                        size={24}
                        color={isLiked ? "#815ac0" : secondaryTextColor}
                      />
                      <Text
                        style={{
                          marginLeft: 8,
                          color: isLiked ? "#815ac0" : secondaryTextColor,
                          fontSize: 14,
                        }}
                      >
                        {likes}
                      </Text>
                    </TouchableOpacity>
          
                    <TouchableOpacity
                      style={{ flexDirection: "row", alignItems: "center" }}                    >
                      <Ionicons name="chatbubble-outline" size={24} color={secondaryTextColor} />
                      <Text
                        style={{
                          marginLeft: 8,
                          color: secondaryTextColor,
                          fontSize: 14,
                        }}
                      >
                        {post.comments.length}
                      </Text>
                    </TouchableOpacity>
          
                    {/* <TouchableOpacity style={{ flexDirection: "row", alignItems: "center" }} onPress={handleShare}>
                      <Ionicons name="share-social-outline" size={24} color={secondaryTextColor} />
                      {shareCount > 0 && (
                        <Text
                          style={{
                            marginLeft: 8,
                            color: secondaryTextColor,
                            fontSize: 14,
                          }}
                        >
                          {post.shareCount}
                        </Text>
                      )}
                    </TouchableOpacity> */}
          
                    <TouchableOpacity style={{ flexDirection: "row", alignItems: "center" }} onPress={handleSavePost}>
                      <Ionicons
                        name={isSaved ? "bookmark" : "bookmark-outline"}
                        size={24}
                        color={isSaved ? "#815ac0" : secondaryTextColor}
                      />
                    </TouchableOpacity>
                  </View>

          {/* Comments Section */}
          <View className="p-4">
            {comments.length > 0 ? (
              comments.map(comment => renderCommentItem(comment))
            ) : (
              <Text className="text-gray-400 text-center py-6">No comments yet. Be the first to comment!</Text>
            )}
          </View>
        </ScrollView>

        {/* Comment Input */}
        <View className="px-4 py-2 border-t border-gray-800 bg-black">
          {replyingTo && (
            <View className="flex-row justify-between items-center bg-gray-800 px-3 py-2 rounded-t-lg">
              <Text className="text-white">Replying to {replyingTo.name}</Text>
              <TouchableOpacity onPress={() => {
                setReplyingTo(null);
                setNewComment('');
              }}>
                <Ionicons name="close" size={20} color="white" />
              </TouchableOpacity>
            </View>
          )}
          
          <View className="flex-row items-center">
            <TouchableOpacity 
              onPress={() => setIsAnonymous(!isAnonymous)}
              className="mr-2"
            >
              <FontAwesome5 
                name="user-secret" 
                size={20} 
                color={isAnonymous ? "#4e9cf5" : "#666"} 
              />
            </TouchableOpacity>
            
            <Image 
              source={{ uri: isAnonymous ? 'https://cdn-icons-png.flaticon.com/512/149/149071.png' : user?.photoURL || 'https://cdn-icons-png.flaticon.com/512/149/149071.png' }} 
              className="w-9 h-9 rounded-full mr-2" 
            />
            
            <View className="flex-1 flex-row items-center bg-gray-800 rounded-full pl-4 pr-2 py-1">
              <TextInput
                ref={commentInputRef}
                value={newComment}
                onChangeText={setNewComment}
                placeholder={isAnonymous ? "Comment anonymously..." : "Write your reply..."}
                placeholderTextColor="#999"
                className="flex-1 text-white"
                multiline
              />
              
              <TouchableOpacity 
                onPress={handleAddComment}
                disabled={!newComment.trim()}
                className={`ml-2 ${!newComment.trim() ? 'opacity-50' : ''}`}
              >
                <Ionicons name="send" size={24} color="#4e9cf5" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Image Preview Modal */}
      {selectedImage && (
        <Modal visible={true} transparent={true} animationType="fade">
          <Pressable 
            className="flex-1 bg-black/95 justify-center items-center" 
            onPress={() => setSelectedImage(null)}
          >
            <TouchableOpacity 
              className="absolute top-10 right-6 z-10" 
              onPress={() => setSelectedImage(null)}
            >
              <Ionicons name="close-circle" size={36} color="white" />
            </TouchableOpacity>
            <Image 
              source={{ uri: selectedImage }} 
              className="w-full h-3/4" 
              resizeMode="contain" 
            />
          </Pressable>
        </Modal>
      )}
    </SafeAreaView>
  );
};

// export default PostDetailView;

// import React, { useState, useEffect, useRef } from 'react';
// import {
//   View, Text, Image, TextInput, TouchableOpacity, Modal, ScrollView,
//   SafeAreaView, KeyboardAvoidingView, Platform, Pressable, useColorScheme
// } from 'react-native';
// import { useLocalSearchParams, useRouter } from 'expo-router';
// import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
// import { doc, getDoc, collection, onSnapshot, query, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';
// import { db } from '../../../config/firebaseConfig';
// import { useAuth } from '../../../context/authContext';
// import { addLike, removeLike, addComment, getComments } from '../../(apis)/post';

// export default function PostDetailView  ()  {
//   const { postId } = useLocalSearchParams();
//   const router = useRouter();
//   const { user } = useAuth();
//   const [post, setPost] = useState(null);
//   const [comments, setComments] = useState([]);
//   const [newComment, setNewComment] = useState('');
//   const [selectedImage, setSelectedImage] = useState(null);
//   const [isLiked, setIsLiked] = useState(false);
//   const [isAnonymous, setIsAnonymous] = useState(false);
//   const [replyingTo, setReplyingTo] = useState(null);
//   const [selectedOption, setSelectedOption] = useState(null);
//   const scrollViewRef = useRef();
//   const commentInputRef = useRef();
//   const colorScheme = useColorScheme();
//   const theme = colorScheme === 'dark' ? { bg: 'black', text: 'white', secondary: '#999', border: '#333' } : { bg: 'white', text: 'black', secondary: '#666', border: '#E5E7EB' };

//   useEffect(() => {
//     const fetchPostDetails = async () => {
//       const postRef = doc(db, 'posts', postId);
//       const postSnap = await getDoc(postRef);
//       if (postSnap.exists()) {
//         const postData = { id: postSnap.id, ...postSnap.data() };
//         setPost(postData);
//         setIsLiked(postData.likes?.includes(user?.uid) || false);
//       }
//     };
//     fetchPostDetails();
//     const commentsRef = collection(db, 'posts', postId, 'comments');
//     const q = query(commentsRef, orderBy('timestamp', 'asc'));
//     const unsubscribe = onSnapshot(q, (snapshot) => {
//       const commentsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), replies: [] }));
//       commentsData.forEach(comment => {
//         const repliesRef = collection(db, 'posts', postId, 'comments', comment.id, 'replies');
//         onSnapshot(query(repliesRef, orderBy('timestamp', 'asc')), (repliesSnapshot) => {
//           const replies = repliesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
//           setComments(prev => prev.map(c => c.id === comment.id ? { ...c, replies } : c));
//         });
//       });
//       setComments(commentsData);
//     });
//     return () => unsubscribe();
//   }, [postId, user]);

//   const handleLike = async () => {
//     try {
//       if (isLiked) {
//         await removeLike(post.id, user);
//         setPost(prev => ({ ...prev, likes: prev.likes.filter(id => id !== user?.uid), likeCount: (prev.likeCount || 0) - 1 }));
//         setIsLiked(false);
//       } else {
//         await addLike(post.id, user);
//         setPost(prev => ({ ...prev, likes: [...(prev.likes || []), user?.uid], likeCount: (prev.likeCount || 0) + 1 }));
//         setIsLiked(true);
//       }
//     } catch (error) {
//       console.error('Like error:', error);
//     }
//   };

//   const handleAddComment = async () => {
//     if (!newComment.trim()) return;
//     const commentData = {
//       content: newComment,
//       userName: isAnonymous ? 'Anonymous' : user?.displayName || 'User',
//       userAvatar: isAnonymous ? 'https://cdn-icons-png.flaticon.com/512/149/149071.png' : user?.photoURL,
//       timestamp: serverTimestamp(),
//       isAnonymous,
//       isCurrentUser: true,
//       uid: user?.uid,
//       likes: 0,
//     };
//     try {
//       if (replyingTo) {
//         await addDoc(collection(db, 'posts', postId, 'comments', replyingTo.id, 'replies'), commentData);
//         setReplyingTo(null);
//       } else {
//         await addDoc(collection(db, 'posts', postId, 'comments'), commentData);
//       }
//       setNewComment('');
//     } catch (error) {
//       console.error('Comment error:', error);
//     }
//   };


//   const renderImageGrid = () => {
//     if (!post?.mediaUrls?.length) return null;

//     const images = post.mediaUrls;
//     const imageCount = images.length;
    
//     return (
//       <View className="mt-3 rounded-lg overflow-hidden">
//         {imageCount === 1 && (
//           <TouchableOpacity onPress={() => setSelectedImage(images[0])}>
//             <Image 
//               source={{ uri: images[0] }} 
//               className="w-full h-72 rounded-lg"
//               resizeMode="cover"
//             />
//           </TouchableOpacity>
//         )}
        
//         {imageCount === 2 && (
//           <View className="flex-row">
//             {images.map((url, index) => (
//               <TouchableOpacity 
//                 key={index} 
//                 onPress={() => setSelectedImage(url)}
//                 className="flex-1 h-60 p-0.5"
//               >
//                 <Image 
//                   source={{ uri: url }} 
//                   className="w-full h-full rounded-lg"
//                   resizeMode="cover"
//                 />
//               </TouchableOpacity>
//             ))}
//           </View>
//         )}
        
//         {imageCount === 3 && (
//           <View className="flex-row flex-wrap">
//             <TouchableOpacity 
//               onPress={() => setSelectedImage(images[0])}
//               className="w-1/2 h-80 p-0.5"
//             >
//               <Image 
//                 source={{ uri: images[0] }} 
//                 className="w-full h-full rounded-lg"
//                 resizeMode="cover"
//               />
//             </TouchableOpacity>
//             <View className="w-1/2 h-80">
//               <TouchableOpacity 
//                 onPress={() => setSelectedImage(images[1])}
//                 className="w-full h-1/2 p-0.5"
//               >
//                 <Image 
//                   source={{ uri: images[1] }} 
//                   className="w-full h-full rounded-lg"
//                   resizeMode="cover"
//                 />
//               </TouchableOpacity>
//               <TouchableOpacity 
//                 onPress={() => setSelectedImage(images[2])}
//                 className="w-full h-1/2 p-0.5"
//               >
//                 <Image 
//                   source={{ uri: images[2] }} 
//                   className="w-full h-full rounded-lg"
//                   resizeMode="cover"
//                 />
//               </TouchableOpacity>
//             </View>
//           </View>
//         )}
        
//         {imageCount >= 4 && (
//           <View className="flex-row flex-wrap">
//             <View className="w-1/2 h-60">
//               <TouchableOpacity 
//                 onPress={() => setSelectedImage(images[0])}
//                 className="w-full h-full p-0.5"
//               >
//                 <Image 
//                   source={{ uri: images[0] }} 
//                   className="w-full h-full rounded-lg"
//                   resizeMode="cover"
//                 />
//               </TouchableOpacity>
//             </View>
//             <View className="w-1/2 h-60">
//               <TouchableOpacity 
//                 onPress={() => setSelectedImage(images[1])}
//                 className="w-full h-1/2 p-0.5"
//               >
//                 <Image 
//                   source={{ uri: images[1] }} 
//                   className="w-full h-full rounded-lg"
//                   resizeMode="cover"
//                 />
//               </TouchableOpacity>
//               <View className="flex-row h-1/2">
//                 <TouchableOpacity 
//                   onPress={() => setSelectedImage(images[2])}
//                   className="w-1/2 h-full p-0.5"
//                 >
//                   <Image 
//                     source={{ uri: images[2] }} 
//                     className="w-full h-full rounded-lg"
//                     resizeMode="cover"
//                   />
//                 </TouchableOpacity>
//                 <TouchableOpacity 
//                   onPress={() => setSelectedImage(images[3])}
//                   className="w-1/2 h-full p-0.5 relative"
//                 >
//                   <Image 
//                     source={{ uri: images[3] }} 
//                     className="w-full h-full rounded-lg"
//                     resizeMode="cover"
//                   />
//                   {imageCount > 4 && (
//                     <View className="absolute inset-0 bg-black/60 items-center justify-center rounded-lg">
//                       <Text className="text-white text-xl font-bold">+{imageCount - 4}</Text>
//                     </View>
//                   )}
//                 </TouchableOpacity>
//               </View>
//             </View>
//           </View>
//         )}
//       </View>
//     );
//   };

//   // const renderImageGrid = () => {
//   //   if (!post?.mediaUrls?.length) return null;
//   //   const images = post.mediaUrls;
//   //   return (
//   //     <View className="mt-3 rounded-lg overflow-hidden">
//   //       {images.length === 1 && (
//   //         <TouchableOpacity onPress={() => setSelectedImage(images[0])}>
//   //           <Image source={{ uri: images[0] }} className="w-full h-72 rounded-lg" resizeMode="cover" />
//   //         </TouchableOpacity>
//   //       )}
//   //       {/* Add multi-image layouts as in original */}
//   //     </View>
//   //   );
//   // };

//   const renderPoll = () => {
//     if (post?.postType !== 'poll') return null;
//     const userVoteIndex = post.options.findIndex(option => option.votes?.includes(user?.uid));
//     return (
//       <View className="mt-2">
//         <Text className={`text-${theme.text} text-lg font-semibold mb-1`}>{post.title}</Text>
//         {post.description && <Text className={`text-${theme.secondary} mb-2`}>{post.description}</Text>}
//         {post.options.map((option, index) => (
//           <TouchableOpacity
//             key={index}
//             onPress={() => userVoteIndex === -1 && setSelectedOption(index)}
//             disabled={userVoteIndex !== -1 && userVoteIndex !== index}
//             className="flex-row items-center justify-between mb-2 p-2 rounded-lg"
//             style={{ backgroundColor: userVoteIndex === index || selectedOption === index ? '#4e9cf5' : theme.bg }}
//           >
//             <View className="flex-row items-center">
//               <Ionicons
//                 name={userVoteIndex === index || selectedOption === index ? 'radio-button-on' : 'radio-button-off'}
//                 size={24}
//                 color={userVoteIndex === index || selectedOption === index ? 'white' : theme.secondary}
//               />
//               <Text className={`ml-2 text-${userVoteIndex === index || selectedOption === index ? 'white' : theme.text}`}>{option.text}</Text>
//             </View>
//             <Text className={`text-${userVoteIndex === index || selectedOption === index ? 'white' : theme.secondary}`}>{option.votes?.length || 0} votes</Text>
//           </TouchableOpacity>
//         ))}
//       </View>
//     );
//   };

//   const renderCommentItem = (item, isReply = false) => (
//     <View key={item.id} className={`border-b ${isReply ? 'ml-8 mt-1' : 'mt-3'}`} style={{ borderColor: theme.border }}>
//       <View className="flex-row justify-between items-start">
//         <View className="flex-row items-start">
//           <Image source={{ uri: item.userAvatar }} className="w-10 h-10 rounded-full mr-3" />
//           <View className="flex-1">
//             <Text className={`text-${theme.text} font-bold`}>{item.userName}</Text>
//             <Text className={`text-${theme.secondary} text-xs`}>{new Date(item.timestamp?.toDate()).toLocaleString()}</Text>
//             <Text className={`text-${theme.text} py-1`}>{item.content}</Text>
//           </View>
//         </View>
//       </View>
//       {!isReply && item.replies?.map(reply => renderCommentItem(reply, true))}
//     </View>
//   );

//   if (!post) return <SafeAreaView className="flex-1" style={{ backgroundColor: theme.bg }}><Text className={`text-${theme.text}`}>Loading...</Text></SafeAreaView>;

//   return (
//     <SafeAreaView className="flex-1" style={{ backgroundColor: theme.bg }}>
//       <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
//         <View className="flex-row items-center justify-between px-4 py-3 border-b" style={{ borderColor: theme.border }}>
//           <TouchableOpacity onPress={() => router.back()}>
//             <Ionicons name="arrow-back" size={24} color={theme.text} />
//           </TouchableOpacity>
//           <Text className={`text-${theme.text} text-lg font-semibold`}>Post</Text>
//           <View style={{ width: 24 }} />
//         </View>
//         <ScrollView ref={scrollViewRef} className="flex-1" contentContainerStyle={{ paddingBottom: 16 }}>
//           <View className="flex-row justify-between items-center p-4">
//             <View className="flex-row items-center">
//               <Image source={{ uri: post.userAvatar }} className="w-12 h-12 rounded-full mr-3" />
//               <View>
//                 <Text className={`text-${theme.text} font-bold text-lg`}>{post.userName}</Text>
//                 <Text className={`text-${theme.secondary}`}>{new Date(post.createdAt.toDate()).toLocaleString()}</Text>
//               </View>
//             </View>
//           </View>
//           <View className="px-4">
//             {post.postType === 'poll' ? renderPoll() : <Text className={`text-${theme.text} text-lg mb-2`}>{post.content}</Text>}
//             {renderImageGrid()}
//           </View>
//           <View className="flex-row justify-between items-center px-4 py-3 border-t border-b mt-3" style={{ borderColor: theme.border }}>
//             <Text className={`text-${theme.secondary}`}>{post.likeCount || 0} likes</Text>
//             <View className="flex-row">
//               <Text className={`text-${theme.secondary} mr-3`}>{comments.length} comments</Text>
//             </View>
//           </View>
//           <View className="flex-row justify-between items-center px-6 py-3 border-b" style={{ borderColor: theme.border }}>
//             <TouchableOpacity onPress={handleLike} className="flex-row items-center">
//               <Ionicons name={isLiked ? 'heart' : 'heart-outline'} size={24} color={isLiked ? '#f44' : theme.text} />
//               <Text className={`text-${theme.text} ml-2`}>Like</Text>
//             </TouchableOpacity>
//             <TouchableOpacity className="flex-row items-center">
//               <Ionicons name="chatbubble-outline" size={22} color={theme.text} />
//               <Text className={`text-${theme.text} ml-2`}>Comment</Text>
//             </TouchableOpacity>
//           </View>
//           <View className="p-4">
//             {comments.length ? comments.map(comment => renderCommentItem(comment)) : <Text className={`text-${theme.secondary} text-center py-6`}>No comments yet.</Text>}
//           </View>
//         </ScrollView>
//         <View className="px-4 py-2 border-t" style={{ backgroundColor: theme.bg, borderColor: theme.border }}>
//           {replyingTo && (
//             <View className="flex-row justify-between items-center bg-gray-800 px-3 py-2 rounded-t-lg">
//               <Text className={`text-${theme.text}`}>Replying to {replyingTo.name}</Text>
//               <TouchableOpacity onPress={() => { setReplyingTo(null); setNewComment(''); }}>
//                 <Ionicons name="close" size={20} color={theme.text} />
//               </TouchableOpacity>
//             </View>
//           )}
//           <View className="flex-row items-center">
//             <TouchableOpacity onPress={() => setIsAnonymous(!isAnonymous)} className="mr-2">
//               <FontAwesome5 name="user-secret" size={20} color={isAnonymous ? '#4e9cf5' : theme.secondary} />
//             </TouchableOpacity>
//             <Image source={{ uri: isAnonymous ? 'https://cdn-icons-png.flaticon.com/512/149/149071.png' : user?.photoURL }} className="w-9 h-9 rounded-full mr-2" />
//             <View className="flex-1 flex-row items-center bg-gray-200 dark:bg-gray-800 rounded-full pl-4 pr-2 py-1">
//               <TextInput
//                 ref={commentInputRef}
//                 value={newComment}
//                 onChangeText={setNewComment}
//                 placeholder={isAnonymous ? 'Comment anonymously...' : 'Write a comment...'}
//                 placeholderTextColor={theme.secondary}
//                 className={`flex-1 text-${theme.text}`}
//                 multiline
//               />
//               <TouchableOpacity onPress={handleAddComment} disabled={!newComment.trim()} className={!newComment.trim() ? 'opacity-50' : ''}>
//                 <Ionicons name="send" size={24} color="#4e9cf5" />
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </KeyboardAvoidingView>
//       {selectedImage && (
//         <Modal visible={true} transparent={true} animationType="fade">
//           <Pressable className="flex-1 bg-black/95 justify-center items-center" onPress={() => setSelectedImage(null)}>
//             <TouchableOpacity className="absolute top-10 right-6" onPress={() => setSelectedImage(null)}>
//               <Ionicons name="close-circle" size={36} color="white" />
//             </TouchableOpacity>
//             <Image source={{ uri: selectedImage }} className="w-full h-3/4" resizeMode="contain" />
//           </Pressable>
//         </Modal>
//       )}
//     </SafeAreaView>
//   );
// };

// export default PostDetailView;