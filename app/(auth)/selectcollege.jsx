
import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView
} from 'react-native';
import { useAuth } from '../../context/authContext';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

// Comprehensive list of colleges in TS and AP
const collegesList = [
  { 
    id: '1', 
    name: 'ACE',
    fullName: 'ACE ENGINEERING COLLEGE',
    location: 'Hyderabad',
    state: 'Telangana'
  },
  {
    id: '2',
    name: 'MGIT',
    fullName: 'MAHATMA GANDHI INSTITUTE OF TECHNOLOGY',
    location: 'Hyderabad',
    state: 'Telangana'
  },
  {
    id: '3',
    name: 'MLID',
    fullName: 'M L R INSTITUTE OF TECHNOLOGY',
    location: 'Hyderabad',
    state: 'Telangana'
  },
  {
    id: '4',
    name: 'CBIT',
    fullName: 'Chaitanya Bharathi Institute of Technology',
    location: 'Hyderabad',
    state: 'Telangana'
  },
  {
    id: '5',
    name: 'VCE',
    fullName: 'Vasavi College of Engineering',
    location: 'Hyderabad',
    state: 'Telangana'
  },
  {
    id: '6',
    name: 'IARE',
    fullName: 'INSTITUTE OF AERONAUTICAL ENGINEERING',
    location: 'Hyderabad',
    state: 'Telangana'
  },
  {
    id: '7',
    name: 'AVNIET',
    fullName: 'AVN INSTITUTE OF ENGINEERING AND TECHNOLOGY',
    location: 'Hyderabad',
    state: 'Telangana'
  }
];

export default function SelectCollege() {
  const { updateUserCollege } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredColleges, setFilteredColleges] = useState(collegesList);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Search handler with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearch = useCallback((query) => {
    const filtered = collegesList.filter(college => 
      college.name.toLowerCase().includes(query.toLowerCase()) ||
      college.fullName.toLowerCase().includes(query.toLowerCase()) ||
      college.location.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredColleges(filtered);
  }, []);

  const handleSelectCollege = async (college) => {
    setIsLoading(true);
    setError(null);
    try {
      console.log("college",college)
      await updateUserCollege(college);  
      router.push('/(root)/(tabs)/home');
    } catch (error) {
      setError('Failed to update college selection');
      Alert.alert(
        'Error',
        'Unable to select college. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const renderCollege = ({ item }) => (
    <TouchableOpacity 
      style={styles.collegeItem}
      onPress={() => handleSelectCollege(item)}
    >
      <View style={styles.collegeContent}>
        <Text style={styles.collegeShortName}>{item.name}</Text>
        <Text style={styles.collegeName}>{item.fullName}</Text>
      </View>
      <MaterialIcons name="chevron-right" size={24} color="#6B7280" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoid}
      >
        <View style={styles.header}>
          <MaterialIcons name="account-balance" size={40} color="#4F46E5" style={styles.icon} />
          <Text style={styles.title}>Select your{'\n'}College</Text>
          <Text style={styles.subtitle}>
            This helps us to personalize the feed based on your college.
          </Text>
        </View>

        <View style={styles.searchContainer}>
          <MaterialIcons name="search" size={24} color="#6B7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for your college"
            placeholderTextColor="#6B7280"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}

        {isLoading ? (
          <ActivityIndicator size="large" color="#4F46E5" style={styles.loader} />
        ) : (
          <FlatList
            data={filteredColleges}
            renderItem={renderCollege}
            keyExtractor={item => item.id}
            style={styles.list}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No colleges found</Text>
            }
          />
        )}

        <View style={styles.footer}>
          <MaterialIcons name="lock" size={20} color="#6B7280" />
          <Text style={styles.privacyText}>
            We never share this information with third parties.
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardAvoid: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 40,
  },
  icon: {
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
    lineHeight: 40,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    marginHorizontal: 20,
    marginBottom: 16,
    paddingHorizontal: 16,
    height: 48,
    borderRadius: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#111827',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 20,
  },
  collegeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  collegeContent: {
    flex: 1,
    marginRight: 16,
  },
  collegeShortName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  collegeName: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  privacyText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#6B7280',
  },
  errorText: {
    color: '#DC2626',
    textAlign: 'center',
    marginBottom: 16,
  },
  loader: {
    flex: 1,
    alignSelf: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: '#6B7280',
    fontSize: 16,
    marginTop: 24,
  },
});


