export interface ApiResponse {
  success: boolean;
  message: string;
  isAcceptingMessages?: boolean;
  messages?: [];
  username?: string;
  conversations?: {
    messages: [];
    anonymous: [];
  };
  hasMore?: boolean;
  nextCursor?: string;
  pendingCount?: number;
}
