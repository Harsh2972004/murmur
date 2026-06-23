"use client";

import { useSession } from "next-auth/react";
import {
  ConversationProvider,
  useConversation,
} from "@/context/ConversationContext";
import ConversationHeader from "@/components/conversation/ConversationHeader";
import AnonymousConversationControls from "@/components/conversation/AnonymousConversationControls";
import ConversationMessages from "@/components/conversation/ConversationMessages";
import SendMessageBar from "@/components/conversation/SendMessageBar";

// Inner component — can safely call useConversation() since it sits inside
// the provider.
const ConversationView = () => {
  const {
    currentConversation,
    title,
    isAnonymousConversation,
    isAccepting,
    isSwitchLoading,
    handleSwitchChange,
    handleDeleteAllMessages,
    copyToClipboard,
    sendMessage,
    isSending,
  } = useConversation();

  if (!currentConversation) {
    return (
      <div className="flex flex-col h-full items-center justify-center px-6 text-center">
        <p className="text-sm text-muted-foreground">Conversation not found.</p>
      </div>
    );
  }

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

      <ConversationMessages />

      {!isAnonymousConversation && (
        <SendMessageBar onSend={sendMessage} isSending={isSending} />
      )}
    </div>
  );
};

// Outer component — sets up the provider, guards auth before rendering
// anything that would call the hook.
const ConversationPage = () => {
  const { data: session } = useSession();

  if (!session?.user) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <p className="text-xl">Authenticating...</p>
      </div>
    );
  }

  return (
    <ConversationProvider>
      <ConversationView />
    </ConversationProvider>
  );
};

export default ConversationPage;
