import { Transaction, UniqueConstraintError } from "sequelize";
import { sequelize } from "../../config/database";
import { Chat, ChatMember, User } from "../../models";
import { ApiError } from "../../utils/ApiError";

export const createOrGetChat = async (
  userAId: string,
  userBId: string
): Promise<{ chatId: string; created: boolean }> => {
  if (userAId === userBId) {
    throw new ApiError(400, "A user cannot chat with themselves");
  }

  const [firstUserId, secondUserId] = [userAId, userBId].sort();
  const pairKey = `${firstUserId}_${secondUserId}`;

  const users = await User.findAll({
    where: { id: [firstUserId, secondUserId] }
  });

  if (users.length !== 2) {
    throw new ApiError(404, "One or both users were not found");
  }

  const existing = await Chat.findOne({ where: { pairKey } });
  if (existing) {
    return { chatId: existing.id, created: false };
  }

  try {
    const result = await sequelize.transaction(async (transaction: Transaction) => {
      const chat = await Chat.create({ pairKey, type: "direct" }, { transaction });

      await ChatMember.bulkCreate(
        [
          { chatId: chat.id, userId: firstUserId },
          { chatId: chat.id, userId: secondUserId }
        ],
        { transaction }
      );

      return chat;
    });

    return { chatId: result.id, created: true };
  } catch (error) {
    // A concurrent request may have inserted the same unique pairKey first.
    if (error instanceof UniqueConstraintError) {
      const chat = await Chat.findOne({ where: { pairKey } });
      if (chat) return { chatId: chat.id, created: false };
    }
    throw error;
  }
};

export const assertChatMember = async (
  chatId: string,
  userId: string
): Promise<void> => {
  const member = await ChatMember.findOne({ where: { chatId, userId } });
  if (!member) {
    throw new ApiError(403, "User is not a member of this chat");
  }
};

export const listUserChats = async (userId: string) => {
  const user = await User.findByPk(userId);
  if (!user) throw new ApiError(404, "User not found");

  const memberships = await ChatMember.findAll({
    where: { userId },
    include: [
      {
        model: Chat,
        as: "chat",
        include: [
          {
            model: ChatMember,
            as: "members",
            attributes: ["userId", "joinedAt"]
          }
        ]
      }
    ],
    order: [["createdAt", "DESC"]]
  });

  return memberships.map((membership) => {
    const chat = membership.chat;
    if (!chat) return null;

    return {
      chatId: chat.id,
      type: chat.type,
      createdAt: chat.createdAt,
      members: (chat.members || []).map((member:any) => member.userId)
    };
  }).filter((chat) => chat !== null);
};
