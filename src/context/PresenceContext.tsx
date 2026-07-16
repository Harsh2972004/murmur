"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { socket } from "@/lib/socket";

type PresenceContextValue = {
  onlineUserIds: Set<string>;
  isOnline: (userId: string | undefined) => boolean;
};

const PresenceContext = createContext<PresenceContextValue | null>(null);

export const usePresence = () => {
  const ctx = useContext(PresenceContext);
  if (!ctx) {
    throw new Error("usePresence must be used inside PresenceProvider");
  }
  return ctx;
};

export const PresenceProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const handlePresenceUpdate = ({
      userId,
      online,
    }: {
      userId: string;
      online: boolean;
    }) => {
      setOnlineUserIds((prev) => {
        const next = new Set(prev);
        if (online) {
          next.add(userId);
        } else {
          next.delete(userId);
        }
        return next;
      });
    };

    const handleOnlineFriendsList = (friendIds: string[]) => {
      setOnlineUserIds(new Set(friendIds));
    };

    socket.on("presence-update", handlePresenceUpdate);
    socket.on("online-friends-list", handleOnlineFriendsList);

    // request initial state once connected
    if (socket.connected) {
      socket.emit("get-online-friends");
    } else {
      socket.once("connect", () => {
        socket.emit("get-online-friends");
      });
    }

    return () => {
      socket.off("presence-update", handlePresenceUpdate);
      socket.off("online-friends-list", handleOnlineFriendsList);
    };
  }, []);

  const isOnline = useCallback(
    (userId: string | undefined) => {
      if (!userId) return false;
      return onlineUserIds.has(userId);
    },
    [onlineUserIds],
  );

  return (
    <PresenceContext.Provider value={{ onlineUserIds, isOnline }}>
      {children}
    </PresenceContext.Provider>
  );
};
