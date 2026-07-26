"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { socket } from "@/lib/socket";
import { useConversationStore } from "@/store/conversation.store";
import { useSession } from "next-auth/react";
import { PopulatedConversation } from "@/types/conversation";

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
  const { data: session } = useSession();
  const sessionUserId = session?.user?._id ?? "";

  const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(new Set());
  const { incrementUnreadCount, activeConversationId } = useConversationStore();

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

  useEffect(() => {
    const handleGlobalNewMessage = (message: {
      conversationId: string;
      senderId?: string;
    }) => {
      const cId = message.conversationId?.toString();
      if (!cId) return;
      if (message.senderId?.toString() === sessionUserId) return;
      if (cId !== activeConversationId) {
        incrementUnreadCount(cId);
      }
    };

    socket.on("new-message", handleGlobalNewMessage);
    return () => {
      socket.off("new-message", handleGlobalNewMessage);
    };
  }, [sessionUserId, incrementUnreadCount, activeConversationId]);

  useEffect(() => {
    const handleConversationCreated = (conversation: PopulatedConversation) => {
      const store = useConversationStore.getState();

      if (conversation.type === "anonymous") {
        // creator's own client already has it via the create route's
        // response — but guard against duplicates just in case
        const alreadyExists = store.anonymousChats.some(
          (c) => c._id.toString() === conversation._id.toString(),
        );
        if (!alreadyExists) {
          store.setAnonymousChats([conversation, ...store.anonymousChats]);
        }
      } else {
        const alreadyExists = store.chats.some(
          (c) => c._id.toString() === conversation._id.toString(),
        );
        if (!alreadyExists) {
          store.setChats([conversation, ...store.chats]);
        }
      }
    };

    socket.on("conversation-created", handleConversationCreated);
    return () => {
      socket.off("conversation-created", handleConversationCreated);
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
