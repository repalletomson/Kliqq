import { Stack } from 'expo-router';
import React from 'react';

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="ProfileInfoStep" />
      <Stack.Screen name="ProfilePhotoStep" />
      <Stack.Screen name="GraduationStep" />
      <Stack.Screen name="NotificationStep" />
    </Stack>
  );
} 