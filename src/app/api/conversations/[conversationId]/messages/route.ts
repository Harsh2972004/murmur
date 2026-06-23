import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import dbConnect from "@/lib/dbConnect";
import { Conversation } from "@/model/Conversation.model";
import { Message, MessageType } from "@/model/Message.model";
import { messageSchema } from "@/schemas/messageSchema";
import { QueryFilter, Types } from "mongoose";
import { getServerSession } from "next-auth";
import * as z from "zod";

export const POST = async (
  request: Request,
  { params }: { params: Promise<{ conversationId: string }> },
) => {
  const { conversationId } = await params;

  if (!conversationId) {
    return Response.json(
      {
        success: false,
        message: "Conversation ID is required",
      },
      {
        status: 400,
      },
    );
  }

  await dbConnect();

  const parsed = messageSchema.safeParse(await request.json());
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

  const { content } = parsed.data;

  try {
    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return Response.json(
        { success: false, message: "Conversation not found" },
        { status: 404 },
      );
    }

    if (conversation.type === "anonymous") {
      if (conversation.expiresAt && conversation.expiresAt < new Date()) {
        return Response.json(
          { success: false, message: "This link has expired" },
          { status: 410 },
        );
      }

      if (!conversation.isAcceptingMessages) {
        return Response.json(
          {
            success: false,
            message: "This conversation is not accepting messages",
          },
          { status: 403 },
        );
      }

      await Message.create({
        conversationId,
        content,
        isAnonymous: true,
      });
    } else {
      const session = await getServerSession(authOptions);
      if (!session?.user) {
        return Response.json(
          { success: false, message: "unauthorized" },
          { status: 401 },
        );
      }
      const senderId = new Types.ObjectId(session.user._id);

      if (
        !conversation.participants.some(
          (id) => id.toString() === senderId.toString(),
        )
      ) {
        return Response.json(
          { success: false, message: "unauthorized" },
          { status: 403 },
        );
      }

      await Message.create({
        conversationId,
        content,
        senderId,
      });
    }

    await Conversation.findByIdAndUpdate(
      {
        _id: conversationId,
        lastMessageAt: { $lt: new Date() },
      },
      {
        lastMessage: content,
        lastMessageAt: new Date(),
      },
    );

    return Response.json(
      { success: true, message: "Message sent successfully" },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error sending message ", error);

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

// GET /api/conversations/[conversationId]/messages?cursor=<lastMessageId>&limit=20
export const GET = async (
  request: Request,
  { params }: { params: Promise<{ conversationId: string }> },
) => {
  await dbConnect();
  const { conversationId } = await params;

  if (!conversationId) {
    return Response.json(
      { success: false, message: "Conversation ID is required" },
      { status: 400 },
    );
  }

  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return Response.json(
      { success: false, message: "Unauthorized" },
      { status: 401 },
    );
  }

  const { searchParams } = new URL(request.url);
  const cursor = searchParams.get("cursor");
  const limit = 20;

  try {
    const query: QueryFilter<MessageType> = {
      conversationId: new Types.ObjectId(conversationId),
    };
    const userId = new Types.ObjectId(session.user._id);

    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return Response.json(
        {
          success: false,
          message: "conversation not found",
        },
        { status: 404 },
      );
    }

    if (
      !conversation.participants.some(
        (id) => id.toString() === userId.toString(),
      )
    ) {
      return Response.json(
        {
          success: false,
          message: "unauthorized",
        },
        {
          status: 403,
        },
      );
    }

    if (cursor) {
      query._id = { $lt: new Types.ObjectId(cursor) };
    }

    const messages = await Message.find(query).sort({ _id: -1 }).limit(limit);

    const hasMore = messages.length === limit;

    return Response.json(
      {
        success: true,
        messages: messages.reverse(),
        hasMore,
        nextCursor: hasMore ? messages[0]._id : null,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching messages ", error);

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

// DELETE /api/conversations/[conversationId]/messages?messageId=123
// DELETE /api/conversations/[conversationId]/messages?messageId=123,456,789
// DELETE /api/conversations/[conversationId]/messages?all=true
//
// Soft delete: message documents are kept (so cursor pagination and group
// "X deleted this message" attribution keep working), but content is wiped
// and isDeleted/deletedAt/deletedBy are set. Nothing is ever removed from
// the DB by this route - that's intentional, see Message.model.ts.
export const DELETE = async (
  request: Request,
  { params }: { params: Promise<{ conversationId: string }> },
) => {
  await dbConnect();

  const { conversationId } = await params;
  if (!conversationId) {
    return Response.json(
      { success: false, message: "Conversation ID is required" },
      { status: 400 },
    );
  }

  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return Response.json(
      { success: false, message: "Unauthorized" },
      { status: 401 },
    );
  }

  const { searchParams } = new URL(request.url);
  const messageIds = searchParams.get("messageId")?.split(",") ?? [];
  const all = searchParams.get("all") === "true";

  if (!all && !messageIds.length) {
    return Response.json(
      { success: false, message: "No message IDs provided" },
      { status: 400 },
    );
  }

  try {
    const userId = new Types.ObjectId(session.user._id);

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return Response.json(
        { success: false, message: "Conversation not found" },
        { status: 404 },
      );
    }

    // check user belongs to this conversation
    if (
      !conversation.participants.some(
        (id) => id.toString() === userId.toString(),
      )
    ) {
      return Response.json(
        { success: false, message: "Unauthorized" },
        { status: 403 },
      );
    }

    const isAdmin = conversation.adminIds?.some(
      (id) => id.toString() === userId.toString(),
    );

    const objectIds = messageIds.map((id) => new Types.ObjectId(id));

    const query = all
      ? { conversationId, isDeleted: { $ne: true } }
      : {
          _id: { $in: objectIds },
          conversationId,
          isDeleted: { $ne: true },
        };

    // regular users may only soft-delete their own messages; admins may
    // soft-delete any message in the conversation
    const scopedQuery = isAdmin ? query : { ...query, senderId: userId };

    const softDeleteUpdate = {
      isDeleted: true,
      deletedAt: new Date(),
      deletedBy: userId,
      content: "",
    };

    // Capture which ids actually matched the permission-scoped query BEFORE
    // updating, so we can tell the client exactly what was deleted. This
    // matters because the client sends an optimistic list of ids it *wants*
    // deleted, but only ids that pass the senderId/admin check should ever
    // be confirmed back to it - otherwise the client has no way to know a
    // message it tried to delete was silently skipped by the permission
    // check, and may keep showing it as deleted locally until next refetch.
    const matchedDocs = await Message.find(scopedQuery, { _id: 1 }).lean();
    const modifiedIds = matchedDocs.map((doc) => doc._id.toString());

    const result = await Message.updateMany(scopedQuery, softDeleteUpdate);

    // If the conversation's lastMessage was one of the messages we just
    // deleted, the sidebar preview needs to reflect that instead of
    // showing stale content. Re-derive lastMessage/lastMessageAt from the
    // most recent message (or clear it if the conversation is now empty).
    if (result.modifiedCount > 0) {
      const mostRecent = await Message.findOne({ conversationId })
        .sort({ createdAt: -1 })
        .lean();

      if (mostRecent) {
        await Conversation.findByIdAndUpdate(conversationId, {
          lastMessage: mostRecent.isDeleted
            ? "This message was deleted"
            : mostRecent.content,
          lastMessageAt: mostRecent.createdAt,
        });
      } else {
        await Conversation.findByIdAndUpdate(conversationId, {
          lastMessage: "",
          lastMessageAt: null,
        });
      }
    }

    return Response.json(
      {
        success: true,
        message: "Messages deleted successfully",
        deletedCount: result.modifiedCount,
        modifiedIds,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error deleting messages ", error);
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return Response.json(
      {
        success: false,
        message,
      },
      {
        status: 500,
      },
    );
  }
};
