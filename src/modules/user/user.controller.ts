import { Request, Response } from "express";
import { listUserChats } from "../chat/chat.service";
import { successResponse } from "../../utils/ApiResponse";

export const listUserChatsController = async (req: Request, res: Response): Promise<void> => {
  const { userId } = req.params;
  const chats = await listUserChats(userId);
  res.status(200).json(successResponse({ chats }, "User chats retrieved successfully"));
};
