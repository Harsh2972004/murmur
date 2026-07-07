"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { Loader2, UserCheck, UserX, UserPlus, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFriendRequests } from "@/hooks/useFreindRequests";
import { ProjectedFriendRequestType } from "@/types/FriendRequest";

// ─── Individual request card ────────────────────────────────────────────────

type FriendRequestCardProps = {
  request: ProjectedFriendRequestType;
  currentUserId: string;
  isResponding: boolean;
  onAccept: () => void;
  onReject: () => void;
};

const FriendRequestCard = ({
  request,
  currentUserId,
  isResponding,
  onAccept,
  onReject,
}: FriendRequestCardProps) => {
  const isIncoming = request.receiverId.toString() === currentUserId;

  const initial = isIncoming
    ? request.senderName[0].toUpperCase()
    : request.receiverName[0].toUpperCase();

  const displayName = isIncoming ? request.senderName : request.receiverName;

  const label = isIncoming
    ? "sent you a friend request"
    : "Friend request sent";

  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted/50 transition-colors">
      {/* Avatar */}
      <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold shrink-0">
        {initial}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{displayName}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>

      {/* Actions */}
      {isIncoming ? (
        <div className="flex items-center gap-1.5 shrink-0">
          <Button
            size="sm"
            variant="default"
            className="h-8 px-3"
            disabled={isResponding}
            onClick={onAccept}
          >
            {isResponding ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <UserCheck className="h-3.5 w-3.5" />
            )}
            <span className="ml-1.5">Accept</span>
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-8 px-3"
            disabled={isResponding}
            onClick={onReject}
          >
            <UserX className="h-3.5 w-3.5" />
            <span className="ml-1.5">Decline</span>
          </Button>
        </div>
      ) : (
        <span className="text-xs text-muted-foreground shrink-0">Pending</span>
      )}
    </div>
  );
};

// ─── Empty state ─────────────────────────────────────────────────────────────

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center h-full gap-3 py-16 text-center px-6">
    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
      <UserPlus className="h-5 w-5 text-muted-foreground" />
    </div>
    <div>
      <p className="text-sm font-medium">No pending requests</p>
      <p className="text-xs text-muted-foreground mt-1">
        Friend requests you send and receive will show up here.
      </p>
    </div>
  </div>
);

// ─── Main panel ──────────────────────────────────────────────────────────────

const ActivityPanel = () => {
  const { data: session } = useSession();
  const currentUserId = session?.user?._id ?? "";

  const {
    friendRequests,
    isLoading,
    isResponding,
    fetchFriendRequests,
    respondToRequest,
  } = useFriendRequests();

  useEffect(() => {
    fetchFriendRequests();
  }, [fetchFriendRequests]);

  const incoming = friendRequests.filter(
    (r) => r.receiverId.toString() === currentUserId,
  );
  const outgoing = friendRequests.filter(
    (r) => r.senderId.toString() === currentUserId,
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 px-6 py-4 border-b shrink-0">
        <Bell className="h-4 w-4 text-muted-foreground" />
        <h2 className="text-sm font-semibold">Activity</h2>
        {friendRequests.length > 0 && (
          <span className="ml-auto text-xs bg-primary text-primary-foreground rounded-full px-2 py-0.5">
            {friendRequests.length}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : friendRequests.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="py-2">
            {/* Incoming */}
            {incoming.length > 0 && (
              <section>
                <p className="px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Incoming
                </p>
                {incoming.map((request) => (
                  <FriendRequestCard
                    key={request._id.toString()}
                    request={request}
                    currentUserId={currentUserId}
                    isResponding={isResponding === request._id.toString()}
                    onAccept={() =>
                      respondToRequest(request._id.toString(), "accepted")
                    }
                    onReject={() =>
                      respondToRequest(request._id.toString(), "rejected")
                    }
                  />
                ))}
              </section>
            )}

            {/* Outgoing */}
            {outgoing.length > 0 && (
              <section className={incoming.length > 0 ? "mt-2" : ""}>
                <p className="px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Sent
                </p>
                {outgoing.map((request) => (
                  <FriendRequestCard
                    key={request._id.toString()}
                    request={request}
                    currentUserId={currentUserId}
                    isResponding={isResponding === request._id.toString()}
                    onAccept={() =>
                      respondToRequest(request._id.toString(), "accepted")
                    }
                    onReject={() =>
                      respondToRequest(request._id.toString(), "rejected")
                    }
                  />
                ))}
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityPanel;
