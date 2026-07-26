import { useCallback, useEffect, useRef, useState } from "react";
import axios, { AxiosError } from "axios";
import { format, isToday, isYesterday } from "date-fns";
import { toast } from "sonner";
import { MessageType } from "@/model/Message.model";
import { ApiResponse } from "@/types/ApiResponse";
import { socket } from "@/lib/socket";
import { Types } from "mongoose";

export type GroupedMessages = {
  date: string;
  messages: MessageType[];
}[];

const formatMessageTime = (date: Date) => {
  if (isToday(date)) {
    return format(date, "HH:mm");
  }

  if (isYesterday(date)) {
    return `Yesterday ${format(date, "HH:mm")}`;
  }

  return format(date, "MMM d, HH:mm");
};

const getDateSeparator = (date: Date) => {
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  return format(date, "MMMM d, yyyy");
};

const groupMessagesByDate = (messages: MessageType[]): GroupedMessages => {
  const groups: GroupedMessages = [];
  let currentDate = "";
  let currentGroup: MessageType[] = [];

  messages.forEach((message) => {
    const messageDate = format(new Date(message.createdAt), "yyyy-MM-dd");
    if (messageDate !== currentDate) {
      if (currentGroup.length > 0) {
        groups.push({ date: currentDate, messages: currentGroup });
      }
      currentDate = messageDate;
      currentGroup = [message];
    } else {
      currentGroup.push(message);
    }
  });

  if (currentGroup.length > 0) {
    groups.push({ date: currentDate, messages: currentGroup });
  }

  return groups;
};

type UseConversationMessagesProps = {
  conversationId: string;
  isAnonymous: boolean;
  messagesContainerRef: React.RefObject<HTMLDivElement | null>;
  sessionUserId: string;
};

export const useConversationMessages = ({
  conversationId,
  isAnonymous,
  messagesContainerRef,
  sessionUserId,
}: UseConversationMessagesProps) => {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isSwitchLoading, setIsSwitchLoading] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [unreadBoundaryId, setUnreadBoundaryId] = useState<string | null>(null);
  const boundaryComputedForRef = useRef<string | null>(null);

  // Multi-select mode for bulk delete, entered via long-press/right-click
  // on a message bubble.
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const fetchMessages = useCallback(
    async (refresh = false) => {
      setIsLoading(true);
      try {
        const response = await axios.get<ApiResponse>(
          `/api/conversations/${conversationId}/messages?limit=20`,
        );

        const fetched: MessageType[] = response.data.messages || [];
        setMessages(response.data.messages || []);
        setHasMore(response.data.hasMore || false);
        setCursor(response.data.nextCursor || null);

        if (boundaryComputedForRef.current !== conversationId) {
          const firstUnread = fetched.find(
            (m) =>
              m.senderId?.toString() !== sessionUserId &&
              !(m.readBy ?? [])
                .map((id) => id.toString())
                .includes(sessionUserId),
          );
          setUnreadBoundaryId(firstUnread ? firstUnread._id.toString() : null);
          boundaryComputedForRef.current = conversationId;
        }

        if (refresh) toast.success("Messages refreshed");
      } catch (error) {
        const axiosError = error as AxiosError<ApiResponse>;
        toast.error(
          axiosError.response?.data.message || "Failed to fetch messages",
        );
      } finally {
        setIsLoading(false);
      }
    },
    [conversationId],
  );

  const fetchMoreMessages = useCallback(async () => {
    if (!hasMore || !cursor || isLoadingMore) return;

    const container = messagesContainerRef.current;
    const prevScrollHeight = container?.scrollHeight || 0;

    setIsLoadingMore(true);
    try {
      const response = await axios.get<ApiResponse>(
        `/api/conversations/${conversationId}/messages?limit=20&cursor=${cursor}`,
      );
      const older = response.data.messages || [];
      setMessages((prev) => [...older, ...prev]);
      setHasMore(response.data.hasMore || false);
      setCursor(response.data.nextCursor || null);

      requestAnimationFrame(() => {
        if (container) {
          container.scrollTop = container.scrollHeight - prevScrollHeight;
        }
      });
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(axiosError.response?.data.message || "Failed to load more");
    } finally {
      setIsLoadingMore(false);
    }
  }, [conversationId, cursor, hasMore, isLoadingMore, messagesContainerRef]);

  const fetchAcceptMessage = useCallback(async () => {
    setIsSwitchLoading(true);
    try {
      const response = await axios.get<{
        success: boolean;
        conversation: { isAcceptingMessages: boolean };
      }>(`/api/conversations/${conversationId}`);
      setIsAccepting(response.data.conversation?.isAcceptingMessages ?? false);
    } catch {
      toast.error("Failed to fetch message settings");
    } finally {
      setIsSwitchLoading(false);
    }
  }, [conversationId]);

  const handleSwitchChange = useCallback(async () => {
    const nextState = !isAccepting;
    try {
      await axios.patch(`/api/conversations/${conversationId}/accept-messages`);
      setIsAccepting(nextState);
      toast.success(`Messages ${nextState ? "enabled" : "paused"}`);
    } catch {
      toast.error("Failed to update settings");
    }
  }, [conversationId, isAccepting]);

  const handleDeleteAllMessages = useCallback(async () => {
    try {
      await axios.delete(
        `/api/conversations/${conversationId}/messages?all=true`,
      );
      setMessages([]);
      toast.success("All messages deleted");
    } catch {
      toast.error("Failed to delete messages");
    }
  }, [conversationId]);

  const sendMessage = useCallback(
    async (content: string) => {
      const trimmed = content.trim();
      if (!trimmed) return;

      setUnreadBoundaryId(null);

      const tempId = crypto.randomUUID();

      const optimisticMessage = {
        _id: tempId,
        tempId,
        conversationId,
        senderId: sessionUserId,
        content: trimmed,
        isAnonymous,
        readBy: [],
        isDeleted: false,
        deletedAt: null,
        deletedBy: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as unknown as MessageType;

      setMessages((prev) => [...prev, optimisticMessage]);
      setIsSending(true);
      try {
        await axios.post(`/api/conversations/${conversationId}/messages`, {
          content: content.trim(),
          tempId,
        });
      } catch (error) {
        const axiosError = error as AxiosError<ApiResponse>;
        toast.error(
          axiosError.response?.data.message || "Failed to send message",
        );
      } finally {
        setIsSending(false);
      }
    },
    [conversationId, sessionUserId, isAnonymous],
  );

  // Optimistically soft-deletes one or more messages: marks them deleted in
  // local state immediately (so the placeholder shows with no delay), then
  // confirms with the server in the background. The server is the source of
  // truth for *which* ids were actually allowed to be deleted (a non-admin
  // selecting someone else's message will have that id silently excluded by
  // the permission check) - so on response, anything NOT in modifiedIds is
  // rolled back to its original content, even on an overall-success
  // response. On a hard failure (network/5xx), every affected message is
  // rolled back.
  const deleteMessages = useCallback(
    async (ids: string[], deletedByUserId: string) => {
      if (!ids.length) return;

      const idSet = new Set(ids);
      let snapshot: MessageType[] = [];

      setMessages((prev) => {
        snapshot = prev;
        return prev.map((message) => {
          const id = message._id?.toString();
          if (!id || !idSet.has(id)) return message;
          return {
            ...message,
            isDeleted: true,
            deletedAt: new Date(),
            deletedBy: deletedByUserId,
            content: "",
          } as MessageType;
        });
      });

      const rollbackIds = (idsToRevert: string[]) => {
        if (!idsToRevert.length) return;
        const revertSet = new Set(idsToRevert);
        setMessages((prev) =>
          prev.map((message) => {
            const id = message._id?.toString();
            if (!id || !revertSet.has(id)) return message;
            const original = snapshot.find((m) => m._id?.toString() === id);
            return original ?? message;
          }),
        );
      };

      setIsDeleting(true);
      try {
        const response = await axios.delete<
          ApiResponse & { modifiedIds?: string[] }
        >(
          `/api/conversations/${conversationId}/messages?messageId=${ids.join(",")}`,
        );

        const modifiedIds = new Set(response.data.modifiedIds ?? []);
        const rejectedIds = ids.filter((id) => !modifiedIds.has(id));

        if (rejectedIds.length) {
          rollbackIds(rejectedIds);
          toast.error(
            rejectedIds.length === ids.length
              ? "You don't have permission to delete that message"
              : "Some messages couldn't be deleted",
          );
        }
      } catch (error) {
        // hard failure - roll back everything we optimistically changed
        rollbackIds(ids);
        const axiosError = error as AxiosError<ApiResponse>;
        toast.error(
          axiosError.response?.data.message || "Failed to delete message",
        );
      } finally {
        setIsDeleting(false);
      }
    },
    [conversationId],
  );

  const enterSelectionMode = useCallback((initialId?: string) => {
    setIsSelecting(true);
    if (initialId) {
      setSelectedIds(new Set([initialId]));
    }
  }, []);

  const exitSelectionMode = useCallback(() => {
    setIsSelecting(false);
    setSelectedIds(new Set());
  }, []);

  const toggleSelected = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const deleteSelectedMessages = useCallback(
    async (deletedByUserId: string) => {
      const ids = Array.from(selectedIds);
      await deleteMessages(ids, deletedByUserId);
      exitSelectionMode();
    },
    [deleteMessages, exitSelectionMode, selectedIds],
  );

  useEffect(() => {
    const handleNewMessage = (message: MessageType & { tempId?: string }) => {
      if (message.conversationId?.toString() !== conversationId) return;

      setMessages((prev) => {
        const existingIndex = prev.findIndex(
          (m) =>
            (message.tempId && m.tempId === message.tempId) ||
            m._id?.toString() === message._id?.toString(),
        );

        if (existingIndex !== -1) {
          const updated = [...prev];
          updated[existingIndex] = message;
          return updated;
        }

        return [...prev, message];
      });

      // if this new message is from someone else, and I'm actively viewing
      // this conversation right now, mark it read immediately
      if (message.senderId?.toString() !== sessionUserId) {
        axios
          .patch(`/api/conversations/${conversationId}/read`)
          .catch(() => {});
      }
    };

    socket.on("new-message", handleNewMessage);

    return () => {
      socket.off("new-message", handleNewMessage);
    };
  }, [conversationId, sessionUserId]);

  useEffect(() => {
    const handleMessagesRead = ({
      conversationId: cId,
      userId,
    }: {
      conversationId: string;
      userId: string;
    }) => {
      console.log("messages-read received:", {
        cId,
        userId,
        currentConversationId: conversationId,
      });
      if (cId !== conversationId) return;

      setMessages((prev) =>
        prev.map((message) => {
          const readByIds = message.readBy?.map((id) => id.toString()) ?? [];
          if (readByIds.includes(userId)) return message;
          return {
            ...message,
            readBy: [...message.readBy, userId as unknown as Types.ObjectId],
          } as MessageType;
        }),
      );
    };

    socket.on("messages-read", handleMessagesRead);

    return () => {
      socket.off("messages-read", handleMessagesRead);
    };
  }, [conversationId]);

  useEffect(() => {
    fetchMessages();
    if (isAnonymous) {
      fetchAcceptMessage();
    }
  }, [fetchAcceptMessage, fetchMessages, isAnonymous]);

  return {
    messages,
    hasMore,
    isLoading,
    isLoadingMore,
    isAccepting,
    isSwitchLoading,
    isSending,
    isDeleting,
    isSelecting,
    selectedIds,
    unreadBoundaryId,
    fetchMoreMessages,
    handleSwitchChange,
    handleDeleteAllMessages,
    sendMessage,
    deleteMessages,
    deleteSelectedMessages,
    enterSelectionMode,
    exitSelectionMode,
    toggleSelected,
    formatMessageTime,
    getDateSeparator,
    groupMessagesByDate,
  };
};

export { formatMessageTime, getDateSeparator, groupMessagesByDate };
