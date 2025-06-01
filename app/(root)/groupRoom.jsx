
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { useColorScheme } from 'react-native';

// Import necessary React Native components
import {
  View,
  ScrollView,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
  StatusBar,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

// Import Firebase functions
import { 
  getGroupMessages, 
  sendMessage, 
  getCurrentUser, 
  addReaction,
  deleteMessage,
  replyToMessage,
  getGroupMembers
} from '../../lib/firebase';

const DEFAULT_PROFILE = require('../../assets/images/Default.webp');

// Moved outside component to prevent recreations
const getMotivationalQuote = (groupName) => {
  const quotes = [
    `Start the conversation in ${groupName} today!`,
    `Be the first to share your thoughts in ${groupName}!`,
    `This is where great ideas in ${groupName} will be shared.`,
    `Build connections in ${groupName} with your first message!`,
    `The journey of ${groupName} begins with a single message.`
  ];
  return quotes[Math.floor(Math.random() * quotes.length)];
};

const GroupRoomScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { group } = route.params;
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  // State management with defaults
  const [messages, setMessages] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [members, setMembers] = useState([]);
  const [showMembers, setShowMembers] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showReactions, setShowReactions] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [showAllReactions, setShowAllReactions] = useState(false);
  const [reactionsMessage, setReactionsMessage] = useState(null);

  // Refs
  const scrollViewRef = useRef(null);
  const messagesUnsubscribeRef = useRef(null);
  const loadingTimeoutRef = useRef(null);
  const isMountedRef = useRef(true);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (messagesUnsubscribeRef.current) {
      messagesUnsubscribeRef.current();
      messagesUnsubscribeRef.current = null;
    }
    
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = null;
    }
  }, []);

  // Component unmount cleanup
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      cleanup();
    };
  }, [cleanup]);

  // Focus effect for screen navigation
  useFocusEffect(
    useCallback(() => {
      isMountedRef.current = true;
      fetchInitialData();
      
      return () => {
        cleanup();
      };
    }, [group.id, cleanup])
  );

  // Data fetching with error handling
  const fetchInitialData = async () => {
    if (!isMountedRef.current) return;
    
    setLoading(true);
    setError(null);
    cleanup();

    // Add loading timeout
    loadingTimeoutRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        setLoading(false);
        setError('Loading timed out. Please check your connection and try again.');
      }
    }, 10000);

    try {
      // Fetch current user
      try {
        const user = await Promise.race([
          getCurrentUser(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('User fetch timeout')), 5000))
        ]);
        
        if (isMountedRef.current) {
          setCurrentUser(user);
        }
      } catch (userError) {
        console.error('Error fetching current user:', userError);
        // Continue with other operations
      }

      // Fetch group members
      try {
        const fetchedMembers = await Promise.race([
          getGroupMembers(group.id),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Members fetch timeout')), 5000))
        ]);
        
        if (isMountedRef.current) {
          setMembers(fetchedMembers || []);
        }
      } catch (membersError) {
        console.error('Error fetching group members:', membersError);
        if (isMountedRef.current) {
          setMembers([]);
        }
      }

      // Subscribe to messages with proper error handling
      try {
        const messageSubscription = getGroupMessages(
          group.id,
          (fetchedMessages) => {
            if (isMountedRef.current) {
              setMessages(fetchedMessages);
              setLoading(false);
              
              // Clear loading timeout
              if (loadingTimeoutRef.current) {
                clearTimeout(loadingTimeoutRef.current);
                loadingTimeoutRef.current = null;
              }
              
              // Safely scroll to bottom
              setTimeout(() => {
                if (scrollViewRef.current && isMountedRef.current) {
                  scrollViewRef.current.scrollToEnd({ animated: false });
                }
              }, 100);
            }
          },
          (messagesError) => {
            console.error('Error in messages subscription:', messagesError);
            if (isMountedRef.current) {
              setError('Failed to load messages. Please try again.');
              setLoading(false);
              
              if (loadingTimeoutRef.current) {
                clearTimeout(loadingTimeoutRef.current);
                loadingTimeoutRef.current = null;
              }
            }
          }
        );
        
        messagesUnsubscribeRef.current = messageSubscription;
      } catch (subscribeError) {
        console.error('Error setting up message subscription:', subscribeError);
        if (isMountedRef.current) {
          setError('Failed to connect to the chat. Please try again.');
          setLoading(false);
          
          if (loadingTimeoutRef.current) {
            clearTimeout(loadingTimeoutRef.current);
            loadingTimeoutRef.current = null;
          }
        }
      }
    } catch (error) {
      console.error('Error in fetchInitialData:', error);
      if (isMountedRef.current) {
        setError('An unexpected error occurred. Please try again.');
        setLoading(false);
        
        if (loadingTimeoutRef.current) {
          clearTimeout(loadingTimeoutRef.current);
          loadingTimeoutRef.current = null;
        }
      }
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentUser) return;
    
    try {
      const messageData = {
        text: newMessage,
        senderId: currentUser.uid,
        senderName: currentUser.displayName || 'Anonymous',
        timestamp: Date.now(),
        reactions: [],
        replyTo: replyingTo ? {
          id: replyingTo.id,
          senderName: replyingTo.senderName,
          text: replyingTo.text
        } : null
      };

      // Clear input immediately for better UX
      setNewMessage('');
      setReplyingTo(null);

      // Send message
      await sendMessage(group.id, messageData);
      
      // Safely scroll after message is sent
      setTimeout(() => {
        if (scrollViewRef.current && isMountedRef.current) {
          scrollViewRef.current.scrollToEnd({ animated: true });
        }
      }, 100);
    } catch (error) {
      console.error('Error sending message:', error);
      if (isMountedRef.current) {
        Alert.alert('Error', 'Failed to send message. Please try again.');
      }
    }
  };

  const handleReaction = async (messageId, reaction) => {
    if (!currentUser) return;
    
    try {
      await addReaction(group.id, messageId, currentUser.uid, reaction);
      if (isMountedRef.current) {
        setShowReactions(false);
        setSelectedMessage(null);
      }
    } catch (error) {
      console.error('Error adding reaction:', error);
      if (isMountedRef.current) {
        Alert.alert('Error', 'Failed to add reaction. Please try again.');
      }
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      await deleteMessage(group.id, messageId);
      if (isMountedRef.current) {
        setSelectedMessage(null);
        setShowReactions(false);
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      if (isMountedRef.current) {
        Alert.alert('Error', 'Failed to delete message. Please try again.');
      }
    }
  };

  const handleReplyToMessage = (message) => {
    setReplyingTo(message);
    setShowReactions(false);
    setSelectedMessage(null);
  };

  const formatMessageTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true 
    });
  };

  const showReactionsList = (message) => {
    setReactionsMessage(message);
    setShowAllReactions(true);
  };

  // Memoized MessageBubble component to prevent unnecessary re-renders
  const MessageBubble = React.memo(({ message }) => {
    const isCurrentUser = message.senderId === currentUser?.uid;

    return (
      <View className={`${isCurrentUser ? 'self-end' : 'self-start'} mb-3 max-w-4/5`}>
        {/* Reply Section */}
        {message.replyTo && (
          <View className="bg-gray-100 dark:bg-gray-800 rounded-t-lg px-2 py-1">
            <Text className="text-gray-500 dark:text-gray-400 text-xs">
              Replying to {message.replyTo.senderName}
            </Text>
            <Text className="text-gray-700 dark:text-gray-300 text-xs">
              {message.replyTo.text.length > 30 
                ? `${message.replyTo.text.substring(0, 30)}...` 
                : message.replyTo.text}
            </Text>
          </View>
        )}

        {!isCurrentUser && (
          <Text className="text-gray-500 dark:text-gray-400 text-xs mb-1">
            {message.senderName}
          </Text>
        )}
        
        <View className="flex-row">
          <TouchableOpacity 
            onLongPress={() => {
              setSelectedMessage(message);
              setShowReactions(true);
            }}
            className={`${
              isCurrentUser 
                ? 'bg-blue-100 dark:bg-gray-700' 
                : 'bg-gray-100 dark:bg-gray-800'
            } rounded-xl p-2`}
            activeOpacity={0.7}
          >
            <Text className={`${
              isCurrentUser 
                ? 'text-black dark:text-white' 
                : 'text-black dark:text-white'
            } text-base`}>
              {message.text}
            </Text>
            <Text className={`${
              isCurrentUser 
                ? 'text-gray-600 dark:text-gray-400' 
                : 'text-gray-500 dark:text-gray-400'
            } text-xs self-end mt-1`}>
              {formatMessageTime(message.timestamp)}
            </Text>
          </TouchableOpacity>
{/*           
          <TouchableOpacity 
            onPress={() => handleReplyToMessage(message)}
            className="justify-end p-1"
          >
            <Ionicons 
              name="arrow-undo-outline" 
              size={18} 
              color={isDarkMode ? '#B0B0B0' : '#757575'} 
            />
          </TouchableOpacity> */}
        </View>
        
        {/* Reaction Display */}
        {message.reactions && message.reactions.length > 0 && (
          <View className={`flex-row mt-1 bg-gray-100 bg-opacity-20 dark:bg-white dark:bg-opacity-10 rounded-xl p-1 ${isCurrentUser ? 'self-end' : 'self-start'}`}>
            {message.reactions.slice(0, 3).map((reaction, index) => (
              <Text key={index} className="text-base mr-1">
                {reaction.emoji}
              </Text>
            ))}
            {message.reactions.length > 3 && (
              <TouchableOpacity onPress={() => showReactionsList(message)}>
                <Text className="text-gray-600 dark:text-white">
                  +{message.reactions.length - 3}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    );
  });

  // Using simplified modals with proper cleanup
  const ReactionsModal = () => (
    <Modal
      visible={showReactions}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowReactions(false)}
    >
      <TouchableOpacity
        activeOpacity={1}
        className="flex-1 justify-end bg-black bg-opacity-50"
        onPress={() => setShowReactions(false)}
      >
        <View className="bg-white dark:bg-gray-800 rounded-t-xl p-5">
          <View className="flex-row justify-around mb-5">
            {['👍', '❤️', '😂', '😮', '😢', '🔥'].map((emoji) => (
              <TouchableOpacity 
                key={emoji}
                onPress={() => handleReaction(selectedMessage?.id, emoji)}
              >
                <Text className="text-2xl">{emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <TouchableOpacity 
            onPress={() => handleReplyToMessage(selectedMessage)}
            className="bg-blue-500 dark:bg-gray-700 p-4 rounded-lg items-center mb-2"
          >
            <Text className="text-white font-bold">Reply</Text>
          </TouchableOpacity>
          
          {selectedMessage?.senderId === currentUser?.uid && (
            <TouchableOpacity 
              onPress={() => handleDeleteMessage(selectedMessage?.id)}
              className="bg-red-500 p-4 rounded-lg items-center"
            >
              <Text className="text-white font-bold">Delete Message</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    </Modal>
  );

  const AllReactionsModal = () => (
    <Modal
      visible={showAllReactions}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowAllReactions(false)}
    >
      <TouchableOpacity 
        className="flex-1 bg-black bg-opacity-50 justify-center items-center"
        activeOpacity={1}
        onPress={() => setShowAllReactions(false)}
      >
        <View className="bg-white dark:bg-gray-800 rounded-xl p-4 w-4/5 max-h-3/5">
          <Text className="font-bold text-base mb-2 text-black dark:text-white">
            All Reactions
          </Text>
          
          <ScrollView>
            {reactionsMessage?.reactions?.map((reaction, index) => (
              <View key={index} className="flex-row p-2 border-b border-gray-200 dark:border-gray-700">
                <Text className="text-xl mr-2">{reaction.emoji}</Text>
                <Text className="text-black dark:text-white">
                  {reaction.senderName || 'User'}
                </Text>
              </View>
            ))}
          </ScrollView>
          
          <TouchableOpacity 
            className="bg-gray-200 dark:bg-gray-700 items-center mt-2 p-2 rounded-lg"
            onPress={() => setShowAllReactions(false)}
          >
            <Text className="text-black dark:text-white">Close</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  const MembersModal = React.memo(() => (
    <Modal
      visible={showMembers}
      animationType="fade"
      onRequestClose={() => setShowMembers(false)}
    >
      <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
        <View className="flex-row items-center p-4 border-b border-gray-200 dark:border-gray-800">
          <TouchableOpacity onPress={() => setShowMembers(false)}>
            <Ionicons 
              name="close" 
              size={24} 
              color={isDarkMode ? 'white' : 'black'} 
            />
          </TouchableOpacity>
          <Text className="text-lg font-bold ml-4 text-black dark:text-white">
            Group Members ({members.length})
          </Text>
        </View>
        
        <ScrollView 
          className="flex-1"
          contentContainerStyle={{ padding: 16 }}
        >
          {members.map((member) => (
            <View key={member.id} className="flex-row items-center mb-3 bg-gray-100 dark:bg-gray-800 p-3 rounded-xl">
              <Image
                source={member.profileImage ? { uri: member.photoURL } : DEFAULT_PROFILE}
                className="w-12 h-12 rounded-full mr-3"
              />
              <View className="flex-1">
                <Text className="text-black dark:text-white font-medium">
                  {member.fullName || 'Anonymous'}
                </Text>
                {member.status && (
                  <Text className="text-gray-600 dark:text-gray-400 text-xs">
                    {member.status}
                  </Text>
                )}
              </View>
              {member.id === group.adminId && (
                <View className="bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded-xl">
                  <Text className="text-blue-500 dark:text-blue-200 font-bold">
                    Admin
                  </Text>
                </View>
              )}
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  ));

  // Loading state
  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white dark:bg-gray-900">
        <ActivityIndicator 
          size="large" 
          color={isDarkMode ? 'white' : '#2196F3'} 
        />
        <Text className="mt-5 text-gray-600 dark:text-gray-400 text-center">
          Loading chat...
        </Text>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View className="flex-1 justify-center items-center p-5 bg-white dark:bg-gray-900">
        <Ionicons 
          name="alert-circle-outline" 
          size={60} 
          color={isDarkMode ? '#ff6b6b' : '#d32f2f'} 
          style={{ marginBottom: 16 }}
        />
        <Text className="text-red-500 dark:text-red-400 text-center mb-5 text-base">{error}</Text>
        <TouchableOpacity 
          className="bg-gray-700 dark:bg-blue-500 px-5 py-2 rounded-lg"
          onPress={fetchInitialData}
        >
          <Text className="text-white font-bold">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Main render
  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <StatusBar 
        backgroundColor={isDarkMode ? '#1E1E1E' : '#2196F3'}
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
      />

      {/* Group Header */}
      <View className="flex-row items-center p-4 bg-blue-500 dark:bg-gray-800">
        <TouchableOpacity 
          onPress={() => {
            cleanup();
            navigation.goBack();
          }} 
          className="p-1"
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          className="flex-1 ml-4"
          onPress={() => setShowMembers(true)}
        >
          <Text className="text-white text-lg font-bold">{group.name}</Text>
          <Text className="text-white text-xs">
            {members.length} {members.length === 1 ? 'Member' : 'Members'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <ScrollView 
        ref={scrollViewRef}
        className="flex-1 p-4 bg-white dark:bg-gray-900"
        contentContainerStyle={{ 
          paddingBottom: 20,
          flexGrow: messages.length === 0 ? 1 : undefined, 
          justifyContent: messages.length === 0 ? 'center' : undefined
        }}
        removeClippedSubviews={false} // Change to false to fix view issues
      >
        {messages.length > 0 ? (
          messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))
        ) : (
          <View className="items-center bg-blue-50 bg-opacity-20 dark:bg-gray-800 p-4 rounded-xl">
            <Ionicons 
              name="chatbubbles-outline" 
              size={64} 
              color={isDarkMode ? '#555' : '#2196F3'} 
              style={{ marginBottom: 16 }}
            />
            <Text className="text-lg font-medium text-blue-500 dark:text-white text-center mb-2">
              No messages yet
            </Text>
            <Text className="text-gray-600 dark:text-gray-400 text-center">
              {getMotivationalQuote(group.name)}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Reply Preview */}
      {replyingTo && (
        <View className="flex-row justify-between items-center px-4 py-2 bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <View>
            <Text className="text-black dark:text-white">
              Replying to {replyingTo.senderName}
            </Text>
            <Text className="text-gray-500 dark:text-gray-400">
              {replyingTo.text.length > 40 
                ? `${replyingTo.text.substring(0, 40)}...` 
                : replyingTo.text}
            </Text>
          </View>
          <TouchableOpacity onPress={() => setReplyingTo(null)}>
            <Ionicons 
              name="close" 
              size={20} 
              color={isDarkMode ? 'white' : 'black'} 
            />
          </TouchableOpacity>
        </View>
      )}

      {/* Message Input */}
      <View className="flex-row items-center p-2 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <TextInput
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Type a message..."
          placeholderTextColor={isDarkMode ? '#888' : '#888'}
          className="flex-1 bg-gray-100 dark:bg-gray-800 p-2 rounded-full px-4 text-black dark:text-white"
        />
        <TouchableOpacity 
          onPress={handleSendMessage}
          disabled={!newMessage.trim()}
          className={`ml-2 p-2 rounded-full ${
            !newMessage.trim() 
              ? 'bg-blue-300 dark:bg-gray-600' 
              : 'bg-blue-500 dark:bg-blue-500'
          }`}
        >
          <Ionicons name="send" size={20} color="white" />
        </TouchableOpacity>
      </View>

      {/* Modals */}
      <MembersModal />
      <ReactionsModal />
      <AllReactionsModal />
    </SafeAreaView>
  );
};

export default GroupRoomScreen;