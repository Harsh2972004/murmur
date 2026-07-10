import dbConnect from "@/lib/dbConnect";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/option";
import mongoose, { Types } from "mongoose";
import UserModel from "@/model/User.model";

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

    const friends = await UserModel.aggregate([
      { $match: { _id: userId } },
      {
        $lookup: {
          from: "users", // collection name (Mongoose pluralizes model name)
          localField: "friends", // array of ObjectIds on the current user
          foreignField: "_id",
          as: "friendDetails",
        },
      },
      { $unwind: "$friendDetails" },
      {
        $project: {
          _id: 0,
          id: "$friendDetails._id",
          username: "$friendDetails.username",
          email: "$friendDetails.email",
          // add avatar, status, etc. — only what the UI actually needs
        },
      },
    ]);

    return Response.json(
      { message: "Friends fetched successfully", friends, success: true },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching friends", error);
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
