import { Request, Response } from "express";
import { createOrGetChat } from "./chat.service";
import { successResponse } from "../../utils/ApiResponse";

export const createChatController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { userAId, userBId } = req.body as {
    userAId: string;
    userBId: string;
  };

  const result = await createOrGetChat(userAId, userBId);
  res.status(result.created ? 201 : 200).json(
    successResponse({ chatId: result.chatId }, result.created ? "Chat created successfully" : "Existing chat found")
  );
};
