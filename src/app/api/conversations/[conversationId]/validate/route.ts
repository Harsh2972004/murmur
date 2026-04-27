/**
 * GET - Public route for anonymous senders
 * Checks if a conversation is valid, not expired, and accepting messages
 * Used to render the correct UI before showing the send message form
 */

import dbConnect from "@/lib/dbConnect";
import { Conversation } from "@/model/Conversation.model";

export const GET = async (
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

  try {
    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return Response.json(
        { success: false, message: "Conversation not found" },
        { status: 404 },
      );
    }

    if (conversation?.expiresAt && conversation.expiresAt < new Date()) {
      return Response.json(
        { success: false, message: "This link has expired" },
        { status: 410 },
      );
    }

    if (!conversation.isAcceptingMessages) {
      return Response.json(
        {
          success: false,
          message: "This conversation is not accepting messages",
        },
        { status: 403 },
      );
    }

    return Response.json(
      { success: true, message: "Allowed to send message" },
      { status: 200 },
    );
  } catch (error) {
    console.log("Error finding conversation ", error);
    return Response.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 },
    );
  }
};
