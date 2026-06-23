// src/hooks/useConversationDisplay.ts
import { useSession } from "next-auth/react";
import { PopulatedConversation } from "@/types/conversation";

export const useConversationDisplayName = () => {
  const { data: session } = useSession();
  const currentUserId = session?.user._id;

  const getDisplayName = (conversation: PopulatedConversation): string => {
    if (conversation.type === "direct") {
      const other = conversation.participants.find(
        (p) => p._id.toString() !== currentUserId,
      );
      return other?.username ?? "Unknown";
    }
    return conversation.name ?? "Unnamed";
  };

  return { getDisplayName, currentUserId };
};
