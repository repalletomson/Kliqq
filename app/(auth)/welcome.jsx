

import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Animated, {
  useAnimatedRef,
  useAnimatedScrollHandler,
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Image } from 'expo-image';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';

// Screen dimensions
const SCREEN_WIDTH = wp(100);
const IMAGE_WIDTH = wp(80);
const IMAGE_HEIGHT = wp(80);

// Onboarding data
const onboardingData = [
  {
    text: 'Welcome VIP!',
    description: 'Make college life fun and fulfilling—connect, grow, and shine with our exclusive campus app!',
    image: require('../../assets/images/welcome1.png'), // Adjust path
  },
  {
    text: 'Share Campus Life',
    description: 'Post updates about college events, club activities, and campus happenings.',
    image: require('../../assets/images/welcome2.png'), // Adjust path
  },
  {
    text: 'Connect & Chat',
    description: 'Find and connect with seniors, classmates, and club members.',
    image: require('../../assets/images/welcome1.png'), // Adjust path
  },
];

// ListItem Component for Carousel (unchanged)
const ListItem = ({ item, index, x, isDarkTheme }) => {
  const rnImageStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      x.value,
      [(index - 1) * SCREEN_WIDTH, index * SCREEN_WIDTH, (index + 1) * SCREEN_WIDTH],
      [100, 0, 100],
      Extrapolation.CLAMP
    );
    const opacity = interpolate(
      x.value,
      [(index - 1) * SCREEN_WIDTH, index * SCREEN_WIDTH, (index + 1) * SCREEN_WIDTH],
      [0, 1, 0],
      Extrapolation.CLAMP
    );
    return { opacity, width: IMAGE_WIDTH, height: IMAGE_HEIGHT, transform: [{ translateY }] };
  });

  const rnTextStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      x.value,
      [(index - 1) * SCREEN_WIDTH, index * SCREEN_WIDTH, (index + 1) * SCREEN_WIDTH],
      [50, 0, 50],
      Extrapolation.CLAMP
    );
    const opacity = interpolate(
      x.value,
      [(index - 1) * SCREEN_WIDTH, index * SCREEN_WIDTH, (index + 1) * SCREEN_WIDTH],
      [0, 1, 0],
      Extrapolation.CLAMP
    );
    return { opacity, transform: [{ translateY }] };
  });

  return (
    <View className="flex-1 items-center justify-center px-6" style={{ width: SCREEN_WIDTH }}>
      <Animated.View style={rnImageStyle}>
        <Image
          source={item.image}
          style={{ width: '100%', height: '100%' }}
          contentFit="contain"
          transition={500}
        />
      </Animated.View>
      <Animated.View style={rnTextStyle} className="mt-10">
        <Text
          className={
            isDarkTheme
              ? 'text-white text-3xl font-bold text-center'
              : 'text-black text-3xl font-bold text-center'
          }
        >
          {item.text}
        </Text>
        <Text
          className={
            isDarkTheme
              ? 'text-gray-400 text-lg text-center mt-4'
              : 'text-gray-600 text-lg text-center mt-4'
          }
        >
          {item.description}
        </Text>
      </Animated.View>
    </View>
  );
};

// PaginationElement Component (unchanged)
const PaginationElement = ({ length, x, scrollTo, isDarkTheme }) => {
  const PaginationDot = ({ index }) => {
    const itemRnStyle = useAnimatedStyle(() => {
      const width = interpolate(
        x.value,
        [(index - 1) * SCREEN_WIDTH, index * SCREEN_WIDTH, (index + 1) * SCREEN_WIDTH],
        [10, 30, 10],
        Extrapolation.CLAMP
      );
      const opacity = interpolate(
        x.value,
        [(index - 1) * SCREEN_WIDTH, index * SCREEN_WIDTH, (index + 1) * SCREEN_WIDTH],
        [0.5, 1, 0.5],
        Extrapolation.CLAMP
      );
      return { width, opacity };
    });
    return (
      <TouchableOpacity onPress={() => scrollTo(index)}>
        <Animated.View
          className={
            isDarkTheme ? 'h-2 bg-white rounded-full mx-2' : 'h-2 bg-black rounded-full mx-2'
          }
          style={itemRnStyle}
        />
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-row justify-center items-center">
      {Array.from({ length }).map((_, index) => (
        <PaginationDot key={index} index={index} />
      ))}
    </View>
  );
};

// Main OnboardingScreen Component
export default function OnboardingScreen() {
  const colorScheme = useColorScheme();
  const isDarkTheme = colorScheme === 'dark';

  const x = useSharedValue(0);
  const flatListIndex = useSharedValue(0);
  const flatListRef = useAnimatedRef();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  // Scroll handler for carousel
  const scrollHandle = useAnimatedScrollHandler({
    onScroll: (event) => {
      x.value = event.contentOffset.x;
      const newIndex = Math.round(event.contentOffset.x / SCREEN_WIDTH);
      if (newIndex !== flatListIndex.value) {
        flatListIndex.value = newIndex;
        runOnJS(setCurrentIndex)(newIndex);
      }
    },
  });

  const scrollTo = useCallback((index) => {
    flatListRef.current?.scrollToOffset({ offset: index * SCREEN_WIDTH, animated: true });
  }, []);

  const goNext = useCallback(() => {
    if (currentIndex < onboardingData.length - 1) {
      scrollTo(currentIndex + 1);
    }
  }, [currentIndex]);

  const handleGetStarted = () => {
    setLoading(true);
    router.push('/(auth)/signin');
    setLoading(false);
  };

  const renderItem = useCallback(
    ({ item, index }) => <ListItem item={item} index={index} x={x} isDarkTheme={isDarkTheme} />,
    [x, isDarkTheme]
  );

  const rnButtonStyle = useAnimatedStyle(() => {
    return {
      opacity: flatListIndex.value === onboardingData.length - 1 ? withTiming(1) : withTiming(0),
      transform: [
        {
          translateY:
            flatListIndex.value === onboardingData.length - 1 ? withSpring(0) : withSpring(50),
        },
      ],
    };
  });

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView className={isDarkTheme ? 'flex-1 bg-black' : 'flex-1 bg-white'}>
        <Animated.FlatList
          ref={flatListRef}
          onScroll={scrollHandle}
          horizontal
          scrollEventThrottle={16}
          pagingEnabled
          data={onboardingData}
          keyExtractor={(_, index) => index.toString()}
          bounces={false}
          renderItem={renderItem}
          showsHorizontalScrollIndicator={false}
        />

        <View className="absolute bottom-10 w-full px-6">
          <PaginationElement
            length={onboardingData.length}
            x={x}
            scrollTo={scrollTo}
            isDarkTheme={isDarkTheme}
          />

          <View className="flex-row justify-end mt-6">
            <Animated.View style={rnButtonStyle}>
              <TouchableOpacity
                className={
                  isDarkTheme ? 'bg-white rounded-full py-4 px-6' : 'bg-black rounded-full py-4 px-6'
                }
                onPress={handleGetStarted}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={isDarkTheme ? 'black' : 'white'} size="small" />
                ) : (
                  <Text
                    className={
                      isDarkTheme
                        ? 'text-black font-semibold text-lg'
                        : 'text-white font-semibold text-lg'
                    }
                  >
                    Get Started
                  </Text>
                )}
              </TouchableOpacity>
            </Animated.View>

            {currentIndex < onboardingData.length - 1 && (
              <TouchableOpacity onPress={goNext} className="bg-transparent p-3">
                <Text
                  className={
                    isDarkTheme
                      ? 'text-white font-semibold text-lg'
                      : 'text-black font-semibold text-lg'
                  }
                >
                  Next
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}