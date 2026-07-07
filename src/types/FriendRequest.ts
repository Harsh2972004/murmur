import { FriendRequestType } from "@/model/FriendRequest.model";

export interface ProjectedFriendRequestType extends FriendRequestType {
  senderName: string;
  receiverName: string;
}
