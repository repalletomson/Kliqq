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
  ActivityIndicator,
  Animated,
  Dimensions
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

// Updated dark theme colors
const COLORS = {
  background: '#000000',
  secondaryBackground: '#000000',
  surface: '#111111',
  textPrimary: '#FFFFFF',
  textSecondary: '#A1A1AA',
  textTertiary: '#71717A',
  accent: '#3B82F6',
  separator: '#27272A',
  border: '#27272A',
  primary: '#3B82F6',
  success: '#10B981',
  unreadBackground: '#1E3A8A',
  searchBackground: '#111111',
  shadow: 'rgba(0, 0, 0, 0.3)'
};

const { width } = Dimensions.get('window');
const SECRET_KEY = "kliq-secure-messaging-2024";

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

  // Modern Header Component
  const Header = () => (
    <View style={{
      backgroundColor: COLORS.background,
      paddingTop: 60,
      paddingBottom: 20,
      paddingHorizontal: 20,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.separator,
      shadowColor: COLORS.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 1,
      shadowRadius: 3,
      elevation: 3,
    }}>
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        {/* Chat Title */}
        <Text style={{
          fontSize: 34,
          fontWeight: '700',
          color: COLORS.textPrimary,
          letterSpacing: 0.4,
        }}>
          Chat
        </Text>
        
        {/* Action Buttons */}
        <View style={{ flexDirection: 'row', gap: 12 }}>
          {/* New Chat Button */}
          <TouchableOpacity
            onPress={() => setShowNewChatModal(true)}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: COLORS.primary,
              justifyContent: 'center',
              alignItems: 'center',
              shadowColor: COLORS.primary,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            <Ionicons name="create-outline" size={22} color={COLORS.background} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  // Modern Search Bar Component
  const SearchBar = () => (
    <View style={{
      backgroundColor: COLORS.background,
      paddingHorizontal: 20,
      paddingVertical: 16,
    }}>
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.searchBackground,
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 1,
        shadowRadius: 2,
        elevation: 1,
      }}>
        <Ionicons name="search-outline" size={20} color={COLORS.textSecondary} />
        <TextInput
          style={{
            flex: 1,
            marginLeft: 12,
            fontSize: 16,
            color: COLORS.textPrimary,
            fontFamily: 'System',
            letterSpacing: 0.3,
          }}
          placeholder="Search chat..."
          placeholderTextColor={COLORS.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searching ? (
          <ActivityIndicator size="small" color={COLORS.primary} />
        ) : searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );

  function handleDecrypt(text) {
    let decryptedText = "";
  
    // Decrypt the last message text if it exists
    if (text) {
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
        return decryptedText;
      }
    }
    return "";
  }

  // Modern Chat Item Component with tap animation
  const ChatItem = ({ item }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
      Animated.spring(scaleAnim, {
        toValue: 0.98,
        useNativeDriver: true,
        speed: 20,
        bounciness: 4,
      }).start();
    };

    const handlePressOut = () => {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        speed: 20,
        bounciness: 4,
      }).start();
    };

    const hasUnread = item.unreadcount >= 1;

    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Pressable
          onPress={() => handleChatNavigation(item.recipientId)}
          onLongPress={() => {
            setSelectedChat(item);
            setShowDeleteModal(true);
          }}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={{
            backgroundColor: hasUnread ? COLORS.unreadBackground : COLORS.background,
            paddingVertical: 16,
            paddingHorizontal: 20,
            marginHorizontal: 4,
            marginVertical: 2,
            borderRadius: 12,
            minHeight: 80,
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          {/* Profile Image with online indicator */}
          <View style={{ position: 'relative', marginRight: 16 }}>
            <Image
              source={
                item.recipient?.profileImage
                  ? { uri: item.recipient.profileImage === "https://via.placeholder.com/150" ? DEFAULT_PROFILE : item.recipient.profileImage }
                  : { uri: DEFAULT_PROFILE }
              }
              style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                backgroundColor: COLORS.searchBackground,
                borderWidth: hasUnread ? 2 : 1,
                borderColor: hasUnread ? COLORS.primary : COLORS.border,
              }}
            />
            {item.recipient?.online && (
              <View style={{
                position: 'absolute',
                bottom: 2,
                right: 0,
                width: 16,
                height: 16,
                borderRadius: 8,
                backgroundColor: COLORS.success,
                borderWidth: 2,
                borderColor: COLORS.background,
              }} />
            )}
          </View>

          {/* Chat Content */}
          <View style={{ flex: 1 }}>
            {/* Top Row: Name and Time */}
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 6,
            }}>
              <Text style={{
                fontSize: 17,
                fontWeight: hasUnread ? '700' : '600',
                color: COLORS.textPrimary,
                letterSpacing: 0.3,
                flex: 1,
              }} numberOfLines={1}>
                {item.recipient?.fullName || 'Unknown User'}
              </Text>
              
              <Text style={{
                fontSize: 14,
                color: hasUnread ? COLORS.primary : COLORS.textSecondary,
                letterSpacing: 0.2,
                fontWeight: hasUnread ? '600' : '400',
                marginLeft: 8,
              }}>
                {formatTime(item.lastMessageTime)}
              </Text>
            </View>
            
            {/* Bottom Row: Message Preview and Unread Count */}
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              {/* Message Preview */}
              <Text 
                style={{
                  color: hasUnread ? COLORS.textPrimary : COLORS.textSecondary,
                  flex: 1,
                  fontSize: 15,
                  letterSpacing: 0.2,
                  fontWeight: hasUnread ? '500' : '400',
                  marginRight: 12,
                }}
                numberOfLines={1}
              >
                {handleDecrypt(item.lastMessage) || 'No messages yet'}
              </Text>
              
              {/* Unread Count Badge and Status Icons */}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                {/* Double tick for seen messages */}
                {!hasUnread && item.lastMessage && (
                  <Ionicons name="checkmark-done" size={16} color={COLORS.primary} />
                )}
                
                {/* Unread Count Badge */}
                {hasUnread && (
                  <View style={{
                    backgroundColor: COLORS.primary,
                    borderRadius: 12,
                    minWidth: 24,
                    height: 24,
                    justifyContent: 'center',
                    alignItems: 'center',
                    paddingHorizontal: 8,
                  }}>
                    <Text style={{
                      color: COLORS.background,
                      fontSize: 12,
                      fontWeight: '600',
                    }}>
                      {item.unreadcount > 99 ? '99+' : item.unreadcount}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        </Pressable>
      </Animated.View>
    );
  };

  // Modern Delete Modal
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
        backgroundColor: 'rgba(0, 0, 0, 0.5)'
      }}>
        <View style={{
          backgroundColor: COLORS.background,
          borderRadius: 20,
          padding: 24,
          width: '85%',
          maxWidth: 320,
          shadowColor: COLORS.shadow,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 1,
          shadowRadius: 16,
          elevation: 8,
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
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
            <TouchableOpacity
              onPress={() => setShowDeleteModal(false)}
              style={{
                padding: 16,
                flex: 1,
                alignItems: 'center',
                backgroundColor: COLORS.searchBackground,
                borderRadius: 12,
              }}
            >
              <Text style={{ color: COLORS.textPrimary, fontWeight: '600', letterSpacing: 0.3 }}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => deleteChat(selectedChat?.id)}
              style={{
                padding: 16,
                flex: 1,
                alignItems: 'center',
                backgroundColor: '#FEE2E2',
                borderRadius: 12,
              }}
            >
              <Text style={{ color: '#DC2626', fontWeight: '600', letterSpacing: 0.3 }}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.secondaryBackground }}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      
      <Header />
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
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 40,
            marginTop: 80
          }}>
            <Ionicons name="chatbubbles-outline" size={64} color={COLORS.textTertiary} />
            <Text style={{
              color: COLORS.textSecondary,
              textAlign: 'center',
              fontSize: 18,
              fontWeight: '500',
              letterSpacing: 0.3,
              lineHeight: 24,
              marginTop: 16,
            }}>
              No conversations yet
            </Text>
            <Text style={{
              color: COLORS.textTertiary,
              textAlign: 'center',
              fontSize: 16,
              letterSpacing: 0.2,
              lineHeight: 20,
              marginTop: 8,
            }}>
              Start chatting with your friends!
            </Text>
          </View>
        }
      />

      {/* New Chat Modal */}
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
            paddingTop: 60,
            paddingHorizontal: 20,
            paddingBottom: 20,
            borderBottomWidth: 1,
            borderBottomColor: COLORS.separator,
            backgroundColor: COLORS.background,
          }}>
            <TouchableOpacity 
              onPress={() => setShowNewChatModal(false)}
              style={{ 
                marginRight: 16,
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: COLORS.searchBackground,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
            
            <Text style={{
              fontSize: 20,
              fontWeight: '600',
              color: COLORS.textPrimary,
              letterSpacing: 0.3,
              flex: 1,
            }}>
              New Chat
            </Text>
          </View>

          <View style={{ paddingHorizontal: 20, paddingVertical: 16 }}>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: COLORS.searchBackground,
              borderRadius: 16,
              paddingHorizontal: 16,
              paddingVertical: 12,
              borderWidth: 1,
              borderColor: COLORS.border,
            }}>
              <Ionicons name="search" size={20} color={COLORS.textSecondary} />
              <TextInput
                style={{
                  flex: 1,
                  marginLeft: 12,
                  fontSize: 16,
                  color: COLORS.textPrimary,
                  paddingVertical: 4
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
                    padding: 20,
                    alignItems: 'center',
                    borderBottomWidth: 1,
                    borderBottomColor: COLORS.separator,
                    backgroundColor: COLORS.background,
                    marginHorizontal: 4,
                    marginVertical: 2,
                    borderRadius: 12,
                    minHeight: 80,
                  }}
                >
                  <Image
                    source={
                      item.profileImage 
                        ? { uri: item.profileImage === "https://via.placeholder.com/150" ? DEFAULT_PROFILE : item.profileImage } 
                        : { uri: DEFAULT_PROFILE }
                    }
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 28,
                      backgroundColor: COLORS.searchBackground,
                      borderWidth: 1,
                      borderColor: COLORS.border,
                      marginRight: 16,
                    }}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={{
                      fontSize: 17,
                      fontWeight: '600',
                      color: COLORS.textPrimary,
                      letterSpacing: 0.3,
                      marginBottom: 4,
                    }}>
                      {item.fullName || 'Unknown User'}
                    </Text>
                    {/* Display college name */}
                    {item.college && (
                      <Text style={{
                        fontSize: 15,
                        color: COLORS.textSecondary,
                        letterSpacing: 0.2,
                      }}>
                        @{item.college.name || 'No college information'}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                searchQuery.length > 0 ? (
                  <View style={{ padding: 40, alignItems: 'center' }}>
                    <Ionicons name="search-outline" size={48} color={COLORS.textTertiary} />
                    <Text style={{ 
                      color: COLORS.textSecondary, 
                      fontSize: 16, 
                      marginTop: 16,
                      fontWeight: '500' 
                    }}>
                      No users found
                    </Text>
                  </View>
                ) : (
                  <View style={{ padding: 40, alignItems: 'center' }}>
                    <Ionicons name="people-outline" size={48} color={COLORS.textTertiary} />
                    <Text style={{ 
                      color: COLORS.textSecondary, 
                      fontSize: 16, 
                      marginTop: 16,
                      fontWeight: '500' 
                    }}>
                      Search for users to chat with
                    </Text>
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