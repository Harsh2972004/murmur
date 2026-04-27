import mongoose, { Schema, Document, Types } from "mongoose";

export interface ConversationType extends Document {
  type: "direct" | "group" | "anonymous";
  participants: Types.ObjectId[];
  name?: string;
  adminIds?: Types.ObjectId[];
  lastMessage?: string;
  lastMessageAt?: Date;
  expiresAt?: Date;
  isAccepting?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const conversationSchema: Schema<ConversationType> = new Schema(
  {
    type: {
      type: String,
      enum: ["direct", "group", "anonymous"],
      required: true,
    },
    participants: [
      {
        type: Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    name: {
      type: String,
    },
    adminIds: [
      {
        type: Types.ObjectId,
        ref: "User",
      },
    ],
    lastMessage: {
      type: String,
    },
    lastMessageAt: {
      type: Date,
    },
    expiresAt: {
      type: Date,
    },
    isAccepting: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

conversationSchema.index({ participants: 1 });
conversationSchema.index({ lastMessageAt: -1 });

export const Conversation =
  mongoose.models.Conversation ||
  mongoose.model<ConversationType>("Conversation", conversationSchema);
