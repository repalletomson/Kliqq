import React, { useEffect, useState } from 'react';
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
  Animated,
  Dimensions,
} from 'react-native';
import { router, useNavigation } from 'expo-router';
import { AntDesign, MaterialIcons, Feather } from '@expo/vector-icons';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { useAuth } from '../../context/authContext';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

// Clean solid colors for better visibility
const colors = {
  background: '#000000',
  surface: '#1A1A1A',
  text: '#FFFFFF',
  textSecondary: '#CCCCCC',
  textMuted: '#999999',
  inputBg: '#2A2A2A',
  inputBorder: '#404040',
  googleBg: '#FFFFFF',
  accent: '#3B82F6',
  gradientStart: '#EC4899',
  gradientEnd: '#8B5CF6',
};

function SigninScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const [isGoogleEmail, setIsGoogleEmail] = useState(false);
  
  const navigation = useNavigation();

  // Animation values
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(30);

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: '912883386678-q9jbm946ol5hr1j78059m1e6erhhi1n5.apps.googleusercontent.com',
    });

    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

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

  const handleLogin = async () => {
    if (!email || !password) {
      setAlert({
        type: 'error',
        message: 'Please enter both email and password'
      });
      return;
    }
    try {
      setLoading(true);
      const response = await login(email, password);
      if (response) {
        setAlert({
          type: 'success',
          message: 'Welcome back! Redirecting...'
        });
        
        setTimeout(() => {
          router.push('/(root)/(tabs)/home');
        }, 1000);
      }
    } catch (error) {
      handleAuthError(error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleAuthError = (error) => {
    let message = 'An error occurred. Please try again.';
    
    switch (error.code) {
      case 'auth/wrong-password':
        message = 'Incorrect password. Please try again.';
        break;
      case 'auth/user-not-found':
        message = 'No account found with this email.';
        break;
      case 'auth/invalid-email':
        message = 'Invalid email address.';
        break;
      default:
        message = error.message || 'Authentication failed. Please try again.';
    }
    
    setAlert({
      type: 'error',
      message
    });
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      
      // Sign out first
      await GoogleSignin.signOut();
      
      // Check Play Services
      await GoogleSignin.hasPlayServices();

      // Get Google user info
      const { type, data } = await GoogleSignin.signIn();
      
      // Set email from Google and mark it as Google email
      setEmail(data.user.email);
      setIsGoogleEmail(true);

    } catch (error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        code: error.code,
        stack: error.stack
      });
    } finally {
      setLoading(false);
    }
  };

  const GradientButton = ({ title, onPress, disabled, variant = 'primary' }) => (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={{
        width: '100%',
        height: 56,
        borderRadius: 16,
        overflow: 'hidden',
        marginVertical: 8,
      }}
    >
      {variant === 'primary' ? (
        <LinearGradient
          colors={[colors.gradientStart, colors.gradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: disabled ? 0.7 : 1,
          }}
        >
          <Text style={{
            color: colors.text,
            fontSize: 16,
            fontWeight: '700',
            letterSpacing: 0.3,
          }}>
            {title}
          </Text>
        </LinearGradient>
      ) : (
        <View style={{
          flex: 1,
          backgroundColor: colors.googleBg,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: disabled ? 0.7 : 1,
        }}>
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
        </View>
      )}
    </TouchableOpacity>
  );

  const ModernInput = ({ 
    placeholder, 
    value, 
    onChangeText, 
    secureTextEntry = false,
    keyboardType = 'default',
    icon,
    editable = true 
  }) => (
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
        secureTextEntry={secureTextEntry && !showPassword}
        keyboardType={keyboardType}
        editable={editable}
        autoCapitalize="none"
        style={{
          flex: 1,
          color: colors.text,
          fontSize: 16,
          fontWeight: '400',
        }}
      />
      {secureTextEntry && (
        <TouchableOpacity
          onPress={() => setShowPassword(!showPassword)}
          style={{ padding: 4 }}
        >
          <Feather 
            name={showPassword ? "eye-off" : "eye"} 
            size={20} 
            color={colors.textMuted} 
          />
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View 
            style={{
              flex: 1,
              paddingHorizontal: 24,
              paddingTop: 80,
              justifyContent: 'center',
              transform: [{ translateY: slideAnim }],
              opacity: fadeAnim,
            }}
          >
            {/* Header */}
            <View style={{ alignItems: 'center', marginBottom: 48 }}>
              <Text style={{
                fontSize: 32,
                fontWeight: '800',
                color: colors.text,
                marginBottom: 8,
                textAlign: 'center',
              }}>
                Welcome back!
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
              <GradientButton
                title={loading ? 'Signing in...' : 'Sign In with Google'}
                onPress={handleGoogleSignIn}
                disabled={loading}
                variant="google"
              />

              {/* Divider */}
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginVertical: 32,
              }}>
                <View style={{
                  flex: 1,
                  height: 2,
                  backgroundColor: colors.inputBorder,
                }} />
                <Text style={{
                  marginHorizontal: 16,
                  color: colors.textSecondary,
                  fontSize: 14,
                  fontWeight: '600',
                }}>
                  OR
                </Text>
                <View style={{
                  flex: 1,
                  height: 2,
                  backgroundColor: colors.inputBorder,
                }} />
              </View>

              {/* Form */}
              <View style={{ marginBottom: 24 }}>
                <ModernInput
                  placeholder="Email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  icon={<MaterialIcons name="email" size={20} color={colors.textSecondary} />}
                />

                <ModernInput
                  placeholder="Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={true}
                  icon={<MaterialIcons name="lock-outline" size={20} color={colors.textSecondary} />}
                />
              </View>

              {/* Login Button */}
              <GradientButton
                title={loading ? 'Signing in...' : 'Log In'}
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
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Alert Display */}
      {alert && (
        <Animated.View style={{
          position: 'absolute',
          top: 100,
          left: 24,
          right: 24,
          backgroundColor: alert.type === 'success' ? '#10B981' : '#EF4444',
          borderRadius: 12,
          padding: 16,
          zIndex: 1000,
        }}>
          <Text style={{
            color: colors.text,
            fontSize: 14,
            fontWeight: '600',
            textAlign: 'center',
          }}>
            {alert.message}
          </Text>
        </Animated.View>
      )}
    </View>
  );
}

export default SigninScreen;