import dbConnect from "@/lib/dbConnect";
import { Conversation } from "@/model/Conversation.model";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/option";
import * as z from "zod";
import { Types } from "mongoose";
import { groupChatSchema } from "@/schemas/conversationSchema";
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

  const parsed = groupChatSchema.safeParse(await request.json());
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

  const { groupName, participants } = parsed.data;

  try {
    const users = await UserModel.distinct("_id", {
      username: { $in: participants },
    });

    if (users.length !== participants.length) {
      return Response.json(
        {
          success: false,
          message: "One or more users not found",
        },
        { status: 404 },
      );
    }

    const conversation = await Conversation.create({
      type: "group",
      name: groupName,
      participants: [...users, userId],
      adminIds: [userId],
    });

    const populatedConversation = await Conversation.findById(conversation._id)
      .populate("participants", "_id username avatar")
      .lean();

    populatedConversation!.participants.forEach((participant: any) => {
      getIO()
        .to(participant._id.toString())
        .emit("conversation-created", populatedConversation);
    });

    return Response.json(
      {
        success: true,
        message: "Group created",
        conversationId: conversation._id,
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
