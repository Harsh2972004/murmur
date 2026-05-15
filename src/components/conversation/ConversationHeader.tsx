import { ReactNode } from "react";

type ConversationHeaderProps = {
  title: string;
  children?: ReactNode;
};

const ConversationHeader = ({ title, children }: ConversationHeaderProps) => {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-b">
      <h1 className="text-xl font-semibold truncate">{title}</h1>
      <div className="flex items-center gap-3">{children}</div>
    </div>
  );
};

export default ConversationHeader;
