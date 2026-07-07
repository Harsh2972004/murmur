import dbConnect from "@/lib/dbConnect";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../auth/[...nextauth]/option";
import { Types } from "mongoose";
import UserModel from "@/model/User.model";
import { respondToRequestSchema } from "@/schemas/sendFriendRequestSchema";
import * as z from "zod";
import FriendRequestModel from "@/model/FriendRequest.model";

export const PATCH = async (request: Request) => {
  await dbConnect();

  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return Response.json(
      { success: false, message: "unauthorized" },
      { status: 401 },
    );
  }

  const parsed = respondToRequestSchema.safeParse(await request.json());
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

  const { requestId, action } = parsed.data;

  try {
    const userId = new Types.ObjectId(session.user._id);

    const friendRequest = await FriendRequestModel.findById(requestId);

    if (!friendRequest) {
      return Response.json(
        { success: false, message: "friend request doesn't exist" },
        { status: 404 },
      );
    }
    const isReceiver = friendRequest.receiverId.equals(userId);

    if (!isReceiver) {
      return Response.json(
        { success: false, message: "Cannot accept your own request" },
        { status: 401 },
      );
    }

    if (friendRequest.status !== "pending") {
      return Response.json(
        { success: false, message: "This request has already been resolved" },
        { status: 409 },
      );
    }

    friendRequest.status = action;
    await friendRequest.save();

    if (action === "accepted") {
      await UserModel.bulkWrite([
        {
          updateOne: {
            filter: { _id: friendRequest.senderId },
            update: { $addToSet: { friends: friendRequest.receiverId } },
          },
        },
        {
          updateOne: {
            filter: { _id: friendRequest.receiverId },
            update: { $addToSet: { friends: friendRequest.senderId } },
          },
        },
      ]);

      return Response.json({
        success: true,
        message: "Friend Request accepted",
      });
    }
    return Response.json({
      success: true,
      message: "Friend Request rejected",
    });
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
