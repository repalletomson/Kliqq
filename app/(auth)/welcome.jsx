import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, Platform, Dimensions, FlatList, Image, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur'; // TODO: If not installed, install expo-blur
import { Ionicons } from '@expo/vector-icons';

const COLORS = {
  background: '#000',
  card: 'rgba(20,20,30,0.7)',
  purple: '#8B5CF6',
  white: '#fff',
  drag: 'rgba(255,255,255,0.25)',
};

const onboardingData = [
  {
    text: 'Welcome VIP!',
    description: 'Make college life fun and fulfilling—connect, grow, and shine with our exclusive campus app!',
    image: require('../../assets/images/welcome1.png'),
  },
  {
    text: 'Share Campus Life',
    description: 'Post updates about college events, club activities, and campus happenings.',
    image: require('../../assets/images/welcome2.png'),
  },
  {
    text: 'Connect & Chat',
    description: 'Find and connect with seniors, classmates, and club members.',
    image: require('../../assets/images/welcome1.png'),
  },
];

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.88;
const CARD_HEIGHT = 480;
const BUTTON_COLOR = '#FF9776'; // Peachy accent

const DecorativeShapes = () => (
  <>
    {/* Top left blurred purple circle */}
    <View style={{
      position: 'absolute',
      top: -60,
      left: -40,
      width: 180,
      height: 180,
      borderRadius: 90,
      backgroundColor: '#8B5CF6',
      opacity: 0.25,
      zIndex: 0,
      filter: Platform.OS === 'web' ? 'blur(32px)' : undefined,
    }} />
    {/* Bottom right blurred blue circle */}
    <View style={{
      position: 'absolute',
      bottom: -80,
      right: -60,
      width: 220,
      height: 220,
      borderRadius: 110,
      backgroundColor: '#6366F1',
      opacity: 0.18,
      zIndex: 0,
      filter: Platform.OS === 'web' ? 'blur(36px)' : undefined,
    }} />
    {/* Center floating pink circle */}
    <View style={{
      position: 'absolute',
      top: 180,
      left: 60,
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: '#EC4899',
      opacity: 0.13,
      zIndex: 0,
      filter: Platform.OS === 'web' ? 'blur(24px)' : undefined,
    }} />
  </>
);

export default function WelcomeScreen() {
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef();

  const handleGetStarted = () => {
    setLoading(true);
    router.push('/(auth)/signin');
    setLoading(false);
  };

  const renderItem = ({ item, index }) => (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <View style={{
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.background,
        paddingHorizontal: 28,
      }}>
        <Image
          source={item.image}
          style={{ width: 240, height: 240, resizeMode: 'contain', marginBottom: 32, marginTop: 0 }}
        />
        <Text style={{
          color: COLORS.white,
          fontSize: 28,
          fontWeight: 'bold',
          textAlign: 'center',
          marginBottom: 18,
          letterSpacing: 0.1,
        }}>{item.text}</Text>
        <Text style={{
          color: '#C4B5FD',
          fontSize: 17,
          textAlign: 'center',
          marginBottom: 36,
          lineHeight: 24,
        }}>{item.description}</Text>
        <TouchableOpacity
          style={{
            width: '80%',
            backgroundColor: BUTTON_COLOR,
            borderRadius: 24,
            paddingVertical: 16,
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 12,
          }}
          onPress={() => {
            if (index < onboardingData.length - 1) {
              flatListRef.current.scrollToIndex({ index: index + 1, animated: true });
            } else {
              handleGetStarted();
            }
          }}
          disabled={loading}
        >
          <Text style={{
            color: '#fff',
            fontWeight: 'bold',
            fontSize: 17,
            letterSpacing: 0.2,
          }}>{index === onboardingData.length - 1 ? 'Get Started' : 'Next'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );

  const renderPagination = () => (
    <View style={{
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 28,
      marginBottom: 12,
    }}>
      {onboardingData.map((_, idx) => (
        <View
          key={idx}
          style={{
            width: idx === currentIndex ? 22 : 10,
            height: 10,
            borderRadius: 5,
            backgroundColor: idx === currentIndex ? BUTTON_COLOR : '#444',
            marginHorizontal: 6,
            opacity: idx === currentIndex ? 1 : 0.5,
            transition: 'width 0.2s',
          }}
        />
      ))}
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' }}>
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' }}>
        <FlatList
          ref={flatListRef}
          data={onboardingData}
          renderItem={({ item, index }) => renderItem({ item, index })}
          keyExtractor={(_, idx) => idx.toString()}
          horizontal
          pagingEnabled
          snapToInterval={SCREEN_WIDTH}
          decelerationRate="fast"
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={e => {
            const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
            setCurrentIndex(idx);
          }}
          getItemLayout={(_, index) => ({ length: SCREEN_WIDTH, offset: SCREEN_WIDTH * index, index })}
          style={{ flexGrow: 1 }}
          contentContainerStyle={{ flexGrow: 1 }}
        />
        {renderPagination()}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomCardWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    minHeight: 270,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    overflow: 'hidden',
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 36,
    paddingHorizontal: 24,
    backgroundColor: 'transparent',
  },
  purpleShadow: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 120,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    zIndex: 0,
  },
  dragIndicator: {
    width: 48,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: COLORS.drag,
    alignSelf: 'center',
    marginBottom: 18,
  },
  headline: {
    color: COLORS.white,
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 14,
    marginTop: 8,
    zIndex: 1,
  },
  description: {
    color: '#C4B5FD',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    zIndex: 1,
  },
  arrowButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.purple,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    shadowColor: COLORS.purple,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
    zIndex: 1,
  },
  paginationContainer: {
    position: 'absolute',
    bottom: 38,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  paginationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#444',
    marginHorizontal: 6,
    opacity: 0.5,
  },
  paginationDotActive: {
    backgroundColor: COLORS.purple,
    opacity: 1,
    width: 24,
  },
});