import React, { useState, useEffect, useRef } from 'react';
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
} from 'react-native';
import { Ionicons, FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import { collection, query, orderBy, onSnapshot, where, getCountFromServer, getDocs } from 'firebase/firestore';
import ConfettiCannon from 'react-native-confetti';
import { useSharedValue, useAnimatedStyle, withSpring, withTiming, interpolate } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import Carousel from 'react-native-reanimated-carousel';
import { db ,auth} from '../../../config/firebaseConfig';
import PostCard from '../../../components/PostCard';
import { useAuth } from '../../../context/authContext';
import CreatePostScreen from '../../../components/CreatePost';
import { router } from 'expo-router';
import { getUserStreak } from '../../../(apis)/streaks';



const { width } = Dimensions.get('window');
const SLIDER_WIDTH = width;
const ITEM_WIDTH = SLIDER_WIDTH * 0.95;

// Custom Skeleton Loader Component to replace react-native-skeleton-content-nonexpo
// const SkeletonLoader = ({ theme }) => {
//   const opacity = useRef(new Animated.Value(0.3)).current;

//   useEffect(() => {
//     const animation = Animated.loop(
//       Animated.sequence([
//         Animated.timing(opacity, {
//           toValue: 0.7,
//           duration: 800,
//           useNativeDriver: true,
//         }),
//         Animated.timing(opacity, {
//           toValue: 0.3,
//           duration: 800,
//           useNativeDriver: true,
//         }),
//       ])
//     );
    
//     animation.start();
    
//     return () => animation.stop();
//   }, [opacity]);
  
//   const skeletonColor = theme === 'dark' ? '#3F3F46' : '#E5E7EB';
  
//   const SkeletonItem = () => (
//     <Animated.View 
//       style={{
//         width: '90%',
//         height: 150,
//         backgroundColor: skeletonColor,
//         marginBottom: 10,
//         marginHorizontal: '5%',
//         borderRadius: 8,
//         opacity,
//       }}
//     />
//   );
  
//   return (
//     <View style={{ flex: 1, width: '100%', paddingVertical: 16 }}>
//       <SkeletonItem />
//       <SkeletonItem />
//       <SkeletonItem />
//     </View>
//   );
// };

export default function EnhancedHome() {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [hotPost, setHotPost] = useState(null);
  const [userStreak, setUserStreak] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCarouselIndex, setActiveCarouselIndex] = useState(0);
  const [showFullButton, setShowFullButton] = useState(true);
  const [showStreakModal, setShowStreakModal] = useState(false);
  const [carouselItems, setCarouselItems] = useState([]);
  const { user } = useAuth();
  // const user= auth.currentUser;
  const confettiRef = useRef(null);
  const streakScale = useSharedValue(1);
  const scrollY = useRef(new Animated.Value(0)).current;
  const [streakUpdated, setStreakUpdated] = useState(false);
  const [theme, setTheme] = useState(Appearance.getColorScheme() || 'dark');
  const shareButtonScale = useSharedValue(1);
  const cardOpacity = useSharedValue(0);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const searchBarHeight = useSharedValue(0);
  const searchBarOpacity = useSharedValue(0);

  // console.log(user)c
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => setTheme(colorScheme));
    return () => subscription.remove();
  }, []);

  const colors = {
    background: theme === 'dark' ? '#000000' : '#FFFFFF',
    text: theme === 'dark' ? '#FFFFFF' : '#1F1F1F',
    cardBg: theme === 'dark' ? '#121212' : '#F5F5F5',
    accent: '#8B5CF6',
    secondaryText: theme === 'dark' ? '#9E9E9E' : '#6B7280',
    border: theme === 'dark' ? '#333333' : '#E5E7EB',
  };
 console.log("home") 
  const baseCarouselItems = [
    { id: 1, title: "ChatWithFriends", text: "Learn to code with peers", path:"chat",image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97", type: "info" },
    { id: 2, title: "Join in groups", text: "Prepare for interviews",path:"groups", image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f", type: "info" },
    { id: 3, title: "Connect", text: "Connect with peers ,friends and mentors",path:"connect", image: "https://images.unsplash.com/photo-1531403009284-440f080d1e12", type: "info" },
  ];

  const streakAnimatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: streakScale.value }] }));

  const fetchHotPosts = async () => {
    try {
      const postsCountSnapshot = await getCountFromServer(query(collection(db, 'posts')));
      if (postsCountSnapshot.data().count < 1) return null;

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const hotPostsQuery = query(collection(db, 'posts'), where('createdAt', '>=', yesterday), where('createdAt', '<', today));
      const hotPostsSnapshot = await getDocs(hotPostsQuery);
      if (hotPostsSnapshot.empty) return null;

      const posts = hotPostsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        engagementScore: (Array.isArray(doc.data().likes) ? doc.data().likes.length : 0) + (Array.isArray(doc.data().comments) ? doc.data().comments.length : 0),
      }));

      posts.sort((a, b) => b.engagementScore - a.engagementScore || b.createdAt.toDate() - a.createdAt.toDate());
      return posts.length > 0 ? posts[0] : null;
    } catch (error) {
      console.error('Error fetching hot post:', error);
      return null;
    }
  };

  const pulseStreak = () => {
    streakScale.value = withSpring(1.2, { damping: 2 });
    setTimeout(() => streakScale.value = withSpring(1), 300);
  };

  useEffect(() => {
    console.log("useEffect",user)
    if (!user?.college?.id) return;
    console.log("1")
    setLoading(true);
    const postsRef = collection(db, 'posts');
    console.log("1")
    const q = query(postsRef, orderBy('createdAt', 'desc'));
    console.log("2")

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newPosts = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setPosts(newPosts);
      // console.log("posts",newPosts)
      setFilteredPosts(newPosts);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching posts:", error);
      setLoading(false);
    });
    return unsubscribe;
  }, [user?.college?.id]);



  useEffect(() => {
    if (!user?.college?.id) return;
    const getHotPost = async () => {
      const hotPostData = await fetchHotPosts();
      setHotPost(hotPostData);
      setCarouselItems(hotPostData ? [{ id: 'hot-post', title: "Hot Post of the Day", post: hotPostData, type: "hot-post" }, ...baseCarouselItems] : baseCarouselItems);
    };
    getHotPost();
  }, [user?.college?.id]);

  useEffect(() => {
    if (!user?.uid) return;
    const loadUserStreak = async () => {
      const streakData = await getUserStreak(user.uid);
      setUserStreak(streakData);
      if (streakData && streakData.currentStreak > 0 && streakData.streakActive) pulseStreak();
    };
    loadUserStreak();
  }, [user?.uid]);

  useEffect(() => {
    if (streakUpdated && user?.uid) {
      const updateStreakDisplay = async () => {
        const streakData = await getUserStreak(user.uid);
        setUserStreak(streakData);
        if (streakData && streakData.currentStreak > 0 && streakData.streakActive) {
          pulseStreak();
          confettiRef.current?.start();
        }
        setStreakUpdated(false);
      };
      updateStreakDisplay();
    }
  }, [streakUpdated, user?.uid]);

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

  const handleScroll = (event) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    scrollY.setValue(offsetY);
    setShowFullButton(offsetY <= 40);
  };

  const navigateToProfile = () => router.push('(root)/profile');

  const handleRefresh = async () => {
    setRefreshing(true);
    if (user?.uid) {
      const streakData = await getUserStreak(user.uid);
      setUserStreak(streakData);
      const hotPostData = await fetchHotPosts();
      setHotPost(hotPostData);
      setCarouselItems(hotPostData ? [{ id: 'hot-post', title: "Hot Post of the Day", post: hotPostData, type: "hot-post" }, ...baseCarouselItems] : baseCarouselItems);
    }
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handlePostCreated = async (streakData) => {
    if (streakData && !streakData.streakActive) {
      setStreakUpdated(true);
      setShowStreakModal(true);
      setTimeout(() => setShowStreakModal(false), 3000);
    }
    setIsModalVisible(false);
  };

  const renderHotPostMetadata = (post) => {
    if (!post) return null;
    const formattedTime = post.createdAt?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || '';
    return (
      <TouchableOpacity onPress={() => router.push(`/postDetailView/${post.id}`)} >
      <View className="flex-row items-center">
        <Image source={{ uri: post.userPhotoURL || 'https://via.placeholder.com/40' }} className="w-8 h-8 rounded-full mr-2" style={{ borderWidth: 1, borderColor: colors.accent }} />
        <View>
          <Text style={{ color: colors.text, fontWeight: '600', fontSize: 14 }}>{post.userName || 'Anonymous'}</Text>
          <Text style={{ color: colors.secondaryText, fontSize: 10 }}>{formattedTime}</Text>
        </View>
      </View>
      </TouchableOpacity>
      
    );
  };

  // const handleNavigateToDetail = (post) => {
  //   if (post?.id) router.push({ pathname: 'postDetailView', params: { postId: post.id } });
  // };

  const renderCarouselItem = ({ item, index }) => {
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

    return (
      <LinearGradient
        colors={currentColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          width: width * 0.92,
          height: 140,
          borderRadius: 20,
          marginHorizontal: width * 0.04,
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.1)',
        }}
      >
        <Text
          style={{
            color: '#fff',
            fontSize: 24,
            fontWeight: '700',
            letterSpacing: 0.5,
            textAlign: 'center',
            textShadowColor: 'rgba(0, 0, 0, 0.3)',
            textShadowOffset: { width: 0, height: 1 },
            textShadowRadius: 2,
          }}
        >
          {mainText}
        </Text>
        <Text
          style={{
            color: 'rgba(255, 255, 255, 0.9)',
            fontSize: 14,
            fontWeight: '500',
            marginTop: 6,
            textAlign: 'center',
            opacity: 0.8,
          }}
        >
          {subText}
        </Text>
      </LinearGradient>
    );
  };

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

  const Header = () => (
    <View style={{ 
      paddingTop: Platform.OS === 'ios' ? 50 : 40, 
      paddingHorizontal: 20, 
      paddingBottom: 16, 
      backgroundColor: colors.background 
    }}>
      <View style={{ 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        marginBottom: 12,
      }}>
        {/* Left Section - App Name and Streak */}
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <Text style={{ 
            color: colors.text, 
            fontSize: 28, 
            fontWeight: '800',
            marginRight: 16,
          }}>
            Kliq
          </Text>
          {userStreak && (
            <TouchableOpacity
              style={{ 
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: colors.cardBg,
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: userStreak.streakActive ? '#F97316' : colors.border
              }}
            >
              <MaterialCommunityIcons 
                name="fire" 
                size={18} 
                color={userStreak.streakActive ? "#F97316" : colors.accent} 
              />
              <Text 
                style={{ 
                  color: userStreak.streakActive ? '#F97316' : colors.accent,
                  fontWeight: '700',
                  fontSize: 14,
                  marginLeft: 6
                }}
              >
                {userStreak.currentStreak}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Right Section - Search and Profile */}
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity 
            onPress={toggleSearch}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: colors.accent,
              marginRight: 12,
              elevation: 3,
              shadowColor: colors.accent,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
            }}
          >
            <Ionicons name="search" size={22} color="#FFF" />
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={navigateToProfile}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              overflow: 'hidden',
              borderWidth: 2,
              borderColor: colors.accent
            }}
          >
            <Image 
              source={{ uri: user?.photoURL || 'https://via.placeholder.com/40' }} 
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const StreakDisplay = () => {
    if (!userStreak) return null;
    const isStreakActiveToday = userStreak.streakActive || false;
    return (
      <Animated.View
        className="flex-row items-center rounded-full px-2 py-1 z-2000"
        style={[streakAnimatedStyle, { backgroundColor: colors.cardBg, borderWidth: 1, borderColor: isStreakActiveToday ? '#F97316' : colors.border }]}
      >
        <MaterialCommunityIcons name="fire" size={16} color={isStreakActiveToday ? "#F97316" : colors.accent} />
        <Text style={{ color: isStreakActiveToday ? '#F97316' : colors.accent, fontWeight: '600', fontSize: 12, marginLeft: 4 }}>
          {userStreak.currentStreak} day{userStreak.currentStreak !== 1 ? 's' : ''}
        </Text>
      </Animated.View>
    );
  };

  const StreakModal = () => (
    <Modal transparent={true} visible={showStreakModal} animationType="fade">
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 2000 }}>
        <View
          className="rounded-2xl p-6 w-4/5"
          style={{
            backgroundColor: colors.cardBg,
            borderWidth: 1,
            borderColor: colors.accent,
            elevation: 10,
            shadowColor: colors.accent,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.4,
            shadowRadius: 8,
          }}
        >
          <View className="items-center">
            <LinearGradient
              colors={['#F97316', '#F59E0B']}
              className="w-16 h-16 rounded-full items-center justify-center mb-4"
            >
              <MaterialCommunityIcons name="fire" size={32} color="#FFF" />
            </LinearGradient>
            <Text style={{ color: colors.text, fontSize: 20, fontWeight: '700' }}>Streak Milestone!</Text>
            <Text style={{ color: colors.accent, fontSize: 28, fontWeight: '800', marginVertical: 8 }}>
              🔥 {userStreak?.currentStreak || 0} Days 🔥
            </Text>
            <Text style={{ color: colors.secondaryText, fontSize: 14, textAlign: 'center' }}>
              Keep the momentum going! Post daily to maintain your streak.
            </Text>
          </View>
          <TouchableOpacity
            className="mt-6 bg-accent rounded-lg py-2"
            onPress={() => setShowStreakModal(false)}
            style={{ backgroundColor: colors.accent }}
          >
            <Text style={{ color: '#FFF', textAlign: 'center', fontWeight: '600', fontSize: 16 }}>Got It</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderEmptyState = () => (
    <TouchableOpacity>
    <View className="flex-1 justify-center items-center py-20">
      <Image source={{ uri: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e' }} className="w-32 h-32 rounded-full mb-4" />
      <Text style={{ color: colors.text, fontSize: 16, fontWeight: '600' }}>"Be the first to spark a conversation!"</Text>
      <Text style={{ color: colors.secondaryText, fontSize: 12, marginTop: 4 }}>Add your first post now.</Text>
    </View>
    </TouchableOpacity>
  );

  const renderFooter = () => filteredPosts.length > 0 ? (
    <View className="py-6 items-center">
      <Image source={{ uri: 'https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0' }} className="w-24 h-24 rounded-4 mb-2" />
      <Text style={{ color: colors.secondaryText, fontSize: 14 }}>You've reached the end!</Text>
    </View>
  ) : null;

  useEffect(() => {
    // Fade in animation for the card
    cardOpacity.value = withTiming(1, { duration: 500 });
  }, []);

  const shareButtonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: shareButtonScale.value }]
  }));

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value
  }));

  const handleSharePress = () => {
    shareButtonScale.value = withSpring(0.95, {}, () => {
      shareButtonScale.value = withSpring(1);
    });
    setIsModalVisible(true);
  };

  const PostInput = () => (
    <Animated.View 
      style={[
        {
          backgroundColor: colors.cardBg,
          marginHorizontal: 16,
          marginVertical: 16,
          borderRadius: 20,
          elevation: 4,
          shadowColor: colors.accent,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.1)',
        },
        cardAnimatedStyle
      ]}
    >
      {/* Main Input Row */}
      <TouchableOpacity 
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          padding: 16,
          borderBottomWidth: 1,
          borderBottomColor: 'rgba(255, 255, 255, 0.1)',
        }}
        onPress={() => setIsModalVisible(true)}
      >
        <Image 
          source={{ uri: user?.photoURL || 'https://via.placeholder.com/40' }}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            borderWidth: 2,
            borderColor: colors.accent
          }}
        />
        <View style={{ flex: 1, marginLeft: 16 }}>
          <Text style={{ 
            color: colors.secondaryText, 
            fontSize: 16,
            fontWeight: '500'
          }}>
            What's happening?
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => setIsModalVisible(true)}
          // style={{
          //   backgroundColor: colors.accent,
          //   paddingHorizontal: 20,
          //   paddingVertical: 10,
          //   borderRadius: 20,
          // }}
        >
          {/* <Text style={{ 
            color: '#FFF', 
            fontWeight: '700', 
            fontSize: 14 
          }}>
            Post
          </Text> */}
           <TouchableOpacity 
            style={{
              width: 36,
              height: 36,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 18,
              backgroundColor: `${colors.accent}15`,
              marginRight: 16,
            }}
            onPress={() => setIsModalVisible(true)}
          >
            <Ionicons name="image-outline" size={20} color={colors.accent} />
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>

   
    </Animated.View>
  );

  if (loading === 0) {
    console.log('nothing')
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'black' }}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      
      {/* Sticky Header */}
      <Header />

      <FlatList
        data={filteredPosts}
        renderItem={({ item }) => <PostCard post={item} />}
        keyExtractor={item => item.id}
        ListHeaderComponent={
          <>
            {/* Post Input */}
            <PostInput />
            
            {/* Carousel with dots on top */}
            {carouselItems.length > 0 && (
              <View style={{ marginVertical: 16 }}>
                {/* Dots on top */}
                <View style={{
                  flexDirection: 'row',
                  justifyContent: 'center',
                  marginBottom: 12,
                  paddingHorizontal: 20,
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
                
                <Carousel
                  width={SLIDER_WIDTH}
                  height={160}
                  data={carouselItems}
                  renderItem={renderCarouselItem}
                  mode="parallax"
                  modeConfig={{ parallaxScrollingScale: 0.95, parallaxScrollingOffset: 30 }}
                  loop
                  autoPlay
                  autoPlayInterval={5000}
                  onProgressChange={(_, absoluteProgress) => setActiveCarouselIndex(Math.round(absoluteProgress))}
                  scrollAnimationDuration={1000}
                />
              </View>
            )}
          </>
        }
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={renderFooter}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        contentContainerStyle={{ paddingBottom: 80 }}
      />

      {isModalVisible && (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000 }}>
          <CreatePostScreen visible={isModalVisible} onClose={() => setIsModalVisible(false)} onPostCreated={handlePostCreated} user={user} />
        </View>
      )}

      <StreakModal />
      <ConfettiCannon ref={confettiRef} count={50} origin={{ x: width / 2, y: 0 }} autoStart={false} fadeOut={true} colors={['#8B5CF6', '#F97316', '#F59E0B', '#10B981']} />
    </SafeAreaView>
  );
}

// export default EnhancedHome;  

// import React, { useState, useEffect, useRef } from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   SafeAreaView,
//   Image,
//   StatusBar,
//   Dimensions,
//   Animated,
//   TextInput,
//   StyleSheet,
//   Modal,
//   Appearance,
//   FlatList,
//   Platform,
// } from 'react-native';
// import { Ionicons, FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
// import { collection, query, orderBy, onSnapshot, where, getCountFromServer, getDocs } from 'firebase/firestore';
// import ConfettiCannon from 'react-native-confetti';
// import { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
// import { LinearGradient } from 'expo-linear-gradient';
// import Carousel from 'react-native-reanimated-carousel';
// import { db, auth } from '../../../config/firebaseConfig';
// import PostCard from '../../../components/PostCard';
// import { useAuth } from '../../../context/authContext';
// import CreatePostScreen from '../../../components/CreatePost';
// import { router } from 'expo-router';
// import { getUserStreak } from '../../../(apis)/streaks';

// const { width, height } = Dimensions.get('window');
// const SLIDER_WIDTH = width;
// const ITEM_WIDTH = SLIDER_WIDTH * 0.95;

// export default function EnhancedHome() {
//   const [posts, setPosts] = useState([]);
//   const [filteredPosts, setFilteredPosts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [isModalVisible, setIsModalVisible] = useState(false);
//   const [hotPost, setHotPost] = useState(null);
//   const [userStreak, setUserStreak] = useState(null);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [activeCarouselIndex, setActiveCarouselIndex] = useState(0);
//   const [showFullButton, setShowFullButton] = useState(true);
//   const [showStreakModal, setShowStreakModal] = useState(false);
//   const [carouselItems, setCarouselItems] = useState([]);
//   const { user } = useAuth();
//   const confettiRef = useRef(null);
//   const streakScale = useSharedValue(1);
//   const scrollY = useRef(new Animated.Value(0)).current;
//   const [streakUpdated, setStreakUpdated] = useState(false);
//   const [theme, setTheme] = useState(Appearance.getColorScheme() || 'dark');

//   useEffect(() => {
//     const subscription = Appearance.addChangeListener(({ colorScheme }) => setTheme(colorScheme));
//     return () => subscription.remove();
//   }, []);

//   const colors = {
//     background: theme === 'dark' ? '#000000' : '#FFFFFF',
//     text: theme === 'dark' ? '#FFFFFF' : '#1F1F1F',
//     cardBg: theme === 'dark' ? '#121212' : '#F5F5F5',
//     accent: '#8B5CF6',
//     secondaryText: theme === 'dark' ? '#9E9E9E' : '#6B7280',
//     border: theme === 'dark' ? '#333333' : '#E5E7EB',
//   };

//   const baseCarouselItems = [
//     { id: 1, title: "ChatWithFriends", text: "Learn to code with peers", path: "chat", image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97", type: "info" },
//     { id: 2, title: "Join in groups", text: "Prepare for interviews", path: "groups", image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f", type: "info" },
//     { id: 3, title: "Connect", text: "Connect with peers, friends and mentors", path: "connect", image: "https://images.unsplash.com/photo-1531403009284-440f080d1e12", type: "info" },
//   ];

//   const streakAnimatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: streakScale.value }] }));

//   const fetchHotPosts = async () => {
//     try {
//       const postsCountSnapshot = await getCountFromServer(query(collection(db, 'posts')));
//       if (postsCountSnapshot.data().count < 1) return null;

//       const today = new Date();
//       today.setHours(0, 0, 0, 0);
//       const yesterday = new Date(today);
//       yesterday.setDate(yesterday.getDate() - 1);

//       const hotPostsQuery = query(collection(db, 'posts'), where('createdAt', '>=', yesterday), where('createdAt', '<', today));
//       const hotPostsSnapshot = await getDocs(hotPostsQuery);
//       if (hotPostsSnapshot.empty) return null;

//       const posts = hotPostsSnapshot.docs.map(doc => ({
//         id: doc.id,
//         ...doc.data(),
//         engagementScore: (Array.isArray(doc.data().likes) ? doc.data().likes.length : 0) + (Array.isArray(doc.data().comments) ? doc.data().comments.length : 0),
//       }));

//       posts.sort((a, b) => b.engagementScore - a.engagementScore || b.createdAt.toDate() - a.createdAt.toDate());
//       return posts.length > 0 ? posts[0] : null;
//     } catch (error) {
//       console.error('Error fetching hot post:', error);
//       return null;
//     }
//   };

//   const pulseStreak = () => {
//     streakScale.value = withSpring(1.2, { damping: 2 });
//     setTimeout(() => streakScale.value = withSpring(1), 300);
//   };

//   useEffect(() => {
//     if (!user?.college?.id) return;
//     setLoading(true);
//     const postsRef = collection(db, 'posts');
//     const q = query(postsRef, orderBy('createdAt', 'desc'));
//     const unsubscribe = onSnapshot(q, (snapshot) => {
//       const newPosts = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
//       setPosts(newPosts);
//       setFilteredPosts(newPosts);
//       setLoading(false);
//     }, (error) => {
//       console.error("Error fetching posts:", error);
//       setLoading(false);
//     });
//     return unsubscribe;
//   }, [user?.college?.id]);

//   useEffect(() => {
//     if (!user?.college?.id) return;
//     const getHotPost = async () => {
//       const hotPostData = await fetchHotPosts();
//       setHotPost(hotPostData);
//       setCarouselItems(hotPostData ? [{ id: 'hot-post', title: "Hot Post of the Day", post: hotPostData, type: "hot-post" }, ...baseCarouselItems] : baseCarouselItems);
//     };
//     getHotPost();
//   }, [user?.college?.id]);

//   useEffect(() => {
//     if (!user?.uid) return;
//     const loadUserStreak = async () => {
//       const streakData = await getUserStreak(user.uid);
//       setUserStreak(streakData);
//       if (streakData && streakData.currentStreak > 0 && streakData.streakActive) pulseStreak();
//     };
//     loadUserStreak();
//   }, [user?.uid]);

//   useEffect(() => {
//     if (streakUpdated && user?.uid) {
//       const updateStreakDisplay = async () => {
//         const streakData = await getUserStreak(user.uid);
//         setUserStreak(streakData);
//         if (streakData && streakData.currentStreak > 0 && streakData.streakActive) {
//           pulseStreak();
//           confettiRef.current?.start();
//         }
//         setStreakUpdated(false);
//       };
//       updateStreakDisplay();
//     }
//   }, [streakUpdated, user?.uid]);

//   useEffect(() => {
//     if (searchQuery.trim() === '') {
//       setFilteredPosts(posts);
//     } else {
//       const queryLower = searchQuery.toLowerCase();
//       setFilteredPosts(posts.filter(post =>
//         post.content?.toLowerCase().includes(queryLower) ||
//         post.userName?.toLowerCase().includes(queryLower) ||
//         (post.tags && post.tags.some(tag => tag.toLowerCase().includes(queryLower)))
//       ));
//     }
//   }, [searchQuery, posts]);

//   const handleScroll = (event) => {
//     const offsetY = event.nativeEvent.contentOffset.y;
//     scrollY.setValue(offsetY);
//     setShowFullButton(offsetY <= 40);
//   };

//   const navigateToProfile = () => router.push('(root)/profile');

//   const handleRefresh = async () => {
//     setRefreshing(true);
//     if (user?.uid) {
//       const streakData = await getUserStreak(user.uid);
//       setUserStreak(streakData);
//       const hotPostData = await fetchHotPosts();
//       setHotPost(hotPostData);
//       setCarouselItems(hotPostData ? [{ id: 'hot-post', title: "Hot Post of the Day", post: hotPostData, type: "hot-post" }, ...baseCarouselItems] : baseCarouselItems);
//     }
//     setTimeout(() => setRefreshing(false), 1000);
//   };

//   const handlePostCreated = async (streakData) => {
//     if (streakData && !streakData.streakActive) {
//       setStreakUpdated(true);
//       setShowStreakModal(true);
//       setTimeout(() => setShowStreakModal(false), 3000);
//     }
//     setIsModalVisible(false);
//   };

//   const renderHotPostMetadata = (post) => {
//     if (!post) return null;
//     const formattedTime = post.createdAt?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || '';
//     return (
//       <TouchableOpacity onPress={() => router.push(`/postDetailView/${post.id}`)}>
//         <View className="flex-row items-center">
//           <Image source={{ uri: post.userPhotoURL || 'https://via.placeholder.com/40' }} className="w-8 h-8 rounded-full mr-2" style={{ borderWidth: 1, borderColor: colors.accent }} />
//           <View>
//             <Text style={{ color: colors.text, fontWeight: '600', fontSize: 14 }}>{post.userName || 'Anonymous'}</Text>
//             <Text style={{ color: colors.secondaryText, fontSize: 10 }}>{formattedTime}</Text>
//           </View>
//         </View>
//       </TouchableOpacity>
//     );
//   };

//   const renderCarouselItem = ({ item }) => {
//     // Example: use your own text logic here
//     const mainText = item.title?.toUpperCase() || "LEADERBOARD CYCLE";
//     const subText = item.text || "Cycle 1 is over! Did you win?";

//     return (
//       <LinearGradient
//         colors={['#B621FE', '#1E0066']}
//         start={{ x: 0, y: 0 }}
//         end={{ x: 0, y: 1 }}
//         style={{
//           width: width * 0.98,
//           height: 160,
//           borderRadius: 20,
//           marginHorizontal: width * 0.01,
//           justifyContent: 'center',
//           alignItems: 'center',
//           overflow: 'hidden',
//         }}
//       >
//         {/* Optional: Grid overlay (skip or use SVG if you want) */}
//         {/* <GridOverlay /> */}

//         <Text
//           style={{
//             color: '#fff',
//             fontSize: 32,
//             fontWeight: 'bold',
//             letterSpacing: 1,
//             textTransform: 'uppercase',
//             textAlign: 'center',
//           }}
//         >
//           {mainText}
//         </Text>
//         <Text
//           style={{
//             color: '#fff',
//             fontSize: 16,
//             fontStyle: 'italic',
//             marginTop: 8,
//             textAlign: 'center',
//             opacity: 0.9,
//           }}
//         >
//           {subText}
//         </Text>
//       </LinearGradient>
//     );
//   };

//   const SearchBar = () => (
//     <View className="mx-7 mb-4 rounded-lg flex-row items-center px-3 py-2" style={{ backgroundColor: colors.cardBg, borderWidth: 1, borderColor: colors.border }}>
//       <Ionicons name="search" size={18} color={colors.secondaryText} />
//       <TextInput
//         className="flex-1 ml-2 py-1"
//         style={{ color: colors.text }}
//         placeholder="Search posts, users, tags..."
//         placeholderTextColor={colors.secondaryText}
//         value={searchQuery}
//         onChangeText={setSearchQuery}
//       />
//       {searchQuery.length > 0 && <TouchableOpacity onPress={() => setSearchQuery('')}><Ionicons name="close-circle" size={18} color={colors.secondaryText} /></TouchableOpacity>}
//     </View>
//   );

//   const StreakDisplay = () => {
//     if (!userStreak) return null;
//     const isStreakActiveToday = userStreak.streakActive || false;
//     return (
//       <Animated.View
//         className="flex-row items-center rounded-full px-2 py-1 z-2000"
//         style={[streakAnimatedStyle, { backgroundColor: colors.cardBg, borderWidth: 1, borderColor: isStreakActiveToday ? '#F97316' : colors.border }]}
//       >
//         <MaterialCommunityIcons name="fire" size={16} color={isStreakActiveToday ? "#F97316" : colors.accent} />
//         <Text style={{ color: isStreakActiveToday ? '#F97316' : colors.accent, fontWeight: '600', fontSize: 12, marginLeft: 4 }}>
//           {userStreak.currentStreak} day{userStreak.currentStreak !== 1 ? 's' : ''}
//         </Text>
//       </Animated.View>
//     );
//   };

//   const StreakModal = () => (
//     <Modal transparent={true} visible={showStreakModal} animationType="fade">
//       <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 2000 }}>
//         <View
//           className="rounded-2xl p-6 w-4/5"
//           style={{
//             backgroundColor: colors.cardBg,
//             borderWidth: 1,
//             borderColor: colors.accent,
//             elevation: 10,
//             shadowColor: colors.accent,
//             shadowOffset: { width: 0, height: 4 },
//             shadowOpacity: 0.4,
//             shadowRadius: 8,
//           }}
//         >
//           <View className="items-center">
//             <LinearGradient
//               colors={['#F97316', '#F59E0B']}
//               className="w-16 h-16 rounded-full items-center justify-center mb-4"
//             >
//               <MaterialCommunityIcons name="fire" size={32} color="#FFF" />
//             </LinearGradient>
//             <Text style={{ color: colors.text, fontSize: 20, fontWeight: '700' }}>Streak Milestone!</Text>
//             <Text style={{ color: colors.accent, fontSize: 28, fontWeight: '800', marginVertical: 8 }}>
//               🔥 {userStreak?.currentStreak || 0} Days 🔥
//             </Text>
//             <Text style={{ color: colors.secondaryText, fontSize: 14, textAlign: 'center' }}>
//               Keep the momentum going! Post daily to maintain your streak.
//             </Text>
//           </View>
//           <TouchableOpacity
//             className="mt-6 bg-accent rounded-lg py-2"
//             onPress={() => setShowStreakModal(false)}
//             style={{ backgroundColor: colors.accent }}
//           >
//             <Text style={{ color: '#FFF', textAlign: 'center', fontWeight: '600', fontSize: 16 }}>Got It</Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     </Modal>
//   );

//   const renderEmptyState = () => (
//     <TouchableOpacity>
//       <View className="flex-1 justify-center items-center py-20">
//         <Image source={{ uri: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e' }} className="w-32 h-32 rounded-full mb-4" />
//         <Text style={{ color: colors.text, fontSize: 16, fontWeight: '600' }}>"Be the first to spark a conversation!"</Text>
//         <Text style={{ color: colors.secondaryText, fontSize: 12, marginTop: 4 }}>Add your first post now.</Text>
//       </View>
//     </TouchableOpacity>
//   );

//   const renderFooter = () => filteredPosts.length > 0 ? (
//     <View className="py-6 items-center">
//       <Image source={{ uri: 'https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0' }} className="w-24 h-24 rounded-4 mb-2" />
//       <Text style={{ color: colors.secondaryText, fontSize: 14 }}>You've reached the end!</Text>
//     </View>
//   ) : null;

//   if (loading === 0) {
//     return (
//       <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
//         <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
//       </SafeAreaView>
//     );
//   }

//   // --- GLASSMORPHISM ANIMATION ---
//   const opacityAnim = useRef(new Animated.Value(0.3)).current;

//   useEffect(() => {
//     Animated.loop(
//       Animated.sequence([
//         Animated.timing(opacityAnim, {
//           toValue: 0.5,
//           duration: 3000,
//           useNativeDriver: true,
//         }),
//         Animated.timing(opacityAnim, {
//           toValue: 0.3,
//           duration: 3000,
//           useNativeDriver: true,
//         }),
//       ])
//     ).start();
//   }, []);

//   // --- MAIN RENDER ---
//   return (
//     <SafeAreaView style={{ flex: 1, backgroundColor: 'transparent' }}>
//       {/* Glassmorphism Animated Background */}
//       <Animated.View
//         style={{
//           ...StyleSheet.absoluteFillObject,
//           zIndex: -1,
//           opacity: opacityAnim,
//         }}
//       >
//         <View
//           style={{
//             flex: 1,
//             width,
//             height,
//             backgroundColor: theme === 'dark' ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.3)',
//           }}
//         >
//           <LinearGradient
//             colors={['rgba(139,92,246,0.15)', 'rgba(0,0,0,0.15)']}
//             style={{ ...StyleSheet.absoluteFillObject }}
//           />
//         </View>
//       </Animated.View>

//       {/* All your existing UI below */}
//       <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} backgroundColor="transparent" translucent />
//       <View className="flex-row items-center justify-between pt-10 px-4 pb-3" style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}>
//         <View className="flex-row items-center">
//           <Text style={{ color: colors.text, fontSize: 24, fontWeight: '700' }}>Kliq</Text>
//           {userStreak && <View className="ml-2"><StreakDisplay /></View>}
//         </View>
//         <TouchableOpacity onPress={navigateToProfile} className="p-1 rounded-full" style={{ borderWidth: 1, borderColor: colors.accent }}>
//           <Image source={{ uri: user?.photoURL || 'https://via.placeholder.com/40' }} className="w-8 h-8 rounded-full" />
//         </TouchableOpacity>
//       </View>

//       <FlatList
//         data={filteredPosts}
//         renderItem={({ item }) => <PostCard post={item} />}
//         keyExtractor={item => item.id}
//         ListHeaderComponent={
//           <>
//             <SearchBar />
//             {carouselItems.length > 0 && (
//               <View className="my-2">
//                 <Carousel
//                   width={SLIDER_WIDTH}
//                   height={240}
//                   data={carouselItems}
//                   renderItem={renderCarouselItem}
//                   mode="parallax"
//                   modeConfig={{ parallaxScrollingScale: 0.9, parallaxScrollingOffset: 40 }}
//                   loop
//                   autoPlay
//                   autoPlayInterval={4000}
//                   onProgressChange={(_, absoluteProgress) => setActiveCarouselIndex(Math.round(absoluteProgress))}
//                   scrollAnimationDuration={800}
//                 />
//                 <View className="flex-row justify-center mt-2">
//                   {carouselItems.map((_, index) => (
//                     <View key={`indicator-${index}`} className={`w-2 h-2 mx-1 rounded-full ${index === activeCarouselIndex ? 'bg-purple-500' : 'bg-gray-400'}`} />
//                   ))}
//                 </View>
//               </View>
//             )}
//           </>
//         }
//         ListEmptyComponent={renderEmptyState}
//         ListFooterComponent={renderFooter}
//         onScroll={handleScroll}
//         scrollEventThrottle={16}
//         refreshing={refreshing}
//         onRefresh={handleRefresh}
//         contentContainerStyle={{ paddingBottom: 80 }}
//       />

//       <Animated.View className="absolute bottom-20 right-4" style={{ transform: [{ scale: scrollY.interpolate({ inputRange: [0, 100], outputRange: [1, 0.9], extrapolate: 'clamp' }) }] }}>
//         {showFullButton ? (
//           <TouchableOpacity className="rounded-full flex-row items-center px-4 py-2" style={{ backgroundColor: colors.accent, elevation: 6 }} onPress={() => setIsModalVisible(true)}>
//             <Ionicons name="add" size={20} color="#FFF" />
//             <Text style={{ color: '#FFF', fontWeight: '600', marginLeft: 4 }}>Create Post</Text>
//           </TouchableOpacity>
//         ) : (
//           <TouchableOpacity className="w-12 h-12 rounded-full justify-center items-center" style={{ backgroundColor: colors.accent, elevation: 6 }} onPress={() => setIsModalVisible(true)}>
//             <Ionicons name="add" size={24} color="#FFF" />
//           </TouchableOpacity>
//         )}
//       </Animated.View>

//       {isModalVisible && (
//         <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000 }}>
//           <CreatePostScreen visible={isModalVisible} onClose={() => setIsModalVisible(false)} onPostCreated={handlePostCreated} user={user} />
//         </View>
//       )}

//       <StreakModal />
//       <ConfettiCannon ref={confettiRef} count={50} origin={{ x: width / 2, y: 0 }} autoStart={false} fadeOut={true} colors={['#8B5CF6', '#F97316', '#F59E0B', '#10B981']} />
//     </SafeAreaView>
//   );
// }