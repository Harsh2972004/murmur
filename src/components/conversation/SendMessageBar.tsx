import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

type SendMessageBarProps = {
  onSend: (content: string) => Promise<void>;
  isSending: boolean;
};

const SendMessageBar = ({ onSend, isSending }: SendMessageBarProps) => {
  const [draft, setDraft] = useState("");

  const handleSend = async () => {
    if (!draft.trim()) return;
    await onSend(draft.trim());
    setDraft("");
  };

  return (
    <div className="flex items-center gap-2 p-4 border-t bg-background">
      <input
        type="text"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyUp={(event) => event.key === "Enter" && handleSend()}
        placeholder="Type a message..."
        className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        disabled={isSending}
      />
      <Button
        onClick={handleSend}
        disabled={!draft.trim() || isSending}
        size="sm"
      >
        {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send"}
      </Button>
    </div>
  );
};

export default SendMessageBar;
