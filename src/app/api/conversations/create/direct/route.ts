import dbConnect from "@/lib/dbConnect";
import { Conversation } from "@/model/Conversation.model";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/option";
import * as z from "zod";
import { Types } from "mongoose";
import { directChatSchema } from "@/schemas/conversationSchema";
import UserModel from "@/model/User.model";
import { getIO } from "@/socket";

export const POST = async (request: Request) => {
  await dbConnect();

  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return Response.json(
      { success: false, message: "unauthorized" },
      { status: 401 },
    );
  }

  const userId = new Types.ObjectId(session.user._id);

  const parsed = directChatSchema.safeParse(await request.json());
  if (!parsed.success) {
    const fieldErrors = z.flattenError(parsed.error).fieldErrors;
    const allErrors = Object.values(fieldErrors).flat();
    return Response.json(
      {
        success: false,
        message:
          allErrors?.length > 0
            ? allErrors?.join(", ")
            : "Invalid Query parameters",
      },
      { status: 400 },
    );
  }

  const { recipientName } = parsed.data;

  try {
    const recipient = await UserModel.findOne({ username: recipientName });

    if (!recipient) {
      return Response.json(
        { message: "Recipient not found", success: false },
        {
          status: 404,
        },
      );
    }

    if (recipient._id.equals(userId)) {
      return Response.json(
        {
          success: false,
          message: "Cannot start a conversation with yourself",
        },
        { status: 400 },
      );
    }

    const existing = await Conversation.findOne({
      type: "direct",
      participants: { $all: [userId, recipient._id], $size: 2 },
    });

    if (existing) {
      return Response.json(
        {
          message: "Opened a direct conversation",
          conversationId: existing._id,
          success: true,
        },
        { status: 200 },
      );
    }

    const directConversation = await Conversation.create({
      type: "direct",
      participants: [userId, recipient._id],
    });

    const populatedConversation = await Conversation.findById(
      directConversation._id,
    )
      .populate("participants", "_id username avatar")
      .lean();

    populatedConversation!.participants.forEach((participant: any) => {
      getIO()
        .to(participant._id.toString())
        .emit("conversation-created", populatedConversation);
    });

    return Response.json(
      {
        message: "opened a direct conversation",
        conversationId: directConversation._id,
        success: true,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating conversation ", error);
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
