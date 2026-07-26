"use client";
import Image from "next/image";
import logo from "../../public/murmur-logo.png";
import {
  Bolt,
  MessageCircle,
  MessageCircleQuestionMark,
  Plus,
  UserRound,
  UserSearch,
} from "lucide-react";
import { Button } from "./ui/button";
import { Dispatch, SetStateAction, useEffect } from "react";
import RailItem from "./iconRail/RailItem";
import { useConversationStore } from "@/store/conversation.store";
import { socket } from "@/lib/socket";
import axios from "axios";
import { useFriendRequestStore } from "@/store/friendRequest.store";

interface props {
  setActiveTab: Dispatch<SetStateAction<string>>;
}

const IconRail = ({ setActiveTab }: props) => {
  const chats = useConversationStore((state) => state.chats);
  const anonymousChats = useConversationStore((state) => state.anonymousChats);

  const pendingCount = useFriendRequestStore((state) => state.pendingCount);
  const setPendingCount = useFriendRequestStore(
    (state) => state.setPendingCount,
  );
  const incrementPendingCount = useFriendRequestStore(
    (state) => state.incrementPendingCount,
  );
  const decrementPendingCount = useFriendRequestStore(
    (state) => state.decrementPendingCount,
  );

  const hasUnreadChats = chats.some((c) => (c.unreadCount ?? 0) > 0);
  const hasUnreadAnonymous = anonymousChats.some(
    (c) => (c.unreadCount ?? 0) > 0,
  );

  // initial fetch — so the dot is correct even if the user never opens Friends
  useEffect(() => {
    axios
      .get<{ pendingCount: number }>("/api/users/friends/request")
      .then((res) => setPendingCount(res.data.pendingCount ?? 0))
      .catch(() => {});
  }, [setPendingCount]);

  // live updates, regardless of which tab is currently open
  useEffect(() => {
    const handleReceived = () => incrementPendingCount();
    const handleResolved = () => decrementPendingCount();

    socket.on("friend-request-received", handleReceived);
    socket.on("friend-request-resolved", handleResolved);

    return () => {
      socket.off("friend-request-received", handleReceived);
      socket.off("friend-request-resolved", handleResolved);
    };
  }, [incrementPendingCount, decrementPendingCount]);

  return (
    <div className="w-26 h-full flex flex-col items-center justify-between bg-background">
      <Image className="w-16 h-16" src={logo} alt="Murmur-logo" />
      {/* settings at bottom */}
      <div className="flex flex-col items-center gap-y-2">
        <RailItem
          reactComponent={<MessageCircle />}
          setActiveTab={setActiveTab}
          tab="chat"
          hasUnread={hasUnreadChats}
        />

        <RailItem
          reactComponent={<MessageCircleQuestionMark />}
          setActiveTab={setActiveTab}
          tab="anonymous"
          hasUnread={hasUnreadAnonymous}
        />
        <RailItem
          reactComponent={<UserSearch />}
          setActiveTab={setActiveTab}
          tab="friends"
          hasUnread={pendingCount > 0}
        />
        <RailItem
          reactComponent={<Plus />}
          setActiveTab={setActiveTab}
          tab="create"
        />
      </div>
      <div className="flex flex-col items-center gap-y-4">
        <Button className={`rounded-full`} variant={"outline"} size={"icon"}>
          <Bolt className="size-4" />
        </Button>
        <Button className="rounded-full" variant={"outline"} size={"icon-lg"}>
          <UserRound className="size-5" />
        </Button>
      </div>
    </div>
  );
};

export default IconRail;
