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
  Pressable,
  Alert,
  Animated,
  Switch
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
import { LinearGradient } from 'expo-linear-gradient';

const COLORS = {
  background: '#000000',
  cardBg: '#000000',
  text: '#FFFFFF',
  textSecondary: '#E5E5E5',
  textMuted: '#A1A1AA',
  inputBg: '#1A1A1A',
  accent: '#8B5CF6',
  like: '#8B5CF6',
  success: '#10B981',
  shadow: 'rgba(139, 92, 246, 0.15)',
};

export default function PostDetailView() {
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
  const [isSaved, setIsSaved] = useState(false);
  const [likes, setLikes] = useState(0);
  const [isLikeProcessing, setIsLikeProcessing] = useState(false);
  const scrollViewRef = useRef();
  const commentInputRef = useRef();

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
          setLikes(userLikes.length);
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

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    
    const now = new Date();
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHrs = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHrs / 24);
    
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHrs < 24) return `${diffHrs}h`;
    if (diffDays < 7) return `${diffDays}d`;
    
    return date.toLocaleDateString();
  };

  const renderImageGrid = () => {
    if (!post?.mediaUrls?.length) return null;

    const images = post.mediaUrls;
    const imageCount = images.length;
    
    return (
      <View style={{ marginTop: 16, borderRadius: 20, overflow: 'hidden' }}>
        {imageCount === 1 && (
          <TouchableOpacity onPress={() => setSelectedImage(images[0])}>
            <Image 
              source={{ uri: images[0] }} 
              style={{ width: '100%', height: 300, borderRadius: 20 }}
              resizeMode="cover"
            />
          </TouchableOpacity>
        )}
        
        {imageCount === 2 && (
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {images.map((url, index) => (
              <TouchableOpacity 
                key={index} 
                onPress={() => setSelectedImage(url)}
                style={{ flex: 1, height: 240 }}
              >
                <Image 
                  source={{ uri: url }} 
                  style={{ width: '100%', height: '100%', borderRadius: 16 }}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            ))}
          </View>
        )}
        
        {/* Add more image layouts as needed */}
      </View>
    );
  };

  const renderCommentItem = (item, isReply = false) => {
    const isOwnComment = item.uid === user?.uid;
    const [showAllReplies, setShowAllReplies] = useState(false);
    const repliesToShow = showAllReplies ? item.replies : item.replies?.slice(0, 1) || [];
    const hasMoreReplies = item.replies && item.replies.length > 1;
    
    return (
      <View 
        key={item.id} 
        style={{
          backgroundColor: COLORS.cardBg,
          marginBottom: 10,
          marginLeft: isReply ? 28 : 0,
          borderRadius: 16,
          padding: 16,
          shadowColor: COLORS.shadow,
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.4,
          shadowRadius: 6,
          elevation: 1,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
          <Image 
            source={{ 
              uri: item.isAnonymous 
                ? 'https://cdn-icons-png.flaticon.com/512/149/149071.png' 
                : item.userAvatar || 'https://cdn-icons-png.flaticon.com/512/149/149071.png'
            }} 
            style={{ 
              width: 38, 
              height: 38, 
              borderRadius: 19, 
              marginRight: 12,
            }} 
          />
          
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 3 }}>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                  <Text style={{ 
                    color: COLORS.text, 
                    fontSize: 15, 
                    fontWeight: '700',
                    marginRight: 8
                  }}>
                    {item.isAnonymous ? 'Anonymous' : item.userName}
                  </Text>
                  {isOwnComment && (
                    <View style={{
                      backgroundColor: COLORS.accent,
                      borderRadius: 8,
                      paddingHorizontal: 6,
                      paddingVertical: 2,
                    }}>
                      <Text style={{ color: '#FFF', fontSize: 9, fontWeight: '600' }}>You</Text>
                    </View>
                  )}
                </View>
                <Text style={{ color: COLORS.textSecondary, fontSize: 12, fontWeight: '500' }}>
                  {formatTimestamp(item.timestamp)}
                </Text>
              </View>
              
              {!isReply && (
                <TouchableOpacity 
                  style={{ 
                    flexDirection: 'row', 
                    alignItems: 'center',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                    borderRadius: 14,
                    marginLeft: 8,
                  }}
                  onPress={() => handleReplyPress(item.id, item.isAnonymous ? 'Anonymous' : item.userName)}
                >
                  <Ionicons name="chatbubble-outline" size={13} color={COLORS.textSecondary} />
                  <Text style={{ 
                    color: COLORS.textSecondary, 
                    marginLeft: 4, 
                    fontSize: 11,
                    fontWeight: '600'
                  }}>
                    Reply
                  </Text>
                </TouchableOpacity>
              )}
              
              {isOwnComment && (
                <TouchableOpacity 
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 15,
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginLeft: 8,
                  }}
                >
                  <MaterialIcons name="more-vert" size={16} color={COLORS.textSecondary} />
                </TouchableOpacity>
              )}
            </View>
            
            <Text style={{ 
              color: COLORS.text, 
              fontSize: 15,
              lineHeight: 20,
              marginBottom: 8,
              fontWeight: '400'
            }}>
              {item.content}
            </Text>
          </View>
        </View>
        
        {!isReply && item.replies && item.replies.length > 0 && (
          <View style={{ marginTop: 8 }}>
            {repliesToShow.map(reply => renderCommentItem(reply, true))}
            
            {hasMoreReplies && (
              <TouchableOpacity
                style={{
                  marginTop: 8,
                  paddingVertical: 8,
                  paddingHorizontal: 16,
                  backgroundColor: 'rgba(139, 92, 246, 0.1)',
                  borderRadius: 12,
                  alignSelf: 'flex-start',
                  marginLeft: 50,
                }}
                onPress={() => setShowAllReplies(!showAllReplies)}
              >
                <Text style={{
                  color: COLORS.accent,
                  fontSize: 13,
                  fontWeight: '600'
                }}>
                  {showAllReplies 
                    ? 'Show less' 
                    : `Show ${item.replies.length - 1} more ${item.replies.length - 1 === 1 ? 'reply' : 'replies'}`
                  }
                </Text>
              </TouchableOpacity>
            )}
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

  const handleReplyPress = (commentId, userName) => {
    setReplyingTo({ id: commentId, name: userName });
    setNewComment(`@${userName} `);
    if (commentInputRef.current) {
      commentInputRef.current.focus();
    }
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      const commentData = {
        content: newComment,
        userName: isAnonymous ? 'Anonymous' : (user?.displayName || 'User'),
        userAvatar: isAnonymous ? 'https://cdn-icons-png.flaticon.com/512/149/149071.png' : (user?.photoURL || 'https://cdn-icons-png.flaticon.com/512/149/149071.png'),
        timestamp: serverTimestamp(),
        isAnonymous: isAnonymous,
        uid: user?.uid,
      };

      if (replyingTo) {
        await addDoc(
          collection(db, 'posts', postId, 'comments', replyingTo.id, 'replies'), 
          commentData
        );
        setReplyingTo(null);
      } else {
        await addDoc(collection(db, 'posts', postId, 'comments'), commentData);
      }
      
      setNewComment('');
    } catch (error) {
      console.error('Comment error:', error);
    }
  };

  if (!post) return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ color: COLORS.text, fontSize: 18 }}>Loading...</Text>
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Header */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 20,
          paddingVertical: 16,
          backgroundColor: COLORS.cardBg,
          shadowColor: COLORS.shadow,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.8,
          shadowRadius: 10,
          elevation: 5,
        }}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={{ color: COLORS.text, fontSize: 20, fontWeight: '700' }}>Post</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView 
          ref={scrollViewRef} 
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 120 }}
        >
          {/* Post Card */}
          <View style={{
            backgroundColor: COLORS.cardBg,
            marginHorizontal: 0,
            marginVertical: 20,
            borderRadius: 0,
            shadowColor: COLORS.shadow,
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 1,
            shadowRadius: 20,
            elevation: 8,
          }}>
            {/* User Header */}
            <View style={{ 
              flexDirection: 'row', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              padding: 24,
              paddingBottom: 16
            }}>
              <TouchableOpacity 
                style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}
                onPress={() => router.push(`/profile/${post.userId}`)}
              >
                <Image
                  source={{ uri: post.userAvatar || 'https://cdn-icons-png.flaticon.com/512/149/149071.png' }}
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 28,
                    marginRight: 16,
                  }}
                />
                <View style={{ flex: 1 }}>
                  <Text style={{
                    fontWeight: '700',
                    fontSize: 18,
                    color: COLORS.text,
                    marginBottom: 4,
                  }}>
                    {post.userName}
                  </Text>
                  <Text style={{ fontSize: 15, color: COLORS.textSecondary, fontWeight: '500' }}>
                    {formatTimestamp(post.createdAt)}
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity 
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: 'rgba(255,255,255,0.08)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons 
                  name="ellipsis-horizontal" 
                  size={22} 
                  color={COLORS.textSecondary} 
                />
              </TouchableOpacity>
            </View>

            {/* Post Content */}
            <View style={{ paddingHorizontal: 24, paddingBottom: 16 }}>
              {post.title && (
                <Text style={{
                  fontSize: 22,
                  fontWeight: '800',
                  color: COLORS.text,
                  marginBottom: 16,
                  lineHeight: 30,
                }}>
                  {post.title}
                </Text>
              )}

              <Text style={{
                color: COLORS.text,
                fontSize: 17,
                lineHeight: 26,
                marginBottom: 16,
                fontWeight: '400'
              }}>
                {post.content}
              </Text>
            </View>

            {renderImageGrid()}

            {/* Action Bar */}
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingHorizontal: 24,
              paddingVertical: 20,
              marginTop: 12,
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity 
                  style={{ 
                    flexDirection: 'row', 
                    alignItems: 'center',
                    backgroundColor: isLiked ? 'rgba(139, 92, 246, 0.15)' : 'rgba(255,255,255,0.05)',
                    paddingHorizontal: 18,
                    paddingVertical: 12,
                    borderRadius: 28,
                    marginRight: 16,
                    minWidth: 70,
                    justifyContent: 'center',
                  }} 
                  onPress={handleLike}
                >
                  <Ionicons
                    name={isLiked ? "heart" : "heart-outline"}
                    size={22}
                    color={isLiked ? COLORS.like : COLORS.textSecondary}
                  />
                  {likes > 0 && (
                    <Text style={{
                      marginLeft: 8,
                      color: isLiked ? COLORS.like : COLORS.textSecondary,
                      fontSize: 15,
                      fontWeight: '600',
                    }}>
                      {likes > 999 ? `${(likes / 1000).toFixed(1)}K` : likes}
                    </Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity style={{ 
                  flexDirection: 'row', 
                  alignItems: 'center',
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  paddingHorizontal: 18,
                  paddingVertical: 12,
                  borderRadius: 28,
                  marginRight: 16,
                  minWidth: 70,
                  justifyContent: 'center',
                }}>
                  <Ionicons name="chatbubble-outline" size={20} color={COLORS.textSecondary} />
                  {comments.length > 0 && (
                    <Text style={{
                      marginLeft: 8,
                      color: COLORS.textSecondary,
                      fontSize: 15,
                      fontWeight: '600',
                    }}>
                      {comments.length}
                    </Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity 
                  style={{ 
                    flexDirection: 'row', 
                    alignItems: 'center',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    paddingHorizontal: 18,
                    paddingVertical: 12,
                    borderRadius: 28,
                    minWidth: 70,
                    justifyContent: 'center',
                  }}
                >
                  <Ionicons name="share-outline" size={20} color={COLORS.textSecondary} />
                </TouchableOpacity>
              </View>

              <TouchableOpacity 
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: isSaved ? 'rgba(139, 92, 246, 0.15)' : 'rgba(255,255,255,0.05)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onPress={handleSavePost}
              >
                <Ionicons
                  name={isSaved ? "bookmark" : "bookmark-outline"}
                  size={22}
                  color={isSaved ? COLORS.accent : COLORS.textSecondary}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Comments Section */}
          <View style={{ paddingHorizontal: 20 }}>
            <Text style={{ 
              color: COLORS.text, 
              fontSize: 20, 
              fontWeight: '700', 
              marginBottom: 20 
            }}>
              Comments ({comments.length})
            </Text>
            
            {comments.length > 0 ? (
              comments.map(comment => renderCommentItem(comment))
            ) : (
              <View style={{
                backgroundColor: COLORS.cardBg,
                borderRadius: 20,
                padding: 40,
                alignItems: 'center',
              }}>
                <Ionicons name="chatbubble-outline" size={56} color={COLORS.textSecondary} />
                <Text style={{ 
                  color: COLORS.textSecondary, 
                  fontSize: 18,
                  textAlign: 'center',
                  marginTop: 16,
                  fontWeight: '500'
                }}>
                  No comments yet.{'\n'}Be the first to comment!
                </Text>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Comment Input */}
        <View style={{ 
          paddingHorizontal: 20, 
          paddingVertical: 16, 
          backgroundColor: COLORS.cardBg,
          shadowColor: COLORS.shadow,
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.8,
          shadowRadius: 15,
          elevation: 10,
        }}>
          {replyingTo && (
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: COLORS.inputBg,
              paddingHorizontal: 16,
              paddingVertical: 12,
              borderRadius: 16,
              marginBottom: 12,
            }}>
              <Text style={{ color: COLORS.text, fontSize: 15, fontWeight: '500' }}>
                Replying to <Text style={{ color: COLORS.accent, fontWeight: '700' }}>{replyingTo.name}</Text>
              </Text>
              <TouchableOpacity onPress={() => {
                setReplyingTo(null);
                setNewComment('');
              }}>
                <Ionicons name="close" size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
          )}
          
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Image 
              source={{ 
                uri: isAnonymous 
                  ? 'https://cdn-icons-png.flaticon.com/512/149/149071.png' 
                  : user?.photoURL || 'https://cdn-icons-png.flaticon.com/512/149/149071.png' 
              }} 
              style={{ 
                width: 44, 
                height: 44, 
                borderRadius: 22, 
                marginRight: 16,
              }} 
            />
            
            <View style={{ 
              flex: 1, 
              flexDirection: 'row', 
              alignItems: 'center', 
              backgroundColor: COLORS.inputBg,
              borderRadius: 28,
              paddingLeft: 20,
              paddingRight: 8,
              paddingVertical: 8,
            }}>
              <TextInput
                ref={commentInputRef}
                value={newComment}
                onChangeText={setNewComment}
                placeholder={isAnonymous ? "Comment anonymously..." : "Add a comment..."}
                placeholderTextColor={COLORS.textSecondary}
                style={{ 
                  flex: 1, 
                  color: COLORS.text,
                  fontSize: 16,
                  paddingVertical: 12,
                  fontWeight: '400'
                }}
                multiline
              />
              
              {/* Anonymous Toggle as Checkbox */}
              <TouchableOpacity
                onPress={() => setIsAnonymous(!isAnonymous)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginRight: 12,
                  paddingHorizontal: 8,
                  paddingVertical: 6,
                  backgroundColor: isAnonymous ? 'rgba(139, 92, 246, 0.2)' : 'rgba(255,255,255,0.1)',
                  borderRadius: 16,
                }}
              >
                <Ionicons 
                  name={isAnonymous ? "checkmark-circle" : "ellipse-outline"} 
                  size={16} 
                  color={isAnonymous ? COLORS.accent : COLORS.textSecondary} 
                />
                <Text style={{ 
                  color: isAnonymous ? COLORS.accent : COLORS.textSecondary, 
                  fontSize: 11, 
                  fontWeight: '600',
                  marginLeft: 4
                }}>
                  Anon
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={handleAddComment}
                disabled={!newComment.trim()}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: !newComment.trim() ? 0.5 : 1,
                }}
              >
                <LinearGradient
                  colors={[COLORS.accent, '#A855F7']}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Ionicons name="send" size={20} color="#FFF" />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Image Preview Modal */}
      {selectedImage && (
        <Modal visible={true} transparent={true} animationType="fade">
          <Pressable 
            style={{ 
              flex: 1, 
              backgroundColor: 'rgba(0,0,0,0.95)', 
              justifyContent: 'center', 
              alignItems: 'center' 
            }} 
            onPress={() => setSelectedImage(null)}
          >
            <TouchableOpacity 
              style={{ 
                position: 'absolute', 
                top: 60, 
                right: 24, 
                zIndex: 10,
                backgroundColor: 'rgba(0,0,0,0.7)',
                borderRadius: 24,
                padding: 12,
              }}
              onPress={() => setSelectedImage(null)}
            >
              <Ionicons name="close" size={28} color="white" />
            </TouchableOpacity>
            <Image 
              source={{ uri: selectedImage }} 
              style={{ width: '90%', height: '70%' }}
              resizeMode="contain" 
            />
          </Pressable>
        </Modal>
      )}
    </SafeAreaView>
  );
};