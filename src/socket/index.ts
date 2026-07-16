// src/socket/index.ts
import { Server as HTTPServer } from "http";
import { Server } from "socket.io";
import { authMiddleware } from "./middleware/auth";
import { registerHandlers } from "./handlers/registerHandlers";
import { isUserOnline, markUserOffline, markUserOnline } from "./presence";
import { getFriendIds } from "@/lib/getFriendsId.ts";
import dbConnect from "@/lib/dbConnect";

declare global {
  var _io: Server | undefined;
}

export const initSocketServer = (httpServer: HTTPServer) => {
  const io = new Server(httpServer, {
    cors: { origin: "*" },
  });

  io.use(authMiddleware);

  io.on("connection", async (socket) => {
    await dbConnect();
    const userId = socket.data.userId;
    socket.join(userId);

    const justCameOnline = markUserOnline(userId, socket.id);
    const friendIds = await getFriendIds(userId);

    if (justCameOnline) {
      const friendIds = await getFriendIds(userId); // DB lookup — you already have this pattern from the friends system
      friendIds.forEach((friendId) => {
        io.to(friendId).emit("presence-update", { userId, online: true });
      });
    }
    socket.on("get-online-friends", () => {
      const onlineFriendIds = friendIds.filter((id) => isUserOnline(id));
      socket.emit("online-friends-list", onlineFriendIds);
    });
    registerHandlers(socket, io);

    socket.on("disconnect", () => {
      const justWentOffline = markUserOffline(userId, socket.id);
      if (justWentOffline) {
        getFriendIds(userId).then((friendIds) => {
          friendIds.forEach((friendId) => {
            io.to(friendId).emit("presence-update", { userId, online: false });
          });
        });
      }
    });
  });

  globalThis._io = io;

  return io;
};

export const getIO = () => {
  if (!globalThis._io) {
    throw new Error("Socket.io not initialized yet");
  }
  return globalThis._io;
};
