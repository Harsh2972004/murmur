import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Copy, Trash } from "lucide-react";

type AnonymousConversationControlsProps = {
  isAccepting: boolean;
  isSwitchLoading: boolean;
  onCopyLink: () => void;
  onToggleAccept: () => void;
  onDeleteAllMessages: () => void;
};

const AnonymousConversationControls = ({
  isAccepting,
  isSwitchLoading,
  onCopyLink,
  onToggleAccept,
  onDeleteAllMessages,
}: AnonymousConversationControlsProps) => {
  return (
    <>
      <Button variant="outline" size="sm" onClick={onCopyLink}>
        <Copy className="h-4 w-4 mr-2" />
        Copy Link
      </Button>

      <div className="flex items-center gap-2">
        <Switch
          checked={isAccepting}
          onCheckedChange={onToggleAccept}
          disabled={isSwitchLoading}
        />
        <span className="text-sm text-muted-foreground">
          {isAccepting ? "Accepting" : "Paused"}
        </span>
      </div>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" size="icon">
            <Trash className="h-4 w-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete all messages?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onDeleteAllMessages}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default AnonymousConversationControls;
