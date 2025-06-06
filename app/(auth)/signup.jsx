import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  TextInput,
  KeyboardAvoidingView, 
  Platform, 
  ScrollView,
  StatusBar,
  Animated,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
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

export default function SignUpScreen() {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [step, setStep] = useState(1);
  const [photoUrl, setPhotoUrl] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const { register } = useAuth();

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
  }, []);

  const handleGoogleSignUp = async () => {
    try {
      setLoading(true);
      await GoogleSignin.signOut();
      await GoogleSignin.hasPlayServices();
      
      const { type, data } = await GoogleSignin.signIn();
      console.log("data", data.user);
      setPhotoUrl(data.user.photo);
      setEmail(data.user.email);
      setFullName(data.user.name || '');
      setStep(2);
    } catch (error) {
      setAlert({ type: 'error', message: 'Google signup failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!fullName.trim()) {
      setAlert({ type: 'error', message: 'Please enter your full name.' });
      return;
    }
    if (!email.trim()) {
      setAlert({ type: 'error', message: 'Please enter your email.' });
      return;
    }
    if (!password.trim()) {
      setAlert({ type: 'error', message: 'Please enter a password.' });
      return;
    }

    try {
      setLoading(true);
      const response = await register(email, password, photoUrl, fullName);
      if (response) {
        setAlert({ type: 'success', message: 'Account created successfully! Welcome aboard!' });
      }
    } catch (error) {
      setAlert({ type: 'error', message: error.message });
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
                Create your account
              </Text>
              <Text style={{
                fontSize: 16,
                color: colors.textSecondary,
                textAlign: 'center',
                lineHeight: 24,
              }}>
                Get started with your new account
              </Text>
            </View>

            {/* Content */}
            <View style={{ marginBottom: 32 }}>
              {step === 1 ? (
                <View>
                  {/* Google Sign Up */}
                  <GradientButton
                    title={loading ? 'Signing up...' : 'Continue with Google'}
                    onPress={handleGoogleSignUp}
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

                  {/* Manual Form */}
                  <View style={{ marginBottom: 24 }}>
                    <ModernInput
                      placeholder="Full Name"
                      value={fullName}
                      onChangeText={setFullName}
                      icon={<Feather name="user" size={20} color={colors.textSecondary} />}
                    />

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

                  {/* Sign Up Button */}
                  <GradientButton
                    title={loading ? 'Creating Account...' : 'Sign Up'}
                    onPress={handleSignUp}
                    disabled={loading}
                  />
                </View>
              ) : (
                // Step 2: Complete Google signup
                <View>
                  <Text style={{
                    fontSize: 24,
                    fontWeight: '700',
                    color: colors.text,
                    textAlign: 'center',
                    marginBottom: 32,
                  }}>
                    Complete your profile
                  </Text>

                  <ModernInput
                    placeholder="Email"
                    value={email}
                    onChangeText={setEmail}
                    editable={false}
                    icon={<MaterialIcons name="email" size={20} color={colors.textSecondary} />}
                  />

                  <ModernInput
                    placeholder="Full Name"
                    value={fullName}
                    onChangeText={setFullName}
                    icon={<Feather name="user" size={20} color={colors.textSecondary} />}
                  />

                  <ModernInput
                    placeholder="Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={true}
                    icon={<MaterialIcons name="lock-outline" size={20} color={colors.textSecondary} />}
                  />

                  <GradientButton
                    title={loading ? 'Creating Account...' : 'Complete Setup'}
                    onPress={handleSignUp}
                    disabled={loading}
                  />
                </View>
              )}
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