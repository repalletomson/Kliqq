const admin = require("firebase-admin");
const { Expo } = require("expo-server-sdk");
const { onDocumentCreated, onDocumentUpdated } = require("firebase-functions/v2/firestore");


admin.initializeApp();
const db = admin.firestore();
const expo = new Expo();


// Notification themes configuration
const NOTIFICATION_THEMES = {
  default: {
    sound: "default",
    priority: "high",
    badge: 1,
    _displayInForeground: true,
    channelId: "default",
  },
  post: {
    color: "#7e22ce",
    icon: "post-icon",
  },
  like: {
    color: "#a855f7",
    icon: "heart-icon",
  },
  comment: {
    color: "#e9d5ff",
    icon: "comment-icon",
  },
  chat: {
    color: "#581c87",
    icon: "chat-icon",
  },
};

/**
 * Creates a formatted notification message
 * @param {string} token - Recipient's push token
 * @param {Object} config - Notification configuration
 * @return {Object} Formatted notification object
 */
function createNotification(token, { title, body, data = {}, theme = "default" }) {
  return {
    to: token,
    ...NOTIFICATION_THEMES.default,
    title,
    body,
    data: {
      ...data,
      theme: NOTIFICATION_THEMES[theme] || NOTIFICATION_THEMES.default,
    },
  };
}

// ================== Post Notifications ==================
exports.handleNewPostNotification = onDocumentCreated(
  "posts/{postId}",
  async (event) => {
    const post = event.data?.data();
    const postId = event.params.postId;

    if (!post || !post.college) {
      return null;
    }

    try {
      const usersSnapshot = await db.collection("users")
        .where("college.name", "==", post.college)
        .get();

      const tokenAnalytics = {
        totalUsers: usersSnapshot.size,
        validTokens: 0,
        missingTokens: 0,
        selfPostSkips: 0,
        invalidTokens: 0,
      };

      const validTokens = [];
      usersSnapshot.forEach((userDoc) => {
        const userData = userDoc.data();
        if (!userData.expoPushToken) {
          tokenAnalytics.missingTokens++;
          return;
        }
        if (userData.userId === post.userId) {
          tokenAnalytics.selfPostSkips++;
          return;
        }
        if (Expo.isExpoPushToken(userData.expoPushToken)) {
          validTokens.push({
            token: userData.expoPushToken,
            userId: userData.userId,
          });
          tokenAnalytics.validTokens++;
        } else {
          tokenAnalytics.invalidTokens++;
        }
      });

      const notifications = validTokens.map((userToken) => ({
        to: userToken.token,
        sound: "default",
        title: "New College Post",
        body: `${post.userName || "Someone"} posted: ${post.content?.substring(0, 100) || "New content"}`,
        data: {
          postId,
          type: "new_post",
        },
      }));

      await db.collection("posts").doc(postId).update({
        notificationSent: true,
        notificationCount: validTokens.length,
        tokenAnalytics,
      });

      if (notifications.length > 0) {
        const chunks = expo.chunkPushNotifications(notifications);
        for (const chunk of chunks) {
          await expo.sendPushNotificationsAsync(chunk);
        }
      }

      return { success: true, ...tokenAnalytics };
    } catch (error) {
      await db.collection("posts").doc(postId).update({
        notificationError: error.toString(),
        notificationSent: false,
      });
      return { success: false, error: error.message };
    }
  },
);

// ================== Like Notifications ==================
exports.handleLikeNotification = onDocumentUpdated(
  "posts/{postId}",
  async (event) => {
    try {
      const postBefore = event.data.before.data();
      const postAfter = event.data.after.data();
      const postId = event.params.postId;

      const newLikes = postAfter.likes || [];
      const oldLikes = postBefore.likes || [];
      if (newLikes.length <= oldLikes.length) return null;

      const newLike = newLikes[newLikes.length - 1];
      if (newLike.userId === postAfter.userId) return null;

      const ownerDoc = await db.collection("users").doc(postAfter.userId).get();
      const ownerToken = ownerDoc.data()?.expoPushToken;

      if (ownerToken && Expo.isExpoPushToken(ownerToken)) {
        const message = createNotification(ownerToken, {
          title: "New Like",
          body: `${newLike.userName} liked your post`,
          data: { postId, type: "like" },
          theme: "like",
        });

        await expo.sendPushNotificationsAsync([message]);
        await db.collection("posts").doc(postId).update({
          lastLikeNotificationSent: admin.firestore.FieldValue.serverTimestamp(),
        });
      }
      return null;
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
);

// ================== Chat Message Handling ==================
exports.onMessageCreate = onDocumentCreated(
  "chats/{chatId}/messages/{messageId}",
  async (event) => {
    try {
      const message = event.data.data();
      const recipientId = message.recipientId;
      const senderId = message.sender;

      const unreadCountRef = db.collection("unreadCounts")
        .doc(recipientId)
        .collection("senders")
        .doc(senderId);

      await unreadCountRef.set(
        {
          count: admin.firestore.FieldValue.increment(1),
          lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true },
              );
    } catch (error) {
      // Silently handle error
    }
  },
);

exports.onMessageRead = onDocumentUpdated(
  "chats/{chatId}/messages/{messageId}",
  async (event) => {
    try {
      const newData = event.data.after.data();
      const oldData = event.data.before.data();
      const recipientId = newData.recipientId;

      if (!oldData.readBy?.[recipientId] && newData.readBy?.[recipientId]) {
        const unreadCountRef = db.collection("unreadCounts")
          .doc(recipientId)
          .collection("senders")
          .doc(newData.sender);

        await unreadCountRef.set(
          {
            count: 0,
            lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
          },
          { merge: true },
        );
      }
    } catch (error) {
      // Silently handle error
    }
  },
);

// ================== Comment/Reply Handling ==================
exports.onCommentCreate = onDocumentCreated(
  "posts/{postId}/comments/{commentId}",
  async (event) => {
    try {
      const comment = event.data.data();
      const { postId } = event.params;

      const postSnap = await db.collection("posts").doc(postId).get();
      const postOwnerId = postSnap.data().uid;

      if (postOwnerId === comment.uid) return;

      await db.collection("notifications").doc(postOwnerId)
        .collection("userNotifications").add({
          type: "comment",
          content: `${comment.userName} commented: ${comment.content.substring(0, 50)}...`,
          postId,
          commentId: event.params.commentId,
          senderId: comment.uid,
          recipientId: postOwnerId,
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
          read: false,
        });

      await db.collection("unreadNotifications").doc(postOwnerId).set(
        { count: admin.firestore.FieldValue.increment(1) },
        { merge: true },
      );
    } catch (error) {
      // Silently handle error
    }
  },
);

exports.onReplyCreate = onDocumentCreated(
  "posts/{postId}/comments/{commentId}/replies/{replyId}",
  async (event) => {
    try {
      const reply = event.data.data();
      const { postId, commentId } = event.params;

      const commentSnap = await db.collection("posts").doc(postId)
        .collection("comments").doc(commentId).get();
      const commentOwnerId = commentSnap.data().uid;

      if (commentOwnerId === reply.uid) return;

      await db.collection("notifications").doc(commentOwnerId)
        .collection("userNotifications").add({
          type: "reply",
          content: `${reply.userName} replied: ${reply.content.substring(0, 50)}...`,
          postId,
          commentId,
          replyId: event.params.replyId,
          senderId: reply.uid,
          recipientId: commentOwnerId,
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
          read: false,
        });

      await db.collection("unreadNotifications").doc(commentOwnerId).set(
        { count: admin.firestore.FieldValue.increment(1) },
        { merge: true },
      );
    } catch (error) {
      // Silently handle error
    }
  },
);

// ================== Notification Read Handling ==================
exports.onNotificationRead = onDocumentUpdated(
  "notifications/{userId}/userNotifications/{notificationId}",
  async (event) => {
    try {
      const newData = event.data.after.data();
      const oldData = event.data.before.data();
      const userId = event.params.userId;

      if (!oldData.read && newData.read) {
        await db.collection("unreadNotifications").doc(userId).set(
          { count: admin.firestore.FieldValue.increment(-1) },
          { merge: true },
        );
      }
    } catch (error) {
      // Silently handle error
    }
  },
);

// ================== Chat Message Notifications ==================
exports.handleChatMessageNotification = onDocumentCreated(
  "chats/{chatId}/messages/{messageId}",
  async (event) => {
    try {
      const message = event.data.data();
      const { chatId } = event.params;

      const chatDoc = await db.collection("chats").doc(chatId).get();
      const participants = chatDoc.data().participants || [];
      const recipientId = participants.find((id) => id !== message.sender);

      if (!recipientId) {
        throw new Error("Recipient not found in chat participants");
      }

      const recipientDoc = await db.collection("users").doc(recipientId).get();
      const recipientToken = recipientDoc.data()?.expoPushToken;


      if (recipientToken && Expo.isExpoPushToken(recipientToken)) {
        const senderDoc = await db.collection("users").doc(message.sender).get();
        const senderName = senderDoc.data().fullName || "Someone";

        await expo.sendPushNotificationsAsync([createNotification(
          recipientToken,
          {
            title: `Message from ${senderName}`,
            body: "Please Click to view message",
            data: {
              chatId,
              messageId: event.params.messageId,
              type: "chat",
            },
            theme: "chat",
          },
        )]);

        await db.collection("chats").doc(chatId)
          .collection("messages").doc(event.params.messageId)
          .update({ notificationSent: true });
      }
      return null;
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
);


