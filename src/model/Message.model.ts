import mongoose, { Types, Schema, Document } from "mongoose";

export interface MessageType extends Document {
  conversationId: Types.ObjectId;
  senderId: Types.ObjectId;
  content: string;
  isAnonymous: boolean;
  readBy: Types.ObjectId[];
  isDeleted: boolean;
  deletedAt: Date | null;
  deletedBy: Types.ObjectId | string | null;
  createdAt: Date;
  updatedAt: Date;
  tempId?: string;
}

const messageSchema: Schema<MessageType> = new Schema(
  {
    conversationId: {
      type: Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    senderId: {
      type: Types.ObjectId,
      ref: "User",
      default: null,
    },
    content: {
      type: String,
      required: true,
    },
    isAnonymous: {
      type: Boolean,
      default: false,
    },
    readBy: {
      type: [{ type: Types.ObjectId, ref: "User" }],
      default: [],
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    deletedBy: {
      type: Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true },
);

messageSchema.index({ conversationId: 1, createdAt: -1 });

messageSchema.index({ senderId: 1 });

export const Message =
  (mongoose.models.Message as mongoose.Model<MessageType>) ||
  mongoose.model<MessageType>("Message", messageSchema);
