import { z } from "zod";

export const createChatSchema = z.object({
  body: z.object({
    userAId: z.string().uuid(),
    userBId: z.string().uuid()
  }).refine((body) => body.userAId !== body.userBId, {
    message: "A user cannot create a direct chat with themselves"
  })
});

export const chatIdParamSchema = z.object({
  params: z.object({
    chatId: z.string().uuid()
  })
});
