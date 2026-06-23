import { ReactNode } from "react";
import { Avatar, AvatarFallback } from "../ui/avatar";

type ConversationHeaderProps = {
  title: string;
  children?: ReactNode;
};

const ConversationHeader = ({ title, children }: ConversationHeaderProps) => {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-b">
      <div className="flex items-center gap-3 justify-center">
        <Avatar size="lg">
          <AvatarFallback>{title?.[0]}</AvatarFallback>
        </Avatar>
        <h1 className="text-xl font-semibold truncate">{title}</h1>
      </div>
      <div className="flex items-center gap-3">{children}</div>
    </div>
  );
};

export default ConversationHeader;
