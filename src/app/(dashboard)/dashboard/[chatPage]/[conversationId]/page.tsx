"use client";
import { useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useConversationStore } from "@/store/conversation.store";
import ConversationHeader from "@/components/conversation/ConversationHeader";
import AnonymousConversationControls from "@/components/conversation/AnonymousConversationControls";
import ConversationMessages from "@/components/conversation/ConversationMessages";
import SendMessageBar from "@/components/conversation/SendMessageBar";
import { useConversationMessages } from "@/hooks/useConversationMessages";
import { toast } from "sonner";

const ConversationPage = () => {
  const { chatPage, conversationId } = useParams<{
    chatPage: string;
    conversationId: string;
  }>();

  const chats = useConversationStore((state) => state.chats);
  const anonymousChats = useConversationStore((state) => state.anonymousChats);
  const conversations = chatPage === "anonymous" ? anonymousChats : chats;
  const currentConversation = conversations.find(
    (chat) => chat._id.toString() === conversationId,
  );

  const isAnonymousConversation = currentConversation?.type === "anonymous";
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: session } = useSession();

  const {
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
  } = useConversationMessages({
    conversationId,
    isAnonymous: Boolean(isAnonymousConversation),
    messagesContainerRef,
  });

  const sessionUserId = session?.user?._id ?? "";

  const handleScroll = () => {
    const container = messagesContainerRef.current;
    if (!container || !hasMore) return;
    if (container.scrollTop === 0) {
      fetchMoreMessages();
    }
  };

  useEffect(() => {
    if (!isLoading && messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [isLoading, messages.length]);

  const baseUrl =
    typeof window !== "undefined"
      ? `${window.location.protocol}//${window.location.host}`
      : "";
  const shareableLink = `${baseUrl}/${conversationId}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareableLink);
    toast.success("Link copied to clipboard");
  };

  if (!session?.user) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <p className="text-xl">Authenticating...</p>
      </div>
    );
  }

  if (!currentConversation) {
    return (
      <div className="flex flex-col h-full items-center justify-center px-6 text-center">
        <p className="text-sm text-muted-foreground">Conversation not found.</p>
      </div>
    );
  }

  const title =
    currentConversation.name ||
    (currentConversation.type === "direct"
      ? "Direct Message"
      : currentConversation.type === "group"
        ? "Group Chat"
        : "Anonymous Chat");

  return (
    <div className="flex flex-col h-full main-content-area">
      <ConversationHeader title={title}>
        {isAnonymousConversation && (
          <AnonymousConversationControls
            isAccepting={isAccepting}
            isSwitchLoading={isSwitchLoading}
            onCopyLink={copyToClipboard}
            onToggleAccept={handleSwitchChange}
            onDeleteAllMessages={handleDeleteAllMessages}
          />
        )}
      </ConversationHeader>

      <ConversationMessages
        messages={messages}
        isLoading={isLoading}
        isLoadingMore={isLoadingMore}
        sessionUserId={sessionUserId}
        containerRef={messagesContainerRef}
        onScroll={handleScroll}
        messagesEndRef={messagesEndRef}
      />

      {!isAnonymousConversation && (
        <SendMessageBar onSend={sendMessage} isSending={isSending} />
      )}
    </div>
  );
};

export default ConversationPage;
