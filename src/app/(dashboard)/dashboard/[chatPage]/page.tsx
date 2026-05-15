import { MessageCircleHeart } from "lucide-react";
import React from "react";

const Chat = () => {
  return (
    <div className="main-content-area flex items-center justify-center">
      <div className="flex flex-col gap-4 items-center">
        <MessageCircleHeart size={60} />
        <h1 className="text-2xl">Click on a conversation to start chatting.</h1>
      </div>
    </div>
  );
};

export default Chat;
