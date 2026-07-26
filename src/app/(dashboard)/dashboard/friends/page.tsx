"use client";
import AddFriend from "@/components/create/AddFriend";
import FriendRequests from "@/components/friends/FriendRequests";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFriendRequestStore } from "@/store/friendRequest.store";

const FriendsPage = () => {
  const pendingCount = useFriendRequestStore((state) => state.pendingCount);
  return (
    <Tabs
      className="main-content-area flex items-center justify-center space-y-8"
      defaultValue="add-friend"
    >
      <TabsList className="w-full">
        <TabsTrigger value="add-friend">Add Friend</TabsTrigger>
        <TabsTrigger value="friend-requests">
          Friend Requests{" "}
          {pendingCount > 0 && (
            <span className="absolute top-0 right-1 h-2 w-2 rounded-full bg-red-500" />
          )}
        </TabsTrigger>
      </TabsList>
      <AddFriend />
      <FriendRequests />
    </Tabs>
  );
};

export default FriendsPage;
