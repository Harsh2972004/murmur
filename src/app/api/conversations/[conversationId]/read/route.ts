// route /api/conversations/[conversationId]/read

import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import dbConnect from "@/lib/dbConnect";
import { Conversation } from "@/model/Conversation.model";
import { Message } from "@/model/Message.model";
import { getIO } from "@/socket";
import { getServerSession } from "next-auth";

export const PATCH = async (
  request: Request,
  { params }: { params: Promise<{ conversationId: string }> },
) => {
  const { conversationId } = await params;

  if (!conversationId) {
    return Response.json(
      {
        success: false,
        message: "Conversation ID is required",
      },
      {
        status: 400,
      },
    );
  }

  await dbConnect();

  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return Response.json(
      { success: false, message: "unauthorized" },
      { status: 401 },
    );
  }

  const userId = session.user._id;

  try {
    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return Response.json(
        { success: false, message: "Conversation not found" },
        { status: 404 },
      );
    }

    if (!conversation.participants.some((id) => id.toString() === userId)) {
      return Response.json(
        { success: false, message: "unauthorized" },
        { status: 403 },
      );
    }

    const result = await Message.updateMany(
      { conversationId, senderId: { $ne: userId }, readBy: { $ne: userId } },
      { $addToSet: { readBy: userId } },
    );

    if (result.modifiedCount > 0) {
      getIO()
        .to(conversationId)
        .emit("messages-read", { conversationId, userId });
    }

    return Response.json(
      { success: true, message: "Messages marked read successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error sending message ", error);

    const message =
      error instanceof Error ? error.message : "Internal server error";
    return Response.json(
      {
        success: false,
        message,
      },
      { status: 500 },
    );
  }
};
