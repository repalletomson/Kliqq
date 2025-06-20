import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StatusBar
} from 'react-native';
import { useRouter, useNavigation } from 'expo-router';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, auth } from '../../config/firebaseConfig';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeNavigation } from '../../hooks/useSafeNavigation';
import { useAuth } from '../../context/authContext';
import { supabase } from '../../config/supabaseConfig';

const interests = [
  "Programming",
  "Artificial Intelligence",
  "Web Development",
  "Mobile Development",
  "Data Science",
  "Cybersecurity",
  "Cloud Computing",
  "UI/UX Design",
  "Gaming",
  "Playing Sports",
  "Reading",
  "Music",
  "Photography",
  "Robotics",
  "IoT",
  "Blockchain"
];

const branches = [
  "Computer Science",
  "Information Technology",
  "Electronics & Communication",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Chemical Engineering",
  "Biotechnology"
];

const years = Array.from(
  { length: 8 }, 
  (_, i) => (new Date().getFullYear() + i).toString()
);

const COLORS = {
  background: '#000000',
  cardBg: '#111111',
  text: '#FFFFFF',
  textSecondary: '#E5E5E5',
  textMuted: '#A1A1AA',
  inputBg: '#1A1A1A',
  inputBorder: '#404040',
  accent: '#8B5CF6',
  border: 'rgba(255, 255, 255, 0.1)',
  danger: '#EF4444',
};

const EditProfile = () => {
  const router = useRouter();
  const navigation = useNavigation();
  const { safeBack } = useSafeNavigation({ modals: [], onCleanup: () => {} });
  const [loading, setLoading] = useState(true);
  const [imageUploading, setImageUploading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [saving, setSaving] = useState(false);
  const isMounted = useRef(true);
  
  const { user } = useAuth();

  // Load user data
  useEffect(() => {
    const loadUserData = async () => {
      try {
        if (!user?.uid) {
          console.error('No user ID available');
          if (isMounted.current) {
            setLoading(false);
            Alert.alert('Error', 'Unable to load user data. Please try again.');
            safeBack();
          }
          return;
        }

        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.uid)
          .single();

        if (error) {
          console.error('Error fetching user data:', error);
          if (isMounted.current) {
            setLoading(false);
            Alert.alert('Error', 'Failed to load user data. Please try again.');
            safeBack();
          }
          return;
        }

        if (isMounted.current) {
          setUserData(data || {
            full_name: user.displayName || '',
            username: '',
            bio: '',
            email: user.email || '',
            profile_image: user.photoURL || '',
          });
          setLoading(false);
        }
      } catch (error) {
        console.error('Error in loadUserData:', error);
        if (isMounted.current) {
          setLoading(false);
          Alert.alert('Error', 'An unexpected error occurred. Please try again.');
          safeBack();
        }
      }
    };

    loadUserData();
  }, [user]);

  const handleImagePick = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        await uploadImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const uploadImage = async (uri) => {
    try {
      setImageUploading(true);
      const response = await fetch(uri);
      const blob = await response.blob();
      const imageRef = ref(storage, `profile/${auth.currentUser.uid}_${Date.now()}`);
      
      await uploadBytes(imageRef, blob);
      const downloadURL = await getDownloadURL(imageRef);
      
      setUserData(prev => ({ ...prev, profile_image: downloadURL }));
      return downloadURL;
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Error', 'Failed to upload image');
    } finally {
      setImageUploading(false);
    }
  };

  const handleSave = async () => {
    if (!userData || !user?.uid) {
      Alert.alert('Error', 'Unable to save changes. Please try again.');
      return;
    }

    try {
      setSaving(true);

      const { error } = await supabase
        .from('users')
        .upsert({
          id: user.uid,
          ...userData,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      if (isMounted.current) {
        Alert.alert('Success', 'Profile updated successfully');
        safeBack();
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      if (isMounted.current) {
        Alert.alert('Error', 'Failed to save changes. Please try again.');
      }
    } finally {
      if (isMounted.current) {
        setSaving(false);
      }
    }
  };

  if (loading) {
    return (
      <View style={{ 
        flex: 1, 
        backgroundColor: COLORS.background,
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
        <ActivityIndicator size="large" color={COLORS.accent} />
        <Text style={{ 
          color: COLORS.textSecondary,
          marginTop: 16,
          fontSize: 16
        }}>
          Loading profile...
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      
      {/* Header */}
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: Platform.OS === 'ios' ? 50 : 40,
        paddingHorizontal: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
      }}>
        <TouchableOpacity
          onPress={safeBack}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        
        <Text style={{
          fontSize: 18,
          fontWeight: '600',
          color: COLORS.text,
        }}>
          Edit Profile
        </Text>

        <TouchableOpacity
          onPress={handleSave}
          disabled={saving}
          style={{
            opacity: saving ? 0.6 : 1,
          }}
        >
          <Text style={{
            color: COLORS.accent,
            fontSize: 16,
            fontWeight: '600',
          }}>
            {saving ? 'Saving...' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Image */}
        <View style={{ alignItems: 'center', marginBottom: 24 }}>
          <Image
            source={{ uri: userData?.profile_image || 'https://via.placeholder.com/100' }}
            style={{
              width: 100,
              height: 100,
              borderRadius: 50,
              marginBottom: 12,
            }}
          />
          <TouchableOpacity
            style={{
              backgroundColor: COLORS.inputBg,
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: COLORS.border,
            }}
          >
            <Text style={{ color: COLORS.accent }}>Change Photo</Text>
          </TouchableOpacity>
        </View>

        {/* Form Fields */}
        <View style={{ gap: 20 }}>
          <View>
            <Text style={{
              color: COLORS.textSecondary,
              marginBottom: 8,
              fontSize: 14,
            }}>
              Full Name
            </Text>
            <TextInput
              value={userData?.full_name || ''}
              onChangeText={(text) => setUserData(prev => ({ ...prev, full_name: text }))}
              style={{
                backgroundColor: COLORS.inputBg,
                borderRadius: 12,
                padding: 16,
                color: COLORS.text,
                fontSize: 16,
                borderWidth: 1,
                borderColor: COLORS.border,
              }}
              placeholderTextColor={COLORS.textMuted}
              placeholder="Enter your full name"
            />
          </View>

          <View>
            <Text style={{
              color: COLORS.textSecondary,
              marginBottom: 8,
              fontSize: 14,
            }}>
              Username
            </Text>
            <TextInput
              value={userData?.username || ''}
              onChangeText={(text) => setUserData(prev => ({ ...prev, username: text }))}
              style={{
                backgroundColor: COLORS.inputBg,
                borderRadius: 12,
                padding: 16,
                color: COLORS.text,
                fontSize: 16,
                borderWidth: 1,
                borderColor: COLORS.border,
              }}
              placeholderTextColor={COLORS.textMuted}
              placeholder="Enter your username"
            />
          </View>

          <View>
            <Text style={{
              color: COLORS.textSecondary,
              marginBottom: 8,
              fontSize: 14,
            }}>
              Bio
            </Text>
            <TextInput
              value={userData?.bio || ''}
              onChangeText={(text) => setUserData(prev => ({ ...prev, bio: text }))}
              style={{
                backgroundColor: COLORS.inputBg,
                borderRadius: 12,
                padding: 16,
                color: COLORS.text,
                fontSize: 16,
                borderWidth: 1,
                borderColor: COLORS.border,
                height: 120,
                textAlignVertical: 'top',
              }}
              multiline
              numberOfLines={4}
              placeholderTextColor={COLORS.textMuted}
              placeholder="Write something about yourself"
            />
          </View>

          <View>
            <Text style={{
              color: COLORS.textSecondary,
              marginBottom: 8,
              fontSize: 14,
            }}>
              Email
            </Text>
            <TextInput
              value={userData?.email || ''}
              editable={false}
              style={{
                backgroundColor: COLORS.inputBg,
                borderRadius: 12,
                padding: 16,
                color: COLORS.textMuted,
                fontSize: 16,
                borderWidth: 1,
                borderColor: COLORS.border,
              }}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default EditProfile;