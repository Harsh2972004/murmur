import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { messageSchema } from "@/schemas/messageSchema";
import { Loader2 } from "lucide-react";
import { useDebounceCallback } from "usehooks-ts";
import { socket } from "@/lib/socket";

type SendMessageBarProps = {
  onSend: (content: string) => void;
  isSending: boolean;
  conversationId: string;
};

type SendMessageFormValues = z.infer<typeof messageSchema>;

const SendMessageBar = ({
  onSend,
  isSending,
  conversationId,
}: SendMessageBarProps) => {
  const form = useForm<SendMessageFormValues>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      content: "",
    },
    mode: "onChange",
  });

  const contentValue = form.watch("content", "");

  const emitStopTyping = useDebounceCallback(() => {
    socket.emit("typing-stop", conversationId);
  }, 2000);

  const handleSend = async (data: SendMessageFormValues) => {
    const trimmedContent = data.content.trim();
    if (!trimmedContent) return;

    socket.emit("typing-stop", conversationId);
    await onSend(trimmedContent);
    form.reset({ content: "" });
  };

  return (
    <form
      onSubmit={form.handleSubmit(handleSend)}
      className="flex items-center gap-2 p-4 border-t bg-background"
    >
      <Controller
        name="content"
        control={form.control}
        render={({ field }) => (
          <Input
            {...field}
            onChange={(e) => {
              field.onChange(e); // preserve existing react-hook-form behavior
              socket.emit("typing-start", conversationId);
              emitStopTyping();
            }}
            type="text"
            placeholder="Type a message..."
            className="flex-1"
            disabled={isSending}
            aria-invalid={!!form.formState.errors.content}
          />
        )}
      />
      <Button
        type="submit"
        disabled={!contentValue.trim() || isSending}
        size="sm"
      >
        {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send"}
      </Button>
    </form>
  );
};

export default SendMessageBar;
