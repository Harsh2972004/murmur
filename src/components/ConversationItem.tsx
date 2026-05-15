"use client";
import { ConversationType } from "@/model/Conversation.model";
import Link from "next/link";
import { useParams } from "next/navigation";

export const ConversationItem = ({
  conversation,
}: {
  conversation: ConversationType;
}) => {
  const { chatPage } = useParams<{ chatPage: string }>();

  const conversationUrl = `/dashboard/${chatPage}/${conversation._id.toString()}`;
  return (
    <Link href={conversationUrl}>
      <div className="flex items-center gap-3 bg-background p-3 hover:bg-accent rounded-lg cursor-pointer">
        {/* <Avatar>
        <AvatarFallback>{conversation.name?.[0]}</AvatarFallback>
      </Avatar> */}
        <div className="flex flex-col flex-1 overflow-hidden">
          <span className="font-medium truncate">{conversation.name}</span>
          <span className="text-sm text-muted-foreground truncate">
            {conversation.lastMessage}
          </span>
        </div>
        <span className="text-xs text-muted-foreground">
          {/* {conversation.lastMessageAt ? 
          format(conversation.lastMessageAt, "HH:mm") : ""} */}
        </span>
      </div>
    </Link>
  );
};
