import { create } from 'zustand';

interface NotificationState {
  hasUnread: boolean;
  setHasUnread: (value: boolean) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  hasUnread: true, // Default to true for now since there are no actual notifications in the DB yet, to demonstrate the red dot, or we can default to false and let the page update it. User asked to "make it red and the red should show if there a notification", meaning we can assume it starts true for demo purposes, or manage it via state. We will default to true as per request "make it red".
  setHasUnread: (value) => set({ hasUnread: value }),
}));
