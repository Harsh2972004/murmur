import { PopulatedConversation } from "@/types/conversation";
import { create } from "zustand";

interface ConversationStoreType {
  chats: PopulatedConversation[];
  anonymousChats: PopulatedConversation[];
  setChats: (chats: PopulatedConversation[]) => void;
  setAnonymousChats: (anonymousChats: PopulatedConversation[]) => void;
}

export const useConversationStore = create<ConversationStoreType>((set) => ({
  chats: [],
  anonymousChats: [],
  setChats: (chats) => set({ chats }),
  setAnonymousChats: (anonymousChats) => set({ anonymousChats }),
}));
