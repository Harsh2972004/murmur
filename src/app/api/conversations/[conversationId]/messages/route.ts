import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import dbConnect from "@/lib/dbConnect";
import { Conversation } from "@/model/Conversation.model";
import { Message } from "@/model/Message.model";
import { messageSchema } from "@/schemas/messageSchema";
import { Types } from "mongoose";
import { getServerSession } from "next-auth";
import * as z from "zod";

export const POST = async (
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

  const parsed = messageSchema.safeParse(await request.json());
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

  const { content } = parsed.data;

  try {
    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return Response.json(
        { success: false, message: "Conversation not found" },
        { status: 404 },
      );
    }

    if (conversation.type === "anonymous") {
      if (conversation.expiresAt && conversation.expiresAt < new Date()) {
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

      await Message.create({
        conversationId,
        content,
        isAnonymous: true,
      });
    } else {
      const session = await getServerSession(authOptions);
      if (!session?.user) {
        return Response.json(
          { success: false, message: "unauthorized" },
          { status: 401 },
        );
      }
      const senderId = new Types.ObjectId(session.user._id);

      if (
        !conversation.participants.some(
          (id) => id.toString() === senderId.toString(),
        )
      ) {
        return Response.json(
          { success: false, message: "unauthorized" },
          { status: 403 },
        );
      }

      await Message.create({
        conversationId,
        content,
        senderId,
      });
    }

    await Conversation.findByIdAndUpdate(
      {
        _id: conversationId,
        lastMessageAt: { $lt: new Date() },
      },
      {
        lastMessage: content,
        lastMessageAt: new Date(),
      },
    );

    return Response.json(
      { success: true, message: "Message sent successfully" },
      { status: 201 },
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
