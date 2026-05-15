"use client";
import { useParams } from "next/navigation";
import { ConversationItem } from "./ConversationItem";
import { useConversationStore } from "@/store/conversation.store";

const ConversationList = () => {
  const { chatPage } = useParams<{ chatPage: string }>();
  const chats = useConversationStore((state) => state.chats);
  const anonymousChats = useConversationStore((state) => state.anonymousChats);

  const list = chatPage === "anonymous" ? anonymousChats : chats;

  return list.map((chat) => (
    <ConversationItem key={chat._id.toString()} conversation={chat} />
  ));
};

export default ConversationList;
