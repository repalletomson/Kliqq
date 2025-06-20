import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { db } from '../config/firebaseConfig';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  getDoc,
  doc
} from 'firebase/firestore';
import { useAuth } from './authContext';

const ChatContext = createContext({});

export function ChatProvider({ children }) {
  const { user } = useAuth();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchChats = useCallback(async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);
      setError(null);

      const chatsRef = collection(db, 'chats');
      const q = query(
        chatsRef,
        where('participants', 'array-contains', user.uid),
        orderBy('lastMessageTime', 'desc')
      );

      return onSnapshot(q, async (snapshot) => {
        const chatData = await Promise.all(
          snapshot.docs.map(async (doc) => {
            const data = doc.data();
            const otherUserId = data.participants.find(
              id => id !== user.uid
            );

            // Fetch other user's details
            const userDoc = await getDoc(doc(db, 'users', otherUserId));
            const userData = userDoc.data();

            return {
              id: doc.id,
              ...data,
              recipient: userData,
              recipientId: otherUserId
            };
          })
        );

        setChats(chatData);
        setLoading(false);
      });
    } catch (err) {
      setError('Failed to load chats');
      setLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    const unsubscribe = fetchChats();
    return () => unsubscribe?.();
  }, [fetchChats]);

  return (
    <ChatContext.Provider value={{
      chats,
      loading,
      error,
      fetchChats
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export const useChat = () => useContext(ChatContext);