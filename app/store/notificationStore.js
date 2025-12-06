import { create } from "zustand";

export const useNotificationStore = create((set) => ({
    notifications: [],
    unreadCount: 0,

    addNotification: (data) => 
        set((state) => ({
            notifications: [data, ...state.notifications],
            unreadCount: state.unreadCount + (data.read ? 0 : 1),
        })),

    markAllReadLocal: () =>
        set((state) => ({
            notifications: state.notifications.map((n) => ({ ...n, read: true })),
            unreadCount: 0,
        })),

    markSingleReadLocal: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) => (n._id === id ? { ...n, read: true } : n)),
      unreadCount: state.notifications.filter((n) => !n.read && n._id !== id).length,
    })),
}));