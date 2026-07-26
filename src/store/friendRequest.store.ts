import { create } from "zustand";

interface FriendRequestStoreType {
  pendingCount: number;
  setPendingCount: (count: number) => void;
  incrementPendingCount: () => void;
  decrementPendingCount: () => void;
}

export const useFriendRequestStore = create<FriendRequestStoreType>((set) => ({
  pendingCount: 0,
  setPendingCount: (count) => set({ pendingCount: count }),
  incrementPendingCount: () =>
    set((state) => ({ pendingCount: state.pendingCount + 1 })),
  decrementPendingCount: () =>
    set((state) => ({ pendingCount: Math.max(0, state.pendingCount - 1) })),
}));
