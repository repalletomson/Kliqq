import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated, Image } from 'react-native';
import { useAuth } from '../context/authContext';
import { Redirect } from 'expo-router';

const Loader = () => {
  const loadingAnimation = new Animated.Value(0);

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(loadingAnimation, {
          toValue: 1,
          duration: 3500,
          useNativeDriver: false,
        }),
        Animated.timing(loadingAnimation, {
          toValue: 0,
          duration: 0,
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, [loadingAnimation]);

  return (
    <View style={styles.wrapper}>
      <Image
        source={require('../assets/images/woman-is-looking-her-phone-saying-you-re-lock_1276622-21918-removebg-preview.png')}
        style={styles.image}
      />
      <Animated.Text
        style={[
          styles.text,
          {
            opacity: loadingAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [0.3, 1],
            }),
          },
        ]}
      >
        Loading...
      </Animated.Text>
    </View>
  );
};

export default function IndexPage() {
  const { isAuthenticated, isProfileComplete, isCollegeSelected } = useAuth();
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [redirectTo, setRedirectTo] = useState('');

  useEffect(() => {
    // Add a delay to ensure all auth states are properly initialized and prevent race conditions
    const timer = setTimeout(() => {
      console.log('🔍 Navigation decision - Auth states:', {
        isAuthenticated,
        isProfileComplete,
        isCollegeSelected
      });

      // Only redirect when we have clear states to avoid navigation conflicts
      if (isAuthenticated === false || isAuthenticated === undefined) {
        console.log('➡️ Not authenticated, going to welcome');
        setRedirectTo('/(auth)/welcome');
        setShouldRedirect(true);
      } else if (isAuthenticated === true) {
        if (isProfileComplete === false) {
          console.log('➡️ Profile incomplete, going to onboarding');
          setRedirectTo('/(auth)/onboarding');
          setShouldRedirect(true);
        } else if (isProfileComplete === true) {
          console.log('➡️ Profile complete, going to home');
          setRedirectTo('/(root)/(tabs)/home');
          setShouldRedirect(true);
        } else {
          // If profile completion state is undefined, wait longer
          console.log('⏳ Profile completion state undefined, waiting...');
        }
      } else {
        console.log('🔄 Auth state still undefined, showing loader');
      }
    }, 250); // Increased delay to prevent race conditions

    return () => clearTimeout(timer);
  }, [isAuthenticated, isProfileComplete, isCollegeSelected]);

  // Show loading while determining where to navigate
  if (isAuthenticated === undefined || !shouldRedirect) {
    return <Loader />;
  }

  // Safe redirect after state is determined
  return <Redirect href={redirectTo} />;
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    backgroundColor: '#000000', // Match black theme
  },
  image: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
});
