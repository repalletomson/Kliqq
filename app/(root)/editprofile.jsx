import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { useRouter, useNavigation } from 'expo-router';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, auth } from '../../config/firebaseConfig';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';

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

function EditProfile ()  {
  const router = useRouter();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [userData, setUserData] = useState({
    fullName: '',
    branch: '',
    passoutYear: '',
    about: '',
    interests: [],
    profileImage: ''
  });

  // Load current user data
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userDoc = doc(db, 'users', auth.currentUser.uid);
        const docSnap = await getDoc(userDoc);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserData({
            fullName: data.fullName || '',
            branch: data.branch || '',
            passoutYear: data.passoutYear || '',
            about: data.about || '',
            interests: data.interests || [],
            profileImage: data.profileImage || ''
          });
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        Alert.alert('Error', 'Failed to load profile data');
      }
    };

    loadUserData();
  }, []);

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
      
      setUserData(prev => ({ ...prev, profileImage: downloadURL }));
      return downloadURL;
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Error', 'Failed to upload image');
    } finally {
      setImageUploading(false);
    }
  };

  const handleSave = async () => {
    if (!userData.fullName.trim()) {
      Alert.alert('Error', 'Full name is required');
      return;
    }

    try {
      setLoading(true);
      const userRef = doc(db, 'users', auth.currentUser.uid);
      
      await updateDoc(userRef, {
        ...userData,
        updatedAt: new Date()
      });

      Alert.alert('Success', 'Profile updated successfully');
      router.push('/(tabs)/profile');
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
      <ScrollView className="flex-1 px-6">
        <View className="items-center mt-8 mb-8">
          <TouchableOpacity onPress={handleImagePick}>
            <View className="relative">
              <Image
                source={{ 
                  uri: userData.profileImage || 
                    'https://via.placeholder.com/150'
                }}
                className="w-32 h-32 rounded-full border-4 border-gray-200"
              />
              <View className="absolute bottom-0 right-0 bg-blue-600 p-2 rounded-full shadow-lg">
                <MaterialIcons name="camera-alt" size={24} color="white" />
              </View>
            </View>
          </TouchableOpacity>
          {imageUploading && (
            <ActivityIndicator size="small" color="#3B82F6" className="mt-4" />
          )}
        </View>

        <View className="space-y-5">
          <View>
            <Text className="text-gray-700 text-base mb-2 font-semibold">Full Name*</Text>
            <TextInput
              value={userData.fullName}
              onChangeText={(text) => setUserData(prev => ({ ...prev, fullName: text }))}
              className="bg-gray-50 text-gray-900 p-4 rounded-xl border border-gray-200"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View>
            <Text className="text-gray-700 text-base mb-2 font-semibold">About</Text>
            <TextInput
              value={userData.about}
              onChangeText={(text) => setUserData(prev => ({ ...prev, about: text }))}
              multiline
              numberOfLines={4}
              className="bg-gray-50 text-gray-900 p-4 rounded-xl border border-gray-200"
              placeholderTextColor="#9CA3AF"
              textAlignVertical="top"
            />
          </View>

          <View>
            <Text className="text-gray-700 text-base mb-2 font-semibold">Interests</Text>
            <View className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
              <Picker
                selectedValue={userData.interests}
                onValueChange={(itemValue) => 
                  setUserData(prev => ({...prev, interests: itemValue}))
                }
                style={{ color: '#1F2937' }}
              >
                {interests.map((interest) => (
                  <Picker.Item 
                    key={interest}
                    label={interest}
                    value={interest}
                    style={{ fontSize: 16 }}
                  />
                ))}
              </Picker>
            </View>
          </View>

          <View>
            <Text className="text-gray-700 text-base mb-2 font-semibold">Branch</Text>
            <View className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
              <Picker
                selectedValue={userData.branch}
                onValueChange={(itemValue) => 
                  setUserData(prev => ({...prev, branch: itemValue}))
                }
                style={{ color: '#1F2937' }}
              >
                {branches.map((branch) => (
                  <Picker.Item 
                    key={branch}
                    label={branch}
                    value={branch}
                    style={{ fontSize: 16 }}
                  />
                ))}
              </Picker>
            </View>
          </View>

          <View>
            <Text className="text-gray-700 text-base mb-2 font-semibold">Passout Year</Text>
            <View className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
              <Picker
                selectedValue={userData.passoutYear}
                onValueChange={(itemValue) => 
                  setUserData(prev => ({...prev, passoutYear: itemValue}))
                }
                style={{ color: '#1F2937' }}
              >
                {years.map((year) => (
                  <Picker.Item 
                    key={year}
                    label={year}
                    value={year}
                    style={{ fontSize: 16 }}
                  />
                ))}
              </Picker>
            </View>
          </View>
        </View>

        <View className="my-8 space-y-4">
          <TouchableOpacity
            onPress={handleSave}
            disabled={loading}
            className={`rounded-xl p-4 shadow-md ${loading ? 'bg-gray-400' : 'bg-blue-600'}`}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-center font-bold text-lg">
                Save Changes
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="rounded-xl p-4 bg-gray-100 shadow-sm"
          >
            <Text className="text-gray-700 text-center font-bold text-lg">
              Go Back
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default EditProfile;
// import { View, Text } from 'react-native'
// import React from 'react'

// export default function editprofile() {
//   return (
//     <View>
//       <Text>editprofile</Text>
//     </View>
//   )
// }