"use client";

import { Loader2, X, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import ConversationMessageBubble from "@/components/conversation/ConversationMessageBubble";
import { useConversation } from "@/context/ConversationContext";
import {
  formatMessageTime,
  getDateSeparator,
  groupMessagesByDate,
} from "@/hooks/useConversationMessages";

const ConversationMessages = () => {
  const {
    messages,
    isLoading,
    isLoadingMore,
    sessionUserId,
    isAdmin,
    isSelecting,
    selectedIds,
    exitSelectionMode,
    deleteSelectedMessages,
    messagesContainerRef,
    messagesEndRef,
    handleScroll,
    unreadBoundaryId,
  } = useConversation();

  const groupedMessages = groupMessagesByDate(messages);

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {isSelecting && (
        <div className="flex items-center justify-between px-6 py-2 border-b bg-muted/40">
          <span className="text-sm text-muted-foreground">
            {selectedIds.size} selected
          </span>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="destructive"
              disabled={selectedIds.size === 0}
              onClick={() => deleteSelectedMessages(sessionUserId)}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
            <Button size="sm" variant="ghost" onClick={exitSelectionMode}>
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-6 py-4 space-y-3 no-scrollbar"
      >
        {isLoadingMore && (
          <div className="flex justify-center py-2">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex justify-center items-center h-full">
            <p className="text-muted-foreground text-sm">
              No messages yet. Share your link to get started.
            </p>
          </div>
        ) : (
          groupedMessages.map((group) => (
            <div key={group.date}>
              <div className="flex justify-center my-4">
                <span className="bg-muted px-3 py-1 rounded-full text-xs text-muted-foreground">
                  {getDateSeparator(new Date(group.date))}
                </span>
              </div>

              {group.messages.map((message, index) => {
                const isOwn = message.senderId?.toString() === sessionUserId;
                const messageId = message._id?.toString() ?? "";
                const canDelete = isOwn || isAdmin;
                const isUnreadBoundary =
                  unreadBoundaryId !== null && messageId === unreadBoundaryId;

                return (
                  <div key={messageId || index}>
                    {isUnreadBoundary && (
                      <div className="flex items-center gap-2 my-4">
                        <div className="flex-1 h-px bg-red-300" />
                        <span className="text-xs font-medium text-red-500">
                          New Messages
                        </span>
                        <div className="flex-1 h-px bg-red-300" />
                      </div>
                    )}
                    <ConversationMessageBubble
                      message={message}
                      isOwn={isOwn}
                      canDelete={canDelete}
                      formattedTime={formatMessageTime(
                        new Date(message.createdAt),
                      )}
                    />
                  </div>
                );
              })}
            </div>
          ))
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default ConversationMessages;
