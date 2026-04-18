import { getServerSession, type User } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/option";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User.model";

export const DELETE = async (
  request: Request,
  { params }: { params: Promise<{ messageId: string }> },
) => {
  const { messageId } = await params;

  if (!messageId) {
    return Response.json(
      {
        success: false,
        message: "Message ID is required",
      },
      {
        status: 400,
      },
    );
  }

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
    const updateResult = await UserModel.updateOne(
      { _id: user._id },
      { $pull: { messages: { _id: messageId } } },
    );

    if (updateResult.modifiedCount == 0) {
      return Response.json(
        {
          success: false,
          message: "Message not found or already deleted.",
        },
        {
          status: 404,
        },
      );
    }

    return Response.json(
      {
        success: true,
        message: "message deleted",
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
