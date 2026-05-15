import { ConversationType } from "@/model/Conversation.model";
import { create } from "zustand";

interface ConversationStoreType {
  chats: ConversationType[];
  anonymousChats: ConversationType[];
  setChats: (chats: ConversationType[]) => void;
  setAnonymousChats: (anonymousChats: ConversationType[]) => void;
}

export const useConversationStore = create<ConversationStoreType>((set) => ({
  chats: [],
  anonymousChats: [],
  setChats: (chats) => set({ chats }),
  setAnonymousChats: (anonymousChats) => set({ anonymousChats }),
}));
