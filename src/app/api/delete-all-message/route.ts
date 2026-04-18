import dbConnect from "@/lib/dbConnect";
import { getServerSession, User } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/option";
import UserModel from "@/model/User.model";

export const DELETE = async (request: Request) => {
  await dbConnect();

  const session = await getServerSession(authOptions);
  const user: User = session?.user as User;

  if (!session || !session.user || !user._id) {
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

  try {
    await UserModel.updateOne({ _id: user._id }, { $set: { messages: [] } });

    return Response.json(
      {
        success: true,
        message: "All messages were deleted",
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.log("error deleting message", error);
    return Response.json(
      {
        success: false,
        message: "error deleting message",
      },
      {
        status: 500,
      },
    );
  }
};
