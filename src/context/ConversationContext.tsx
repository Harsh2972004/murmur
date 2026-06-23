"use client";

import {
  createContext,
  useContext,
  useRef,
  useEffect,
  type RefObject,
} from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useConversationStore } from "@/store/conversation.store";
import { useConversationMessages } from "@/hooks/useConversationMessages";
import { useConversationDisplayName } from "@/hooks/useConversationDisplayName";
import { PopulatedConversation } from "@/types/conversation";
import { toast } from "sonner";

// Everything a child component in the conversation tree might need.
// Grouped into logical buckets so it's clear what comes from where.
type ConversationContextValue = {
  // identity
  sessionUserId: string;
  isAdmin: boolean;
  currentConversation: PopulatedConversation | undefined;
  title: string;

  // refs passed to ConversationMessages for scroll behaviour
  messagesContainerRef: RefObject<HTMLDivElement | null>;
  messagesEndRef: RefObject<HTMLDivElement | null>;

  // sender name lookup — keyed by userId string
  getSenderName: (senderId: string | undefined) => string | undefined;

  // anonymous controls
  isAnonymousConversation: boolean;
  isAccepting: boolean;
  isSwitchLoading: boolean;
  handleSwitchChange: () => void;
  handleDeleteAllMessages: () => void;
  copyToClipboard: () => void;

  // messages + pagination
  messages: ReturnType<typeof useConversationMessages>["messages"];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  fetchMoreMessages: () => void;
  handleScroll: () => void;

  // send
  sendMessage: (content: string) => void;
  isSending: boolean;

  // delete + selection
  deleteMessages: (ids: string[], deletedByUserId: string) => Promise<void>;
  deleteSelectedMessages: (deletedByUserId: string) => Promise<void>;
  isDeleting: boolean;
  isSelecting: boolean;
  selectedIds: Set<string>;
  enterSelectionMode: (initialId?: string) => void;
  exitSelectionMode: () => void;
  toggleSelected: (id: string) => void;
};

const ConversationContext = createContext<ConversationContextValue | null>(
  null,
);

export const useConversation = () => {
  const ctx = useContext(ConversationContext);
  if (!ctx) {
    throw new Error("useConversation must be used inside ConversationProvider");
  }
  return ctx;
};

export const ConversationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { chatPage, conversationId } = useParams<{
    chatPage: string;
    conversationId: string;
  }>();

  const { data: session } = useSession();
  const sessionUserId = session?.user?._id ?? "";

  const chats = useConversationStore((state) => state.chats);
  const anonymousChats = useConversationStore((state) => state.anonymousChats);
  const conversations = chatPage === "anonymous" ? anonymousChats : chats;
  const currentConversation = conversations.find(
    (chat) => chat._id.toString() === conversationId,
  );

  const isAnonymousConversation = currentConversation?.type === "anonymous";

  const isAdmin = Boolean(
    currentConversation?.adminIds?.some(
      (id) => id.toString() === sessionUserId,
    ),
  );

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
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
    fetchMoreMessages,
    handleSwitchChange,
    handleDeleteAllMessages,
    sendMessage,
    deleteMessages,
    deleteSelectedMessages,
    enterSelectionMode,
    exitSelectionMode,
    toggleSelected,
  } = useConversationMessages({
    conversationId,
    isAnonymous: Boolean(isAnonymousConversation),
    messagesContainerRef,
  });

  // Scroll to bottom on initial load
  useEffect(() => {
    if (!isLoading && messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [isLoading, messages.length]);

  const handleScroll = () => {
    const container = messagesContainerRef.current;
    if (!container || !hasMore) return;
    if (container.scrollTop === 0) {
      fetchMoreMessages();
    }
  };

  const baseUrl =
    typeof window !== "undefined"
      ? `${window.location.protocol}//${window.location.host}`
      : "";

  const copyToClipboard = () => {
    navigator.clipboard.writeText(`${baseUrl}/${conversationId}`);
    toast.success("Link copied to clipboard");
  };

  const { getDisplayName } = useConversationDisplayName();

  // Sender name lookup: uses the populated participants array already on the
  // conversation object in the store — no extra fetch needed.
  const getSenderName = (senderId: string | undefined) => {
    if (!senderId) return undefined;
    return currentConversation?.participants.find((p) => p._id === senderId)
      ?.username;
  };

  const title = currentConversation
    ? currentConversation.name ||
      getDisplayName(currentConversation) ||
      (currentConversation.type === "direct"
        ? "Direct Message"
        : currentConversation.type === "group"
          ? "Group Chat"
          : "Anonymous Chat")
    : "";

  return (
    <ConversationContext.Provider
      value={{
        sessionUserId,
        isAdmin,
        currentConversation,
        title,
        messagesContainerRef,
        messagesEndRef,
        getSenderName,
        isAnonymousConversation: Boolean(isAnonymousConversation),
        isAccepting,
        isSwitchLoading,
        handleSwitchChange,
        handleDeleteAllMessages,
        copyToClipboard,
        messages,
        isLoading,
        isLoadingMore,
        hasMore,
        fetchMoreMessages,
        handleScroll,
        sendMessage,
        isSending,
        deleteMessages,
        deleteSelectedMessages,
        isDeleting,
        isSelecting,
        selectedIds,
        enterSelectionMode,
        exitSelectionMode,
        toggleSelected,
      }}
    >
      {children}
    </ConversationContext.Provider>
  );
};
