import React, { useState, useEffect, useRef } from 'react';
import { 
  View, ScrollView, SafeAreaView, Text, TouchableOpacity, 
  ActivityIndicator, KeyboardAvoidingView, Platform, Animated, StatusBar,
  Alert, Modal
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { 
  collection, query, orderBy, onSnapshot, doc, limit, 
  getDocs, updateDoc, serverTimestamp, arrayUnion, arrayRemove,
  where
} from 'firebase/firestore';
import { db, auth } from '../../config/firebaseConfig';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { MessageItem } from '../../components/MessageItem';
import { MessageInput } from '../../components/messageInput';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const MESSAGES_PER_PAGE = 20;

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

const BlockUserModal = ({ visible, onClose, onBlock, recipientName }) => {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.8)'
      }}>
        <View style={{
          backgroundColor: COLORS.cardBg,
          borderRadius: 20,
          padding: 24,
          width: '85%',
          maxWidth: 320,
          borderWidth: 1,
          borderColor: COLORS.border,
        }}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 16,
          }}>
            <MaterialIcons name="block" size={24} color={COLORS.danger} />
            <Text style={{
              fontSize: 18,
              fontWeight: '700',
              color: COLORS.text,
              marginLeft: 12,
            }}>
              Block User
            </Text>
          </View>
          
          <Text style={{
            fontSize: 15,
            color: COLORS.textSecondary,
            marginBottom: 24,
            lineHeight: 22,
          }}>
            Are you sure you want to block {recipientName}? You won't receive messages from them anymore.
          </Text>
          
          <View style={{
            flexDirection: 'row',
            justifyContent: 'flex-end',
            gap: 12,
          }}>
            <TouchableOpacity
              onPress={onClose}
              style={{
                paddingVertical: 12,
                paddingHorizontal: 20,
                backgroundColor: COLORS.inputBg,
                borderRadius: 12,
              }}
            >
              <Text style={{
                fontSize: 16,
                color: COLORS.text,
                fontWeight: '600',
              }}>
                Cancel
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={onBlock}
              style={{
                paddingVertical: 12,
                paddingHorizontal: 20,
                backgroundColor: COLORS.danger,
                borderRadius: 12,
              }}
            >
              <Text style={{
                fontSize: 16,
                color: '#FFFFFF',
                fontWeight: '700',
              }}>
                Block
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default function ChatRoom() {
  const { chatId, recipientId } = useLocalSearchParams();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [isBlocked, setIsBlocked] = useState(false);
  const [recipient, setRecipient] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [disappearingMessages, setDisappearingMessages] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const scrollViewRef = useRef(null);
  const lastMessageRef = useRef(null);
  const unsubscribeRef = useRef({});

  const currentUserId = auth.currentUser?.uid;

  useEffect(() => {
    if (!chatId || !recipientId) return;

    setLoading(true);
    
    // Load messages
    const messagesQuery = query(
      collection(db, 'chats', chatId, 'messages'),
      orderBy('timestamp', 'desc'),
      limit(MESSAGES_PER_PAGE)
    );

    unsubscribeRef.current.messages = onSnapshot(messagesQuery, (snapshot) => {
      const fetchedMessages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })).reverse();
      setMessages(fetchedMessages);
      setHasMore(snapshot.docs.length === MESSAGES_PER_PAGE);
      setLoading(false);
    });

    // Load recipient data
    unsubscribeRef.current.recipient = onSnapshot(doc(db, 'users', recipientId), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setRecipient({
          ...data,
          id: recipientId,
          lastSeen: data.lastSeen ? dayjs(data.lastSeen.toDate()).fromNow() : 'Unknown'
        });
      }
    });

    // Listen for typing indicators and disappearing messages
    unsubscribeRef.current.chat = onSnapshot(doc(db, 'chats', chatId), (snapshot) => {
      const data = snapshot.data();
      setIsTyping(data?.typingUsers?.includes(recipientId) || false);
      setDisappearingMessages(data?.disappearingMessages || false);
    });

    return () => Object.values(unsubscribeRef.current).forEach(unsub => unsub?.());
  }, [chatId, recipientId]);

  // Mark messages as read
  useEffect(() => {
    if (!chatId || !currentUserId) return;
    
    const markAsRead = async () => {
      const unreadQuery = query(
        collection(db, 'chats', chatId, 'messages'),
        where('unreadBy', 'array-contains', currentUserId)
      );
      const snapshot = await getDocs(unreadQuery);
      snapshot.forEach(doc => {
        updateDoc(doc.ref, {
          unreadBy: arrayRemove(currentUserId),
          readBy: { ...doc.data().readBy, [currentUserId]: true }
        });
      });
    };
    markAsRead();
  }, [chatId, currentUserId]);

  const loadMoreMessages = async () => {
    if (!hasMore || !lastMessageRef.current) return;
    
    const moreQuery = query(
      collection(db, 'chats', chatId, 'messages'),
      orderBy('timestamp', 'desc'),
      startAfter(lastMessageRef.current),
      limit(MESSAGES_PER_PAGE)
    );
    
    const snapshot = await getDocs(moreQuery);
    const newMessages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).reverse();
    setMessages(prev => [...newMessages, ...prev]);
    lastMessageRef.current = snapshot.docs[snapshot.docs.length - 1];
    setHasMore(snapshot.docs.length === MESSAGES_PER_PAGE);
  };

  const scrollToBottom = () => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  };

  const handleBlock = async () => {
    try {
      // Add actual blocking logic here based on your backend
      setIsBlocked(true);
      setShowBlockModal(false);
      Alert.alert("User Blocked", `You have blocked ${recipient?.fullName || 'this user'} successfully.`);
    } catch (error) {
      console.error('Error blocking user:', error);
      Alert.alert("Error", "Failed to block user");
    }
  };

  const formatDateHeader = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    return dayjs(date).format('MMM D, YYYY');
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

  // Enhanced Message Component
  const MessageBubble = React.memo(({ message }) => {
    const isCurrentUser = message.senderId === currentUserId;

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
            {message.senderName || recipient?.fullName || 'User'}
          </Text>
        )}
        
        <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
          <TouchableOpacity 
            onLongPress={() => setReplyingTo(message)}
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
              {message.text || message.content}
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

  // Header component with purple background
  const ChatHeader = () => (
    <View style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      backgroundColor: COLORS.accent,
      paddingTop: 44,
      paddingBottom: 16,
      paddingHorizontal: 20,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      zIndex: 100,
      shadowColor: COLORS.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.8,
      shadowRadius: 10,
      elevation: 5,
    }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
        <TouchableOpacity 
          onPress={() => router.back()}
          style={{
            marginRight: 16,
            padding: 4,
          }}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        
        <View style={{ flex: 1 }}>
          <Text style={{
            fontSize: 20,
            fontWeight: '800',
            color: '#FFFFFF',
          }}>
            {recipient?.fullName || 'Chat'}
          </Text>
          <Text style={{
            fontSize: 13,
            color: 'rgba(255,255,255,0.8)',
            marginTop: 2,
            fontWeight: '500',
          }}>
            {isTyping ? 'typing...' : `Last seen ${recipient?.lastSeen || 'unknown'}`}
          </Text>
        </View>
      </View>
      
      <TouchableOpacity
        onPress={() => setShowBlockModal(true)}
        style={{
          padding: 8,
          borderRadius: 20,
          backgroundColor: 'rgba(255,255,255,0.1)',
        }}
      >
        <Ionicons name="ellipsis-vertical" size={20} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor: COLORS.background 
      }}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
        <ActivityIndicator size="large" color={COLORS.accent} />
        <Text style={{
          marginTop: 20,
          color: COLORS.textSecondary,
          textAlign: 'center',
          fontSize: 16,
          fontWeight: '500',
        }}>
          Loading chat...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.accent} />
      
      <ChatHeader />

      {/* Messages Area */}
      <ScrollView
        ref={scrollViewRef}
        style={{ 
          flex: 1, 
          backgroundColor: COLORS.background,
          marginTop: 100,
          marginBottom: 80,
        }}
        contentContainerStyle={{ 
          paddingTop: 8,
          paddingBottom: 20,
        }}
        onContentSizeChange={() => scrollToBottom()}
        onScroll={({ nativeEvent }) => {
          if (nativeEvent.contentOffset.y < 50) loadMoreMessages();
        }}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((message, index) => {
          const prev = messages[index - 1];
          const showDate = !prev || formatDateHeader(message.timestamp) !== formatDateHeader(prev.timestamp);
          
          return (
            <View key={message.id}>
              {showDate && (
                <View style={{
                  alignItems: 'center',
                  marginVertical: 16,
                }}>
                  <Text style={{
                    color: COLORS.textSecondary,
                    fontSize: 12,
                    fontWeight: '600',
                    backgroundColor: COLORS.inputBg,
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: COLORS.border,
                  }}>
                    {formatDateHeader(message.timestamp)}
                  </Text>
                </View>
              )}
              <MessageBubble message={message} />
            </View>
          );
        })}
        
        {isTyping && (
          <View style={{
            alignSelf: 'flex-start',
            marginHorizontal: 16,
            marginVertical: 6,
          }}>
            <View style={{
              backgroundColor: COLORS.messageOther,
              borderRadius: 20,
              paddingHorizontal: 16,
              paddingVertical: 12,
              flexDirection: 'row',
              alignItems: 'center',
            }}>
              <View style={{ flexDirection: 'row', gap: 4 }}>
                <Animated.View style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: COLORS.textMuted,
                }} />
                <Animated.View style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: COLORS.textMuted,
                }} />
                <Animated.View style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: COLORS.textMuted,
                }} />
              </View>
            </View>
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
              Replying to {replyingTo.senderName || 'User'}
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

      {/* Floating Message Input */}
      <MessageInput
        chatId={chatId}
        recipientId={recipientId}
        isBlocked={isBlocked}
        replyingTo={replyingTo}
        onCancelReply={() => setReplyingTo(null)}
        onSendMessage={scrollToBottom}
        handleUnblockUser={() => setIsBlocked(false)}
        scrollToBottom={scrollToBottom}
        disappearingMessages={disappearingMessages}
      />

      {/* Block User Modal */}
      <BlockUserModal
        visible={showBlockModal}
        onClose={() => setShowBlockModal(false)}
        onBlock={handleBlock}
        recipientName={recipient?.fullName}
      />
    </View>
  );
}