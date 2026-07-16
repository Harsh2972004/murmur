import { Server, Socket } from "socket.io";
import { registerConversationHandlers } from "./conversation";
import { registerTypingHandlers } from "./typing";

export const registerHandlers = (socket: Socket, io: Server) => {
  registerConversationHandlers(socket, io);
  registerTypingHandlers(socket, io);
  // as you add more, they get one line each here:
  // registerTypingHandlers(socket, io);
  // registerPresenceHandlers(socket, io);
};
