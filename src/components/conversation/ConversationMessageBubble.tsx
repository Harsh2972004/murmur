"use client";

import { useRef, useState } from "react";
import { Trash2, MoreVertical, CheckCheckIcon } from "lucide-react";
import { MessageType } from "@/model/Message.model";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useConversation } from "@/context/ConversationContext";

type ConversationMessageBubbleProps = {
  message: MessageType;
  isOwn: boolean;
  canDelete: boolean;
  formattedTime: string;
};

const LONG_PRESS_MS = 450;

const ConversationMessageBubble = ({
  message,
  isOwn,
  canDelete,
  formattedTime,
}: ConversationMessageBubbleProps) => {
  const {
    sessionUserId,
    getSenderName,
    isSelecting,
    selectedIds,
    enterSelectionMode,
    toggleSelected,
    deleteMessages,
    otherParticipantId,
  } = useConversation();

  const messageId = message._id?.toString() ?? "";
  const isSelected = selectedIds.has(messageId);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  const isSeenByOther =
    otherParticipantId &&
    message.readBy?.map((id) => id.toString()).includes(otherParticipantId);

  const clearLongPressTimer = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const startLongPress = () => {
    if (!canDelete || message.isDeleted) return;
    clearLongPressTimer();
    longPressTimer.current = setTimeout(() => {
      enterSelectionMode(messageId);
    }, LONG_PRESS_MS);
  };

  const handleContextMenu: React.MouseEventHandler = (e) => {
    if (!canDelete || message.isDeleted) return;
    e.preventDefault();
    enterSelectionMode(messageId);
  };

  const handleBubbleClick = () => {
    if (isSelecting && canDelete) {
      toggleSelected(messageId);
    }
  };

  if (message.isDeleted) {
    const deletedBySelf =
      message.deletedBy?.toString() === message.senderId?.toString();

    let placeholderText: string;
    if (deletedBySelf) {
      const viewerIsDeleter =
        sessionUserId && message.deletedBy?.toString() === sessionUserId;
      placeholderText = viewerIsDeleter
        ? "You deleted this message"
        : `${getSenderName(message.senderId?.toString()) ?? "Someone"} deleted this message`;
    } else {
      placeholderText = "Admin removed this message";
    }

    return (
      <div className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-2`}>
        <div className="max-w-[70%] rounded-2xl px-4 py-2 bg-muted/50 border border-dashed border-muted-foreground/30">
          <p className="text-sm italic text-muted-foreground">
            {placeholderText}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex items-center gap-2 ${isOwn ? "justify-end" : "justify-start"} mb-2`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        clearLongPressTimer();
      }}
    >
      {isSelecting && canDelete && (
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => toggleSelected(messageId)}
          className="shrink-0"
        />
      )}

      <div
        onClick={handleBubbleClick}
        onMouseDown={startLongPress}
        onMouseUp={clearLongPressTimer}
        onTouchStart={startLongPress}
        onTouchEnd={clearLongPressTimer}
        onContextMenu={handleContextMenu}
        className={`relative max-w-[70%] rounded-2xl px-4 py-2 select-none ${
          isSelecting && canDelete ? "cursor-pointer" : ""
        } ${
          isOwn
            ? "bg-primary text-primary-foreground rounded-br-sm"
            : "bg-muted rounded-bl-sm"
        } ${isSelected ? "ring-2 ring-primary" : ""}`}
      >
        <p className="text-sm">{message.content}</p>
        <p
          className={`text-xs mt-1 flex items-center gap-2 ${
            isOwn
              ? "text-primary-foreground/60 text-right"
              : "text-muted-foreground"
          }`}
        >
          {formattedTime}
          {isOwn && (
            <CheckCheckIcon
              className={`${isSeenByOther && "text-blue-600"}`}
              size={14}
            />
          )}
        </p>
      </div>

      {canDelete && !isSelecting && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={`transition-opacity p-1 rounded hover:bg-muted shrink-0 ${
                isHovered ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
              aria-label="Message options"
            >
              <MoreVertical className="h-4 w-4 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align={isOwn ? "end" : "start"}>
            <DropdownMenuItem
              variant="destructive"
              onClick={() => deleteMessages([messageId], sessionUserId)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
};

export default ConversationMessageBubble;
