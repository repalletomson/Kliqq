import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Image,
  StatusBar,
  Dimensions,
  Animated,
  TextInput,
  Modal,
  Platform,
  Appearance,
  FlatList,
  InteractionManager,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons, FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSharedValue, useAnimatedStyle, withSpring, withTiming, interpolate } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import Carousel from 'react-native-reanimated-carousel';
import { supabase } from '../../../config/supabaseConfig';
import { getFeedPosts } from '../../../(apis)/post';
import PostCard from '../../../components/PostCard';
import { useAuth } from '../../../context/authContext';
import CreatePostScreen from '../../../components/CreatePost';
import { AppText } from '../../_layout';
import { router } from 'expo-router';
import { safeNavigate, clearNavigationState } from '../../../utiles/safeNavigation';
import SafeViewErrorBoundary from '../../../components/SafeViewErrorBoundary';
import { useSafeNavigation } from '../../../hooks/useSafeNavigation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import EventEmitter from '../../../utiles/EventEmitter';

const { width } = Dimensions.get('window');
const SLIDER_WIDTH = width;
const ITEM_WIDTH = SLIDER_WIDTH * 0.95;

const COLORS = {
  background: '#000000',
  text: '#FFFFFF',
  accent: '#8B5CF6',
  textSecondary: '#E5E5E5',
  textMuted: '#A1A1AA',
};

const POSTS_CACHE_KEY = '@posts_cache';
const POSTS_CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes

export default function EnhancedHome() {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [hotPost, setHotPost] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCarouselIndex, setActiveCarouselIndex] = useState(0);
  const [showFullButton, setShowFullButton] = useState(true);
  const [carouselItems, setCarouselItems] = useState([]);
  const { user } = useAuth();
  const scrollY = useRef(new Animated.Value(0)).current;
  const [theme, setTheme] = useState(Appearance.getColorScheme() || 'dark');
  const shareButtonScale = useSharedValue(1);
  const cardOpacity = useSharedValue(0);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const isMounted = useRef(true);
  const lastFetchTime = useRef(0);
  const searchBarHeight = useSharedValue(0);
  const searchBarOpacity = useSharedValue(0);

  const { safeNavigate } = useSafeNavigation({
    onCleanup: () => {
      if (isModalVisible) {
        setIsModalVisible(false);
      }
    }
  });

  useEffect(() => {
    isMounted.current = true;
    const colorSchemeListener = Appearance.addChangeListener(({ colorScheme }) => {
      if (isMounted.current) setTheme(colorScheme);
    });
  
    InteractionManager.runAfterInteractions(() => {
      if (isMounted.current) {
        fetchPosts();
      }
    });

    const channel = supabase
      .channel('realtime-posts-feed')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'posts' },
        () => {
          fetchPosts(true); // Refetch posts on new posts
        }
      )
      .subscribe();

    const deleteListener = EventEmitter.on('post-deleted', (deletedPostId) => {
      if (isMounted.current) {
        setPosts(prevPosts => prevPosts.filter(p => p.id !== deletedPostId));
      }
    });
  
    return () => {
      isMounted.current = false;
      colorSchemeListener.remove();
      supabase.removeChannel(channel);
      deleteListener(); // Unsubscribe from the event listener
    };
  }, [user?.uid]);

  const colors = {
    background: theme === 'dark' ? '#000000' : '#FFFFFF',
    text: theme === 'dark' ? '#FFFFFF' : '#1F1F1F',
    cardBg: theme === 'dark' ? '#121212' : '#F5F5F5',
    accent: '#8B5CF6',
    secondaryText: theme === 'dark' ? '#9E9E9E' : '#6B7280',
    border: theme === 'dark' ? '#333333' : '#E5E7EB',
  };

  const baseCarouselItems = [
    { id: 1, title: "ChatWithFriends", text: "Learn to code with peers", path:"chat", type: "info" },
    { id: 2, title: "Join in groups", text: "Prepare for interviews", path:"groups", type: "info" },
    { id: 3, title: "Connect", text: "Connect with peers, friends and mentors", path:"connect", type: "info" },
  ];

  const fetchHotPosts = async () => {
    try {
      // Use Supabase to get posts count
      const { count, error: countError } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true });

      if (countError || count < 1) return null;

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const { data: hotPosts, error } = await supabase
        .from('posts')
        .select('*')
        .gte('created_at', yesterday.toISOString())
        .lt('created_at', today.toISOString())
        .order('created_at', { ascending: false });

      if (error || !hotPosts?.length) return null;

      const postsWithEngagement = hotPosts.map(post => ({
        ...post,
        engagementScore: (post.like_count || 0) + (post.comment_count || 0),
      }));

      postsWithEngagement.sort((a, b) => b.engagementScore - a.engagementScore || new Date(b.created_at) - new Date(a.created_at));
      return postsWithEngagement.length > 0 ? postsWithEngagement[0] : null;
    } catch (error) {
      console.error('Error fetching hot post:', error);
      return null;
    }
  };

  const loadCachedPosts = async () => {
    try {
      const cachedData = await AsyncStorage.getItem(POSTS_CACHE_KEY);
      if (cachedData) {
        const { posts: cachedPosts, timestamp } = JSON.parse(cachedData);
        const now = Date.now();
        
        if (now - timestamp < POSTS_CACHE_EXPIRY) {
          console.log('Loading posts from cache');
          if (isMounted.current) {
            setPosts(cachedPosts);
            setFilteredPosts(cachedPosts);
            setLoading(false);
          }
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Error loading cached posts:', error);
      return false;
    }
  };

  const cachePosts = async (postsToCache) => {
    try {
      const cacheData = {
        posts: postsToCache,
        timestamp: Date.now()
      };
      await AsyncStorage.setItem(POSTS_CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Error caching posts:', error);
    }
  };

  const fetchPosts = async (shouldRefresh = false) => {
    try {
      const now = Date.now();
      if (!shouldRefresh && now - lastFetchTime.current < POSTS_CACHE_EXPIRY) {
        console.log('Using existing posts, cache still valid');
        return;
      }

      if (!shouldRefresh) {
        const hasCachedPosts = await loadCachedPosts();
        if (hasCachedPosts) {
          return;
        }
      }

      console.log('Fetching fresh posts from server');
      const { data: postsData, error } = await supabase
        .from('posts')
        .select(`
          *,
          users!posts_user_id_fkey (
            full_name,
            username,
            profile_image
          ),
          likes (
            id,
            user_id
          ),
          comments (
            id
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching posts:', error);
        return;
      }

      if (!isMounted.current) return;

      const transformedPosts = postsData?.map(post => ({
        ...post,
        userName: post.users?.full_name || post.user_name || 'Anonymous',
        userAvatar: post.users?.profile_image || post.user_avatar || null,
        likesCount: post.likes?.length || 0,
        commentsCount: post.comments?.length || 0,
        isLiked: post.likes?.some(like => like.user_id === user?.uid) || false,
      })) || [];

      setPosts(transformedPosts);
      setFilteredPosts(transformedPosts);
      lastFetchTime.current = now;
      await cachePosts(transformedPosts);
    } catch (error) {
      console.error('Error in fetchPosts:', error);
    } finally {
      if (isMounted.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  };

  // Initial load
  useEffect(() => {
    fetchPosts();
  }, [user]);

  const getHotPost = async () => {
    const post = await fetchHotPosts();
    if (isMounted.current) {
      setHotPost(post);
    }
  };

// console.log("user",user)
  const updateCarouselWithHotPost = (post) => {
    if (post) {
      const hotPostItem = {
        id: 'hot_post',
        type: 'hot_post',
        ...post,
      };
      if (isMounted.current) {
        setCarouselItems([hotPostItem, ...baseCarouselItems]);
      }
    } else {
      if (isMounted.current) {
    setCarouselItems(baseCarouselItems);
      }
        }
  };

  useEffect(() => {
    InteractionManager.runAfterInteractions(() => {
      getHotPost();
    });
  }, []);

  useEffect(() => {
    updateCarouselWithHotPost(hotPost);
  }, [hotPost]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredPosts(posts);
    } else {
      const queryLower = searchQuery.toLowerCase();
      setFilteredPosts(posts.filter(post =>
        post.content?.toLowerCase().includes(queryLower) ||
        post.userName?.toLowerCase().includes(queryLower) ||
        (post.tags && post.tags.some(tag => tag.toLowerCase().includes(queryLower)))
      ));
    }
  }, [searchQuery, posts]);

  const handleScroll = useCallback((event) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    scrollY.setValue(offsetY);
    setShowFullButton(offsetY <= 40);
  }, [scrollY]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPosts(true);
  }, []);

  // Handle modal visibility with proper cleanup
  const handleShowModal = useCallback(() => {
    setIsModalVisible(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalVisible(false);
  }, []);

  const handlePostCreated = useCallback(async (postData) => {
    setIsModalVisible(false);
    
    // Refresh posts list
    handleRefresh();
  }, [handleRefresh]);

  const renderHotPostMetadata = (post) => {
    if (!post) return null;
    const formattedTime = post.createdAt?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || '';
    return (
      <TouchableOpacity onPress={() => router.push(`/postDetailView/${post.id}`)} >
      <View className="flex-row items-center">
        <Image source={{ uri: post.userPhotoURL || 'https://via.placeholder.com/40' }} className="w-8 h-8 rounded-full mr-2" style={{ borderWidth: 1, borderColor: colors.accent }} />
        <View>
          <AppText style={{ color: colors.text, fontWeight: '600', fontSize: 14 }}>{post.userName || 'Anonymous'}</AppText>
          <AppText style={{ color: colors.secondaryText, fontSize: 10 }}>{formattedTime}</AppText>
        </View>
      </View>
      </TouchableOpacity>
      
    );
  };

  const renderCarouselItem = useCallback(({ item, index }) => {
    // Different gradient colors for each carousel item that blend with black theme
    const gradientColors = [
      ['rgba(139, 92, 246, 0.3)', 'rgba(59, 130, 246, 0.3)'], // Purple to Blue
      ['rgba(99, 102, 241, 0.3)', 'rgba(139, 92, 246, 0.3)'], // Indigo to Purple  
      ['rgba(59, 130, 246, 0.3)', 'rgba(16, 185, 129, 0.3)'], // Blue to Green
      ['rgba(245, 101, 101, 0.3)', 'rgba(251, 191, 36, 0.3)'], // Red to Yellow
    ];

    const currentColors = gradientColors[index % gradientColors.length];
    const mainText = item.title?.toUpperCase() || "LEADERBOARD CYCLE";
    const subText = item.text || "Cycle 1 is over! Did you win?";

    const handleCarouselPress = async () => {
      if (item.path) {
        await safeNavigate(`/(root)/(tabs)/${item.path}`, { push: true });
      } else if (item.type === "hot-post" && item.post) {
        await safeNavigate(`/postDetailView/${item.post.id}`, { push: true });
      }
    };

    return (
      <TouchableOpacity onPress={handleCarouselPress} activeOpacity={0.8}>
        <LinearGradient
          colors={currentColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            width: width * 0.96,
            height: 140,
            borderRadius: 20,
            marginHorizontal: width * 0.02,
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'hidden',
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.1)',
            elevation: 4,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 8,
          }}
        >
          <AppText
            style={{
              color: '#fff',
              fontSize: 26,
              fontWeight: '700',
              letterSpacing: 0.5,
              textAlign: 'center',
              textShadowColor: 'rgba(0, 0, 0, 0.4)',
              textShadowOffset: { width: 0, height: 2 },
              textShadowRadius: 4,
            }}
          >
            {mainText}
          </AppText>
          <AppText
            style={{
              color: 'rgba(255, 255, 255, 0.95)',
              fontSize: 15,
              fontWeight: '500',
              marginTop: 8,
              textAlign: 'center',
              opacity: 0.9,
            }}
          >
            {subText}
          </AppText>
        </LinearGradient>
      </TouchableOpacity>
    );
  }, [safeNavigate, width, colors]);

  const toggleSearch = () => {
    setIsSearchExpanded(!isSearchExpanded);
    searchBarHeight.value = withSpring(isSearchExpanded ? 0 : 60, {
      damping: 15,
      stiffness: 100
    });
    searchBarOpacity.value = withTiming(isSearchExpanded ? 0 : 1, {
      duration: 200
    });
  };

  const searchBarAnimatedStyle = useAnimatedStyle(() => ({
    height: searchBarHeight.value,
    opacity: searchBarOpacity.value,
    transform: [
      {
        translateY: interpolate(
          searchBarHeight.value,
          [0, 60],
          [-20, 0]
        )
      }
    ]
  }));

  const Header = useCallback(() => (
    <View style={{ 
      paddingTop: Platform.OS === 'ios' ? 16 : 12,
      paddingHorizontal: 16,
      paddingBottom: 12,
      backgroundColor: colors.background,
      borderBottomWidth: Platform.OS === 'android' ? 0.5 : 0,
      borderBottomColor: colors.border,
    }}>
      <View style={{ 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        minHeight: 44,
      }}>
        {/* Left Section - App Name and Streak */}
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <AppText style={{ 
            color: colors.text, 
            fontSize: 22,
            fontWeight: '800',
            marginRight: 12,
          }}>
            Kliq
          </AppText>
           {/* Streak Icon */}
           <TouchableOpacity onPress={() => router.push('/streak')} style={{ flexDirection: 'row', alignItems: 'center' }}>
            <MaterialCommunityIcons name="fire" size={24} color={COLORS.accent} />
            {/* {user?.streak?.[0]?.streak_count >=0 && ( */}
              <Text style={{ color: colors.accent, marginLeft: 4, fontWeight: 'bold' }}>
                {user.streak.current_streak}
              </Text>
            {/* )} */}
           </TouchableOpacity>
        </View>

        {/* Right Section - Search and Profile */}
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'flex-end' }}>
          <TouchableOpacity 
            onPress={async () => {
              try {
                await safeNavigate('/(root)/search', { push: true });
              } catch (error) {
                console.error('Search navigation error:', error);
                router.push('/(root)/search');
              }
            }}
            style={{
              flex: 1,
              maxWidth: 140,
              height: 36,
              borderRadius: 18,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
              marginHorizontal: 12,
              borderWidth: 1.5,
              borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.2)',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="search" size={16} color={colors.text} />
              <AppText style={{ 
                color: colors.text, 
                marginLeft: 6, 
                fontSize: 13, 
                fontWeight: '500' 
              }}>
                Search
              </AppText>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => safeNavigate('/(root)/profile')}
            style={{
              width: 42,
              height: 42,
              borderRadius: 21,
              overflow: 'hidden',
              borderWidth: 2,
              borderColor: colors.accent
            }}
          >
            <Image 
              source={{ uri: user?.profileImage || user?.photoURL || 'https://via.placeholder.com/40' }} 
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  ), [colors, theme, safeNavigate, user]);

  const renderCarousel = useCallback(() => (
        <View style={{ marginVertical: 16 }}>
          <Carousel
            width={width * 0.98}
            height={160}
            data={carouselItems}
            renderItem={renderCarouselItem}
            mode="parallax"
            modeConfig={{ parallaxScrollingScale: 0.94, parallaxScrollingOffset: 35 }}
            loop
            autoPlay
            autoPlayInterval={8000}
            onProgressChange={(_, absoluteProgress) => setActiveCarouselIndex(Math.round(absoluteProgress))}
            scrollAnimationDuration={500}
          />
          
          {/* Dots at bottom */}
          <View style={{
            flexDirection: 'row',
            justifyContent: 'center',
            marginTop: 12,
            paddingHorizontal: 16,
          }}>
            {carouselItems.map((_, index) => (
              <View 
                key={`indicator-${index}`} 
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: index === activeCarouselIndex ? colors.accent : 'rgba(255, 255, 255, 0.3)',
                  marginHorizontal: 4,
                }} 
              />
            ))}
          </View>
        </View>
  ), [carouselItems, activeCarouselIndex, colors.accent]);

  const renderHeader = useCallback(() => (
    <View style={{ paddingTop: 10 }}>
      <TouchableOpacity
        onPress={() => router.push('/createpost')}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: colors.cardBg,
          paddingHorizontal: 15,
          paddingVertical: 12,
          borderRadius: 25,
          marginHorizontal: 15,
          marginBottom: 16,
          borderWidth: 1,
          borderColor: colors.border
        }}
      >
        <Image
          source={{ uri: user?.profileImage || user?.photoURL || 'https://via.placeholder.com/40' }}
          style={{ width: 40, height: 40, borderRadius: 20, marginRight: 12 }}
        />
        <Text style={{ color: colors.secondaryText, fontSize: 16 }}>What's happening?</Text>
        <View style={{ flex: 1 }} />
        <Ionicons name="images-outline" size={24} color={colors.accent} />
      </TouchableOpacity>
      {renderCarousel()}
    </View>
  ), [renderCarousel, user, colors]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchPosts(true);
    setRefreshing(false);
  }, []);

  const getItemLayout = useCallback((data, index) => {
    const ITEM_HEIGHT = 200; // Approximate height of a post card
    return {
      length: ITEM_HEIGHT,
      offset: ITEM_HEIGHT * index,
      index,
    };
  }, []);

  const memoizedPosts = useMemo(() => filteredPosts, [filteredPosts]);

  if (loading === 0) {
    console.log('nothing')
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      </SafeAreaView>
    );
  }

  return (
    <SafeViewErrorBoundary>
      <SafeAreaView style={{ flex: 1, backgroundColor: 'black' }}>
        <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
        
        {/* Sticky Header */}
        <Header />

        {isSearchExpanded && (
          <Animated.View style={[searchBarAnimatedStyle, { paddingHorizontal: 15, marginBottom: 10 }]}>
            <TextInput
              style={{
                backgroundColor: colors.cardBg,
                color: colors.text,
                borderRadius: 10,
                padding: 10,
                fontSize: 16,
              }}
              placeholder="Search posts..."
              placeholderTextColor={colors.secondaryText}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </Animated.View>
        )}
        
        {loading && posts.length === 0 ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color={COLORS.accent} />
          </View>
        ) : (
        <FlatList
            data={memoizedPosts}
            renderItem={({ item }) => <PostCard post={item} />}
            keyExtractor={(item) => item.id.toString()}
            ListHeaderComponent={renderHeader}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 60 }}
          onScroll={handleScroll}
            refreshControl={
              <RefreshControl
          refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={colors.text}
              />
            }
          // Performance optimizations
            initialNumToRender={5}
            maxToRenderPerBatch={10}
            windowSize={11}
          getItemLayout={getItemLayout}
          />
        )}
        
        <Modal
          animationType="slide"
          transparent={false}
          visible={isModalVisible}
          onRequestClose={() => setIsModalVisible(false)}
        >
          <CreatePostScreen
            onClose={() => setIsModalVisible(false)}
            onPostCreated={(newPost) => {
              setPosts(prevPosts => [newPost, ...prevPosts]);
              setFilteredPosts(prevPosts => [newPost, ...prevPosts]);
          }}
        />
        </Modal>
      </SafeAreaView>
    </SafeViewErrorBoundary>
  );
}