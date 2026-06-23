// src/types/conversation.ts
import { ConversationType } from "@/model/Conversation.model";

export type PopulatedParticipant = {
  _id: string;
  username: string;
  avatar?: string;
};

export type PopulatedConversation = Omit<ConversationType, "participants"> & {
  participants: PopulatedParticipant[];
};
