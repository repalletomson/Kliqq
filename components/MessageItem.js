


import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Animated,
  PanResponder,
  TouchableOpacity,
  Modal,
  TextInput,
  Pressable,
  Image,
  ActivityIndicator,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { doc, deleteDoc, updateDoc, arrayUnion, serverTimestamp, arrayRemove } from "firebase/firestore";
import { db, auth } from "../config/firebaseConfig";
import { AES, enc } from "react-native-crypto-js";

const DRAG_THRESHOLD = 50;
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
};

const SECRET_KEY = "kX7p9mZ3qW8rT2vL4cY6nJ0bF5gH1jD8eK2wM9xP"; // Replace with your generated key

// const SECRET_KEY = "my-very-secure-key-12345";

const MessageOptionsModal = ({ visible, onClose, onDelete, onEdit, onReply, canEdit }) => {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0, 0, 0, 0.75)" }} onPress={onClose}>
        <Pressable onPress={(e) => e.stopPropagation()} style={{ backgroundColor: COLORS.surface, borderRadius: 16, width: "80%", maxWidth: 300, overflow: "hidden" }}>
          <TouchableOpacity
            onPress={() => {
              onReply();
              onClose();
            }}
            style={{ flexDirection: "row", alignItems: "center", padding: 16, borderBottomWidth: 1, borderBottomColor: COLORS.separator }}
          >
            <MaterialIcons name="reply" size={24} color={COLORS.textPrimary} />
            <Text style={{ marginLeft: 12, fontSize: 16, color: COLORS.textPrimary }}>Reply</Text>
          </TouchableOpacity>
          {canEdit && (
            <TouchableOpacity onPress={onEdit} style={{ flexDirection: "row", alignItems: "center", padding: 16, borderBottomWidth: 1, borderBottomColor: COLORS.separator }}>
              <MaterialIcons name="edit" size={24} color={COLORS.textPrimary} />
              <Text style={{ marginLeft: 12, fontSize: 16, color: COLORS.textPrimary }}>Edit Message</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={onDelete} style={{ flexDirection: "row", alignItems: "center", padding: 16 }}>
            <MaterialIcons name="delete" size={24} color="#EF4444" />
            <Text style={{ marginLeft: 12, fontSize: 16, color: "#EF4444" }}>Delete Message</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const EditMessageModal = ({ visible, onClose, onSave, initialText }) => {
  const decryptedInitialText = initialText ? AES.decrypt(initialText, SECRET_KEY).toString(enc.Utf8) : "";
  const [editedText, setEditedText] = useState(decryptedInitialText);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!editedText.trim()) return;
    setIsSaving(true);
    const encryptedEditedText = AES.encrypt(editedText.trim(), SECRET_KEY).toString();
    await onSave(encryptedEditedText);
    setIsSaving(false);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0, 0, 0, 0.75)" }}>
        <View style={{ backgroundColor: COLORS.surface, borderRadius: 16, width: "90%", maxWidth: 350, overflow: "hidden" }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16, borderBottomWidth: 1, borderBottomColor: COLORS.separator }}>
            <Text style={{ fontSize: 18, fontWeight: "600", color: COLORS.textPrimary }}>Edit Message</Text>
            <TouchableOpacity onPress={onClose} disabled={isSaving}>
              <MaterialIcons name="close" size={24} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>
          <View style={{ padding: 16 }}>
            <TextInput
              style={{ borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, padding: 12, minHeight: 100, marginBottom: 16, color: COLORS.textPrimary, textAlignVertical: "top" }}
              multiline
              value={editedText}
              onChangeText={setEditedText}
             e editable={!isSaving}
            />
            <TouchableOpacity
              onPress={handleSave}
              style={{ padding: 12, borderRadius: 8, alignItems: "center", backgroundColor: isSaving || !editedText.trim() ? COLORS.accent : COLORS.primary }}
              disabled={isSaving || !editedText.trim()}
            >
              {isSaving ? <ActivityIndicator size="small" color={COLORS.textPrimary} /> : <Text style={{ fontSize: 16, fontWeight: "500", color: COLORS.textPrimary }}>Save Changes</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const FullImageModal = ({ visible, imageUri, onClose, isViewOnce, onViewOnceClose, hasViewed }) => {
  const [loading, setLoading] = useState(true);

  const handleClose = () => {
    if (isViewOnce && !hasViewed) onViewOnceClose();
    else onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View style={{ flex: 1, backgroundColor: "rgba(0, 0, 0, 0.95)", justifyContent: "center", alignItems: "center" }}>
        {imageUri && (
          <View style={{ width: "100%", height: "80%", position: "relative" }}>
            <Image
              source={{ uri: imageUri }}
              style={{ width: "100%", height: "100%" }}
              resizeMode="contain"
              onLoadStart={() => setLoading(true)}
              onLoadEnd={() => setLoading(false)}
            />
            {loading && (
              <View style={{ width: "100%", height: "100%", justifyContent: "center", alignItems: "center", position: "absolute" }}>
                <ActivityIndicator size="large" color={COLORS.textPrimary} />
              </View>
            )}
            <View style={{ position: "absolute", top: 16, right: 16, flexDirection: "row", alignItems: "center" }}>
              {isViewOnce && !hasViewed && (
                <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "rgba(0, 0, 0, 0.5)", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, marginRight: 12 }}>
                  <MaterialIcons name="timer" size={16} color={COLORS.textPrimary} />
                  <Text style={{ color: COLORS.textPrimary, marginLeft: 6, fontSize: 12 }}>Image will disappear after closing</Text>
                </View>
              )}
              <TouchableOpacity style={{ backgroundColor: "rgba(255, 255, 255, 0.3)", padding: 8, borderRadius: 20 }} onPress={handleClose}>
                <MaterialIcons name="close" size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
};

export const MessageItem = React.memo(
  ({ item, previousMessage, isLastMessage, onReply, disappearingMessages, recipientId, chatId, scrollToBottom }) => {
    const [timeLeft, setTimeLeft] = useState(null);
    const [fullImageUri, setFullImageUri] = useState(null);
    const [showOptions, setShowOptions] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [hasViewed, setHasViewed] = useState(false);
    const messageRef = useRef(null);

    const translateX = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const isOwnMessage = item.sender === auth.currentUser?.uid;

    const ANIMATION_CONFIG = {
      FADE_IN_DURATION: 300,
      SLIDE_IN_DURATION: 400,
      SPRING: { friction: 8, tension: 40 },
    };

    useEffect(() => {
      Animated.timing(fadeAnim, { toValue: 1, duration: ANIMATION_CONFIG.FADE_IN_DURATION, useNativeDriver: true }).start();
      if (isLastMessage) scrollToBottom?.();
    }, [isLastMessage, scrollToBottom]);

    useEffect(() => {
      if (item.isDisappearing && item.expiresAt) {
        const interval = setInterval(() => {
          const now = new Date();
          const expires = new Date(item.expiresAt.seconds * 1000);
          const diff = expires - now;
          if (diff <= 0) {
            deleteDoc(doc(db, "chats", chatId, "messages", item.id)).catch((error) => console.error("Error deleting expired message:", error));
            clearInterval(interval);
          } else {
            setTimeLeft(Math.floor(diff / 1000 / 60));
          }
        }, 10000);
        return () => clearInterval(interval);
      }
    }, [item, chatId]);

    useEffect(() => {
      const updateReadStatus = async () => {
        if (!isOwnMessage && !item.readBy?.[auth.currentUser.uid]) {
          try {
            await updateDoc(doc(db, "chats", chatId, "messages", item.id), {
              readBy: { ...item.readBy, [auth.currentUser.uid]: true },
              unreadBy: arrayRemove(auth.currentUser.uid),
            });
          } catch (error) {
            console.error("Error updating read status:", error);
          }
        }
      };
      updateReadStatus();
    }, [item, chatId, isOwnMessage]);

    const handleViewOnceImage = async () => {
      if (item.isViewOnce && !item.viewedBy?.includes(auth.currentUser.uid) && !isOwnMessage) {
        setFullImageUri(item.fileUrl);
        try {
          await updateDoc(doc(db, "chats", chatId, "messages", item.id), { viewedBy: arrayUnion(auth.currentUser.uid) }, { merge: true });
          setHasViewed(true);
        } catch (error) {
          console.error("Error marking image as viewed:", error);
        }
      }
    };
// reply
    const handleViewOnceClose = async () => {
      setFullImageUri(null);
      if (item.viewedBy?.length >= 1) {
        try {
          await deleteDoc(doc(db, "chats", chatId, "messages", item.id));
        } catch (error) {
          console.error("Error deleting view-once message:", error);
        }
      }
    };

    const handleImageView = () => setFullImageUri(item.fileUrl);

    const handleDelete = async () => {
      try {
        if (!chatId) throw new Error("Chat ID is missing");
        const messageRef = doc(db, "chats", chatId, "messages", item.id);
        await deleteDoc(messageRef);
        setShowOptions(false);
      } catch (error) {
        console.error("Error deleting message:", error.message);
      }
    };

    const handleEdit = async (newText) => {
      try {
        if (!chatId) throw new Error("Chat ID is missing");
        if (!newText || newText.trim() === "") throw new Error("New text is empty");
        const messageRef = doc(db, "chats", chatId, "messages", item.id);
        await updateDoc(messageRef, { text: newText, edited: true, editedAt: serverTimestamp() });
        setShowEditModal(false);
        setShowOptions(false);
      } catch (error) {
        console.error("Error editing message:", error.message);
      }
    };

    const panResponder = useRef(
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dx) > Math.abs(gestureState.dy * 2),
        onPanResponderMove: (_, { dx }) => {
          if ((isOwnMessage && dx < 0) || (!isOwnMessage && dx > 0)) translateX.setValue(dx);
        },
        onPanResponderRelease: (_, { dx }) => {
          if (Math.abs(dx) > DRAG_THRESHOLD) {
            Animated.spring(translateX, { toValue: 0, ...ANIMATION_CONFIG.SPRING, useNativeDriver: true }).start(() => onReply(item));
          } else {
            Animated.spring(translateX, { toValue: 0, ...ANIMATION_CONFIG.SPRING, useNativeDriver: true }).start();
          }
        },
      })
    ).current;

    const formatTime = (timestamp) => {
      if (!timestamp) return "";
      const messageDate = new Date(timestamp.seconds * 1000);
      return messageDate.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true }).toLowerCase();
    };

    let decryptedText = "";
    if (item.type === "text" && item.text) {
      try {
        decryptedText = AES.decrypt(item.text, SECRET_KEY).toString(enc.Utf8);
        if (!decryptedText) {
          decryptedText = "[Decryption Failed]";
        }
      } catch (error) {
        console.error("Decryption error:", error);
        decryptedText = "[Decryption Failed]";
      }
    }

    if (item.type === "image" && item.isViewOnce) {
      const isViewed = item.viewedBy?.includes(auth.currentUser.uid);
      const canView = !isOwnMessage && !isViewed;

      return (
        <Animated.View style={{ marginVertical: 4, alignSelf: isOwnMessage ? "flex-end" : "flex-start", opacity: fadeAnim, maxWidth: "80%" }}>
          <View
            style={{
              backgroundColor: isOwnMessage ? COLORS.primary : COLORS.surface,
              borderRadius: 16,
              padding: 12,
              borderTopRightRadius: isOwnMessage ? 0 : 16,
              borderTopLeftRadius: isOwnMessage ? 16 : 0,
            }}
          >
            {isOwnMessage ? (
              <View style={{ flexDirection: "row", alignItems: "center", opacity: 0.6 }}>
                <MaterialIcons name="visibility-off" size={24} color={COLORS.textSecondary} />
                <Text style={{ marginLeft: 8, fontSize: 14, fontStyle: "italic", color: COLORS.textSecondary }}>View-once photo sent</Text>
              </View>
            ) : (
              <>
                {!isViewed ? (
                  <TouchableOpacity onPress={handleViewOnceImage} style={{ flexDirection: "row", alignItems: "center" }}>
                    <MaterialIcons name="remove-red-eye" size={24} color={COLORS.textPrimary} />
                    <View style={{ marginLeft: 8 }}>
                      <Text style={{ fontSize: 16, fontWeight: "500", color: COLORS.textPrimary }}>View once</Text>
                      <Text style={{ fontSize: 14, color: COLORS.textSecondary }}>Photo will disappear after viewing</Text>
                    </View>
                  </TouchableOpacity>
                ) : (
                  <View style={{ flexDirection: "row", alignItems: "center", opacity: 0.6 }}>
                    <MaterialIcons name="visibility-off" size={24} color={COLORS.textSecondary} />
                    <Text style={{ marginLeft: 8, fontSize: 14, fontStyle: "italic", color: COLORS.textSecondary }}>Photo opened</Text>
                  </View>
                )}
              </>
            )}
            <View style={{ flexDirection: "row", justifyContent: "flex-end", alignItems: "center", marginTop: 4 }}>
              <Text style={{ fontSize: 12, color: COLORS.textSecondary }}>{formatTime(item.timestamp)}</Text>
              {isOwnMessage && recipientId && (
                <Ionicons
                  name={item.readBy?.[recipientId] ? "checkmark-done" : "checkmark"}
                  size={16}
                  color={item.readBy?.[recipientId] ? COLORS.primary : COLORS.textSecondary}
                  style={{ marginLeft: 4 }}
                />
              )}
            </View>
          </View>
          <FullImageModal
            visible={!!fullImageUri}
            imageUri={fullImageUri}
            onClose={() => setFullImageUri(null)}
            isViewOnce={true}
            onViewOnceClose={handleViewOnceClose}
            hasViewed={hasViewed}
          />
        </Animated.View>
      );
    }

    return (
      <>
        <Animated.View
          {...panResponder.panHandlers}
          style={{ marginVertical: 4, alignSelf: isOwnMessage ? "flex-end" : "flex-start", maxWidth: "80%", transform: [{ translateX }] }}
        >
          <TouchableOpacity
            onLongPress={() => setShowOptions(true)}
            activeOpacity={0.7}
            style={{
              backgroundColor: isOwnMessage ? COLORS.primary : COLORS.surface,
              borderRadius: 16,
              padding: 12,
              borderTopRightRadius: isOwnMessage ? 0 : 16,
              borderTopLeftRadius: isOwnMessage ? 16 : 0,
            }}
          >
            {item.replyTo && (
              <View style={{ borderLeftWidth: 2, borderLeftColor: COLORS.accent, paddingLeft: 8, marginBottom: 8 }}>
                <Text style={{ fontSize: 12, color: COLORS.textSecondary }}>
                  {item.replyTo.sender === auth.currentUser.uid ? "You" : "They"} said:
                </Text>
                <Text style={{ fontSize: 14, color: COLORS.textPrimary, opacity: 0.8 }} numberOfLines={1}>
                  {item.replyTo.type === "text" ? AES.decrypt(item.replyTo.text, SECRET_KEY).toString(enc.Utf8) : "📷 Image"}
                </Text>
              </View>
            )}
            {item.type === "image" && item.fileUrl ? (
              <Animated.View style={{ opacity: fadeAnim }}>
                <TouchableOpacity onPress={handleImageView}>
                  <Image source={{ uri: item.fileUrl }} style={{ width: 192, height: 192, borderRadius: 8, marginBottom: 4 }} resizeMode="cover" />
                </TouchableOpacity>
                {item.caption && <Text style={{ fontSize: 14, color: COLORS.textPrimary, marginTop: 4 }}>{item.caption}</Text>}
              </Animated.View>
            ) : (
              <Text style={{ fontSize: 16, color: COLORS.textPrimary, lineHeight: 22 }}>
                {decryptedText || ""}
                {item.edited && <Text style={{ fontSize: 12, color: COLORS.textSecondary }}>{" (edited)"}</Text>}
              </Text>
            )}
            <View style={{ flexDirection: "row", justifyContent: "flex-end", alignItems: "center", marginTop: 4 }}>
              <Text style={{ fontSize: 12, color: COLORS.textSecondary }}>{timeLeft ? `${timeLeft}m left` : formatTime(item.timestamp)}</Text>
              {isOwnMessage && recipientId && (
                <Ionicons
                  name={item.readBy?.[recipientId] ? "checkmark-done" : "checkmark-done"}
                  size={16}
                  color={item.readBy?.[recipientId] ? COLORS.primary : COLORS.textSecondary}
                  style={{ marginLeft: 4 }}
                />
              )}
            </View>
          </TouchableOpacity>
        </Animated.View>
        <MessageOptionsModal
          visible={showOptions}
          onClose={() => setShowOptions(false)}
          onDelete={handleDelete}
          onEdit={() => setShowEditModal(true)}
          onReply={() => onReply(item)}
          canEdit={item.type !== "image"}
        />
        <EditMessageModal visible={showEditModal} onClose={() => setShowEditModal(false)} onSave={handleEdit} initialText={item.text} />
        <FullImageModal visible={!!fullImageUri} imageUri={fullImageUri} onClose={() => setFullImageUri(null)} />
      </>
    );
  }
);