import { User } from "./User";
import { Chat } from "./Chat";
import { ChatMember } from "./ChatMember";

User.hasMany(ChatMember, { foreignKey: "userId", as: "memberships" });
ChatMember.belongsTo(User, { foreignKey: "userId", as: "user" });

Chat.hasMany(ChatMember, { foreignKey: "chatId", as: "members" });
ChatMember.belongsTo(Chat, { foreignKey: "chatId", as: "chat" });

export { User, Chat, ChatMember };
