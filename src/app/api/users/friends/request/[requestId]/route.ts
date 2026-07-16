import dbConnect from "@/lib/dbConnect";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../auth/[...nextauth]/option";
import mongoose, { Types } from "mongoose";
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

    const existing = await FriendRequestModel.findById(requestId);

    if (!existing) {
      return Response.json(
        { success: false, message: "friend request doesn't exist" },
        { status: 404 },
      );
    }

    if (!existing.receiverId.equals(userId)) {
      return Response.json(
        { success: false, message: "Cannot accept your own request" },
        { status: 401 },
      );
    }

    await mongoose.connection.transaction(async (dbSession) => {
      const friendRequest = await FriendRequestModel.findOneAndUpdate(
        { _id: requestId, status: "pending" },
        { status: action },
        { session: dbSession, new: false },
      );

      if (!friendRequest) {
        // We already confirmed it exists above, so this means it was
        // resolved by another request between our check and now
        throw new Error("ALREADY_RESOLVED");
      }

      if (action === "accepted") {
        await UserModel.bulkWrite(
          [
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
          ],
          { session: dbSession },
        );
      }
    });

    return Response.json({
      success: true,
      message:
        action === "accepted"
          ? "Friend Request accepted"
          : "Friend Request rejected",
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
