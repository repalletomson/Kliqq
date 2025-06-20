import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { Feather } from '@expo/vector-icons';

export default function ProfilePhotoStep({ nextStep, prevStep }) {
  return (
    <SafeAreaView style={{ flex: 1, justifyContent: 'space-between', alignItems: 'center', padding: 20 }}>
      <View />
      <View style={{ alignItems: 'center' }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>
          Add a Profile Photo
        </Text>
        <TouchableOpacity style={{ width: 150, height: 150, borderRadius: 75, backgroundColor: '#EFEFEF', justifyContent: 'center', alignItems: 'center', marginBottom: 20 }}>
          <Feather name="camera" size={50} color="#888" />
        </TouchableOpacity>
      </View>
      <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between' }}>
        <TouchableOpacity onPress={prevStep} style={{ padding: 15 }}>
          <Text style={{ color: '#007AFF', fontWeight: 'bold' }}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={nextStep} style={{ backgroundColor: '#007AFF', padding: 15, borderRadius: 5 }}>
          <Text style={{ color: 'white', fontWeight: 'bold' }}>Next Step</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
} 