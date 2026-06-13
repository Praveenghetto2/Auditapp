// ═══════════════════════════════════════════════════════════════════════
// UXRay — Shared TypeScript Types
// ═══════════════════════════════════════════════════════════════════════

import type { LucideIcon } from 'lucide-react'

// ── Auth ─────────────────────────────────────────────────────────────

export interface MockUser {
  id: string
  name: string
  email: string
  avatarUrl: string
  role: 'owner' | 'admin' | 'member' | 'viewer'
}

// ── Navigation ───────────────────────────────────────────────────────

export interface NavItem {
  label: string
  href: string
  icon: LucideIcon
  badge?: number
  children?: NavItem[]
}

// ── Breadcrumbs ──────────────────────────────────────────────────────

export interface BreadcrumbItem {
  label: string
  href?: string
}
