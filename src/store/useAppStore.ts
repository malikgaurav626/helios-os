import { create } from 'zustand'

export type Theme = 'light' | 'dark'

interface AppState {
  isBooted: boolean
  theme: 'light' | 'dark'
  activeProjectId: string | null
  viewState: 'desktop' | 'transitioning' | 'project'
  setBooted: (b: boolean) => void
  setTheme: (t: 'light' | 'dark') => void
  enterProject: (id: string) => void
  exitProject: () => void
  setViewState: (v: 'desktop' | 'transitioning' | 'project') => void
}

export const useAppStore = create<AppState>((set) => ({
  isBooted: false,
  theme: 'dark',
  activeProjectId: null,
  viewState: 'desktop',
  setBooted: (b) => set({ isBooted: b }),
  setTheme: (t) => set({ theme: t }),
  enterProject: (id) => set({ activeProjectId: id, viewState: 'transitioning' }),
  exitProject: () => set({ activeProjectId: null, viewState: 'transitioning' }),
  setViewState: (v) => set({ viewState: v }),
}))
