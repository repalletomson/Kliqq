import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { View } from 'react-native';
import GraduationStep from './GraduationStep';
import NotificationStep from './NotificationStep';
import ProfileInfoStep from './ProfileInfoStep';
import ProfilePhotoStep from './ProfilePhotoStep';

export default function OnboardingScreen() {
  const [step, setStep] = useState(1);
  const router = useRouter();

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const finishOnboarding = () => {
    // Navigate to the main app after onboarding is complete
    router.replace('/(root)/home'); 
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return <ProfileInfoStep nextStep={nextStep} />;
      case 2:
        return <ProfilePhotoStep nextStep={nextStep} prevStep={prevStep} />;
      case 3:
        return <GraduationStep nextStep={nextStep} prevStep={prevStep} />;
      case 4:
        return <NotificationStep finishOnboarding={finishOnboarding} />;
      default:
        return <ProfileInfoStep nextStep={nextStep} />;
    }
  };

  return <View style={{ flex: 1 }}>{renderStep()}</View>;
} 