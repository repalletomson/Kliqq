import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, TextInput } from 'react-native';

export default function ProfileInfoStep({ nextStep }) {
  return (
    <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>
        Tell Us About Yourself
      </Text>
      <TextInput placeholder="Full Name" style={{ borderWidth: 1, borderColor: 'gray', width: '100%', padding: 10, marginBottom: 10, borderRadius: 5 }} />
      <TextInput placeholder="Username" style={{ borderWidth: 1, borderColor: 'gray', width: '100%', padding: 10, marginBottom: 20, borderRadius: 5 }} />
      <TouchableOpacity onPress={nextStep} style={{ backgroundColor: '#007AFF', padding: 15, borderRadius: 5 }}>
        <Text style={{ color: 'white', fontWeight: 'bold' }}>Next Step</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
} 