import { create } from 'zustand'

interface CaptureDraftItem {
  id: string
  text: string
  createdAt: string
}

interface CaptureState {
  isOpen: boolean
  items: CaptureDraftItem[]
  open: () => void
  close: () => void
  addItem: (text: string) => void
}

export const useCaptureStore = create<CaptureState>((set) => ({
  isOpen: false,
  items: [],
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  addItem: (text) =>
    set((state) => ({
      items: [
        ...state.items,
        { id: crypto.randomUUID(), text, createdAt: new Date().toISOString() },
      ],
    })),
}))
