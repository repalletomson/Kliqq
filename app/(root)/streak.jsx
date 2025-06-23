import React, { useEffect, useState, useRef, useMemo } from 'react';
import { View, Text, SafeAreaView, StatusBar, TouchableOpacity, ActivityIndicator, ScrollView, ImageBackground, Dimensions } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from '@react-native-community/blur';
import { useSafeNavigation } from '../../hooks/useSafeNavigation';
import { getUserStreak, subscribeToStreakChanges, getWeeklyActivity } from '../../(apis)/streaks';
import { useAuth } from '../../context/authContext';
import * as Progress from 'react-native-progress';
import { supabase } from '../../config/supabaseConfig';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const COLORS = {
  background: '#0D0D0D',
  card: 'rgba(26, 26, 26, 0.8)',
  cardBlur: 'rgba(255, 255, 255, 0.1)',
  text: '#FFFFFF',
  textSecondary: '#A1A1AA',
  accent: '#F97316',
  accentLight: '#FDBA74',
  border: 'rgba(255, 255, 255, 0.15)',
  gradientStart: '#1A1A2E',
  gradientMiddle: '#16213E',
  gradientEnd: '#0F3460',
};

const TimeLeftCard = ({ timeLeft }) => (
  <View style={{
    borderRadius: 20,
    overflow: 'hidden',
    width: '100%',
    marginBottom: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  }}>
    <BlurView 
      style={{
        padding: 24,
        alignItems: 'center',
      }}
      blurType="dark"
      blurAmount={20}
      reducedTransparencyFallbackColor="rgba(26, 26, 26, 0.9)"
    >
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.15)', 'rgba(255, 255, 255, 0.05)']}
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
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 16,
        padding: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        alignItems: 'center',
        width: '100%',
      }}>
        <Text style={{ 
          color: COLORS.textSecondary, 
          fontSize: 14, 
          fontWeight: '500', 
          marginBottom: 12,
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
      </View>
    </BlurView>
  </View>
);

const StreakCard = ({ streak, highestStreak }) => (
  <View style={{ alignItems: 'center', marginBottom: 30 }}>
    <LinearGradient
      colors={[COLORS.accent, '#D97706']}
      style={{
        width: 160,
        height: 160,
        borderRadius: 80,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 10,
        shadowColor: COLORS.accent,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
      }}
    >
      <MaterialCommunityIcons name="fire" size={64} color="#FFF" />
    </LinearGradient>
    <Text style={{
      color: COLORS.text,
      fontSize: 72,
      fontWeight: '900',
      marginTop: -40,
      textShadowColor: 'rgba(0, 0, 0, 0.5)',
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 4,
    }}>
      {streak}
    </Text>
    <Text style={{ color: COLORS.textSecondary, fontSize: 18, fontFamily: 'GeneralSans-Semibold', marginTop: 4 }}>
      Day Streak
    </Text>
    {highestStreak > 0 && (
      <Text style={{ color: COLORS.text, fontSize: 14, fontFamily: 'GeneralSans-Medium', marginTop: 8 }}>
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
      blurType="dark"
      blurAmount={12}
      reducedTransparencyFallbackColor="rgba(26, 26, 26, 0.85)"
    >
      <LinearGradient
        colors={['rgba(249, 115, 22, 0.15)', 'rgba(249, 115, 22, 0.05)']}
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
        borderColor: 'rgba(249, 115, 22, 0.3)',
        borderRadius: 16,
        padding: 16,
        backgroundColor: 'rgba(249, 115, 22, 0.1)',
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
      }}>
        <View style={{
          backgroundColor: 'rgba(249, 115, 22, 0.2)',
          borderRadius: 20,
          padding: 8,
          marginRight: 16,
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

const WeekOverview = ({ activeDates }) => {
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();
  const week = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    week.push(date);
  }

  const isDayActive = (date) => {
    const dateString = date.toISOString().split('T')[0];
    return activeDates.includes(dateString);
  };

  return (
    <View style={{
      borderRadius: 20,
      overflow: 'hidden',
      width: '100%',
      marginTop: 20,
      elevation: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 10,
    }}>
      <BlurView 
        style={{
          padding: 24,
        }}
        blurType="dark"
        blurAmount={15}
        reducedTransparencyFallbackColor="rgba(26, 26, 26, 0.9)"
      >
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.12)', 'rgba(255, 255, 255, 0.03)']}
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
          borderColor: 'rgba(255, 255, 255, 0.15)',
          borderRadius: 16,
          padding: 20,
          backgroundColor: 'rgba(255, 255, 255, 0.08)',
        }}>
          <Text style={{ 
            color: COLORS.text, 
            fontSize: 16, 
            fontWeight: '600', 
            marginBottom: 16,
            textShadowColor: 'rgba(0, 0, 0, 0.5)',
            textShadowOffset: { width: 0, height: 1 },
            textShadowRadius: 3,
          }}>
            Week Overview
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
            {week.map((day, index) => {
              const isActive = isDayActive(day);
              return (
                <View key={index} style={{ alignItems: 'center' }}>
                  <Text style={{ 
                    color: COLORS.textSecondary, 
                    fontSize: 12, 
                    marginBottom: 8, 
                    fontFamily: 'GeneralSans-Medium',
                    textShadowColor: 'rgba(0, 0, 0, 0.5)',
                    textShadowOffset: { width: 0, height: 1 },
                    textShadowRadius: 2,
                  }}>
                    {weekDays[day.getDay()]}
                  </Text>
                  <View style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: isActive ? COLORS.accent : 'rgba(255, 255, 255, 0.15)',
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderWidth: isActive ? 2 : 1,
                    borderColor: isActive ? COLORS.accentLight : 'rgba(255, 255, 255, 0.2)',
                    elevation: isActive ? 4 : 2,
                    shadowColor: isActive ? COLORS.accent : '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: isActive ? 0.6 : 0.3,
                    shadowRadius: isActive ? 6 : 3,
                  }}>
                    {isActive ? (
                      <Ionicons name="checkmark" size={22} color="#FFF" />
                    ) : (
                      <Text style={{ 
                        color: COLORS.text, 
                        fontSize: 14, 
                        fontFamily: 'GeneralSans-Bold',
                        textShadowColor: 'rgba(0, 0, 0, 0.5)',
                        textShadowOffset: { width: 0, height: 1 },
                        textShadowRadius: 2,
                      }}>
                        {day.getDate()}
                      </Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </BlurView>
    </View>
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
      {/* Background with dynamic gradients */}
      <LinearGradient 
        colors={[COLORS.gradientStart, COLORS.gradientMiddle, COLORS.gradientEnd]} 
        style={{ 
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      />
      
      {/* Animated background elements */}
      <LinearGradient
        colors={['rgba(249, 115, 22, 0.3)', 'transparent', 'rgba(16, 33, 62, 0.4)']}
        style={{
          position: 'absolute',
          top: -100,
          left: -50,
          width: screenWidth * 1.5,
          height: screenHeight * 0.6,
          borderRadius: screenWidth,
          transform: [{ rotate: '15deg' }],
        }}
      />
      
      <LinearGradient
        colors={['transparent', 'rgba(249, 115, 22, 0.2)', 'transparent']}
        style={{
          position: 'absolute',
          bottom: -150,
          right: -100,
          width: screenWidth * 1.2,
          height: screenHeight * 0.5,
          borderRadius: screenWidth,
          transform: [{ rotate: '-20deg' }],
        }}
      />

      {/* Main blur overlay */}
      <BlurView 
        style={{ flex: 1 }}
        blurType="dark"
        blurAmount={5}
        reducedTransparencyFallbackColor="rgba(13, 13, 13, 0.8)"
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
              blurType="dark"
              blurAmount={20}
              reducedTransparencyFallbackColor="rgba(26, 26, 26, 0.9)"
            >
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
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
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: 20,
                  padding: 8,
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
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: 50,
                padding: 20,
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
              <WeekOverview activeDates={weeklyActivity} />
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
