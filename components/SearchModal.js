import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { collection, query, where, getDocs ,getDoc,doc} from 'firebase/firestore';
import { db, auth } from '../config/firebaseConfig';
// import  { useNavigation } from '@react-navigation/native';
const USERS_PER_PAGE = 10;
const DEFAULT_PROFILE = require('../assets/images/Default.webp');

export const SearchModal = ({ visible, onClose, onSelectUser }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const searchUsers = async (query1, resetPage = true) => {
    if (!query1.trim()) return;
    setLoading(true);
    console.log("query", query1)
    try {
      const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
      const userCollege = userDoc.data()?.college?.name;

      const usersRef = collection(db, 'users');
      const q = query(
        usersRef,
        where('college.name', '==', userCollege)
      );

      const snapshot = await getDocs(q);
      const allUsers = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(u => 
          u.id !== auth.currentUser.uid &&
          u.fullName?.toLowerCase().includes(query1.toLowerCase())
        );

      const startIndex = resetPage ? 0 : (page - 1) * USERS_PER_PAGE;
      const paginatedUsers = allUsers.slice(startIndex, startIndex + USERS_PER_PAGE);
      
      setUsers(resetPage ? paginatedUsers : [...users, ...paginatedUsers]);
      console.log("paginatedUsers", users)
      setHasMore(allUsers.length > startIndex + USERS_PER_PAGE);
      if (resetPage) setPage(1);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      setPage(prev => prev + 1);
      searchUsers(searchQuery, false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide">
      <View className="flex-1 bg-white pt-12">
        <View className="px-4 flex-row items-center justify-between mb-4">
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#000" />
          </TouchableOpacity>
          <Text className="text-xl font-semibold">New Chat</Text>
          <View style={{ width: 24 }} />
        </View>

        <View className="px-4 mb-4">
          <View className="flex-row items-center bg-gray-100 rounded-full px-4 py-2">
            <Ionicons name="search" size={20} color="#666" />
            <TextInput
              className="flex-1 ml-2 text-base"
              placeholder="Search users..."
              value={searchQuery}
              onChangeText={text => {
                setSearchQuery(text);
                searchUsers(text);
              }}
            />
          </View>
        </View>

        <FlatList
          data={users}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity 
              className="flex-row items-center p-4 active:bg-gray-50"
              onPress={() => onSelectUser(item)}
            >
              <Image
                source={item.photoURL ? { uri: item.photoURL } : DEFAULT_PROFILE}
                className="w-12 h-12 rounded-full"
              />
              <View className="ml-4">
                <Text className="text-lg font-medium">{item.fullName}</Text>
                <Text className="text-sm text-gray-500">{item.college?.name}</Text>
              </View>
            </TouchableOpacity>
          )}
          ItemSeparatorComponent={() => <View className="h-[1px] bg-gray-100" />}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={() => (
            loading ? (
              <View className="py-4">
                <ActivityIndicator color="#701ac0" />
              </View>
            ) : null
          )}
          ListEmptyComponent={() => (
            !loading && (
              <View className="flex-1 justify-center items-center p-8">
                <Text className="text-gray-500 text-center">
                  No users found matching "{searchQuery}"
                </Text>
              </View>
            )
          )}
        />
      </View>
    </Modal>
  );
};
