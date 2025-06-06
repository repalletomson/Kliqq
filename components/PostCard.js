import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
  Share,
  useColorScheme,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/authContext';
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
} from '../(apis)/post';

const { width, height } = Dimensions.get('window');
const DEFAULT_AVATAR = 'https://cdn-icons-png.flaticon.com/512/149/149071.png';

// Professional black theme with consistent purple accent
const colors = {
  background: '#000000',
  cardBackground: '#000000',
  text: '#FFFFFF',
  textSecondary: '#E5E5E5',
  textMuted: '#A1A1AA',
  inputBg: '#1A1A1A',
  accent: '#8B5CF6',
  like: '#8B5CF6',
  success: '#10B981',
  shadow: 'rgba(139, 92, 246, 0.15)',
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

  useEffect(() => {
    const loadHotPosts = async () => {
      const posts = await fetchHotPosts();
      setHotPosts(posts);
    };
    loadHotPosts();
  }, []);

  return hotPosts.length > 0 ? (
    <TouchableOpacity onPress={onPress}>
      <LinearGradient colors={[colors.accent, "#A855F7"]} className="rounded-none p-4 mb-4 flex-row items-center">
        <Ionicons name="flame" size={24} color="white" />
        <Text className="text-white font-bold ml-2 text-lg">Hot Post of the Week</Text>
      </LinearGradient>
    </TouchableOpacity>
  ) : null;
};

const PostCard = ({ post, isDetailView = false, isHotPost = false }) => {
  const { user } = useAuth();
  const navigation = useNavigation();
  const router = useRouter();
  const [shareCount, setShareCount] = useState(0);
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
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
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

    // For single image, show without slider
    if (imageCount === 1) {
      return (
        <View className="mt-4 rounded-xl overflow-hidden">
          <TouchableOpacity
            onPress={() => setSelectedImage(images[0])}
            onLongPress={() =>
              Alert.alert("Image Options", "Would you like to save this image?", [
                { text: "Cancel", style: "cancel" },
                { text: "Save", onPress: () => console.log("Save image functionality to be implemented") },
              ])
            }
          >
            <Image source={{ uri: images[0] }} className="w-full h-72 rounded-xl" resizeMode="cover" />
          </TouchableOpacity>
        </View>
      );
    }

    // For multiple images, show Instagram-style slider
    return (
      <View className="mt-4 rounded-xl overflow-hidden relative">
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(event) => {
            const newIndex = Math.round(event.nativeEvent.contentOffset.x / width);
            setCurrentImageIndex(newIndex);
          }}
          scrollEventThrottle={16}
        >
          {images.map((url, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => setSelectedImage(url)}
              style={{ width: width }}
            >
              <Image 
                source={{ uri: url }} 
                style={{ width: width, height: 300 }}
                resizeMode="cover" 
              />
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Image count indicator */}
        <View style={{
          position: 'absolute',
          top: 16,
          right: 16,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          paddingHorizontal: 10,
          paddingVertical: 6,
          borderRadius: 16,
        }}>
          <Text style={{
            color: 'white',
            fontSize: 13,
            fontWeight: '600',
          }}>
            {currentImageIndex + 1}/{imageCount}
          </Text>
        </View>

        {/* Pagination dots */}
        <View style={{
          position: 'absolute',
          bottom: 16,
          left: 0,
          right: 0,
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          {images.map((_, index) => (
            <View
              key={index}
              style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: index === currentImageIndex ? 'white' : 'rgba(255, 255, 255, 0.5)',
                marginHorizontal: 3,
              }}
            />
          ))}
        </View>
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
        <View className="flex-1 bg-black/90 items-center justify-center" style={{ zIndex: 4000 }}>
          <TouchableOpacity onPress={onClose} className="absolute top-12 right-6 z-50">
            <View style={{
              backgroundColor: 'rgba(0,0,0,0.7)',
              borderRadius: 20,
              padding: 8,
            }}>
              <Ionicons name="close" size={24} color="white" />
            </View>
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
          className="absolute top-16 right-6"
          style={{
            backgroundColor: colors.cardBackground,
            borderRadius: 16,
            shadowColor: colors.shadow,
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 1,
            shadowRadius: 20,
            elevation: 10,
            zIndex: 5000,
          }}
        >
          {isOwner ? (
            <>
              <TouchableOpacity
                className="px-6 py-4"
                onPress={() => {
                  handleDeletePost();
                  setShowOptionsMenu(false);
                }}
              >
                <Text style={{ color: "#F87171", fontSize: 16, fontWeight: '600' }}>Delete Post</Text>
              </TouchableOpacity>
              <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginHorizontal: 16 }} />
              <TouchableOpacity
                className="px-6 py-4"
                onPress={() => {
                  setShowOptionsMenu(false);
                }}
              >
                <Text style={{ color: colors.text, fontSize: 16, fontWeight: '600' }}>Edit Post</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity
                className="px-6 py-4"
                onPress={() => {
                  handleReportPost();
                  setShowOptionsMenu(false);
                }}
              >
                <Text style={{ color: "#F87171", fontSize: 16, fontWeight: '600' }}>Report Post</Text>
              </TouchableOpacity>
              <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginHorizontal: 16 }} />
              <TouchableOpacity
                className="px-6 py-4"
                onPress={() => {
                  handleSavePost();
                  setShowOptionsMenu(false);
                }}
              >
                <Text style={{ color: colors.text, fontSize: 16, fontWeight: '600' }}>{isSaved ? "Unsave Post" : "Save Post"}</Text>
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

  const SkeletonLoader = () => (
    <View
      style={{
        backgroundColor: colors.cardBackground,
        padding: 20,
        marginBottom: 12,
        borderRadius: 20,
        marginHorizontal: 16,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: colors.inputBg,
            marginRight: 12,
          }}
        />
        <View style={{ flex: 1 }}>
          <View
            style={{
              width: "60%",
              height: 16,
              backgroundColor: colors.inputBg,
              borderRadius: 8,
              marginBottom: 8,
            }}
          />
          <View
            style={{
              width: "40%",
              height: 12,
              backgroundColor: colors.inputBg,
              borderRadius: 6,
            }}
          />
        </View>
      </View>

      <View style={{ marginBottom: 16 }}>
        <View
          style={{
            width: "90%",
            height: 12,
            backgroundColor: colors.inputBg,
            borderRadius: 6,
            marginBottom: 8,
          }}
        />
        <View
          style={{
            width: "100%",
            height: 12,
            backgroundColor: colors.inputBg,
            borderRadius: 6,
            marginBottom: 8,
          }}
        />
        <View
          style={{
            width: "75%",
            height: 12,
            backgroundColor: colors.inputBg,
            borderRadius: 6,
          }}
        />
      </View>

      <View
        style={{
          width: "100%",
          height: 240,
          backgroundColor: colors.inputBg,
          borderRadius: 16,
          marginBottom: 16,
        }}
      />
    </View>
  );

  if (isLoading) {
    return <SkeletonLoader />;
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

  return (
    <View>
      {isHotPost && <HotPostBanner onPress={() => router.push(`/postDetailView/${post.id}`)} />}

      <View
        style={{
          backgroundColor: colors.cardBackground,
          marginHorizontal: 0,
          marginBottom: 20,
          borderRadius: 0,
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 1,
          shadowRadius: 15,
          elevation: 5,
        }}
      >
        {/* User Header */}
        <View style={{ 
          flexDirection: "row", 
          justifyContent: "space-between", 
          alignItems: "center", 
          padding: 20,
          paddingBottom: 16
        }}>
          <TouchableOpacity 
            style={{ flexDirection: "row", alignItems: "center", flex: 1 }}
            onPress={() => router.push(`/profile/${post.userId}`)}
          >
            <Image
              source={{ uri: post.userAvatar || DEFAULT_AVATAR }}
              style={{
                width: 52,
                height: 52,
                borderRadius: 26,
                marginRight: 14,
              }}
            />
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontWeight: "700",
                  fontSize: 17,
                  color: isHotPost ? colors.accent : colors.text,
                  marginBottom: 3,
                }}
              >
                {post.userName}
                {isHotPost && <Text style={{ fontSize: 14, color: colors.accent, marginLeft: 8 }}>{" 🔥"}</Text>}
              </Text>
              <Text style={{ fontSize: 14, color: colors.textSecondary, fontWeight: '500' }}>
                {formatTimestamp(post.createdAt)}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setShowOptionsMenu(true)}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: "rgba(255,255,255,0.08)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons 
              name="ellipsis-horizontal" 
              size={20} 
              color={colors.textSecondary} 
            />
          </TouchableOpacity>
        </View>

        {/* Post Content */}
        <View style={{ paddingHorizontal: 20, paddingBottom: 16 }}>
        {post.title && (
          <TouchableOpacity onPress={() => router.push(`/postDetailView/${post.id}`)}>
            <Text
              style={{
                fontSize: 20,
                fontWeight: "800",
                color: colors.text,
                marginBottom: 12,
                lineHeight: 26,
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
                  backgroundColor: "rgba(139, 92, 246, 0.1)",
                  padding: 16,
                  borderRadius: 16,
                  marginBottom: 16,
                }
              : { marginBottom: 16 }
          }
        >
          <Text
            style={{
              color: colors.text,
              fontSize: 16,
              lineHeight: 24,
              fontWeight: '400',
            }}
            numberOfLines={isDetailView ? undefined : 3}
          >
            {post.content}
          </Text>
        </TouchableOpacity>
        </View>

        {renderImageGrid()}

        {/* Action Bar */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingHorizontal: 20,
            paddingVertical: 16,
            marginTop: 8,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <TouchableOpacity 
              style={{ 
                flexDirection: "row", 
                alignItems: "center",
                backgroundColor: isLiked ? "rgba(139, 92, 246, 0.15)" : "rgba(255,255,255,0.05)",
                paddingHorizontal: 16,
                paddingVertical: 10,
                borderRadius: 25,
                marginRight: 12,
                minWidth: 60,
                justifyContent: "center",
              }} 
              onPress={handleLike}
            >
            <Ionicons
              name={isLiked ? "heart" : "heart-outline"}
                size={22}
                color={isLiked ? colors.like : colors.textSecondary}
            />
              {likes > 0 && (
            <Text
              style={{
                    marginLeft: 8,
                    color: isLiked ? colors.like : colors.textSecondary,
                    fontSize: 14,
                    fontWeight: "600",
                  }}
                >
                  {likes > 999 ? `${(likes / 1000).toFixed(1)}K` : likes}
            </Text>
              )}
          </TouchableOpacity>

          <TouchableOpacity
              style={{ 
                flexDirection: "row", 
                alignItems: "center",
                backgroundColor: "rgba(255,255,255,0.05)",
                paddingHorizontal: 16,
                paddingVertical: 10,
                borderRadius: 25,
                marginRight: 12,
                minWidth: 60,
                justifyContent: "center",
              }}
            onPress={() => router.push(`/postDetailView/${post.id}`)}
          >
              <Ionicons name="chatbubble-outline" size={20} color={colors.textSecondary} />
              {comments.length > 0 && (
            <Text
              style={{
                    marginLeft: 8,
                color: colors.textSecondary,
                    fontSize: 14,
                    fontWeight: "600",
              }}
            >
              {comments.length}
            </Text>
              )}
          </TouchableOpacity>

            <TouchableOpacity 
              style={{ 
                flexDirection: "row", 
                alignItems: "center",
                backgroundColor: "rgba(255,255,255,0.05)",
                paddingHorizontal: 16,
                paddingVertical: 10,
                borderRadius: 25,
                minWidth: 60,
                justifyContent: "center",
              }} 
              onPress={handleShare}
            >
              <Ionicons name="share-outline" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: isSaved ? "rgba(139, 92, 246, 0.15)" : "rgba(255,255,255,0.05)",
              alignItems: "center",
              justifyContent: "center",
            }}
            onPress={handleSavePost}
          >
            <Ionicons
              name={isSaved ? "bookmark" : "bookmark-outline"}
              size={20}
              color={isSaved ? colors.accent : colors.textSecondary}
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
      
      {/* Light separation line */}
      <View style={{
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        marginHorizontal: 20,
        marginBottom: 16,
      }} />
    </View>
  );
};

export default PostCard;