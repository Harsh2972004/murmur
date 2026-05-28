import dbConnect from "@/lib/dbConnect";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/option";
import { Types } from "mongoose";
import UserModel from "@/model/User.model";
import { addFriendSchema } from "@/schemas/friendSchema";
import * as z from "zod";

export const POST = async (request: Request) => {
  await dbConnect();

  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return Response.json(
      { success: false, message: "unauthorized" },
      { status: 401 },
    );
  }

  const parsed = addFriendSchema.safeParse(await request.json());
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

    user.friends.push(friend._id);
    await user.save();

    return Response.json(
      { message: "Friend added successfully", success: true },
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
