import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';

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
  deleteMessage,
  getGroupMembers
} from '../../lib/firebase';

// Consistent Color Palette - Black Theme with Purple Accents
const COLORS = {
  background: '#000000',
  cardBg: '#000000',
  text: '#FFFFFF',
  textSecondary: '#E5E5E5',
  textMuted: '#A1A1AA',
  inputBg: '#1A1A1A',
  accent: '#8B5CF6',
  messageOwn: '#8B5CF6',      // Light purple for own messages
  messageOther: '#1A1A1A',    // Dark gray for other messages
  success: '#10B981',
  danger: '#EF4444',
  shadow: 'rgba(139, 92, 246, 0.15)',
  border: 'rgba(255, 255, 255, 0.1)',
};

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

  // State management with defaults
  const [messages, setMessages] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [members, setMembers] = useState([]);
  const [showMembers, setShowMembers] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);

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

  const handleDeleteMessage = async (messageId) => {
    try {
      await deleteMessage(group.id, messageId);
      if (isMountedRef.current) {
        setSelectedMessage(null);
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      if (isMountedRef.current) {
        Alert.alert('Error', 'Failed to delete message. Please try again.');
      }
    }
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

  // Enhanced Message Component - Same as ChatRoom
  const MessageBubble = React.memo(({ message }) => {
    const isCurrentUser = message.senderId === currentUser?.uid;

    return (
      <View style={{
        alignSelf: isCurrentUser ? 'flex-end' : 'flex-start',
        marginBottom: 16,
        maxWidth: '80%',
        marginHorizontal: 16,
      }}>
        {/* Reply Section */}
        {message.replyTo && (
          <View style={{
            backgroundColor: COLORS.inputBg,
            borderRadius: 12,
            paddingHorizontal: 12,
            paddingVertical: 8,
            marginBottom: 4,
            borderLeftWidth: 3,
            borderLeftColor: COLORS.accent,
          }}>
            <Text style={{
              color: COLORS.textMuted,
              fontSize: 12,
              fontWeight: '600',
            }}>
              Replying to {message.replyTo.senderName}
            </Text>
            <Text style={{
              color: COLORS.textSecondary,
              fontSize: 12,
              marginTop: 2,
            }}>
              {message.replyTo.text && message.replyTo.text.length > 30 
                ? `${message.replyTo.text.substring(0, 30)}...` 
                : message.replyTo.text}
            </Text>
          </View>
        )}

        {!isCurrentUser && (
          <Text style={{
            color: COLORS.textMuted,
            fontSize: 12,
            marginBottom: 4,
            fontWeight: '600',
            marginLeft: 4,
          }}>
            {message.senderName || 'User'}
          </Text>
        )}
        
        <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
          <TouchableOpacity 
            onLongPress={() => {
              if (isCurrentUser) {
                Alert.alert(
                  'Delete Message',
                  'Are you sure you want to delete this message?',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { 
                      text: 'Delete', 
                      style: 'destructive',
                      onPress: () => handleDeleteMessage(message.id)
                    }
                  ]
                );
              } else {
                setReplyingTo(message);
              }
            }}
            style={{
              backgroundColor: isCurrentUser ? COLORS.messageOwn : COLORS.messageOther,
              borderRadius: 20,
              paddingHorizontal: 16,
              paddingVertical: 12,
              shadowColor: COLORS.shadow,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
              elevation: 2,
            }}
            activeOpacity={0.7}
          >
            <Text style={{
              color: isCurrentUser ? '#FFFFFF' : COLORS.text,
              fontSize: 16,
              lineHeight: 20,
            }}>
              {message.text}
            </Text>
            <Text style={{
              color: isCurrentUser ? 'rgba(255,255,255,0.8)' : COLORS.textMuted,
              fontSize: 11,
              marginTop: 4,
              textAlign: 'right',
            }}>
              {formatMessageTime(message.timestamp)}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  });

  const MembersModal = React.memo(() => (
    <Modal
      visible={showMembers}
      animationType="fade"
      onRequestClose={() => setShowMembers(false)}
    >
      <SafeAreaView style={{
        flex: 1,
        backgroundColor: COLORS.background,
      }}>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          padding: 20,
          borderBottomWidth: 1,
          borderBottomColor: COLORS.border,
        }}>
          <TouchableOpacity onPress={() => setShowMembers(false)}>
            <Ionicons 
              name="close" 
              size={24} 
              color={COLORS.text} 
            />
          </TouchableOpacity>
          <Text style={{
            fontSize: 20,
            fontWeight: '800',
            marginLeft: 16,
            color: COLORS.text,
          }}>
            Group Members ({members.length})
          </Text>
        </View>
        
        <ScrollView 
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 16 }}
        >
          {members.map((member) => (
            <View 
              key={member.id} 
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 16,
                backgroundColor: COLORS.inputBg,
                padding: 16,
                borderRadius: 16,
              }}
            >
              <Image
                source={member.profileImage ? { uri: member.photoURL } : DEFAULT_PROFILE}
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  marginRight: 12,
                }}
              />
              <View style={{ flex: 1 }}>
                <Text style={{
                  color: COLORS.text,
                  fontWeight: '600',
                  fontSize: 16,
                }}>
                  {member.fullName || 'Anonymous'}
                </Text>
                {member.status && (
                  <Text style={{
                    color: COLORS.textMuted,
                    fontSize: 14,
                  }}>
                    {member.status}
                  </Text>
                )}
              </View>
              {member.id === group.adminId && (
                <View style={{
                  backgroundColor: COLORS.accent,
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 12,
                }}>
                  <Text style={{
                    color: '#FFFFFF',
                    fontWeight: '700',
                    fontSize: 12,
                  }}>
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
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.background,
      }}>
        <ActivityIndicator 
          size="large" 
          color={COLORS.accent} 
        />
        <Text style={{
          marginTop: 20,
          color: COLORS.textSecondary,
          textAlign: 'center',
          fontSize: 16,
          fontWeight: '500',
        }}>
          Loading chat...
        </Text>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: COLORS.background,
      }}>
        <Ionicons 
          name="alert-circle-outline" 
          size={60} 
          color="#F87171" 
          style={{ marginBottom: 16 }}
        />
        <Text style={{
          color: '#F87171',
          textAlign: 'center',
          marginBottom: 20,
          fontSize: 16,
          lineHeight: 24,
        }}>
          {error}
        </Text>
        <TouchableOpacity 
          style={{
            backgroundColor: COLORS.accent,
            paddingHorizontal: 20,
            paddingVertical: 12,
            borderRadius: 12,
          }}
          onPress={fetchInitialData}
        >
          <Text style={{
            color: '#FFFFFF',
            fontWeight: '700',
            fontSize: 16,
          }}>
            Retry
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Main render
  return (
    <SafeAreaView style={{
      flex: 1,
      backgroundColor: COLORS.background,
    }}>
      <StatusBar 
        backgroundColor={COLORS.accent}
        barStyle="light-content"
      />

      {/* Group Header - Same as ChatRoom */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        backgroundColor: COLORS.accent,
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 10,
        elevation: 5,
      }}>
        <TouchableOpacity 
          onPress={() => {
            cleanup();
            navigation.goBack();
          }} 
          style={{ padding: 4 }}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={{
            flex: 1,
            marginLeft: 16,
          }}
          onPress={() => setShowMembers(true)}
        >
          <Text style={{
            color: '#FFFFFF',
            fontSize: 20,
            fontWeight: '800',
          }}>
            {group.name}
          </Text>
          <Text style={{
            color: 'rgba(255,255,255,0.8)',
            fontSize: 13,
            fontWeight: '500',
          }}>
            {members.length} {members.length === 1 ? 'Member' : 'Members'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <ScrollView 
        ref={scrollViewRef}
        style={{
          flex: 1,
          backgroundColor: COLORS.background,
        }}
        contentContainerStyle={{ 
          padding: 16,
          paddingBottom: 20,
          flexGrow: messages.length === 0 ? 1 : undefined, 
          justifyContent: messages.length === 0 ? 'center' : undefined
        }}
        removeClippedSubviews={false}
      >
        {messages.length > 0 ? (
          messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))
        ) : (
          <View style={{
            alignItems: 'center',
            backgroundColor: COLORS.inputBg,
            padding: 32,
            borderRadius: 20,
          }}>
            <Ionicons 
              name="chatbubbles-outline" 
              size={64} 
              color={COLORS.accent} 
              style={{ marginBottom: 16 }}
            />
            <Text style={{
              fontSize: 20,
              fontWeight: '700',
              color: COLORS.text,
              textAlign: 'center',
              marginBottom: 8,
            }}>
              No messages yet
            </Text>
            <Text style={{
              color: COLORS.textSecondary,
              textAlign: 'center',
              fontSize: 16,
              lineHeight: 22,
            }}>
              {getMotivationalQuote(group.name)}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Reply Preview */}
      {replyingTo && (
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingVertical: 12,
          backgroundColor: COLORS.inputBg,
          borderTopWidth: 1,
          borderTopColor: COLORS.border,
        }}>
          <View style={{ flex: 1 }}>
            <Text style={{
              color: COLORS.text,
              fontWeight: '600',
              fontSize: 14,
            }}>
              Replying to {replyingTo.senderName}
            </Text>
            <Text style={{
              color: COLORS.textMuted,
              fontSize: 13,
              marginTop: 2,
            }}>
              {replyingTo.text && replyingTo.text.length > 40 
                ? `${replyingTo.text.substring(0, 40)}...` 
                : replyingTo.text}
            </Text>
          </View>
          <TouchableOpacity onPress={() => setReplyingTo(null)}>
            <Ionicons 
              name="close" 
              size={20} 
              color={COLORS.textMuted} 
            />
          </TouchableOpacity>
        </View>
      )}

      {/* Message Input */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        backgroundColor: COLORS.background,
      }}>
        <TextInput
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Type a message..."
          placeholderTextColor={COLORS.textMuted}
          style={{
            flex: 1,
            backgroundColor: COLORS.inputBg,
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderRadius: 25,
            color: COLORS.text,
            fontSize: 16,
          }}
        />
        <TouchableOpacity 
          onPress={handleSendMessage}
          disabled={!newMessage.trim()}
          style={{
            marginLeft: 12,
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: !newMessage.trim() ? COLORS.inputBg : COLORS.accent,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons 
            name="send" 
            size={20} 
            color={!newMessage.trim() ? COLORS.textMuted : '#FFFFFF'} 
          />
        </TouchableOpacity>
      </View>

      {/* Modals */}
      <MembersModal />
    </SafeAreaView>
  );
};

export default GroupRoomScreen;