import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import dbConnect from "@/lib/dbConnect";
import { Conversation } from "@/model/Conversation.model";
import { Message } from "@/model/Message.model";
import { Types } from "mongoose";
import { getServerSession } from "next-auth";

export const DELETE = async (
  request: Request,
  { params }: { params: Promise<{ conversationId: string }> },
) => {
  await dbConnect();

  const { conversationId } = await params;
  if (!conversationId) {
    return Response.json(
      {
        success: false,
        message: "Conversation not found",
      },
      {
        status: 400,
      },
    );
  }

  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return Response.json(
      {
        success: false,
        message: "Unauthorized",
      },
      {
        status: 401,
      },
    );
  }
  try {
    const userId = new Types.ObjectId(session.user._id);

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return Response.json(
        { success: false, message: "Conversation not found" },
        {
          status: 404,
        },
      );
    }

    if (conversation.type === "direct") {
      if (
        !conversation.participants.some(
          (id) => id.toString() === userId.toString(),
        )
      ) {
        return Response.json(
          {
            success: false,
            message: "unauthorized",
          },
          {
            status: 403,
          },
        );
      }

      await Conversation.findByIdAndUpdate(conversationId, {
        $pull: { participants: userId },
      });

      const updated = await Conversation.findById(conversationId);
      if (!updated?.participants.length) {
        await Conversation.findByIdAndDelete(conversationId);
        await Message.deleteMany({ conversationId });
      }

      return Response.json(
        {
          success: true,
          message: "conversation deleted successfully",
        },
        {
          status: 200,
        },
      );
    } else {
      if (
        !conversation.adminIds?.some(
          (id) => id.toString() === userId.toString(),
        )
      ) {
        return Response.json(
          {
            success: false,
            message: "unauthorized",
          },
          {
            status: 403,
          },
        );
      }

      await Conversation.findByIdAndDelete(conversationId);
      await Message.deleteMany({ conversationId });

      return Response.json(
        {
          success: true,
          message: "Conversation deleted successfully",
        },
        {
          status: 200,
        },
      );
    }
  } catch (error) {
    console.error("Error deleting conversations ", error);

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
