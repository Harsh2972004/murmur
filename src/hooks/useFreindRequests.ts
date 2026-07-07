import { useState, useCallback } from "react";
import axios, { AxiosError } from "axios";
import { toast } from "sonner";
import { ProjectedFriendRequestType } from "@/types/FriendRequest";

export const useFriendRequests = () => {
  const [friendRequests, setFriendRequests] = useState<
    ProjectedFriendRequestType[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isResponding, setIsResponding] = useState<string | null>(null);

  const fetchFriendRequests = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get<{
        success: boolean;
        friendRequests: ProjectedFriendRequestType[];
        message: string;
      }>("/api/users/friends/request");
      setFriendRequests(response.data.friendRequests ?? []);
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      toast.error(
        axiosError.response?.data.message ?? "Failed to fetch friend requests",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Optimistically removes the request from the list immediately on respond,
  // rolls back on failure — same pattern as delete message.
  const respondToRequest = useCallback(
    async (requestId: string, action: "accepted" | "rejected") => {
      const snapshot = friendRequests;

      setFriendRequests((prev) =>
        prev.filter((r) => r._id.toString() !== requestId),
      );
      setIsResponding(requestId);

      try {
        await axios.patch(`/api/users/friends/request/${requestId}`, {
          requestId,
          action,
        });
        toast.success(
          action === "accepted"
            ? "Friend request accepted"
            : "Friend request declined",
        );
      } catch (error) {
        setFriendRequests(snapshot);
        const axiosError = error as AxiosError<{ message: string }>;
        toast.error(
          axiosError.response?.data.message ?? "Failed to respond to request",
        );
      } finally {
        setIsResponding(null);
      }
    },
    [friendRequests],
  );

  return {
    friendRequests,
    isLoading,
    isResponding,
    fetchFriendRequests,
    respondToRequest,
  };
};
