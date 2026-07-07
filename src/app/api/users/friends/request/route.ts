import dbConnect from "@/lib/dbConnect";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/option";
import { Types } from "mongoose";
import UserModel from "@/model/User.model";
import { SendFriendRequestSchema } from "@/schemas/sendFriendRequestSchema";
import * as z from "zod";
import FriendRequestModel from "@/model/FriendRequest.model";

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

    const friendRequestQuery = [
      {
        $match: {
          $or: [
            {
              senderId: userId,
              status: "pending",
            },
            {
              receiverId: userId,
              status: "pending",
            },
          ],
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "senderId",
          foreignField: "_id",
          as: "sender",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "receiverId",
          foreignField: "_id",
          as: "receiver",
        },
      },
      {
        $project: {
          _id: 1,
          senderId: 1,
          receiverId: 1,
          status: 1,
          senderName: {
            $arrayElemAt: ["$sender.username", 0],
          },
          receiverName: {
            $arrayElemAt: ["$receiver.username", 0],
          },
          type: {
            $cond: {
              if: { $eq: ["$receiverId", userId] },
              then: "incoming",
              else: "outgoing",
            },
          },
        },
      },
    ];

    const friendRequests =
      await FriendRequestModel.aggregate(friendRequestQuery);

    if (friendRequests.length === 0) {
      return Response.json(
        {
          success: true,
          message: "No friend Requests found.",
        },
        {
          status: 200,
        },
      );
    }

    return Response.json(
      {
        success: true,
        message: "Friend requests fetched successfully.",
        friendRequests,
      },
      { status: 200 },
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

export const POST = async (request: Request) => {
  await dbConnect();

  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return Response.json(
      { success: false, message: "unauthorized" },
      { status: 401 },
    );
  }

  const parsed = SendFriendRequestSchema.safeParse(await request.json());
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

  const { friendName } = parsed.data;

  try {
    const userId = new Types.ObjectId(session.user._id);

    const user = await UserModel.findById(userId);

    if (!user) {
      return Response.json(
        { message: "User doesn't exist", success: false },
        { status: 404 },
      );
    }

    const friend = await UserModel.findOne({ username: friendName });

    if (!friend || !friend.isVerified) {
      return Response.json(
        { message: "User doesn't exist", success: false },
        { status: 404 },
      );
    }

    if (friend._id.equals(userId)) {
      return Response.json(
        { message: "You cannot add yourself as a friend", success: false },
        { status: 400 },
      );
    }

    const alreadyFriend = user.friends?.some((id) => id.equals(friend._id));

    if (alreadyFriend) {
      return Response.json(
        { message: "Already added this friend", success: false },
        { status: 409 },
      );
    }

    const existingFriendRequest = await FriendRequestModel.findOne({
      $or: [
        {
          senderId: userId,
          receiverId: friend._id,
          status: "pending",
        },
        {
          senderId: friend._id,
          receiverId: userId,
          status: "pending",
        },
      ],
    });

    if (existingFriendRequest) {
      const isReversedRequest = existingFriendRequest.senderId.equals(
        friend._id,
      );

      if (isReversedRequest) {
        // auto accepts the request
        await UserModel.bulkWrite([
          {
            updateOne: {
              filter: { _id: userId },
              update: { $addToSet: { friends: friend._id } },
            },
          },
          {
            updateOne: {
              filter: { _id: friend._id },
              update: { $addToSet: { friends: userId } },
            },
          },
        ]);

        existingFriendRequest.status = "accepted";
        await existingFriendRequest.save();

        return Response.json(
          {
            success: true,
            message: "Friend request accepted between both users.",
          },
          {
            status: 200,
          },
        );
      } else {
        return Response.json(
          { success: false, message: "Friend Request already sent" },
          { status: 409 },
        );
      }
    }

    await FriendRequestModel.create({
      senderId: userId,
      receiverId: friend._id,
    });

    return Response.json(
      { success: true, message: "Friend request sent successfully" },
      { status: 200 },
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
