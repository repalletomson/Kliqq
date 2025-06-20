import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, TextInput } from 'react-native';

export default function GraduationStep({ nextStep, prevStep }) {
  return (
    <SafeAreaView style={{ flex: 1, justifyContent: 'space-between', alignItems: 'center', padding: 20 }}>
      <View />
      <View style={{ alignItems: 'center', width: '100%' }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>
          Education Details
        </Text>
        <TextInput placeholder="College / University" style={{ borderWidth: 1, borderColor: 'gray', width: '100%', padding: 10, marginBottom: 10, borderRadius: 5 }} />
        <TextInput placeholder="Graduation Year" style={{ borderWidth: 1, borderColor: 'gray', width: '100%', padding: 10, marginBottom: 20, borderRadius: 5 }} />
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