import { useCallback, useEffect, useState } from "react";
import axios, { AxiosError } from "axios";
import { format, isToday, isYesterday } from "date-fns";
import { toast } from "sonner";
import { MessageType } from "@/model/Message.model";
import { ApiResponse } from "@/types/ApiResponse";

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
};

export const useConversationMessages = ({
  conversationId,
  isAnonymous,
  messagesContainerRef,
}: UseConversationMessagesProps) => {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isSwitchLoading, setIsSwitchLoading] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const fetchMessages = useCallback(
    async (refresh = false) => {
      setIsLoading(true);
      try {
        const response = await axios.get<ApiResponse>(
          `/api/conversations/${conversationId}/messages?limit=20`,
        );
        setMessages(response.data.messages || []);
        setHasMore(response.data.hasMore || false);
        setCursor(response.data.nextCursor || null);
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
      if (!content.trim()) return;
      setIsSending(true);
      try {
        await axios.post(`/api/conversations/${conversationId}/messages`, {
          content: content.trim(),
        });
        await fetchMessages(true);
      } catch (error) {
        const axiosError = error as AxiosError<ApiResponse>;
        toast.error(
          axiosError.response?.data.message || "Failed to send message",
        );
      } finally {
        setIsSending(false);
      }
    },
    [conversationId, fetchMessages],
  );

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
    fetchMoreMessages,
    handleSwitchChange,
    handleDeleteAllMessages,
    sendMessage,
    formatMessageTime,
    getDateSeparator,
    groupMessagesByDate,
  };
};

export { formatMessageTime, getDateSeparator, groupMessagesByDate };
