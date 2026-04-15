import { create } from 'zustand'

export const useUnreadStore = create((set) => ({
  total: 0,
  perRoom: {},
  setUnread: ({ total = 0, perRoom = {} }) => set({ total, perRoom }),
  setRoomUnread: (roomId, unread) =>
    set((state) => {
      const next = { ...state.perRoom, [roomId]: Math.max(0, Number(unread) || 0) }
      const total = Object.values(next).reduce((sum, n) => sum + (Number(n) || 0), 0)
      return { perRoom: next, total }
    }),
}))

