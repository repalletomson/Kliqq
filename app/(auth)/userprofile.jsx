import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Image, 
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import { useAuth } from '../../context/authContext';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';
import { StatusBar } from 'expo-status-bar';
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
  "Movies & TV Shows",
  "Music",
  "Photography",
  "Reading",
  "Sports",
  "Traveling",
  "Cooking",
  "Fitness",
  "Art & Design"
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

const years = Array.from({length: 8}, (_, i) => (new Date().getFullYear() + i).toString());

export default  function InteractiveProfile() {
  const { user, updateUserProfile } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  
  const [profileData, setProfileData] = useState({
    fullName: user?.fullName || '',
    profileImage: user?.profileImage || 'https://imgs.search.brave.com/SRTQLz_BmOq7xwzV7ls7bV62QzMZtDrGSacNS5G1d1A/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly9pY29u/cy52ZXJ5aWNvbi5j/b20vcG5nLzEyOC9t/aXNjZWxsYW5lb3Vz/LzNweC1saW5lYXIt/ZmlsbGV0LWNvbW1v/bi1pY29uL2RlZmF1/bHQtbWFsZS1hdmF0/YXItMS5wbmc',
    interests: user?.interests || [],
    branch: user?.branch || '',
    passoutYear: user?.passoutYear || ''
  });

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        setProfileData(prev => ({
          ...prev,
          profileImage: result.assets[0].uri
        }));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleInterestToggle = (interest) => {
    setProfileData(prev => {
      const updatedInterests = prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest];
      return { ...prev, interests: updatedInterests };
    });
  };

  const handleSave = async () => {
    try {
      await updateUserProfile(profileData);
      Alert.alert(
        'Profile Complete!', 
        'Thank you for setting up your profile. Welcome to Campus Connect!',
        [{ text: 'Continue', onPress: () => router.replace('/(auth)/selectcollege') }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <View className="space-y-6">
            <Text className="text-2xl font-bold text-gray-900 mb-2">
              Let's start with the basics
            </Text>
            <Text className="text-gray-600 mb-4">
              Tell us your name and add a profile picture
            </Text>

            <TouchableOpacity 
              onPress={pickImage}
              className="items-center mb-6"
            >
              <View className="relative">
                <Image
                  source={{ uri: profileData.profileImage }}
                  className="w-28 h-28 rounded-full"
                />
                <View className="absolute bottom-0 right-0 bg-purple-600 p-2 rounded-full">
                  <MaterialIcons name="camera-alt" size={20} color="white" />
                </View>
              </View>
              <Text className="text-purple-600 mt-2 text-sm font-medium">
                Change Profile Picture
              </Text>
            </TouchableOpacity>

            <View>
              <Text className="text-gray-700 font-medium mb-2">Full Name</Text>
              <TextInput
                className="w-full h-12 px-4 rounded-xl bg-gray-50 text-gray-900 border border-gray-200"
                value={profileData.fullName}
                onChangeText={(text) => setProfileData(prev => ({...prev, fullName: text}))}
                placeholder="Enter your full name"
              />
            </View>
          </View>
        );

      case 2:
        return (
          <View className="space-y-6">
            <Text className="text-2xl font-bold text-gray-900 mb-2">
              What are you interested in?
            </Text>
            <Text className="text-gray-600 mb-4">
              Select your interests to connect with like-minded peers
            </Text>

            <View className="flex-row flex-wrap gap-2">
              {interests.map((interest) => (
                <TouchableOpacity
                  key={interest}
                  onPress={() => handleInterestToggle(interest)}
                  className={`px-4 py-2 rounded-full ${
                    profileData.interests.includes(interest)
                      ? 'bg-purple-600'
                      : 'bg-gray-100'
                  }`}
                >
                  <Text className={
                    profileData.interests.includes(interest)
                      ? 'text-white font-medium'
                      : 'text-gray-700'
                  }>
                    {interest}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 3:
        return (
          <View className="space-y-6">
            <Text className="text-2xl font-bold text-gray-900 mb-2">
              Academic Details
            </Text>
            <Text className="text-gray-600 mb-4">
              Tell us about your academic background
            </Text>

            <View className="space-y-4">
              <View>
                <Text className="text-gray-700 font-medium mb-2">Branch</Text>
                <View className="bg-gray-50 rounded-xl border border-gray-200 px-4">
                  <Picker
                    selectedValue={profileData.branch}
                    onValueChange={(value) => setProfileData(prev => ({...prev, branch: value}))}
                    style={{ color: '#1F2937' }}
                  >
                    <Picker.Item label="Select your branch" value="" />
                    {branches.map(branch => (
                      <Picker.Item key={branch} label={branch} value={branch} />
                    ))}
                  </Picker>
                </View>
              </View>

              <View>
                <Text className="text-gray-700 font-medium mb-2">Passout Year</Text>
                <View className="bg-gray-50 rounded-xl border border-gray-200 px-4">
                  <Picker
                    selectedValue={profileData.passoutYear}
                    onValueChange={(value) => setProfileData(prev => ({...prev, passoutYear: value}))}
                    style={{ color: '#1F2937' }}
                  >
                    <Picker.Item label="Select your passout year" value="" />
                    {years.map(year => (
                      <Picker.Item key={year} label={year} value={year} />
                    ))}
                  </Picker>
                </View>
              </View>
            </View>
          </View>
        );
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white"
    >
      <ScrollView className="flex-1 px-6 pt-6">
        <StatusBar barStyle="dark-content" backgroundColor='white' />
        {/* Progress Indicator */}
        <View className="flex-row justify-between mb-8">
          {[1, 2, 3].map((stepNumber) => (
            <View 
              key={stepNumber}
              className={`flex-1 h-1 rounded-full mx-1 ${
                stepNumber <= step ? 'bg-purple-600' : 'bg-gray-200'
              }`}
            />
          ))}
        </View>

        {renderStep()}

        {/* Navigation Buttons */}
        <View className="flex-row justify-between mt-8 mb-6">
          {step > 1 && (
            <TouchableOpacity
              className="px-6 py-3 rounded-xl bg-gray-100"
              onPress={() => setStep(prev => prev - 1)}
            >
              <Text className="text-gray-700 font-medium">Previous</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            className={`px-6 py-3 rounded-xl ${
              step === 3 ? 'bg-purple-600' : 'bg-purple-600'
            }`}
            onPress={() => {
              if (step === 3) {
                handleSave();
              } else {
                setStep(prev => prev + 1);
              }
            }}
          >
            <Text className="text-white font-medium">
              {step === 3 ? 'Complete Profile' : 'Next'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

