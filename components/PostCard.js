
// // // // // import React, { useState, useCallback } from 'react';
// // // // // import {
// // // // //   Modal,
// // // // //   View,
// // // // //   Text,
// // // // //   TextInput,
// // // // //   TouchableOpacity,
// // // // //   ActivityIndicator,
// // // // //   Image,
// // // // //   Alert,
// // // // //   ScrollView,
// // // // // } from 'react-native';
// // // // // import * as ImagePicker from 'expo-image-picker';
// // // // // import { MaterialIcons } from '@expo/vector-icons';
// // // // // import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
// // // // // import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
// // // // // import { db, storage } from '../config/firebaseConfig';

// // // // // const CreatePostModal = ({ visible, onClose, onSuccess, user }) => {
// // // // //   const [content, setContent] = useState('');
// // // // //   const [selectedImages, setSelectedImages] = useState([]);
// // // // //   const [loading, setLoading] = useState(false);

// // // // //   // Image picker with permissions
// // // // //   const pickImages = useCallback(async () => {
// // // // //     try {
// // // //   //       const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  
// // // //   //       if (status !== 'granted') {
// // // // //         Alert.alert(
// // // // //           'Permission Required',
// // // // //           'Please allow access to your photo library to select images.'
// // // // //         );
// // // // //         return;
// // // // //       }

// // // // //       const result = await ImagePicker.launchImageLibraryAsync({
// // // // //         mediaTypes: ImagePicker.MediaTypeOptions.Images,
// // // // //         allowsEditing: true,
// // // // //         aspect: [4, 3],
// // // // //         quality: 1,
// // // // //         allowsMultipleSelection: true,
// // // // //         maxSelected: 4,
// // // // //       });

// // // // //       if (!result.canceled && result.assets) {
// // // // //         setSelectedImages(result.assets.map(asset => asset.uri));
// // // // //       }
// // // // //     } catch (error) {
// // // // //       Alert.alert('Error', 'Failed to pick images. Please try again.');
// // // // //     }
// // // // //   }, []);

// // // // //   // Upload multiple images
// // // // //   const uploadImages = async (uris) => {
// // // //   //     const uploadPromises = uris.map(async (uri) => {
// // // // //       const response = await fetch(uri);
// // // // //       const blob = await response.blob();
// // // // //       const filename = `posts/${Date.now()}-${Math.random().toString(36).substr(2)}`;
// // // // //       const imageRef = ref(storage, filename);
      
// // // // //       await uploadBytes(imageRef, blob);
// // // // //       return getDownloadURL(imageRef);
// // // // //     });

// // // // //     return Promise.all(uploadPromises);
// // // // //   };

// // // // //   // Handle post creation
// // // // //   const handleSubmit = async () => {
// // // // //     if (!content.trim()) {
// // // // //       Alert.alert('Error', 'Please enter some content');
// // // // //       return;
// // // // //     }

// // // // //     setLoading(true);

// // // // //     try {
// // // // //       let mediaUrls = [];
// // // // //       if (selectedImages.length > 0) {
// // // // //         mediaUrls = await uploadImages(selectedImages);
// // // // //       }

// // // // //       await addDoc(collection(db, 'posts'), {
// // // //   //         content: content.trim(),
// // // //   //         mediaUrls,
// // // //   //         createdAt: serverTimestamp(),
// // // //   //         userId: user.uid,
// // // //   //         userName: user.fullName,
// // // //   //         userAvatar: user.profileUrl,
// // // // //         college: user.college?.name,
// // // // //       });

// // // // //       onSuccess();
// // // // //       setContent('');
// // // // //       setSelectedImages([]);
// // // // //     } catch (error) {
// // // //   //       Alert.alert('Error', 'Failed to create post. Please try again.');
// // // // //     } finally {
// // // // //       setLoading(false);
// // // // //     }
// // // // //   };

// // // // //   return (
// // // // //     <Modal
// // // // //       visible={visible}
// // // // //       animationType="slide"
// // // // //       transparent
// // // // //       onRequestClose={onClose}
// // // // //     >
// // // // //       <View className="flex-1 bg-black/50">
// // // // //         <View className="mt-auto bg-white dark:bg-gray-900 rounded-t-3xl p-6">
// // // // //           <View className="flex-row justify-between items-center mb-6">
// // // // //             <Text className="text-xl font-bold text-gray-900 dark:text-white">
// // // // //               Create Post
// // // // //             </Text>
// // // // //             <TouchableOpacity onPress={onClose}>
// // // // //               <MaterialIcons name="close" size={24} className="text-gray-600" />
// // // // //             </TouchableOpacity>
// // // // //           </View>

// // // // //           <ScrollView>
// // // // //             <TextInput
// // // // //               className="min-h-[100] text-base text-gray-900 dark:text-white mb-4"
// // // // //               placeholder="What's on your mind?"
// // // // //               placeholderTextColor="#666"
// // // // //               multiline
// // // // //               value={content}
// // // // //               onChangeText={setContent}
// // // // //             />

// // // // //             {selectedImages.length > 0 && (
// // // // //               <View className="flex-row flex-wrap gap-2 mb-4">
// // // // //                 {selectedImages.map((uri, index) => (
// // // // //                   <View key={index} className="relative">
// // // // //                     <Image
// // // // //                       source={{ uri }}
// // // // //                       className="w-24 h-24 rounded-lg"
// // // // //                     />
// // // // //                     <TouchableOpacity
// // // // //                       className="absolute top-1 right-1 bg-black/50 rounded-full p-1"
// // // // //                       onPress={() => {
// // // //   //                         setSelectedImages(prev => 
// // // // //                           prev.filter((_, i) => i !== index)
// // // // //                         );
// // // // //                       }}
// // // // //                     >
// // // // //                       <MaterialIcons name="close" size={16} color="#fff" />
// // // // //                     </TouchableOpacity>
// // // // //                   </View>
// // // // //                 ))}
// // // // //               </View>
// // // // //             )}
// // // // //           </ScrollView>

// // // // //           <View className="flex-row justify-between items-center mt-4">
// // // // //             <TouchableOpacity
// // // // //               className="p-3 rounded-full bg-gray-100 dark:bg-gray-800"
// // // // //               onPress={pickImages}
// // // // //             >
// // // // //               <MaterialIcons name="image" size={24} className="text-primary" />
// // // // //             </TouchableOpacity>

// // // // //             <TouchableOpacity
// // // // //               className={`px-8 py-3 rounded-full ${
// // // //   //                 !content.trim() ? 'bg-gray-400' : 'bg-primary'
// // // // //               }`}
// // // // //               onPress={handleSubmit}
// // // // //               disabled={loading || !content.trim()}
// // // // //             >
// // // // //               {loading ? (
// // // // //                 <ActivityIndicator color="#fff" />
// // // // //               ) : (
// // // // //                 <Text className="text-white font-semibold">Post</Text>
// // // // //               )}
// // // // //             </TouchableOpacity>
// // // // //           </View>
// // // // //         </View>
// // // // //       </View>
// // // // //     </Modal>
// // // // //   );
// // // // // };

// // // // // export default CreatePostModal;
// // // // // import React, { useState, useEffect } from 'react';
// // // // // import {
// // // // //   View,
// // // // //   Text,
// // // // //   Image,
// // // // //   TouchableOpacity,
// // // // //   TextInput,
// // // // //   ScrollView,
// // // // //   Modal,
// // // // //   Share,
// // // // //   Alert,StyleSheet
// // // // // } from 'react-native';
// // // // // import { Ionicons } from '@expo/vector-icons';
// // // // // import { FontAwesome } from '@expo/vector-icons';
// // // // // import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
// // // // // import { useAuth } from '../context/authContext';
// // // // // import {
// // // // //   addComment,
// // // // //   getComments,
// // // // //   addLike,
// // // // //   removeLike,
// // // // //   getLikes,
// // // // //   incrementShareCount,
// // // // //   getShareCount,
// // // // //   deletePost,
// // // // // } from "../app/(apis)/post";

// // // // // // Constants
// // // // // const DEFAULT_AVATAR = 'https://via.placeholder.com/100?text=User';
// // // // // const MAX_COMMENT_LENGTH = 500;

// // // // // // Utility Functions
// // // // // const generateInitials = (name) => {
// // // // //   if (!name) return '?';
// // // // //   const initials = name
// // // // //     .split(' ')[0][0]
// // // // //     .toUpperCase()
// // // // //     .slice(0, 2);
// // // // //   return initials;
// // // // // };

// // // // // const PostCard = ({ post, onDetailView }) => {
// // // // //   const { user } = useAuth();

// // // // //   // State Management
// // // // //   const [isLiked, setIsLiked] = useState(false);
// // // // //   const [comments, setComments] = useState([]);
// // // // //   const [likes, setLikes] = useState([]);
// // // // //   const [newComment, setNewComment] = useState('');
// // // // //   const [modalVisible, setModalVisible] = useState(false);
// // // // //   const [shareCount, setShareCount] = useState(0);
// // // // //   const [replyTo, setReplyTo] = useState(null);

// // // // //   // Initial Data Loading
// // // // //   useEffect(() => {
// // // // //     const loadInitialData = async () => {
// // // // //       try {
// // // // //         const [fetchedComments, fetchedLikes, count] = await Promise.all([
// // // // //           getComments(post.id),
// // // // //           getLikes(post.id),
// // // // //           getShareCount(post.id),
// // // // //         ]);
// // // // //         setComments(fetchedComments);
// // // // //         setLikes(fetchedLikes);
// // // // //         setIsLiked(fetchedLikes.some((like) => like.userId === user?.uid));
// // // // //         setShareCount(count);
// // // // //       } catch (error) {
// // // // //         console.error("Initial data loading error:", error);
// // // // //         Alert.alert('Error', 'Failed to load post data');
// // // // //       }
// // // // //     };
// // // // //     loadInitialData();
// // // // //   }, [post.id, user?.uid]);

// // // // //   // Interaction Handlers
// // // // //   const handleLike = async () => {
// // // // //     try {
// // // // //       setIsLiked(prev => !prev);
// // // // //       if (isLiked) {
// // // // //         await removeLike(post.id, user);
// // // // //       } else {
// // // // //         await addLike(post.id, user);
// // // // //       }
// // // // //       const updatedLikes = await getLikes(post.id);
// // // // //       setLikes(updatedLikes);
// // // // //     } catch (error) {
// // // // //       console.error("Like error:", error);
// // // // //       setIsLiked(prev => !prev);
// // // // //       Alert.alert('Error', 'Failed to process like');
// // // // //     }
// // // // //   };

//   // const handleShare = async () => {
//   //   try {
//   //     const result = await Share.share({
//   //       title: `${post.userName}'s Campus Post`,
//   //       message: `${post.content}\n\nShared via Campus Pulse App`,
//   //       url: post.mediaUrl,
//   //     });
//   //     if (result.action === Share.sharedAction) {
//   //       await incrementShareCount(post.id);
//   //       setShareCount(prev => prev + 1);
//   //     }
//   //   } catch (error) {
//   //     Alert.alert('Error', 'Failed to share post');
//   //   }
//   // };

// // // // //   const handleCommentSubmit = async () => {
// // // // //     if (!newComment.trim()) return;
// // // // //     try {
// // // // //       const commentData = {
// // // // //         content: newComment.trim(),
// // // // //         userAvatar: user?.photoURL || DEFAULT_AVATAR,
// // // // //         userName: user?.displayName || "Anonymous",
// // // // //         replyTo: replyTo?.id || null,
// // // // //       };
// // // // //       await addComment(post.id, commentData, user);
// // // // //       setNewComment("");
// // // // //       setReplyTo(null);
// // // // //       const updatedComments = await getComments(post.id);
// // // // //       setComments(updatedComments);
// // // // //     } catch (error) {
// // // // //       console.error("Comment submission error:", error);
// // // // //       Alert.alert('Error', 'Failed to submit comment');
// // // // //     }
// // // // //   };

// // // // //   // Render Helpers
// // // // //   const renderUserAvatar = (avatarUrl, name) => {
// // // // //     return (
// // // // //       <View style={styles.avatarContainer}>
// // // // //         {avatarUrl ? (
// // // // //           <Image source={{ uri: avatarUrl }} style={styles.avatar} />
// // // // //         ) : (
// // // // //           <View style={[styles.avatar, styles.defaultAvatar]}>
// // // // //             <Text style={styles.initials}>{generateInitials(name)}</Text>
// // // // //           </View>
// // // // //         )}
// // // // //       </View>
// // // // //     );
// // // // //   };

// // // // //   return (
// // // // //     <View style={styles.card}>
// // // // //       {/* Post Header */}
// // // // //       <View style={styles.header}>
// // // // //         {renderUserAvatar(post.profileUrl, post.userName)}
// // // // //         <Text style={styles.userName}>{post.userName}</Text>
// // // // //         {user?.uid === post.userId && (
// // // // //           <TouchableOpacity onPress={() => Alert.alert('Delete', 'Are you sure?', [
// // // // //             { text: 'Cancel' },
// // // // //             { text: 'Delete', onPress: handleDelete },
// // // // //           ])}>
// // // // //             <Ionicons name="ellipsis-vertical" size={20} color="#888" />
// // // // //           </TouchableOpacity>
// // // // //         )}
// // // // //       </View>

// // // // //       {/* Post Content */}
// // // // //       <Text style={styles.content}>{post.content}</Text>
// // // // //       {
// // // // //         // Post Media
// // // // //         post.mediaUrl && <Image source={{ uri: post.mediaUrl }} style={styles.postImage} />
// // // // //       }
// // // // //       {/* <Image source={{ uri: post.mediaUrl }} style={styles.postImage} /> */}
// // // // //       {post.photoUrl && (
// // // // //         <TouchableOpacity onPress={() => Alert.alert('Full Image')}>
// // // // //           <Image source={{ uri: post.photoUrl }} style={styles.postImage} />
// // // // //         </TouchableOpacity>
// // // // //       )}

// // // // //       {/* Interaction Section */}
// // // // //       <View style={styles.interactions}>
// // // // //         <TouchableOpacity onPress={handleLike} style={styles.interactionButton}>
// // // // //           <Ionicons
// // // // //             name={isLiked ? "heart" : "heart-outline"}
// // // // //             size={20}
// // // // //             color={isLiked ? "#6a0dad" : "#888"}
// // // // //           />
// // // // //           <Text style={styles.interactionText}>{likes.length}</Text>
// // // // //         </TouchableOpacity>
// // // // //         <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.interactionButton}>
// // // // //           <FontAwesome name="comment-o" size={20} color="#888" />
// // // // //           <Text style={styles.interactionText}>{comments.length}</Text>
// // // // //         </TouchableOpacity>
// // // // //         <TouchableOpacity onPress={handleShare} style={styles.interactionButton}>
// // // // //           <MaterialCommunityIcons name="share-variant" size={20} color="#888" />
// // // // //           <Text style={styles.interactionText}>{shareCount}</Text>
// // // // //         </TouchableOpacity>
// // // // //       </View>

// // // // //       {/* Recent Comments Preview */}
// // // // //       {comments.length > 0 && (
// // // // //         <TouchableOpacity onPress={() => setModalVisible(true)}>
// // // // //           <Text style={styles.recentComment}>
// // // // //             <Text style={styles.commentUserName}>{comments[comments.length - 1].userName}: </Text>
// // // // //             {comments[comments.length - 1].content}
// // // // //           </Text>
// // // // //         </TouchableOpacity>
// // // // //       )}

// // // // //       {/* Comment Input */}
// // // // //       <View style={styles.commentInputContainer}>
// // // // //         <TextInput
// // // // //           value={newComment}
// // // // //           onChangeText={setNewComment}
// // // // //           placeholder="Add a comment..."
// // // // //           style={styles.commentInput}
// // // // //           maxLength={MAX_COMMENT_LENGTH}
// // // // //         />
// // // // //         <TouchableOpacity onPress={handleCommentSubmit} style={styles.sendButton}>
// // // // //           <Text style={styles.sendButtonText}>Send</Text>
// // // // //         </TouchableOpacity>
// // // // //       </View>

// // // // //       {/* Full-Screen Comments Modal */}
// // // // //       <Modal visible={modalVisible} transparent animationType="slide">
// // // // //         <View style={styles.modalOverlay}>
// // // // //           <View style={styles.commentsModal}>
// // // // //             <Text style={styles.modalTitle}>Comments ({comments.length})</Text>
// // // // //             <ScrollView style={styles.commentsList}>
// // // // //               {comments.map((comment, index) => (
// // // // //                 <View key={index} style={styles.commentItem}>
// // // // //                   {renderUserAvatar(comment.userAvatar, comment.userName)}
// // // // //                   <View style={styles.commentContentContainer}>
// // // // //                     <Text style={styles.commentUserName}>{comment.userName}</Text>
// // // // //                     <Text style={styles.commentContent}>{comment.content}</Text>
// // // // //                     <TouchableOpacity onPress={() => setReplyTo(comment)}>
// // // // //                       <Text style={styles.replyText}>Reply</Text>
// // // // //                     </TouchableOpacity>
// // // // //                   </View>
// // // // //                 </View>
// // // // //               ))}
// // // // //             </ScrollView>
// // // // //             <View style={styles.modalInputContainer}>
// // // // //               {replyTo && (
// // // // //                 <Text style={styles.replyingTo}>
// // // // //                   Replying to: {replyTo.userName}
// // // // //                   <TouchableOpacity onPress={() => setReplyTo(null)}>
// // // // //                     <Text style={styles.cancelReply}>Cancel</Text>
// // // // //                   </TouchableOpacity>
// // // // //                 </Text>
// // // // //               )}
// // // // //               <TextInput
// // // // //                 value={newComment}
// // // // //                 onChangeText={setNewComment}
// // // // //                 placeholder={replyTo ? `Reply to ${replyTo.userName}` : "Add a comment..."}
// // // // //                 style={styles.modalInput}
// // // // //                 maxLength={MAX_COMMENT_LENGTH}
// // // // //               />
// // // // //               <TouchableOpacity onPress={handleCommentSubmit} style={styles.sendButton}>
// // // // //                 <Text style={styles.sendButtonText}>Send</Text>
// // // // //               </TouchableOpacity>
// // // // //             </View>
// // // // //           </View>
// // // // //         </View>
// // // // //       </Modal>
// // // // //     </View>
// // // // //   );
// // // // // };

// // // // // export default PostCard;

// // // // // // Styles
// // // // // const styles = StyleSheet.create({
// // // // //   card: {
// // // // //     backgroundColor: '#fff',
// // // // //     borderRadius: 10,
// // // // //     marginVertical: 10,
// // // // //     padding: 15,
// // // // //     shadowColor: '#000',
// // // // //     shadowOffset: { width: 0, height: 2 },
// // // // //     shadowOpacity: 0.1,
// // // // //     shadowRadius: 5,
// // // // //     elevation: 3,
// // // // //   },
// // // // //   header: {
// // // // //     flexDirection: 'row',
// // // // //     alignItems: 'center',
// // // // //     justifyContent: 'space-between',
// // // // //     marginBottom: 10,
// // // // //   },
// // // // //   avatarContainer: {
// // // // //     marginRight: 10,
// // // // //   },
// // // // //   avatar: {
// // // // //     width: 40,
// // // // //     height: 40,
// // // // //     borderRadius: 20,
// // // // //   },
// // // // //   defaultAvatar: {
// // // // //     backgroundColor: '#ccc',
// // // // //     justifyContent: 'center',
// // // // //     alignItems: 'center',
// // // // //   },
// // // // //   initials: {
// // // // //     fontSize: 16,
// // // // //     fontWeight: 'bold',
// // // // //     color: '#fff',
// // // // //   },
// // // // //   userName: {
// // // // //     fontSize: 16,
// // // // //     fontWeight: 'bold',
// // // // //     flex: 1,
// // // // //   },
// // // // //   content: {
// // // // //     fontSize: 14,
// // // // //     color: '#333',
// // // // //     marginBottom: 10,
// // // // //   },
// // // // //   postImage: {
// // // // //     width: '100%',
// // // // //     height: 200,
// // // // //     borderRadius: 10,
// // // // //     marginBottom: 10,
// // // // //   },
// // // // //   interactions: {
// // // // //     flexDirection: 'row',
// // // // //     alignItems: 'center',
// // // // //     marginBottom: 10,
// // // // //   },
// // // // //   interactionButton: {
// // // // //     flexDirection: 'row',
// // // // //     alignItems: 'center',
// // // // //     marginRight: 20,
// // // // //   },
// // // // //   interactionText: {
// // // // //     marginLeft: 5,
// // // // //     fontSize: 14,
// // // // //     color: '#888',
// // // // //   },
// // // // //   recentComment: {
// // // // //     fontSize: 14,
// // // // //     color: '#666',
// // // // //     marginBottom: 10,
// // // // //   },
// // // // //   commentUserName: {
// // // // //     fontWeight: 'bold',
// // // // //     color: '#333',
// // // // //   },
// // // // //   commentInputContainer: {
// // // // //     flexDirection: 'row',
// // // // //     alignItems: 'center',
// // // // //   },
// // // // //   commentInput: {
// // // // //     flex: 1,
// // // // //     borderWidth: 1,
// // // // //     borderColor: '#ddd',
// // // // //     borderRadius: 20,
// // // // //     paddingHorizontal: 15,
// // // // //     paddingVertical: 8,
// // // // //     marginRight: 10,
// // // // //   },
// // // // //   sendButton: {
// // // // //     backgroundColor: '#6a0dad',
// // // // //     padding: 8,
// // // // //     borderRadius: 20,
// // // // //   },
// // // // //   sendButtonText: {
// // // // //     color: '#fff',
// // // // //     fontWeight: 'bold',
// // // // //   },
// // // // //   modalOverlay: {
// // // // //     flex: 1,
// // // // //     backgroundColor: 'rgba(0, 0, 0, 0.5)',
// // // // //     justifyContent: 'center',
// // // // //     alignItems: 'center',
// // // // //   },
// // // // //   commentsModal: {
// // // // //     backgroundColor: '#fff',
// // // // //     borderRadius: 10,
// // // // //     padding: 20,
// // // // //     width: '90%',
// // // // //     maxHeight: '80%',
// // // // //   },
// // // // //   modalTitle: {
// // // // //     fontSize: 18,
// // // // //     fontWeight: 'bold',
// // // // //     marginBottom: 10,
// // // // //   },
// // // // //   commentsList: {
// // // // //     maxHeight: '60%',
// // // // //   },
// // // // //   commentItem: {
// // // // //     flexDirection: 'row',
// // // // //     alignItems: 'flex-start',
// // // // //     marginBottom: 10,
// // // // //   },
// // // // //   commentContentContainer: {
// // // // //     flex: 1,
// // // // //   },
// // // // //   commentContent: {
// // // // //     fontSize: 14,
// // // // //     color: '#333',
// // // // //   },
// // // // //   replyText: {
// // // // //     fontSize: 12,
// // // // //     color: '#6a0dad',
// // // // //     marginTop: 5,
// // // // //   },
// // // // //   modalInputContainer: {
// // // // //     marginTop: 10,
// // // // //   },
// // // // //   replyingTo: {
// // // // //     fontSize: 12,
// // // // //     color: '#6a0dad',
// // // // //     marginBottom: 5,
// // // // //   },
// // // // //   cancelReply: {
// // // // //     color: '#ff4d4d',
// // // // //     marginLeft: 5,
// // // // //   },
// // // // //   modalInput: {
// // // // //     borderWidth: 1,
// // // // //     borderColor: '#ddd',
// // // // //     borderRadius: 20,
// // // // //     paddingHorizontal: 15,
// // // // //     paddingVertical: 8,
// // // // //     marginBottom: 10,
// // // // //   },
// // // // // });

// // // // // import React, { useState, useEffect, useCallback } from 'react';
// // // // // import {
// // // // //   View,
// // // // //   Text,
// // // // //   Image,
// // // // //   TouchableOpacity,
// // // // //   TextInput,
// // // // //   ScrollView,
// // // // //   Modal,
// // // // //   Share,
// // // // //   Alert,
// // // // //   StyleSheet,
// // // // //   Animated,
// // // // //   FlatList,
// // // // //   Dimensions
// // // // // } from 'react-native';
// // // // // import { Ionicons, FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
// // // // // import { useNavigation } from '@react-navigation/native';
// // // // // import { useAuth } from '../context/authContext';
// // // // // import {
// // // // //   addComment,
// // // // //   getComments,
// // // // //   addLike,
// // // // //   removeLike,
// // // // //   getLikes,
// // // // //   incrementShareCount,
// // // // //   getShareCount,
// // // // //   deletePost,
// // // // // } from "../app/(apis)/post";

// // // // // // Constants remain the same
// // // // // const DEFAULT_AVATAR = 'https://via.placeholder.com/100?text=User';
// // // // // const MAX_COMMENT_LENGTH = 500;
// // // // // const MAX_CONTENT_LINES = 3;
// // // // // const SCREEN_WIDTH = Dimensions.get('window').width;
// // // // // const IMAGE_MARGIN = 2;

// // // // // // Utility functions remain the same
// // // // // const generateInitials = (name) => {
// // // // //   if (!name) return '?';
// // // // //   return name.split(' ')[0][0].toUpperCase().slice(0, 2);
// // // // // };

// // // // // const ImageGrid = ({ images }) => {
// // // // //   // ImageGrid implementation remains the same
// // // // //   const calculateImageDimensions = () => {
// // // // //     const screenWidth = SCREEN_WIDTH - 30;
// // // // //     switch (images.length) {
// // // // //       case 1:
// // // // //         return [{ width: screenWidth, height: 300 }];
// // // // //       case 2:
// // // // //         return images.map(() => ({
// // // // //           width: (screenWidth - IMAGE_MARGIN) / 2,
// // // // //           height: 200
// // // // //         }));
// // // // //       default:
// // // // //         const firstImage = { width: screenWidth, height: 200 };
// // // // //         const smallImages = images.slice(1).map(() => ({
// // // // //           width: (screenWidth - IMAGE_MARGIN * 2) / 3,
// // // // //           height: 100
// // // // //         }));
// // // // //         return [firstImage, ...smallImages];
// // // // //     }
// // // // //   };

// // // // //   const dimensions = calculateImageDimensions();

// // // // //   return (
// // // // //     <View style={styles.imageGridContainer}>
// // // // //       {images.map((image, index) => (
// // // // //         <Image
// // // // //           key={index}
// // // // //           source={{ uri: image }}
// // // // //           style={[
// // // // //             styles.gridImage,
// // // // //             {
// // // // //               width: dimensions[Math.min(index, dimensions.length - 1)].width,
// // // // //               height: dimensions[Math.min(index, dimensions.length - 1)].height,
// // // // //               marginRight: index % 3 !== 2 ? IMAGE_MARGIN : 0,
// // // // //               marginBottom: IMAGE_MARGIN,
// // // // //             },
// // // // //           ]}
// // // // //         />
// // // // //       ))}
// // // // //     </View>
// // // // //   );
// // // // // };

// // // // // const PostCard = ({ post, onDetailView }) => {
// // // // //   // ... State management and hooks remain the same ...
// // // // //   const { user } = useAuth();
// // // // //   const navigation = useNavigation();

// // // // //   // State Management
// // // // //   const [isLiked, setIsLiked] = useState(false);
// // // // //   const [comments, setComments] = useState([]);
// // // // //   const [likes, setLikes] = useState([]);
// // // // //   const [newComment, setNewComment] = useState('');
// // // // //   const [modalVisible, setModalVisible] = useState(false);
// // // // //   const [shareCount, setShareCount] = useState(0);
// // // // //   const [replyTo, setReplyTo] = useState(null);
// // // // //   const [isExpanded, setIsExpanded] = useState(false);
// // // // //   const [contentHeight, setContentHeight] = useState(0);
// // // // //   const [shouldShowMore, setShouldShowMore] = useState(false);

// // // // //   // Animation Values
// // // // //   const fadeAnim = useState(new Animated.Value(0))[0];
// // // // //   const modalSlide = useState(new Animated.Value(0))[0];

// // // // //   // Initial Data Loading
// // // // //   useEffect(() => {
// // // // //     const loadInitialData = async () => {
// // // // //       try {
// // // // //         const [fetchedComments, fetchedLikes, count] = await Promise.all([
// // // // //           getComments(post.id),
// // // // //           getLikes(post.id),
// // // // //           getShareCount(post.id),
// // // // //         ]);
// // // // //         setComments(fetchedComments);
// // // // //         setLikes(fetchedLikes);
// // // // //         setIsLiked(fetchedLikes.some((like) => like.userId === user?.uid));
// // // // //         setShareCount(count);
        
// // // // //         Animated.timing(fadeAnim, {
// // // // //           toValue: 1,
// // // // //           duration: 500,
// // // // //           useNativeDriver: true,
// // // // //         }).start();
// // // // //       } catch (error) {
// // // // //         console.error("Initial data loading error:", error);
// // // // //         Alert.alert('Error', 'Failed to load post data');
// // // // //       }
// // // // //     };
// // // // //     loadInitialData();
// // // // //   }, [post.id, user?.uid]);

// // // // //   // Handlers
// // // // //   const handleProfilePress = useCallback(() => {
// // // // //     navigation.navigate('Profile', { userId: post.userId });
// // // // //   }, [post.userId, navigation]);

// // // // //   const handleLike = async () => {
// // // // //     try {
// // // // //       setIsLiked(prev => !prev);
// // // // //       if (isLiked) {
// // // // //         await removeLike(post.id, user);
// // // // //       } else {
// // // // //         await addLike(post.id, user);
// // // // //       }
// // // // //       const updatedLikes = await getLikes(post.id);
// // // // //       setLikes(updatedLikes);
// // // // //     } catch (error) {
// // // // //       console.error("Like error:", error);
// // // // //       setIsLiked(prev => !prev);
// // // // //       Alert.alert('Error', 'Failed to process like');
// // // // //     }
// // // // //   };

// // // // //   const handleShare = async () => {
// // // // //     try {
// // // // //       const result = await Share.share({
// // // // //         title: `${post.userName}'s Campus Post`,
// // // // //         message: `${post.content}\n\nShared via Campus Pulse App`,
// // // // //         url: post.mediaUrl,
// // // // //       });
// // // // //       if (result.action === Share.sharedAction) {
// // // // //         await incrementShareCount(post.id);
// // // // //         setShareCount(prev => prev + 1);
// // // // //       }
// // // // //     } catch (error) {
// // // // //       Alert.alert('Error', 'Failed to share post');
// // // // //     }
// // // // //   };

// // // // //   const handleCommentSubmit = async () => {
// // // // //     if (!newComment.trim()) return;
// // // // //     try {
// // // // //       const commentData = {
// // // // //         content: newComment.trim(),
// // // // //         userAvatar: user?.photoURL || DEFAULT_AVATAR,
// // // // //         userName: user?.displayName || "Anonymous",
// // // // //         replyTo: replyTo?.id || null,
// // // // //       };
// // // // //       await addComment(post.id, commentData, user);
// // // // //       setNewComment("");
// // // // //       setReplyTo(null);
// // // // //       const updatedComments = await getComments(post.id);
// // // // //       setComments(updatedComments);
// // // // //     } catch (error) {
// // // // //       console.error("Comment submission error:", error);
// // // // //       Alert.alert('Error', 'Failed to submit comment');
// // // // //     }
// // // // //   };

// // // // //   const toggleModal = (visible) => {
// // // // //     if (visible) {
// // // // //       setModalVisible(true);
// // // // //       Animated.spring(modalSlide, {
// // // // //         toValue: 1,
// // // // //         useNativeDriver: true,
// // // // //       }).start();
// // // // //     } else {
// // // // //       Animated.spring(modalSlide, {
// // // // //         toValue: 0,
// // // // //         useNativeDriver: true,
// // // // //       }).start(() => setModalVisible(false));
// // // // //     }
// // // // //   };
// // // // //   // Render Methods
// // // // //   const renderUserAvatar = (avatarUrl, name) => (
// // // // //     <TouchableOpacity onPress={handleProfilePress} style={styles.avatarContainer}>
// // // // //       <View style={styles.avatarBorder}>
// // // // //         {avatarUrl ? (
// // // // //           <Image source={{ uri: avatarUrl }} style={styles.avatar} />
// // // // //         ) : (
// // // // //           <View style={[styles.avatar, styles.defaultAvatar]}>
// // // // //             <Text style={styles.initials}>{generateInitials(name)}</Text>
// // // // //           </View>
// // // // //         )}
// // // // //       </View>
// // // // //     </TouchableOpacity>
// // // // //   );

// // // // //   return (
// // // // //     <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
// // // // //       {/* Post Header */}
// // // // //       <View style={styles.header}>
// // // // //         {renderUserAvatar(post.profileUrl, post.userName)}
// // // // //         <TouchableOpacity onPress={handleProfilePress} style={styles.userInfo}>
// // // // //           <Text style={styles.userName}>{post.userName}</Text>
// // // // //           <Text style={styles.timeStamp}>{post.timestamp}</Text>
// // // // //         </TouchableOpacity>
// // // // //         {user?.uid === post.userId && (
// // // // //           <TouchableOpacity
// // // // //             onPress={() =>
// // // // //               Alert.alert('Delete', 'Are you sure?', [
// // // // //                 { text: 'Cancel' },
// // // // //                 { text: 'Delete', onPress: () => deletePost(post.id) },
// // // // //               ])
// // // // //             }
// // // // //           >
// // // // //             <Ionicons name="ellipsis-vertical" size={20} color="#888" />
// // // // //           </TouchableOpacity>
// // // // //         )}
// // // // //       </View>

// // // // //       {/* Post Content */}
// // // // //       <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)}>
// // // // //         <Text
// // // // //           style={styles.content}
// // // // //           numberOfLines={isExpanded ? undefined : MAX_CONTENT_LINES}
// // // // //           onLayout={({ nativeEvent: { layout } }) => {
// // // // //             setContentHeight(layout.height);
// // // // //             setShouldShowMore(layout.height > MAX_CONTENT_LINES * 20);
// // // // //           }}
// // // // //         >
// // // // //           {post.content}
// // // // //         </Text>
// // // // //         {shouldShowMore && (
// // // // //           <Text style={styles.showMoreText}>
// // // // //             {isExpanded ? 'Show less' : 'Show more'}
// // // // //           </Text>
// // // // //         )}
// // // // //       </TouchableOpacity>

// // // // //       {/* Image Grid */}
// // // // //       {post.images && <ImageGrid images={post.images} />}

// // // // //       {/* Interaction Section */}
// // // // //       <View style={styles.interactions}>
// // // // //         <TouchableOpacity onPress={handleLike} style={styles.interactionButton}>
// // // // //           <View style={[styles.interactionIconContainer, isLiked && styles.likedIcon]}>
// // // // //             <Ionicons
// // // // //               name={isLiked ? "heart" : "heart-outline"}
// // // // //               size={20}
// // // // //               color={isLiked ? "#fff" : "#666"}
// // // // //             />
// // // // //           </View>
// // // // //           <Text style={styles.interactionText}>{likes.length}</Text>
// // // // //         </TouchableOpacity>

// // // // //         <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.interactionButton}>
// // // // //           <View style={styles.interactionIconContainer}>
// // // // //             <FontAwesome name="comment-o" size={20} color="#666" />
// // // // //           </View>
// // // // //           <Text style={styles.interactionText}>{comments.length}</Text>
// // // // //         </TouchableOpacity>

// // // // //         <TouchableOpacity onPress={handleShare} style={styles.interactionButton}>
// // // // //           <View style={styles.interactionIconContainer}>
// // // // //             <MaterialCommunityIcons name="share-variant" size={20} color="#666" />
// // // // //           </View>
// // // // //           <Text style={styles.interactionText}>{shareCount}</Text>
// // // // //         </TouchableOpacity>
// // // // //       </View>

// // // // //       {/* Comments Section */}
// // // // //       {comments.length > 0 && (
// // // // //         <View style={styles.commentPreviewContainer}>
// // // // //           {comments.slice(-2).map((comment, index) => (
// // // // //             <Text key={index} style={styles.previewComment} numberOfLines={1}>
// // // // //               <Text style={styles.commentUserName}>{comment.userName}: </Text>
// // // // //               {comment.content}
// // // // //             </Text>
// // // // //           ))}
// // // // //           {comments.length > 2 && (
// // // // //             <TouchableOpacity onPress={() => setModalVisible(true)}>
// // // // //               <Text style={styles.viewAllComments}>
// // // // //                 View all {comments.length} comments
// // // // //               </Text>
// // // // //             </TouchableOpacity>
// // // // //           )}
// // // // //         </View>
// // // // //       )}

// // // // //       {/* Comment Input */}
// // // // //       <View style={styles.commentInputContainer}>
// // // // //         <TextInput
// // // // //           value={newComment}
// // // // //           onChangeText={setNewComment}
// // // // //           placeholder="Add a comment..."
// // // // //           style={styles.commentInput}
// // // // //           maxLength={MAX_COMMENT_LENGTH}
// // // // //         />
// // // // //         <TouchableOpacity
// // // // //           onPress={handleCommentSubmit}
// // // // //           style={[styles.sendButton, !newComment.trim() && styles.sendButtonDisabled]}
// // // // //           disabled={!newComment.trim()}
// // // // //         >
// // // // //           <Text style={styles.sendButtonText}>Send</Text>
// // // // //         </TouchableOpacity>
// // // // //       </View>

// // // // //       {/* Comments Modal */}
// // // // //       <Modal
// // // // //         visible={modalVisible}
// // // // //         transparent
// // // // //         animationType="slide"
// // // // //         onRequestClose={() => setModalVisible(false)}
// // // // //       >
// // // // //         <View style={styles.modalOverlay}>
// // // // //           <View style={styles.commentsModal}>
// // // // //             <View style={styles.modalHeader}>
// // // // //               <Text style={styles.modalTitle}>Comments ({comments.length})</Text>
// // // // //               <TouchableOpacity onPress={() => setModalVisible(false)}>
// // // // //                 <Ionicons name="close" size={24} color="#333" />
// // // // //               </TouchableOpacity>
// // // // //             </View>

// // // // //             <FlatList
// // // // //               data={comments}
// // // // //               keyExtractor={(item, index) => index.toString()}
// // // // //               renderItem={({ item: comment }) => (
// // // // //                 <View style={styles.commentItem}>
// // // // //                   {renderUserAvatar(comment.userAvatar, comment.userName)}
// // // // //                   <View style={styles.commentContentContainer}>
// // // // //                     <Text style={styles.commentUserName}>{comment.userName}</Text>
// // // // //                     <Text style={styles.commentContent}>{comment.content}</Text>
// // // // //                     <View style={styles.commentActions}>
// // // // //                       <TouchableOpacity onPress={() => setReplyTo(comment)}>
// // // // //                         <Text style={styles.replyText}>Reply</Text>
// // // // //                       </TouchableOpacity>
// // // // //                       <Text style={styles.commentTime}>{comment.timestamp}</Text>
// // // // //                     </View>
// // // // //                   </View>
// // // // //                 </View>
// // // // //               )}
// // // // //             />

// // // // //             <View style={styles.modalInputContainer}>
// // // // //               {replyTo && (
// // // // //                 <View style={styles.replyingToContainer}>
// // // // //                   <Text style={styles.replyingTo}>
// // // // //                     Replying to {replyTo.userName}
// // // // //                   </Text>
// // // // //                   <TouchableOpacity onPress={() => setReplyTo(null)}>
// // // // //                     <Text style={styles.cancelReply}>Cancel</Text>
// // // // //                   </TouchableOpacity>
// // // // //                 </View>
// // // // //               )}
// // // // //               <View style={styles.inputWrapper}>
// // // // //                 <TextInput
// // // // //                   value={newComment}
// // // // //                   onChangeText={setNewComment}
// // // // //                   placeholder={replyTo ? `Reply to ${replyTo.userName}` : "Add a comment..."}
// // // // //                   style={styles.modalInput}
// // // // //                   maxLength={MAX_COMMENT_LENGTH}
// // // // //                   multiline
// // // // //                 />
// // // // //                 <TouchableOpacity
// // // // //                   onPress={handleCommentSubmit}
// // // // //                   style={[styles.sendButton, !newComment.trim() && styles.sendButtonDisabled]}
// // // // //                   disabled={!newComment.trim()}
// // // // //                 >
// // // // //                   <Text style={styles.sendButtonText}>Send</Text>
// // // // //                 </TouchableOpacity>
// // // // //               </View>
// // // // //             </View>
// // // // //           </View>
// // // // //         </View>
// // // // //       </Modal>
// // // // //     </Animated.View>
// // // // //   );
// // // // // };

// // // // // const styles = StyleSheet.create({
// // // // //   // ... Previous styles remain the same ...
// // // // //   card: {
// // // // //     backgroundColor: '#fff',
// // // // //     borderRadius: 15,
// // // // //     marginVertical: 10,
// // // // //     padding: 15,
// // // // //     shadowColor: '#000',
// // // // //     shadowOffset: { width: 0, height: 2 },
// // // // //     shadowOpacity: 0.1,
// // // // //     shadowRadius: 5,
// // // // //     elevation: 3,
// // // // //   },
// // // // //   header: {
// // // // //     flexDirection: 'row',
// // // // //     alignItems: 'center',
// // // // //     marginBottom: 15,
// // // // //   },
// // // // //   avatarContainer: {
// // // // //     marginRight: 12,
// // // // //   },
// // // // //   avatarGradient: {
// // // // //     padding: 2,
// // // // //     borderRadius: 22,
// // // // //   },
// // // // //   avatar: {
// // // // //     width: 40,
// // // // //     height: 40,
// // // // //     borderRadius: 20,
// // // // //     backgroundColor: '#fff',
// // // // //   },
// // // // //   defaultAvatar: {
// // // // //     backgroundColor: '#ccc',
// // // // //     justifyContent: 'center',
// // // // //     alignItems: 'center',
// // // // //   },
// // // // //   userInfo: {
// // // // //     flex: 1,
// // // // //   },
// // // // //   userName: {
// // // // //     fontSize: 16,
// // // // //     fontWeight: 'bold',
// // // // //     color: '#333',
// // // // //   },
// // // // //   timeStamp: {
// // // // //     fontSize: 12,
// // // // //     color: '#888',
// // // // //     marginTop: 2,
// // // // //   },
// // // // //   content: {
// // // // //     fontSize: 15,
// // // // //     color: '#333',
// // // // //     lineHeight: 20,
// // // // //     marginBottom: 10,
// // // // //   },
// // // // //   showMoreText: {
// // // // //     color: '#6a0dad',
// // // // //     fontSize: 14,
// // // // //     marginTop: 5,
// // // // //     marginBottom: 10,
// // // // //   },
// // // // //   imageGridContainer: {
// // // // //     flexDirection: 'row',
// // // // //     flexWrap: 'wrap',
// // // // //     marginBottom: 10,
// // // // //   },
// // // // //   gridImage: {
// // // // //     borderRadius: 8,
// // // // //   },
// // // // //   interactions: {
// // // // //     flexDirection: 'row',
// // // // //     alignItems: 'center',
// // // // //     paddingVertical: 10,
// // // // //     borderTopWidth: StyleSheet.hairlineWidth,
// // // // //     borderBottomWidth: StyleSheet.hairlineWidth,
// // // // //     borderColor: '#eee',
// // // // //   },
// // // // //   interactionButton: {
// // // // //     flexDirection: 'row',
// // // // //     alignItems: 'center',
// // // // //     marginRight: 20,
// // // // //   },
// // // // //   interactionGradient: {
// // // // //     padding: 8,
// // // // //     borderRadius: 20,
// // // // //   },
// // // // //   interactionText: {
// // // // //     marginLeft: 5,
// // // // //     fontSize: 14,
// // // // //     color: '#666',
// // // // //   },
// // // // //   commentPreviewContainer: {
// // // // //     marginTop: 10,
// // // // //   },
// // // // //   previewComment: {
// // // // //     fontSize: 14,
// // // // //     color: '#666',
// // // // //     marginBottom: 3,
// // // // //   },
// // // // //   viewAllComments: {
// // // // //     color: '#888',
// // // // //     fontSize: 14,
// // // // //     marginTop: 5,
// // // // //   },
// // // // //   modalOverlay: {
// // // // //     flex: 1,
// // // // //     backgroundColor: 'rgba(0, 0, 0, 0.5)',
// // // // //     justifyContent: 'flex-end',
// // // // //   },
// // // // //   commentsModal: {
// // // // //     backgroundColor: '#fff',
// // // // //     borderTopLeftRadius: 20,
// // // // //     borderTopRightRadius: 20,
// // // // //     minHeight: '50%',
// // // // //     maxHeight: '90%',
// // // // //     paddingTop: 20,
// // // // //   },
// // // // //   modalHeader: {
// // // // //     flexDirection: 'row',
// // // // //     justifyContent: 'space-between',
// // // // //     alignItems: 'center',
// // // // //     paddingHorizontal: 20,
// // // // //     marginBottom: 15,
// // // // //   },
// // // // //   modalTitle: {
// // // // //     fontSize: 18,
// // // // //     fontWeight: 'bold',
// // // // //     color: '#333',
// // // // //   },
// // // // //   commentItem: {
// // // // //     flexDirection: 'row',
// // // // //     padding: 15,
// // // // //     borderBottomWidth: StyleSheet.hairlineWidth,
// // // // //     borderBottomColor: '#eee',
// // // // //   },
// // // // //   commentContentContainer: {
// // // // //     flex: 1,
// // // // //     marginLeft: 10,
// // // // //   },
// // // // //   commentContent: {
// // // // //     fontSize: 14,
// // // // //     color: '#333',
// // // // //     marginTop: 3,
// // // // //   },
// // // // //   commentActions: {
// // // // //     flexDirection: 'row',
// // // // //     alignItems: 'center',
// // // // //     marginTop: 5,
// // // // //   },
// // // // //   replyText: {
// // // // //     fontSize: 12,
// // // // //     color: '#6a0dad',
// // // // //     marginRight: 15,
// // // // //   },
// // // // //   commentTime: {
// // // // //     fontSize: 12,
// // // // //     color: '#888',
// // // // //   },
// // // // //   replyContainer: {
// // // // //     flexDirection: 'row',
// // // // //     marginTop: 10,
// // // // //     marginLeft: 20,
// // // // //     padding: 10,
// // // // //     backgroundColor: '#f8f8f8',
// // // // //     borderRadius: 10,
// // // // //   },
// // // // //   replyContent: {
// // // // //     flex: 1,
// // // // //     marginLeft: 10,
// // // // //   },
// // // // //   modalInputContainer: {
// // // // //     padding: 15,
// // // // //     borderTopWidth: StyleSheet.hairlineWidth,
// // // // //     borderTopColor: '#eee',
// // // // //   },
// // // // //   replyingToContainer: {
// // // // //     flexDirection: 'row',
// // // // //     alignItems: 'center',
// // // // //     marginBottom: 10,
// // // // //   },
// // // // //   replyingTo: {
// // // // //     fontSize: 12,
// // // // //     color: '#6a0dad',
// // // // //     flex: 1,
// // // // //   },
// // // // //   cancelReply: {
// // // // //     fontSize: 12,
// // // // //     color: '#ff4d4d',
// // // // //     marginLeft: 10,
// // // // //   },
// // // // //   inputWrapper: {
// // // // //     flexDirection: 'row',
// // // // //     alignItems: 'flex-end',
// // // // //   },
// // // // //   modalInput: {
// // // // //     flex: 1,
// // // // //     borderWidth: 1,
// // // // //     borderColor: '#ddd',
// // // // //     borderRadius: 20,
// // // // //     paddingHorizontal: 15,
// // // // //     paddingVertical: 8,
// // // // //     marginRight: 10,
// // // // //     maxHeight: 100,
// // // // //   },
// // // // //   sendButton: {
// // // // //     borderRadius: 20,
// // // // //     overflow: 'hidden',
// // // // //   },
// // // // //   sendButtonGradient: {
// // // // //     paddingHorizontal: 15,
// // // // //     paddingVertical: 8,
// // // // //   },
// // // // //   sendButtonText: {
// // // // //     color: '#fff',
// // // // //     fontWeight: 'bold',
// // // // //   },
// // // // //   initials: {
// // // // //     fontSize: 16,
// // // // //     fontWeight: 'bold',
// // // // //     color: '#fff',
// // // // //   },  avatarBorder: {
// // // // //     padding: 2,
// // // // //     borderRadius: 22,
// // // // //     borderWidth: 2,
// // // // //     borderColor: '#6a0dad',
// // // // //   },
// // // // //   interactionIconContainer: {
// // // // //     width: 36,
// // // // //     height: 36,
// // // // //     borderRadius: 18,
// // // // //     backgroundColor: '#f0f0f0',
// // // // //     justifyContent: 'center',
// // // // //     alignItems: 'center',
// // // // //   },
// // // // //   likedIcon: {
// // // // //     backgroundColor: '#6a0dad',
// // // // //   },
// // // // //   sendButton: {
// // // // //     backgroundColor: '#6a0dad',
// // // // //     paddingHorizontal: 15,
// // // // //     paddingVertical: 8,
// // // // //     borderRadius: 20,
// // // // //   },
// // // // //   sendButtonDisabled: {
// // // // //     backgroundColor: '#ccc',
// // // // //   },
// // // // //   // ... Rest of the styles remain the same ...
// // // // // });

// // // // // export default PostCard;

// // // // import React, { useState, useEffect, useCallback } from 'react';
// // // // import {
// // // //   View,
// // // //   Text,
// // // //   Image,
// // // //   TouchableOpacity,
// // // //   TextInput,
// // // //   Modal,
// // // //   Share,
// // // //   Alert,
// // // //   Animated,
// // // //   FlatList,
// // // //   Dimensions,
// // // //   StyleSheet
// // // // } from 'react-native';
// // // // import { Ionicons, FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
// // // // import { useNavigation } from '@react-navigation/native';
// // // // import { useAuth } from '../context/authContext';
// // // // import {
// // // //   addComment,
// // // //   getComments,
// // // //   addLike,
// // // //   removeLike,
// // // //   getLikes,
// // // //   incrementShareCount,
// // // //   getShareCount,
// // // //   deletePost,
// // // // } from "../app/(apis)/post";
// // // // import { doc, getDoc } from 'firebase/firestore';
// // // // import { db } from '../config/firebaseConfig';
// // // // // import { getUserProfile } from "../app/(apis)/user";
// // // // import { classNames } from '../utiles/helper'; // Utility for combining class names conditionally
// // // // import { Image as ExpoImage } from "expo-image";
// // // // // Constants


// // // // const DEFAULT_AVATAR = 'https://via.placeholder.com/100?text=User';
// // // // const MAX_COMMENT_LENGTH = 500;
// // // // const MAX_CONTENT_LINES = 3;
// // // // const SCREEN_WIDTH = Dimensions.get('window').width;
// // // // const IMAGE_MARGIN = 2;
// // // // const PRIMARY_COLOR = '#9F7AEA'; // Indigo-600
// // // // const SECONDARY_COLOR = '#F7FAFC'; // Gray-100
// // // // const TEXT_COLOR = '#9F7AEC'; // Gray-800
// // // // const ACCENT_COLOR = '#9F7AEA'; // Purple-500

// // // // // Utility functions
// // // // const generateInitials = (name) => {
// // // //   if (!name) return '?';
// // // //   return name.split(' ')[0][0].toUpperCase().slice(0, 2);
// // // // };
// // // //  async function getUserProfile(userId) {
// // // //   try {
// // // //     if (!userId) {
// // // //       console.error("No userId provided to getUserProfile");
// // // //       return null;
// // // //     }
// // // // // console.log("getUserProfile", userId);
// // // //     const userDocRef = doc(db, 'users', userId);
// // // //     const userDocSnap = await getDoc(userDocRef);

// // // //     if (!userDocSnap.exists()) {
// // // //       console.warn(`User with ID ${userId} not found`);
// // // //       return null;
// // // //     }

// // // //     // Combine the document ID with the document data
// // // //     const userData = {
// // // //       id: userDocSnap.id,
// // // //       ...userDocSnap.data()
// // // //     };
    
// // // //     // Fetch the user's college data if collegeId exists
// // // //     if (userData.collegeId) {
// // // //       const collegeDocRef = doc(db, 'colleges', userData.collegeId);
// // // //       const collegeDocSnap = await getDoc(collegeDocRef);
      
// // // //       if (collegeDocSnap.exists()) {
// // // //         userData.college = {
// // // //           id: collegeDocSnap.id,
// // // //           ...collegeDocSnap.data()
// // // //         };
// // // //       }
// // // //     }

// // // //     return userData;
// // // //   } catch (error) {
// // // //     console.error("Error fetching user profile:", error);
// // // //     throw new Error(`Failed to fetch user profile: ${error.message}`);
// // // //   }
// // // // }









// // // // const ImageGrid = ({ images, onPress }) => {
// // // //   const visibleImages = images.slice(0, 4);

// // // //   const getGridContainerStyle = () => {
// // // //     if (images.length === 1) return { width: "100%" };
// // // //     if (images.length === 2) return { flexDirection: "row", gap: 4 };
// // // //     if (images.length === 3) return { flexDirection: "row", gap: 4 };    return { flexDirection: "row", flexWrap: "wrap", gap: 4 };
// // // //   };

// // // //   const getGridCellStyle = (index) => {
// // // //     if (images.length === 1) return { width: "100%", height: 250 };
// // // //     if (images.length === 2) return { width: "48%", height: 200 };
// // // //     if (images.length === 3) return index === 0 ? { width: "100%", height: 220 } : { width: "48%", height: 180 };
// // // //     return { width: "48%", height: 180 };
// // // //   };

// // // //   return (
// // // //     <View style={getGridContainerStyle()}>
// // // //     {images.length === 3 ? (
// // // //       <>
// // // //         {/* First Image - Takes Half Width on the Left */}
// // // //         <TouchableOpacity
// // // //           style={{ width: "48%", height: 250 }}
// // // //           onPress={() => onPress && onPress(images, 0)}
// // // //           activeOpacity={0.9}
// // // //         >
// // // //           <Image
// // // //             source={{ uri: typeof images[0] === "string" ? images[0] : images[0].uri }}
// // // //             style={{ width: "100%", height: "100%", borderRadius: 10 }}
// // // //             resizeMode="cover"
// // // //           />
// // // //         </TouchableOpacity>

// // // //         {/* Right Side - Two Stacked Images */}
// // // //         <View style={{ width: "48%", justifyContent: "space-between" }}>
// // // //           {[1, 2].map((index) => (
// // // //             <TouchableOpacity
// // // //               key={index}
// // // //               style={{ width: "100%", height: 120 }}
// // // //               onPress={() => onPress && onPress(images, index)}
// // // //               activeOpacity={0.9}
// // // //             >
// // // //               <Image
// // // //                 source={{ uri: typeof images[index] === "string" ? images[index] : images[index].uri }}
// // // //                 style={{ width: "100%", height: "100%", borderRadius: 10 }}
// // // //                 resizeMode="cover"
// // // //               />
// // // //             </TouchableOpacity>
// // // //           ))}
// // // //         </View>
// // // //       </>
// // // //     ) : (
// // // //       // Default layout for 1, 2, or 4+ images
// // // //       visibleImages.map((image, index) => (
// // // //         <TouchableOpacity
// // // //           key={index}
// // // //           style={
// // // //             images.length === 1
// // // //               ? { width: "100%", height: 250 }
// // // //               : { width: "48%", height: 180 }
// // // //           }
// // // //           onPress={() => onPress && onPress(images, index)}
// // // //           activeOpacity={0.9}
// // // //         >
// // // //           <Image
// // // //             source={{ uri: typeof image === "string" ? image : image.uri }}
// // // //             style={{ width: "100%", height: "100%", borderRadius: 10 }}
// // // //             resizeMode="cover"
// // // //           />

// // // //           {index === 3 && images.length > 4 && (
// // // //             <View style={{
// // // //               position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.5)",
// // // //               justifyContent: "center", alignItems: "center"
// // // //             }}>
// // // //               <Text style={{ color: "white", fontSize: 20, fontWeight: "bold" }}>+{images.length - 4}</Text>
// // // //             </View>
// // // //           )}
// // // //         </TouchableOpacity>
// // // //       ))
// // // //     )}
// // // //   </View>
// // // //   );
// // // // };




// // // // // Helper utility for combining class names conditionally (put this in utils/helpers.js)

  
  




// // // // const UserProfileModal = ({ visible, onClose, userId }) => {
// // // //   const [profile, setProfile] = useState(null);
// // // //   const [loading, setLoading] = useState(true);
// // // //   const navigation = useNavigation();
// // // //   // console.log("UserProfileModal", usecrId);
// // // //   useEffect(() => {
// // // //     if (visible && userId) {
// // // //       const fetchProfile = async () => {
// // // //         try {
// // // //           const userProfile = await getUserProfile(userId);
// // // //           // console.log("UserProfileModal", userProfile);
// // // //           setProfile(userProfile);
// // // //         } catch (error) {
// // // //           console.error("Failed to fetch user profile:", error);
// // // //         } finally {
// // // //           setLoading(false);
// // // //         }
// // // //       };
      
// // // //       fetchProfile();
// // // //     }
// // // //   }, [visible, userId]);

// // // //   const handleMessage = () => {
// // // //     onClose();
// // // //     navigation.navigate('chat');
// // // //   };

// // // //   const handleViewProfile = () => {
// // // //     onClose();
// // // //     navigation.navigate('Profile', { userId: userId });
// // // //   };

// // // //   return (
// // // //     <Modal
// // // //       visible={visible}
// // // //       transparent
// // // //       animationType="fade"
// // // //       onRequestClose={onClose}
// // // //     >
// // // //       <TouchableOpacity 
// // // //         style={styles.modalOverlay}
// // // //         activeOpacity={1}
// // // //         onPress={onClose}
// // // //       >
// // // //         <View 
// // // //           style={styles.profileModalContent}
// // // //           onStartShouldSetResponder={() => true}
// // // //         >
// // // //           {loading ? (
// // // //             <View style={styles.loadingContainer}>
// // // //               <Text>Loading profile...</Text>
// // // //             </View>
// // // //           ) : profile ? (
// // // //             <>
// // // //               <View style={styles.profileHeader}>
// // // //                 <Image 
// // // //                   source={{ uri: profile.photoURL || DEFAULT_AVATAR }} 
// // // //                   style={styles.profileImage}
// // // //                 />
// // // //                 <View style={styles.profileInfo}>
// // // //                   <Text style={styles.profileName}>{profile.fullName}</Text>
// // // //                   <Text style={styles.profileDetails}>{profile.branch} • {profile.passoutYear}</Text>
// // // //                 </View>
// // // //               </View>
              
        
// // // //               {
// // // //                 profile.about && (
// // // //                   <View style={styles.profileSection}>
// // // //                     <Text style={styles.sectionLabel}>About:</Text>
// // // //                     <Text style={styles.sectionContent}>{profile.about}</Text>
// // // //                   </View>
// // // //                 )
// // // //               }
              
// // // //               {profile.interests && (
// // // //                 <View style={styles.profileSection}>
// // // //                   <Text style={styles.sectionLabel}>Interests:</Text>
// // // //                   <Text style={styles.sectionContent}>{profile.interests}</Text>
// // // //                 </View>
// // // //               )}
              
// // // //               <View style={styles.profileActions}>
// // // //                 <TouchableOpacity 
// // // //                   onPress={handleViewProfile}
// // // //                   style={styles.secondaryButton}
// // // //                 >
// // // //                   <Text style={styles.secondaryButtonText}>View Profile</Text>
// // // //                 </TouchableOpacity>
// // // //                 <TouchableOpacity 
// // // //                   onPress={handleMessage}
// // // //                   style={styles.primaryButton}
// // // //                 >
// // // //                   <Text style={styles.primaryButtonText}>Message</Text>
// // // //                 </TouchableOpacity>
// // // //               </View>
// // // //             </>
// // // //           ) : (
// // // //             <View style={styles.loadingContainer}>
// // // //               <Text>Profile not found</Text>
// // // //             </View>
// // // //           )}
// // // //         </View>
// // // //       </TouchableOpacity>
// // // //     </Modal>
// // // //   );
// // // // };
// // // // // displayName
// // // // const PostCard = ({ post, onDetailView }) => {
// // // //   const { user } = useAuth();
// // // //   const navigation = useNavigation();
// // // // // console.log("PostCard", post.mediaUrl);
// // // //   // State Management
// // // //   const [isLiked, setIsLiked] = useState(false);
// // // //   const [comments, setComments] = useState([]);
// // // //   const [likes, setLikes] = useState([]);
// // // //   const [newComment, setNewComment] = useState('');
// // // //   const [commentModalVisible, setCommentModalVisible] = useState(false);
// // // //   const [profileModalVisible, setProfileModalVisible] = useState(false);
// // // //   const [imageViewerVisible, setImageViewerVisible] = useState(false);
// // // //   const [currentImageIndex, setCurrentImageIndex] = useState(0);
// // // //   const [shareCount, setShareCount] = useState(0);
// // // //   const [replyTo, setReplyTo] = useState(null);
// // // //   const [isExpanded, setIsExpanded] = useState(false);
// // // //   const [contentHeight, setContentHeight] = useState(0);
// // // //   const [shouldShowMore, setShouldShowMore] = useState(false);
// // // //   const [profile, setProfile] = useState(null);
// // // //   // Animation Values
// // // //   const fadeAnim = useState(new Animated.Value(0))[0];
// // // //   const modalSlide = useState(new Animated.Value(0))[0];
// // // //   const userData= getUserProfile(post.userId);
// // // // //  console.log()
// // // //   // Initial Data Loading
// // // //   useEffect(() => {
// // // //     const loadInitialData = async () => {
// // // //       try {
// // // //         const [fetchedComments, fetchedLikes, count] = await Promise.all([
// // // //           getComments(post.id),
// // // //           getLikes(post.id),
// // // //           getShareCount(post.id),
// // // //         ]);
// // // //         setComments(fetchedComments);
// // // //         setLikes(fetchedLikes);
// // // //         setIsLiked(fetchedLikes.some((like) => like.userId === user?.uid));
// // // //         setShareCount(count);
        
// // // //         Animated.timing(fadeAnim, {
// // // //           toValue: 1,
// // // //           duration: 500,
// // // //           useNativeDriver: true,
// // // //         }).start();
// // // //       } catch (error) {
// // // //         console.error("Initial data loading error:", error);
// // // //         Alert.alert('Error', 'Failed to load post data');
// // // //       }
// // // //     };
// // // //     loadInitialData();
// // // //   }, [post.id, user?.uid]);

// // // //   // Handlers
// // // //   const handleProfilePress = useCallback(() => {
// // // //     setProfileModalVisible(true);
// // // //   }, []);

// // // //   const handleImagePress = useCallback((images, index) => {
// // // //     setCurrentImageIndex(index);
// // // //     setImageViewerVisible(true);
// // // //   }, []);

// // // //   const handleLike = async () => {
// // // //     try {
// // // //       setIsLiked(prev => !prev);
// // // //       if (isLiked) {
// // // //         await removeLike(post.id, user);
// // // //       } else {
// // // //         await addLike(post.id, user);
// // // //       }
// // // //       const updatedLikes = await getLikes(post.id);
// // // //       setLikes(updatedLikes);
// // // //     } catch (error) {
// // // //       console.error("Like error:", error);
// // // //       setIsLiked(prev => !prev);
// // // //       Alert.alert('Error', 'Failed to process like');
// // // //     }
// // // //   };
// // // //   // displayName
// // // //   const handleShare = async () => {
// // // //     try {
// // // //       const result = await Share.share({
// // // //         title: `${post.userName}'s Campus Post`,
// // // //         message: `${post.content}\n\nShared via Campus Pulse App`,
// // // //         url: post.mediaUrl,
// // // //       });
// // // //       if (result.action === Share.sharedAction) {
// // // //         await incrementShareCount(post.id);
// // // //         setShareCount(prev => prev + 1);
// // // //       }
// // // //     } catch (error) {
// // // //       Alert.alert('Error', 'Failed to share post');
// // // //     }
// // // //   };

// // // //   const handleCommentSubmit = async () => {
// // // //     if (!newComment.trim()) return;
// // // //     try {
// // // //       const commentData = {
// // // //         content: newComment.trim(),
// // // //         userAvatar: user?.photoURL || DEFAULT_AVATAR,
// // // //         userName: user?.fullName || "Anonymous",
// // // //         replyTo: replyTo?.id || null,
// // // //         timestamp: new Date().toISOString(),
// // // //       };
// // // //       await addComment(post.id, commentData, user);
// // // //       setNewComment("");
// // // //       setReplyTo(null);
// // // //       const updatedComments = await getComments(post.id);
// // // //       setComments(updatedComments);
// // // //     } catch (error) {
// // // //       console.error("Comment submission error:", error);
// // // //       Alert.alert('Error', 'Failed to submit comment');
// // // //     }
// // // //   };

// // // //   async function getProfile(userId) {

// // // //     const userProfile = await getUserProfile(userId);
// // // //     // console.log("UserProfileModal", userProfile);
// // // //     setProfile(userProfile.photoURL);
// // // //     // console.log("UserProfileModal", profile);
// // // //       return profile
// // // //   }
// // // //   // Render methods
// // // //   const renderUserAvatar = (avatarUrl, name) => (
  
// // // // // console.log("UserProfileModal", profile);
// // // //     <TouchableOpacity onPress={handleProfilePress} style={styles.avatarContainer}>
// // // //       <View style={styles.avatarBorder}>
// // // //         {profile ? (
// // // //           <ExpoImage source={{uri:profile}} style={styles.avatar} />
// // // //         ) : (
// // // //           <View style={styles.placeholderAvatar}>
// // // //             <Text style={styles.placeholderText}>{generateInitials(name)}</Text>
// // // //           </View>
// // // //         )}
// // // //       </View>
// // // //     </TouchableOpacity>
// // // //   );

// // // //   // Group comments by parent (for replies)
// // // //   const groupedComments = comments.reduce((acc, comment) => {
// // // //     if (!comment.replyTo) {
// // // //       acc.push({
// // // //         ...comment,
// // // //         replies: comments.filter(reply => reply.replyTo === comment.id)
// // // //       });
// // // //     }
// // // //     return acc;
// // // //   }, []);

// // // //   return (
// // // //     <Animated.View 
// // // //       style={[
// // // //         styles.cardContainer,
// // // //         { opacity: fadeAnim }
// // // //       ]}
// // // //     >
// // // //       {/* Post Header */}
// // // //       <View style={styles.postHeader}>
// // // //         {renderUserAvatar(getProfile(post.userId), post.userName)}
// // // //         <TouchableOpacity onPress={handleProfilePress} style={styles.userInfo}>
// // // //           <Text style={styles.userName}>{post.userName}</Text>
// // // //           <Text style={styles.timestamp}>{post.timestamp}</Text>
// // // //         </TouchableOpacity>
// // // //         {user?.uid === post.userId && (
// // // //           <TouchableOpacity
// // // //             onPress={() =>
// // // //               Alert.alert('Delete Post', 'Are you sure you want to delete this post?', [
// // // //                 { text: 'Cancel' },
// // // //                 { text: 'Delete', onPress: () => deletePost(post.id) },
// // // //               ])
// // // //             }
// // // //             style={styles.menuButton}
// // // //           >
// // // //             <Ionicons name="ellipsis-vertical" size={20} color="#888" />
// // // //           </TouchableOpacity>
// // // //         )}
// // // //       </View>

// // // //       {/* Post Content */}
// // // //       <View style={styles.contentContainer}>
// // // //         <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)}>
// // // //           <Text
// // // //             style={styles.contentText}
// // // //             numberOfLines={isExpanded ? undefined : MAX_CONTENT_LINES}
// // // //             onLayout={({ nativeEvent: { layout } }) => {
// // // //               setContentHeight(layout.height);
// // // //               setShouldShowMore(layout.height > MAX_CONTENT_LINES * 20);
// // // //             }}
// // // //           >
// // // //             {post.content}
// // // //           </Text>
// // // //           {shouldShowMore && (
// // // //             <Text style={styles.showMoreText}>
// // // //               {isExpanded ? 'Show less' : 'Show more'}
// // // //             </Text>
// // // //           )}
// // // //         </TouchableOpacity>

// // // //         {/* Image Grid */}
// // // //         {post.mediaUrls && post.mediaUrls.length > 0 && (
// // // //           <View style={styles.imagesContainer} className="images-container ">
// // // //             <ImageGrid images={post.mediaUrls} onPress={handleImagePress} />
// // // //           </View>
// // // //         )}
// // // //       </View>

// // // //       {/* Interaction Section */}
// // // //       <View style={styles.interactionContainer}>
// // // //         <TouchableOpacity 
// // // //           onPress={handleLike} 
// // // //           style={styles.interactionButton}
// // // //         >
// // // //           <View style={[
// // // //             styles.iconContainer,
// // // //             isLiked ? styles.likedIconContainer : styles.defaultIconContainer
// // // //           ]}>
// // // //             <Ionicons
// // // //               name={isLiked ? "heart" : "heart-outline"}
// // // //               size={20}
// // // //               color={isLiked ? "#fff" : "#666"}
// // // //             />
// // // //           </View>
// // // //           <Text style={styles.interactionCount}>{likes.length}</Text>
// // // //         </TouchableOpacity>

// // // //         <TouchableOpacity 
// // // //           onPress={() => setCommentModalVisible(true)} 
// // // //           style={styles.interactionButton}
// // // //         >
// // // //           <View style={styles.defaultIconContainer}>
// // // //             <FontAwesome name="comment-o" size={20} color="#666" />
// // // //           </View>
// // // //           <Text style={styles.interactionCount}>{comments.length}</Text>
// // // //         </TouchableOpacity>

// // // //         <TouchableOpacity 
// // // //           onPress={handleShare} 
// // // //           style={styles.interactionButton}
// // // //         >
// // // //           <View style={styles.defaultIconContainer}>
// // // //             <MaterialCommunityIcons name="share-variant" size={20} color="#666" />
// // // //           </View>
// // // //           <Text style={styles.interactionCount}>{shareCount}</Text>
// // // //         </TouchableOpacity>
// // // //       </View>

// // // //       {/* Comments Preview */}
// // // //       {comments.length > 0 && (
// // // //         <View style={styles.commentsPreviewContainer}>
// // // //           {comments.slice(-2).map((comment, index) => (
// // // //             <Text key={index} style={styles.commentPreviewText} numberOfLines={1}>
// // // //               <Text style={styles.commentPreviewUser}>{comment.userName}: </Text>
// // // //               {comment.content}
// // // //             </Text>
// // // //           ))}
// // // //           {comments.length > 2 && (
// // // //             <TouchableOpacity onPress={() => setCommentModalVisible(true)}>
// // // //               <Text style={styles.viewAllCommentsText}>
// // // //                 View all {comments.length} comments
// // // //               </Text>
// // // //             </TouchableOpacity>
// // // //           )}
// // // //         </View>
// // // //       )}

// // // //       {/* Quick Comment Input */}
// // // //       <View style={styles.quickCommentContainer}>
// // // //         <TextInput
// // // //           value={newComment}
// // // //           onChangeText={setNewComment}
// // // //           placeholder="Add a comment..."
// // // //           style={styles.commentInput}
// // // //           maxLength={MAX_COMMENT_LENGTH}
// // // //         />
// // // //         <TouchableOpacity
// // // //           onPress={handleCommentSubmit}
// // // //           style={[
// // // //             styles.sendButton,
// // // //             newComment.trim() ? styles.activeSendButton : styles.disabledSendButton
// // // //           ]}
// // // //           disabled={!newComment.trim()}
// // // //         >
// // // //           <Text style={styles.sendButtonText}>Send</Text>
// // // //         </TouchableOpacity>
// // // //       </View>

// // // //       {/* Comments Modal */}
// // // //       <Modal
// // // //         visible={commentModalVisible}
// // // //         transparent={false}
// // // //         animationType="slide"
// // // //         onRequestClose={() => setCommentModalVisible(false)}
// // // //       >
// // // //         <View style={styles.modalContainer}>
// // // //           <View style={styles.modalHeader}>
// // // //             <Text style={styles.modalTitle}>Comments ({comments.length})</Text>
// // // //             <TouchableOpacity onPress={() => setCommentModalVisible(false)}>
// // // //               <Ionicons name="close" size={24} color="#fff" />
// // // //             </TouchableOpacity>
// // // //           </View>

// // // //           <FlatList
// // // //             data={groupedComments}
// // // //             keyExtractor={(item) => item.id.toString()}
// // // //             style={styles.commentsListContainer}
// // // //             contentContainerStyle={styles.commentsListContent}
// // // //             renderItem={({ item: comment }) => (
// // // //               <View style={styles.commentThread}>
// // // //                 {/* Main comment */}
// // // //                 <View style={styles.commentContainer}>
// // // //                   {renderUserAvatar(comment.photoURL, comment.userName)}
// // // //                   <View style={styles.commentBubble}>
// // // //                     <Text style={styles.commentUsername}>{comment.userName}</Text>
// // // //                     <Text style={styles.commentText}>{comment.content}</Text>
// // // //                     <View style={styles.commentActions}>
// // // //                       <TouchableOpacity onPress={() => setReplyTo(comment)}>
// // // //                         <Text style={styles.replyText}>Reply</Text>
// // // //                       </TouchableOpacity>
// // // //                       <Text style={styles.commentTimestamp}>{comment.timestamp}</Text>
// // // //                     </View>
// // // //                   </View>
// // // //                 </View>

// // // //                 {/* Replies */}
// // // //                 {comment.replies && comment.replies.length > 0 && (
// // // //                   <View style={styles.repliesContainer}>
// // // //                     {comment.replies.map((reply) => (
// // // //                       <View key={reply.id} style={styles.replyContainer}>
// // // //                         {renderUserAvatar(reply.userAvatar, reply.userName)}
// // // //                         <View style={styles.replyBubble}>
// // // //                           <Text style={styles.commentUsername}>{reply.userName}</Text>
// // // //                           <Text style={styles.commentText}>{reply.content}</Text>
// // // //                           <View style={styles.commentActions}>
// // // //                             <TouchableOpacity onPress={() => setReplyTo(reply)}>
// // // //                               <Text style={styles.replyText}>Reply</Text>
// // // //                             </TouchableOpacity>
// // // //                             <Text style={styles.commentTimestamp}>{reply.timestamp}</Text>
// // // //                           </View>
// // // //                         </View>
// // // //                       </View>
// // // //                     ))}
// // // //                   </View>
// // // //                 )}
// // // //               </View>
// // // //             )}
// // // //           />

// // // //           {/* Comment Input with Reply */}
// // // //           <View style={styles.modalInputContainer}>
// // // //             {replyTo && (
// // // //               <View style={styles.replyingContainer}>
// // // //                 <Text style={styles.replyingText}>
// // // //                   Replying to <Text style={styles.replyingUsername}>{replyTo.userName}</Text>
// // // //                 </Text>
// // // //                 <TouchableOpacity onPress={() => setReplyTo(null)}>
// // // //                   <Text style={styles.cancelReplyText}>Cancel</Text>
// // // //                 </TouchableOpacity>
// // // //               </View>
// // // //             )}
// // // //             <View style={styles.modalInputWrapper}>
// // // //               <TextInput
// // // //                 value={newComment}
// // // //                 onChangeText={setNewComment}
// // // //                 placeholder={replyTo ? `Reply to ${replyTo.userName}...` : "Add a comment..."}
// // // //                 style={styles.modalCommentInput}
// // // //                 maxLength={MAX_COMMENT_LENGTH}
// // // //                 multiline
// // // //               />
// // // //               <TouchableOpacity
// // // //                 onPress={handleCommentSubmit}
// // // //                 style={[
// // // //                   styles.modalSendButton,
// // // //                   newComment.trim() ? styles.activeSendButton : styles.disabledSendButton
// // // //                 ]}
// // // //                 disabled={!newComment.trim()}
// // // //               >
// // // //                 <Text style={styles.modalSendButtonText}>Send</Text>
// // // //               </TouchableOpacity>
// // // //             </View>
// // // //           </View>
// // // //         </View>
// // // //       </Modal>

// // // //       {/* User Profile Modal */}
// // // //       <UserProfileModal
// // // //         visible={profileModalVisible}
// // // //         onClose={() => setProfileModalVisible(false)}
// // // //         userId={post.userId}
// // // //       />

// // // //       {/* Image Viewer Modal (simplified) */}
// // // //       <Modal
// // // //         visible={imageViewerVisible}
// // // //         transparent={true}
// // // //         animationType="fade"
// // // //         onRequestClose={() => setImageViewerVisible(false)}
// // // //       >
// // // //         <View style={styles.imageViewerContainer}>
// // // //           <TouchableOpacity 
// // // //             style={styles.closeImageButton}
// // // //             onPress={() => setImageViewerVisible(false)}
// // // //           >
// // // //             <Ionicons name="close" size={28} color="#fff" />
// // // //           </TouchableOpacity>
          
// // // //           {post.mediaUrls && (
// // // //             <Image
// // // //               source={{ uri: post.mediaUrls[currentImageIndex] }}
// // // //               style={styles.fullScreenImage}
// // // //               resizeMode="contain"
// // // //             />
// // // //           )}
          
// // // //           {/* Basic image navigation */}
// // // //           <View style={styles.imageNavigationContainer}>
// // // //             <TouchableOpacity
// // // //               onPress={() => setCurrentImageIndex(prev => Math.max(0, prev - 1))}
// // // //               disabled={currentImageIndex === 0}
// // // //               style={[
// // // //                 styles.imageNavButton,
// // // //                 currentImageIndex === 0 && styles.disabledNavButton
// // // //               ]}
// // // //             >
// // // //               <Ionicons name="chevron-back" size={24} color="#fff" />
// // // //             </TouchableOpacity>
            
// // // //             <TouchableOpacity
// // // //               onPress={() => setCurrentImageIndex(prev => 
// // // //                 Math.min(post.mediaUrls ? post.mediaUrls.length - 1 : 0, prev + 1)
// // // //               )}
// // // //               disabled={!post.mediaUrls || currentImageIndex === post.mediaUrls.length - 1}
// // // //               style={[
// // // //                 styles.imageNavButton,
// // // //                 (!post.mediaUrls || currentImageIndex === post.mediaUrls.length - 1) && styles.disabledNavButton
// // // //               ]}
// // // //             >
// // // //               <Ionicons name="chevron-forward" size={24} color="#fff" />
// // // //             </TouchableOpacity>
// // // //           </View>
// // // //         </View>
// // // //       </Modal>
// // // //     </Animated.View>
// // // //   );
// // // // };

// // // // // Styles
// // // // const styles = StyleSheet.create({
// // // //   cardContainer: {
// // // //     backgroundColor: '#fff',
// // // //     borderRadius: 16,
// // // //     marginVertical: 10,
// // // //     marginHorizontal: 2,
// // // //     shadowColor: '#000',
// // // //     shadowOffset: { width: 0, height: 2 },
// // // //     shadowOpacity: 0.1,
// // // //     shadowRadius: 8,
// // // //     elevation: 3,
// // // //     overflow: 'hidden',
// // // //   },
// // // //   postHeader: {
// // // //     flexDirection: 'row',
// // // //     alignItems: 'center',
// // // //     padding: 16,
// // // //   },
// // // //   avatarContainer: {
// // // //     marginRight: 12,
// // // //   },
// // // //   avatarBorder: {
// // // //     borderWidth: 2,
// // // //     borderColor: PRIMARY_COLOR,
// // // //     borderRadius: 50,
// // // //     padding: 1,
// // // //   },
// // // //   avatar: {
// // // //     width: 40,
// // // //     height: 40,
// // // //     borderRadius: 20,
// // // //   },
// // // //   placeholderAvatar: {
// // // //     width: 40,
// // // //     height: 40,
// // // //     borderRadius: 20,
// // // //     backgroundColor: '#BFDBFE',
// // // //     justifyContent: 'center',
// // // //     alignItems: 'center',
// // // //   },
// // // //   placeholderText: {
// // // //     color: '#1E40AF',
// // // //     fontWeight: 'bold',
// // // //   },
// // // //   userInfo: {
// // // //     flex: 1,
// // // //   },
// // // //   userName: {
// // // //     fontSize: 16,
// // // //     fontWeight: 'bold',
// // // //     color: TEXT_COLOR,
// // // //   },
// // // //   timestamp: {
// // // //     fontSize: 12,
// // // //     color: '#718096',
// // // //     marginTop: 2,
// // // //   },
// // // //   menuButton: {
// // // //     padding: 8,
// // // //   },
// // // //   contentContainer: {
// // // //     padding: 16,
// // // //   },
// // // //   contentText: {
// // // //     color: TEXT_COLOR,
// // // //     lineHeight: 20,
// // // //     fontSize: 15,
// // // //   },
// // // //   showMoreText: {
// // // //     color: PRIMARY_COLOR,
// // // //     fontSize: 14,
// // // //     marginTop: 4,
// // // //   },
// // // //   imagesContainer: {
// // // //     marginTop: 12,
// // // //   },
// // // //   imageGridContainer: {
// // // //     display:'flex',
// // // //     flexDirection: 'row',
    
// // // //     flexWrap: 'wrap',
// // // //     borderRadius: 8,
// // // //     overflow: 'hidden',
// // // //   },
// // // //   fullImage: {
// // // //     width: '100%',
// // // //     height: '100%',
// // // //   },
// // // //   overlayContainer: {
// // // //     position: 'relative',
// // // //   },
// // // //   imageCountOverlay: {
// // // //     position: 'absolute',
// // // //     top: 0,
// // // //     left: 0,
// // // //     right: 0,
// // // //     bottom: 0,
// // // //     backgroundColor: 'rgba(0,0,0,0.5)',
// // // //     justifyContent: 'center',
// // // //     alignItems: 'center',
// // // //   },
// // // //   imageCountText: {
// // // //     color: '#fff',
// // // //     fontSize: 20,
// // // //     fontWeight: 'bold',
// // // //   },
// // // //   interactionContainer: {
// // // //     flexDirection: 'row',
// // // //     alignItems: 'center',
// // // //     justifyContent: 'space-between',
// // // //     paddingHorizontal: 16,
// // // //     paddingVertical: 8,
// // // //   },
// // // //   interactionButton: {
// // // //     flexDirection: 'row',
// // // //     alignItems: 'center',
// // // //   },
// // // //   iconContainer: {
// // // //     width: 36,
// // // //     height: 36,
// // // //     borderRadius: 18,
// // // //     justifyContent: 'center',
// // // //     alignItems: 'center',
// // // //   },
// // // //   defaultIconContainer: {
// // // //     backgroundColor: SECONDARY_COLOR,
// // // //   },
// // // //   likedIconContainer: {
// // // //     backgroundColor: PRIMARY_COLOR,
// // // //   },
// // // //   interactionCount: {
// // // //     marginLeft: 4,
// // // //     color: '#64748B',
// // // //   },
// // // //   commentsPreviewContainer: {
// // // //     padding: 16,
// // // //   },
// // // //   commentPreviewText: {
// // // //     color: TEXT_COLOR,
// // // //     fontSize: 14,
// // // //     marginBottom: 4,
// // // //   },
// // // //   commentPreviewUser: {
// // // //     fontWeight: 'bold',
// // // //   },
// // // //   viewAllCommentsText: {
// // // //     color: '#64748B',
// // // //     fontSize: 14,
// // // //     marginTop: 4,
// // // //   },
// // // //   quickCommentContainer: {
// // // //     flexDirection: 'row',
// // // //     alignItems: 'center',
// // // //     paddingHorizontal: 16,
// // // //     paddingBottom: 16,
// // // //   },
// // // //   commentInput: {
// // // //     flex: 1,
// // // //     padding: 8,
// // // //     borderWidth: 1,
// // // //     borderColor: '#E2E8F0',
// // // //     borderRadius: 20,
// // // //     marginRight: 8,
// // // //     backgroundColor: SECONDARY_COLOR,
// // // //   },
// // // //   sendButton: {
// // // //     paddingVertical: 8,
// // // //     paddingHorizontal: 16,
// // // //     borderRadius: 20,
// // // //   },
// // // //   activeSendButton: {
// // // //     backgroundColor: PRIMARY_COLOR,
// // // //   },
// // // //   disabledSendButton: {
// // // //     backgroundColor: '#CBD5E0',
// // // //   },
// // // //   sendButtonText: {
// // // //     color: '#fff',
// // // //     fontWeight: '600',
// // // //   },
  
// // // //   // Modal styles
// // // //   modalContainer: {
// // // //     flex: 1,
// // // //     backgroundColor: '#fff',
// // // //   },
// // // //   modalHeader: {
// // // //     flexDirection: 'row',
// // // //     justifyContent: 'space-between',
// // // //     alignItems: 'center',
// // // //     padding: 16,
// // // //     backgroundColor: PRIMARY_COLOR,
// // // //   },
// // // //   modalTitle: {
// // // //     fontSize: 18,
// // // //     fontWeight: 'bold',
// // // //     color: '#fff',
// // // //   },
// // // //   commentsListContainer: {
// // // //     flex: 1,
// // // //   },
// // // //   commentsListContent: {
// // // //     padding: 16,
// // // //   },
// // // //   commentThread: {
// // // //     marginBottom: 24,
// // // //   },
// // // //   commentContainer: {
// // // //     flexDirection: 'row',
// // // //     marginBottom: 8,
// // // //   },
// // // //   commentBubble: {
// // // //     backgroundColor: SECONDARY_COLOR,
// // // //     borderRadius: 16,
// // // //     padding: 12,
// // // //     flex: 1,
// // // //   },
// // // //   commentUsername: {
// // // //     fontWeight: 'bold',
// // // //     color: TEXT_COLOR,
// // // //   },
// // // //   commentText: {
// // // //     color: TEXT_COLOR,
// // // //     marginTop: 4,
// // // //   },
// // // //   commentActions: {
// // // //     flexDirection: 'row',
// // // //     justifyContent: 'space-between',
// // // //     marginTop: 8,
// // // //   },
// // // //   replyText: {
// // // //     color: PRIMARY_COLOR,
// // // //     fontSize: 12,
// // // //   },
// // // //   commentTimestamp: {
// // // //     color: '#718096',
// // // //     fontSize: 12,
// // // //   },
// // // //   repliesContainer: {
// // // //     marginLeft: 48,
// // // //   },
// // // //   replyContainer: {
// // // //     flexDirection: 'row',
// // // //     marginBottom: 8,
// // // //   },
// // // //   replyBubble: {
// // // //     backgroundColor: '#F9FAFB',
// // // //     borderRadius: 16,
// // // //     padding: 12,
// // // //     flex: 1,
// // // //   },
// // // //   modalInputContainer: {
// // // //     padding: 12,
// // // //     borderTopWidth: 1,
// // // //     borderTopColor: '#E2E8F0',
// // // //     backgroundColor: '#fff',
// // // //   },
// // // //   replyingContainer: {
// // // //     flexDirection: 'row',
// // // //     justifyContent: 'space-between',
// // // //     alignItems: 'center',
// // // //     backgroundColor: '#EBF4FF',
// // // //     padding: 8,
// // // //     borderRadius: 8,
// // // //     marginBottom: 8,
// // // //   },
// // // //   replyingText: {
// // // //     fontSize: 13,
// // // //     color: '#4A5568',
// // // //   },
// // // //   replyingUsername: {
// // // //     fontWeight: '600',
// // // //   },
// // // //   cancelReplyText: {
// // // //     color: PRIMARY_COLOR,
// // // //     fontSize: 13,
// // // //   },
// // // //   modalInputWrapper: {
// // // //     flexDirection: 'row',
// // // //     alignItems: 'center',
// // // //   },
// // // //   modalCommentInput: {
// // // //     flex: 1,
// // // //     padding: 12,
// // // //     borderWidth: 1,
// // // //     borderColor: '#E2E8F0',
// // // //     borderRadius: 20,
// // // //     marginRight: 8,
// // // //     backgroundColor: SECONDARY_COLOR,
// // // //     maxHeight: 100,
// // // //   },
// // // //   modalSendButton: {
// // // //     paddingVertical: 10,
// // // //     paddingHorizontal: 16,
// // // //     borderRadius: 20,
// // // //   },
// // // //   modalSendButtonText: {
// // // //     color: '#fff',
// // // //     fontWeight: '600',
// // // //   },
  
// // // //   // Image viewer styles
// // // //   imageViewerContainer: {
// // // //     flex: 1,
// // // //     backgroundColor: 'rgba(0, 0, 0, 0.9)',
// // // //     justifyContent: 'center',
// // // //     alignItems: 'center',
// // // //   },
// // // //   fullScreenImage: {
// // // //     width: SCREEN_WIDTH,
// // // //     height: 300,
// // // //   },
// // // //   closeImageButton: {
// // // //     position: 'absolute',
// // // //     top: 40,
// // // //     right: 20,
// // // //     zIndex: 1,
// // // //   },
// // // //   imageNavigationContainer: {
// // // //     position: 'absolute',
// // // //     bottom: 40,
// // // //     flexDirection: 'row',
// // // //     justifyContent: 'space-between',
// // // //     width: '100%',
// // // //     paddingHorizontal: 20,
// // // //   },
// // // //   imageNavButton: {
// // // //     padding: 12,
// // // //     backgroundColor: 'rgba(0, 0, 0, 0.5)',
// // // //     borderRadius: 25,
// // // //   },
// // // //   disabledNavButton: {
// // // //     opacity: 0.5,
// // // //   },
  
// // // //   // User profile modal styles
// // // //   modalOverlay: {
// // // //     flex: 1,
// // // //     backgroundColor: 'rgba(0, 0, 0, 0.5)',
// // // //     justifyContent: 'center',
// // // //     alignItems: 'center',
// // // //   },
// // // //   profileModalContent: {
// // // //     width: '85%',
// // // //     backgroundColor: '#fff',
// // // //     borderRadius: 16,
// // // //     padding: 20,
// // // //     shadowColor: '#000',
// // // //     shadowOffset: { width: 0, height: 2 },
// // // //     shadowOpacity: 0.25,
// // // //     shadowRadius: 4,
// // // //     elevation: 5,
// // // //   },
// // // //   loadingContainer: {
// // // //     padding: 30,
// // // //     alignItems: 'center',
// // // //     justifyContent: 'center',
// // // //   },
// // // //   profileHeader: {
// // // //     flexDirection: 'row',
// // // //     alignItems: 'center',
// // // //     marginBottom: 20,
// // // //   },
// // // //   profileImage: {
// // // //     width: 60,
// // // //     height: 60,
// // // //     borderRadius: 30,
// // // //     marginRight: 16,
// // // //   },
// // // //   profileInfo: {
// // // //     flex: 1,
// // // //   },
// // // //   profileName: {
// // // //     fontSize: 18,
// // // //     fontWeight: 'bold',
// // // //     color: TEXT_COLOR,
// // // //   },
// // // //   profileDetails: {
// // // //     fontSize: 14,
// // // //     color: '#64748B',
// // // //     marginTop: 4,
// // // //   },
// // // //   profileSection: {
// // // //     marginBottom: 16,
// // // //   },
// // // //   sectionLabel: {
// // // //     fontSize: 13,
// // // //     color: '#64748B',
// // // //     marginBottom: 4,
// // // //   },
// // // //   sectionContent: {
// // // //     fontSize: 15,
// // // //     color: TEXT_COLOR,
// // // //   },
// // // //   sectionSubcontent: {
// // // //     fontSize: 13,
// // // //     color: '#64748B',
// // // //     marginTop: 2,
// // // //   },
// // // //   profileActions: {
// // // //     flexDirection: 'row',
// // // //     justifyContent: 'space-between',
// // // //     marginTop: 24,
// // // //   },
// // // //   primaryButton: {
// // // //     backgroundColor: PRIMARY_COLOR,
// // // //     paddingVertical: 10,
// // // //     paddingHorizontal: 20,
// // // //     borderRadius: 8,
// // // //     flex: 1,
// // // //     marginLeft: 8,
// // // //     alignItems: 'center',
// // // //   },
// // // //   primaryButtonText: {
// // // //     color: '#fff',
// // // //     fontWeight: '600',
// // // //   },
// // // //   secondaryButton: {
// // // //     backgroundColor: SECONDARY_COLOR,
// // // //     paddingVertical: 10,
// // // //     paddingHorizontal: 20,
// // // //     borderRadius: 8,
// // // //     flex: 1,
// // // //     marginRight: 8,
// // // //     alignItems: 'center',
// // // //     borderWidth: 1,
// // // //     borderColor: '#E2E8F0',
// // // //   },
// // // //   secondaryButtonText: {
// // // //     color: TEXT_COLOR,
// // // //     fontWeight: '600',
// // // //   },
// // // //   imageGridContainer: {
// // // //   display:'grid',
// // // //     gridTemplateColumns: 'repeat(2, 1fr)',
// // // //     gridTemplateRows: 'repeat(2, 1fr)',
// // // //     gap: 8,
// // // //   },
// // // //   imageContainer: {
// // // //     borderRadius: 8,
// // // //     overflow: 'hidden',
// // // //   },
// // // //   fullImage: {
// // // //     width: '100%',
// // // //     height: '100%',
// // // //   },
// // // //   overlayContainer: {
// // // //     position: 'relative',
// // // //   },
// // // //   imageCountOverlay: {
// // // //     position: 'absolute',
// // // //     top: 0,
// // // //     left: 0,
// // // //     right: 0,
// // // //     bottom: 0,
// // // //     backgroundColor: 'rgba(0, 0, 0, 0.5)',
// // // //     justifyContent: 'center',
// // // //     alignItems: 'center',
// // // //   },
// // // //   imageCountText: {
// // // //     color: 'white',
// // // //     fontSize: 20,
// // // //     fontWeight: 'bold',
// // // //   },

// // // // });

// // // // export default PostCard;
// // // import React, { useState, useEffect } from 'react';
// // // import {
// // //   View,
// // //   Text,
// // //   Image,
// // //   TouchableOpacity,
// // //   TextInput,
// // //   StyleSheet,
// // //   Dimensions,
// // // } from 'react-native';
// // // import { Ionicons, FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
// // // import { useNavigation } from '@react-navigation/native';
// // // import { useAuth } from '../context/authContext';
// // // import {
// // //   addComment,
// // //   getComments,
// // //   addLike,
// // //   removeLike,
// // //   getLikes,
// // //   incrementViews,
// // // } from '../app/(apis)/post';

// // // const DEFAULT_AVATAR = 'https://via.placeholder.com/100?text=User';
// // // const MAX_COMMENT_LENGTH = 500;
// // // const { width } = Dimensions.get('window');

// // // const PostCard = ({ post }) => {
// // //   const { user } = useAuth();
// // //   const navigation = useNavigation();

// // //   const [isLiked, setIsLiked] = useState(false);
// // //   const [comments, setComments] = useState([]);
// // //   const [likes, setLikes] = useState([]);
// // //   const [newComment, setNewComment] = useState('');
// // //   const [isAnonymous, setIsAnonymous] = useState(false);
// // //   const [isExpanded, setIsExpanded] = useState(false);

// // //   // Fetch initial data and increment views
// // //   useEffect(() => {
// // //     const loadInitialData = async () => {
// // //       const [fetchedComments, fetchedLikes] = await Promise.all([
// // //         getComments(post.id),
// // //         getLikes(post.id),
// // //       ]);
// // //       setComments(fetchedComments);
// // //       setLikes(fetchedLikes);
// // //       setIsLiked(fetchedLikes.some((like) => like.userId === user?.uid));
// // //       await incrementViews(post.id);
// // //     };
// // //     loadInitialData();
// // //   }, [post.id, user?.uid]);

// // //   const handleLike = async () => {
// // //     try {
// // //       setIsLiked((prev) => !prev);
// // //       if (isLiked) {
// // //         await removeLike(post.id, user);
// // //       } else {
// // //         await addLike(post.id, user);
// // //       }
// // //       const updatedLikes = await getLikes(post.id);
// // //       setLikes(updatedLikes);
// // //     } catch (error) {
// // //       console.error('Like error:', error);
// // //       setIsLiked((prev) => !prev);
// // //     }
// // //   };

// // //   const handleComment = async () => {
// // //     if (!newComment.trim()) return;
// // //     try {
// // //       const commentData = {
// // //         content: newComment.trim(),
// // //         userAvatar: isAnonymous ? DEFAULT_AVATAR : user?.photoURL || DEFAULT_AVATAR,
// // //         userName: isAnonymous ? 'Anonymous' : user?.fullName || 'Anonymous',
// // //         timestamp: new Date().toISOString(),
// // //         isAnonymous,
// // //       };
// // //       await addComment(post.id, commentData, user);
// // //       setNewComment('');
// // //       const updatedComments = await getComments(post.id);
// // //       setComments(updatedComments);
// // //     } catch (error) {
// // //       console.error('Comment submission error:', error);
// // //     }
// // //   };

// // //   const renderImageGrid = () => {
// // //     if (!post.mediaUrls || post.mediaUrls.length === 0) return null;

// // //     return (
// // //       <View style={styles.imageGrid}>
// // //         {post.mediaUrls.map((uri, index) => (
// // //           <Image
// // //             key={index}
// // //             source={{ uri }}
// // //             style={[
// // //               styles.gridImage,
// // //               post.mediaUrls.length === 1 && styles.singleImage,
// // //               post.mediaUrls.length === 2 && styles.doubleImage,
// // //               post.mediaUrls.length >= 3 && styles.multiImage,
// // //             ]}
// // //           />
// // //         ))}
// // //       </View>
// // //     );
// // //   };

// // //   return (
// // //     <View style={styles.card}>
// // //       {/* Post Header */}
// // //       <View style={styles.header}>
// // //         <Image
// // //           source={{ uri: post.userAvatar || DEFAULT_AVATAR }}
// // //           style={styles.avatar}
// // //         />
// // //         <View style={styles.userInfo}>
// // //           <Text style={styles.userName}>{post.userName}</Text>
// // //           <Text style={styles.timestamp}>{post.timestamp}</Text>
// // //         </View>
// // //       </View>

// // //       {/* Post Content */}
// // //       <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)}>
// // //         <Text
// // //           style={styles.content}
// // //           numberOfLines={isExpanded ? undefined : 3}
// // //         >
// // //           {post.content}
// // //         </Text>
// // //       </TouchableOpacity>

// // //       {/* Media Grid */}
// // //       {renderImageGrid()}

// // //       {/* Stats */}
// // //       <View style={styles.statsContainer}>
// // //         <Text style={styles.statsText}>
// // //           {likes.length} likes • {comments.length} comments • {post.views || 0} views
// // //         </Text>
// // //       </View>

// // //       {/* Interaction Buttons */}
// // //       <View style={styles.interactionContainer}>
// // //         <TouchableOpacity onPress={handleLike} style={styles.interactionButton}>
// // //           <Ionicons
// // //             name={isLiked ? 'heart' : 'heart-outline'}
// // //             size={24}
// // //             color={isLiked ? '#63484A' : '#B2B3B2'}
// // //           />
// // //           <Text style={styles.interactionCount}>{likes.length}</Text>
// // //         </TouchableOpacity>

// // //         <TouchableOpacity style={styles.interactionButton}>
// // //           <FontAwesome name="comment-o" size={24} color="#B2B3B2" />
// // //           <Text style={styles.interactionCount}>{comments.length}</Text>
// // //         </TouchableOpacity>

// // //         <TouchableOpacity style={styles.interactionButton}>
// // //           <MaterialCommunityIcons name="share-variant" size={24} color="#B2B3B2" />
// // //         </TouchableOpacity>
// // //       </View>

// // //       {/* Comments Section */}
// // //       {comments.map((comment, index) => (
// // //         <View key={index} style={styles.commentContainer}>
// // //           <Image
// // //             source={{ uri: comment.userAvatar || DEFAULT_AVATAR }}
// // //             style={styles.commentAvatar}
// // //           />
// // //           <View style={styles.commentContent}>
// // //             <Text style={styles.commentUserName}>{comment.userName}</Text>
// // //             <Text style={styles.commentText}>{comment.content}</Text>
// // //           </View>
// // //         </View>
// // //       ))}

// // //       {/* Comment Input */}
// // //       <View style={styles.commentInputContainer}>
// // //         <TextInput
// // //           style={styles.commentInput}
// // //           placeholder="Add a comment..."
// // //           placeholderTextColor="#6C6C6D"
// // //           value={newComment}
// // //           onChangeText={setNewComment}
// // //           maxLength={MAX_COMMENT_LENGTH}
// // //         />
// // //         <TouchableOpacity
// // //           style={styles.anonymousToggle}
// // //           onPress={() => setIsAnonymous(!isAnonymous)}
// // //         >
// // //           <Ionicons
// // //             name={isAnonymous ? 'eye-off' : 'eye'}
// // //             size={20}
// // //             color={isAnonymous ? '#63484A' : '#B2B3B2'}
// // //           />
// // //         </TouchableOpacity>
// // //         <TouchableOpacity onPress={handleComment}>
// // //           <Text style={styles.commentButton}>Post</Text>
// // //         </TouchableOpacity>
// // //       </View>
// // //     </View>
// // //   );
// // // };

// // // const styles = StyleSheet.create({
// // //   card: {
// // //     backgroundColor: '#171616',
// // //     marginVertical: 8,
// // //     padding: 16,
// // //   },
// // //   header: {
// // //     flexDirection: 'row',
// // //     alignItems: 'center',
// // //     marginBottom: 16,
// // //   },
// // //   avatar: {
// // //     width: 40,
// // //     height: 40,
// // //     borderRadius: 20,
// // //     marginRight: 12,
// // //   },
// // //   userInfo: {
// // //     flex: 1,
// // //   },
// // //   userName: {
// // //     fontSize: 16,
// // //     fontWeight: 'bold',
// // //     color: '#B2B3B2',
// // //   },
// // //   timestamp: {
// // //     fontSize: 12,
// // //     color: '#6C6C6D',
// // //   },
// // //   content: {
// // //     fontSize: 14,
// // //     color: '#B2B3B2',
// // //     marginBottom: 16,
// // //   },
// // //   imageGrid: {
// // //     flexDirection: 'row',
// // //     flexWrap: 'wrap',
// // //     gap: 4,
// // //     marginBottom: 16,
// // //   },
// // //   gridImage: {
// // //     borderRadius: 8,
// // //   },
// // //   singleImage: {
// // //     width: width - 32,
// // //     height: width - 32,
// // //   },
// // //   doubleImage: {
// // //     width: (width - 36) / 2,
// // //     height: (width - 36) / 2,
// // //   },
// // //   multiImage: {
// // //     width: (width - 40) / 3,
// // //     height: (width - 40) / 3,
// // //   },
// // //   statsContainer: {
// // //     paddingVertical: 12,
// // //     borderTopWidth: 1,
// // //     borderTopColor: '#1A1A1A',
// // //   },
// // //   statsText: {
// // //     fontSize: 12,
// // //     color: '#6C6C6D',
// // //   },
// // //   interactionContainer: {
// // //     flexDirection: 'row',
// // //     justifyContent: 'space-around',
// // //     paddingVertical: 12,
// // //     borderTopWidth: 1,
// // //     borderTopColor: '#1A1A1A',
// // //     marginBottom: 16,
// // //   },
// // //   interactionButton: {
// // //     flexDirection: 'row',
// // //     alignItems: 'center',
// // //   },
// // //   interactionCount: {
// // //     marginLeft: 8,
// // //     color: '#B2B3B2',
// // //     fontSize: 14,
// // //   },
// // //   commentContainer: {
// // //     flexDirection: 'row',
// // //     marginBottom: 12,
// // //   },
// // //   commentAvatar: {
// // //     width: 32,
// // //     height: 32,
// // //     borderRadius: 16,
// // //     marginRight: 8,
// // //   },
// // //   commentContent: {
// // //     flex: 1,
// // //     backgroundColor: '#1A1A1A',
// // //     padding: 12,
// // //     borderRadius: 12,
// // //   },
// // //   commentUserName: {
// // //     fontSize: 14,
// // //     fontWeight: 'bold',
// // //     color: '#B2B3B2',
// // //     marginBottom: 4,
// // //   },
// // //   commentText: {
// // //     fontSize: 14,
// // //     color: '#B2B3B2',
// // //   },
// // //   commentInputContainer: {
// // //     flexDirection: 'row',
// // //     alignItems: 'center',
// // //     borderTopWidth: 1,
// // //     borderTopColor: '#1A1A1A',
// // //     paddingTop: 16,
// // //     marginTop: 8,
// // //   },
// // //   commentInput: {
// // //     flex: 1,
// // //     backgroundColor: '#070606',
// // //     borderRadius: 20,
// // //     paddingHorizontal: 16,
// // //     paddingVertical: 8,
// // //     color: '#B2B3B2',
// // //     fontSize: 14,
// // //   },
// // //   anonymousToggle: {
// // //     paddingHorizontal: 12,
// // //   },
// // //   commentButton: {
// // //     marginLeft: 12,
// // //     color: '#63484A',
// // //     fontWeight: 'bold',
// // //   },
// // // });

// // // export default PostCard;

// // import React, { useState, useEffect } from 'react';
// // import {
// //   View,
// //   Text,
// //   Image,
// //   TouchableOpacity,
// //   TextInput,
// //   Dimensions,
// //   StyleSheet,
// //   Alert,
// //   ScrollView
// // } from 'react-native';
// // import { Ionicons } from '@expo/vector-icons';
// // import { useNavigation } from '@react-navigation/native';
// // import { useAuth } from '../context/authContext';
// // import {
// //   addComment,
// //   getComments,
// //   addLike,
// //   removeLike,
// //   getLikes,
// //   incrementViews,
// //   deletePost,
// //   reportPost
// // } from '../app/(apis)/post';
// // import { router } from 'expo-router';
// // import {doc,getDoc} from 'firebase/firestore';
// // import { db } from '../config/firebaseConfig';
// // const { width } = Dimensions.get('window');
// // const DEFAULT_AVATAR = 'https://imgs.search.brave.com/cyPQcxgehDcXav9Isw-S2VR9bVSe0jC0LWy2wW-Rlzk/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly9pY29u/cy52ZXJ5aWNvbi5j/b20vcG5nLzEyOC9o/ZWFsdGhjYXRlLW1l/ZGljYWwvaGVhbHRo/eS10YWl6aG91LWxp/bmVhci1pY29uLWxp/YnJhcnktdW5kZXIv/ZGVmYXVsdC1hdmF0/YXItNC5wbmc';
// // const MAX_COMMENT_LENGTH = 500;

// // const PostCard = ({ post, isDetailView = false }) => {
// //   const { user } = useAuth();
// //   const navigation = useNavigation();
// //   console.log(post.userId);
// //   const isOwner = post.userId === user?.uid;

// //   // States for managing post data and interactions
// //   const [isLiked, setIsLiked] = useState(false);
// //   const [comments, setComments] = useState([]);
// //   const [likes, setLikes] = useState([]);
// //   const [newComment, setNewComment] = useState('');
// //   const [isAnonymous, setIsAnonymous] = useState(false);
// //   const [showAllComments, setShowAllComments] = useState(isDetailView);
// //   const [postView, setPostView] = useState(null);

// //   // Load initial data when component mounts
// //   useEffect(() => {
// //     const loadInitialData = async () => {
// //       try {
// //         const [fetchedComments, fetchedLikes] = await Promise.all([
// //           getComments(post.id),
// //           getLikes(post.id)
// //         ]);
// //         setComments(fetchedComments);
// //         setLikes(fetchedLikes);
// //         setIsLiked(fetchedLikes.some(like => like.userId === user?.uid));
// //         if (!isDetailView) {
// //           await incrementViews(post.id);
// //         }
// //       } catch (error) {
// //         console.error('Error loading post data:', error);
// //       }
// //     };
// //     loadInitialData();
// //   }, [post.id, user?.uid, isDetailView]);

// //   // Navigation handler for post details
// //   const handleNavigateToDetail =async () => {
     
// //     try {
// //             const postRef = doc(db, 'posts', post.id);
// //             const postSnapshot = await getDoc(postRef);
// //             console.log(" postSnapshot",postSnapshot)
    
// //             if (postSnapshot.exists()) {
// //               setPostView({  ...postSnapshot.data() });
// //                console.log("postView",postView)
// //             } else {
// //               console.log('Post not found');
// //             }
// //           } catch (error) {
// //             console.error('Error fetching post details:', error);
// //           } finally {
// //             setLoading(false);
// //           }
// //     if (!isDetailView) {
// //       console.log("postID",postView)
// //   router.push({
// //           pathname: 'postDetailView',
// //           params: { 
// //             post: postView
// //           }
// //         });    }
// //   };
  

// //   // Post management handlers
// //   const handleDeletePost = async () => {
// //     try {
// //       await deletePost(post.id);
// //       navigation.goBack();
// //     } catch (error) {
// //       Alert.alert('Error', 'Failed to delete post');
// //     }
// //   };

// //   const handleReportPost = async () => {
// //     try {
// //       await reportPost(post.id);
// //       Alert.alert('Success', 'Post reported successfully');
// //     } catch (error) {
// //       Alert.alert('Error', 'Failed to report post');
// //     }
// //   };

// //   // Like handling
// //   const handleLike = async () => {
// //     try {
// //       setIsLiked(prev => !prev);
// //       if (isLiked) {
// //         await removeLike(post.id, user);
// //       } else {
// //         await addLike(post.id, user);
// //       }
// //       const updatedLikes = await getLikes(post.id);
// //       setLikes(updatedLikes);
// //     } catch (error) {
// //       setIsLiked(prev => !prev);
// //       Alert.alert('Error', 'Failed to update like');
// //     }
// //   };

// //   // Comment handling
// //   const handleComment = async () => {
// //     if (!newComment.trim()) return;
// //     try {
// //       const commentData = {
// //         content: newComment.trim(),
// //         userAvatar: isAnonymous ? DEFAULT_AVATAR : user?.photoURL || DEFAULT_AVATAR,
// //         userName: isAnonymous ? 'Anonymous' : user?.fullName || 'Anonymous',
// //         timestamp: new Date().toISOString(),
// //         isAnonymous,
// //       };
// //       await addComment(post.id, commentData, user);
// //       setNewComment('');
// //       const updatedComments = await getComments(post.id);
// //       setComments(updatedComments);
// //     } catch (error) {
// //       Alert.alert('Error', 'Failed to post comment');
// //     }
// //   };

// //   // Time formatting helper
// //   const formatTimestamp = (timestamp) => {
// //     const date = new Date(timestamp);
// //     const now = new Date();
// //     const diffInMinutes = Math.floor((now - date) / 1000 / 60);

// //     if (diffInMinutes < 1) return 'just now';
// //     if (diffInMinutes < 60) return `${diffInMinutes}m`;
// //     if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
// //     if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d`;
// //     return date.toLocaleDateString();
// //   };

// //   // Image grid renderer
// //   const renderImageGrid = () => {
// //     if (!post.mediaUrls?.length) return null;

// //     if (post.mediaUrls.length === 1) {
// //       return (
// //         <Image
// //           source={{ uri: post.mediaUrls[0] }}
// //           style={styles.singleImage}
// //           resizeMode="cover"
// //         />
// //       );
// //     }

// //     return (
// //       <View style={styles.imageGrid}>
// //         {post.mediaUrls.map((url, index) => (
// //           <Image
// //             key={index}
// //             source={{ uri: url }}
// //             style={[
// //               styles.gridImage,
// //               post.mediaUrls.length === 2 && styles.doubleImage,
// //               post.mediaUrls.length > 2 && styles.multiImage
// //             ]}
// //             resizeMode="cover"
// //           />
// //         ))}
// //       </View>
// //     );
// //   };

// //   return (
// //     <View style={styles.container}>
// //       {/* Header Section */}
// //       <View style={styles.header}>
// //         <View style={styles.userInfo}>
// //           <Image
// //             source={{ uri: post.userAvatar || DEFAULT_AVATAR }}
// //             style={styles.avatar}
// //           />
// //           <View>
// //             <Text style={styles.userName}>{post.userName}</Text>
// //             <Text style={styles.timestamp}>{formatTimestamp(post.timestamp)}</Text>
// //           </View>
// //         </View>
        
// //         {isOwner ? (
// //           <TouchableOpacity onPress={handleDeletePost}>
// //             <Text style={styles.deleteButton}>Delete</Text>
// //           </TouchableOpacity>
// //         ) : (
// //           <TouchableOpacity onPress={handleReportPost}>
// //             <Text style={styles.reportButton}>Report</Text>
// //           </TouchableOpacity>
// //         )}
// //       </View>

// //       {/* Content Section */}
// //       <TouchableOpacity onPress={handleNavigateToDetail}>
// //         <Text 
// //           style={styles.content}
// //           numberOfLines={isDetailView ? undefined : 3}
// //         >
// //           {post.content}
// //         </Text>
// //       </TouchableOpacity>

// //       {/* Images */}
// //       {renderImageGrid()}

// //       {/* Stats Section */}
// //       <View style={styles.statsContainer}>
// //         <Text style={styles.statsText}>
// //           {likes.length} likes • {comments.length} comments • {post.views || 0} views
// //         </Text>
// //       </View>

// //       {/* Action Buttons */}
// //       <View style={styles.actionButtons}>
// //         <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
// //           <Ionicons
// //             name={isLiked ? 'heart' : 'heart-outline'}
// //             size={24}
// //             color={isLiked ? '#2196F3' : '#666'}
// //           />
// //           <Text style={[styles.actionText, isLiked && styles.activeText]}>
// //             {likes.length}
// //           </Text>
// //         </TouchableOpacity>

// //         <TouchableOpacity style={styles.actionButton}>
// //           <Ionicons name="chatbubble-outline" size={24} color="#666" />
// //           <Text style={styles.actionText}>{comments.length}</Text>
// //         </TouchableOpacity>

// //         <TouchableOpacity style={styles.actionButton}>
// //           <Ionicons name="share-social-outline" size={24} color="#666" />
// //         </TouchableOpacity>
// //       </View>

// //       {/* Comments Section */}
// //       <View style={styles.commentsSection}>
// //         {(showAllComments ? comments : comments.slice(0, 2)).map((comment, index) => (
// //           <View key={index} style={styles.commentContainer}>
// //             <Image
// //               source={{ uri: comment.userAvatar || DEFAULT_AVATAR }}
// //               style={styles.commentAvatar}
// //             />
// //             <View style={styles.commentContent}>
// //               <Text style={styles.commentUserName}>{comment.userName}</Text>
// //               <Text style={styles.commentText}>{comment.content}</Text>
// //               <Text style={styles.commentTime}>
// //                 {formatTimestamp(comment.timestamp)}
// //               </Text>
// //             </View>
// //           </View>
// //         ))}

// //         {!isDetailView && comments.length > 2 && (
// //           <TouchableOpacity onPress={handleNavigateToDetail}>
// //             <Text style={styles.viewAllComments}>
// //               View all {comments.length} comments
// //             </Text>
// //           </TouchableOpacity>
// //         )}
// //       </View>

// //       {/* Comment Input */}
// //       <View style={styles.commentInput}>
// //         <TextInput
// //           value={newComment}
// //           onChangeText={setNewComment}
// //           placeholder="Add a comment..."
// //           placeholderTextColor="#666"
// //           maxLength={MAX_COMMENT_LENGTH}
// //           style={styles.input}
// //         />
        
// //         <TouchableOpacity
// //           onPress={() => setIsAnonymous(!isAnonymous)}
// //           style={styles.anonymousButton}
// //         >
// //           <Ionicons
// //             name={isAnonymous ? 'eye-off' : 'eye'}
// //             size={24}
// //             color={isAnonymous ? '#2196F3' : '#666'}
// //           />
// //         </TouchableOpacity>

// //         <TouchableOpacity onPress={handleComment}>
// //           <Text style={styles.postButton}>Post</Text>
// //         </TouchableOpacity>
// //       </View>
// //     </View>
// //   );
// // };

// // const styles = StyleSheet.create({
// //   container: {
// //     backgroundColor: '#070606',
// //     padding: 15,
// //     marginBottom: 10,
// //   },
// //   header: {
// //     flexDirection: 'row',
// //     justifyContent: 'space-between',
// //     alignItems: 'center',
// //     marginBottom: 15,
// //   },
// //   userInfo: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //   },
// //   avatar: {
// //     width: 40,
// //     height: 40,
// //     borderRadius: 20,
// //     marginRight: 10,
// //   },
// //   userName: {
// //     color: '#fff',
// //     fontWeight: '600',
// //     fontSize: 16,
// //   },
// //   timestamp: {
// //     color: '#666',
// //     fontSize: 12,
// //   },
// //   deleteButton: {
// //     color: '#FF4444',
// //     fontSize: 14,
// //   },
// //   reportButton: {
// //     color: '#666',
// //     fontSize: 14,
// //   },
// //   content: {
// //     color: '#fff',
// //     fontSize: 14,
// //     marginBottom: 15,
// //   },
// //   imageGrid: {
// //     flexDirection: 'row',
// //     flexWrap: 'wrap',
// //     gap: 2,
// //   },
// //   singleImage: {
// //     width: width - 30,
// //     height: width - 30,
// //     borderRadius: 10,
// //   },
// //   gridImage: {
// //     borderRadius: 10,
// //   },
// //   doubleImage: {
// //     width: (width - 32) / 2,
// //     height: (width - 32) / 2,
// //   },
// //   multiImage: {
// //     width: (width - 34) / 3,
// //     height: (width - 34) / 3,
// //   },
// //   statsContainer: {
// //     paddingVertical: 12,
// //     borderTopWidth: 1,
// //     borderTopColor: '#333',
// //   },
// //   statsText: {
// //     color: '#666',
// //     fontSize: 12,
// //   },
// //   actionButtons: {
// //     flexDirection: 'row',
// //     justifyContent: 'space-around',
// //     paddingVertical: 12,
// //     borderTopWidth: 1,
// //     borderTopColor: '#333',
// //   },
// //   actionButton: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //   },
// //   actionText: {
// //     color: '#666',
// //     marginLeft: 5,
// //   },
// //   activeText: {
// //     color: '#2196F3',
// //   },
// //   commentsSection: {
// //     marginTop: 15,
// //   },
// //   commentContainer: {
// //     flexDirection: 'row',
// //     marginBottom: 12,
// //   },
// //   commentAvatar: {
// //     width: 32,
// //     height: 32,
// //     borderRadius: 16,
// //     marginRight: 8,
// //   },
// //   commentContent: {
// //     flex: 1,
// //     backgroundColor: '#333',
// //     padding: 10,
// //     borderRadius: 12,
// //   },
// //   commentUserName: {
// //     color: '#fff',
// //     fontWeight: '600',
// //     marginBottom: 4,
// //   },
// //   commentText: {
// //     color: '#fff',
// //   },
// //   commentTime: {
// //     color: '#666',
// //     fontSize: 10,
// //     marginTop: 4,
// //   },
// //   viewAllComments: {
// //     color: '#2196F3',
// //     fontSize: 14,
// //     marginTop: 8,
// //   },
// //   commentInput: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     marginTop: 15,
// //     paddingTop: 15,
// //     borderTopWidth: 1,
// //     borderTopColor: '#333',
// //   },
// //   input: {
// //     flex: 1,
// //     backgroundColor: '#333',
// //     borderRadius: 20,
// //     paddingHorizontal: 15,
// //     paddingVertical: 8,
// //     color: '#fff',
// //     marginRight: 10,
// //   },
// //   anonymousButton: {
// //     marginRight: 10,
// //   },
// //   postButton: {
// //     color: '#2196F3',
// //     fontWeight: '600',
// //   },
// // });

// // export default PostCard;

// import React, { useState, useEffect, useCallback } from 'react';
// import {
//   View,
//   Text,
//   Image,
//   TouchableOpacity,
//   TextInput,
//   Dimensions,
//   Alert,
//   Modal,Share,
//   ScrollView,
// } from 'react-native';
// import { LinearGradient } from 'expo-linear-gradient';
// import { Ionicons, MaterialIcons } from '@expo/vector-icons';
// import { useNavigation } from '@react-navigation/native';
// import { useAuth } from '../context/authContext';
// import {
//   addComment,
//   getComments,
//   addLike,
//   removeLike,
//   getLikes,
//   incrementViews,
//   getViews,
//   deletePost,
//   reportPost,fetchHotPosts,incrementShareCount,getShareCount
// } from '../app/(apis)/post';
// import { doc, getDoc, updateDoc } from 'firebase/firestore';
// import { db } from '../config/firebaseConfig';
// import { router } from 'expo-router';
// // Share.
// const { width, height } = Dimensions.get('window');
// const DEFAULT_AVATAR = 'https://imgs.search.brave.com/cyPQcxgehDcXav9Isw-S2VR9bVSe0jC0LWy2wW-Rlzk/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly9pY29u/cy52ZXJ5aWNvbi5j/b20vcG5nLzEyOC9o/ZWFsdGhjYXRlLW1lZGlj/YWwvaGVhbHRoeS10/YWl6aG91LWxpbmVh/ci1pY29uLWxpYnJh/cnktdW5kZXIvZGVmYXVs/dC1hdmF0YXItNC5w/bmc';
// const MAX_COMMENT_LENGTH = 500;


// // Timestamp Formatting Utility

// const formatTimestamp = (timestamp) => {
//   if (!timestamp) return '';
  
//   const now = new Date();
//   const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
//   const diffMs = now - date;
//   const diffMins = Math.floor(diffMs / 60000);
//   const diffHrs = Math.floor(diffMins / 60);
//   const diffDays = Math.floor(diffHrs / 24);
  
//   if (diffMins < 1) return 'just now';
//   if (diffMins < 60) return `${diffMins}m ago`;
//   if (diffHrs < 24) return `${diffHrs}h ago`;
//   if (diffDays < 7) return `${diffDays}d ago`;
  
//   return date.toLocaleDateString();
// };


// // Hot Post Banner Component
// const HotPostBanner = ({ onPress }) => {
//   const [hotPosts, setHotPosts] = useState([]);

//   useEffect(() => {
//     const loadHotPosts = async () => {
//       const posts = await fetchHotPosts();
//       console.log(posts)
//       setHotPosts(posts);
//     };
//     loadHotPosts();
//   }, []);

//   return hotPosts.length > 0 ? (
//     <TouchableOpacity onPress={onPress}>
//       <LinearGradient
//         colors={['#FF6B6B', '#FF47']}
//         className="rounded-lg p-4 mb-4 shadow-lg flex-row items-center"
//       >
//         <Ionicons name="flame" size={24} color="white" />
//         <Text className="text-white font-bold ml-2 text-lg">
//           Hot Post of the Week
//         </Text>
//       </LinearGradient>
//     </TouchableOpacity>
//   ) : null;
// };


// const PostCard = ({ post, isDetailView = false, isHotPost = false }) => {
//   const { user } = useAuth();
//   const navigation = useNavigation();
//   const [shareCount,setShareCount]=useState()

//   // State Management
//   const [isLiked, setIsLiked] = useState(false);
//   const [comments, setComments] = useState([]);
//   const [likes, setLikes] = useState(0);
//   const [newComment, setNewComment] = useState('');
//   const [showOptionsMenu, setShowOptionsMenu] = useState(false);
//   const [selectedImage, setSelectedImage] = useState(null);
//   const [postViews, setPostViews] = useState(0);
//   //  const [isHotPost,setisHotPost]=useState(true)
//   // Permissions and Ownership
//   const isOwner = post.userId === user?.uid;
//   const handleShare = async () => {
//     try {
//       const result = await Share.share({
//         title: `${post.userName}'s KLiqq`,
//         message: `${post.content}\n\nShared via kliq:Student networking  App`,
//         url: post.mediaUrl,
//       });
//       if (result.action === Share.sharedAction) {
//         await incrementShareCount(post.id);
//         setShareCount(prev => prev + 1);
//       }
//     } catch (error) {
//       Alert.alert('Error', 'Failed to share post');
//     }
//   };
//   // Image Grid Rendering Method
//  const renderImageGrid = () => {
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

//   // Full Image Modal
//   const ImageModal = ({ imageUrl, onClose }) => (
//     <Modal 
//       transparent={true} 
//       visible={!!imageUrl} 
//       onRequestClose={onClose}
//     >
//       <View className="flex-1 bg-black/80 items-center justify-center">
//         <TouchableOpacity 
//           onPress={onClose} 
//           className="absolute top-10 right-5 z-50"
//         >
//           <Ionicons name="close" size={30} color="white" />
//         </TouchableOpacity>
//         <Image 
//           source={{ uri: imageUrl }} 
//           className="w-full h-[70%]" 
//           resizeMode="contain"
//         />
//       </View>
//     </Modal>
//   );

//   // Options Menu
//   const OptionsMenu = () => (
//     <Modal 
//       transparent={true} 
//       visible={showOptionsMenu} 
//       onRequestClose={() => setShowOptionsMenu(false)}
//     >
//       <TouchableOpacity 
//         className="flex-1 bg-black/50" 
//         activeOpacity={1} 
//         onPress={() => setShowOptionsMenu(false)}
//       >
//         <View className="absolute top-10 right-5 bg-white rounded-lg shadow-lg">
//           {isOwner ? (
//             <>
//               <TouchableOpacity 
//                 className="p-4 border-b border-gray-200"
//                 onPress={() => {
//                   handleDeletePost();
//                   setShowOptionsMenu(false);
//                 }}
//               >
//                 <Text className="text-red-500">Delete Post</Text>
//               </TouchableOpacity>
//               <TouchableOpacity 
//                 className="p-4"
//                 onPress={() => {
//                   // Edit post logic
//                   setShowOptionsMenu(false);
//                 }}
//               >
//                 <Text>Edit Post</Text>
//               </TouchableOpacity>
//             </>
//           ) : (
//             <TouchableOpacity 
//               className="p-4"
//               onPress={() => {
//                 handleReportPost();
//                 setShowOptionsMenu(false);
//               }}
//             >
//               <Text className="text-red-500">Report Post</Text>
//             </TouchableOpacity>
//           )}
//         </View>
//       </TouchableOpacity>
//     </Modal>
//   );

//   // Fetch Initial Data
//   useEffect(() => {
//     const fetchInitialData = async () => {
//       try {
//         // Fetch Comments
//         const fetchedComments = await getComments(post.id);
//         setComments(fetchedComments);

//         // Fetch Likes
//         const fetchedLikes = await getLikes(post.id);
//         setLikes(fetchedLikes.length);

//         // Check if User has Liked
//         const userLiked = fetchedLikes.some(like => like.userId === user?.uid);
//         setIsLiked(userLiked);

//         // Fetch Views
//         const fetchedViews = await getViews(post.id);
//         setPostViews(fetchedViews);
//       } catch (error) {
//         console.error('Error fetching initial data:', error);
//       }
//     };

//     fetchInitialData();
//   }, [post.id, user]);

//   // View Tracking
//   useEffect(() => {
//     const trackPostView = async () => {
//       try {
//         await incrementViews(post.id, user?.uid);
//       } catch (error) {
//         console.error('Error tracking post view:', error);
//       }
//     };

//     trackPostView();
//   }, [post.id, user?.uid]);

//   // Handle Like Method
//   const handleLike = async () => {
//     try {
//       if (isLiked) {
//         await removeLike(post.id, user);
//         setLikes(prev => Math.max(0, prev - 1));
//       } else {
//         await addLike(post.id, user);
//         setLikes(prev => prev + 1);
//       }
//       setIsLiked(!isLiked);
//     } catch (error) {
//       console.error('Like error:', error);
//       Alert.alert('Error', 'Unable to process like. Please try again.');
//     }
//   };

//   // Handle Comment Method
//   const handleAddComment = async () => {
//     if (!newComment.trim()) return;

//     try {
//       const commentData = {
//         content: newComment,
//         userId: user.uid,
//         userName: user.displayName || 'Anonymous',
//         userAvatar: user.photoURL || DEFAULT_AVATAR,
//         timestamp: new Date()
//       };

//       await addComment(post.id, commentData);
//       setNewComment('');
      
//       // Refresh comments
//       const updatedComments = await getComments(post.id);
//       setComments(updatedComments);
//     } catch (error) {
//       console.error('Comment error:', error);
//       Alert.alert('Error', 'Unable to post comment. Please try again.');
//     }
//   };

//   // Delete Post Method
//   const handleDeletePost = async () => {
//     try {
//       await deletePost(post.id);
//       Alert.alert('Success', 'Post deleted successfully');
//       // Optional: Navigate back or refresh list
//     } catch (error) {
//       console.error('Delete post error:', error);
//       Alert.alert('Error', 'Unable to delete post. Please try again.');
//     }
//   };

//   // Report Post Method
//   const handleReportPost = async () => {
//     try {
//       await reportPost(post.id, user.uid);
//       Alert.alert('Report Submitted', 'Thank you for reporting this post.');
//     } catch (error) {
//       console.error('Report post error:', error);
//       Alert.alert('Error', 'Unable to report post. Please try again.');
//     }
//   };

//   return (
//     <View>
//       {isHotPost && (
//         <HotPostBanner 
//         onPress={() => router.push(`/postDetailView/${post.id}`)} />
//       )}
      
//       <View 
//         className={`
//           bg-black p-4 mb-4 
//           ${isHotPost ? 'border-2 border-red-500 rounded-lg' : ''}
//         `}
//       >
//         {/* Header with Three-Dot Menu */}
//         <View className="flex-row justify-between items-center mb-4">
//           <View className="flex-row items-center">
//             <Image 
//               source={{ uri: post.userAvatar || DEFAULT_AVATAR }}
//               className={`
//                 w-10 h-10 rounded-full mr-3
//                 ${isHotPost ? 'border-2 border-red-500' : ''}
//               `}
//             />
//             <View>
//               <Text 
//                 className={`
//                   font-bold 
//                   ${isHotPost ? 'text-red-500' : 'text-white'}
//                 `}
//               >
//                 {post.userName}
//                 {isHotPost && (
//                   <Text className="text-xs text-white ml-2">
//                     Hot Post 🔥
//                   </Text>
//                 )}
//               </Text>
//               <Text className="text-gray-400 text-xs">
//                 {formatTimestamp(post.createdAt)}
//               </Text>
//             </View>
//           </View>
          
//           <TouchableOpacity onPress={() => setShowOptionsMenu(true)}>
//             <Ionicons 
//               name="ellipsis-vertical" 
//               size={20} 
//               color={isHotPost ? 'red' : 'white'} 
//             />
//           </TouchableOpacity>
//         </View>

//         {/* Post Content */}
//         <TouchableOpacity 
//   onPress={() => router.push(`/postDetailView/${post.id}`)}
//           className={isHotPost ? 'bg-red-900/20 p-2 rounded-lg' : ''}
//         >
//           <Text 
//             className={`
//               ${isHotPost ? 'text-red-300' : 'text-white'} mb-4
//             `}
//             numberOfLines={isDetailView ? undefined : 3}
//           >
//             {post.content}
//           </Text>
//         </TouchableOpacity>

//         {/* Image Grid */}
//         {renderImageGrid()}

//         {/* Stats Section */}
//         <View 
//           className={`
//             flex-row justify-between py-2 border-t 
//             ${isHotPost ? 'border-red-800' : 'border-gray-800'}
//           `}
//         >
//           <Text 
//             className={`
//               text-xs 
//               ${isHotPost ? 'text-red-400' : 'text-gray-400'}
//             `}
//           >
//             {likes} likes • {comments.length} comments • 👀 {postViews} views
//           </Text>
//         </View>

//         {/* Action Buttons */}
//         <View 
//           className={`
//             flex-row justify-around py-2 border-t 
//             ${isHotPost ? 'border-red-800' : 'border-gray-800'}
//           `}
//         >
//       <TouchableOpacity 
//   className="flex-row items-center"
//   onPress={handleLike}
// >
//   <Ionicons 
//     name={isLiked ? 'heart' : 'heart-outline'} 
//     size={24} 
//     color={
//       isHotPost 
//         ? (isLiked ? '#FF4444' : 'red') 
//         : (isLiked ? '#FF4444' : 'gray')
//     }
//   />
//   <Text 
//     className={`
//       ml-2 
//       ${isLiked ? 'text-red-500' : 'text-gray-400'}
//       ${isHotPost ? 'text-red-300' : ''}
//     `}
//   >
//     {likes}
//   </Text>
// </TouchableOpacity>

// <TouchableOpacity 
//   className="flex-row items-center"
//   onPress={() => router.push(`/postDetailView/${post.id}`)}>
//   <Ionicons 
//     name="chatbubble-outline" 
//     size={24} 
//     color={isHotPost ? 'red' : 'gray'} 
//   />
//   <Text 
//     className={`
//       ml-2 
//       ${isHotPost ? 'text-red-300' : 'text-gray-400'}
//     `}
//   >
//     {comments.length}
//   </Text>
// </TouchableOpacity>

// <TouchableOpacity className="flex-row items-center" onPress={handleShare}>
//   <Ionicons 
//     name="share-social-outline" 
//     size={24} 
//     color={isHotPost ? 'red' : 'gray'} 
//   />
// </TouchableOpacity>
// </View>

// {/* Modals */}
// <OptionsMenu />
// <ImageModal 
//   imageUrl={selectedImage} 
//   onClose={() => setSelectedImage(null)} 
// />
// </View>
// </View>
// );
// };

// export default PostCard;

// // import React, { useState, useEffect, useCallback } from 'react';
// // import {
// //   View,
// //   Text,
// //   Image,
// //   TouchableOpacity,
// //   TextInput,
// //   Dimensions,
// //   Alert,
// //   Modal,
// //   Share,
// //   ScrollView,
// // } from 'react-native';
// // import { LinearGradient } from 'expo-linear-gradient';
// // import { Ionicons, MaterialIcons } from '@expo/vector-icons';
// // import { useNavigation } from '@react-navigation/native';
// // import { useAuth } from '../context/authContext';
// // import {
// //   addComment,
// //   getComments,
// //   addLike,
// //   removeLike,
// //   getLikes,
// //   incrementViews,
// //   getViews,
// //   deletePost,
// //   reportPost,
// //   fetchHotPosts,
// //   incrementShareCount,
// //   getShareCount
// // } from '../app/(apis)/post';
// // import { 
// //   updateUserActivityStreak, 
// //   incrementCommentStreak, 
// //   incrementLikeStreak,
// //   hasUpdatedStreakToday
// // } from '../app/(apis)/streaks';
// // import { doc, getDoc, updateDoc } from 'firebase/firestore';
// // import { db } from '../config/firebaseConfig';
// // import { router } from 'expo-router';

// // const { width, height } = Dimensions.get('window');
// // const DEFAULT_AVATAR = 'https://imgs.search.brave.com/cyPQcxgehDcXav9Isw-S2VR9bVSe0jC0LWy2wW-Rlzk/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly9pY29u/cy52ZXJ5aWNvbi5j/b20vcG5nLzEyOC9o/ZWFsdGhjYXRlLW1lZGlj/YWwvaGVhbHRoeS10/YWl6aG91LWxpbmVh/ci1pY29uLWxpYnJh/cnktdW5kZXIvZGVmYXVs/dC1hdmF0YXItNC5w/bmc';
// // const MAX_COMMENT_LENGTH = 500;
// // const COMMENT_MILESTONE = 4; // Number of comments to track for achievements
// // const LIKE_MILESTONE = 10;   // Number of likes to track for achievements

// // // Timestamp Formatting Utility
// // const formatTimestamp = (timestamp) => {
// //   if (!timestamp) return '';
  
// //   const now = new Date();
// //   const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
// //   const diffMs = now - date;
// //   const diffMins = Math.floor(diffMs / 60000);
// //   const diffHrs = Math.floor(diffMins / 60);
// //   const diffDays = Math.floor(diffHrs / 24);
  
// //   if (diffMins < 1) return 'just now';
// //   if (diffMins < 60) return `${diffMins}m ago`;
// //   if (diffHrs < 24) return `${diffHrs}h ago`;
// //   if (diffDays < 7) return `${diffDays}d ago`;
  
// //   return date.toLocaleDateString();
// // };

// // // Hot Post Banner Component
// // const HotPostBanner = ({ onPress }) => {
// //   const [hotPosts, setHotPosts] = useState([]);

// //   useEffect(() => {
// //     const loadHotPosts = async () => {
// //       const posts = await fetchHotPosts();
// //       setHotPosts(posts);
// //     };
// //     loadHotPosts();
// //   }, []);

// //   return hotPosts.length > 0 ? (
// //     <TouchableOpacity onPress={onPress}>
// //       <LinearGradient
// //         colors={['#FF6B6B', '#FF47']}
// //         className="rounded-lg p-4 mb-4 shadow-lg flex-row items-center"
// //       >
// //         <Ionicons name="flame" size={24} color="white" />
// //         <Text className="text-white font-bold ml-2 text-lg">
// //           Hot Post of the Week
// //         </Text>
// //       </LinearGradient>
// //     </TouchableOpacity>
// //   ) : null;
// // };

// // // Streak Achievement Banner Component
// // const StreakAchievementBanner = ({ achievement, visible, onClose }) => {
// //   if (!visible) return null;
  
// //   return (
// //     <View className="absolute top-10 left-0 right-0 items-center z-50">
// //       <LinearGradient
// //         colors={['#4CAF50', '#2E7D32']}
// //         className="rounded-lg p-4 shadow-lg flex-row items-center"
// //       >
// //         <Ionicons name="trophy" size={24} color="gold" />
// //         <Text className="text-white font-bold ml-2 text-base">
// //           {achievement}
// //         </Text>
// //         <TouchableOpacity onPress={onClose} className="ml-4">
// //           <Ionicons name="close-circle" size={20} color="white" />
// //         </TouchableOpacity>
// //       </LinearGradient>
// //     </View>
// //   );
// // };

// // const PostCard = ({ post, isDetailView = false, isHotPost = false }) => {
// //   const { user } = useAuth();
// //   const navigation = useNavigation();
  
// //   // State Management
// //   const [shareCount, setShareCount] = useState(0);
// //   const [isLiked, setIsLiked] = useState(false);
// //   const [comments, setComments] = useState([]);
// //   const [likes, setLikes] = useState(0);
// //   const [newComment, setNewComment] = useState('');
// //   const [showOptionsMenu, setShowOptionsMenu] = useState(false);
// //   const [selectedImage, setSelectedImage] = useState(null);
// //   const [postViews, setPostViews] = useState(0);
// //   const [showAchievement, setShowAchievement] = useState(false);
// //   const [achievementMessage, setAchievementMessage] = useState('');
// //   const [userCommentCount, setUserCommentCount] = useState(0);
// //   const [userLikeCount, setUserLikeCount] = useState(0);
// //   const [hasCommentedToday, setHasCommentedToday] = useState(false);
// //   const [hasLikedToday, setHasLikedToday] = useState(false);
  
// //   // Permissions and Ownership
// //   const isOwner = post.userId === user?.uid;
  
// //   // Check if user has updated streaks today
// //   useEffect(() => {
// //     const checkDailyStreaks = async () => {
// //       if (user?.uid) {
// //         const commentStreakUpdated = await hasUpdatedStreakToday(user.uid, 'comments');
// //         const likeStreakUpdated = await hasUpdatedStreakToday(user.uid, 'likes');
        
// //         setHasCommentedToday(commentStreakUpdated);
// //         setHasLikedToday(likeStreakUpdated);
// //       }
// //     };
    
// //     checkDailyStreaks();
// //   }, [user?.uid]);

// //   const handleShare = async () => {
// //     try {
// //       const result = await Share.share({
// //         title: `${post.userName}'s KLiqq`,
// //         message: `${post.content}\n\nShared via kliq:Student networking App`,
// //         url: post.mediaUrl,
// //       });
// //       if (result.action === Share.sharedAction) {
// //         await incrementShareCount(post.id);
// //         setShareCount(prev => prev + 1);
// //       }
// //     } catch (error) {
// //       Alert.alert('Error', 'Failed to share post');
// //     }
// //   };
  
// //   // Image Grid Rendering Method
// //   const renderImageGrid = () => {
// //     if (!post?.mediaUrls?.length) return null;

// //     const images = post.mediaUrls;
// //     const imageCount = images.length;
    
// //     return (
// //       <View className="mt-3 rounded-lg overflow-hidden">
// //         {imageCount === 1 && (
// //           <TouchableOpacity onPress={() => setSelectedImage(images[0])}>
// //             <Image 
// //               source={{ uri: images[0] }} 
// //               className="w-full h-72 rounded-lg"
// //               resizeMode="cover"
// //             />
// //           </TouchableOpacity>
// //         )}
        
// //         {imageCount === 2 && (
// //           <View className="flex-row">
// //             {images.map((url, index) => (
// //               <TouchableOpacity 
// //                 key={index} 
// //                 onPress={() => setSelectedImage(url)}
// //                 className="flex-1 h-60 p-0.5"
// //               >
// //                 <Image 
// //                   source={{ uri: url }} 
// //                   className="w-full h-full rounded-lg"
// //                   resizeMode="cover"
// //                 />
// //               </TouchableOpacity>
// //             ))}
// //           </View>
// //         )}
        
// //         {imageCount === 3 && (
// //           <View className="flex-row flex-wrap">
// //             <TouchableOpacity 
// //               onPress={() => setSelectedImage(images[0])}
// //               className="w-1/2 h-80 p-0.5"
// //             >
// //               <Image 
// //                 source={{ uri: images[0] }} 
// //                 className="w-full h-full rounded-lg"
// //                 resizeMode="cover"
// //               />
// //             </TouchableOpacity>
// //             <View className="w-1/2 h-80">
// //               <TouchableOpacity 
// //                 onPress={() => setSelectedImage(images[1])}
// //                 className="w-full h-1/2 p-0.5"
// //               >
// //                 <Image 
// //                   source={{ uri: images[1] }} 
// //                   className="w-full h-full rounded-lg"
// //                   resizeMode="cover"
// //                 />
// //               </TouchableOpacity>
// //               <TouchableOpacity 
// //                 onPress={() => setSelectedImage(images[2])}
// //                 className="w-full h-1/2 p-0.5"
// //               >
// //                 <Image 
// //                   source={{ uri: images[2] }} 
// //                   className="w-full h-full rounded-lg"
// //                   resizeMode="cover"
// //                 />
// //               </TouchableOpacity>
// //             </View>
// //           </View>
// //         )}
        
// //         {imageCount >= 4 && (
// //           <View className="flex-row flex-wrap">
// //             <View className="w-1/2 h-60">
// //               <TouchableOpacity 
// //                 onPress={() => setSelectedImage(images[0])}
// //                 className="w-full h-full p-0.5"
// //               >
// //                 <Image 
// //                   source={{ uri: images[0] }} 
// //                   className="w-full h-full rounded-lg"
// //                   resizeMode="cover"
// //                 />
// //               </TouchableOpacity>
// //             </View>
// //             <View className="w-1/2 h-60">
// //               <TouchableOpacity 
// //                 onPress={() => setSelectedImage(images[1])}
// //                 className="w-full h-1/2 p-0.5"
// //               >
// //                 <Image 
// //                   source={{ uri: images[1] }} 
// //                   className="w-full h-full rounded-lg"
// //                   resizeMode="cover"
// //                 />
// //               </TouchableOpacity>
// //               <View className="flex-row h-1/2">
// //                 <TouchableOpacity 
// //                   onPress={() => setSelectedImage(images[2])}
// //                   className="w-1/2 h-full p-0.5"
// //                 >
// //                   <Image 
// //                     source={{ uri: images[2] }} 
// //                     className="w-full h-full rounded-lg"
// //                     resizeMode="cover"
// //                   />
// //                 </TouchableOpacity>
// //                 <TouchableOpacity 
// //                   onPress={() => setSelectedImage(images[3])}
// //                   className="w-1/2 h-full p-0.5 relative"
// //                 >
// //                   <Image 
// //                     source={{ uri: images[3] }} 
// //                     className="w-full h-full rounded-lg"
// //                     resizeMode="cover"
// //                   />
// //                   {imageCount > 4 && (
// //                     <View className="absolute inset-0 bg-black/60 items-center justify-center rounded-lg">
// //                       <Text className="text-white text-xl font-bold">+{imageCount - 4}</Text>
// //                     </View>
// //                   )}
// //                 </TouchableOpacity>
// //               </View>
// //             </View>
// //           </View>
// //         )}
// //       </View>
// //     );
// //   };

// //   // Full Image Modal
// //   const ImageModal = ({ imageUrl, onClose }) => (
// //     <Modal 
// //       transparent={true} 
// //       visible={!!imageUrl} 
// //       onRequestClose={onClose}
// //     >
// //       <View className="flex-1 bg-black/80 items-center justify-center">
// //         <TouchableOpacity 
// //           onPress={onClose} 
// //           className="absolute top-10 right-5 z-50"
// //         >
// //           <Ionicons name="close" size={30} color="white" />
// //         </TouchableOpacity>
// //         <Image 
// //           source={{ uri: imageUrl }} 
// //           className="w-full h-[70%]" 
// //           resizeMode="contain"
// //         />
// //       </View>
// //     </Modal>
// //   );

// //   // Options Menu
// //   const OptionsMenu = () => (
// //     <Modal 
// //       transparent={true} 
// //       visible={showOptionsMenu} 
// //       onRequestClose={() => setShowOptionsMenu(false)}
// //     >
// //       <TouchableOpacity 
// //         className="flex-1 bg-black/50" 
// //         activeOpacity={1} 
// //         onPress={() => setShowOptionsMenu(false)}
// //       >
// //         <View className="absolute top-10 right-5 bg-white rounded-lg shadow-lg">
// //           {isOwner ? (
// //             <>
// //               <TouchableOpacity 
// //                 className="p-4 border-b border-gray-200"
// //                 onPress={() => {
// //                   handleDeletePost();
// //                   setShowOptionsMenu(false);
// //                 }}
// //               >
// //                 <Text className="text-red-500">Delete Post</Text>
// //               </TouchableOpacity>
// //               <TouchableOpacity 
// //                 className="p-4"
// //                 onPress={() => {
// //                   // Edit post logic
// //                   setShowOptionsMenu(false);
// //                 }}
// //               >
// //                 <Text>Edit Post</Text>
// //               </TouchableOpacity>
// //             </>
// //           ) : (
// //             <TouchableOpacity 
// //               className="p-4"
// //               onPress={() => {
// //                 handleReportPost();
// //                 setShowOptionsMenu(false);
// //               }}
// //             >
// //               <Text className="text-red-500">Report Post</Text>
// //             </TouchableOpacity>
// //           )}
// //         </View>
// //       </TouchableOpacity>
// //     </Modal>
// //   );

// //   // Fetch Initial Data
// //   useEffect(() => {
// //     const fetchInitialData = async () => {
// //       try {
// //         // Fetch Comments
// //         const fetchedComments = await getComments(post.id);
// //         setComments(fetchedComments);

// //         // Fetch Likes
// //         const fetchedLikes = await getLikes(post.id);
// //         setLikes(fetchedLikes.length);

// //         // Check if User has Liked
// //         const userLiked = fetchedLikes.some(like => like.userId === user?.uid);
// //         setIsLiked(userLiked);

// //         // Fetch Views
// //         const fetchedViews = await getViews(post.id);
// //         setPostViews(fetchedViews);
        
// //         // Fetch Share Count
// //         const shares = await getShareCount(post.id);
// //         setShareCount(shares);
        
// //         // Count user's comments on this post
// //         const userComments = fetchedComments.filter(comment => comment.userId === user?.uid);
// //         setUserCommentCount(userComments.length);
        
// //         // Count user's likes on this post
// //         setUserLikeCount(userLiked ? 1 : 0);
// //       } catch (error) {
// //         console.error('Error fetching initial data:', error);
// //       }
// //     };

// //     if (post.id && user?.uid) {
// //       fetchInitialData();
// //     }
// //   }, [post.id, user]);

// //   // View Tracking
// //   useEffect(() => {
// //     const trackPostView = async () => {
// //       try {
// //         if (post.id && user?.uid) {
// //           await incrementViews(post.id, user.uid);
// //         }
// //       } catch (error) {
// //         console.error('Error tracking post view:', error);
// //       }
// //     };

// //     trackPostView();
// //   }, [post.id, user?.uid]);

// //   // Show achievement notification
// //   const showAchievementNotification = (message) => {
// //     setAchievementMessage(message);
// //     setShowAchievement(true);
    
// //     // Auto-hide after 3 seconds
// //     setTimeout(() => {
// //       setShowAchievement(false);
// //     }, 3000);
// //   };

// //   // Update streak once per day regardless of activity count
// //   const updateStreakIfNeeded = async (activityType) => {
// //     if (!user?.uid) return { streakIncreased: false, currentStreak: 0, activityCounts: {} };
    
// //     // Check if the streak has already been updated today
// //     let hasUpdatedToday = false;
// //     let streakResult = { streakIncreased: false, currentStreak: 0, activityCounts: {} };
    
// //     if (activityType === 'comments') {
// //       if (!hasCommentedToday) {
// //         streakResult = await incrementCommentStreak(user.uid);
// //         setHasCommentedToday(true);
// //       }
// //     } else if (activityType === 'likes') {
// //       if (!hasLikedToday) {
// //         streakResult = await incrementLikeStreak(user.uid);
// //         setHasLikedToday(true);
// //       }
// //     }
    
// //     return streakResult;
// //   };

// //   // Check for milestone achievements
// //   const checkMilestones = (activityType, count, streakData) => {
// //     if (activityType === 'comments' && count === COMMENT_MILESTONE) {
// //       showAchievementNotification(`🏆 Achievement: ${COMMENT_MILESTONE} Comments Milestone!`);
// //     } else if (activityType === 'likes' && count === LIKE_MILESTONE) {
// //       showAchievementNotification(`🏆 Achievement: ${LIKE_MILESTONE} Likes Milestone!`);
// //     }
    
// //     // Show streak achievement if streak increased
// //     if (streakData.streakIncreased) {
// //       showAchievementNotification(`🔥 You're on a ${streakData.currentStreak} day streak!`);
// //     }
// //   };

// //   // Handle Like Method
// //   const handleLike = async () => {
// //     if (!user?.uid) {
// //       Alert.alert('Login Required', 'Please login to like posts');
// //       return;
// //     }
    
// //     try {
// //       if (isLiked) {
// //         await removeLike(post.id, user);
// //         setLikes(prev => Math.max(0, prev - 1));
// //         setUserLikeCount(prev => Math.max(0, prev - 1));
// //       } else {
// //         await addLike(post.id, user);
// //         setLikes(prev => prev + 1);
// //         setUserLikeCount(prev => prev + 1);
        
// //         // Update streak for liking (once per day regardless of like count)
// //         const streakResult = await updateStreakIfNeeded('likes');
        
// //         // Check for milestone achievements
// //         checkMilestones('likes', userLikeCount + 1, streakResult);
// //       }
// //       setIsLiked(!isLiked);
// //     } catch (error) {
// //       console.error('Like error:', error);
// //       Alert.alert('Error', 'Unable to process like. Please try again.');
// //     }
// //   };

// //   // Handle Comment Method
// //   const handleAddComment = async () => {
// //     if (!user?.uid) {
// //       Alert.alert('Login Required', 'Please login to comment');
// //       return;
// //     }
    
// //     if (!newComment.trim()) return;
// //     if (newComment.length > MAX_COMMENT_LENGTH) {
// //       Alert.alert('Comment too long', `Maximum ${MAX_COMMENT_LENGTH} characters allowed`);
// //       return;
// //     }

// //     try {
// //       const commentData = {
// //         content: newComment,
// //         userId: user.uid,
// //         userName: user.displayName || 'Anonymous',
// //         userAvatar: user.photoURL || DEFAULT_AVATAR,
// //         timestamp: new Date()
// //       };

// //       await addComment(post.id, commentData);
// //       setNewComment('');
      
// //       // Increment user's comment count
// //       const newCommentCount = userCommentCount + 1;
// //       setUserCommentCount(newCommentCount);
      
// //       // Update streak for commenting (once per day regardless of comment count)
// //       const streakResult = await updateStreakIfNeeded('comments');
      
// //       // Check for milestone achievements
// //       checkMilestones('comments', newCommentCount, streakResult);
      
// //       // Refresh comments
// //       const updatedComments = await getComments(post.id);
// //       setComments(updatedComments);
// //     } catch (error) {
// //       console.error('Comment error:', error);
// //       Alert.alert('Error', 'Unable to post comment. Please try again.');
// //     }
// //   };

// //   // Delete Post Method
// //   const handleDeletePost = async () => {
// //     try {
// //       await deletePost(post.id);
// //       Alert.alert('Success', 'Post deleted successfully');
// //       // Navigate back or refresh list
// //       if (navigation.canGoBack()) {
// //         navigation.goBack();
// //       }
// //     } catch (error) {
// //       console.error('Delete post error:', error);
// //       Alert.alert('Error', 'Unable to delete post. Please try again.');
// //     }
// //   };

// //   // Report Post Method
// //   const handleReportPost = async () => {
// //     try {
// //       await reportPost(post.id, user.uid);
// //       Alert.alert('Report Submitted', 'Thank you for reporting this post.');
// //     } catch (error) {
// //       console.error('Report post error:', error);
// //       Alert.alert('Error', 'Unable to report post. Please try again.');
// //     }
// //   };

// //   // Main Render
// //   return (
// //     <View className={`bg-gray-900 rounded-xl ${isDetailView ? 'mb-0' : 'mb-4'} ${isHotPost ? 'border-2 border-yellow-500' : ''}`}>
// //       {/* Achievement Banner */}
// //       <StreakAchievementBanner 
// //         achievement={achievementMessage} 
// //         visible={showAchievement} 
// //         onClose={() => setShowAchievement(false)} 
// //       />
      
// //       {/* Image Modal */}
// //       <ImageModal imageUrl={selectedImage} onClose={() => setSelectedImage(null)} />
      
// //       {/* Options Menu */}
// //       <OptionsMenu />
      
// //       {/* Post Header */}
// //       <View className="p-4 flex-row justify-between items-center">
// //         <View className="flex-row items-center">
// //           <TouchableOpacity onPress={() => {
// //             if (!isDetailView) {
// //               router.push(`/profile/${post.userId}`);
// //             }
// //           }}>
// //             <Image 
// //               source={{ uri: post.userAvatar || DEFAULT_AVATAR }} 
// //               className="w-12 h-12 rounded-full"
// //             />
// //           </TouchableOpacity>
// //           <View className="ml-3">
// //             <Text className="text-white font-semibold text-lg">{post.userName}</Text>
// //             <Text className="text-gray-400 text-xs">{formatTimestamp(post.timestamp)}</Text>
// //           </View>
// //         </View>
        
// //         <TouchableOpacity onPress={() => setShowOptionsMenu(true)}>
// //           <Ionicons name="ellipsis-vertical" size={24} color="white" />
// //         </TouchableOpacity>
// //       </View>
      
// //       {/* Post Content */}
// //       <View className="px-4">
// //         <Text className="text-white text-base mb-2">{post.content}</Text>
        
// //         {/* Render Media */}
// //         {renderImageGrid()}
        
// //         {/* Post Stats */}
// //         <View className="flex-row justify-between mt-4 pb-2">
// //           <View className="flex-row items-center">
// //             <Text className="text-gray-400 mr-4">
// //               <Ionicons name="heart" size={14} color="#FF6B6B" /> {likes}
// //             </Text>
// //             <Text className="text-gray-400">
// //               <Ionicons name="chatbubble-outline" size={14} color="white" /> {comments.length}
// //             </Text>
// //           </View>
          
// //           <View className="flex-row items-center">
// //             <Text className="text-gray-400 mr-2">
// //               <Ionicons name="eye-outline" size={14} color="white" /> {postViews}
// //             </Text>
// //             <Text className="text-gray-400">
// //               <Ionicons name="share-social-outline" size={14} color="white" /> {shareCount}
// //             </Text>
// //           </View>
// //         </View>
// //       </View>
      
// //       {/* Action Buttons */}
// //       <View className="flex-row border-t border-gray-800 pt-2">
// //         <TouchableOpacity 
// //           className={`flex-1 flex-row items-center justify-center py-2 ${isLiked ? 'opacity-100' : 'opacity-80'}`}
// //           onPress={handleLike}
// //         >
// //           <Ionicons 
// //             name={isLiked ? "heart" : "heart-outline"} 
// //             size={20} 
// //             color={isLiked ? "#FF6B6B" : "white"} 
// //           />
// //           <Text className={`ml-1 ${isLiked ? 'text-red-400' : 'text-gray-300'}`}>Like</Text>
// //         </TouchableOpacity>
        
// //         <TouchableOpacity 
// //           className="flex-1 flex-row items-center justify-center py-2"
// //           onPress={() => {
// //             if (!isDetailView) {
// //               router.push(`/post/${post.id}`);
// //             }
// //           }}
// //         >
// //           <Ionicons name="chatbubble-outline" size={20} color="white" />
// //           <Text className="ml-1 text-gray-300">Comment</Text>
// //         </TouchableOpacity>
        
// //         <TouchableOpacity 
// //           className="flex-1 flex-row items-center justify-center py-2"
// //           onPress={handleShare}
// //         >
// //           <Ionicons name="share-social-outline" size={20} color="white" />
// //           <Text className="ml-1 text-gray-300">Share</Text>
// //         </TouchableOpacity>
// //       </View>
      
// //       {/* Comments Section */}
// //       {isDetailView && (
// //         <View className="pt-4 px-4">
// //           <Text className="text-white font-bold text-lg mb-4">
// //             Comments ({comments.length})
// //           </Text>
          
// //           {comments.length > 0 ? (
// //             <ScrollView className="max-h-60">
// //               {comments.map((comment, index) => (
// //                 <View key={index} className="mb-4 flex-row">
// //                   <Image 
// //                     source={{ uri: comment.userAvatar || DEFAULT_AVATAR }}
// //                     className="w-8 h-8 rounded-full mr-3"
// //                   />
// //                   <View className="flex-1 bg-gray-800 p-3 rounded-lg">
// //                     <View className="flex-row justify-between items-center mb-1">
// //                       <Text className="text-white font-semibold">{comment.userName}</Text>
// //                       <Text className="text-gray-400 text-xs">{formatTimestamp(comment.timestamp)}</Text>
// //                     </View>
// //                     <Text className="text-gray-300">{comment.content}</Text>
// //                   </View>
// //                 </View>
// //               ))}
// //             </ScrollView>
// //           ) : (
// //             <View className="items-center py-4">
// //               <Text className="text-gray-500">No comments yet. Be the first to comment!</Text>
// //             </View>
// //           )}
          
// //           {/* Comment Input */}
// //           <View className="mt-4 flex-row items-center border-t border-gray-800 pt-4">
// //             <Image 
// //               source={{ uri: user?.photoURL || DEFAULT_AVATAR }}
// //               className="w-10 h-10 rounded-full mr-3"
// //             />
// //             <TextInput
// //               className="flex-1 bg-gray-800 text-white p-2 rounded-lg"
// //               placeholder="Add a comment..."
// //               placeholderTextColor="#999"
// //               value={newComment}
// //               onChangeText={setNewComment}
// //               multiline
// //               maxLength={MAX_COMMENT_LENGTH}
// //             />
// //             <TouchableOpacity 
// //               className="ml-2 bg-blue-500 p-2 rounded-full"
// //               onPress={handleAddComment}
// //             >
// //               <Ionicons name="send" size={20} color="white" />
// //             </TouchableOpacity>
// //           </View>
// //         </View>
// //       )}
// //     </View>
// //   );
// // };

// // export default PostCard;

// import React, { useState, useEffect, useCallback } from 'react';
// import {
//   View,
//   Text,
//   Image,
//   TouchableOpacity,
//   TextInput,
//   Dimensions,
//   Alert,
//   Modal,Share,
//   ScrollView,
// } from 'react-native';
// import { LinearGradient } from 'expo-linear-gradient';
// import { Ionicons, MaterialIcons } from '@expo/vector-icons';
// import { useNavigation } from '@react-navigation/native';
// import { useAuth } from '../context/authContext';
// import {
//   addComment,
//   getComments,
//   addLike,
//   removeLike,
//   getLikes,
//   incrementViews,
//   getViews,
//   deletePost,
//   reportPost,fetchHotPosts,incrementShareCount,getShareCount
// } from '../app/(apis)/post';
// import { doc, getDoc, updateDoc } from 'firebase/firestore';
// import { db } from '../config/firebaseConfig';
// import { router } from 'expo-router';
// // Share.
// const { width, height } = Dimensions.get('window');
// const DEFAULT_AVATAR = 'https://imgs.search.brave.com/cyPQcxgehDcXav9Isw-S2VR9bVSe0jC0LWy2wW-Rlzk/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly9pY29u/cy52ZXJ5aWNvbi5j/b20vcG5nLzEyOC9o/ZWFsdGhjYXRlLW1lZGlj/YWwvaGVhbHRoeS10/YWl6aG91LWxpbmVh/ci1pY29uLWxpYnJh/cnktdW5kZXIvZGVmYXVs/dC1hdmF0YXItNC5w/bmc';
// const MAX_COMMENT_LENGTH = 500;


// // Timestamp Formatting Utility

// const formatTimestamp = (timestamp) => {
//   if (!timestamp) return '';
  
//   const now = new Date();
//   const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
//   const diffMs = now - date;
//   const diffMins = Math.floor(diffMs / 60000);
//   const diffHrs = Math.floor(diffMins / 60);
//   const diffDays = Math.floor(diffHrs / 24);
  
//   if (diffMins < 1) return 'just now';
//   if (diffMins < 60) return `${diffMins}m ago`;
//   if (diffHrs < 24) return `${diffHrs}h ago`;
//   if (diffDays < 7) return `${diffDays}d ago`;
  
//   return date.toLocaleDateString();
// };


// // Hot Post Banner Component
// const HotPostBanner = ({ onPress }) => {
//   const [hotPosts, setHotPosts] = useState([]);

//   useEffect(() => {
//     const loadHotPosts = async () => {
//       const posts = await fetchHotPosts();
//       console.log(posts)
//       setHotPosts(posts);
//     };
//     loadHotPosts();
//   }, []);

//   return hotPosts.length > 0 ? (
//     <TouchableOpacity onPress={onPress}>
//       <LinearGradient
//         colors={['#FF6B6B', '#FF47']}
//         className="rounded-lg p-4 mb-4 shadow-lg flex-row items-center"
//       >
//         <Ionicons name="flame" size={24} color="white" />
//         <Text className="text-white font-bold ml-2 text-lg">
//           Hot Post of the Week
//         </Text>
//       </LinearGradient>
//     </TouchableOpacity>
//   ) : null;
// };


// const PostCard = ({ post, isDetailView = false, isHotPost = false }) => {
//   const { user } = useAuth();
//   const navigation = useNavigation();
//   const [shareCount,setShareCount]=useState()

//   // State Management
//   const [isLiked, setIsLiked] = useState(false);
//   const [comments, setComments] = useState([]);
//   const [likes, setLikes] = useState(0);
//   const [newComment, setNewComment] = useState('');
//   const [showOptionsMenu, setShowOptionsMenu] = useState(false);
//   const [selectedImage, setSelectedImage] = useState(null);
//   const [postViews, setPostViews] = useState(0);
//   //  const [isHotPost,setisHotPost]=useState(true)
//   // Permissions and Ownership
//   const isOwner = post.userId === user?.uid;
//   const handleShare = async () => {
//     try {
//       const result = await Share.share({
//         title: `${post.userName}'s KLiqq`,
//         message: `${post.content}\n\nShared via kliq:Student networking  App`,
//         url: post.mediaUrl,
//       });
//       if (result.action === Share.sharedAction) {
//         await incrementShareCount(post.id);
//         setShareCount(prev => prev + 1);
//       }
//     } catch (error) {
//       Alert.alert('Error', 'Failed to share post');
//     }
//   };
//   // Image Grid Rendering Method
//  const renderImageGrid = () => {
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

//   // Full Image Modal
//   const ImageModal = ({ imageUrl, onClose }) => (
//     <Modal 
//       transparent={true} 
//       visible={!!imageUrl} 
//       onRequestClose={onClose}
//     >
//       <View className="flex-1 bg-black/80 items-center justify-center">
//         <TouchableOpacity 
//           onPress={onClose} 
//           className="absolute top-10 right-5 z-50"
//         >
//           <Ionicons name="close" size={30} color="white" />
//         </TouchableOpacity>
//         <Image 
//           source={{ uri: imageUrl }} 
//           className="w-full h-[70%]" 
//           resizeMode="contain"
//         />
//       </View>
//     </Modal>
//   );

//   // Options Menu
//   const OptionsMenu = () => (
//     <Modal 
//       transparent={true} 
//       visible={showOptionsMenu} 
//       onRequestClose={() => setShowOptionsMenu(false)}
//     >
//       <TouchableOpacity 
//         className="flex-1 bg-black/50" 
//         activeOpacity={1} 
//         onPress={() => setShowOptionsMenu(false)}
//       >
//         <View className="absolute top-10 right-5 bg-white rounded-lg shadow-lg">
//           {isOwner ? (
//             <>
//               <TouchableOpacity 
//                 className="p-4 border-b border-gray-200"
//                 onPress={() => {
//                   handleDeletePost();
//                   setShowOptionsMenu(false);
//                 }}
//               >
//                 <Text className="text-red-500">Delete Post</Text>
//               </TouchableOpacity>
//               <TouchableOpacity 
//                 className="p-4"
//                 onPress={() => {
//                   // Edit post logic
//                   setShowOptionsMenu(false);
//                 }}
//               >
//                 <Text>Edit Post</Text>
//               </TouchableOpacity>
//             </>
//           ) : (
//             <TouchableOpacity 
//               className="p-4"
//               onPress={() => {
//                 handleReportPost();
//                 setShowOptionsMenu(false);
//               }}
//             >
//               <Text className="text-red-500">Report Post</Text>
//             </TouchableOpacity>
//           )}
//         </View>
//       </TouchableOpacity>
//     </Modal>
//   );

//   // Fetch Initial Data
//   useEffect(() => {
//     const fetchInitialData = async () => {
//       try {
//         // Fetch Comments
//         const fetchedComments = await getComments(post.id);
//         setComments(fetchedComments);

//         // Fetch Likes
//         const fetchedLikes = await getLikes(post.id);
//         setLikes(fetchedLikes.length);

//         // Check if User has Liked
//         const userLiked = fetchedLikes.some(like => like.userId === user?.uid);
//         setIsLiked(userLiked);

//         // Fetch Views
//         const fetchedViews = await getViews(post.id);
//         setPostViews(fetchedViews);
//       } catch (error) {
//         console.error('Error fetching initial data:', error);
//       }
//     };

//     fetchInitialData();
//   }, [post.id, user]);

//   // View Tracking
//   useEffect(() => {
//     const trackPostView = async () => {
//       try {
//         await incrementViews(post.id, user?.uid);
//       } catch (error) {
//         console.error('Error tracking post view:', error);
//       }
//     };

//     trackPostView();
//   }, [post.id, user?.uid]);

//   // Handle Like Method
//   const handleLike = async () => {
//     try {
//       if (isLiked) {
//         await removeLike(post.id, user);
//         setLikes(prev => Math.max(0, prev - 1));
//       } else {
//         await addLike(post.id, user);
//         setLikes(prev => prev + 1);
//       }
//       setIsLiked(!isLiked);
//     } catch (error) {
//       console.error('Like error:', error);
//       Alert.alert('Error', 'Unable to process like. Please try again.');
//     }
//   };

//   // Handle Comment Method
//   const handleAddComment = async () => {
//     if (!newComment.trim()) return;

//     try {
//       const commentData = {
//         content: newComment,
//         userId: user.uid,
//         userName: user.displayName || 'Anonymous',
//         userAvatar: user.photoURL || DEFAULT_AVATAR,
//         timestamp: new Date()
//       };

//       await addComment(post.id, commentData);
//       setNewComment('');
      
//       // Refresh comments
//       const updatedComments = await getComments(post.id);
//       setComments(updatedComments);
//     } catch (error) {
//       console.error('Comment error:', error);
//       Alert.alert('Error', 'Unable to post comment. Please try again.');
//     }
//   };

//   // Delete Post Method
//   const handleDeletePost = async () => {
//     try {
//       await deletePost(post.id);
//       Alert.alert('Success', 'Post deleted successfully');
//       // Optional: Navigate back or refresh list
//     } catch (error) {
//       console.error('Delete post error:', error);
//       Alert.alert('Error', 'Unable to delete post. Please try again.');
//     }
//   };

//   // Report Post Method
//   const handleReportPost = async () => {
//     try {
//       await reportPost(post.id, user.uid);
//       Alert.alert('Report Submitted', 'Thank you for reporting this post.');
//     } catch (error) {
//       console.error('Report post error:', error);
//       Alert.alert('Error', 'Unable to report post. Please try again.');
//     }
//   };

//   return (
//     <View>
//       {isHotPost && (
//         <HotPostBanner 
//         onPress={() => router.push(`/postDetailView/${post.id}`)} />
//       )}
      
//       <View 
//         className={`
//           bg-black p-4 mb-4 
//           ${isHotPost ? 'border-2 border-red-500 rounded-lg' : ''}
//         `}
//       >
//         {/* Header with Three-Dot Menu */}
//         <View className="flex-row justify-between items-center mb-4">
//           <View className="flex-row items-center">
//             <Image 
//               source={{ uri: post.userAvatar || DEFAULT_AVATAR }}
//               className={`
//                 w-10 h-10 rounded-full mr-3
//                 ${isHotPost ? 'border-2 border-red-500' : ''}
//               `}
//             />
//             <View>
//               <Text 
//                 className={`
//                   font-bold 
//                   ${isHotPost ? 'text-red-500' : 'text-white'}
//                 `}
//               >
//                 {post.userName}
//                 {isHotPost && (
//                   <Text className="text-xs text-white ml-2">
//                     Hot Post 🔥
//                   </Text>
//                 )}
//               </Text>
//               <Text className="text-gray-400 text-xs">
//                 {formatTimestamp(post.createdAt)}
//               </Text>
//             </View>
//           </View>
          
//           <TouchableOpacity onPress={() => setShowOptionsMenu(true)}>
//             <Ionicons 
//               name="ellipsis-vertical" 
//               size={20} 
//               color={isHotPost ? 'red' : 'white'} 
//             />
//           </TouchableOpacity>
//         </View>

//         {/* Post Content */}
//         <TouchableOpacity 
//   onPress={() => router.push(`/postDetailView/${post.id}`)}
//           className={isHotPost ? 'bg-red-900/20 p-2 rounded-lg' : ''}
//         >
//           <Text 
//             className={`
//               ${isHotPost ? 'text-red-300' : 'text-white'} mb-4
//             `}
//             numberOfLines={isDetailView ? undefined : 3}
//           >
//             {post.content}
//           </Text>
//         </TouchableOpacity>

//         {/* Image Grid */}
//         {renderImageGrid()}

//         {/* Stats Section */}
//         <View 
//           className={`
//             flex-row justify-between py-2 border-t 
//             ${isHotPost ? 'border-red-800' : 'border-gray-800'}
//           `}
//         >
//           <Text 
//             className={`
//               text-xs 
//               ${isHotPost ? 'text-red-400' : 'text-gray-400'}
//             `}
//           >
//             {likes} likes • {comments.length} comments • 👀 {postViews} views
//           </Text>
//         </View>

//         {/* Action Buttons */}
//         <View 
//           className={`
//             flex-row justify-around py-2 border-t 
//             ${isHotPost ? 'border-red-800' : 'border-gray-800'}
//           `}
//         >
//       <TouchableOpacity 
//   className="flex-row items-center"
//   onPress={handleLike}
// >
//   <Ionicons 
//     name={isLiked ? 'heart' : 'heart-outline'} 
//     size={24} 
//     color={
//       isHotPost 
//         ? (isLiked ? '#FF4444' : 'red') 
//         : (isLiked ? '#FF4444' : 'gray')
//     }
//   />
//   <Text 
//     className={`
//       ml-2 
//       ${isLiked ? 'text-red-500' : 'text-gray-400'}
//       ${isHotPost ? 'text-red-300' : ''}
//     `}
//   >
//     {likes}
//   </Text>
// </TouchableOpacity>

// <TouchableOpacity 
//   className="flex-row items-center"
//   onPress={() => router.push(`/postDetailView/${post.id}`)}>
//   <Ionicons 
//     name="chatbubble-outline" 
//     size={24} 
//     color={isHotPost ? 'red' : 'gray'} 
//   />
//   <Text 
//     className={`
//       ml-2 
//       ${isHotPost ? 'text-red-300' : 'text-gray-400'}
//     `}
//   >
//     {comments.length}
//   </Text>
// </TouchableOpacity>

// <TouchableOpacity className="flex-row items-center" onPress={handleShare}>
//   <Ionicons 
//     name="share-social-outline" 
//     size={24} 
//     color={isHotPost ? 'red' : 'gray'} 
//   />
// </TouchableOpacity>
// </View>

// {/* Modals */}
// <OptionsMenu />
// <ImageModal 
//   imageUrl={selectedImage} 
//   onClose={() => setSelectedImage(null)} 
// />
// </View>
// </View>
// );
// };

// export default PostCard;


"use client"

// import { useState, useEffect } from "react"
// import { View, Text, Image, TouchableOpacity, Dimensions, Alert, Modal, Share, useColorScheme } from "react-native"
// import { LinearGradient } from "expo-linear-gradient"
// import { Ionicons } from "@expo/vector-icons"
// import { useNavigation } from "@react-navigation/native"
// import { useAuth } from "../context/authContext"
// import {
//   addComment,
//   getComments,
//   addLike,
//   removeLike,
//   getLikes,
//   incrementViews,
//   getViews,
//   deletePost,
//   reportPost,
//   fetchHotPosts,
//   incrementShareCount,
//   getShareCount,
// } from "../app/(apis)/post"
// import { router } from "expo-router"

// const { width, height } = Dimensions.get("window")
// const DEFAULT_AVATAR =
//   "https://imgs.search.brave.com/cyPQcxgehDcXav9Isw-S2VR9bVSe0jC0LWy2wW-Rlzk/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly9pY29u/cy52ZXJ5aWNvbi5j/b20vcG5nLzEyOC9o/ZWFsdGhjYXRlLW1lZGlj/YWwvaGVhbHRoeS10/YWl6aG91LWxpbmVh/ci1pY29uLWxpYnJh/cnktdW5kZXIvZGVmYXVs/dC1hdmF0YXItNC5w/bmc"
// const MAX_COMMENT_LENGTH = 500

// // Theme colors for light and dark mode
// const lightTheme = {
//   background: "#FFFFFF",
//   cardBackground: "#F8F9FA",
//   text: "#171616",
//   textSecondary: "#6C6C6D",
//   border: "#E5E7EB",
//   accent: "#6366F1",
// }

// const darkTheme = {
//   background: "#121212",
//   cardBackground: "#1E1E1E",
//   text: "#FFFFFF",
//   textSecondary: "#B2B3B2",
//   border: "#333333",
//   accent: "#6366F1",
// }

// // Timestamp Formatting Utility
// const formatTimestamp = (timestamp) => {
//   if (!timestamp) return ""

//   const now = new Date()
//   const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
//   const diffMs = now - date
//   const diffMins = Math.floor(diffMs / 60000)
//   const diffHrs = Math.floor(diffMins / 60)
//   const diffDays = Math.floor(diffHrs / 24)

//   if (diffMins < 1) return "just now"
//   if (diffMins < 60) return `${diffMins}m ago`
//   if (diffHrs < 24) return `${diffHrs}h ago`
//   if (diffDays < 7) return `${diffDays}d ago`

//   return date.toLocaleDateString()
// }

// // Hot Post Banner Component
// const HotPostBanner = ({ onPress }) => {
//   const [hotPosts, setHotPosts] = useState([])
//   const colorScheme = useColorScheme()
//   const theme = colorScheme === "dark" ? darkTheme : lightTheme

//   useEffect(() => {
//     const loadHotPosts = async () => {
//       const posts = await fetchHotPosts()
//       setHotPosts(posts)
//     }
//     loadHotPosts()
//   }, [])

//   return hotPosts.length > 0 ? (
//     <TouchableOpacity onPress={onPress}>
//       <LinearGradient colors={["#FF6B6B", "#FF4747"]} className="rounded-lg p-4 mb-4 shadow-lg flex-row items-center">
//         <Ionicons name="flame" size={24} color="white" />
//         <Text className="text-white font-bold ml-2 text-lg">Hot Post of the Week</Text>
//       </LinearGradient>
//     </TouchableOpacity>
//   ) : null
// }

// const PostCard = ({ post, isDetailView = false, isHotPost = false }) => {
//   const { user } = useAuth()
//   const navigation = useNavigation()
//   const [shareCount, setShareCount] = useState(0)
//   const colorScheme = useColorScheme()
//   const theme = colorScheme === "dark" ? darkTheme : lightTheme

//   // State Management
//   const [isLiked, setIsLiked] = useState(false)
//   const [comments, setComments] = useState([])
//   const [likes, setLikes] = useState(0)
//   const [newComment, setNewComment] = useState("")
//   const [showOptionsMenu, setShowOptionsMenu] = useState(false)
//   const [selectedImage, setSelectedImage] = useState(null)
//   const [postViews, setPostViews] = useState(0)

//   // Permissions and Ownership
//   const isOwner = post.userId === user?.uid

//   const handleShare = async () => {
//     try {
//       const result = await Share.share({
//         title: `${post.userName}'s KLiqq`,
//         message: `${post.content}\n\nShared via kliq:Student networking App`,
//         url: post.mediaUrl,
//       })
//       if (result.action === Share.sharedAction) {
//         await incrementShareCount(post.id)
//         setShareCount((prev) => prev + 1)
//       }
//     } catch (error) {
//       Alert.alert("Error", "Failed to share post")
//     }
//   }

//   // Image Grid Rendering Method
//   const renderImageGrid = () => {
//     if (!post?.mediaUrls?.length) return null

//     const images = post.mediaUrls
//     const imageCount = images.length

//     return (
//       <View className="mt-3 rounded-lg overflow-hidden">
//         {imageCount === 1 && (
//           <TouchableOpacity onPress={() => setSelectedImage(images[0])}>
//             <Image source={{ uri: images[0] }} className="w-full h-72 rounded-lg" resizeMode="cover" />
//           </TouchableOpacity>
//         )}

//         {imageCount === 2 && (
//           <View className="flex-row">
//             {images.map((url, index) => (
//               <TouchableOpacity key={index} onPress={() => setSelectedImage(url)} className="flex-1 h-60 p-0.5">
//                 <Image source={{ uri: url }} className="w-full h-full rounded-lg" resizeMode="cover" />
//               </TouchableOpacity>
//             ))}
//           </View>
//         )}

//         {imageCount === 3 && (
//           <View className="flex-row flex-wrap">
//             <TouchableOpacity onPress={() => setSelectedImage(images[0])} className="w-1/2 h-80 p-0.5">
//               <Image source={{ uri: images[0] }} className="w-full h-full rounded-lg" resizeMode="cover" />
//             </TouchableOpacity>
//             <View className="w-1/2 h-80">
//               <TouchableOpacity onPress={() => setSelectedImage(images[1])} className="w-full h-1/2 p-0.5">
//                 <Image source={{ uri: images[1] }} className="w-full h-full rounded-lg" resizeMode="cover" />
//               </TouchableOpacity>
//               <TouchableOpacity onPress={() => setSelectedImage(images[2])} className="w-full h-1/2 p-0.5">
//                 <Image source={{ uri: images[2] }} className="w-full h-full rounded-lg" resizeMode="cover" />
//               </TouchableOpacity>
//             </View>
//           </View>
//         )}

//         {imageCount >= 4 && (
//           <View className="flex-row flex-wrap">
//             <View className="w-1/2 h-60">
//               <TouchableOpacity onPress={() => setSelectedImage(images[0])} className="w-full h-full p-0.5">
//                 <Image source={{ uri: images[0] }} className="w-full h-full rounded-lg" resizeMode="cover" />
//               </TouchableOpacity>
//             </View>
//             <View className="w-1/2 h-60">
//               <TouchableOpacity onPress={() => setSelectedImage(images[1])} className="w-full h-1/2 p-0.5">
//                 <Image source={{ uri: images[1] }} className="w-full h-full rounded-lg" resizeMode="cover" />
//               </TouchableOpacity>
//               <View className="flex-row h-1/2">
//                 <TouchableOpacity onPress={() => setSelectedImage(images[2])} className="w-1/2 h-full p-0.5">
//                   <Image source={{ uri: images[2] }} className="w-full h-full rounded-lg" resizeMode="cover" />
//                 </TouchableOpacity>
//                 <TouchableOpacity onPress={() => setSelectedImage(images[3])} className="w-1/2 h-full p-0.5 relative">
//                   <Image source={{ uri: images[3] }} className="w-full h-full rounded-lg" resizeMode="cover" />
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
//     )
//   }

//   // Full Image Modal
//   const ImageModal = ({ imageUrl, onClose }) => (
//     <Modal transparent={true} visible={!!imageUrl} onRequestClose={onClose}>
//       <View className="flex-1 bg-black/80 items-center justify-center">
//         <TouchableOpacity onPress={onClose} className="absolute top-10 right-5 z-50">
//           <Ionicons name="close" size={30} color="white" />
//         </TouchableOpacity>
//         <Image source={{ uri: imageUrl }} className="w-full h-[70%]" resizeMode="contain" />
//       </View>
//     </Modal>
//   )

//   // Options Menu
//   const OptionsMenu = () => (
//     <Modal transparent={true} visible={showOptionsMenu} onRequestClose={() => setShowOptionsMenu(false)}>
//       <TouchableOpacity className="flex-1 bg-black/50" activeOpacity={1} onPress={() => setShowOptionsMenu(false)}>
//         <View
//           className="absolute top-10 right-5"
//           style={{
//             backgroundColor: theme.cardBackground,
//             borderRadius: 12,
//             shadowColor: "#000",
//             shadowOffset: { width: 0, height: 2 },
//             shadowOpacity: 0.2,
//             shadowRadius: 4,
//             elevation: 5,
//           }}
//         >
//           {isOwner ? (
//             <>
//               <TouchableOpacity
//                 className="p-4 border-b"
//                 style={{ borderBottomColor: theme.border }}
//                 onPress={() => {
//                   handleDeletePost()
//                   setShowOptionsMenu(false)
//                 }}
//               >
//                 <Text style={{ color: "#F43F5E" }}>Delete Post</Text>
//               </TouchableOpacity>
//               <TouchableOpacity
//                 className="p-4"
//                 onPress={() => {
//                   // Edit post logic
//                   setShowOptionsMenu(false)
//                 }}
//               >
//                 <Text style={{ color: theme.text }}>Edit Post</Text>
//               </TouchableOpacity>
//             </>
//           ) : (
//             <TouchableOpacity
//               className="p-4"
//               onPress={() => {
//                 handleReportPost()
//                 setShowOptionsMenu(false)
//               }}
//             >
//               <Text style={{ color: "#F43F5E" }}>Report Post</Text>
//             </TouchableOpacity>
//           )}
//         </View>
//       </TouchableOpacity>
//     </Modal>
//   )

//   // Fetch Initial Data
//   useEffect(() => {
//     const fetchInitialData = async () => {
//       try {
//         // Fetch Comments
//         const fetchedComments = await getComments(post.id)
//         setComments(fetchedComments)

//         // Fetch Likes
//         const fetchedLikes = await getLikes(post.id)
//         setLikes(fetchedLikes.length)

//         // Check if User has Liked
//         const userLiked = fetchedLikes.some((like) => like.userId === user?.uid)
//         setIsLiked(userLiked)

//         // Fetch Views
//         const fetchedViews = await getViews(post.id)
//         setPostViews(fetchedViews)

//         // Fetch Share Count
//         const fetchedShareCount = await getShareCount(post.id)
//         setShareCount(fetchedShareCount || 0)
//       } catch (error) {
//         console.error("Error fetching initial data:", error)
//       }
//     }

//     fetchInitialData()
//   }, [post.id, user])

//   // View Tracking
//   useEffect(() => {
//     const trackPostView = async () => {
//       try {
//         await incrementViews(post.id, user?.uid)
//       } catch (error) {
//         console.error("Error tracking post view:", error)
//       }
//     }

//     trackPostView()
//   }, [post.id, user?.uid])

//   // Handle Like Method
//   const handleLike = async () => {
//     try {
//       if (isLiked) {
//         await removeLike(post.id, user)
//         setLikes((prev) => Math.max(0, prev - 1))
//       } else {
//         await addLike(post.id, user)
//         setLikes((prev) => prev + 1)
//       }
//       setIsLiked(!isLiked)
//     } catch (error) {
//       console.error("Like error:", error)
//       Alert.alert("Error", "Unable to process like. Please try again.")
//     }
//   }

//   // Handle Comment Method
//   const handleAddComment = async () => {
//     if (!newComment.trim()) return

//     try {
//       const commentData = {
//         content: newComment,
//         userId: user.uid,
//         userName: user.displayName || "Anonymous",
//         userAvatar: user.photoURL || DEFAULT_AVATAR,
//         timestamp: new Date(),
//       }

//       await addComment(post.id, commentData)
//       setNewComment("")

//       // Refresh comments
//       const updatedComments = await getComments(post.id)
//       setComments(updatedComments)
//     } catch (error) {
//       console.error("Comment error:", error)
//       Alert.alert("Error", "Unable to post comment. Please try again.")
//     }
//   }

//   // Delete Post Method
//   const handleDeletePost = async () => {
//     try {
//       await deletePost(post.id)
//       Alert.alert("Success", "Post deleted successfully")
//       // Optional: Navigate back or refresh list
//     } catch (error) {
//       console.error("Delete post error:", error)
//       Alert.alert("Error", "Unable to delete post. Please try again.")
//     }
//   }

//   // Report Post Method
//   const handleReportPost = async () => {
//     try {
//       await reportPost(post.id, user.uid)
//       Alert.alert("Report Submitted", "Thank you for reporting this post.")
//     } catch (error) {
//       console.error("Report post error:", error)
//       Alert.alert("Error", "Unable to report post. Please try again.")
//     }
//   }

//   const cardBackgroundColor = colorScheme === "dark" ? "#000" : "#FFFFFF"
//   const textColor = colorScheme === "dark" ? "#FFFFFF" : "#171616"
//   const secondaryTextColor = colorScheme === "dark" ? "#B2B3B2" : "#6C6C6D"
//   const borderColor = colorScheme === "dark" ? "#333333" : "#E5E7EB"

//   return (
//     <View>
//       {isHotPost && <HotPostBanner onPress={() => router.push(`/postDetailView/${post.id}`)} />}

//       <View
//         style={{
//           backgroundColor: cardBackgroundColor,
//           padding: 16,
//           marginBottom: 8,
//           // borderRadius: 12,
//           // borderWidth: isHotPost ? 2 : 1,
//           borderColor: isHotPost ? "#FF4747" : borderColor,
//           // shadowColor: "#000",
//           // shadowOffset: { width: 0, height: 2 },
//           // shadowOpacity: 0.1,
//           shadowRadius: 4,
//           elevation: 2,
//         }}
//       >
//         {/* Header with Three-Dot Menu */}
//         <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
//           <View style={{ flexDirection: "row", alignItems: "center" }}>
//             <Image
//               source={{ uri: post.userAvatar || DEFAULT_AVATAR }}
//               style={{
//                 width: 40,
//                 height: 40,
//                 borderRadius: 20,
//                 marginRight: 12,
//                 borderWidth: 2,
//                 borderColor: isHotPost ? "#FF4747" : theme.accent,
//               }}
//             />
//             <View>
//               <Text
//                 style={{
//                   fontWeight: "bold",
//                   fontSize: 16,
//                   color: isHotPost ? "#FF4747" : textColor,
//                 }}
//               >
//                 {post.userName}
//                 {isHotPost && <Text style={{ fontSize: 12, color: "#FF4747", marginLeft: 8 }}>{" 🔥 Hot Post"}</Text>}
//               </Text>
//               <Text style={{ fontSize: 12, color: secondaryTextColor }}>{formatTimestamp(post.createdAt)}</Text>
//             </View>
//           </View>

//           <TouchableOpacity onPress={() => setShowOptionsMenu(true)}>
//             <Ionicons name="ellipsis-vertical" size={20} color={isHotPost ? "#FF4747" : secondaryTextColor} />
//           </TouchableOpacity>
//         </View>

//         {/* Post Content */}
//         <TouchableOpacity
//           onPress={() => router.push(`/postDetailView/${post.id}`)}
//           style={
//             isHotPost
//               ? {
//                   backgroundColor: "rgba(255, 71, 71, 0.1)",
//                   padding: 8,
//                   borderRadius: 8,
//                   marginBottom: 16,
//                 }
//               : { marginBottom: 16 }
//           }
//         >
//           <Text
//             style={{
//               color: textColor,
//               fontSize: 15,
//               lineHeight: 22,
//             }}
//             numberOfLines={isDetailView ? undefined : 3}
//           >
//             {post.content}
//           </Text>
//         </TouchableOpacity>

//         {/* Image Grid */}
//         {renderImageGrid()}

//         {/* Stats Section */}
//         <View
//           style={{
//             flexDirection: "row",
//             justifyContent: "space-between",
//             paddingVertical: 8,
//             borderTopWidth: 1,
//             borderTopColor: isHotPost ? "rgba(255, 71, 71, 0.3)" : borderColor,
//             marginTop: 8,
//           }}
//         >
//           <Text
//             style={{
//               fontSize: 12,
//               color: secondaryTextColor,
//             }}
//           >
//             {likes} likes • {comments.length} comments • 👀 {postViews} views
//           </Text>
//         </View>

//         {/* Action Buttons */}
//         <View
//           style={{
//             flexDirection: "row",
//             justifyContent: "space-around",
//             paddingVertical: 8,
//             borderTopWidth: 1,
//             borderTopColor: isHotPost ? "rgba(255, 71, 71, 0.3)" : borderColor,
//           }}
//         >
//           <TouchableOpacity style={{ flexDirection: "row", alignItems: "center" }} onPress={handleLike}>
//             <Ionicons
//               name={isLiked ? "heart" : "heart-outline"}
//               size={24}
//               color={isLiked ? "#FF4444" : secondaryTextColor}
//             />
//             <Text
//               style={{
//                 marginLeft: 8,
//                 color: isLiked ? "#FF4444" : secondaryTextColor,
//                 fontSize: 14,
//               }}
//             >
//               {likes}
//             </Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={{ flexDirection: "row", alignItems: "center" }}
//             onPress={() => router.push(`/postDetailView/${post.id}`)}
//           >
//             <Ionicons name="chatbubble-outline" size={24} color={secondaryTextColor} />
//             <Text
//               style={{
//                 marginLeft: 8,
//                 color: secondaryTextColor,
//                 fontSize: 14,
//               }}
//             >
//               {comments.length}
//             </Text>
//           </TouchableOpacity>

//           <TouchableOpacity style={{ flexDirection: "row", alignItems: "center" }} onPress={handleShare}>
//             <Ionicons name="share-social-outline" size={24} color={secondaryTextColor} />
//             {shareCount > 0 && (
//               <Text
//                 style={{
//                   marginLeft: 8,
//                   color: secondaryTextColor,
//                   fontSize: 14,
//                 }}
//               >
//                 {shareCount}
//               </Text>
//             )}
//           </TouchableOpacity>
//         </View>

//         {/* Modals */}
//         <OptionsMenu />
//         <ImageModal imageUrl={selectedImage} onClose={() => setSelectedImage(null)} />
//       </View>
//     </View>
//   )
// }

// export default PostCard


// import { useState, useEffect } from "react"
// import { View, Text, Image, TouchableOpacity, Dimensions, Alert, Modal, Share, useColorScheme } from "react-native"
// import { LinearGradient } from "expo-linear-gradient"
// import { Ionicons } from "@expo/vector-icons"
// import { useNavigation } from "@react-navigation/native"
// import { useAuth } from "../context/authContext"
// import {
//   addComment,
//   getComments,
//   addLike,
//   removeLike,
//   getLikes,
//   incrementViews,
//   getViews,
//   deletePost,
//   reportPost,
//   fetchHotPosts,
//   incrementShareCount,
//   getShareCount,
//   savePost,
//   unsavePost,
//   getSavedPosts,
// } from "../app/(apis)/post"
// import { router } from "expo-router"
// import { TapGestureHandler, State } from "react-native-gesture-handler"

// const { width, height } = Dimensions.get("window")

// // Use a publicly accessible default avatar image
// const DEFAULT_AVATAR = "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"

// // Fallback local image (you'll need to add this to your project assets)
// const FALLBACK_AVATAR = require("../assets/images/Default.webp") // Add a default avatar image to your project

// const MAX_COMMENT_LENGTH = 500

// // Theme colors for light and dark mode
// const lightTheme = {
//   background: "#FFFFFF",
//   cardBackground: "#F8F9FA",
//   text: "#171616",
//   textSecondary: "#6C6C6D",
//   border: "#E5E7EB",
//   accent: "#6366F1",
//   skeleton: "#E0E0E0",
// }

// const darkTheme = {
//   background: "#121212",
//   cardBackground: "#1E1E1E",
//   text: "#FFFFFF",
//   textSecondary: "#B2B3B2",
//   border: "#333333",
//   accent: "#6366F1",
//   skeleton: "#333333",
// }

// // Timestamp Formatting Utility
// const formatTimestamp = (timestamp) => {
//   if (!timestamp) return ""

//   const now = new Date()
//   const date = timestamp instanceof Date ? timestamp : new Date(timestamp)
//   const diffMs = now - date
//   const diffMins = Math.floor(diffMs / 60000)
//   const diffHrs = Math.floor(diffMins / 60)
//   const diffDays = Math.floor(diffHrs / 24)

//   if (diffMins < 1) return "just now"
//   if (diffMins < 60) return `${diffMins}m ago`
//   if (diffHrs < 24) return `${diffHrs}h ago`
//   if (diffDays < 7) return `${diffDays}d ago`

//   return date.toLocaleDateString()
// }

// // Hot Post Banner Component
// const HotPostBanner = ({ onPress }) => {
//   const [hotPosts, setHotPosts] = useState([])
//   const colorScheme = useColorScheme()
//   const theme = colorScheme === "dark" ? darkTheme : lightTheme

//   useEffect(() => {
//     const loadHotPosts = async () => {
//       const posts = await fetchHotPosts()
//       setHotPosts(posts)
//     }
//     loadHotPosts()
//   }, [])

//   return hotPosts.length > 0 ? (
//     <TouchableOpacity onPress={onPress}>
//       <LinearGradient colors={["#FF6B6B", "#FF4747"]} className="rounded-lg p-4 mb-4 shadow-lg flex-row items-center">
//         <Ionicons name="flame" size={24} color="white" />
//         <Text className="text-white font-bold ml-2 text-lg">Hot Post of the Week</Text>
//       </LinearGradient>
//     </TouchableOpacity>
//   ) : null
// }

// // Skeleton Loading Component
// const SkeletonLoader = ({ theme }) => (
//   <View style={{ padding: 16, marginBottom: 8 }}>
//     <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
//       <View
//         style={{
//           width: 40,
//           height: 40,
//           borderRadius: 20,
//           backgroundColor: theme.skeleton,
//           marginRight: 12,
//         }}
//       />
//       <View style={{ flex: 1 }}>
//         <View
//           style={{
//             width: "60%",
//             height: 16,
//             backgroundColor: theme.skeleton,
//             borderRadius: 4,
//             marginBottom: 8,
//           }}
//         />
//         <View
//           style={{
//             width: "40%",
//             height: 12,
//             backgroundColor: theme.skeleton,
//             borderRadius: 4,
//           }}
//         />
//       </View>
//     </View>
//     <View style={{ marginBottom: 16 }}>
//       <View
//         style={{
//           width: "80%",
//           height: 20,
//           backgroundColor: theme.skeleton,
//           borderRadius: 4,
//           marginBottom: 8,
//         }}
//       />
//       <View
//         style={{
//           width: "100%",
//           height: 16,
//           backgroundColor: theme.skeleton,
//           borderRadius: 4,
//           marginBottom: 4,
//         }}
//       />
//       <View
//         style={{
//           width: "100%",
//           height: 16,
//           backgroundColor: theme.skeleton,
//           borderRadius: 4,
//         }}
//       />
//     </View>
//     <View
//       style={{
//         width: "100%",
//         height: 200,
//         backgroundColor: theme.skeleton,
//         borderRadius: 8,
//         marginBottom: 16,
//       }}
//     />
//     <View
//       style={{
//         flexDirection: "row",
//         justifyContent: "space-between",
//         paddingVertical: 8,
//         borderTopWidth: 1,
//         borderTopColor: theme.border,
//       }}
//     >
//       <View
//         style={{
//           width: "50%",
//           height: 12,
//           backgroundColor: theme.skeleton,
//           borderRadius: 4,
//         }}
//       />
//     </View>
//   </View>
// )

// const PostCard = ({ post, isDetailView = false, isHotPost = false }) => {
//   const { user } = useAuth()
//   const navigation = useNavigation()
//   const [shareCount, setShareCount] = useState(0)
//   const colorScheme = useColorScheme()
//   const theme = colorScheme === "dark" ? darkTheme : lightTheme

//   // State Management
//   const [isLiked, setIsLiked] = useState(false)
//   const [comments, setComments] = useState([])
//   const [likes, setLikes] = useState(0)
//   const [newComment, setNewComment] = useState("")
//   const [showOptionsMenu, setShowOptionsMenu] = useState(false)
//   const [selectedImage, setSelectedImage] = useState(null)
//   const [postViews, setPostViews] = useState(0)
//   const [isLoading, setIsLoading] = useState(true)
//   const [postTitle, setPostTitle] = useState("")
//   const [postContent, setPostContent] = useState("")
//   const [avatarError, setAvatarError] = useState(false)

//   // Permissions and Ownership
//   const isOwner = post.userId === user?.uid

//   // Split post content into title and body
//   useEffect(() => {
//     if (post?.content) {
//       const contentLines = post.content.split("\n")
//       const title = contentLines[0] || ""
//       const content = contentLines.slice(1).join("\n") || ""
//       setPostTitle(title)
//       setPostContent(content)
//     }
//   }, [post?.content])

//   // Preload images (without caching)
//   useEffect(() => {
//     const preloadImages = async () => {
//       const imageUrls = [
//         post.userAvatar || DEFAULT_AVATAR,
//         ...(post.mediaUrls || []),
//       ].filter(Boolean)

//       const preloadPromises = imageUrls.map((url) => {
//         return new Promise((resolve) => {
//           Image.prefetch(url)
//             .then(() => resolve())
//             .catch((err) => {
//               console.error(`Failed to prefetch image: ${url}`, err)
//               resolve()
//             })
//         })
//       })

//       await Promise.all(preloadPromises)
//     }

//     preloadImages()
//   }, [post.userAvatar, post.mediaUrls])

//   const handleShare = async () => {
//     try {
//       const shareContent = `${postTitle}${postContent ? "\n\n" + postContent : ""}`
//       const result = await Share.share({
//         message: shareContent,
//       })
//       if (result.action === Share.sharedAction) {
//         await incrementShareCount(post.id)
//         setShareCount((prev) => prev + 1)
//       }
//     } catch (error) {
//       Alert.alert("Error", "Failed to share post")
//     }
//   }

//   // Image Grid Rendering Method
//   const renderImageGrid = () => {
//     if (!post?.mediaUrls?.length) return null

//     const images = post.mediaUrls
//     const imageCount = images.length

//     return (
//       <View className="mt-3 rounded-lg overflow-hidden">
//         {imageCount === 1 && (
//           <TouchableOpacity onPress={() => setSelectedImage(images[0])}>
//             <Image source={{ uri: images[0] }} className="w-full h-72 rounded-lg" resizeMode="cover" />
//           </TouchableOpacity>
//         )}

//         {imageCount === 2 && (
//           <View className="flex-row">
//             {images.map((url, index) => (
//               <TouchableOpacity key={index} onPress={() => setSelectedImage(url)} className="flex-1 h-60 p-0.5">
//                 <Image source={{ uri: url }} className="w-full h-full rounded-lg" resizeMode="cover" />
//               </TouchableOpacity>
//             ))}
//           </View>
//         )}

//         {imageCount === 3 && (
//           <View className="flex-row flex-wrap">
//             <TouchableOpacity onPress={() => setSelectedImage(images[0])} className="w-1/2 h-80 p-0.5">
//               <Image source={{ uri: images[0] }} className="w-full h-full rounded-lg" resizeMode="cover" />
//             </TouchableOpacity>
//             <View className="w-1/2 h-80">
//               <TouchableOpacity onPress={() => setSelectedImage(images[1])} className="w-full h-1/2 p-0.5">
//                 <Image source={{ uri: images[1] }} className="w-full h-full rounded-lg" resizeMode="cover" />
//               </TouchableOpacity>
//               <TouchableOpacity onPress={() => setSelectedImage(images[2])} className="w-full h-1/2 p-0.5">
//                 <Image source={{ uri: images[2] }} className="w-full h-full rounded-lg" resizeMode="cover" />
//               </TouchableOpacity>
//             </View>
//           </View>
//         )}

//         {imageCount >= 4 && (
//           <View className="flex-row flex-wrap">
//             <View className="w-1/2 h-60">
//               <TouchableOpacity onPress={() => setSelectedImage(images[0])} className="w-full h-full p-0.5">
//                 <Image source={{ uri: images[0] }} className="w-full h-full rounded-lg" resizeMode="cover" />
//               </TouchableOpacity>
//             </View>
//             <View className="w-1/2 h-60">
//               <TouchableOpacity onPress={() => setSelectedImage(images[1])} className="w-full h-1/2 p-0.5">
//                 <Image source={{ uri: images[1] }} className="w-full h-full rounded-lg" resizeMode="cover" />
//               </TouchableOpacity>
//               <View className="flex-row h-1/2">
//                 <TouchableOpacity onPress={() => setSelectedImage(images[2])} className="w-1/2 h-full p-0.5">
//                   <Image source={{ uri: images[2] }} className="w-full h-full rounded-lg" resizeMode="cover" />
//                 </TouchableOpacity>
//                 <TouchableOpacity onPress={() => setSelectedImage(images[3])} className="w-1/2 h-full p-0.5 relative">
//                   <Image source={{ uri: images[3] }} className="w-full h-full rounded-lg" resizeMode="cover" />
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
//     )
//   }

//   // Full Image Modal with Double-Tap to Zoom
//   const ImageModal = ({ imageUrl, onClose }) => {
//     const [scale, setScale] = useState(1)

//     const onDoubleTap = (event) => {
//       if (event.nativeEvent.state === State.ACTIVE) {
//         setScale(scale === 1 ? 2 : 1) // Toggle between 1x and 2x zoom
//       }
//     }

//     return (
//       <Modal transparent={true} visible={!!imageUrl} onRequestClose={onClose}>
//         <View className="flex-1 bg-black/80 items-center justify-center">
//           <TouchableOpacity onPress={onClose} className="absolute top-10 right-5 z-50">
//             <Ionicons name="close" size={30} color="white" />
//           </TouchableOpacity>
//           <TapGestureHandler
//             onHandlerStateChange={onDoubleTap}
//             numberOfTaps={2}
//           >
//             <Image
//               source={{ uri: imageUrl }}
//               className="w-full h-[70%]"
//               resizeMode="contain"
//               style={{ transform: [{ scale }] }}
//             />
//           </TapGestureHandler>
//         </View>
//       </Modal>
//     )
//   }

//   // Options Menu
//   const OptionsMenu = () => (
//     <Modal transparent={true} visible={showOptionsMenu} onRequestClose={() => setShowOptionsMenu(false)}>
//       <TouchableOpacity className="flex-1 bg-black/50" activeOpacity={1} onPress={() => setShowOptionsMenu(false)}>
//         <View
//           className="absolute top-10 right-5"
//           style={{
//             backgroundColor: theme.cardBackground,
//             borderRadius: 12,
//             shadowColor: "#000",
//             shadowOffset: { width: 0, height: 2 },
//             shadowOpacity: 0.2,
//             shadowRadius: 4,
//             elevation: 5,
//           }}
//         >
//           {isOwner ? (
//             <>
//               <TouchableOpacity
//                 className="p-4 border-b"
//                 style={{ borderBottomColor: theme.border }}
//                 onPress={() => {
//                   handleDeletePost()
//                   setShowOptionsMenu(false)
//                 }}
//               >
//                 <Text style={{ color: "#F43F5E" }}>Delete Post</Text>
//               </TouchableOpacity>
//               <TouchableOpacity
//                 className="p-4"
//                 onPress={() => {
//                   // Edit post logic
//                   setShowOptionsMenu(false)
//                 }}
//               >
//                 <Text style={{ color: theme.text }}>Edit Post</Text>
//               </TouchableOpacity>
//             </>
//           ) : (
//             <TouchableOpacity
//               className="p-4"
//               onPress={() => {
//                 handleReportPost()
//                 setShowOptionsMenu(false)
//               }}
//             >
//               <Text style={{ color: "#F43F5E" }}>Report Post</Text>
//             </TouchableOpacity>
//           )}
//         </View>
//       </TouchableOpacity>
//     </Modal>
//   )

//   // Fetch Initial Data (without caching)
//   useEffect(() => {
//     const fetchInitialData = async () => {
//       try {
//         setIsLoading(true)

//         const fetchedComments = await getComments(post.id)
//         setComments(fetchedComments)

//         const fetchedLikes = await getLikes(post.id)
//         setLikes(fetchedLikes.length)
//         const userLiked = fetchedLikes.some((like) => like.userId === user?.uid)
//         setIsLiked(userLiked)

//         const fetchedViews = await getViews(post.id)
//         setPostViews(fetchedViews)

//         const fetchedShareCount = await getShareCount(post.id)
//         setShareCount(fetchedShareCount || 0)
//       } catch (error) {
//         console.error("Error fetching initial data:", error)
//       } finally {
//         setIsLoading(false)
//       }
//     }

//     fetchInitialData()
//   }, [post.id, user])

//   // View Tracking
//   useEffect(() => {
//     const trackPostView = async () => {
//       try {
//         await incrementViews(post.id, user?.uid)
//       } catch (error) {
//         console.error("Error tracking post view:", error)
//       }
//     }

//     trackPostView()
//   }, [post.id, user?.uid])

//   const handleLike = async () => {
//     try {
//       const fetchedLikes = await getLikes(post.id)
//       const userHasLiked = fetchedLikes.some((like) => like.userId === user?.uid)

//       if (userHasLiked) {
//         // Unlike the post
//         await removeLike(post.id, user)
//         setLikes((prev) => Math.max(0, prev - 1))
//         setIsLiked(false)
//       } else {
//         // Like the post
//         await addLike(post.id, user)
//         setLikes((prev) => prev + 1)
//         setIsLiked(true)
//       }
//     } catch (error) {
//       console.error("Like error:", error)
//       Alert.alert("Error", "Unable to process like. Please try again.")
//     }
//   }

//   const handleAddComment = async () => {
//     if (!newComment.trim()) return

//     try {
//       const commentData = {
//         content: newComment,
//         userId: user.uid,
//         userName: user.displayName || "Anonymous",
//         userAvatar: user.photoURL || DEFAULT_AVATAR,
//         timestamp: new Date(),
//       }

//       await addComment(post.id, commentData)
//       setNewComment("")

//       const updatedComments = await getComments(post.id)
//       setComments(updatedComments)
//     } catch (error) {
//       console.error("Comment error:", error)
//       Alert.alert("Error", "Unable to post comment. Please try again.")
//     }
//   }

//   const handleDeletePost = async () => {
//     try {
//       await deletePost(post.id) // This should also delete associated likes, saves, and reports (handled in backend)
//       Alert.alert("Success", "Post deleted successfully")
//     } catch (error) {
//       console.error("Delete post error:", error)
//       Alert.alert("Error", "Unable to delete post. Please try again.")
//     }
//   }

//   const handleReportPost = async () => {
//     try {
//       await reportPost(post.id, user.uid, "Inappropriate content") // Add a reason field
//       Alert.alert("Report Submitted", "Thank you for reporting this post.")
//     } catch (error) {
//       console.error("Report post error:", error)
//       Alert.alert("Error", "Unable to report post. Please try again.")
//     }
//   }

//   const cardBackgroundColor = colorScheme === "dark" ? "#121212" : "#FFFFFF"
//   const textColor = colorScheme === "dark" ? "#FFFFFF" : "#171616"
//   const secondaryTextColor = colorScheme === "dark" ? "#B2B3B2" : "#6C6C6D"
//   const borderColor = colorScheme === "dark" ? "#333333" : "#E5E7EB"

//   if (isLoading) {
//     return <SkeletonLoader theme={theme} />
//   }

//   return (
//     <View>
//       {isHotPost && <HotPostBanner onPress={() => router.push(`/postDetailView/${post.id}`)} />}

//       <View
//         style={{
//           backgroundColor: cardBackgroundColor,
//           padding: 16,
//           marginBottom: 8,
//           borderColor: isHotPost ? "#FF4747" : borderColor,
//           shadowRadius: 4,
//           elevation: 2,
//         }}
//       >
//         {/* Header with College, User, and Timestamp */}
//         <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
//           <View style={{ flexDirection: "row", alignItems: "center" }}>
//             <Image
//               source={avatarError ? FALLBACK_AVATAR : { uri: post.userAvatar || DEFAULT_AVATAR }}
//               style={{
//                 width: 32,
//                 height: 32,
//                 borderRadius: 16,
//                 marginRight: 8,
//                 borderWidth: 1,
//                 borderColor: isHotPost ? "#FF4747" : theme.accent,
//               }}
//               onError={() => setAvatarError(true)}
//             />
//             <View>
//               <Text
//                 style={{
//                   fontSize: 12,
//                   color: secondaryTextColor,
//                 }}
//               >
//                 c/{post.college} • {post.userName} • {formatTimestamp(post.createdAt)}
//               </Text>
//             </View>
//           </View>

//           <TouchableOpacity onPress={() => setShowOptionsMenu(true)}>
//             <Ionicons name="ellipsis-vertical" size={20} color={isHotPost ? "#FF4747" : secondaryTextColor} />
//           </TouchableOpacity>
//         </View>

//         {/* Post Content with Title and Body */}
//         <TouchableOpacity
//           onPress={() => router.push(`/postDetailView/${post.id}`)}
//           style={
//             isHotPost
//               ? {
//                   backgroundColor: "rgba(255, 71, 71, 0.1)",
//                   padding: 8,
//                   borderRadius: 8,
//                   marginBottom: 8,
//                 }
//               : { marginBottom: 8 }
//           }
//         >
//           {post.title ? (
//             <Text
//               style={{
//                 color: textColor,
//                 fontSize: 16,
//                 fontWeight: "bold",
//                 marginBottom: 4,
//               }}
//             >
//               {post.title }
//             </Text>
//           ) : null}
//           {postContent ? (
//             <Text
//               style={{
//                 color: textColor,
//                 fontSize: 14,
//                 lineHeight: 20,
//                 fontWeight: "400",
//               }}
//               numberOfLines={isDetailView ? undefined : 3}
//             >
//               {postContent}
//             </Text>
//           ) : null}
//         </TouchableOpacity>

//         {/* Image Grid */}
//         {renderImageGrid()}

//         {/* Action Buttons */}
//         <View
//           style={{
//             flexDirection: "row",
//             justifyContent: "space-between",
//             paddingVertical: 8,
//             borderTopWidth: 1,
//             borderTopColor: isHotPost ? "rgba(255, 71, 71, 0.3)" : borderColor,
//           }}
//         >
//           <View style={{ flexDirection: "row", alignItems: "center" }}>
//             <TouchableOpacity style={{ flexDirection: "row", alignItems: "center", marginRight: 16 }} onPress={handleLike}>
//               <Ionicons
//                 name={isLiked ? "heart" : "heart-outline"}
//                 size={20}
//                 color={isLiked ? "#FF4444" : secondaryTextColor}
//               />
//               <Text
//                 style={{
//                   marginLeft: 4,
//                   color: isLiked ? "#FF4444" : secondaryTextColor,
//                   fontSize: 12,
//                 }}
//               >
//                 {likes}
//               </Text>
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={{ flexDirection: "row", alignItems: "center" }}
//               onPress={() => router.push(`/postDetailView/${post.id}`)}
//             >
//               <Ionicons name="chatbubble-outline" size={20} color={secondaryTextColor} />
//               <Text
//                 style={{
//                   marginLeft: 4,
//                   color: secondaryTextColor,
//                   fontSize: 12,
//                 }}
//               >
//                 {comments.length}
//               </Text>
//             </TouchableOpacity>
//           </View>

//           <TouchableOpacity style={{ flexDirection: "row", alignItems: "center" }} onPress={handleShare}>
//             <Ionicons name="share-social-outline" size={20} color={secondaryTextColor} />
//             {shareCount > 0 && (
//               <Text
//                 style={{
//                   marginLeft: 4,
//                   color: secondaryTextColor,
//                   fontSize: 12,
//                 }}
//               >
//                 {shareCount}
//               </Text>
//             )}
//           </TouchableOpacity>
//         </View>

//         <OptionsMenu />
//         <ImageModal imageUrl={selectedImage} onClose={() => setSelectedImage(null)} />
//       </View>
//     </View>
//   )
// }

// // Backend Models and API Endpoints (Pseudo-code for Firebase Firestore)

// // Add/Delete Post
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

// // const getSavedPosts = async (userId) => {
// //   try {
// //     const snapshot = await firestore
// //       .collection("savedPosts")
// //       .where("userId", "==", userId)
// //       .get()
// //     const savedPosts = []
// //     for (const doc of snapshot.docs) {
// //       const postData = await firestore.collection("posts").doc(doc.data().postId).get()
// //       if (postData.exists) {
// //         savedPosts.push({ id: postData.id, ...postData.data() })
// //       }
// //     }
// //     return savedPosts
// //   } catch (error) {
// //     console.error("Error fetching saved posts:", error)
// //     throw error
// //   }
// // }

// export default PostCard


// import { useState, useEffect } from "react"
// import { View, Text, Image, TouchableOpacity, Dimensions, Alert, Modal, Share, useColorScheme } from "react-native"
// import { LinearGradient } from "expo-linear-gradient"
// import { Ionicons } from "@expo/vector-icons"
// import { useNavigation } from "@react-navigation/native"
// import { useAuth } from "../context/authContext"
// import {
//   addComment,
//   getComments,
//   addLike,
//   removeLike,
//   getLikes,
//   incrementViews,
//   getViews,
//   deletePost,
//   reportPost,
//   fetchHotPosts,
//   incrementShareCount,
//   getShareCount,
//   savePost,
//   unsavePost,
//   getSavedPosts,
// } from "../(apis)/post"
// import { router } from "expo-router"

// const { width, height } = Dimensions.get("window")
// const DEFAULT_AVATAR =
//   "https://imgs.search.brave.com/cyPQcxgehDcXav9Isw-S2VR9bVSe0jC0LWy2wW-Rlzk/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly9pY29u/cy52ZXJ5aWNvbi5j/b20vcG5nLzEyOC9o/ZWFsdGhjYXRlLW1lZGlj/YWwvaGVhbHRoeS10/YWl6aG91LWxpbmVh/ci1pY29uLWxpYnJh/cnktdW5kZXIvZGVmYXVs/dC1hdmF0YXItNC5w/bmc"
// const MAX_COMMENT_LENGTH = 500

// // Theme colors for light and dark mode
// const lightTheme = {
//   background: "#FFFFFF",
//   cardBackground: "#F8F9FA",
//   text: "#171616",
//   textSecondary: "#6C6C6D",
//   border: "#E5E7EB",
//   accent: "#6366F1",
// }

// const darkTheme = {
//   background: "#121212",
//   cardBackground: "#1E1E1E",
//   text: "#FFFFFF",
//   textSecondary: "#B2B3B2",
//   border: "#333333",
//   accent: "#6366F1",
// }

// // Timestamp Formatting Utility
// const formatTimestamp = (timestamp) => {
//   if (!timestamp) return ""

//   const now = new Date()
//   const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
//   const diffMs = now - date
//   const diffMins = Math.floor(diffMs / 60000)
//   const diffHrs = Math.floor(diffMins / 60)
//   const diffDays = Math.floor(diffHrs / 24)

//   if (diffMins < 1) return "just now"
//   if (diffMins < 60) return `${diffMins}m ago`
//   if (diffHrs < 24) return `${diffHrs}h ago`
//   if (diffDays < 7) return `${diffDays}d ago`

//   return date.toLocaleDateString()
// }

// // Hot Post Banner Component
// const HotPostBanner = ({ onPress }) => {
//   const [hotPosts, setHotPosts] = useState([])
//   const colorScheme = useColorScheme()
//   const theme = colorScheme === "dark" ? darkTheme : lightTheme

//   useEffect(() => {
//     const loadHotPosts = async () => {
//       const posts = await fetchHotPosts()
//       setHotPosts(posts)
//     }
//     loadHotPosts()
//   }, [])

//   return hotPosts.length > 0 ? (
//     <TouchableOpacity onPress={onPress}>
//       <LinearGradient colors={["#FF6B6B", "#FF4747"]} className="rounded-lg p-4 mb-4 shadow-lg flex-row items-center">
//         <Ionicons name="flame" size={24} color="white" />
//         <Text className="text-white font-bold ml-2 text-lg">Hot Post of the Week</Text>
//       </LinearGradient>
//     </TouchableOpacity>
//   ) : null
// }

// const PostCard = ({ post, isDetailView = false, isHotPost = false }) => {
//   const { user } = useAuth()
//   const navigation = useNavigation()
//   const [shareCount, setShareCount] = useState(0)
//   const colorScheme = useColorScheme()
//   const theme = colorScheme === "dark" ? darkTheme : lightTheme
//   const [isLikeProcessing, setIsLikeProcessing] = useState(false);

//   // State Management
//   const [isLiked, setIsLiked] = useState(false)
//   const [isSaved, setIsSaved] = useState(false)
//   const [comments, setComments] = useState([])
//   const [likes, setLikes] = useState(0)
//   const [newComment, setNewComment] = useState("")
//   const [showOptionsMenu, setShowOptionsMenu] = useState(false)
//   const [selectedImage, setSelectedImage] = useState(null)
//   const [postViews, setPostViews] = useState(0)
//   const [zoomLevel, setZoomLevel] = useState(1)
//   const [islocation,setIsLoading]=useState(false)
//   // Permissions and Ownership
//   const isOwner = post.userId === user?.uid

//   const handleShare = async () => {
//     try {
//       // Only share title and description, not images
//       const result = await Share.share({
//         title: post.title || `${post.userName}'s KLiqq`,
//         message: `${post.title ? post.title + '\n\n' : ''}${post.content}\n\nShared via kliq:Student networking App`,
//       })
//       if (result.action === Share.sharedAction) {
//         await incrementShareCount(post.id)
//         setShareCount((prev) => prev + 1)
//       }
//     } catch (error) {
//       Alert.alert("Error", "Failed to share post")
//     }
//   }

//   // Save/Unsave Post
//   const handleSavePost = async () => {
//     try {
//       if (isSaved) {
//         await unsavePost(post.id, user.uid)
//         setIsSaved(false)
//       } else {
//         await savePost(post.id, user.uid)
//         setIsSaved(true)
//       }
//     } catch (error) {
//       console.error("Save post error:", error)
//       Alert.alert("Error", "Unable to save post. Please try again.")
//     }
//   }

//   // Image Grid Rendering Method
//   const renderImageGrid = () => {
//     if (!post?.mediaUrls?.length) return null

//     const images = post.mediaUrls
//     const imageCount = images.length

//     return (
//       <View className="mt-3 rounded-lg overflow-hidden">
//         {imageCount === 1 && (
//           <TouchableOpacity 
//             onPress={() => setSelectedImage(images[0])}
//             onLongPress={() => Alert.alert("Image Options", "Would you like to save this image?", [
//               { text: "Cancel", style: "cancel" },
//               { text: "Save", onPress: () => console.log("Save image functionality to be implemented") }
//             ])}
//           >
//             <Image source={{ uri: images[0] }} className="w-full h-72 rounded-lg" resizeMode="cover" />
//           </TouchableOpacity>
//         )}

//         {imageCount === 2 && (
//           <View className="flex-row">
//             {images.map((url, index) => (
//               <TouchableOpacity key={index} onPress={() => setSelectedImage(url)} className="flex-1 h-60 p-0.5">
//                 <Image source={{ uri: url }} className="w-full h-full rounded-lg" resizeMode="cover" />
//               </TouchableOpacity>
//             ))}
//           </View>
//         )}

//         {imageCount === 3 && (
//           <View className="flex-row flex-wrap">
//             <TouchableOpacity onPress={() => setSelectedImage(images[0])} className="w-1/2 h-80 p-0.5">
//               <Image source={{ uri: images[0] }} className="w-full h-full rounded-lg" resizeMode="cover" />
//             </TouchableOpacity>
//             <View className="w-1/2 h-80">
//               <TouchableOpacity onPress={() => setSelectedImage(images[1])} className="w-full h-1/2 p-0.5">
//                 <Image source={{ uri: images[1] }} className="w-full h-full rounded-lg" resizeMode="cover" />
//               </TouchableOpacity>
//               <TouchableOpacity onPress={() => setSelectedImage(images[2])} className="w-full h-1/2 p-0.5">
//                 <Image source={{ uri: images[2] }} className="w-full h-full rounded-lg" resizeMode="cover" />
//               </TouchableOpacity>
//             </View>
//           </View>
//         )}

//         {imageCount >= 4 && (
//           <View className="flex-row flex-wrap">
//             <View className="w-1/2 h-60">
//               <TouchableOpacity onPress={() => setSelectedImage(images[0])} className="w-full h-full p-0.5">
//                 <Image source={{ uri: images[0] }} className="w-full h-full rounded-lg" resizeMode="cover" />
//               </TouchableOpacity>
//             </View>
//             <View className="w-1/2 h-60">
//               <TouchableOpacity onPress={() => setSelectedImage(images[1])} className="w-full h-1/2 p-0.5">
//                 <Image source={{ uri: images[1] }} className="w-full h-full rounded-lg" resizeMode="cover" />
//               </TouchableOpacity>
//               <View className="flex-row h-1/2">
//                 <TouchableOpacity onPress={() => setSelectedImage(images[2])} className="w-1/2 h-full p-0.5">
//                   <Image source={{ uri: images[2] }} className="w-full h-full rounded-lg" resizeMode="cover" />
//                 </TouchableOpacity>
//                 <TouchableOpacity onPress={() => setSelectedImage(images[3])} className="w-1/2 h-full p-0.5 relative">
//                   <Image source={{ uri: images[3] }} className="w-full h-full rounded-lg" resizeMode="cover" />
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
//     )
//   }

//   // Full Image Modal with double-tap zoom
//   const ImageModal = ({ imageUrl, onClose }) => {
//     const handleDoubleTap = () => {
//       setZoomLevel(zoomLevel === 1 ? 2 : 1)
//     }

//     let lastTap = null
//     const handleTap = () => {
//       const now = Date.now()
//       if (lastTap && (now - lastTap) < 300) {
//         handleDoubleTap()
//       }
//       lastTap = now
//     }

//     return (
//       <Modal transparent={true} visible={!!imageUrl} onRequestClose={onClose}>
//         <View className="flex-1 bg-black/80 items-center justify-center">
//           <TouchableOpacity onPress={onClose} className="absolute top-10 right-5 z-50">
//             <Ionicons name="close" size={30} color="white" />
//           </TouchableOpacity>
//           <TouchableOpacity activeOpacity={1} onPress={handleTap} className="w-full h-full items-center justify-center">
//             <Image 
//               source={{ uri: imageUrl }} 
//               style={{ 
//                 width: width, 
//                 height: height * 0.7,
//                 transform: [{ scale: zoomLevel }]
//               }} 
//               resizeMode="contain" 
//             />
//           </TouchableOpacity>
//         </View>
//       </Modal>
//     )
//   }

//   // Options Menu
//   const OptionsMenu = () => (
//     <Modal transparent={true} visible={showOptionsMenu} onRequestClose={() => setShowOptionsMenu(false)}>
//       <TouchableOpacity className="flex-1 bg-black/50" activeOpacity={1} onPress={() => setShowOptionsMenu(false)}>
//         <View
//           className="absolute top-10 right-5"
//           style={{
//             backgroundColor: theme.cardBackground,
//             borderRadius: 12,
//             shadowColor: "#000",
//             shadowOffset: { width: 0, height: 2 },
//             shadowOpacity: 0.2,
//             shadowRadius: 4,
//             elevation: 5,
//           }}
//         >
//           {isOwner ? (
//             <>
//               <TouchableOpacity
//                 className="p-4 border-b"
//                 style={{ borderBottomColor: theme.border }}
//                 onPress={() => {
//                   handleDeletePost()
//                   setShowOptionsMenu(false)
//                 }}
//               >
//                 <Text style={{ color: "#F43F5E" }}>Delete Post</Text>
//               </TouchableOpacity>
//               <TouchableOpacity
//                 className="p-4"
//                 onPress={() => {
//                   // Edit post logic
//                   setShowOptionsMenu(false)
//                 }}
//               >
//                 <Text style={{ color: theme.text }}>Edit Post</Text>
//               </TouchableOpacity>
//             </>
//           ) : (
//             <>
//               <TouchableOpacity
//                 className="p-4 border-b"
//                 style={{ borderBottomColor: theme.border }}
//                 onPress={() => {
//                   handleReportPost()
//                   setShowOptionsMenu(false)
//                 }}
//               >
//                 <Text style={{ color: "#F43F5E" }}>Report Post</Text>
//               </TouchableOpacity>
//               <TouchableOpacity
//                 className="p-4"
//                 onPress={() => {
//                   handleSavePost()
//                   setShowOptionsMenu(false)
//                 }}
//               >
//                 <Text style={{ color: theme.text }}>{isSaved ? "Unsave Post" : "Save Post"}</Text>
//               </TouchableOpacity>
//             </>
//           )}
//         </View>
//       </TouchableOpacity>
//     </Modal>
//   )

//   // Fetch Initial Data
//   useEffect(() => {
//     const fetchInitialData = async () => {
//       try {
//         // Fetch Comments
//         setIsLoading(true)
//         const fetchedComments = await getComments(post.id)
//         setComments(fetchedComments)

//         // Fetch Likes
//         const fetchedLikes = await getLikes(post.id)
//         setLikes(fetchedLikes.length)

//         // Check if User has Liked
//         const userLiked = fetchedLikes.some((like) => like.userId === user?.uid)
//         setIsLiked(userLiked)

//         // Fetch Views
//         const fetchedViews = await getViews(post.id)
//         setPostViews(fetchedViews)

//         // Fetch Share Count
//         const fetchedShareCount = await getShareCount(post.id)
//         setShareCount(fetchedShareCount || 0)
         
//         setIsLoading(false)
//         // Check if post is saved by user
//         // const savedPosts = await getSavedPosts(user?.uid)
//         // setIsSaved(savedPosts.some(savedPost => savedPost.postId === post.id))
//       } catch (error) {
//         console.error("Error fetching initial data:", error)
//       }
//     }

//     fetchInitialData()
//   }, [post.id, user])

//   // View Tracking
//   const SkeletonLoader = ({ theme }) => (
//     <View 
//       style={{
//         backgroundColor: theme.cardBackground,
//         padding: 16,
//         marginBottom: 8,
//         borderRadius: 8,
//       }}
//     >
//       {/* Header Skeleton - Profile and Name */}
//       <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
//         <View
//           style={{
//             width: 40,
//             height: 40,
//             borderRadius: 20,
//             backgroundColor: theme.border,
//             marginRight: 12,
//           }}
//         />
//         <View style={{ flex: 1 }}>
//           <View
//             style={{
//               width: "50%",
//               height: 14,
//               backgroundColor: theme.border,
//               borderRadius: 4,
//               marginBottom: 6,
//             }}
//           />
//           <View
//             style={{
//               width: "30%",
//               height: 10,
//               backgroundColor: theme.border,
//               borderRadius: 4,
//             }}
//           />
//         </View>
//         <View
//           style={{
//             width: 20,
//             height: 20,
//             borderRadius: 10,
//             backgroundColor: theme.border,
//           }}
//         />
//       </View>
      
//       {/* Content Text Skeleton */}
//       <View style={{ marginBottom: 12 }}>
//         <View
//           style={{
//             width: "90%",
//             height: 10,
//             backgroundColor: theme.border,
//             borderRadius: 4,
//             marginBottom: 6,
//           }}
//         />
//         <View
//           style={{
//             width: "100%",
//             height: 10,
//             backgroundColor: theme.border,
//             borderRadius: 4,
//             marginBottom: 6,
//           }}
//         />
//         <View
//           style={{
//             width: "80%",
//             height: 10,
//             backgroundColor: theme.border,
//             borderRadius: 4,
//           }}
//         />
//       </View>
      
//       {/* Image Placeholder Skeleton - Main Post Content */}
//       <View
//         style={{
//           width: "100%",
//           height: 240,
//           backgroundColor: theme.border,
//           borderRadius: 8,
//           marginBottom: 16,
//         }}
//       />
      
//       {/* Action Buttons Skeleton */}
//       <View
//         style={{
//           flexDirection: "row",
//           justifyContent: "space-around",
//           paddingVertical: 8,
//           borderTopWidth: 1,
//           borderTopColor: theme.border,
//         }}
//       >
//         {/* Like, Comment, Share and Save Buttons */}
//         {[1, 2, 3, 4].map((item) => (
//           <View key={item} style={{ flexDirection: "row", alignItems: "center" }}>
//             <View 
//               style={{
//                 width: 24,
//                 height: 24,
//                 borderRadius: 12,
//                 backgroundColor: theme.border,
//               }}
//             />
//             <View
//               style={{
//                 width: 16,
//                 height: 14,
//                 backgroundColor: theme.border,
//                 borderRadius: 4,
//                 marginLeft: 8,
//               }}
//             />
//           </View>
//         ))}
//       </View>
//     </View>
//   );
  

//   if (islocation) {
//     return <SkeletonLoader theme={theme} />
//   }

//   const handleLike = async () => {
//     if (!user) {
//       Alert.alert("Sign In Required", "Please sign in to like posts");
//       return;
//     }
    
//     // Prevent multiple rapid clicks by disabling interaction temporarily
//     if (isLikeProcessing) return;
    
//     try {
//       setIsLikeProcessing(true); // Add this state to track like processing
      
//       if (isLiked) {
//         await removeLike(post.id, user);
//         setLikes((prev) => Math.max(0, prev - 1));
//         setIsLiked(false);
//       } else {
//         await addLike(post.id, user);
//         setLikes((prev) => prev + 1);
//         setIsLiked(true);
//       }
//     } catch (error) {
//       console.error("Like error:", error);
//       Alert.alert("Error", "Unable to process like. Please try again.");
//     } finally {
//       // Allow new like actions after a short delay
//       setTimeout(() => {
//         setIsLikeProcessing(false);
//       }, 500);
//     }
//   };
  

//   // Handle Like Method
//   // const handleLike = async () => {
//   //   if (!user) {
//   //     Alert.alert("Sign In Required", "Please sign in to like posts")
//   //     return
//   //   }
    
//   //   try {
//   //     if (isLiked) {
//   //       await removeLike(post.id, user)
//   //       setLikes((prev) => Math.max(0, prev - 1))
//   //     } else {
//   //       await addLike(post.id, user)
//   //       setLikes((prev) => prev + 1)
//   //     }
//   //     setIsLiked(!isLiked)
//   //   } catch (error) {
//   //     console.error("Like error:", error)
//   //     Alert.alert("Error", "Unable to process like. Please try again.")
//   //   }
//   // }

//   // Handle Comment Method
//   const handleAddComment = async () => {
//     if (!newComment.trim()) return
//     if (!user) {
//       Alert.alert("Sign In Required", "Please sign in to comment")
//       return
//     }

//     try {
//       const commentData = {
//         content: newComment,
//         userId: user.uid,
//         userName: user.displayName || "Anonymous",
//         userAvatar: user.photoURL || DEFAULT_AVATAR,
//         timestamp: new Date(),
//       }

//       await addComment(post.id, commentData)
//       setNewComment("")

//       // Refresh comments
//       const updatedComments = await getComments(post.id)
//       setComments(updatedComments)
//     } catch (error) {
//       console.error("Comment error:", error)
//       Alert.alert("Error", "Unable to post comment. Please try again.")
//     }
//   }

//   // Delete Post Method
//   const handleDeletePost = async () => {
//     try {
//       await deletePost(post.id)
//       Alert.alert("Success", "Post deleted successfully")
//       // Optional: Navigate back or refresh list
//     } catch (error) {
//       console.error("Delete post error:", error)
//       Alert.alert("Error", "Unable to delete post. Please try again.")
//     }
//   }

//   // Report Post Method
//   const handleReportPost = async () => {
//     if (!user) {
//       Alert.alert("Sign In Required", "Please sign in to report posts")
//       return
//     }
    
//     try {
//       Alert.alert(
//         "Report Post",
//         "Why are you reporting this post?",
//         [
//           { 
//             text: "Cancel", 
//             style: "cancel" 
//           },
//           {
//             text: "Inappropriate Content",
//             onPress: () => submitReport("inappropriate_content")
//           },
//           {
//             text: "Spam",
//             onPress: () => submitReport("spam")
//           },
//           {
//             text: "Harassment",
//             onPress: () => submitReport("harassment")
//           }
//         ]
//       )
//     } catch (error) {
//       console.error("Report post error:", error)
//       Alert.alert("Error", "Unable to report post. Please try again.")
//     }
//   }

//   const submitReport = async (reason) => {
//     try {
//       await reportPost(post.id, user.uid, reason)
//       Alert.alert("Report Submitted", "Thank you for reporting this post.")
//     } catch (error) {
//       console.error("Submit report error:", error)
//       Alert.alert("Error", "Unable to submit report. Please try again.")
//     }
//   }

//   const cardBackgroundColor = colorScheme === "dark" ? "#000" : "#FFFFFF"
//   const textColor = colorScheme === "dark" ? "#FFFFFF" : "#171616"
//   const secondaryTextColor = colorScheme === "dark" ? "#B2B3B2" : "#6C6C6D"
//   const borderColor = colorScheme === "dark" ? "#333333" : "#E5E7EB"

//   return (
//     <View>
//       {isHotPost && <HotPostBanner onPress={() => router.push(`/postDetailView/${post.id}`) } />}

//       <View
//         style={{
//           backgroundColor: cardBackgroundColor,
//           padding: 16,
//           marginBottom: 8,
//           borderColor: isHotPost ? "#FF4747" : borderColor,
//           shadowRadius: 4,
//           elevation: 2,
//         }}
//       >
//         {/* Header with Three-Dot Menu */}
//         <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
//           <View style={{ flexDirection: "row", alignItems: "center" }}>
//             <Image
//               source={{ uri: post.userAvatar || DEFAULT_AVATAR }}
//               style={{
//                 width: 40,
//                 height: 40,
//                 borderRadius: 20,
//                 marginRight: 12,
//                 borderWidth: 2,
//                 borderColor: isHotPost ? "#FF4747" : theme.accent,
//               }}
//             />
//             <View>
//               <Text
//                 style={{
//                   fontWeight: "bold",
//                   fontSize: 16,
//                   color: isHotPost ? "#FF4747" : textColor,
//                 }}
//               >
//                 {post.userName}
//                 {isHotPost && <Text style={{ fontSize: 12, color: "#FF4747", marginLeft: 8 }}>{" 🔥 Hot Post"}</Text>}
//               </Text>
//               <Text style={{ fontSize: 12, color: secondaryTextColor }}>{formatTimestamp(post.createdAt)}</Text>
//             </View>
//           </View>

//           <TouchableOpacity onPress={() => setShowOptionsMenu(true)}>
//             <Ionicons name="ellipsis-vertical" size={20} color={isHotPost ? "#FF4747" : secondaryTextColor} />
//           </TouchableOpacity>
//         </View>

//         {/* Post Title - NEW ADDITION */}
//         {post.title && (
//           <TouchableOpacity onPress={() => router.push(`/postDetailView/${post.id}`)}>
//             <Text
//               style={{
//                 fontSize: 18,
//                 fontWeight: "700",
//                 color: textColor,
//                 marginBottom: 8,
//               }}
//             >
//               {post.title}
//             </Text>
//           </TouchableOpacity>
//         )}

//         {/* Post Content */}
//         <TouchableOpacity
//           onPress={() => router.push(`/postDetailView/${post.id}`)}
//           style={
//             isHotPost
//               ? {
//                   backgroundColor: "rgba(255, 71, 71, 0.1)",
//                   padding: 8,
//                   borderRadius: 8,
//                   marginBottom: 16,
//                 }
//               : { marginBottom: 16 }
//           }
//         >
//           <Text
//             style={{
//               color: secondaryTextColor,  // Changed to secondary color for content
//               fontSize: 15,
//               lineHeight: 22,
//             }}
//             numberOfLines={isDetailView ? undefined : 3}
//           >
//             {post.content}
//           </Text>
//         </TouchableOpacity>

      
//         {renderImageGrid()}

//         {/* Action Buttons */}
//         <View
//           style={{
//             flexDirection: "row",
//             justifyContent: "space-around",
//             paddingVertical: 8,
//             borderTopWidth: 1,
//             borderTopColor: isHotPost ? "rgba(255, 71, 71, 0.3)" : borderColor,
//           }}
//         >
//           <TouchableOpacity style={{ flexDirection: "row", alignItems: "center" }} onPress={handleLike}>
//             <Ionicons
//               name={isLiked ? "heart" : "heart-outline"}
//               size={24}
//               color={isLiked ? "#FF4444" : secondaryTextColor}
//             />
//             <Text
//               style={{
//                 marginLeft: 8,
//                 color: isLiked ? "#FF4444" : secondaryTextColor,
//                 fontSize: 14,
//               }}
//             >
//               {likes}
//             </Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={{ flexDirection: "row", alignItems: "center" }}
//             onPress={() => router.push(`/postDetailView/${post.id}`)}
//           >
//             <Ionicons name="chatbubble-outline" size={24} color={secondaryTextColor} />
//             <Text
//               style={{
//                 marginLeft: 8,
//                 color: secondaryTextColor,
//                 fontSize: 14,
//               }}
//             >
//               {comments.length}
//             </Text>
//           </TouchableOpacity>

//           <TouchableOpacity style={{ flexDirection: "row", alignItems: "center" }} onPress={handleShare}>
//             <Ionicons name="share-social-outline" size={24} color={secondaryTextColor} />
//             {shareCount > 0 && (
//               <Text
//                 style={{
//                   marginLeft: 8,
//                   color: secondaryTextColor,
//                   fontSize: 14,
//                 }}
//               >
//                 {shareCount}
//               </Text>
//             )}
//           </TouchableOpacity>

//           <TouchableOpacity style={{ flexDirection: "row", alignItems: "center" }} onPress={handleSavePost}>
//             <Ionicons
//               name={isSaved ? "bookmark" : "bookmark-outline"}
//               size={24}
//               color={isSaved ? theme.accent : secondaryTextColor}
//             />
//           </TouchableOpacity>
//         </View>

//         {/* Modals */}
//         <OptionsMenu />
//         <ImageModal imageUrl={selectedImage} onClose={() => {
//           setSelectedImage(null)
//           setZoomLevel(1) // Reset zoom level when closing
//         }} />
//       </View>
//     </View>
//   )
// }

// export default PostCard


import { useState, useEffect } from "react";
import { View, Text, Image, TouchableOpacity, Dimensions, Alert, Modal, Share, useColorScheme } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../context/authContext";
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
} from "../(apis)/post";
import { router } from "expo-router";

const { width, height } = Dimensions.get("window");
const DEFAULT_AVATAR =
  "https://imgs.search.brave.com/cyPQcxgehDcXav9Isw-S2VR9bVSe0jC0LWy2wW-Rlzk/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly9pY29u/cy52ZXJ5aWNvbi5j/b20vcG5nLzEyOC9o/ZWFsdGhjYXRlLW1lZGlj/YWwvaGVhbHRoeS10/YWl6aG91LWxpbmVh/ci1pY29uLWxpYnJh/cnktdW5kZXIvZGVmYXVs/dC1hdmF0YXItNC5w/bmc";
const MAX_COMMENT_LENGTH = 500;

// Theme colors for light and dark mode
const lightTheme = {
  background: "#FFFFFF",
  cardBackground: "#F8F9FA",
  text: "#171616",
  textSecondary: "#6C6C6D",
  border: "#E5E7EB",
  accent: "#6366F1",
};

const darkTheme = {
  background: "#121212",
  cardBackground: "#1E1E1E",
  text: "#FFFFFF",
  textSecondary: "#B2B3B2",
  border: "#333333",
  accent: "#6366F1",
};

// Timestamp Formatting Utility
const formatTimestamp = (timestamp) => {
  if (!timestamp) return "";

  const now = new Date();
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHrs / 24);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHrs < 24) return `${diffHrs}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
};

// Hot Post Banner Component
const HotPostBanner = ({ onPress }) => {
  const [hotPosts, setHotPosts] = useState([]);
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? darkTheme : lightTheme;

  useEffect(() => {
    const loadHotPosts = async () => {
      const posts = await fetchHotPosts();
      setHotPosts(posts);
    };
    loadHotPosts();
  }, []);

  return hotPosts.length > 0 ? (
    <TouchableOpacity onPress={onPress}>
      <LinearGradient colors={["#FF6B6B", "#FF4747"]} className="rounded-lg p-4 mb-4 shadow-lg flex-row items-center">
        <Ionicons name="flame" size={24} color="white" />
        <Text className="text-white font-bold ml-2 text-lg">Hot Post of the Week</Text>
      </LinearGradient>
    </TouchableOpacity>
  ) : null;
};

const PostCard = ({ post, isDetailView = false, isHotPost = false }) => {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [shareCount, setShareCount] = useState(0);
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? darkTheme : lightTheme;
  const [isLikeProcessing, setIsLikeProcessing] = useState(false);

  // State Management
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [comments, setComments] = useState([]);
  const [likes, setLikes] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [postViews, setPostViews] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  // Permissions and Ownership
  const isOwner = post.userId === user?.uid;

  const handleShare = async () => {
    try {
      const result = await Share.share({
        title: post.title || `${post.userName}'s KLiqq`,
        message: `${post.title ? post.title + '\n\n' : ''}${post.content}\n\nShared via kliq:Student networking App`,
      });
      if (result.action === Share.sharedAction) {
        await incrementShareCount(post.id);
        setShareCount((prev) => prev + 1);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to share post");
    }
  };

  const handleSavePost = async () => {
    try {
      if (isSaved) {
        await unsavePost(post.id, user.uid);
        setIsSaved(false);
      } else {
        await savePost(post.id, user.uid);
        setIsSaved(true);
      }
    } catch (error) {
      console.error("Save post error:", error);
      Alert.alert("Error", "Unable to save post. Please try again.");
    }
  };

  const renderImageGrid = () => {
    if (!post?.mediaUrls?.length) return null;

    const images = post.mediaUrls;
    const imageCount = images.length;

    return (
      <View className="mt-3 rounded-lg overflow-hidden">
        {imageCount === 1 && (
          <TouchableOpacity
            onPress={() => setSelectedImage(images[0])}
            onLongPress={() =>
              Alert.alert("Image Options", "Would you like to save this image?", [
                { text: "Cancel", style: "cancel" },
                { text: "Save", onPress: () => console.log("Save image functionality to be implemented") },
              ])
            }
          >
            <Image source={{ uri: images[0] }} className="w-full h-72 rounded-lg" resizeMode="cover" />
          </TouchableOpacity>
        )}

        {imageCount === 2 && (
          <View className="flex-row">
            {images.map((url, index) => (
              <TouchableOpacity key={index} onPress={() => setSelectedImage(url)} className="flex-1 h-60 p-0.5">
                <Image source={{ uri: url }} className="w-full h-full rounded-lg" resizeMode="cover" />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {imageCount === 3 && (
          <View className="flex-row flex-wrap">
            <TouchableOpacity onPress={() => setSelectedImage(images[0])} className="w-1/2 h-80 p-0.5">
              <Image source={{ uri: images[0] }} className="w-full h-full rounded-lg" resizeMode="cover" />
            </TouchableOpacity>
            <View className="w-1/2 h-80">
              <TouchableOpacity onPress={() => setSelectedImage(images[1])} className="w-full h-1/2 p-0.5">
                <Image source={{ uri: images[1] }} className="w-full h-full rounded-lg" resizeMode="cover" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setSelectedImage(images[2])} className="w-full h-1/2 p-0.5">
                <Image source={{ uri: images[2] }} className="w-full h-full rounded-lg" resizeMode="cover" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {imageCount >= 4 && (
          <View className="flex-row flex-wrap">
            <View className="w-1/2 h-60">
              <TouchableOpacity onPress={() => setSelectedImage(images[0])} className="w-full h-full p-0.5">
                <Image source={{ uri: images[0] }} className="w-full h-full rounded-lg" resizeMode="cover" />
              </TouchableOpacity>
            </View>
            <View className="w-1/2 h-60">
              <TouchableOpacity onPress={() => setSelectedImage(images[1])} className="w-full h-1/2 p-0.5">
                <Image source={{ uri: images[1] }} className="w-full h-full rounded-lg" resizeMode="cover" />
              </TouchableOpacity>
              <View className="flex-row h-1/2">
                <TouchableOpacity onPress={() => setSelectedImage(images[2])} className="w-1/2 h-full p-0.5">
                  <Image source={{ uri: images[2] }} className="w-full h-full rounded-lg" resizeMode="cover" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setSelectedImage(images[3])} className="w-1/2 h-full p-0.5 relative">
                  <Image source={{ uri: images[3] }} className="w-full h-full rounded-lg" resizeMode="cover" />
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

  const ImageModal = ({ imageUrl, onClose }) => {
    const handleDoubleTap = () => {
      setZoomLevel(zoomLevel === 1 ? 2 : 1);
    };

    let lastTap = null;
    const handleTap = () => {
      const now = Date.now();
      if (lastTap && (now - lastTap) < 300) {
        handleDoubleTap();
      }
      lastTap = now;
    };

    return (
      <Modal transparent={true} visible={!!imageUrl} onRequestClose={onClose}>
        <View className="flex-1 bg-black/80 items-center justify-center" style={{ zIndex: 4000 }}>
          <TouchableOpacity onPress={onClose} className="absolute top-10 right-5 z-50">
            <Ionicons name="close" size={30} color="white" />
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={1} onPress={handleTap} className="w-full h-full items-center justify-center">
            <Image
              source={{ uri: imageUrl }}
              style={{
                width: width,
                height: height * 0.7,
                transform: [{ scale: zoomLevel }],
              }}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      </Modal>
    );
  };

  const OptionsMenu = () => (
    <Modal transparent={true} visible={showOptionsMenu} onRequestClose={() => setShowOptionsMenu(false)}>
      <TouchableOpacity className="flex-1 bg-black/50" activeOpacity={1} onPress={() => setShowOptionsMenu(false)}>
        <View
          className="absolute top-10 right-5"
          style={{
            backgroundColor: theme.cardBackground,
            borderRadius: 12,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 5,
            zIndex: 5000,
          }}
        >
          {isOwner ? (
            <>
              <TouchableOpacity
                className="p-4 border-b"
                style={{ borderBottomColor: theme.border }}
                onPress={() => {
                  handleDeletePost();
                  setShowOptionsMenu(false);
                }}
              >
                <Text style={{ color: "#F43F5E" }}>Delete Post</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="p-4"
                onPress={() => {
                  setShowOptionsMenu(false);
                }}
              >
                <Text style={{ color: theme.text }}>Edit Post</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity
                className="p-4 border-b"
                style={{ borderBottomColor: theme.border }}
                onPress={() => {
                  handleReportPost();
                  setShowOptionsMenu(false);
                }}
              >
                <Text style={{ color: "#F43F5E" }}>Report Post</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="p-4"
                onPress={() => {
                  handleSavePost();
                  setShowOptionsMenu(false);
                }}
              >
                <Text style={{ color: theme.text }}>{isSaved ? "Unsave Post" : "Save Post"}</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </TouchableOpacity>
    </Modal>
  );

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsLoading(true);
        const fetchedComments = await getComments(post.id);
        setComments(fetchedComments);

        const fetchedLikes = await getLikes(post.id);
        setLikes(fetchedLikes.length);

        const userLiked = fetchedLikes.some((like) => like.userId === user?.uid);
        setIsLiked(userLiked);

        const fetchedViews = await getViews(post.id);
        setPostViews(fetchedViews);

        const fetchedShareCount = await getShareCount(post.id);
        setShareCount(fetchedShareCount || 0);

        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching initial data:", error);
      }
    };

    fetchInitialData();
  }, [post.id, user]);

  const SkeletonLoader = ({ theme }) => (
    <View
      style={{
        backgroundColor: theme.cardBackground,
        padding: 16,
        marginBottom: 8,
        borderRadius: 8,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: theme.border,
            marginRight: 12,
          }}
        />
        <View style={{ flex: 1 }}>
          <View
            style={{
              width: "50%",
              height: 14,
              backgroundColor: theme.border,
              borderRadius: 4,
              marginBottom: 6,
            }}
          />
          <View
            style={{
              width: "30%",
              height: 10,
              backgroundColor: theme.border,
              borderRadius: 4,
            }}
          />
        </View>
        <View
          style={{
            width: 20,
            height: 20,
            borderRadius: 10,
            backgroundColor: theme.border,
          }}
        />
      </View>

      <View style={{ marginBottom: 12 }}>
        <View
          style={{
            width: "90%",
            height: 10,
            backgroundColor: theme.border,
            borderRadius: 4,
            marginBottom: 6,
          }}
        />
        <View
          style={{
            width: "100%",
            height: 10,
            backgroundColor: theme.border,
            borderRadius: 4,
            marginBottom: 6,
          }}
        />
        <View
          style={{
            width: "80%",
            height: 10,
            backgroundColor: theme.border,
            borderRadius: 4,
          }}
        />
      </View>

      <View
        style={{
          width: "100%",
          height: 240,
          backgroundColor: theme.border,
          borderRadius: 8,
          marginBottom: 16,
        }}
      />

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-around",
          paddingVertical: 8,
          borderTopWidth: 1,
          borderTopColor: theme.border,
        }}
      >
        {[1, 2, 3, 4].map((item) => (
          <View key={item} style={{ flexDirection: "row", alignItems: "center" }}>
            <View
              style={{
                width: 24,
                height: 24,
                borderRadius: 12,
                backgroundColor: theme.border,
              }}
            />
            <View
              style={{
                width: 16,
                height: 14,
                backgroundColor: theme.border,
                borderRadius: 4,
                marginLeft: 8,
              }}
            />
          </View>
        ))}
      </View>
    </View>
  );

  if (isLoading) {
    return <SkeletonLoader theme={theme} />;
  }

  const handleLike = async () => {
    if (!user) {
      Alert.alert("Sign In Required", "Please sign in to like posts");
      return;
    }

    if (isLikeProcessing) return;

    try {
      setIsLikeProcessing(true);

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
      setTimeout(() => {
        setIsLikeProcessing(false);
      }, 500);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    if (!user) {
      Alert.alert("Sign In Required", "Please sign in to comment");
      return;
    }

    try {
      const commentData = {
        content: newComment,
        userId: user.uid,
        userName: user.displayName || "Anonymous",
        userAvatar: user.photoURL || DEFAULT_AVATAR,
        timestamp: new Date(),
      };

      await addComment(post.id, commentData);
      setNewComment("");

      const updatedComments = await getComments(post.id);
      setComments(updatedComments);
    } catch (error) {
      console.error("Comment error:", error);
      Alert.alert("Error", "Unable to post comment. Please try again.");
    }
  };

  const handleDeletePost = async () => {
    try {
      await deletePost(post.id);
      Alert.alert("Success", "Post deleted successfully");
    } catch (error) {
      console.error("Delete post error:", error);
      Alert.alert("Error", "Unable to delete post. Please try again.");
    }
  };

  const handleReportPost = async () => {
    if (!user) {
      Alert.alert("Sign In Required", "Please sign in to report posts");
      return;
    }

    try {
      Alert.alert(
        "Report Post",
        "Why are you reporting this post?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Inappropriate Content", onPress: () => submitReport("inappropriate_content") },
          { text: "Spam", onPress: () => submitReport("spam") },
          { text: "Harassment", onPress: () => submitReport("harassment") },
        ]
      );
    } catch (error) {
      console.error("Report post error:", error);
      Alert.alert("Error", "Unable to report post. Please try again.");
    }
  };

  const submitReport = async (reason) => {
    try {
      await reportPost(post.id, user.uid, reason);
      Alert.alert("Report Submitted", "Thank you for reporting this post.");
    } catch (error) {
      console.error("Submit report error:", error);
      Alert.alert("Error", "Unable to submit report. Please try again.");
    }
  };

  const cardBackgroundColor = colorScheme === "dark" ? "#000" : "#FFFFFF";
  const textColor = colorScheme === "dark" ? "#FFFFFF" : "#171616";
  const secondaryTextColor = colorScheme === "dark" ? "#B2B3B2" : "#6C6C6D";
  const borderColor = colorScheme === "dark" ? "#333333" : "#E5E7EB";

  return (
    <View>
      {isHotPost && <HotPostBanner onPress={() => router.push(`/postDetailView/${post.id}`)} />}

      <View
        style={{
          backgroundColor: cardBackgroundColor,
          padding: 16,
          marginBottom: 8,
          borderColor: isHotPost ? "#FF4747" : borderColor,
          shadowRadius: 4,
          elevation: 2,
        }}
      >
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Image
              source={{ uri: post.userAvatar || DEFAULT_AVATAR }}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                marginRight: 12,
                borderWidth: 2,
                borderColor: isHotPost ? "#FF4747" : theme.accent,
              }}
            />
            <View>
              <Text
                style={{
                  fontWeight: "bold",
                  fontSize: 16,
                  color: isHotPost ? "#FF4747" : textColor,
                }}
              >
                {post.userName}
                {isHotPost && <Text style={{ fontSize: 12, color: "#FF4747", marginLeft: 8 }}>{" 🔥 Hot Post"}</Text>}
              </Text>
              <Text style={{ fontSize: 12, color: secondaryTextColor }}>{formatTimestamp(post.createdAt)}</Text>
            </View>
          </View>

          <TouchableOpacity onPress={() => setShowOptionsMenu(true)}>
            <Ionicons name="ellipsis-vertical" size={20} color={isHotPost ? "#FF4747" : secondaryTextColor} />
          </TouchableOpacity>
        </View>

        {post.title && (
          <TouchableOpacity onPress={() => router.push(`/postDetailView/${post.id}`)}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "700",
                color: textColor,
                marginBottom: 8,
              }}
            >
              {post.title}
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={() => router.push(`/postDetailView/${post.id}`)}
          style={
            isHotPost
              ? {
                  backgroundColor: "rgba(255, 71, 71, 0.1)",
                  padding: 8,
                  borderRadius: 8,
                  marginBottom: 16,
                }
              : { marginBottom: 16 }
          }
        >
          <Text
            style={{
              color: secondaryTextColor,
              fontSize: 15,
              lineHeight: 22,
            }}
            numberOfLines={isDetailView ? undefined : 3}
          >
            {post.content}
          </Text>
        </TouchableOpacity>

        {renderImageGrid()}

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-around",
            paddingVertical: 8,
            borderTopWidth: 1,
            borderTopColor: isHotPost ? "rgba(255, 71, 71, 0.3)" : borderColor,
          }}
        >
          <TouchableOpacity style={{ flexDirection: "row", alignItems: "center" }} onPress={handleLike}>
            <Ionicons
              name={isLiked ? "heart" : "heart-outline"}
              size={24}
              color={isLiked ? "#FF4444" : secondaryTextColor}
            />
            <Text
              style={{
                marginLeft: 8,
                color: isLiked ? "#FF4444" : secondaryTextColor,
                fontSize: 14,
              }}
            >
              {likes}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{ flexDirection: "row", alignItems: "center" }}
            onPress={() => router.push(`/postDetailView/${post.id}`)}
          >
            <Ionicons name="chatbubble-outline" size={24} color={secondaryTextColor} />
            <Text
              style={{
                marginLeft: 8,
                color: secondaryTextColor,
                fontSize: 14,
              }}
            >
              {comments.length}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={{ flexDirection: "row", alignItems: "center" }} onPress={handleShare}>
            <Ionicons name="share-social-outline" size={24} color={secondaryTextColor} />
            {shareCount > 0 && (
              <Text
                style={{
                  marginLeft: 8,
                  color: secondaryTextColor,
                  fontSize: 14,
                }}
              >
                {shareCount}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={{ flexDirection: "row", alignItems: "center" }} onPress={handleSavePost}>
            <Ionicons
              name={isSaved ? "bookmark" : "bookmark-outline"}
              size={24}
              color={isSaved ? theme.accent : secondaryTextColor}
            />
          </TouchableOpacity>
        </View>

        <OptionsMenu />
        <ImageModal
          imageUrl={selectedImage}
          onClose={() => {
            setSelectedImage(null);
            setZoomLevel(1);
          }}
        />
      </View>
    </View>
  );
};

export default PostCard;