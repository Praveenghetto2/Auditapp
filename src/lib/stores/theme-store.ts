import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type AppTheme = 'classic-dark' | 'cyberpunk' | 'emerald' | 'amber-warm'

interface ThemeState {
  theme: AppTheme
  setTheme: (theme: AppTheme) => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'classic-dark',
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'uxray-theme',
    }
  )
)
