import { Router } from "express";
import { listUserChatsController } from "./user.controller";
import { validate } from "../../middlewares/validate.middleware";
import { userIdParamSchema } from "./user.validation";
import { asyncHandler } from "../../utils/asyncHandler";

const router = Router();

router.get("/:userId/chats", validate(userIdParamSchema), asyncHandler(listUserChatsController));

export default router;
