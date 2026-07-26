"use client";
import { format } from "date-fns";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { PopulatedConversation } from "@/types/conversation";
import { useConversationDisplayName } from "@/hooks/useConversationDisplayName";

export const ConversationItem = ({
  conversation,
}: {
  conversation: PopulatedConversation;
}) => {
  const { chatPage } = useParams<{ chatPage: string }>();

  const { getDisplayName } = useConversationDisplayName();
  const displayName = getDisplayName(conversation);

  const conversationUrl = `/dashboard/${chatPage}/${conversation._id.toString()}`;
  const hasUnread = (conversation.unreadCount ?? 0) > 0;

  return (
    <Link href={conversationUrl}>
      <div className="flex items-center gap-3 bg-background p-3 hover:bg-accent rounded-lg cursor-pointer">
        <Avatar>
          <AvatarFallback>{displayName?.[0]}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col flex-1 overflow-hidden">
          <span
            className={`truncate ${hasUnread ? "font-semibold" : "font-medium"}`}
          >
            {displayName}
          </span>
          <span
            className={`text-sm truncate ${
              hasUnread
                ? "text-foreground font-medium"
                : "text-muted-foreground"
            }`}
          >
            {conversation.lastMessage}
          </span>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="text-xs text-muted-foreground">
            {conversation.lastMessageAt
              ? format(conversation.lastMessageAt, "HH:mm")
              : ""}
          </span>
          {hasUnread && (
            <span className="bg-primary text-primary-foreground text-xs font-medium rounded-full min-w-4.5 h-4.5 px-1 flex items-center justify-center">
              {conversation.unreadCount > 99 ? "99+" : conversation.unreadCount}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};
