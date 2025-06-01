

import React from 'react';
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
        source={require('../assets/images/loader.gif')}
        className="max-w-[380px] w-full h-[298px]"
        resizeMode="contain"
      />
    </View>
  );
};

export default function Page() {
  const { isAuthenticated } = useAuth();
  console.log('Index page', isAuthenticated);

  if (isAuthenticated === undefined) return <Loader />;
  if (isAuthenticated) return <Redirect href="/(root)/(tabs)/home" />;
  return <Redirect href="/(auth)/welcome" />;
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    backgroundColor: '#000000', // Match black theme
  },
});
