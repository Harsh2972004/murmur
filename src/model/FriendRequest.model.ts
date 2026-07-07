import mongoose, { Document, Schema, Types } from "mongoose";

export interface FriendRequestType extends Document {
  senderId: Types.ObjectId;
  receiverId: Types.ObjectId;
  status: "pending" | "accepted" | "rejected";
  createdAt: Date;
  updatedAt: Date;
}

const FriendRequestSchema: Schema<FriendRequestType> = new Schema(
  {
    senderId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true },
);

// Prevents a duplicate *pending* request from being created between the
// same two people in the same direction. This is a partial index (only
// applies when status === "pending") rather than a blanket unique index on
// {senderId, receiverId} - a blanket index would permanently block a new
// request after the first one is ever rejected, which conflicts with the
// "rejection allows re-requesting later" behavior we want. Once a request
// moves to "accepted" or "rejected", a fresh pending request with the same
// sender/receiver pair is allowed to be created again.
FriendRequestSchema.index(
  { senderId: 1, receiverId: 1 },
  { unique: true, partialFilterExpression: { status: "pending" } },
);

// Fast lookups for "requests sent to me" / "requests I've sent"
FriendRequestSchema.index({ receiverId: 1, status: 1 });
FriendRequestSchema.index({ senderId: 1, status: 1 });

const FriendRequestModel =
  (mongoose.models.FriendRequest as mongoose.Model<FriendRequestType>) ||
  mongoose.model<FriendRequestType>("FriendRequest", FriendRequestSchema);

export default FriendRequestModel;
