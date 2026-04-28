import dbConnect from "@/lib/dbConnect";
import { Conversation } from "@/model/Conversation.model";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/option";
import { Types } from "mongoose";

export const GET = async (request: Request) => {
  await dbConnect();

  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return Response.json(
      { success: false, message: "unauthorized" },
      { status: 401 },
    );
  }

  const userId = new Types.ObjectId(session.user._id);

  try {
    const [chats, anonymousChats] = await Promise.all([
      Conversation.aggregate([
        {
          $match: { participants: userId, type: { $in: ["direct", "group"] } },
        },
        { $sort: { lastMessageAt: -1 } },
      ]),
      Conversation.aggregate([
        { $match: { participants: userId, type: "anonymous" } },
        { $sort: { lastMessageAt: -1 } },
      ]),
    ]);

    return Response.json(
      {
        success: true,
        conversations: {
          messages: chats,
          anonymous: anonymousChats,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching conversations ", error);

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
