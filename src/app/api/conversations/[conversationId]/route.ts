import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import dbConnect from "@/lib/dbConnect";
import { Conversation } from "@/model/Conversation.model";
import { Types } from "mongoose";
import { getServerSession } from "next-auth";

export const GET = async (
  _request: Request,
  { params }: { params: Promise<{ conversationId: string }> },
) => {
  await dbConnect();

  const { conversationId } = await params;

  if (!conversationId) {
    return Response.json(
      { success: false, message: "Conversation not found" },
      { status: 400 },
    );
  }

  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return Response.json(
      { success: false, message: "Unauthorized" },
      { status: 403 },
    );
  }

  try {
    const userId = new Types.ObjectId(session.user._id);
    const conversation = await Conversation.findById(conversationId).select(
      "type isAcceptingMessages participants name lastMessage lastMessageAt",
    );

    if (!conversation) {
      return Response.json(
        { success: false, message: "Conversation not found" },
        { status: 404 },
      );
    }

    if (
      !conversation.participants.some(
        (id) => id.toString() === userId.toString(),
      )
    ) {
      return Response.json(
        { success: false, message: "Unauthorized" },
        { status: 403 },
      );
    }

    return Response.json({ success: true, conversation }, { status: 200 });
  } catch (error) {
    console.error("Error fetching conversation", error);
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return Response.json({ success: false, message }, { status: 500 });
  }
};
