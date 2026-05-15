import { MessageType } from "@/model/Message.model";

type ConversationMessageBubbleProps = {
  message: MessageType;
  isOwn: boolean;
  formattedTime: string;
};

const ConversationMessageBubble = ({
  message,
  isOwn,
  formattedTime,
}: ConversationMessageBubbleProps) => {
  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-2`}>
      <div
        className={`max-w-[70%] rounded-2xl px-4 py-2 ${
          isOwn
            ? "bg-primary text-primary-foreground rounded-br-sm"
            : "bg-muted rounded-bl-sm"
        }`}
      >
        <p className="text-sm">{message.content}</p>
        <p
          className={`text-xs mt-1 ${
            isOwn
              ? "text-primary-foreground/60 text-right"
              : "text-muted-foreground"
          }`}
        >
          {formattedTime}
        </p>
      </div>
    </div>
  );
};

export default ConversationMessageBubble;
