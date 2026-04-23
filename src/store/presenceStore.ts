import { create } from 'zustand';

interface PresenceData {
  isTyping?: boolean;
  online_at?: string;
}

interface PresenceState {
  onlineUsers: Map<string, PresenceData>;
  setOnlineUsers: (users: Map<string, PresenceData>) => void;
  updateUserPresence: (userId: string, data: PresenceData) => void;
}

export const usePresenceStore = create<PresenceState>((set) => ({
  onlineUsers: new Map(),
  setOnlineUsers: (users) => set({ onlineUsers: users }),
  updateUserPresence: (userId, data) => set((state) => {
    const next = new Map(state.onlineUsers);
    next.set(userId, { ...next.get(userId), ...data });
    return { onlineUsers: next };
  }),
}));
