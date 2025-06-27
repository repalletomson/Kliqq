import React, { useEffect, useState, useRef, useMemo } from 'react';
import { View, Text, SafeAreaView, StatusBar, TouchableOpacity, ActivityIndicator, ScrollView, ImageBackground, Dimensions, Image } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useSafeNavigation } from '../../hooks/useSafeNavigation';
import { getUserStreak, subscribeToStreakChanges, getWeeklyActivity } from '../../(apis)/streaks';
import { useAuth } from '../../context/authContext';
import * as Progress from 'react-native-progress';
import { supabase } from '../../config/supabaseConfig';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const COLORS = {
  background: '#0D0D0D',
  card: 'rgba(0, 0, 0, 0.85)',
  cardBlur: 'rgba(0, 0, 0, 0.6)',
  cardInner: 'rgba(20, 20, 20, 0.9)',
  text: '#FFFFFF',
  textSecondary: '#B8B8B8',
  accent: '#DA70D6',  // Purple accent
  accentLight: '#E6E6FA',  // Light lavender
  border: 'rgba(218, 112, 214, 0.3)',  // Purple border
  borderSecondary: 'rgba(255, 255, 255, 0.1)',
  gradientStart: '#E6E6FA',  // Light lavender
  gradientMiddle: '#DDA0DD',  // Plum
  gradientEnd: '#DA70D6',     // Orchid
};

const TimeLeftCard = ({ timeLeft }) => (
  <BlurView 
    style={{
      borderRadius: 20,
      overflow: 'hidden',
      width: '100%',
      marginBottom: 20,
      padding: 24,
      alignItems: 'center',
      elevation: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 10,
    }}
    intensity={50}
    tint="dark"
  >
    <Text style={{ 
      color: COLORS.textSecondary, 
      fontSize: 14, 
      fontWeight: '500', 
      marginBottom: 16,
      textShadowColor: 'rgba(0, 0, 0, 0.5)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 3,
    }}>
      Time Left to Keep Streak
    </Text>
    <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
      <Text style={{ 
        color: COLORS.text, 
        fontSize: 36, 
        fontWeight: '700',
        textShadowColor: 'rgba(0, 0, 0, 0.7)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
      }}>
        {String(timeLeft.hours).padStart(2, '0')}
      </Text>
      <Text style={{ color: COLORS.textSecondary, fontSize: 20, marginHorizontal: 4 }}>h</Text>
      <Text style={{ 
        color: COLORS.text, 
        fontSize: 36, 
        fontWeight: '700',
        textShadowColor: 'rgba(0, 0, 0, 0.7)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
      }}>
        {String(timeLeft.minutes).padStart(2, '0')}
      </Text>
      <Text style={{ color: COLORS.textSecondary, fontSize: 20, marginHorizontal: 4 }}>m</Text>
      <Text style={{ 
        color: COLORS.text, 
        fontSize: 36, 
        fontWeight: '700',
        textShadowColor: 'rgba(0, 0, 0, 0.7)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
      }}>
        {String(timeLeft.seconds).padStart(2, '0')}
      </Text>
      <Text style={{ color: COLORS.textSecondary, fontSize: 20, marginLeft: 4 }}>s</Text>
    </View>
  </BlurView>
);

const StreakCard = ({ streak, highestStreak }) => (
  <View style={{ alignItems: 'center', marginBottom: 24 }}>
    <LinearGradient
      colors={[COLORS.accent, '#D97706']}
      style={{
        width: 120,
        height: 120,
        borderRadius: 60,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 8,
        shadowColor: COLORS.accent,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
      }}
    >
      <MaterialCommunityIcons name="fire" size={48} color="#FFF" />
    </LinearGradient>
    <Text style={{
      color: COLORS.text,
      fontSize: 56,
      fontWeight: '900',
      marginTop: -30,
      textShadowColor: 'rgba(0, 0, 0, 0.5)',
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 4,
    }}>
      {streak}
    </Text>
    <Text style={{ color: COLORS.textSecondary, fontSize: 16, fontFamily: 'GeneralSans-Semibold', marginTop: 4 }}>
      Day Streak
    </Text>
    {highestStreak > 0 && (
      <Text style={{ color: COLORS.text, fontSize: 13, fontFamily: 'GeneralSans-Medium', marginTop: 6 }}>
        Highest: {highestStreak}
      </Text>
    )}
  </View>
);

const ProgressCard = ({ commentsCount }) => {
  const progress = useMemo(() => (commentsCount >= 5 ? 1 : commentsCount / 5), [commentsCount]);

  return (
    <View style={{
      backgroundColor: COLORS.card,
      padding: 20,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: COLORS.border,
      width: '100%',
      marginBottom: 20,
    }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <Text style={{ color: COLORS.text, fontSize: 16, fontFamily: 'GeneralSans-Semibold' }}>Today's Goal (5 Comments)</Text>
        <Text style={{ color: COLORS.accent, fontSize: 16, fontFamily: 'GeneralSans-Bold' }}>{commentsCount} / 5</Text>
      </View>
      <Progress.Bar
        progress={progress}
        width={null}
        height={8}
        color={COLORS.accent}
        unfilledColor="rgba(255, 255, 255, 0.2)"
        borderWidth={0}
        borderRadius={4}
      />
    </View>
  );
};

const InfoCard = () => (
  <View style={{
    borderRadius: 20,
    overflow: 'hidden',
    width: '100%',
    marginTop: 20,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  }}>
    <BlurView 
      style={{
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
      }}
      intensity={45}
      tint="dark"
    >
      <LinearGradient
        colors={['rgba(0, 0, 0, 0.3)', 'rgba(0, 0, 0, 0.7)']}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      />
      <View style={{
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 16,
        padding: 16,
        backgroundColor: COLORS.cardInner,
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
      }}>
        <View style={{
          backgroundColor: 'rgba(218, 112, 214, 0.2)',
          borderRadius: 20,
          padding: 8,
          marginRight: 16,
          borderWidth: 1,
          borderColor: 'rgba(218, 112, 214, 0.4)',
        }}>
          <MaterialCommunityIcons name="information-outline" size={24} color={COLORS.accent} />
        </View>
        <Text style={{ 
          flex: 1, 
          color: COLORS.textSecondary, 
          fontSize: 14, 
          fontFamily: 'GeneralSans-Medium',
          lineHeight: 20,
          textShadowColor: 'rgba(0, 0, 0, 0.5)',
          textShadowOffset: { width: 0, height: 1 },
          textShadowRadius: 2,
        }}>
          Engage with the community by commenting on posts from other users to build and maintain your streak.
        </Text>
      </View>
    </BlurView>
  </View>
);

const TopStreakLeaderboard = () => {
  const [topUsers, setTopUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopStreakUsers = async () => {
      try {
        const { data, error } = await supabase
          .from('streaks')
          .select(`
            highest_streak,
            current_streak,
            users:user_id (
              full_name,
              profile_image,
              username
            )
          `)
          .order('highest_streak', { ascending: false })
          .limit(3);

        if (error) {
          console.error('Error fetching top streak users:', error);
        } else {
          setTopUsers(data || []);
        }
      } catch (error) {
        console.error('Error fetching top streak users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopStreakUsers();
  }, []);

  const getPositionEmoji = (index) => {
    switch (index) {
      case 0: return '👑';
      case 1: return '🥈';
      case 2: return '🥉';
      default: return '🏅';
    }
  };

  const getPositionColors = (index) => {
    switch (index) {
      case 0: return { bg: 'rgba(255, 215, 0, 0.15)', border: '#FFD700', text: '#FFD700' };
      case 1: return { bg: 'rgba(192, 192, 192, 0.15)', border: '#C0C0C0', text: '#C0C0C0' };
      case 2: return { bg: 'rgba(205, 127, 50, 0.15)', border: '#CD7F32', text: '#CD7F32' };
      default: return { bg: COLORS.cardInner, border: COLORS.border, text: COLORS.accent };
    }
  };

  return (
    <BlurView 
      style={{
        borderRadius: 24,
        overflow: 'hidden',
        width: '100%',
        marginTop: 20,
        elevation: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 15,
      }}
      intensity={60}
      tint="dark"
    >
      <LinearGradient
        colors={['rgba(0, 0, 0, 0.85)', 'rgba(30, 30, 30, 0.9)', 'rgba(0, 0, 0, 0.85)']}
        style={{
          padding: 24,
        }}
      >
        {/* Header */}
        <View style={{ 
          alignItems: 'center', 
          marginBottom: 24,
          borderBottomWidth: 1,
          borderBottomColor: 'rgba(255, 255, 255, 0.1)',
          paddingBottom: 16,
        }}>
          <Text style={{ 
            color: COLORS.text, 
            fontSize: 20, 
            fontWeight: '800', 
            textAlign: 'center',
            textShadowColor: 'rgba(0, 0, 0, 0.8)',
            textShadowOffset: { width: 0, height: 2 },
            textShadowRadius: 4,
            letterSpacing: 0.5,
          }}>
            🏆 STREAK LEGENDS
          </Text>
          <Text style={{
            color: COLORS.textSecondary,
            fontSize: 14,
            marginTop: 4,
            opacity: 0.8,
          }}>
            Top performers this season
          </Text>
        </View>
        
        {loading ? (
          <View style={{ alignItems: 'center', paddingVertical: 20 }}>
            <ActivityIndicator size="large" color={COLORS.accent} />
          </View>
        ) : topUsers.length > 0 ? (
          <View style={{ gap: 16 }}>
            {topUsers.map((user, index) => {
              const position = getPositionColors(index);
              return (
                <BlurView
                  key={index}
                  style={{
                    borderRadius: 16,
                    overflow: 'hidden',
                    borderWidth: 1,
                    borderColor: position.border,
                  }}
                  intensity={30}
                  tint="dark"
                >
                  <LinearGradient
                    colors={[position.bg, 'rgba(0, 0, 0, 0.3)']}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      padding: 16,
                    }}
                  >
                    {/* Position & Avatar */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                      <View style={{
                        width: 36,
                        height: 36,
                        borderRadius: 18,
                        backgroundColor: position.bg,
                        borderWidth: 2,
                        borderColor: position.border,
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginRight: 12,
                      }}>
                        <Text style={{ fontSize: 16 }}>
                          {getPositionEmoji(index)}
                        </Text>
                      </View>
                      
                      <Image
                        source={{ 
                          uri: user.users?.profile_image || 'https://via.placeholder.com/45'
                        }}
                        style={{
                          width: 45,
                          height: 45,
                          borderRadius: 22.5,
                          borderWidth: 2,
                          borderColor: position.border,
                          marginRight: 12,
                        }}
                      />
                      
                      <View style={{ flex: 1 }}>
                        <Text style={{
                          color: COLORS.text,
                          fontSize: 16,
                          fontWeight: '600',
                          marginBottom: 2,
                        }} numberOfLines={1}>
                          {user.users?.full_name || 'Anonymous'}
                        </Text>
                        <Text style={{
                          color: COLORS.textSecondary,
                          fontSize: 12,
                          opacity: 0.8,
                        }}>
                          @{user.users?.username || 'user'}
                        </Text>
                      </View>
                    </View>

                    {/* Streak Count */}
                    <View style={{ alignItems: 'center' }}>
                      <Text style={{
                        color: position.text,
                        fontSize: 22,
                        fontWeight: '800',
                        textShadowColor: 'rgba(0, 0, 0, 0.8)',
                        textShadowOffset: { width: 0, height: 1 },
                        textShadowRadius: 3,
                      }}>
                        {user.highest_streak || 0}
                      </Text>
                      <Text style={{
                        color: COLORS.textSecondary,
                        fontSize: 11,
                        fontWeight: '500',
                        marginTop: 2,
                      }}>
                        days 🔥
                      </Text>
                    </View>
                  </LinearGradient>
                </BlurView>
              );
            })}
          </View>
        ) : (
          <View style={{ alignItems: 'center', paddingVertical: 20 }}>
            <Text style={{
              color: COLORS.textSecondary,
              fontSize: 16,
              textAlign: 'center',
              opacity: 0.8,
            }}>
              No streak data available yet
            </Text>
            <Text style={{
              color: COLORS.textSecondary,
              fontSize: 14,
              textAlign: 'center',
              marginTop: 8,
              opacity: 0.6,
            }}>
              Start posting to build your streak! 🔥
            </Text>
          </View>
        )}
      </LinearGradient>
    </BlurView>
  );
};

export default function StreakPage() {
  const { user } = useAuth();
  const [streakData, setStreakData] = useState(null);
  const [weeklyActivity, setWeeklyActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const { safeBack } = useSafeNavigation({});
  const isMounted = useRef(true);

  // Countdown timer effect
  useEffect(() => {
    isMounted.current = true;
    const timer = setInterval(() => {
      if (isMounted.current) {
        const now = new Date();
        const endOfDay = new Date(now);
        endOfDay.setHours(23, 59, 59, 999);
        
        const diff = endOfDay.getTime() - now.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        setTimeLeft({ hours, minutes, seconds });
      }
    }, 1000);

    return () => {
      isMounted.current = false;
      clearInterval(timer);
    };
  }, []);

  // Fetch and subscribe to streak data
  useEffect(() => {
    let unsubscribe;
    async function fetchAndSubscribe() {
      if (!user?.uid) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const [initialData, activityData] = await Promise.all([
          getUserStreak(user.uid),
          getWeeklyActivity(user.uid),
        ]);

        if (isMounted.current) {
          setStreakData(initialData);
          setWeeklyActivity(activityData);
        }

        // Subscribe to real-time updates
        unsubscribe = subscribeToStreakChanges(user.uid, (payload) => {
          if (isMounted.current && payload.new) {
            setStreakData(payload.new);
          }
        });
      } catch (e) {
        console.error("Error fetching streak data:", e);
      } finally {
        if (isMounted.current) {
          setLoading(false);
        }
      }
    }

    fetchAndSubscribe();

    return () => {
      if (unsubscribe) {
        supabase.removeChannel(unsubscribe);
      }
    };
  }, [user?.uid]);

  const commentsCount = streakData?.activity_counts?.comments || 0;
  const goalCompleted = commentsCount >= 5;

  return (
    <View style={{ flex: 1 }}>
      {/* Base dark background with purple tones */}
      <LinearGradient 
        colors={['#0a0a0a', '#1a1a2e', '#16213e', '#0f0f23']} 
        style={{ 
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      />
      
      {/* Purple gradient overlays - inspired by your image */}
      <LinearGradient
        colors={['rgba(139, 69, 197, 0.15)', 'transparent', 'rgba(67, 56, 202, 0.2)']}
        style={{
          position: 'absolute',
          top: -100,
          left: -50,
          width: screenWidth * 1.5,
          height: screenHeight * 0.7,
          borderRadius: screenWidth,
          transform: [{ rotate: '12deg' }],
        }}
      />
      
      <LinearGradient
        colors={['transparent', 'rgba(124, 58, 237, 0.12)', 'rgba(168, 85, 247, 0.08)']}
        style={{
          position: 'absolute',
          top: screenHeight * 0.3,
          right: -80,
          width: screenWidth * 1.3,
          height: screenHeight * 0.6,
          borderRadius: screenWidth,
          transform: [{ rotate: '-18deg' }],
        }}
      />

      <LinearGradient
        colors={['rgba(99, 102, 241, 0.1)', 'transparent', 'rgba(147, 51, 234, 0.15)']}
        style={{
          position: 'absolute',
          bottom: -120,
          left: -60,
          width: screenWidth * 1.4,
          height: screenHeight * 0.5,
          borderRadius: screenWidth,
          transform: [{ rotate: '25deg' }],
        }}
      />

      {/* Subtle center accent gradient */}
      <LinearGradient
        colors={['transparent', 'rgba(79, 70, 229, 0.06)', 'transparent']}
        style={{
          position: 'absolute',
          top: screenHeight * 0.15,
          left: 0,
          right: 0,
          height: screenHeight * 0.3,
        }}
      />

      {/* Main blur overlay */}
      <BlurView 
        style={{ flex: 1 }}
        intensity={35}
        tint="dark"
      >
        <SafeAreaView style={{ flex: 1 }}>
          <StatusBar barStyle="light-content" />
          
          {/* Header with blur background */}
          <View style={{
            borderRadius: 25,
            overflow: 'hidden',
            margin: 16,
            marginBottom: 8,
            elevation: 4,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 6,
          }}>
                         <BlurView 
               style={{
                 flexDirection: 'row', 
                 alignItems: 'center', 
                 padding: 20,
               }}
               intensity={50}
               tint="dark"
             >
                             <LinearGradient
                 colors={['rgba(0, 0, 0, 0.4)', 'rgba(0, 0, 0, 0.8)']}
                 style={{
                   position: 'absolute',
                   top: 0,
                   left: 0,
                   right: 0,
                   bottom: 0,
                 }}
               />
                             <TouchableOpacity 
                 onPress={safeBack} 
                 style={{ 
                   position: 'absolute', 
                   left: 20, 
                   zIndex: 2,
                   backgroundColor: 'rgba(0, 0, 0, 0.6)',
                   borderRadius: 20,
                   padding: 8,
                   borderWidth: 1,
                   borderColor: COLORS.border,
                 }}
               >
                <Ionicons name="arrow-back" size={24} color={COLORS.text} />
              </TouchableOpacity>
              <Text style={{ 
                flex: 1, 
                textAlign: 'center', 
                color: COLORS.text, 
                fontSize: 22, 
                fontFamily: 'GeneralSans-Bold',
                textShadowColor: 'rgba(0, 0, 0, 0.7)',
                textShadowOffset: { width: 0, height: 2 },
                textShadowRadius: 4,
              }}>
                Your Streak
              </Text>
            </BlurView>
          </View>

          {loading ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <View style={{
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                borderRadius: 50,
                padding: 20,
                borderWidth: 1,
                borderColor: COLORS.border,
              }}>
                <ActivityIndicator size="large" color={COLORS.accent} />
              </View>
            </View>
          ) : (
            <ScrollView 
              contentContainerStyle={{ 
                flexGrow: 1, 
                justifyContent: 'center', 
                alignItems: 'center', 
                padding: 24,
                paddingTop: 12,
              }}
              showsVerticalScrollIndicator={false}
            >
              <StreakCard 
                streak={streakData?.current_streak || 0} 
                highestStreak={streakData?.highest_streak || 0}
              />
              <TopStreakLeaderboard />
              {!goalCompleted ? (
                <TimeLeftCard timeLeft={timeLeft} />
              ) : null}
              <InfoCard />
            </ScrollView>
          )}
        </SafeAreaView>
      </BlurView>
    </View>
  );
}
