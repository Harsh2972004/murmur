// src/socket/presence.ts (not under handlers/, since this isn't event-handler wiring — it's shared state)
const onlineUsers = new Map<string, Set<string>>(); // userId -> set of socket ids

export const markUserOnline = (userId: string, socketId: string) => {
  if (!onlineUsers.has(userId)) {
    onlineUsers.set(userId, new Set());
  }
  onlineUsers.get(userId)!.add(socketId);
  return onlineUsers.get(userId)!.size === 1; // true = just went online (first connection)
};

export const markUserOffline = (userId: string, socketId: string) => {
  const sockets = onlineUsers.get(userId);
  if (!sockets) return false;
  sockets.delete(socketId);
  if (sockets.size === 0) {
    onlineUsers.delete(userId);
    return true; // true = just went fully offline (no connections left)
  }
  return false;
};

export const isUserOnline = (userId: string) => onlineUsers.has(userId);
