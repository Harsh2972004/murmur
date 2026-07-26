import { PopulatedConversation } from "@/types/conversation";
import { create } from "zustand";

interface ConversationStoreType {
  chats: PopulatedConversation[];
  anonymousChats: PopulatedConversation[];
  setChats: (chats: PopulatedConversation[]) => void;
  setAnonymousChats: (anonymousChats: PopulatedConversation[]) => void;
  activeConversationId: string | null;
  setActiveConversationId: (id: string | null) => void;
  incrementUnreadCount: (conversationId: string) => void;
  resetUnreadCount: (conversationId: string) => void;
}

export const useConversationStore = create<ConversationStoreType>((set) => ({
  chats: [],
  anonymousChats: [],
  setChats: (chats) => set({ chats }),
  setAnonymousChats: (anonymousChats) => set({ anonymousChats }),
  activeConversationId: null,
  setActiveConversationId: (id) => set({ activeConversationId: id }),

  incrementUnreadCount: (conversationId) =>
    set((state) => ({
      chats: state.chats.map((c) =>
        c._id.toString() === conversationId
          ? { ...c, unreadCount: (c.unreadCount ?? 0) + 1 }
          : c,
      ),
      anonymousChats: state.anonymousChats.map((c) =>
        c._id.toString() === conversationId
          ? { ...c, unreadCount: (c.unreadCount ?? 0) + 1 }
          : c,
      ),
    })),

  resetUnreadCount: (conversationId) => {
    set((state) => {
      const updated = {
        chats: state.chats.map((c) =>
          c._id.toString() === conversationId ? { ...c, unreadCount: 0 } : c,
        ),
        anonymousChats: state.anonymousChats.map((c) =>
          c._id.toString() === conversationId ? { ...c, unreadCount: 0 } : c,
        ),
      };

      return updated;
    });
  },
}));
