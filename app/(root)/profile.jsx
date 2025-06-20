import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Image, 
  ScrollView, 
  Alert, 
  ActivityIndicator,
  Platform,
  StatusBar
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/authContext';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { supabase } from '../../config/supabaseConfig';
import { useSafeNavigation } from '../../hooks/useSafeNavigation';
import PostCard from '../../components/PostCard';

// Consistent Color Palette - Black Theme with Purple Accents
const COLORS = {
  background: '#000000',
  cardBg: '#111111',
  text: '#FFFFFF',
  textSecondary: '#E5E5E5',
  textMuted: '#A1A1AA',
  inputBg: '#1A1A1A',
  accent: '#8B5CF6',
  danger: '#EF4444',
  border: 'rgba(255, 255, 255, 0.1)',
};

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const isMounted = useRef(true);
  
  const { loginOut, user, isAuthenticated } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState('About');
  const tabs = ['About', 'Posts'];

  // Universal safe navigation
  const { safeNavigate, safeBack } = useSafeNavigation({
    modals: [
      () => isModalVisible && setIsModalVisible(false),
    ],
    onCleanup: () => {
      // Clean up any state here
      setUserData(null);
      setLoading(false);
    }
  });

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Move useCallback to top level - before any conditional returns
  const goHome = useCallback(async () => {
    await safeNavigate('/(root)/(tabs)/home', { replace: true });
  }, [safeNavigate]);

  // Load user data from Supabase
  const loadUserData = async () => {
    try {
      if (!user?.uid || !isMounted.current) {
        console.log('No user found in context');
        if (isMounted.current) setLoading(false);
        return;
      }

      console.log('Loading user data for:', user.uid);
      
      // Get user data from Supabase
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.uid)
        .single();

      if (error) {
        console.error('Error fetching user data:', error);
        // Use context user data if database fetch fails
        if (isMounted.current) setUserData(user);
      } else {
        console.log('User data loaded successfully:', data);
        if (isMounted.current) setUserData(data);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      // Fallback to context user data
      if (isMounted.current) setUserData(user);
    } finally {
      if (isMounted.current) setLoading(false);
    }
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
              // Don't manually navigate - let the auth context handle it
              // The auth context will automatically redirect when isAuthenticated becomes false
            } catch (error) {
              console.error('Error during logout:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          }
        }
      ]
    );
  };

  // Load data when component mounts
  useEffect(() => {
    if (isAuthenticated && user) {
      loadUserData();
    } else {
      if (isMounted.current) setLoading(false);
    }
  }, [user, isAuthenticated]);

  // Show loading state
  if (loading) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor: COLORS.background 
      }}>
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

  // Show authentication required if not logged in
  if (!isAuthenticated || !user) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor: COLORS.background,
        padding: 20
      }}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
        <Ionicons name="person-circle-outline" size={64} color={COLORS.textMuted} />
        <Text style={{
          color: COLORS.text,
          fontSize: 18,
          fontWeight: '600',
          marginTop: 16,
          marginBottom: 8,
        }}>
          Not Logged In
        </Text>
        <Text style={{
          color: COLORS.textMuted,
          fontSize: 14,
          textAlign: 'center',
          marginBottom: 24,
        }}>
          Please sign in to view your profile
        </Text>
        <TouchableOpacity
          onPress={() => router.push('/(auth)/signin')}
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
            Sign In
          </Text>
        </TouchableOpacity>
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
          fontSize: 28,
          fontWeight: '700',
          color: COLORS.text,
        }}>
          Kliq
        </Text>
        <View style={{ flexDirection: 'row', gap: 16 }}>
          <TouchableOpacity
            onPress={() => router.push('/(root)/settings')}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: COLORS.cardBg,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: COLORS.border,
            }}
          >
            <Ionicons name="settings-outline" size={22} color={COLORS.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Profile Info */}
        <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
          {/* Profile Image */}
          <View style={{
            width: 100,
            height: 100,
            borderRadius: 50,
            backgroundColor: COLORS.cardBg,
            alignSelf: 'center',
            marginBottom: 16,
            overflow: 'hidden'
          }}>
            <Image
              source={{ 
                uri: userData?.profile_image || 
                     userData?.profileImage || 
                     'https://cdn-icons-png.flaticon.com/512/149/149071.png'
              }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            />
          </View>

          {/* Name and Username */}
          <Text style={{
            fontSize: 24,
            fontWeight: '700',
            color: COLORS.text,
            textAlign: 'center',
            marginBottom: 4,
          }}>
            {userData?.full_name || userData?.fullName || 'User'}
          </Text>
          <Text style={{
            fontSize: 16,
            color: COLORS.textMuted,
            textAlign: 'center',
            marginBottom: 16,
          }}>
            @{userData?.username || 'username'}
          </Text>

          {/* Follow Stats */}
          <View style={{
            flexDirection: 'row',
            justifyContent: 'center',
            gap: 24,
            marginBottom: 24,
          }}>
            <TouchableOpacity>
              <Text style={{ color: COLORS.text, fontSize: 16, fontWeight: '600', textAlign: 'center' }}>
                1
              </Text>
              <Text style={{ color: COLORS.textMuted, fontSize: 14 }}>following</Text>
            </TouchableOpacity>
            <TouchableOpacity>
              <Text style={{ color: COLORS.text, fontSize: 16, fontWeight: '600', textAlign: 'center' }}>
                0
              </Text>
              <Text style={{ color: COLORS.textMuted, fontSize: 14 }}>followers</Text>
            </TouchableOpacity>
          </View>

          {/* Edit Profile Button */}
          <TouchableOpacity
            onPress={() => router.push('/(root)/editprofile')}
            style={{
              backgroundColor: COLORS.cardBg,
              paddingVertical: 12,
              borderRadius: 25,
              borderWidth: 1,
              borderColor: COLORS.border,
            }}
          >
            <Text style={{
              color: COLORS.text,
              fontSize: 15,
              fontWeight: '600',
              textAlign: 'center',
            }}>
              Edit Profile
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={{
          flexDirection: 'row',
          paddingHorizontal: 20,
          marginBottom: 16,
          gap: 12,
        }}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 12,
                backgroundColor: activeTab === tab ? COLORS.cardBg : 'transparent',
                borderWidth: 1,
                borderColor: activeTab === tab ? COLORS.accent : COLORS.border,
              }}
            >
              <Text style={{
                color: activeTab === tab ? COLORS.accent : COLORS.textMuted,
                fontSize: 15,
                fontWeight: '600',
                textAlign: 'center',
              }}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab Content */}
        <View style={{ paddingHorizontal: 20 }}>
          {activeTab === 'About' && (
            <View style={{ gap: 16 }}>
              {userData?.bio && (
                <View style={{
                  backgroundColor: COLORS.cardBg,
                  padding: 16,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: COLORS.border,
                }}>
                  <Text style={{ color: COLORS.textSecondary, fontSize: 15, lineHeight: 22 }}>
                    {userData.bio}
                  </Text>
                </View>
              )}
              
              {/* College Info */}
              <View style={{
                backgroundColor: COLORS.cardBg,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: COLORS.border,
                overflow: 'hidden',
              }}>
                {userData?.college?.name && (
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: 16,
                    borderBottomWidth: 1,
                    borderBottomColor: COLORS.border,
                  }}>
                    <Ionicons name="school-outline" size={20} color={COLORS.accent} />
                    <Text style={{ color: COLORS.textSecondary, fontSize: 15, marginLeft: 12 }}>
                      {userData.college.name}
                    </Text>
                  </View>
                )}
                
                {userData?.branch && (
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: 16,
                    borderBottomWidth: 1,
                    borderBottomColor: COLORS.border,
                  }}>
                    <Ionicons name="book-outline" size={20} color={COLORS.accent} />
                    <Text style={{ color: COLORS.textSecondary, fontSize: 15, marginLeft: 12 }}>
                      {userData.branch}
                    </Text>
                  </View>
                )}

                {userData?.passout_year && (
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: 16,
                    borderBottomWidth: 1,
                    borderBottomColor: COLORS.border,
                  }}>
                    <Ionicons name="calendar-outline" size={20} color={COLORS.accent} />
                    <Text style={{ color: COLORS.textSecondary, fontSize: 15, marginLeft: 12 }}>
                      Class of {userData.passout_year}
                    </Text>
                  </View>
                )}

                {userData?.interests && (
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: 16,
                  }}>
                    <Ionicons name="heart-outline" size={20} color={COLORS.accent} />
                    <Text style={{ color: COLORS.textSecondary, fontSize: 15, marginLeft: 12 }}>
                      {Array.isArray(userData.interests) ? userData.interests.join(', ') : userData.interests}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {activeTab === 'Posts' && (
            <UserPostsList userId={userData?.id || userData?.uid} />
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const UserPostsList = ({ userId }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    loadPosts();

    return () => {
      isMounted.current = false;
    };
  }, [userId]);
    
    const loadPosts = async () => {
    if (!userId || !isMounted.current) return;
    
    setLoading(true);
      try {
        const { data, error } = await supabase
          .from('posts')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

      if (error) throw error;
        if (isMounted.current) {
        setPosts(data);
        }
      } catch (error) {
      console.error('Error fetching user posts:', error);
    } finally {
        if (isMounted.current) {
          setLoading(false);
        }
      }
    };

  if (loading) {
    return (
      <View style={{ marginTop: 20, alignItems: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.accent} />
        <Text style={{ color: COLORS.textMuted, marginTop: 8 }}>Loading posts...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={{ flex: 1, marginTop: 16 }}
      contentContainerStyle={{ paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
    >
      {posts.length > 0 ? (
        posts.map(post => (
          <PostCard key={post.id} post={post} />
        ))
      ) : (
        <View style={{ alignItems: 'center', marginTop: 40 }}>
          <Ionicons name="documents-outline" size={48} color={COLORS.textMuted} />
          <Text style={{ 
            color: COLORS.textMuted, 
            marginTop: 16, 
            fontSize: 16,
            fontWeight: '500'
          }}>
            No Posts Yet
          </Text>
          <Text style={{
            color: COLORS.textMuted,
            marginTop: 8,
            fontSize: 14,
            textAlign: 'center',
            paddingHorizontal: 40,
          }}>
            This user hasn't shared any posts.
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

export default Profile;
