import dbConnect from "@/lib/dbConnect";
import { Conversation } from "@/model/Conversation.model";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/option";
import { anonymousChatSchema } from "@/schemas/conversationSchema";
import * as z from "zod";
import { Types } from "mongoose";

export const POST = async (request: Request) => {
  await dbConnect();
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return Response.json(
      { success: false, message: "unauthorized" },
      { status: 401 },
    );
  }

  const userId = new Types.ObjectId(session.user._id);

  const parsed = anonymousChatSchema.safeParse(await request.json());
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

  const { name, expiresAt } = parsed.data;
  try {
    const conversation = await Conversation.create({
      type: "anonymous",
      participants: [userId],
      adminIds: [userId],
      name,
      expiresAt,
    });

    const conversationId = conversation._id;

    return Response.json(
      {
        success: true,
        message: "conversation created successfully",
        shareableLink: `/${conversationId}`,
      },
      {
        status: 201,
      },
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
