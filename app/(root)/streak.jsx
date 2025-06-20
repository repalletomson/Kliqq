import React, { useEffect, useState, useRef, useMemo } from 'react';
import { View, Text, SafeAreaView, StatusBar, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeNavigation } from '../../hooks/useSafeNavigation';
import { getUserStreak, subscribeToStreakChanges, getWeeklyActivity } from '../../(apis)/streaks';
import { useAuth } from '../../context/authContext';
import * as Progress from 'react-native-progress';
import { supabase } from '../../config/supabaseConfig';

const COLORS = {
  background: '#0D0D0D',
  card: '#1A1A1A',
  text: '#FFFFFF',
  textSecondary: '#A1A1AA',
  accent: '#F97316',
  accentLight: '#FDBA74',
  border: 'rgba(255, 255, 255, 0.1)',
};

const TimeLeftCard = ({ timeLeft }) => (
  <View style={{
    backgroundColor: COLORS.card,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  }}>
    <Text style={{ color: COLORS.textSecondary, fontSize: 14, fontWeight: '500', marginBottom: 12 }}>
      Time Left to Keep Streak
    </Text>
    <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
      <Text style={{ color: COLORS.text, fontSize: 36, fontWeight: '700' }}>
        {String(timeLeft.hours).padStart(2, '0')}
      </Text>
      <Text style={{ color: COLORS.textSecondary, fontSize: 20, marginHorizontal: 4 }}>h</Text>
      <Text style={{ color: COLORS.text, fontSize: 36, fontWeight: '700' }}>
        {String(timeLeft.minutes).padStart(2, '0')}
      </Text>
      <Text style={{ color: COLORS.textSecondary, fontSize: 20, marginHorizontal: 4 }}>m</Text>
      <Text style={{ color: COLORS.text, fontSize: 36, fontWeight: '700' }}>
        {String(timeLeft.seconds).padStart(2, '0')}
      </Text>
      <Text style={{ color: COLORS.textSecondary, fontSize: 20, marginLeft: 4 }}>s</Text>
    </View>
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
    padding: 16,
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  }}>
    <MaterialCommunityIcons name="information-outline" size={24} color={COLORS.accent} style={{ marginRight: 12 }} />
    <Text style={{ flex: 1, color: COLORS.textSecondary, fontSize: 14, fontFamily: 'GeneralSans-Medium' }}>
      Engage with the community by commenting on posts from other users to build and maintain your streak.
    </Text>
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
      backgroundColor: COLORS.card,
      padding: 20,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: COLORS.border,
      width: '100%',
      marginTop: 20,
    }}>
      <Text style={{ color: COLORS.text, fontSize: 16, fontWeight: '600', marginBottom: 16 }}>
        Week Overview
      </Text>
      <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
        {week.map((day, index) => {
          const isActive = isDayActive(day);
          return (
            <View key={index} style={{ alignItems: 'center' }}>
              <Text style={{ color: COLORS.textSecondary, fontSize: 12, marginBottom: 8, fontFamily: 'GeneralSans-Medium' }}>
                {weekDays[day.getDay()]}
              </Text>
              <View style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: isActive ? COLORS.accent : 'rgba(255, 255, 255, 0.2)',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
                {isActive ? (
                  <Ionicons name="checkmark" size={20} color="#FFF" />
                ) : (
                  <Text style={{ color: COLORS.text, fontSize: 14, fontFamily: 'GeneralSans-Bold' }}>{day.getDate()}</Text>
                )}
              </View>
            </View>
          );
        })}
      </View>
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
    <LinearGradient colors={['#1A1A1A', COLORS.background]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar barStyle="light-content" />
        <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16 }}>
          <TouchableOpacity onPress={safeBack} style={{ position: 'absolute', left: 16, top: 16, zIndex: 1 }}>
            <Ionicons name="arrow-back" size={28} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={{ flex: 1, textAlign: 'center', color: COLORS.text, fontSize: 22, fontFamily: 'GeneralSans-Bold' }}>
            Your Streak
          </Text>
        </View>

        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color={COLORS.accent} />
          </View>
        ) : (
          <ScrollView 
            contentContainerStyle={{ 
              flexGrow: 1, 
              justifyContent: 'center', 
              alignItems: 'center', 
              padding: 24 
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
    </LinearGradient>
  );
}
