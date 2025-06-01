
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
  Image,
} from 'react-native';
import { router ,useNavigation} from 'expo-router';
import { AntDesign } from '@expo/vector-icons';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { useAuth } from '../../context/authContext';
import CustomAlert from '../../components/CustomAlert';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
const colors = {
  background: '#070606',
  text: '#FFFFFF',
  textSecondary: 'rgba(255, 255, 255, 0.6)',
  buttonBg: 'rgba(255, 255, 255, 0.1)',
  inputBg: 'rgba(255, 255, 255, 0.08)',
  accent: '#2196F3', // Blue accent for links
};

function SigninScreen() {


  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  // const navigation = useNavigation();
  const { login } = useAuth();
  const [isGoogleEmail, setIsGoogleEmail] = useState(false);
  
  const navigation = useNavigation();
  console.log("navigation",navigation.getState());

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
        
        // setTimeout(() => {
        //   try {
        //     // First navigate to a common parent
        //     // Then navigate to the target route
        //     router.replace('/(root)');
        //   } catch (error) {
        //     console.error('Navigation error:', error);
        //     // Fallback approach
        //     router.replace('/(root)/(tabs)/home');
        //   }
        // }, 1000);
        router.push('/(root)/(tabs)/home');
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
  
  
  useEffect(() => {
    GoogleSignin.configure({
      webClientId: '912883386678-q9jbm946ol5hr1j78059m1e6erhhi1n5.apps.googleusercontent.com',
    },[]);


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

    const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      
      // Sign out first
      await GoogleSignin.signOut();
      
      // Check Play Services
      await GoogleSignin.hasPlayServices();

      
      // Get Google user info
      // const signInResult = await GoogleSignin.signIn();
      const {type,data} = await GoogleSignin.signIn();
      
      // Set email from Google and mark it as Google email
      setEmail(data.user.email);
  
      setIsGoogleEmail(true);
      
      // Show alert to user
      // Alert.alert(
      //   "Email Captured",
      //   "Please enter your desired password to continue",
      //   [{ text: "OK" }]
      // );

    } catch (error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      
      // if (error.code === statusCodes.SIGN_IN_CANCELLED) {
      //   Alert.alert('Sign in was cancelled');
      // } else {
      //   Alert.alert('Error', error.message);
      // }
      // handleAuthError(error)
    } finally {
      setLoading(false);
    }
  };


  // ... existing login logic ...

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
              Log In
            </Text>
            <Text className="text-lg mb-8" style={{ color: colors.textSecondary }}>
              Welcome back!
            </Text>

            {/* Google Sign In Button */}
            <TouchableOpacity
              className="w-full h-14 rounded-lg mb-6 flex-row items-center px-4"
              style={{ backgroundColor: colors.buttonBg }}
              onPress={handleGoogleSignIn}
            >
              <AntDesign name="google" size={24} color="white" />
              <Text className="ml-3 font-medium" style={{ color: colors.text }}>
                Sign In with Google
              </Text>
            </TouchableOpacity>

            {/* Divider */}
            <View className="flex-row items-center mb-6">
              <View className="flex-1 h-[1px]" style={{ backgroundColor: colors.textSecondary }} />
              <Text className="mx-4" style={{ color: colors.textSecondary }}>OR</Text>
              <View className="flex-1 h-[1px]" style={{ backgroundColor: colors.textSecondary }} />
            </View>

            {/* Email Input */}
            <View className="mb-4">
              <View className="w-full h-14 rounded-lg px-4 flex-row items-center"
                style={{ backgroundColor: colors.inputBg }}>
                <AntDesign name="mail" size={20} color={colors.textSecondary} />
                <TextInput
                  placeholder="Your Email"
                  placeholderTextColor={colors.textSecondary}
                  className="flex-1 ml-3 h-full"
                  style={{ color: colors.text }}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                
              </View>
              <View className="w-full h-14 rounded-lg px-5 flex-row items-center mt-5"
                style={{ backgroundColor: colors.inputBg }}>
             <MaterialCommunityIcons name="form-textbox-password" size={24} color="white" />
                <TextInput
                 placeholder="Enter your password"
                 placeholderTextColor={colors.textSecondary}
                 value={password}
                 onChangeText={setPassword}
                 secureTextEntry
             
                  className="text-white ml-5"                 
                  autoCapitalize="none"
                />
                
              </View>
            </View>

            {/* Login Button */}
            <TouchableOpacity
              className="w-full h-14 rounded-lg items-center justify-center mt-4"
              style={{ backgroundColor: colors.text }}
              onPress={handleLogin}
            >
              <Text style={{ color: colors.background, fontWeight: '600' }}>
                Log In
              </Text>
            </TouchableOpacity>

            {/* Sign Up Link */}
            <View className="mt-6 flex-row justify-center">
              <Text style={{ color: colors.textSecondary }}>
                Don't have an account yet?{' '}
              </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
                <Text style={{ color: colors.accent }}>Sign Up</Text>
              </TouchableOpacity>
            </View>
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

export default SigninScreen;