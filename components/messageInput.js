

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  Platform,
  KeyboardAvoidingView,
  SafeAreaView,
  Alert,
  StyleSheet,
  Animated,
  Keyboard,
  Modal,
  ActivityIndicator,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  arrayRemove,
  arrayUnion,
  getDoc,
  setDoc,
  increment,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, auth, storage } from "../config/firebaseConfig";
import { AES, enc } from "react-native-crypto-js";

const COLORS = {
  background: "#070606",
  surface: "#171616",
  textPrimary: "#FFFFFF",
  textSecondary: "#B2B3B2",
  accent: "#6C6C6D",
  separator: "#1E1E1E",
  buttonBackground: "#1A1A1A",
  primary: "#007AFF",
  border: "#333333",
  green: "#00FF00",
};

const SECRET_KEY = "kX7p9mZ3qW8rT2vL4cY6nJ0bF5gH1jD8eK2wM9xP"; // Replace with your generated key
const DisappearingMessagesConfirmModal = ({ visible, onClose, onConfirm }) => {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.confirmModalOverlay}>
        <View style={styles.confirmModalContent}>
          <Text style={styles.confirmModalTitle}>Enable Disappearing Messages?</Text>
          <Text style={styles.confirmModalText}>
            Messages in this chat will disappear after 24 hours. This cannot be undone.
          </Text>
          <View style={styles.confirmModalButtons}>
            <TouchableOpacity onPress={onClose} style={styles.confirmModalCancel}>
              <Text style={styles.confirmModalCancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onConfirm} style={styles.confirmModalConfirm}>
              <Text style={styles.confirmModalConfirmText}>Enable</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export const MessageInput = React.memo(
  ({
    chatId,
    recipientId,
    isBlocked,
    replyingTo,
    onCancelReply,
    disappearingMessages,
    onSendMessage,
    handleUnblockUser,
    scrollToBottom,
  }) => {
    const [message, setMessage] = useState("");
    const [imageOptionsVisible, setImageOptionsVisible] = useState(false);
    const [confirmModalVisible, setConfirmModalVisible] = useState(false);
    const [sending, setSending] = useState(false);
    const [inputHeight, setInputHeight] = useState(35);
    const [isTyping, setIsTyping] = useState(false);
    const inputRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const isMounted = useRef(true);
    const scaleAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
      const keyboardDidShowListener = Keyboard.addListener("keyboardDidShow", () => {
        if (scrollToBottom) setTimeout(scrollToBottom, 100);
      });
      return () => keyboardDidShowListener.remove();
    }, [scrollToBottom]);

    useEffect(() => {
      return () => {
        isMounted.current = false;
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      };
    }, []);

    useEffect(() => {
      if (replyingTo && inputRef.current) inputRef.current.focus();
    }, [replyingTo]);

    const animateSendButton = () => {
      Animated.spring(scaleAnim, { toValue: 1.2, friction: 3, tension: 40, useNativeDriver: true }).start(() => {
        Animated.spring(scaleAnim, { toValue: 1, friction: 3, tension: 40, useNativeDriver: true }).start();
      });
    };

    const resetInputField = () => {
      setInputHeight(35);
      if (inputRef.current) inputRef.current.clear();
    };

    useEffect(() => {
      const chatRef = doc(db, "chats", chatId);
      const updateTypingStatus = async (isTyping) => {
        try {
          const chatDoc = await getDoc(chatRef);
          if (!auth.currentUser) return;
          if (!chatDoc.exists()) await setDoc(chatRef, { typingUsers: [] });
          else if (!chatDoc.data()?.typingUsers) await updateDoc(chatRef, { typingUsers: [] });

          if (isTyping) {
            await updateDoc(chatRef, { typingUsers: arrayUnion(auth.currentUser.uid) });
          } else {
            await updateDoc(chatRef, { typingUsers: arrayRemove(auth.currentUser.uid) });
          }
        } catch (error) {
          console.error("Error updating typing status:", error);
        }
      };

      if (message.length > 0) {
        setIsTyping(true);
        updateTypingStatus(true);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
          setIsTyping(false);
          updateTypingStatus(false);
        }, 3000);
      } else {
        setIsTyping(false);
        updateTypingStatus(false);
      }

      return () => {
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        updateTypingStatus(false);
      };
    }, [message, chatId]);

    const handleSendMessage = useCallback(async () => {
      if (sending || message.trim() === "" || !isMounted.current) return;

      try {
        setSending(true);
        animateSendButton();

        const messageContent = message.trim();
        const encryptedMessage = AES.encrypt(messageContent, SECRET_KEY).toString();

        setMessage("");
        resetInputField();

        const now = serverTimestamp();
        const expiresAt = disappearingMessages ? new Date(Date.now() + 24 * 60 * 60 * 1000) : null;

        const messageData = {
          text: encryptedMessage,
          sender: auth.currentUser.uid,
          name: auth.currentUser.displayName || "User",
          timestamp: now,
          type: "text",
          reactions: {},
          status: "sent",
          readBy: { [auth.currentUser.uid]: true },
          unreadBy: [recipientId],
          ...(replyingTo && {
            replyTo: {
              id: replyingTo.id,
              text: replyingTo.type === "text" ? AES.encrypt(replyingTo.text, SECRET_KEY).toString() : replyingTo.text,
              sender: replyingTo.sender,
              type: replyingTo.type,
              name: replyingTo.name,
            },
          }),
          ...(disappearingMessages && { expiresAt, isDisappearing: true }),
        };

        const docRef = await addDoc(collection(db, "chats", chatId, "messages"), messageData);

        await updateDoc(doc(db, "chats", chatId), {
          lastMessage: encryptedMessage,
          lastMessageTime: now,
          disappearingMessages,
          ...(replyingTo && {
            lastMessageReplyTo: {
              id: replyingTo.id,
              text: replyingTo.type === "text" ? AES.encrypt(replyingTo.text, SECRET_KEY).toString() : replyingTo.text,
              sender: replyingTo.sender,
              type: replyingTo.type,
            },
          }),
          ...(disappearingMessages && { lastMessageExpiresAt: expiresAt }),
        });

        const unreadCountRef = doc(db, "unreadCounts", recipientId, "senders", auth.currentUser.uid);
        const unreadCountDoc = await getDoc(unreadCountRef);

        if (unreadCountDoc.exists()) {
          await updateDoc(unreadCountRef, {
            count: increment(1),
            lastMessage: encryptedMessage,
            lastMessageTime: now,
            chatId,
          });
        } else {
          await setDoc(unreadCountRef, {
            count: 1,
            lastMessage: encryptedMessage,
            lastMessageTime: now,
            chatId,
          });
        }

        if (scrollToBottom) setTimeout(scrollToBottom, 100);
        onSendMessage?.(docRef.id);
        onCancelReply?.();

        // Keep keyboard open
        setTimeout(() => {
          if (inputRef.current) inputRef.current.focus();
        }, 100);
      } catch (error) {
        console.error("Send message error:", error);
        if (isMounted.current) Alert.alert("Error", "Failed to send message");
      } finally {
        setSending(false);
      }
    }, [chatId, message, sending, replyingTo, disappearingMessages, scrollToBottom, onSendMessage, onCancelReply]);

    const handleImageUpload = useCallback(
      async (type, isViewOnce = false) => {
        if (!isMounted.current) return;

        try {
          const { status } = await (type === "gallery"
            ? ImagePicker.requestMediaLibraryPermissionsAsync()
            : ImagePicker.requestCameraPermissionsAsync());

        if (!isMounted.current) return;
        
        if (status !== "granted") {
            Alert.alert("Permission Required", `Please allow access to your ${type === "gallery" ? "gallery" : "camera"}`);
            return;
          }

          const result = await (type === "gallery"
            ? ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, quality: 0.8 })
            : ImagePicker.launchCameraAsync({ allowsEditing: true, quality: 0.8 }));

        if (!isMounted.current) return;

        if (!result.canceled && result.assets?.[0]?.uri) {
            setSending(true);
            const uri = result.assets[0].uri;
            const response = await fetch(uri);
            const blob = await response.blob();
            const storageRef = ref(storage, `chats/${chatId}/${Date.now()}`);
            const snapshot = await uploadBytes(storageRef, blob);
            const downloadURL = await getDownloadURL(snapshot.ref);

            await addDoc(collection(db, "chats", chatId, "messages"), {
              type: "image",
              fileUrl: downloadURL,
              sender: auth.currentUser.uid,
              timestamp: serverTimestamp(),
              reactions: {},
              status: "sent",
              readBy: { [auth.currentUser.uid]: true },
              unreadBy: [recipientId],
              isViewOnce,
              isDisappearing: disappearingMessages,
              viewedBy: [],
              ...(disappearingMessages && { expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) }),
              ...(replyingTo && {
                replyTo: {
                  id: replyingTo.id,
                  text: replyingTo.type === "text" ? AES.encrypt(replyingTo.text, SECRET_KEY).toString() : replyingTo.text,
                  sender: replyingTo.sender,
                  type: replyingTo.type,
                  name: replyingTo.name,
                },
              }),
            });

            await updateDoc(doc(db, "chats", chatId), {
              lastMessage: "📷 Image",
              lastMessageTime: serverTimestamp(),
              disappearingMessages,
              ...(disappearingMessages && { lastMessageExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) }),
              ...(replyingTo && {
                lastMessageReplyTo: {
                  id: replyingTo.id,
                  text: replyingTo.type === "text" ? AES.encrypt(replyingTo.text, SECRET_KEY).toString() : replyingTo.text,
                  sender: replyingTo.sender,
                  type: replyingTo.type,
                },
              }),
            });

            const unreadCountRef = doc(db, "unreadCounts", recipientId, "senders", auth.currentUser.uid);
            const unreadCountDoc = await getDoc(unreadCountRef);

            if (unreadCountDoc.exists()) {
              await updateDoc(unreadCountRef, {
                count: increment(1),
                lastMessage: "📷 Image",
                lastMessageTime: serverTimestamp(),
                chatId,
              });
            } else {
              await setDoc(unreadCountRef, {
                count: 1,
                lastMessage: "📷 Image",
                lastMessageTime: serverTimestamp(),
                chatId,
              });
            }

            if (scrollToBottom) setTimeout(scrollToBottom, 100);
            if (isMounted.current) {
              onSendMessage?.();
              onCancelReply?.();
            }
          }
        } catch (error) {
          console.error("Image upload error:", error);
          if (isMounted.current) Alert.alert("Error", "Failed to upload image");
        } finally {
          if (isMounted.current) {
            setImageOptionsVisible(false);
            setSending(false);
          }
        }
      },
      [chatId, onSendMessage, disappearingMessages, replyingTo, scrollToBottom]
    );

    const handleToggleDisappearingMessages = () => {
      if (!disappearingMessages) setConfirmModalVisible(true);
      else toggleDisappearingMessages();
    };

    const toggleDisappearingMessages = async () => {
      try {
        await updateDoc(doc(db, "chats", chatId), {
          disappearingMessages: !disappearingMessages,
          disappearingMessagesUpdatedAt: serverTimestamp(),
        });
        setConfirmModalVisible(false);
      } catch (error) {
        console.error("Error toggling disappearing messages:", error);
        Alert.alert("Error", "Failed to update disappearing messages settings");
      }
    };

    const handleContentSizeChange = (event) => {
      const { height } = event.nativeEvent.contentSize;
      setInputHeight(Math.min(100, Math.max(35, height)));
    };

    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
        style={styles.keyboardAvoidingView}
      >
        <SafeAreaView style={styles.container} edges={["bottom"]}>
          {replyingTo && (
            <View style={styles.replyContainer}>
              <View style={styles.replyContent}>
                <Text style={styles.replyLabel}>
                  Replying to {replyingTo.sender === auth.currentUser.uid ? "yourself" : replyingTo.name}
                </Text>
                <Text style={styles.replyText} numberOfLines={1}>
                  {replyingTo.type === "text" ? AES.decrypt(replyingTo.text, SECRET_KEY).toString(enc.Utf8) : (replyingTo.type === "image" ? "📷 Image" : "Message")}
                </Text>
              </View>
              <TouchableOpacity onPress={onCancelReply} style={styles.replyCloseButton}>
                <MaterialIcons name="close" size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
          )}
          {isBlocked ? (
            <View style={styles.blockedContainer}>
              <Text style={styles.blockedText}>You have blocked this user.</Text>
              <TouchableOpacity onPress={handleUnblockUser} style={styles.unblockButton}>
                <Text style={styles.unblockButtonText}>Unblock</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.inputContainer}>
              <TouchableOpacity onPress={() => setImageOptionsVisible(true)} style={styles.attachButton} disabled={sending}>
                <MaterialIcons name="attach-file" size={24} color={sending ? COLORS.accent : COLORS.textSecondary} />
              </TouchableOpacity>
              <View style={styles.textInputContainer}>
                <TextInput
                  ref={inputRef}
                  value={message}
                  onChangeText={setMessage}
                  placeholder="Message"
                  placeholderTextColor={COLORS.textSecondary}
                  multiline
                  style={[styles.textInput, { height: inputHeight }]}
                  onContentSizeChange={handleContentSizeChange}
                  editable={!sending}
                  blurOnSubmit={false}
                />
                <View style={styles.inputActions}>
                  <TouchableOpacity
                    onPress={handleToggleDisappearingMessages}
                    style={[styles.disappearingButton, disappearingMessages && styles.disappearingButtonActive]}
                  >
                    <MaterialIcons name="timer" size={20} color={disappearingMessages ? COLORS.green : COLORS.textSecondary} />
                  </TouchableOpacity>
                </View>
              </View>
              <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                <TouchableOpacity
                  onPress={handleSendMessage}
                  disabled={sending || message.trim() === ""}
                  style={[styles.sendButton, { backgroundColor: sending || message.trim() === "" ? COLORS.accent : COLORS.green }]}
                >
                  {sending ? (
                    <ActivityIndicator size="small" color={COLORS.textPrimary} />
                  ) : (
                    <MaterialIcons name="send" size={20} color={COLORS.textPrimary} />
                  )}
                </TouchableOpacity>
              </Animated.View>
            </View>
          )}
          <Modal visible={imageOptionsVisible} transparent animationType="slide" onRequestClose={() => setImageOptionsVisible(false)}>
            <View style={styles.imageOptionsOverlay}>
              <View style={styles.imageOptionsContent}>
                <TouchableOpacity onPress={() => handleImageUpload("gallery")} style={styles.imageOptionButton}>
                  <MaterialIcons name="photo" size={24} color={COLORS.textPrimary} />
                  <Text style={styles.imageOptionText}>Gallery</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleImageUpload("camera")} style={styles.imageOptionButton}>
                  <MaterialIcons name="camera-alt" size={24} color={COLORS.textPrimary} />
                  <Text style={styles.imageOptionText}>Camera</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleImageUpload("gallery", true)} style={styles.imageOptionButton}>
                  <MaterialIcons name="visibility-off" size={24} color={COLORS.textPrimary} />
                  <Text style={styles.imageOptionText}>View Once</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setImageOptionsVisible(false)} style={styles.imageOptionButton}>
                  <MaterialIcons name="close" size={24} color={COLORS.textPrimary} />
                  <Text style={styles.imageOptionText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
          <DisappearingMessagesConfirmModal
            visible={confirmModalVisible}
            onClose={() => setConfirmModalVisible(false)}
            onConfirm={toggleDisappearingMessages}
          />
        </SafeAreaView>
      </KeyboardAvoidingView>
    );
  }
);

const styles = StyleSheet.create({
  keyboardAvoidingView: { backgroundColor: COLORS.background },
  container: { backgroundColor: COLORS.background, borderTopWidth: 1, borderTopColor: COLORS.separator },
  replyContainer: { flexDirection: "row", alignItems: "center", backgroundColor: COLORS.surface, padding: 8, borderRadius: 8, marginHorizontal: 16, marginBottom: 8 },
  replyContent: { flex: 1 },
  replyLabel: { fontSize: 14, color: COLORS.textSecondary },
  replyText: { fontSize: 14, color: COLORS.textPrimary, marginTop: 2 },
  replyCloseButton: { padding: 8 },
  blockedContainer: { padding: 16, backgroundColor: COLORS.background, borderTopWidth: 1, borderTopColor: COLORS.separator, alignItems: "center" },
  blockedText: { fontSize: 16, color: COLORS.textSecondary, textAlign: "center", marginBottom: 8 },
  unblockButton: { padding: 12, backgroundColor: COLORS.primary, borderRadius: 8, alignItems: "center" },
  unblockButtonText: { fontSize: 16, fontWeight: "500", color: COLORS.textPrimary },
  inputContainer: { flexDirection: "row", alignItems: "flex-end", paddingHorizontal: 16, paddingVertical: 4, backgroundColor: COLORS.background },
  attachButton: { padding: 8, alignSelf: "center" },
  textInputContainer: { flex: 1, flexDirection: "row", alignItems: "center", backgroundColor: COLORS.surface, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4 },
  textInput: { flex: 1, fontSize: 16, color: COLORS.textPrimary, paddingVertical: Platform.OS === "ios" ? 8 : 4, minHeight: 35, maxHeight: 100 },
  inputActions: { flexDirection: "row", alignItems: "center" },
  disappearingButton: { padding: 8 },
  disappearingButtonActive: {},
  sendButton: { padding: 8, borderRadius: 20, alignSelf: "center", marginLeft: 8 },
  imageOptionsOverlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0, 0, 0, 0.5)" },
  imageOptionsContent: { backgroundColor: COLORS.surface, borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 16 },
  imageOptionButton: { flexDirection: "row", alignItems: "center", padding: 12 },
  imageOptionText: { marginLeft: 12, fontSize: 16, color: COLORS.textPrimary },
  confirmModalOverlay: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0, 0, 0, 0.5)" },
  confirmModalContent: { backgroundColor: COLORS.surface, borderRadius: 12, padding: 20, width: "80%" },
  confirmModalTitle: { fontSize: 18, fontWeight: "600", color: COLORS.textPrimary, marginBottom: 8 },
  confirmModalText: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 20 },
  confirmModalButtons: { flexDirection: "row", justifyContent: "flex-end" },
  confirmModalCancel: { paddingVertical: 8, paddingHorizontal: 16, marginRight: 8 },
  confirmModalCancelText: { fontSize: 16, color: COLORS.textSecondary },
  confirmModalConfirm: { paddingVertical: 8, paddingHorizontal: 16, backgroundColor: COLORS.primary, borderRadius: 8 },
  confirmModalConfirmText: { fontSize: 16, color: COLORS.textPrimary, fontWeight: "500" },
});

MessageInput.displayName = "MessageInput";