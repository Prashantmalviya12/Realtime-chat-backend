import { Router } from "express";
import { createChatController } from "./chat.controller";
import { asyncHandler } from "../../utils/asyncHandler";

const router = Router();

router.post("/create", asyncHandler(createChatController));

export default router;
