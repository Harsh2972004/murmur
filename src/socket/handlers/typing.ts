import { Server, Socket } from "socket.io";

export const registerTypingHandlers = (socket: Socket, io: Server) => {
  socket.on("typing-start", (conversationId: string) => {
    socket.to(conversationId).emit("user-typing", {
      userId: socket.data.userId,
      conversationId,
    });
  });

  socket.on("typing-stop", (conversationId: string) => {
    socket.to(conversationId).emit("user-stopped-typing", {
      userId: socket.data.userId,
      conversationId,
    });
  });
};
