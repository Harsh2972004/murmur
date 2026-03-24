import { getServerSession, type User } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/option";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User.model";
import mongoose from "mongoose";

export const GET = async (request: Request) => {
  await dbConnect();

  const session = await getServerSession(authOptions);
  const user: User = session?.user as User;

  if (!session || !session.user) {
    return Response.json(
      {
        success: false,
        message: "Not Authenticated",
      },
      {
        status: 401,
      },
    );
  }

  const userId = new mongoose.Types.ObjectId(user._id);

  try {
    const user = await UserModel.aggregate([
      {
        $match: { id: userId },
      },
      { $unwind: "$messages" },
      { $sort: { "messages.createdAt": -1 } },
      { $group: { _id: "$_id", messages: { $push: "$messages" } } },
    ]);

    if (!user || user.length === 0) {
      return Response.json(
        {
          success: false,
          message: "User not authenticated",
        },
        {
          status: 404,
        },
      );
    }

    return Response.json(
      {
        success: true,
        message: user[0].messages,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.log("error getting messages", error);
    return Response.json(
      {
        success: false,
        message: "An unexpected error occurred",
      },
      {
        status: 500,
      },
    );
  }
};
