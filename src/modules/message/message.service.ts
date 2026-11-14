import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { firebaseDB as firestore } from "../../config/firebase";
import { assertChatMember } from "../chat/chat.service";
import { ApiError } from "../../utils/ApiError";

interface MessageDocument {
  senderId: string;
  text: string;
  createdAt: Timestamp;
}

const messagesCollection = (chatId: string) =>
  firestore.collection("chats").doc(chatId).collection("messages");

export const sendMessage = async (
  chatId: string,
  senderId: string,
  text: string
) => {
  await assertChatMember(chatId, senderId);
  

  const messageRef = messagesCollection(chatId).doc();
  const messageData = {
    senderId,
    text,
    createdAt: FieldValue.serverTimestamp()
  };
  console.log("check")

  await messageRef.set(messageData);

  // Keep a small chat-level summary for future chat-list previews.
  await firestore.collection("chats").doc(chatId).set(
    {
      lastMessageId: messageRef.id,
      lastMessageText: text,
      lastMessageSenderId: senderId,
      updatedAt: FieldValue.serverTimestamp()
    },
    { merge: true }
  );

  const saved = await messageRef.get();

  return {
    id: messageRef.id,
    senderId,
    text,
    createdAt: saved.get("createdAt")?.toDate?.().toISOString() ?? null
  };
};

export const getMessages = async (
  chatId: string,
  userId: string,
  limit: number,
  cursor?: string
) => {
  await assertChatMember(chatId, userId);

  let query = messagesCollection(chatId)
    .orderBy("createdAt", "desc")
    .limit(limit);

  if (cursor) {
    const cursorSnapshot = await messagesCollection(chatId).doc(cursor).get();
    if (!cursorSnapshot.exists) throw new ApiError(400, "Invalid message cursor");
    query = query.startAfter(cursorSnapshot);
  }

  const snapshot = await query.get();
  const docs = snapshot.docs;

  const messages = docs.reverse().map((doc) => {
    const data = doc.data() as MessageDocument;
    return {
      id: doc.id,
      senderId: data.senderId,
      text: data.text,
      createdAt: data.createdAt?.toDate?.().toISOString() ?? null
    };
  });

  return {
    messages,
    nextCursor: docs.length === limit ? docs[0]?.id ?? null : null
  };
};

export const markMessageRead = async (
  chatId: string,
  messageId: string,
  userId: string
) => {
  await assertChatMember(chatId, userId);

  const messageRef = messagesCollection(chatId).doc(messageId);
  const message = await messageRef.get();
  if (!message.exists) throw new ApiError(404, "Message not found");

  const receiptRef = messageRef.collection("readReceipts").doc(userId);
  await receiptRef.set(
    {
      userId,
      readAt: FieldValue.serverTimestamp()
    },
    { merge: true }
  );

  return { messageId, userId, read: true };
};

export const updateLastSeen = async (
  chatId: string,
  messageId: string,
  userId: string
) => {
  await assertChatMember(chatId, userId);

  const messageRef = messagesCollection(chatId).doc(messageId);
  const messageSnapshot = await messageRef.get();
  if (!messageSnapshot.exists) throw new ApiError(404, "Message not found");

  const messageData = messageSnapshot.data() as MessageDocument;
  if (!messageData.createdAt) {
    throw new ApiError(409, "Message timestamp is not available yet");
  }

  const lastSeenRef = firestore
    .collection("chats")
    .doc(chatId)
    .collection("lastSeen")
    .doc(userId);

  const current = await lastSeenRef.get();
  if (current.exists) {
    const currentMessageId = current.get("messageId") as string | undefined;
    if (currentMessageId) {
      const currentMessage = await messagesCollection(chatId)
        .doc(currentMessageId)
        .get();

      const currentCreatedAt = currentMessage.get("createdAt") as Timestamp | undefined;
      if (
        currentCreatedAt &&
        messageData.createdAt.toMillis() < currentCreatedAt.toMillis()
      ) {
        throw new ApiError(400, "Last seen cannot move backwards");
      }
    }
  }

  await lastSeenRef.set(
    {
      userId,
      messageId,
      messageCreatedAt: messageData.createdAt,
      updatedAt: FieldValue.serverTimestamp()
    },
    { merge: true }
  );

  return { userId, messageId, updated: true };
};
