// ═══════════════════════════════════════════════════════════════════════
// UXRay — Mock Authentication Store (Zustand + persist)
// Replaced by NextAuth + Prisma in Phase 8.
// ═══════════════════════════════════════════════════════════════════════

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { MockUser } from '@/lib/types'

// ── Store shape ──────────────────────────────────────────────────────

interface AuthState {
  user: MockUser | null
  isAuthenticated: boolean
  isLoading: boolean
  hasCompletedOnboarding: boolean

  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  completeOnboarding: () => void
}

// ── Mock user factory ────────────────────────────────────────────────

function createMockUser(name: string, email: string): MockUser {
  return {
    id: crypto.randomUUID(),
    name,
    email,
    avatarUrl: `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(name)}&radius=50&backgroundType=gradientLinear`,
    role: 'owner',
  }
}

// ── Simulated network delay ──────────────────────────────────────────

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

// ── Store ────────────────────────────────────────────────────────────

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      hasCompletedOnboarding: false,

      login: async (_email: string, _password: string) => {
        set({ isLoading: true })
        await delay(400)
        const user = createMockUser('Alex Morgan', _email)
        set({ user, isAuthenticated: true, isLoading: false, hasCompletedOnboarding: false })
      },

      register: async (name: string, email: string, _password: string) => {
        set({ isLoading: true })
        await delay(500)
        const user = createMockUser(name, email)
        set({ user, isAuthenticated: true, isLoading: false, hasCompletedOnboarding: false })
      },

      logout: () => {
        set({ user: null, isAuthenticated: false, isLoading: false, hasCompletedOnboarding: false })
      },

      completeOnboarding: () => {
        set({ hasCompletedOnboarding: true })
      },
    }),
    {
      name: 'uxray-auth',
      // Only persist user and onboarding state
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated,
        hasCompletedOnboarding: state.hasCompletedOnboarding 
      }),
    },
  ),
)
