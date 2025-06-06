import React, { useState, useEffect, useCallback } from 'react';
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
  Platform,
  StatusBar,
  Dimensions,
  FlatList
} from 'react-native';
import { collection, query, where, getDocs, orderBy, doc, getDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../../config/firebaseConfig';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/authContext';
import { MaterialIcons, Feather, Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = (width - 48) / 2; // 2 columns with spacing

// Consistent Color Palette - Black Theme with Purple Accents
const COLORS = {
  background: '#000000',
  cardBg: '#000000',
  text: '#FFFFFF',
  textSecondary: '#E5E5E5',
  textMuted: '#A1A1AA',
  inputBg: '#1A1A1A',
  accent: '#8B5CF6',
  success: '#10B981',
  danger: '#EF4444',
  shadow: 'rgba(139, 92, 246, 0.15)',
  border: 'rgba(255, 255, 255, 0.1)',
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
              setShowEditPostModal(false);
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

  // Render post item for grid
  const renderPostItem = ({ item, index }) => (
    <TouchableOpacity
      style={{
        width: ITEM_WIDTH,
        height: ITEM_WIDTH,
        marginBottom: 16,
        marginRight: index % 2 === 0 ? 16 : 0,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: COLORS.inputBg,
      }}
      onPress={() => {
        setSelectedPost(item);
        setEditedContent(item.content);
        setShowEditPostModal(true);
      }}
    >
      {item.mediaUrls && item.mediaUrls.length > 0 ? (
        <Image 
          source={{ uri: item.mediaUrls[0] }}
          style={{ width: '100%', height: '100%' }}
          resizeMode="cover"
        />
      ) : (
        <View style={{
          flex: 1,
          padding: 12,
          justifyContent: 'center',
        }}>
          <Text style={{
            color: COLORS.text,
            fontSize: 14,
            lineHeight: 20,
          }} numberOfLines={6}>
            {item.content}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
        <ActivityIndicator size="large" color={COLORS.accent} />
        <Text style={{ 
          marginTop: 16, 
          color: COLORS.textSecondary,
          fontSize: 16,
          fontWeight: '500'
        }}>
          Loading profile...
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      
      {/* Header */}
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: Platform.OS === 'ios' ? 50 : 40,
        paddingHorizontal: 20,
        paddingBottom: 16,
      }}>
        <Text style={{
          fontSize: 24,
          fontWeight: '800',
          color: COLORS.text,
        }}>
          Profile
        </Text>
        <TouchableOpacity 
          onPress={() => setShowOptionsModal(true)}
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: COLORS.inputBg,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name="ellipsis-horizontal" size={20} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            tintColor={COLORS.accent}
            colors={[COLORS.accent]}
          />
        }
      >
        {/* User Info Section */}
        <View style={{
          paddingHorizontal: 20,
          paddingBottom: 32,
        }}>
          {/* Profile Picture and Edit Button Row */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            marginBottom: 16,
          }}>
            <Image
              source={{ 
                uri: userData?.profileImage || currentUser?.photoURL || 'https://cdn-icons-png.flaticon.com/512/149/149071.png'
              }}
              style={{ 
                width: 80, 
                height: 80, 
                borderRadius: 40,
                borderWidth: 2,
                borderColor: COLORS.accent,
              }}
            />
            
            <TouchableOpacity
              onPress={() => router.push('/(root)/editprofile')}
              style={{
                borderWidth: 1,
                borderColor: COLORS.border,
                borderRadius: 20,
                paddingHorizontal: 16,
                paddingVertical: 8,
                backgroundColor: 'transparent',
              }}
            >
              <Text style={{
                color: COLORS.text,
                fontSize: 14,
                fontWeight: '600',
              }}>
                Edit Profile
              </Text>
            </TouchableOpacity>
          </View>

          {/* Name */}
          <Text style={{
            fontSize: 22,
            fontWeight: '800',
            color: COLORS.text,
            marginBottom: 4,
          }}>
            {userData?.fullName || currentUser?.displayName || 'User'}
          </Text>

          {/* Username */}
          <Text style={{
            fontSize: 16,
            color: COLORS.textMuted,
            marginBottom: 12,
          }}>
            @{userData?.displayName || userData?.username || 'username'}
          </Text>

          {/* Bio */}
          {userData?.bio && (
            <Text style={{
              fontSize: 16,
              color: COLORS.textSecondary,
              lineHeight: 22,
              marginBottom: 16,
            }}>
              {userData.bio}
            </Text>
          )}

          {/* Stats */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 16,
          }}>
            <Text style={{
              color: COLORS.text,
              fontSize: 16,
              fontWeight: '700',
              marginRight: 4,
            }}>
              {userPosts.length}
            </Text>
            <Text style={{
              color: COLORS.textMuted,
              fontSize: 16,
            }}>
              {userPosts.length === 1 ? 'post' : 'posts'}
            </Text>
          </View>
        </View>

        {/* Posts Grid */}
        <View style={{ paddingHorizontal: 20 }}>
          {userPosts.length === 0 ? (
            <View style={{
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 60,
            }}>
              <Ionicons name="grid-outline" size={64} color={COLORS.textMuted} />
              <Text style={{
                color: COLORS.textMuted,
                fontSize: 18,
                fontWeight: '600',
                marginTop: 16,
                marginBottom: 8,
              }}>
                No posts yet
              </Text>
              <Text style={{
                color: COLORS.textMuted,
                fontSize: 14,
                textAlign: 'center',
                marginBottom: 24,
              }}>
                Share your thoughts and experiences{'\n'}to start building your profile
              </Text>
              <TouchableOpacity
                onPress={() => router.push('/(root)/(tabs)/home')}
                style={{
                  backgroundColor: COLORS.accent,
                  paddingHorizontal: 24,
                  paddingVertical: 12,
                  borderRadius: 20,
                }}
              >
                <Text style={{
                  color: '#FFFFFF',
                  fontSize: 16,
                  fontWeight: '700',
                }}>
                  Create Post
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={userPosts}
              renderItem={renderPostItem}
              numColumns={2}
              columnWrapperStyle={{ justifyContent: 'flex-start' }}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 40 }}
            />
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
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.8)',
          justifyContent: 'flex-end',
        }}>
          <View style={{ 
            backgroundColor: COLORS.cardBg, 
            borderTopLeftRadius: 24, 
            borderTopRightRadius: 24, 
            padding: 24,
            borderWidth: 1,
            borderColor: COLORS.border,
          }}>
            <Text style={{ 
              fontSize: 20, 
              fontWeight: '800', 
              color: COLORS.text, 
              marginBottom: 20 
            }}>
              Edit Post
            </Text>
            
            <TextInput
              value={editedContent}
              onChangeText={setEditedContent}
              multiline
              style={{ 
                backgroundColor: COLORS.inputBg, 
                borderRadius: 16, 
                padding: 16, 
                minHeight: 120, 
                marginBottom: 20, 
                color: COLORS.text,
                fontSize: 16,
                textAlignVertical: 'top',
              }}
              placeholder="Edit your post..."
              placeholderTextColor={COLORS.textMuted}
            />
            
            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
              <TouchableOpacity
                onPress={() => setShowEditPostModal(false)}
                style={{ 
                  flex: 1, 
                  padding: 16, 
                  borderRadius: 16, 
                  backgroundColor: COLORS.inputBg,
                  alignItems: 'center',
                }}
              >
                <Text style={{ 
                  fontWeight: '600', 
                  color: COLORS.text,
                  fontSize: 16,
                }}>
                  Cancel
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={handleEditPost}
                style={{ 
                  flex: 1, 
                  padding: 16, 
                  borderRadius: 16, 
                  backgroundColor: COLORS.accent,
                  alignItems: 'center',
                }}
              >
                <Text style={{ 
                  fontWeight: '700', 
                  color: '#FFFFFF',
                  fontSize: 16,
                }}>
                  Save Changes
                </Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity
              onPress={() => handleDeletePost(selectedPost?.id)}
              style={{ 
                padding: 16, 
                borderRadius: 16, 
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                alignItems: 'center',
                borderWidth: 1,
                borderColor: COLORS.danger,
              }}
            >
              <Text style={{ 
                fontWeight: '600', 
                color: COLORS.danger,
                fontSize: 16,
              }}>
                Delete Post
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Options Modal */}
      <Modal
        visible={showOptionsModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowOptionsModal(false)}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.8)',
          justifyContent: 'flex-end',
        }}>
          <View style={{ 
            backgroundColor: COLORS.cardBg, 
            borderTopLeftRadius: 24, 
            borderTopRightRadius: 24, 
            padding: 24,
            borderWidth: 1,
            borderColor: COLORS.border,
          }}>
            <Text style={{ 
              fontSize: 20, 
              fontWeight: '800', 
              color: COLORS.text, 
              marginBottom: 24 
            }}>
              Profile Options
            </Text>
            
            <TouchableOpacity 
              style={{ 
                flexDirection: 'row', 
                alignItems: 'center', 
                gap: 16, 
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
              <Text style={{ color: COLORS.text, fontSize: 16, fontWeight: '500' }}>
                Edit Profile
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={{ 
                flexDirection: 'row', 
                alignItems: 'center', 
                gap: 16, 
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
              <Text style={{ color: COLORS.text, fontSize: 16, fontWeight: '500' }}>
                Settings
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={{ 
                flexDirection: 'row', 
                alignItems: 'center', 
                gap: 16, 
                paddingVertical: 16 
              }}
              onPress={() => {
                setShowOptionsModal(false);
                handleLogout();
              }}
            >
              <MaterialIcons name="logout" size={24} color={COLORS.danger} />
              <Text style={{ color: COLORS.danger, fontSize: 16, fontWeight: '500' }}>
                Logout
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default Profile;
