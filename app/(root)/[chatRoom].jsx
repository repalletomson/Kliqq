import React, { useState, useEffect, useRef } from 'react';
import { 
  View, ScrollView, SafeAreaView, Text, TouchableOpacity, 
  ActivityIndicator, KeyboardAvoidingView, Platform, Animated, StatusBar 
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { 
  collection, query, orderBy, onSnapshot, doc, limit, 
  getDocs, updateDoc, serverTimestamp, arrayUnion, arrayRemove 
} from 'firebase/firestore';
import { db, auth } from '../../config/firebaseConfig';
import { MaterialIcons } from '@expo/vector-icons';
import { MessageItem } from '../../components/MessageItem';
import { MessageInput } from '../../components/messageInput';
import { ChatHeader } from '../../components/chatHeader';
import { THEMES } from '../../config/themes';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const MESSAGES_PER_PAGE = 20;

export default function ChatRoom({ theme = 'DARK' }) {
  const COLORS = THEMES[theme];
  const { chatId, recipientId } = useLocalSearchParams();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [isBlocked, setIsBlocked] = useState(false);
  const [recipient, setRecipient] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [disappearingMessages, setDisappearingMessages] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef(null);
  const lastMessageRef = useRef(null);
  const unsubscribeRef = useRef({});

  const currentUserId = auth.currentUser?.uid;

  useEffect(() => {
    if (!chatId || !recipientId) return;

    setLoading(true);
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

    unsubscribeRef.current.typing = onSnapshot(doc(db, 'chats', chatId), (snapshot) => {
      const data = snapshot.data();
      setDisappearingMessages(data?.disappearingMessages || false);
      setIsTyping(data?.typingUsers?.includes(recipientId) || false);
    });

    return () => Object.values(unsubscribeRef.current).forEach(unsub => unsub?.());
  }, [chatId, recipientId]);

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

  const scrollToBottom = () => scrollViewRef.current?.scrollToEnd({ animated: true });

  const formatDateHeader = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    return dayjs(date).format('MMM D, YYYY');
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: COLORS.background }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar barStyle={theme === 'DARK' ? 'light-content' : 'dark-content'} />
        {recipient && (
          <ChatHeader
            recipient={recipient}
            isBlocked={isBlocked}
            onBlock={() => setIsBlocked(true)}
            onUnblock={() => setIsBlocked(false)}
            isTyping={isTyping}
            theme={theme}
          />
        )}

        <ScrollView
          ref={scrollViewRef}
          style={{ flex: 1 }}
          onContentSizeChange={() => scrollToBottom()}
          onScroll={({ nativeEvent }) => {
            if (nativeEvent.contentOffset.y < 50) loadMoreMessages();
          }}
        >
          {messages.map((message, index) => {
            const prev = messages[index - 1];
            const showDate = !prev || formatDateHeader(message.timestamp) !== formatDateHeader(prev.timestamp);
            
            return (
              <View key={message.id}>
                {showDate && (
                  <Text style={{
                    alignSelf: 'center',
                    color: COLORS.textSecondary,
                    padding: 8,
                    backgroundColor: COLORS.surface,
                    borderRadius: 12,
                    marginVertical: 8
                  }}>
                    {formatDateHeader(message.timestamp)}
                  </Text>
                )}
                <MessageItem
                  item={message}
                  onReply={setReplyingTo}
                  disappearingMessages={disappearingMessages}
                  recipientId={recipientId}
                  chatId={chatId}
                  theme={theme}
                />
              </View>
            );
          })}
        </ScrollView>

        <MessageInput
          chatId={chatId}
          recipientId={recipientId}
          isBlocked={isBlocked}
          replyingTo={replyingTo}
          onCancelReply={() => setReplyingTo(null)}
          disappearingMessages={disappearingMessages}
          onSendMessage={scrollToBottom}
          handleUnblockUser={() => setIsBlocked(false)}
          scrollToBottom={scrollToBottom}
          theme={theme}
        />
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}