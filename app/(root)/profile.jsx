import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Image, 
  ScrollView, 
  Alert, 
  ActivityIndicator,
  RefreshControl,
  Modal,
  TextInput,
  Animated,
  Platform,
  StatusBar
} from 'react-native';
import { collection, query, where, getDocs, orderBy, doc, getDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../../config/firebaseConfig';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/authContext';
import { MaterialIcons, Feather, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const HEADER_MAX_HEIGHT = 200; // Maximum height of the header
const HEADER_MIN_HEIGHT = 100;  // Minimum height of the header when scrolled
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

// Color palette
const COLORS = {
  background: '#070606',
  cardBg: '#171616',
  textPrimary: '#FFFFFF',
  textSecondary: '#B2B3B2',
  accent: '#6366F1',
  border: '#6C6C6D'
};

const Profile = () => {
  const [userPosts, setUserPosts] = useState([]);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [showEditPostModal, setShowEditPostModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [editedContent, setEditedContent] = useState('');
  
  const { loginOut } = useAuth();
  const router = useRouter();
  const currentUser = auth.currentUser;

  // Animation for header scroll
  const scrollY = useRef(new Animated.Value(0)).current;
  const headerHeight = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
    extrapolate: 'clamp',
  });

  const headerImageOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
    outputRange: [1, 0.5, 0],
    extrapolate: 'clamp',
  });

  const headerImageSize = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [80, 40],
    extrapolate: 'clamp',
  });

  // Load user data function with error handling
  const loadUserData = async () => {
    try {
      setLoading(true);
      const userRef = doc(db, 'users', currentUser.uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        setUserData(userSnap.data());
      } else {
        Alert.alert('Error', 'User profile not found');
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      Alert.alert('Error', 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  // Load user posts
  const loadUserPosts = async () => {
    try {
      const postsRef = collection(db, 'posts');
      const q = query(
        postsRef,
        where('userId', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const posts = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      
      setUserPosts(posts);
    } catch (error) {
      console.error('Error loading posts:', error);
      Alert.alert('Error', 'Failed to load posts');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Handle post editing
  const handleEditPost = async () => {
    if (!selectedPost || !editedContent.trim()) return;
    
    try {
      await updateDoc(doc(db, 'posts', selectedPost.id), {
        content: editedContent.trim(),
        updatedAt: new Date()
      });
      
      setUserPosts(prev => prev.map(post => 
        post.id === selectedPost.id 
          ? { ...post, content: editedContent.trim() }
          : post
      ));
      
      setShowEditPostModal(false);
      setSelectedPost(null);
      setEditedContent('');
      Alert.alert('Success', 'Post updated successfully');
    } catch (error) {
      console.error('Error updating post:', error);
      Alert.alert('Error', 'Failed to update post');
    }
  };

  // Handle post deletion with confirmation
  const handleDeletePost = async (postId) => {
    Alert.alert(
      'Delete Post',
      'Are you sure you want to delete this post? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'posts', postId));
              setUserPosts(prev => prev.filter(post => post.id !== postId));
              Alert.alert('Success', 'Post deleted successfully');
            } catch (error) {
              console.error('Error deleting post:', error);
              Alert.alert('Error', 'Failed to delete post');
            }
          }
        }
      ]
    );
  };

  // Handle logout with confirmation
  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await loginOut();
              router.replace('/(auth)/welcome');
            } catch (error) {
              console.error('Error during logout:', error);
              Alert.alert('Error', 'Failed to logout');
            }
          }
        }
      ]
    );
  };

  // Refresh handler
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    Promise.all([loadUserData(), loadUserPosts()])
      .finally(() => setRefreshing(false));
  }, []);

  // Initial data loading
  useEffect(() => {
    if (currentUser) {
      loadUserData();
      loadUserPosts();
    }
  }, [currentUser]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
        <ActivityIndicator size="large" color={COLORS.accent} />
        <Text style={{ marginTop: 16, color: COLORS.textSecondary }}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      
      {/* Options button (top right) */}
      <TouchableOpacity 
        onPress={() => setShowOptionsModal(true)}
        style={{ 
          position: 'absolute', 
          top: 40, 
          right: 16, 
          zIndex: 20,
          padding: 8
        }}
      >
        <Feather name="more-vertical" size={24} color={COLORS.textPrimary} />
      </TouchableOpacity>
      
      {/* Scrollable Content */}
      <ScrollView
        style={{ flex: 1 }}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            tintColor={COLORS.accent}
            colors={[COLORS.accent]}
          />
        }
      >
        {/* Header with centered profile image */}
        <View style={{ 
          paddingTop: 60, 
          paddingBottom: 24, 
          alignItems: 'center',
          borderBottomWidth: 1,
          borderBottomColor: COLORS.border
        }}>
          <Animated.Image
            source={{ uri: userData?.profileImage || 'https://imgs.search.brave.com/SRTQLz_BmOq7xwzV7ls7bV62QzMZtDrGSacNS5G1d1A/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly9pY29u/cy52ZXJ5aWNvbi5j/b20vcG5nLzEyOC9t/aXNjZWxsYW5lb3Vz/LzNweC1saW5lYXIt/ZmlsbGV0LWNvbW1v/bi1pY29uL2RlZmF1/bHQtbWFsZS1hdmF0/YXItMS5wbmc' }}
            style={{ 
              width: headerImageSize, 
              height: headerImageSize, 
              borderRadius: 40,  // Half to make it circular
              borderWidth: 2, 
              borderColor: COLORS.accent,
              opacity: headerImageOpacity
            }}
          />
          
          <Text style={{ 
            fontSize: 22, 
            fontWeight: 'bold', 
            color: COLORS.textPrimary,
            marginTop: 16
          }}>
            {userData?.fullName}
          </Text>
          
          <Text style={{ 
            color: COLORS.accent,
            fontSize: 14,
            marginTop: 2,
            fontWeight:'bold'
          }}>
            @{userData?.displayName}
          </Text>
          
          {/* Stats section */}
          <View style={{ 
            flexDirection: 'row',
            justifyContent: 'center',
            marginTop: 20,
            paddingHorizontal: 16,
            width: '100%'
          }}>
            <View style={{ 
              alignItems: 'center',
              paddingHorizontal: 20,
              paddingVertical: 12,
              backgroundColor: COLORS.cardBg,
              borderRadius: 16
            }}>
              <Text style={{ color: COLORS.textPrimary, fontSize: 24, fontWeight: 'bold' }}>
                {userPosts.length}
              </Text>
              <Text style={{ color: COLORS.textSecondary, fontSize: 14 }}>Posts</Text>
            </View>
          </View>
        </View>

        {/* Posts Section Header */}
        <View style={{ 
          paddingHorizontal: 16, 
          paddingVertical: 16, 
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottomWidth: 1,
          borderBottomColor: COLORS.border
        }}>
          <Text style={{ color: COLORS.textPrimary, fontSize: 18, fontWeight: 'bold' }}>Posts</Text>
          <TouchableOpacity onPress={() => router.push('/(root)/createpost')}>
            <Feather name="plus-circle" size={22} color={COLORS.accent} />
          </TouchableOpacity>
        </View>

        {/* Posts List */}
        <View style={{ padding: 8 }}>
          {userPosts.length === 0 ? (
            <View style={{ 
              padding: 40, 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <Feather name="file-text" size={48} color={COLORS.textSecondary} />
              <Text style={{ 
                color: COLORS.textSecondary, 
                marginTop: 16, 
                textAlign: 'center' 
              }}>
                No posts yet
              </Text>
            </View>
          ) : (
            userPosts.map(post => (
              <View 
                key={post.id} 
                style={{ 
                  backgroundColor: COLORS.cardBg, 
                  borderRadius: 16, 
                  marginBottom: 16, 
                  overflow: 'hidden',
                  borderWidth: 1,
                  borderColor: COLORS.border
                }}
              >
                {post.mediaUrl && (
                  <Image 
                    source={{ uri: post.mediaUrl }}
                    style={{ width: '100%', height: 200 }}
                    resizeMode="cover"
                  />
                )}
                
                <View style={{ padding: 16 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <Text style={{ color: COLORS.textSecondary, fontSize: 12 }}>
                      {new Date(post.createdAt?.toDate()).toLocaleDateString()}
                    </Text>
                    <TouchableOpacity 
                      onPress={() => {
                        setSelectedPost(post);
                        setEditedContent(post.content);
                        setShowEditPostModal(true);
                      }}
                    >
                      <Feather name="more-horizontal" size={20} color={COLORS.textSecondary} />
                    </TouchableOpacity>
                  </View>
                  
                  <Text style={{ color: COLORS.textPrimary, fontSize: 16 }}>
                    {post.content}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
 
      {/* Edit Post Modal */}
      <Modal
        visible={showEditPostModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowEditPostModal(false)}
      >
        <BlurView
          intensity={Platform.OS === 'ios' ? 50 : 100}
          tint="dark"
          style={{ flex: 1, justifyContent: 'flex-end' }}
        >
          <View style={{ 
            backgroundColor: COLORS.cardBg, 
            borderTopLeftRadius: 24, 
            borderTopRightRadius: 24, 
            padding: 24 
          }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: 16 }}>
              Edit Post
            </Text>
            
            <TextInput
              value={editedContent}
              onChangeText={setEditedContent}
              multiline
              style={{ 
                backgroundColor: COLORS.background, 
                borderRadius: 12, 
                padding: 16, 
                minHeight: 100, 
                marginBottom: 16, 
                color: COLORS.textPrimary 
              }}
              placeholder="Edit your post..."
              placeholderTextColor={COLORS.textSecondary}
            />
            
            <View style={{ flexDirection: 'row', gap: 16 }}>
              <TouchableOpacity
                onPress={() => setShowEditPostModal(false)}
                style={{ 
                  flex: 1, 
                  padding: 12, 
                  borderRadius: 12, 
                  backgroundColor: COLORS.border 
                }}
              >
                <Text style={{ textAlign: 'center', fontWeight: '500', color: COLORS.textPrimary }}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={handleEditPost}
                style={{ 
                  flex: 1, 
                  padding: 12, 
                  borderRadius: 12, 
                  backgroundColor: COLORS.accent 
                }}
              >
                <Text style={{ textAlign: 'center', fontWeight: '500', color: COLORS.textPrimary }}>
                  Save Changes
                </Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity
              onPress={() => handleDeletePost(selectedPost?.id)}
              style={{ 
                marginTop: 16, 
                padding: 12, 
                borderRadius: 12, 
                backgroundColor: 'rgba(239, 68, 68, 0.2)' 
              }}
            >
              <Text style={{ textAlign: 'center', fontWeight: '500', color: '#EF4444' }}>
                Delete Post
              </Text>
            </TouchableOpacity>
          </View>
        </BlurView>
      </Modal>

      {/* Options Modal */}
      <Modal
        visible={showOptionsModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowOptionsModal(false)}
      >
        <BlurView
          intensity={Platform.OS === 'ios' ? 50 : 100}
          tint="dark"
          style={{ flex: 1, justifyContent: 'flex-end' }}
        >
          <View style={{ 
            backgroundColor: COLORS.cardBg, 
            borderTopLeftRadius: 24, 
            borderTopRightRadius: 24, 
            padding: 24 
          }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: 24 }}>
              Profile Options
            </Text>
            
            <TouchableOpacity 
              style={{ 
                flexDirection: 'row', 
                alignItems: 'center', 
                gap: 12, 
                paddingVertical: 16, 
                borderBottomWidth: 1, 
                borderBottomColor: COLORS.border 
              }}
              onPress={() => {
                setShowOptionsModal(false);
                router.push('/(root)/editprofile');
              }}
            >
              <MaterialIcons name="person-outline" size={24} color={COLORS.accent} />
              <Text style={{ color: COLORS.textPrimary, fontSize: 16 }}>Edit Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={{ 
                flexDirection: 'row', 
                alignItems: 'center', 
                gap: 12, 
                paddingVertical: 16, 
                borderBottomWidth: 1, 
                borderBottomColor: COLORS.border 
              }}
              onPress={() => {
                setShowOptionsModal(false);
                // Handle settings navigation
              }}
            >
              <Ionicons name="settings-outline" size={24} color={COLORS.accent} />
              <Text style={{ color: COLORS.textPrimary, fontSize: 16 }}>Settings</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={{ 
                flexDirection: 'row', 
                alignItems: 'center', 
                gap: 12, 
                paddingVertical: 16 
              }}
              onPress={() => {
                setShowOptionsModal(false);
                handleLogout();
              }}
            >
              <MaterialIcons name="logout" size={24} color="#EF4444" />
              <Text style={{ color: '#EF4444', fontSize: 16 }}>Logout</Text>
            </TouchableOpacity>
          </View>
        </BlurView>
      </Modal>
    </View>
  );
};

export default Profile;
