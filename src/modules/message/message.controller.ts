import { Request, Response } from "express";
import {
  getMessages,
  markMessageRead,
  sendMessage,
  updateLastSeen
} from "./message.service";
import { successResponse } from "../../utils/ApiResponse";

export const sendMessageController = async (req: Request, res: Response): Promise<void> => {
  const { chatId } = req.params;
  // console.log("cha",chatId)
  const { senderId, text } = req.body as { senderId: string; text: string };
  const message = await sendMessage(chatId as string, senderId, text);
  res.status(201).json(successResponse(message, "Message sent successfully"));
};

export const getMessagesController = async (req: Request, res: Response): Promise<void> => {
  const { chatId } = req.params;
  const { limit, cursor, userId } = req.query as {
    limit: string;
    cursor?: string;
    userId?: string;
  };

  // The task does not include auth. For this implementation, provide userId as a query parameter.
  if (!userId) {
    res.status(400).json({ success: false, message: "userId query parameter is required" });
    return;
  }

  const result = await getMessages(chatId as string, userId, Number(limit), cursor);
  res.status(200).json(successResponse(result, "Messages retrieved successfully"));
};

export const markMessageReadController = async (req: Request, res: Response): Promise<void> => {
  const { chatId, messageId } = req.params;
  const { userId } = req.body as { userId: string };
  const result = await markMessageRead(chatId as string, messageId as string, userId);
  res.status(200).json(successResponse(result, "Message marked as read"));
};

export const updateLastSeenController = async (req: Request, res: Response): Promise<void> => {
  const { chatId } = req.params;
  const { userId, messageId } = req.body as { userId: string; messageId: string };
  const result = await updateLastSeen(chatId as string, messageId, userId);
  res.status(200).json(successResponse(result, "Last seen updated successfully"));
};
