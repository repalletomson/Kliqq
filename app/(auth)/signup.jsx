
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
} from 'react-native';
import { router } from 'expo-router';
import { AntDesign } from '@expo/vector-icons';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { useAuth } from '../../context/authContext';
import CustomAlert from '../../components/CustomAlert';

const colors = {
  background: '#070606',
  text: '#FFFFFF',
  textSecondary: 'rgba(255, 255, 255, 0.6)',
  buttonBg: 'rgba(255, 255, 255, 0.1)',
  inputBg: 'rgba(255, 255, 255, 0.08)',
  accent: '#2196F3', // Blue accent for links
};

export default function SignUpScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [step, setStep] = useState(1);
 const [photoUrl, setPhotoUrl] = useState(null);
 const {register}=useAuth()
  useEffect(() => {
    GoogleSignin.configure({
      webClientId: '912883386678-q9jbm946ol5hr1j78059m1e6erhhi1n5.apps.googleusercontent.com',
    });
  }, []);

  const handleGoogleSignUp = async () => {
    try {
   setLoading(true);
         
         // Sign out first
         await GoogleSignin.signOut();
         
         // Check Play Services
         await GoogleSignin.hasPlayServices();
   
         
         // Get Google user info
         // const signInResult = await GoogleSignin.signIn();
         const {type,data} = await GoogleSignin.signIn();
      
      // const userDoc = await getDoc(doc(db, 'users', data.user.email));
      // if (userDoc.exists()) {
      //   setAlert({ type: 'warning', message: 'Account exists. Please sign in instead.' });
      //   setTimeout(() => router.push('/(auth)/signin'), 1500);
      //   return;
      // }
      console.log("data",data.user)
      setPhotoUrl(data.user.photo);
      setEmail(data.user.email);
      setStep(2);
    } catch (error) {
      setAlert({ type: 'error', message: 'Google signup failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    // if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(password)) {
    //   setAlert({ type: 'error', message: 'Password must be 8+ characters with letters & numbers.' });
    //   return;
    // }
    try {
      setLoading(true);
      // await createUserWithEmailAndPassword(auth, email, password);
      // await setDoc(doc(db, 'users', email), { email, createdAt: new Date().toISOString() });
      const response = await register(email, password, photoUrl);
      if (response) {
        setAlert({ type: 'success', message: 'Signup successful! Redirecting...' });
      }
      // setTimeout(() => router.push('/(app)/profile'), 1500);
    } catch (error) {
      setAlert({ type: 'error', message: error.message });
      setAlert({
        type: 'error',
        message: error.code === 'auth/email-already-in-use'
          ? 'Email already in use. Please sign in instead.'
          : 'Failed to create account. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };



  // ... keep your existing Google Sign In and registration logic ...

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ backgroundColor: colors.background }}
      className="flex-1"
    >
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1 }}
        className="flex-1"
      >
        <View className="flex-1 px-6">
          {/* Header Section */}
          <View className="h-56 justify-end mb-8">
            <Text className="text-4xl font-bold mb-2" style={{ color: colors.text }}>
              Kiliq
              <Text style={{ fontSize: 16, color: colors.textSecondary }}> beta</Text>
            </Text>
          </View>

          {/* Main Content */}
          <View>
            <Text className="text-2xl font-bold mb-8" style={{ color: colors.text }}>
              Sign Up
            </Text>
            <Text className="text-lg mb-8" style={{ color: colors.textSecondary }}>
              Create your account
            </Text>

            {step === 1 ? (
              <View>
                {/* Google Sign Up Button */}
                <TouchableOpacity
                  className="w-full h-14 rounded-lg mb-6 flex-row items-center px-4"
                  style={{ backgroundColor: colors.buttonBg }}
                  onPress={handleGoogleSignUp}
                  disabled={loading}
                >
                  <AntDesign name="google" size={24} color="white" />
                  <Text className="ml-3 font-medium" style={{ color: colors.text }}>
                    {loading ? 'Signing up...' : 'Continue with Google'}
                  </Text>
                </TouchableOpacity>

                {/* Divider */}
                <View className="flex-row items-center mb-6">
                  <View className="flex-1 h-[1px]" style={{ backgroundColor: colors.textSecondary }} />
                  <Text className="mx-4" style={{ color: colors.textSecondary }}>OR</Text>
                  <View className="flex-1 h-[1px]" style={{ backgroundColor: colors.textSecondary }} />
                </View>

                {/* Sign In Link */}
                <View className="mt-6 flex-row justify-center">
                  <Text style={{ color: colors.textSecondary }}>
                    Already have an account?{' '}
                  </Text>
                  <TouchableOpacity onPress={() => router.push('/(auth)/signin')}>
                    <Text style={{ color: colors.accent }}>Sign In</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View>
                {/* Email Input (Disabled) */}
                <View className="mb-4">
                  <Text className="text-sm mb-2" style={{ color: colors.textSecondary }}>
                    Email
                  </Text>
                  <View className="w-full h-14 rounded-lg px-4 flex-row items-center"
                    style={{ backgroundColor: colors.inputBg }}>
                    <AntDesign name="mail" size={20} color={colors.textSecondary} />
                    <TextInput
                      value={email}
                      editable={false}
                      className="flex-1 ml-3 h-full"
                      style={{ color: colors.textSecondary }}
                    />
                  </View>
                </View>

                {/* Password Input */}
                <View className="mb-6">
                  <Text className="text-sm mb-2" style={{ color: colors.textSecondary }}>
                    Create Password
                  </Text>
                  <View className="w-full h-14 rounded-lg px-4 flex-row items-center"
                    style={{ backgroundColor: colors.inputBg }}>
                    <AntDesign name="lock" size={20} color={colors.textSecondary} />
                    <TextInput
                      placeholder="Enter your password"
                      placeholderTextColor={colors.textSecondary}
                      secureTextEntry
                      className="flex-1 ml-3 h-full"
                      style={{ color: colors.text }}
                      onChangeText={setPassword}
                    />
                  </View>
                </View>

                {/* Sign Up Button */}
                <TouchableOpacity
                  className="w-full h-14 rounded-lg items-center justify-center"
                  style={{ backgroundColor: colors.text }}
                  onPress={handleSignUp}
                  disabled={loading}
                >
                  <Text style={{ color: colors.background, fontWeight: '600' }}>
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </Text>
                </TouchableOpacity>

                {/* Sign In Link */}
                <View className="mt-6 flex-row justify-center">
                  <Text style={{ color: colors.textSecondary }}>
                    Already have an account?{' '}
                  </Text>
                  <TouchableOpacity onPress={() => router.push('/(auth)/signin')}>
                    <Text style={{ color: colors.accent }}>Sign In</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>

        {alert && (
          <CustomAlert
            visible={!!alert}
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
          />
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}