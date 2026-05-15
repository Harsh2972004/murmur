import { Loader2 } from "lucide-react";
import type { RefObject } from "react";
import { MessageType } from "@/model/Message.model";
import ConversationMessageBubble from "@/components/conversation/ConversationMessageBubble";
import {
  formatMessageTime,
  getDateSeparator,
  groupMessagesByDate,
} from "@/hooks/useConversationMessages";

type ConversationMessagesProps = {
  messages: MessageType[];
  isLoading: boolean;
  isLoadingMore: boolean;
  sessionUserId: string;
  containerRef: RefObject<HTMLDivElement | null>;
  onScroll: () => void;
  messagesEndRef: RefObject<HTMLDivElement | null>;
};

const ConversationMessages = ({
  messages,
  isLoading,
  isLoadingMore,
  sessionUserId,
  containerRef,
  onScroll,
  messagesEndRef,
}: ConversationMessagesProps) => {
  const groupedMessages = groupMessagesByDate(messages);

  return (
    <div
      ref={containerRef}
      onScroll={onScroll}
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
              return (
                <ConversationMessageBubble
                  key={message._id?.toString() ?? index}
                  message={message}
                  isOwn={isOwn}
                  formattedTime={formatMessageTime(new Date(message.createdAt))}
                />
              );
            })}
          </div>
        ))
      )}

      <div ref={messagesEndRef} />
    </div>
  );
};

export default ConversationMessages;
