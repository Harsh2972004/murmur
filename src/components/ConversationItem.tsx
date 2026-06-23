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
  return (
    <Link href={conversationUrl}>
      <div className="flex items-center gap-3 bg-background p-3 hover:bg-accent rounded-lg cursor-pointer">
        <Avatar>
          <AvatarFallback>{displayName?.[0]}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col flex-1 overflow-hidden">
          <span className="font-medium truncate">{displayName}</span>
          <span className="text-sm text-muted-foreground truncate">
            {conversation.lastMessage}
          </span>
        </div>
        <span className="text-xs text-muted-foreground">
          {conversation.lastMessageAt
            ? format(conversation.lastMessageAt, "HH:mm")
            : ""}
        </span>
      </div>
    </Link>
  );
};
