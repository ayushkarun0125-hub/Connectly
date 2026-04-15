import { create } from 'zustand'

export const useConnectionStore = create((set) => ({
  status: 'connecting',
  transport: 'unknown',
  setStatus: (status) => set({ status }),
  setTransport: (transport) => set({ transport }),
}))

