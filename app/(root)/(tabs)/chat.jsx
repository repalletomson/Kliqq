
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  Modal,
  InteractionManager,
  BackHandler,
  StatusBar,
  Pressable,
  ActivityIndicator
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  getDoc,
  getDocs,
  addDoc,
  deleteDoc,
  updateDoc
} from 'firebase/firestore';
import { ref, deleteObject, listAll } from 'firebase/storage';
import { router } from 'expo-router';
import { useAuth } from '../../../context/authContext';
import { db, auth, storage } from '../../../config/firebaseConfig';
import { formatMessageTime } from '../../../utiles/dateFormat';
import { SearchModal } from '../../../components/SearchModal';
import { CHAT_TYPES } from '../../../types/index';

import { AES, enc } from "react-native-crypto-js";

const DEFAULT_PROFILE='https://assets.grok.com/users/8c354dfe-946c-4a32-b2de-5cb3a8ab9776/generated/h4epnwdFODX6hW0L/image.jpg';
const COLORS = {
  background: '#070606',
  surface: '#171616',
  textPrimary: '#FFFFFF',
  textSecondary: '#B2B3B2',
  accent: '#6C6C6D',
  separator: '#1E1E1E',
  buttonBackground: '#1A1A1A',
  primary: '#007AFF',
  border: '#333333'
};
const SECRET_KEY = "my-very-secure-key-12345";

export default function ChatList() {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedChat, setSelectedChat] = useState(null);
  const [error, setError] = useState(null);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const { user } = useAuth();
  const [unreadCounts, setUnreadCounts] = useState({});
  const mounted = useRef(true);
  const searchTimeout = useRef(null);
  const chatsUnsubscribe = useRef(null);
      
  // useEffect(() => {
  //   const q = query(
  //     collection(db, "unreadCounts", auth.currentUser.uid, "senders")
  //   );
  //   const unsubscribe = onSnapshot(q, (snapshot) => {
  //     const counts = {};
  //     snapshot.docs.forEach((doc) => {
  //       counts[doc.id] = doc.data().count;
  //     });
  //     setUnreadCounts(counts);
  // // console.log("counts",unreadCounts)
  // // console.log("ksdnskn")
  //   });
  //   return () => unsubscribe();
  // }, [unreadCounts]);



  // useEffect(() => {
  //   const userId = auth.currentUser.uid; // Replace with the current user's ID
  //   listenForUnreadCounts(userId, (counts) => {
  //     setUnreadCounts(counts);

  //     console.log('Unread counts:', counts);
  //   });
  // }, []);

  // const currentUserId = auth.currentUser.uid; 
// console.log("currentUserId",auth.currentUser.uid)
// chats.js (only showing the unread count retrieval part)
useEffect(() => {
  const q = query(
    collection(db, "unreadCounts", auth.currentUser.uid, "senders")
  );
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const counts = {};
    snapshot.docs.forEach((doc) => {
      counts[doc.id] = doc.data().count;
    });
    setUnreadCounts(counts);
  });
  return () => unsubscribe();
}, []);


  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (searchQuery) {
          setSearchQuery('');
          return true;
        }
        return false;
      }
    );

    return () => {
      mounted.current = false;
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
      if (chatsUnsubscribe.current) chatsUnsubscribe.current();
      backHandler.remove();
    };
  }, [searchQuery]);

  const getOtherParticipantId = useCallback((participants = [], currentUserId) => {
    if (!Array.isArray(participants) || participants.length < 2) return null;
    return participants.find(id => id !== currentUserId) || null;
  }, []);

  const fetchUserDetails = async (userId) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      return userDoc.exists() ? userDoc.data() : null;
    } catch (error) {
      console.error('Error fetching user details:', error);
      return null;
    }
  };

  const loadChats = useCallback(async () => {
    try {
      setLoading(true);
      
      // Check if user is authenticated
      if (!auth.currentUser?.uid) {
        throw new Error('User not authenticated');
      }

      const chatsQuery = query( 
        collection(db, 'chats'),
        where('participants', 'array-contains', auth.currentUser.uid),
        orderBy('lastMessageTime', 'desc')
      );
      
      chatsUnsubscribe.current = onSnapshot(chatsQuery, async (snapshot) => {
        try {
          const chatPromises = snapshot.docs.map(async (doc) => {
            const chatData = doc.data();
            if (chatData.type === CHAT_TYPES.GROUP) {
              return {
                id: doc.id,
                ...chatData,
                isGroup: true
              };
            }
            const otherUserId = getOtherParticipantId(chatData.participants, auth.currentUser.uid);
            if (!otherUserId) return null;

            const userDetails = await fetchUserDetails(otherUserId);
            
            return {
              id: doc.id,
              ...chatData,
              recipient: userDetails,
              recipientId: otherUserId,
              unreadCount: chatData.unreadCount || 0
            };
          });

          const populatedChats = (await Promise.all(chatPromises)).filter(Boolean);
          
          setChats(populatedChats);
          if (mounted.current) {
            setError(null);
          }

          const unreadQ = query(
            collection(db, "unreadCounts", auth.currentUser.uid, "senders")
          );
          const unreadUnsubscribe = onSnapshot(unreadQ, (snapshot) => {
            const counts = {};
            snapshot.docs.forEach((doc) => {
              counts[doc.id] = doc.data().count;
            });
            setUnreadCounts(counts);
          });

          return () => {

            unreadUnsubscribe();
          };
        } catch (err) {
          if (mounted.current) {
            console.error("Error loading chat details:", err);
            setError('Failed to load chat details');
          }
          console.error("Error loading chat details:", err);

        } finally {
          if (mounted.current) {
            setLoading(false);
          }
          setLoading(false)
        }
      }, (err) => {
        console.error("Firestore listener error:", err);
        if (mounted.current) {
          setError('Error listening to chat updates');
          setLoading(false);
        }
      });
      
    } catch (err) {
      console.error("Failed to initialize chat list:", err);
      if (mounted.current) {
        setError('Failed to initialize chat list');
      }
      setLoading(false);
    }
  }, [getOtherParticipantId]);

  useEffect(() => {
    loadChats();
    InteractionManager.runAfterInteractions(() => {});
    return () => {
      if (chatsUnsubscribe.current) {
        chatsUnsubscribe.current();
      }
    };
  }, [loadChats]);

  // Modified handleSearch to fetch all users instead of just same college
  const handleSearch = useCallback(async (queryText) => {
    if (!queryText.trim() || !auth.currentUser?.uid) {
      setSearchResults([]);
      setSearching(false);
      return;
    }

    setSearching(true);
    try {
      // Query all users without college filter
      const usersRef = collection(db, 'users');
      const usersQuery = query(usersRef);

      const snapshot = await getDocs(usersQuery);

      // Filter results by username and exclude the current user
      const results = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(u => 
          u.id !== auth.currentUser.uid &&
          u.fullName?.toLowerCase().includes(queryText.toLowerCase())
        );
    // console.log(results)
      if (mounted.current) {
        setSearchResults(results);
      }
      setSearchResults(results)
      console.log("dfbdj",searchResults)

    } catch (error) {
      console.error('Search error:', error);
      Alert.alert('Search Failed', 'Unable to search users');
    } finally {
      if (mounted.current) {
      }
      setSearching(false);
    }
  }, []);

  // Search debouncing effect
  useEffect(() => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    searchTimeout.current = setTimeout(() => handleSearch(searchQuery), 500);
  }, [searchQuery, handleSearch]);

  const deleteChat = async (chatId) => {
    try {
      setLoading(true);
      
      // Ensure chatId is valid
      if (!chatId) {
        throw new Error("Invalid chatId");
      }
     
      // Delete images from storage
      const imagesRef = ref(storage, `chats/${chatId}`);
        
      // Check if imagesRef is valid
      if (imagesRef) {
        try {
          const imagesList = await listAll(imagesRef);
  
          if (imagesList.items.length > 0) {
            await Promise.all(imagesList.items.map(item => deleteObject(item)));
          }
        } catch (error) {
          console.error('Error listing or deleting images:', error);
        }
      }
  
      // Delete messages
      const messagesRef = collection(db, 'chats', chatId, 'messages');
      const messagesSnapshot = await getDocs(messagesRef);
      await Promise.all(messagesSnapshot.docs.map(doc => deleteDoc(doc.ref)));
  
      // Delete chat document
      await deleteDoc(doc(db, 'chats', chatId));
  
      setShowDeleteModal(false);
      setSelectedChat(null);
      Alert.alert('Success', 'Chat deleted successfully');
    } catch (error) {
      console.error('Delete error:', error);
      Alert.alert('Error', 'Failed to delete chat');
    } finally {
      setLoading(false);
    }
  };
  

  const handleSearchNavigation = useCallback(async (recipientId) => {
    try {
      if (!recipientId) {
        Alert.alert('Error', 'Invalid recipient');
        return;
      }
       
      const chatsRef = collection(db, 'chats');
      const q = query(
        chatsRef,
        where('participants', 'array-contains', auth.currentUser.uid)
      );
      const snapshot = await getDocs(q);
      
      const existingChat = snapshot.docs.find(doc => 
        doc.data().participants.includes(recipientId)
      );

      if (existingChat) {
        router.push({
          pathname: '/(root)/[chatRoom]',
          params: { 
            chatId: existingChat.id,
            recipientId 
          }
        });
      } else {
        const newChatRef = await addDoc(chatsRef, {
          participants: [auth.currentUser.uid, recipientId],
          createdAt: new Date(),
          lastMessageTime: new Date(),
          lastMessage: null
        });

        router.push({
          pathname: '/(root)/[chatRoom]',
          params: { 
            chatId: newChatRef.id,
            recipientId 
          }
        });
      }
      setSearchQuery('');
    } catch (error) {
      console.error('Chat navigation error:', error);
      Alert.alert('Error', 'Failed to navigate to chat');
    }
  }, []);

  const handleChatNavigation = useCallback(async (recipientId) => {
    try {
      if (!recipientId) {
        Alert.alert('Error', 'Invalid recipient');
        return;
      }
      
      const chatsRef = collection(db, 'chats');
      const q = query(
        chatsRef,
        where('participants', 'array-contains', auth.currentUser.uid)
      );
      const snapshot = await getDocs(q);
      
      const existingChat = snapshot.docs.find(doc => 
        doc.data().participants.includes(recipientId)
      );

      if (existingChat) {
        router.push({
          pathname: '/(root)/[chatRoom]',
          params: { 
            chatId: existingChat.id,
            recipientId 
          }
        });
      } else {
        const newChatRef = await addDoc(chatsRef, {
          participants: [auth.currentUser.uid, recipientId],
          createdAt: new Date(),
          lastMessageTime: new Date(),
          lastMessage: null
        });

        router.push({
          pathname: '/(root)/[chatRoom]',
          params: { 
            chatId: newChatRef.id,
            recipientId 
          }
        });
      }
      setSearchQuery('');
    } catch (error) {
      console.error('Chat navigation error:', error);
      Alert.alert('Error', 'Failed to navigate to chat');
    }
  }, []);

  const fetchChatId = async (groupId) => {
    const querySnapshot = await getDocs(
      query(collection(db, 'chats'), where('id', '==', groupId))
    );
    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].id;
    }
    return null;
  };
  
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp.seconds * 1000);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (days === 1) return 'Yesterday';
    if (days < 7) return date.toLocaleDateString([], { weekday: 'short' });
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };



  // Updated SearchBar component
  const SearchBar = () => (
    <View style={{ 
      backgroundColor: COLORS.background, 
      paddingHorizontal: 16,
      paddingVertical: 12,
      marginBottom: 8
    }}>
      <View style={{ 
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.background,
        borderRadius: 15,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: COLORS.accent + '20'
      }}>
        <Ionicons name="search-outline" size={20} color={COLORS.textSecondary} />
        <TextInput
          style={{
            flex: 1,
            marginLeft: 12,
            fontSize: 16,
            color: COLORS.textPrimary,
            fontFamily: 'System',
            letterSpacing: 0.3
          }}
          placeholder="Search messages..."
          placeholderTextColor={COLORS.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searching ? (
          <ActivityIndicator size="small" color={COLORS.textSecondary} />
        ) : searchQuery && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  function handleDecrypt(text) {
    let decryptedText = "";
  
    // Decrypt the last message text if it exists
    if (text ) {
      try {
        decryptedText = AES.decrypt(text, SECRET_KEY).toString(enc.Utf8);

        console.log(decryptedText)
        if (!decryptedText) {
          decryptedText = "[Decryption Failed]";
        }
        return decryptedText;
      } catch (error) {
        console.error("Decryption error:", error);
        decryptedText = "[Decryption Failed]";
      }
    }}
  

  const ChatItem = ({ item }) => {

    return (
      <Pressable
        onPress={() => handleChatNavigation(item.recipientId)}
        onLongPress={() => {
          setSelectedChat(item);
          setShowDeleteModal(true);
        }}
        style={({ pressed }) => ({
          backgroundColor: pressed ? `${COLORS.surface}80` : COLORS.background,
          paddingVertical: 14,
          paddingHorizontal: 16,
          marginBottom: 1,
          borderRadius: 12,
          marginHorizontal: 8,
          marginVertical: 4,
        })}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {/* Profile Image with online indicator possibility */}
          <View style={{ position: 'relative' }}>
            <Image
              source={
                item.recipient?.profileImage
                  ? { uri: item.recipient.profileImage === "https://via.placeholder.com/150" ? DEFAULT_PROFILE : item.recipient.profileImage }
                  : { uri: DEFAULT_PROFILE }
              }
              style={{
                width: 52,
                height: 52,
                borderRadius: 26,
                backgroundColor: `${COLORS.surface}80`,
                borderWidth: item.unreadcount >= 1 ? 2 : 0,
                borderColor: COLORS.primary,
              }}
            />
            {item.recipient?.online && (
              <View style={{
                position: 'absolute',
                bottom: 2,
                right: 0,
                width: 14,
                height: 14,
                borderRadius: 7,
                backgroundColor: '#4CAF50',
                borderWidth: 2,
                borderColor: COLORS.background,
              }} />
            )}
          </View>
    
          {/* Chat Content */}
          <View style={{ 
            flex: 1, 
            marginLeft: 14,
            borderBottomWidth: 1,
            borderBottomColor: `${COLORS.border}30`,
            paddingBottom: 4
          }}>
            {/* Top Row: Name and Time */}
            <View style={{ 
              flexDirection: 'row', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: 6 
            }}>
              <Text style={{ 
                fontSize: 16,
                fontWeight: item.unreadcount >= 1 ? '700' : '600',
                color: COLORS.textPrimary,
                letterSpacing: 0.3,
              }}>
                {item.recipient?.fullName || 'Unknown User'}
              </Text>
              
              <Text style={{ 
                fontSize: 12,
                color: item.unreadcount >= 1 ? COLORS.textPrimary : COLORS.textSecondary,
                letterSpacing: 0.2,
                fontWeight: item.unreadcount >= 1 ? '600' : '400',
              }}>
                {formatTime(item.lastMessageTime)}
              </Text>
            </View>
            
            {/* Bottom Row: Message Preview and Unread Count */}
            <View style={{ 
              flexDirection: 'row', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginTop: 2
            }}>
              {/* Message Preview */}
              <Text 
                style={{ 
                  color: item.unreadcount >= 1 ? COLORS.textPrimary : COLORS.textSecondary,
                  flex: 1,
                  fontSize: 14,
                  letterSpacing: 0.2,
                fontWeight: item.unreadcount >= 1 ? '500' : '400',
                  marginRight: 8,
                }}
                numberOfLines={1}
              >
                {handleDecrypt( item.lastMessage) || 'No messages yet'}
              </Text>
              
              {/* Unread Count Badge */}
              {item.unreadcount >= 1 && (
                <View style={{
                  backgroundColor: COLORS.primary,
                  borderRadius: 12,
                  minWidth: 22,
                  height: 22,
                  justifyContent: 'center',
                  alignItems: 'center',
                  paddingHorizontal: 6,
                }}>
                  <Text style={{ 
                    color: '#FFFFFF',
                    fontSize: 12,
                    fontWeight: '600',
                  }}>
                    {item.unreadcount}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </Pressable>
    );
  };
  // Updated Delete Modal with dark theme
  const DeleteModal = () => (
    <Modal
      visible={showDeleteModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowDeleteModal(false)}
    >
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.75)'
      }}>
        <View style={{
          backgroundColor: COLORS.surface,
          borderRadius: 20,
          padding: 24,
          width: '85%',
          maxWidth: 320,
          borderWidth: 1,
          borderColor: COLORS.accent + '30'
        }}>
          <Text style={{ 
            fontSize: 20,
            fontWeight: '600',
            color: COLORS.textPrimary,
            textAlign: 'center',
            marginBottom: 12,
            letterSpacing: 0.3
          }}>
            Delete Chat
          </Text>
          <Text style={{ 
            color: COLORS.textSecondary,
            textAlign: 'center',
            marginBottom: 24,
            lineHeight: 20,
            letterSpacing: 0.2
          }}>
            Are you sure you want to delete this chat? This action cannot be undone.
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <TouchableOpacity
              onPress={() => setShowDeleteModal(false)}
              style={{ 
                padding: 12,
                flex: 1,
                alignItems: 'center',
                marginRight: 8
              }}
            >
              <Text style={{ color: '#007AFF', fontWeight: '500', letterSpacing: 0.3 }}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => deleteChat(selectedChat?.id)}
              style={{ 
                padding: 12,
                flex: 1,
                alignItems: 'center',
                marginLeft: 8
              }}
            >
              <Text style={{ color: '#FF3B30', fontWeight: '500', letterSpacing: 0.3 }}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

 
  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      {/* <StatusBar barStyle="dark-content" backgroundColor="#1F2937" /> */}
      
      <View style={{ 
        backgroundColor: COLORS.background,
        paddingTop: 60,
        paddingBottom: 16,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.separator,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Text style={{ 
          fontSize: 34,
          fontWeight: 'bold',
          color: COLORS.textPrimary,
          letterSpacing: 0.4
        }}>
          Messages
        </Text>
        
        {/* New Chat button moved to the top header */}
        <TouchableOpacity
          onPress={() => setShowNewChatModal(true)}
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: '#007AFF',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Ionicons name="create-outline" size={22} color={COLORS.textPrimary} />
        </TouchableOpacity>
      </View>

      <SearchBar />

      <FlatList
        data={chats}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <ChatItem item={item} />}
        contentContainerStyle={{
          paddingTop: 8,
          paddingBottom: 100,
        }}
        refreshing={loading}
        onRefresh={loadChats}
        ListEmptyComponent={
          <View style={{ 
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 32,
            marginTop: 80
          }}>
            <Text style={{ 
              color: COLORS.textSecondary,
              textAlign: 'center',
              fontSize: 16,
              letterSpacing: 0.3,
              lineHeight: 24
            }}>
              No conversations yet. Start chatting!
            </Text>
          </View>
        }
      />

      {/* Custom SearchModal component to show college name below user name */}
      <Modal
        visible={showNewChatModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowNewChatModal(false)}
      >
        <View style={{ flex: 1, backgroundColor: COLORS.background }}>
          <View style={{ 
            flexDirection: 'row', 
            alignItems: 'center', 
            paddingTop: 50,
            paddingHorizontal: 16,
            paddingBottom: 16,
            borderBottomWidth: 1,
            borderBottomColor: COLORS.separator
          }}>
            <TouchableOpacity 
              onPress={() => setShowNewChatModal(false)}
              style={{ marginRight: 16 }}
            >
              <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
            
            <View style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: COLORS.surface,
              borderRadius: 12,
              paddingHorizontal: 12,
              paddingVertical: 8
            }}>
              <Ionicons name="search" size={20} color={COLORS.textSecondary} />
              <TextInput
                style={{
                  flex: 1,
                  marginLeft: 8,
                  fontSize: 16,
                  color: COLORS.textPrimary,
                  paddingVertical: 6
                }}
                placeholder="Search users..."
                placeholderTextColor={COLORS.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus={true}
              />
              {searchQuery ? (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={20} color={COLORS.textSecondary} />
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
          
          {searching ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
          ) : (
            <FlatList
              data={searchResults}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    handleSearchNavigation(item.id);
                    setShowNewChatModal(false);
                  }}
                  style={{
                    flexDirection: 'row',
                    padding: 16,
                    alignItems: 'center',
                    borderBottomWidth: 1,
                    borderBottomColor: COLORS.separator + '30'
                  }}
                >
                  <Image
                    source={
                      item.profileImage 
                        ? { uri: item.profileImage === "https://via.placeholder.com/150" ? DEFAULT_PROFILE : item.profileImage } 
                        : { uri: DEFAULT_PROFILE }
                    }
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: 25,
                      backgroundColor: COLORS.surface
                    }}
                  />
                  <View style={{ marginLeft: 12, flex: 1 }}>
                    <Text style={{ 
                      fontSize: 16, 
                      fontWeight: '500',
                      color: COLORS.textPrimary
                    }}>
                      {item.fullName || 'Unkown Users'}
                    </Text>
                    {/* Display college name */}
                    {item.college && (
                      <Text style={{ 
                        fontSize: 14, 
                        color: COLORS.textSecondary,
                        marginTop: 2 
                      }}>
                        @{item.college.name || 'No college information'}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                searchQuery.length > 0 ? (
                  <View style={{ padding: 20, alignItems: 'center' }}>
                    <Text style={{ color: COLORS.textSecondary }}>No users found</Text>
                  </View>
                ) : (
                  <View style={{ padding: 20, alignItems: 'center' }}>
                    <Text style={{ color: COLORS.textSecondary }}>Search for users to chat with</Text>
                  </View>
                )
              }
            />
          )}
        </View>
      </Modal>

      <DeleteModal />
    </View>
  );
}