"use client";
import { useMemo } from "react";
import { useParams } from "next/navigation";
import { ConversationItem } from "./ConversationItem";
import { useConversationDisplayName } from "@/hooks/useConversationDisplayName";
import { useConversationStore } from "@/store/conversation.store";

const ConversationList = ({ searchQuery }: { searchQuery: string }) => {
  const { chatPage } = useParams<{ chatPage: string }>();
  const chats = useConversationStore((state) => state.chats);
  const anonymousChats = useConversationStore((state) => state.anonymousChats);
  const { getDisplayName } = useConversationDisplayName();

  const list = chatPage === "anonymous" ? anonymousChats : chats;
  const filter = searchQuery.toLowerCase().trim();

  const filteredList = useMemo(() => {
    if (!filter) {
      return list;
    }

    return list.filter((chat) => {
      const displayName = getDisplayName(chat).toLowerCase();
      const lastMessage = (chat.lastMessage ?? "").toLowerCase();
      const title = (chat.name ?? "").toLowerCase();

      return (
        displayName.includes(filter) ||
        lastMessage.includes(filter) ||
        title.includes(filter)
      );
    });
  }, [filter, getDisplayName, list]);

  return filteredList.map((chat) => (
    <ConversationItem key={chat._id.toString()} conversation={chat} />
  ));
};

export default ConversationList;
