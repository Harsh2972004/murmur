// src/lib/getFriendIds.ts
import UserModel from "@/model/User.model";

export const getFriendIds = async (userId: string): Promise<string[]> => {
  const user = await UserModel.findById(userId).select("friends").lean();
  if (!user?.friends) return [];
  return user.friends.map((id) => id.toString());
};
