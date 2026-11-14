import { z } from "zod";

export const sendMessageSchema = z.object({
  params: z.object({ chatId: z.string().uuid() }),
  body: z.object({
    senderId: z.string().uuid(),
    text: z.string().trim().min(1).max(5000)
  })
});

export const getMessagesSchema = z.object({
  params: z.object({ chatId: z.string().uuid() }),
  query: z.object({
    limit: z.coerce.number().int().min(1).max(100).default(50),
    // Pass the last returned message ID to fetch the next page.
    cursor: z.string().optional()
  })
});

export const readMessageSchema = z.object({
  params: z.object({
    chatId: z.string().uuid(),
    messageId: z.string().min(1)
  }),
  body: z.object({ userId: z.string().uuid() })
});

export const lastSeenSchema = z.object({
  params: z.object({ chatId: z.string().uuid() }),
  body: z.object({
    userId: z.string().uuid(),
    messageId: z.string().min(1)
  })
});
