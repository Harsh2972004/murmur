import { Conversation } from "@/model/Conversation.model";
import { Server, Socket } from "socket.io";

export const registerConversationHandlers = (socket: Socket, io: Server) => {
  socket.on("join-conversation", async (conversationId: string) => {
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: socket.data.userId,
    });

    if (!conversation) return;

    socket.join(conversationId);

    console.log("conversation ROoms", io.sockets.adapter.rooms);
  });

  socket.on("leave-conversation", (conversationId: string) => {
    socket.leave(conversationId);
  });
};
