import React, { useEffect, useState, useCallback, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView, 
  StatusBar,
  Alert,
  Dimensions,
  Image,
  Modal,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { router, useNavigation } from 'expo-router';
import { AntDesign, MaterialIcons, Feather } from '@expo/vector-icons';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { useAuth } from '../../context/authContext';
import { supabase } from '../../config/supabaseConfig';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';

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

// Simple, unified modal for all error/info messages
const SimpleModal = ({ visible, message, onClose }) => (
  <Modal
    visible={visible}
    transparent
    animationType="fade"
    onRequestClose={onClose}
  >
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <Text style={styles.modalMessage}>{message}</Text>
        <TouchableOpacity onPress={onClose} style={styles.modalButton}>
          <Text style={styles.modalButtonText}>OK</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

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

// Helper function to get user-friendly error messages
const getErrorMessage = (error) => {
  const errorCode = error?.code || error?.message || '';
  
  if (errorCode.includes('invalid_credentials') || errorCode.includes('Invalid login credentials')) {
    return 'The email or password you entered is incorrect. Please check your credentials and try again.';
  }
  
  if (errorCode.includes('user_not_found') || errorCode.includes('User not found')) {
    return 'No account found with this email address. Please check your email or sign up for a new account.';
  }
  
  if (errorCode.includes('wrong_password') || errorCode.includes('Invalid password')) {
    return 'The password you entered is incorrect. Please try again or reset your password.';
  }
  
  if (errorCode.includes('too_many_requests')) {
    return 'Too many login attempts. Please wait a few minutes before trying again.';
  }
  
  if (errorCode.includes('network') || errorCode.includes('Network')) {
    return 'Network connection error. Please check your internet connection and try again.';
  }
  
  if (errorCode.includes('email_not_confirmed')) {
    return 'Please verify your email address before signing in. Check your inbox for a verification email.';
  }
  
  // Default error message
  return 'Unable to sign in. Please check your credentials and try again.';
};

function SigninScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const [isGoogleEmail, setIsGoogleEmail] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  
  const navigation = useNavigation();

  // Animation values
  const buttonScale = useSharedValue(1);
  const imageOpacity = useSharedValue(0);
  const slideY = useSharedValue(30);

  useEffect(() => {
    // Configure Google Sign In
    GoogleSignin.configure({
      webClientId: '912883386678-q9jbm946ol5hr1j78059m1e6erhhi1n5.apps.googleusercontent.com',
    });

    // Animate entrance
    imageOpacity.value = withTiming(1, { duration: 800 });
    slideY.value = withSpring(0, { damping: 15 });

    const configureGoogleSignIn = async () => {
      try {
        await GoogleSignin.hasPlayServices();
        console.log('Play services checked successfully');
      } catch (error) {
        console.error('Play services error:', error);
      }
    };
    
    configureGoogleSignIn();
  }, []);

  const handleLogin = useCallback(async () => {
    if (!email || !password) {
      setModalMessage('Please enter both email and password to continue.');
      setModalVisible(true);
      return;
    }

    try {
      setLoading(true);
      buttonScale.value = withSpring(0.95);
      
      console.log('Attempting login with:', email);
      const response = await login(email.trim(), password);
      
      if (response) {
        setModalMessage('Welcome back! Redirecting to your dashboard...');
        setModalVisible(true);
        
        setTimeout(() => {
          setLoading(false);
          buttonScale.value = withSpring(1);
          router.push('/(root)/(tabs)/home');
        }, 1500);
      }
      
      setTimeout(() => {
        buttonScale.value = withSpring(1);
      }, 150);
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = getErrorMessage(error);
      setModalMessage(errorMessage);
      setModalVisible(true);
      buttonScale.value = withSpring(1);
    } finally {
      setLoading(false);
    }
  }, [email, password, login]);

  const handleGoogleSignIn = useCallback(async () => {
    try {
      setLoading(true);
      buttonScale.value = withSpring(0.95);
      
      // Sign out first
      await GoogleSignin.signOut();
      
      // Check Play Services
      await GoogleSignin.hasPlayServices();

      // Get Google user info
      const { type, data } = await GoogleSignin.signIn();
      
      if (data?.user) {
        // Set email from Google and mark it as Google email
        setEmail(data.user.email);
        setIsGoogleEmail(true);

        setModalMessage('Google account connected successfully! Please enter your password to continue.');
        setModalVisible(true);
      }
      
      setTimeout(() => {
        buttonScale.value = withSpring(1);
      }, 150);
    } catch (error) {
      console.error('Google sign in error:', error);
      
      let errorMessage = 'Google sign in failed. Please try again.';
      
      if (error.code === '7') {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      } else if (error.code === '5') {
        errorMessage = 'Google sign in was cancelled. Please try again to continue.';
      } else if (error.code === '2') {
        errorMessage = 'Google Play Services is not available. Please update Google Play Services.';
      }
      
      setModalMessage(errorMessage);
      setModalVisible(true);
      buttonScale.value = withSpring(1);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleForgotPassword = useCallback(async () => {
    if (!email.trim()) {
      setModalMessage('Please enter your email address first, then try the forgot password option.');
      setModalVisible(true);
      return;
    }

    Alert.alert(
      'Reset Password',
      `Password reset instructions will be sent to ${email}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Send', 
          onPress: async () => {
            try {
              setResetLoading(true);
              
              // Use Supabase to send password reset email
              const { data, error } = await supabase.auth.resetPasswordForEmail(email);

              if (error) {
                throw error;
              }

              setModalMessage('Password reset email sent successfully! Please check your inbox and follow the instructions.');
            } catch (error) {
              console.error('Password reset error:', error);
              setModalMessage('Failed to send reset email. Please check your email address and try again.');
            } finally {
              setResetLoading(false);
            }
          }
        }
      ]
    );
  }, [email]);

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
        borderColor: colors.inputBorder,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 4,
        marginVertical: 8,
        height: 56,
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
  const handleEmailChange = useCallback((text) => {
    setEmail(text);
    setIsGoogleEmail(false); // Reset Google email flag when manually typing
  }, []);
  
  const handlePasswordChange = useCallback((text) => setPassword(text), []);

  console.log('Rendering SigninScreen');

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

            {/* Header */}
            <View style={{ alignItems: 'center', marginBottom: 48 }}>
              <Text style={{
                fontSize: 32,
                fontWeight: '800',
                color: colors.text,
                marginBottom: 8,
                textAlign: 'center',
              }}>
                Welcome back
              </Text>
              <Text style={{
                fontSize: 16,
                color: colors.textSecondary,
                textAlign: 'center',
                lineHeight: 24,
              }}>
                Sign in to your account
              </Text>
            </View>

            {/* Content */}
            <View style={{ marginBottom: 32 }}>
              {/* Google Sign In */}
              <AnimatedButton
                title={loading ? 'Signing in...' : 'Continue with Google'}
                onPress={handleGoogleSignIn}
                disabled={loading}
                variant="google"
              />

              {/* Or Divider */}
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginVertical: 24,
              }}>
                <View style={{
                  flex: 1,
                  height: 1,
                  backgroundColor: colors.inputBorder,
                }} />
                <Text style={{
                  color: colors.textMuted,
                  paddingHorizontal: 16,
                  fontSize: 14,
                }}>
                  Or sign in with email
                </Text>
                <View style={{
                  flex: 1,
                  height: 1,
                  backgroundColor: colors.inputBorder,
                }} />
              </View>

              {/* Email Input */}
              <BasicInput
                placeholder="Email"
                value={email}
                onChangeText={handleEmailChange}
                keyboardType="email-address"
                editable={!isGoogleEmail}
                icon={<MaterialIcons name="email" size={20} color={colors.textSecondary} />}
              />

              {/* Password Input */}
              <StablePasswordInput
                placeholder="Password"
                value={password}
                onChangeText={handlePasswordChange}
                icon={<MaterialIcons name="lock-outline" size={20} color={colors.textSecondary} />}
              />

              {/* Forgot Password Link */}
              <TouchableOpacity 
                onPress={handleForgotPassword}
                disabled={resetLoading}
                style={{ alignSelf: 'flex-end', marginTop: 8, marginBottom: 16 }}
              >
                <Text style={{
                  color: resetLoading ? colors.textMuted : colors.accent,
                  fontSize: 14,
                  fontWeight: '600',
                }}>
                  {resetLoading ? 'Sending...' : 'Forgot Password?'}
                </Text>
              </TouchableOpacity>

              {/* Sign In Button */}
              <AnimatedButton
                title={loading ? 'Signing In...' : 'Sign In'}
                onPress={handleLogin}
                disabled={loading}
              />
            </View>

            {/* Footer */}
            <View style={{
              alignItems: 'center',
              paddingBottom: 40,
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{
                  color: colors.textSecondary,
                  fontSize: 15,
                }}>
                  Don't have an account?{' '}
                </Text>
                <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
                  <Text style={{
                    color: colors.accent,
                    fontSize: 15,
                    fontWeight: '600',
                  }}>
                    Sign Up
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Simple Modal */}
      <SimpleModal visible={modalVisible} message={modalMessage} onClose={() => setModalVisible(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    elevation: 1000,
  },
  modalContent: {
    backgroundColor: '#18181B',
    borderRadius: 18,
    padding: 28,
    alignItems: 'center',
    maxWidth: 320,
    width: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  modalMessage: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 18,
    fontWeight: '500',
  },
  modalButton: {
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 32,
    alignItems: 'center',
    marginTop: 4,
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});

export default SigninScreen;