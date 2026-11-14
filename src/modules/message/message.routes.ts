import { Router } from "express";
import {
  getMessagesController,
  markMessageReadController,
  sendMessageController,
  updateLastSeenController
} from "./message.controller";
import { asyncHandler } from "../../utils/asyncHandler";

const router = Router();

router.post("/:chatId/message/send", asyncHandler(sendMessageController));
router.get("/:chatId/messages", asyncHandler(getMessagesController));
router.post("/:chatId/message/:messageId/read", asyncHandler(markMessageReadController));
router.post("/:chatId/lastseen", asyncHandler(updateLastSeenController));

export default router;
