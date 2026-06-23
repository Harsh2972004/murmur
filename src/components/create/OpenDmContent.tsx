"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import axios, { AxiosError } from "axios";
import { useDebounceCallback } from "usehooks-ts";
import { toast } from "sonner";
import { TabsContent } from "../ui/tabs";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { useConversationStore } from "@/store/conversation.store";
import { PopulatedConversation } from "@/types/conversation";

type Friend = {
  id: string;
  username: string;
  email?: string;
};

const OpenDmContent = () => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [searchInput, setSearchInput] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isOpening, setIsOpening] = useState<string | null>(null);
  const [error, setError] = useState<string>("");

  const chats = useConversationStore((state) => state.chats);
  const setChats = useConversationStore((state) => state.setChats);
  const router = useRouter();
  const { data: session } = useSession();

  const debouncedSearch = useDebounceCallback((value: string) => {
    setSearchQuery(value.toLowerCase().trim());
  }, 250);

  useEffect(() => {
    const fetchFriends = async () => {
      setIsLoading(true);
      setError("");

      try {
        const response = await axios.get<{
          success: boolean;
          friends: Friend[];
          message: string;
        }>("/api/users/friends");

        if (!response.data.success) {
          throw new Error(response.data.message || "Unable to fetch friends");
        }

        setFriends(response.data.friends || []);
      } catch (err) {
        const axiosError = err as AxiosError<{ message: string }>;
        const message =
          axiosError.response?.data.message ||
          (err instanceof Error ? err.message : "Failed to load friends");
        setError(message);
        toast.error("Could not load friends", { description: message });
      } finally {
        setIsLoading(false);
      }
    };

    fetchFriends();
  }, []);

  const filteredFriends = useMemo(() => {
    if (!searchQuery) {
      return friends;
    }

    return friends.filter((friend) =>
      friend.username.toLowerCase().includes(searchQuery),
    );
  }, [friends, searchQuery]);

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    debouncedSearch(value);
  };

  const openDirectMessage = async (recipientName: string) => {
    setIsOpening(recipientName);

    try {
      const response = await axios.post<{
        success: boolean;
        conversationId?: string;
        message: string;
      }>("/api/conversations/create/direct", { recipientName });

      if (!response.data.success || !response.data.conversationId) {
        throw new Error(response.data.message || "Unable to open conversation");
      }

      const currentUser = session?.user;
      const newChat = {
        _id: response.data.conversationId,
        type: "direct",
        participants: [
          {
            _id: currentUser?._id ?? "",
            username: currentUser?.username ?? "You",
          },
          {
            _id:
              friends.find((friend) => friend.username === recipientName)?.id ??
              "",
            username: recipientName,
          },
        ],
        name: undefined,
        lastMessage: undefined,
        lastMessageAt: undefined,
        isAcceptingMessages: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as unknown as PopulatedConversation;

      const alreadyExists = chats.some(
        (chat) => chat._id.toString() === response.data.conversationId,
      );

      if (!alreadyExists) {
        setChats([newChat, ...chats]);
      }

      router.push(`/dashboard/direct/${response.data.conversationId}`);
    } catch (err) {
      const axiosError = err as AxiosError<{ message: string }>;
      const message =
        axiosError.response?.data.message ||
        (err instanceof Error ? err.message : "Failed to open conversation");
      toast.error("Cannot open conversation", { description: message });
    } finally {
      setIsOpening(null);
    }
  };

  return (
    <TabsContent className="w-full space-y-4" value="open-dm">
      <div className="space-y-4">
        <div className="text-center">
          <h1 className="text-lg md:text-xl font-semibold">
            Open a direct message
          </h1>
          <p className="text-sm text-muted-foreground">
            Select a friend or search by username to start a direct message.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-[1fr_auto]">
          <Input
            value={searchInput}
            onChange={(event) => handleSearchChange(event.target.value)}
            placeholder="Search friends by username"
            aria-label="Search friends"
            className="w-full"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setSearchInput("");
              setSearchQuery("");
            }}
            className="w-full md:w-auto"
          >
            Clear
          </Button>
        </div>

        <div className="rounded-lg border border-border bg-background p-4">
          {isLoading ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              Loading friends...
            </div>
          ) : error ? (
            <div className="py-10 text-center text-sm text-destructive">
              {error}
            </div>
          ) : filteredFriends.length === 0 ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              {friends.length === 0
                ? "You don’t have any friends yet. Add someone to start a DM."
                : "No friends match that search."}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredFriends.map((friend) => (
                <button
                  key={friend.id}
                  type="button"
                  onClick={() => openDirectMessage(friend.username)}
                  className="w-full rounded-xl border border-border bg-muted/50 p-3 text-left transition hover:bg-muted"
                  disabled={Boolean(isOpening) && isOpening !== friend.username}
                >
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>
                        {friend.username?.[0]?.toUpperCase() ?? "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{friend.username}</p>
                      {friend.email ? (
                        <p className="text-sm text-muted-foreground truncate">
                          {friend.email}
                        </p>
                      ) : null}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {isOpening === friend.username ? "Opening..." : "Open DM"}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </TabsContent>
  );
};

export default OpenDmContent;
