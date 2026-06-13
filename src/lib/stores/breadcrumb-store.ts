// ═══════════════════════════════════════════════════════════════════════
// UXRay — Breadcrumb Store (Zustand)
// Pages call useBreadcrumbs([...]) on mount to set breadcrumbs.
// ═══════════════════════════════════════════════════════════════════════

import { create } from 'zustand'
import type { BreadcrumbItem } from '@/lib/types'

interface BreadcrumbState {
  items: BreadcrumbItem[]
  setBreadcrumbs: (items: BreadcrumbItem[]) => void
  clearBreadcrumbs: () => void
}

export const useBreadcrumbStore = create<BreadcrumbState>()((set) => ({
  items: [],
  setBreadcrumbs: (items) => set({ items }),
  clearBreadcrumbs: () => set({ items: [] }),
}))
