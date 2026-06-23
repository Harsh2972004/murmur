"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Controller, useForm } from "react-hook-form";
import axios, { AxiosError } from "axios";
import { useDebounceCallback } from "usehooks-ts";
import { toast } from "sonner";
import { TabsContent } from "../ui/tabs";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback } from "../ui/avatar";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "../ui/field";
import { useConversationStore } from "@/store/conversation.store";
import { PopulatedConversation } from "@/types/conversation";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

type Friend = {
  id: string;
  username: string;
  email?: string;
};

const createGroupSchema = z.object({
  groupName: z
    .string()
    .min(1, "Group name is required")
    .min(2, "Group name must be at least 2 characters")
    .max(50, "Group name must be no more than 50 characters"),
});

type CreateGroupInput = z.infer<typeof createGroupSchema>;

const CreateGroupContent = () => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [searchInput, setSearchInput] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedFriends, setSelectedFriends] = useState<Set<string>>(
    new Set(),
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const chats = useConversationStore((state) => state.chats);
  const setChats = useConversationStore((state) => state.setChats);
  const router = useRouter();
  const { data: session } = useSession();

  const form = useForm<CreateGroupInput>({
    resolver: zodResolver(createGroupSchema),
    mode: "onChange",
    defaultValues: {
      groupName: "",
    },
  });

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

  const toggleFriendSelection = (friendId: string) => {
    setSelectedFriends((prev) => {
      const updated = new Set(prev);
      if (updated.has(friendId)) {
        updated.delete(friendId);
      } else {
        updated.add(friendId);
      }
      return updated;
    });
  };

  const createGroupChat = async (data: CreateGroupInput) => {
    // Defensive check to ensure we have the required data
    const groupName = data?.groupName?.trim();
    
    if (!groupName || groupName.length < 2) {
      toast.error("Group name must be at least 2 characters");
      return;
    }

    if (selectedFriends.size === 0) {
      toast.error("Please select at least one friend");
      return;
    }

    setIsCreating(true);

    try {
      const selectedFriendIds = Array.from(selectedFriends);
      const selectedFriendObjects = friends.filter((f) =>
        selectedFriendIds.includes(f.id),
      );

      const selectedParticipantUsernames = selectedFriendObjects.map(
        (friend) => friend.username,
      );

      const response = await axios.post<{
        success: boolean;
        conversationId?: string;
        message: string;
      }>("/api/conversations/create/group", {
        groupName: groupName,
        participants: selectedParticipantUsernames,
      });

      if (!response.data.success || !response.data.conversationId) {
        throw new Error(response.data.message || "Unable to create group");
      }

      const currentUser = session?.user;
      const newChat = {
        _id: response.data.conversationId,
        type: "group",
        participants: [
          {
            _id: currentUser?._id ?? "",
            username: currentUser?.username ?? "You",
          },
          ...selectedFriendObjects.map((friend) => ({
            _id: friend.id,
            username: friend.username,
          })),
        ],
        name: groupName,
        lastMessage: undefined,
        lastMessageAt: undefined,
        isAcceptingMessages: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as unknown as PopulatedConversation;

      setChats([newChat, ...chats]);
      router.push(`/dashboard/group/${response.data.conversationId}`);

      toast.success("Group created successfully!");
      form.reset({
        groupName: "",
      });
      setSelectedFriends(new Set());
      setSearchInput("");
      setSearchQuery("");
    } catch (err) {
      const axiosError = err as AxiosError<{ message: string }>;
      const message =
        axiosError.response?.data.message ||
        (err instanceof Error ? err.message : "Failed to create group");
      toast.error("Cannot create group", { description: message });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <TabsContent className="w-full space-y-4" value="create-group">
      <div className="space-y-4">
        <div className="text-center">
          <h1 className="text-lg md:text-xl font-semibold">Create a group</h1>
          <p className="text-sm text-muted-foreground">
            Select friends to add to your group chat.
          </p>
        </div>

        <form onSubmit={form.handleSubmit(createGroupChat)} className="space-y-4">
          <FieldSet>
            <FieldGroup>
              <Controller
                name="groupName"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="groupName">Group Name</FieldLabel>
                    <Input
                      {...field}
                      type="text"
                      aria-invalid={fieldState.invalid}
                      id="groupName"
                      placeholder="Enter group name"
                      disabled={isLoading || isCreating}
                    />
                    <FieldError>{fieldState.error?.message}</FieldError>
                  </Field>
                )}
              />
            </FieldGroup>
          </FieldSet>

          <div className="rounded-lg border border-border bg-background p-4">
            <div className="flex flex-col gap-3 mb-4">
              <div className="flex gap-3 md:flex-row flex-col">
                <Input
                  value={searchInput}
                  onChange={(event) => handleSearchChange(event.target.value)}
                  placeholder="Search friends by username"
                  aria-label="Search friends"
                  className="flex-1"
                  disabled={isLoading || isCreating}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setSearchInput("");
                    setSearchQuery("");
                  }}
                  disabled={isLoading || isCreating}
                  className="w-full md:w-auto"
                >
                  Clear
                </Button>
              </div>
            </div>

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
                  ? "You don't have any friends yet. Add someone to create a group."
                  : "No friends match that search."}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredFriends.map((friend) => (
                  <button
                    key={friend.id}
                    type="button"
                    onClick={() => toggleFriendSelection(friend.id)}
                    className="w-full rounded-xl border border-border bg-muted/50 p-3 text-left transition hover:bg-muted"
                    disabled={isCreating}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative h-5 w-5 shrink-0">
                        <div className="h-5 w-5 rounded-full border-2 border-muted-foreground transition-all" />
                        {selectedFriends.has(friend.id) && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="h-3 w-3 rounded-full bg-primary" />
                          </div>
                        )}
                      </div>
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
                      {selectedFriends.has(friend.id) && (
                        <span className="text-xs font-semibold text-primary">
                          Selected
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                form.reset({
                  groupName: "",
                });
                setSelectedFriends(new Set());
                setSearchInput("");
                setSearchQuery("");
              }}
              disabled={isCreating}
              className="flex-1"
            >
              Reset
            </Button>
            <Button
              type="submit"
              disabled={
                isLoading ||
                isCreating ||
                selectedFriends.size === 0 ||
                !form.formState.isValid ||
                form.watch("groupName").trim().length < 2
              }
              className="flex-1"
            >
              {isCreating
                ? "Creating..."
                : `Create Group (${selectedFriends.size})`}
            </Button>
          </div>
        </form>
      </div>
    </TabsContent>
  );
};

export default CreateGroupContent;
