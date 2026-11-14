import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model
} from "sequelize";
import { sequelize } from "../config/database";

export class Chat extends Model<
  InferAttributes<Chat>,
  InferCreationAttributes<Chat>
> {
  declare id: CreationOptional<string>;
  declare pairKey: string;
  declare type: CreationOptional<"direct" | "group">;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Chat.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    pairKey: {
      type: DataTypes.STRING(73),
      allowNull: false,
      unique: true
    },
    type: {
      type: DataTypes.ENUM("direct", "group"),
      allowNull: false,
      defaultValue: "direct"
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
  },
  {
    sequelize,
    tableName: "chats"
  }
);
