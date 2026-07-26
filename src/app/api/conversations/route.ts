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

  try {
    const userId = new Types.ObjectId(session.user._id);

    const lookupField = {
      $lookup: {
        from: "users",
        localField: "participants",
        foreignField: "_id",
        as: "participants",
        pipeline: [{ $project: { _id: 1, username: 1, avatar: 1 } }],
      },
    };

    const unreadCountLookup = {
      $lookup: {
        from: "messages",
        let: { convId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$conversationId", "$$convId"] },
              senderId: { $ne: userId },
              readBy: { $ne: userId },
              isDeleted: false,
            },
          },
          {
            $count: "count",
          },
        ],
        as: "unreadInfo",
      },
    };

    const addUnreadCountField = {
      $addFields: {
        unreadCount: {
          $ifNull: [{ $arrayElemAt: ["$unreadInfo.count", 0] }, 0],
        },
      },
    };

    const projectField = {
      $project: {
        _id: 1,
        name: 1,
        type: 1,
        lastMessage: 1,
        lastMessageAt: 1,
        participants: 1,
        isAcceptingMessages: 1,
        unreadCount: 1,
      },
    };
    const [chats, anonymousChats] = await Promise.all([
      Conversation.aggregate([
        {
          $match: { participants: userId, type: { $in: ["direct", "group"] } },
        },
        { $sort: { lastMessageAt: -1 } },
        unreadCountLookup,
        addUnreadCountField,
        lookupField,
        projectField,
      ]),
      Conversation.aggregate([
        { $match: { participants: userId, type: "anonymous" } },
        { $sort: { lastMessageAt: -1 } },
        unreadCountLookup,
        addUnreadCountField,
        lookupField,
        projectField,
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
