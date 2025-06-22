import React, { useEffect, useState, useCallback, useRef } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  TextInput,
  KeyboardAvoidingView, 
  Platform, 
  ScrollView,
  StatusBar,
  Dimensions,
  Image,
  Modal,
  InteractionManager,
} from 'react-native';
import { router } from 'expo-router';
import { AntDesign, MaterialIcons, Feather } from '@expo/vector-icons';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { useAuth } from '../../context/authContext';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming, interpolate } from 'react-native-reanimated';
import { useSafeNavigation } from '../../hooks/useSafeNavigation';

const { width, height } = Dimensions.get('window');

// Create a stable password input component outside the main component
const StablePasswordInput = React.memo(({ 
  placeholder, 
  value, 
  onChangeText,
  icon,
  inputStyle = {}
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputRef = useRef(null);
  
  const togglePassword = useCallback(() => {
    setShowPassword(prev => !prev);
    // Keep focus on the input after toggling
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  }, []);

  return (
    <View style={{
      backgroundColor: '#2A2A2A',
      borderRadius: 16,
      borderWidth: 2,
      borderColor: '#404040',
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 4,
      marginVertical: 8,
      height: 56,
      ...inputStyle
    }}>
      {icon && (
        <View style={{ marginRight: 12 }}>
          {icon}
        </View>
      )}
      <TextInput
        ref={inputRef}
        placeholder={placeholder}
        placeholderTextColor="#999999"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={!showPassword}
        autoCapitalize="none"
        autoComplete="off"
        autoCorrect={false}
        returnKeyType="done"
        blurOnSubmit={false}
        style={{
          flex: 1,
          color: '#FFFFFF',
          fontSize: 16,
          fontWeight: '400',
        }}
      />
      <TouchableOpacity
        onPress={togglePassword}
        style={{ padding: 8 }}
      >
        <Feather 
          name={showPassword ? "eye-off" : "eye"} 
          size={20} 
          color="#999999" 
        />
      </TouchableOpacity>
    </View>
  );
});

StablePasswordInput.displayName = 'StablePasswordInput';

// Error Modal Component
const ErrorModal = ({ visible, message, type, onClose }) => {
  const modalScale = useSharedValue(0);
  const modalOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      modalOpacity.value = withTiming(1, { duration: 300 });
      modalScale.value = withSpring(1, { damping: 15 });
    } else {
      modalOpacity.value = withTiming(0, { duration: 200 });
      modalScale.value = withTiming(0, { duration: 200 });
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: modalOpacity.value,
      transform: [{ scale: modalScale.value }],
    };
  });

  const getIcon = () => {
    switch (type) {
      case 'error':
        return <MaterialIcons name="error-outline" size={32} color="#EF4444" />;
      case 'success':
        return <MaterialIcons name="check-circle-outline" size={32} color="#10B981" />;
      default:
        return <MaterialIcons name="info-outline" size={32} color="#3B82F6" />;
    }
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={{
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
      }}>
        <Animated.View style={[{
          backgroundColor: '#1A1A1A',
          borderRadius: 20,
          padding: 24,
          width: '100%',
          maxWidth: 350,
          borderWidth: 1,
          borderColor: '#404040',
        }, animatedStyle]}>
          {/* Icon */}
          <View style={{ alignItems: 'center', marginBottom: 16 }}>
            {getIcon()}
          </View>

          {/* Title */}
          <Text style={{
            color: '#FFFFFF',
            fontSize: 18,
            fontWeight: '700',
            textAlign: 'center',
            marginBottom: 12,
          }}>
            {type === 'error' ? 'Sign Up Error' : 
             type === 'success' ? 'Success' : 'Information'}
          </Text>

          {/* Message */}
          <Text style={{
            color: '#CCCCCC',
            fontSize: 15,
            textAlign: 'center',
            lineHeight: 22,
            marginBottom: 24,
          }}>
            {message}
          </Text>

          {/* Button */}
          <TouchableOpacity
            onPress={onClose}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 12,
              paddingVertical: 14,
              alignItems: 'center',
            }}
          >
            <Text style={{
              color: '#000000',
              fontSize: 16,
              fontWeight: '600',
            }}>
              {type === 'success' ? 'Continue' : 'Try Again'}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

// Black theme colors
const colors = {
  background: '#000000',
  surface: '#1A1A1A',
  text: '#FFFFFF',
  textSecondary: '#CCCCCC',
  textMuted: '#999999',
  inputBg: '#2A2A2A',
  inputBorder: '#404040',
  buttonBg: '#FFFFFF',
  buttonText: '#000000',
  googleBg: '#FFFFFF',
  accent: '#3B82F6',
  error: '#EF4444',
  success: '#10B981',
};

// Safe navigation utility to prevent ViewGroup errors
const safeNavigate = (router, path, method = 'push') => {
  return new Promise((resolve, reject) => {
    // Wait for all interactions to complete
    InteractionManager.runAfterInteractions(() => {
      try {
        console.log(`🔄 Safe navigation: ${method} to ${path}`);
        
        setTimeout(() => {
          try {
            if (method === 'replace') {
              router.replace(path);
            } else {
              router.push(path);
            }
            resolve(true);
          } catch (error) {
            console.error(`❌ Navigation ${method} failed:`, error);
            reject(error);
          }
        }, 100); // Small delay to ensure UI is ready
        
      } catch (error) {
        reject(error);
      }
    });
  });
};

// Helper function to get user-friendly error messages for signup
const getSignupErrorMessage = (error) => {
  const errorCode = error?.code || error?.message || '';
  
  if (errorCode.includes('user_already_exists') || errorCode.includes('User already registered')) {
    return 'An account with this email already exists. Please sign in instead or use a different email address.';
  }
  
  if (errorCode.includes('invalid_email') || errorCode.includes('Invalid email')) {
    return 'Please enter a valid email address. Make sure it follows the format: example@domain.com';
  }
  
  if (errorCode.includes('weak_password') || errorCode.includes('Password should be at least')) {
    return 'Password is too weak. Please choose a stronger password with at least 8 characters.';
  }
  
  if (errorCode.includes('signup_disabled')) {
    return 'New user registration is currently disabled. Please contact support for assistance.';
  }
  
  if (errorCode.includes('email_address_invalid')) {
    return 'The email address format is invalid. Please check and try again.';
  }
  
  if (errorCode.includes('network') || errorCode.includes('Network')) {
    return 'Network connection error. Please check your internet connection and try again.';
  }
  
  if (errorCode.includes('too_many_requests')) {
    return 'Too many signup attempts. Please wait a few minutes before trying again.';
  }
  
  // Default error message
  return 'Unable to create account. Please check your information and try again.';
};

export default function SignUpScreen() {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorModal, setErrorModal] = useState({ visible: false, message: '', type: 'error' });
  const [step, setStep] = useState(1);
  const [photoUrl, setPhotoUrl] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const { register } = useAuth();
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Animation values
  const buttonScale = useSharedValue(1);
  const imageOpacity = useSharedValue(0);
  const slideY = useSharedValue(30);

  // Universal safe navigation
  const { safeNavigate, safeBack } = useSafeNavigation({
    modals: [
      () => isModalVisible && setIsModalVisible(false),
      // Add other modal close functions here if needed
    ],
    onCleanup: () => {
      // Clean up any FlatList or state here
    }
  });

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: '912883386678-q9jbm946ol5hr1j78059m1e6erhhi1n5.apps.googleusercontent.com',
    });

    // Animate entrance
    imageOpacity.value = withTiming(1, { duration: 800 });
    slideY.value = withSpring(0, { damping: 15 });
  }, []);

  const showError = useCallback((message, type = 'error') => {
    setErrorModal({ visible: true, message, type });
  }, []);

  const hideError = useCallback(() => {
    setErrorModal({ visible: false, message: '', type: 'error' });
  }, []);

  const handleGoogleSignUp = useCallback(async () => {
    try {
      setLoading(true);
      buttonScale.value = withSpring(0.95);
      
      await GoogleSignin.signOut();
      await GoogleSignin.hasPlayServices();
      
      const { type, data } = await GoogleSignin.signIn();
      console.log("data", data.user);
      setPhotoUrl(data.user.photo);
      setEmail(data.user.email);
      setFullName(data.user.name || '');
      setStep(2);
      
      showError('Google account connected successfully! Now create a secure password for your account.', 'success');
      setTimeout(() => hideError(), 2500);
      
      setTimeout(() => {
        buttonScale.value = withSpring(1);
      }, 150);
    } catch (error) {
      console.error('Google signup error:', error);
      
      let errorMessage = 'Google sign up failed. Please try again.';
      
      if (error.code === '7') {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      } else if (error.code === '5') {
        errorMessage = 'Google sign up was cancelled. Please try again to continue.';
      } else if (error.code === '2') {
        errorMessage = 'Google Play Services is not available. Please update Google Play Services.';
      }
      
      showError(errorMessage);
      buttonScale.value = withSpring(1);
    } finally {
      setLoading(false);
    }
  }, [showError, hideError]);

  const handleSignUp = useCallback(async () => {
    if (!password.trim()) {
      showError('Please enter a password to secure your account.');
      return;
    }

    if (password.length < 8) {
      showError('Password must be at least 8 characters long for security.');
      return;
    }

    try {
      setLoading(true);
      buttonScale.value = withSpring(0.95);
      
      console.log('🚀 Starting signup process...');
      console.log('Signup data:', { email, fullName, hasPhotoUrl: !!photoUrl });
      
      // Register with auto-verification
      const response = await register(email, password, photoUrl, fullName, true); // true for auto-verify
      console.log('📋 Registration response:', response, typeof response);
      
      // Check if registration was successful (returns user ID string or false)
      if (response && response !== false && typeof response === 'string') {
        console.log('✅ Registration successful, redirecting to profile...');
        showError('Account created successfully! Welcome to SocialZ! 🎉', 'success');
        
        // Safe navigation with proper cleanup
        console.log('🚀 Preparing safe navigation to userprofile...');
        
        // Use setTimeout to ensure all state updates are complete
        setTimeout(async () => {
          console.log('🔄 Starting safe navigation to onboarding...');
          hideError();
          
          try {
            // Use safe navigation utility - wait longer to ensure auth state is set
            setTimeout(async () => {
              try {
                await safeNavigate(router, '/(auth)/onboarding', 'replace');
                console.log('✅ Navigation to onboarding successful');
              } catch (navError) {
                console.error('❌ Safe navigation failed, trying fallback:', navError);
                
                // Fallback navigation
                setTimeout(() => {
                  try {
                    router.replace('/(auth)/onboarding');
                  } catch (fallbackError) {
                    console.error('❌ Fallback navigation also failed:', fallbackError);
                  }
                }, 500);
              }
            }, 300);
          } catch (error) {
            console.error('❌ Navigation setup failed:', error);
          }
        }, 1200);
      } else {
        console.log('❌ Registration failed, response:', response);
        showError('Failed to create account. Please try again.');
      }
      
      setTimeout(() => {
        buttonScale.value = withSpring(1);
      }, 150);
    } catch (error) {
      console.error('❌ Signup error:', error);
      const errorMessage = getSignupErrorMessage(error);
      showError(errorMessage);
      buttonScale.value = withSpring(1);
    } finally {
      setLoading(false);
    }
  }, [email, password, photoUrl, fullName, register, showError, hideError]);

  const AnimatedButton = ({ title, onPress, disabled, variant = 'primary' }) => {
    const animatedStyle = useAnimatedStyle(() => {
      return {
        transform: [{ scale: buttonScale.value }],
      };
    });

    return (
      <Animated.View style={animatedStyle}>
        <TouchableOpacity
          onPress={() => {
            buttonScale.value = withSpring(0.95);
            setTimeout(() => {
              buttonScale.value = withSpring(1);
              onPress();
            }, 100);
          }}
          disabled={disabled}
          style={{
            width: '100%',
            height: 56,
            borderRadius: 16,
            overflow: 'hidden',
            marginVertical: 8,
            backgroundColor: variant === 'primary' ? colors.buttonBg : colors.googleBg,
            opacity: disabled ? 0.7 : 1,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {variant === 'primary' ? (
            <Text style={{
              color: colors.buttonText,
              fontSize: 16,
              fontWeight: '700',
              letterSpacing: 0.3,
            }}>
              {title}
            </Text>
          ) : (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <AntDesign name="google" size={20} color="#4285F4" />
              <Text style={{
                color: '#1F1F1F',
                fontSize: 16,
                fontWeight: '600',
                marginLeft: 12,
              }}>
                {title}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  };

  // Memoized basic input component
  const BasicInput = React.memo(({ 
    placeholder, 
    value, 
    onChangeText, 
    keyboardType = 'default',
    icon,
    editable = true 
  }) => {
    return (
      <View style={{
        backgroundColor: colors.inputBg,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: editable ? colors.inputBorder : colors.textMuted,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 4,
        marginVertical: 8,
        height: 56,
        opacity: editable ? 1 : 0.7,
      }}>
        {icon && (
          <View style={{ marginRight: 12 }}>
            {icon}
          </View>
        )}
        <TextInput
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          editable={editable}
          autoCapitalize="none"
          autoComplete="off"
          autoCorrect={false}
          returnKeyType="done"
          blurOnSubmit={false}
          style={{
            flex: 1,
            color: colors.text,
            fontSize: 16,
            fontWeight: '400',
          }}
        />
      </View>
    );
  });

  // Add display names for debugging
  BasicInput.displayName = 'BasicInput';

  const imageAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: imageOpacity.value,
      transform: [{ translateY: slideY.value }],
    };
  });

  // Memoized handlers to prevent re-creation
  const handleEmailChange = useCallback((text) => setEmail(text), []);
  const handlePasswordChange = useCallback((text) => setPassword(text), []);
  const handleStepBack = useCallback(() => setStep(1), []);

  console.log('Rendering SignUpScreen, step:', step);

  // Use safeBack for all back actions (hardware/software)
  // Use safeNavigate for all navigation
  // Example for going home after signup:
  const goHome = useCallback(async () => {
    await safeNavigate('/(root)/(tabs)/home', { replace: true });
  }, [safeNavigate]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          <View style={{
            flex: 1,
            paddingHorizontal: 24,
            paddingTop: 60,
            justifyContent: 'center',
          }}>
            {/* Top Image */}
            <Animated.View style={[{ alignItems: 'center', marginBottom: 32 }, imageAnimatedStyle]}>
              <Image
                source={require('../../assets/images/campus-connect-logo.png')}
                style={{ width: 80, height: 80, borderRadius: 20 }}
              />
            </Animated.View>

            {step === 1 ? (
              <>
                {/* Header */}
                <View style={{ alignItems: 'center', marginBottom: 48 }}>
                  <Text style={{
                    fontSize: 32,
                    fontWeight: '800',
                    color: colors.text,
                    marginBottom: 8,
                    textAlign: 'center',
                  }}>
                    Join the community
                  </Text>
                  <Text style={{
                    fontSize: 16,
                    color: colors.textSecondary,
                    textAlign: 'center',
                    lineHeight: 24,
                  }}>
                    Connect with students from your college
                  </Text>
                </View>

                {/* Google Sign Up Button */}
                <AnimatedButton
                  title={loading ? 'Signing up...' : 'Continue with Google'}
                  onPress={handleGoogleSignUp}
                  disabled={loading}
                  variant="google"
                />

                {/* Info Text */}
                <View style={{ marginTop: 32, alignItems: 'center' }}>
                  <Text style={{
                    color: colors.textMuted,
                    fontSize: 14,
                    textAlign: 'center',
                    lineHeight: 20,
                  }}>
                    Sign up with your Google account to get started.{'\n'}
                    You'll set a password in the next step.
                  </Text>
                </View>

                {/* Footer */}
                <View style={{
                  alignItems: 'center',
                  paddingBottom: 40,
                  marginTop: 40,
                }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{
                      color: colors.textSecondary,
                      fontSize: 15,
                    }}>
                      Already have an account?{' '}
                    </Text>
                    <TouchableOpacity onPress={() => router.push('/(auth)/signin')}>
                      <Text style={{
                        color: colors.accent,
                        fontSize: 15,
                        fontWeight: '600',
                      }}>
                        Sign In
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </>
            ) : (
              // Step 2: Password Entry
              <>
                <View style={{ alignItems: 'center', marginBottom: 32 }}>
                  <Text style={{
                    fontSize: 28,
                    fontWeight: '800',
                    color: colors.text,
                    marginBottom: 8,
                    textAlign: 'center',
                  }}>
                    Complete Your Profile
                  </Text>
                  <Text style={{
                    fontSize: 16,
                    color: colors.textSecondary,
                    textAlign: 'center',
                    lineHeight: 24,
                  }}>
                    Add a password to secure your account
                  </Text>
                </View>

                {/* Show Google Account Info */}
                <View style={{
                  backgroundColor: colors.surface,
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 24,
                  borderWidth: 1,
                  borderColor: colors.inputBorder,
                }}>
                  <Text style={{
                    color: colors.textSecondary,
                    fontSize: 14,
                    marginBottom: 8,
                  }}>
                    Google Account
                  </Text>
                  <Text style={{
                    color: colors.text,
                    fontSize: 16,
                    fontWeight: '600',
                  }}>
                    {fullName}
                  </Text>
                  <Text style={{
                    color: colors.textMuted,
                    fontSize: 14,
                    marginTop: 2,
                  }}>
                    {email}
                  </Text>
                </View>

                {/* Email Input (Uneditable) */}
                <BasicInput
                  placeholder="Email"
                  value={email}
                  onChangeText={handleEmailChange}
                  keyboardType="email-address"
                  editable={false}
                  icon={<MaterialIcons name="email" size={20} color={colors.textMuted} />}
                />

                {/* Password Input */}
                <StablePasswordInput
                  placeholder="Create Password"
                  value={password}
                  onChangeText={handlePasswordChange}
                  icon={<MaterialIcons name="lock-outline" size={20} color={colors.textSecondary} />}
                />

                {/* Password Requirements */}
                <Text style={{
                  color: colors.textMuted,
                  fontSize: 12,
                  marginTop: 4,
                  marginBottom: 16,
                }}>
                  Password must be at least 8 characters long
                </Text>

                <AnimatedButton
                  title={loading ? 'Creating Account...' : 'Complete Sign Up'}
                  onPress={handleSignUp}
                  disabled={loading}
                />

                {/* Back Button */}
                <TouchableOpacity 
                  onPress={handleStepBack}
                  style={{ 
                    alignSelf: 'center', 
                    marginTop: 16,
                    padding: 8,
                  }}
                >
                  <Text style={{
                    color: colors.textMuted,
                    fontSize: 14,
                  }}>
                    ← Back to Google Sign Up
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Error Modal */}
      <ErrorModal
        visible={errorModal.visible}
        message={errorModal.message}
        type={errorModal.type}
        onClose={hideError}
      />
    </View>
  );
}