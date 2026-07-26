import { ReactNode } from "react";
import { Avatar, AvatarFallback } from "../ui/avatar";

type ConversationHeaderProps = {
  title: string;
  children?: ReactNode;
  isUserOnline?: boolean;
};

const ConversationHeader = ({
  title,
  children,
  isUserOnline,
}: ConversationHeaderProps) => {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-b">
      <div className="flex items-center gap-3 justify-center">
        <div className="relative">
          <Avatar size="lg">
            <AvatarFallback>{title?.[0]}</AvatarFallback>
          </Avatar>
          {isUserOnline !== undefined && (
            <span
              className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background ${
                isUserOnline ? "bg-green-500" : "bg-gray-400"
              }`}
            />
          )}
        </div>
        <div>
          <h1 className="text-xl font-semibold truncate">{title}</h1>
          {isUserOnline !== undefined && (
            <p className="text-xs text-muted-foreground">
              {isUserOnline ? "Online" : "Offline"}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3">{children}</div>
    </div>
  );
};

export default ConversationHeader;
