import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ═══════════════════════════════════════════════════════════════════════
// Checklist Store — Custom audit checklists with built-in templates.
// Uses Zustand + localStorage persist to maintain state across reloads.
// ═══════════════════════════════════════════════════════════════════════

export type ChecklistCategory = 'Usability' | 'Accessibility' | 'Visual' | 'Content' | 'Performance'
export type SeverityWeight = 'critical' | 'serious' | 'minor'

export interface ChecklistItem {
  id: string
  title: string
  description: string
  category: ChecklistCategory
  severityWeight: SeverityWeight
  enabled: boolean
}

export interface Checklist {
  id: string
  name: string
  description: string
  icon: string // emoji
  isBuiltIn: boolean
  items: ChecklistItem[]
  createdAt: string
  updatedAt: string
}

interface ChecklistState {
  checklists: Checklist[]
  // Actions
  addChecklist: (checklist: Omit<Checklist, 'id' | 'createdAt' | 'updatedAt'>) => Checklist
  updateChecklist: (id: string, updates: Partial<Pick<Checklist, 'name' | 'description' | 'icon'>>) => void
  deleteChecklist: (id: string) => void
  duplicateChecklist: (id: string) => Checklist | undefined
  toggleItem: (checklistId: string, itemId: string) => void
  addItem: (checklistId: string, item: Omit<ChecklistItem, 'id'>) => void
  removeItem: (checklistId: string, itemId: string) => void
  updateItem: (checklistId: string, itemId: string, updates: Partial<Omit<ChecklistItem, 'id'>>) => void
  reorderItems: (checklistId: string, fromIndex: number, toIndex: number) => void
  // Selectors
  getChecklist: (id: string) => Checklist | undefined
}

// ─── Built-in Templates ──────────────────────────────────────────────

const WCAG_CHECKLIST: Checklist = {
  id: 'builtin-wcag-22-aa',
  name: 'WCAG 2.2 AA Compliance',
  description: 'Comprehensive accessibility audit based on WCAG 2.2 Level AA success criteria.',
  icon: '♿',
  isBuiltIn: true,
  createdAt: new Date('2024-01-01').toISOString(),
  updatedAt: new Date('2024-01-01').toISOString(),
  items: [
    {
      id: 'wcag-1',
      title: 'Images have descriptive alt text',
      description: 'All informative images include meaningful alternative text. Decorative images use empty alt attributes.',
      category: 'Accessibility',
      severityWeight: 'critical',
      enabled: true,
    },
    {
      id: 'wcag-2',
      title: 'Color contrast meets 4.5:1 ratio',
      description: 'Normal text has a contrast ratio of at least 4.5:1 against its background. Large text meets 3:1.',
      category: 'Accessibility',
      severityWeight: 'critical',
      enabled: true,
    },
    {
      id: 'wcag-3',
      title: 'Full keyboard navigation support',
      description: 'All interactive elements can be reached and operated using only the keyboard (Tab, Enter, Space, Arrows).',
      category: 'Accessibility',
      severityWeight: 'critical',
      enabled: true,
    },
    {
      id: 'wcag-4',
      title: 'Visible focus indicators on all controls',
      description: 'Interactive elements display a clearly visible focus ring or outline when focused via keyboard.',
      category: 'Accessibility',
      severityWeight: 'serious',
      enabled: true,
    },
    {
      id: 'wcag-5',
      title: 'Form inputs have associated labels',
      description: 'Every form field has a programmatically associated label using <label>, aria-label, or aria-labelledby.',
      category: 'Accessibility',
      severityWeight: 'serious',
      enabled: true,
    },
    {
      id: 'wcag-6',
      title: 'Proper heading hierarchy (h1-h6)',
      description: 'Page uses a logical heading structure without skipping levels. Each page has exactly one h1.',
      category: 'Content',
      severityWeight: 'serious',
      enabled: true,
    },
    {
      id: 'wcag-7',
      title: 'ARIA landmarks and roles are correct',
      description: 'Semantic HTML or ARIA roles define page regions (nav, main, aside, footer). No misused ARIA attributes.',
      category: 'Accessibility',
      severityWeight: 'minor',
      enabled: true,
    },
    {
      id: 'wcag-8',
      title: 'Content reflows at 320px without horizontal scroll',
      description: 'Page adapts to small viewports (320 CSS pixels) without requiring two-dimensional scrolling.',
      category: 'Accessibility',
      severityWeight: 'serious',
      enabled: true,
    },
  ],
}

const NIELSEN_CHECKLIST: Checklist = {
  id: 'builtin-nielsen-heuristics',
  name: "Nielsen's 10 Heuristics",
  description: "Jakob Nielsen's 10 Usability Heuristics for user interface design evaluation.",
  icon: '🧠',
  isBuiltIn: true,
  createdAt: new Date('2024-01-01').toISOString(),
  updatedAt: new Date('2024-01-01').toISOString(),
  items: [
    {
      id: 'nh-1',
      title: 'Visibility of system status',
      description: 'The system keeps users informed about what is going on through appropriate feedback within reasonable time.',
      category: 'Usability',
      severityWeight: 'critical',
      enabled: true,
    },
    {
      id: 'nh-2',
      title: 'Match between system and the real world',
      description: 'The system uses words, phrases, and concepts familiar to the user, following real-world conventions.',
      category: 'Content',
      severityWeight: 'serious',
      enabled: true,
    },
    {
      id: 'nh-3',
      title: 'User control and freedom',
      description: 'Users can easily undo, redo, or exit unwanted states. Clear "emergency exits" are always available.',
      category: 'Usability',
      severityWeight: 'critical',
      enabled: true,
    },
    {
      id: 'nh-4',
      title: 'Consistency and standards',
      description: 'The interface follows platform and industry conventions. Similar actions and elements behave predictably.',
      category: 'Visual',
      severityWeight: 'serious',
      enabled: true,
    },
    {
      id: 'nh-5',
      title: 'Error prevention',
      description: 'The design prevents errors before they happen through constraints, confirmations, and smart defaults.',
      category: 'Usability',
      severityWeight: 'critical',
      enabled: true,
    },
    {
      id: 'nh-6',
      title: 'Recognition rather than recall',
      description: 'Objects, actions, and options are visible. Users don\'t need to memorize information between dialogs.',
      category: 'Usability',
      severityWeight: 'serious',
      enabled: true,
    },
    {
      id: 'nh-7',
      title: 'Flexibility and efficiency of use',
      description: 'Accelerators and shortcuts exist for expert users without hindering novice experience.',
      category: 'Usability',
      severityWeight: 'minor',
      enabled: true,
    },
    {
      id: 'nh-8',
      title: 'Aesthetic and minimalist design',
      description: 'Interfaces contain only relevant information. Every extra unit of information competes with primary content.',
      category: 'Visual',
      severityWeight: 'serious',
      enabled: true,
    },
    {
      id: 'nh-9',
      title: 'Help users recognize, diagnose, and recover from errors',
      description: 'Error messages are expressed in plain language, indicate the problem precisely, and suggest a solution.',
      category: 'Content',
      severityWeight: 'serious',
      enabled: true,
    },
    {
      id: 'nh-10',
      title: 'Help and documentation',
      description: 'Documentation is easy to search, focused on the task, lists concrete steps, and is not too large.',
      category: 'Content',
      severityWeight: 'minor',
      enabled: true,
    },
  ],
}

const MOBILE_CHECKLIST: Checklist = {
  id: 'builtin-mobile-first',
  name: 'Mobile-First Audit',
  description: 'Essential checks for mobile-optimized experiences: touch, responsiveness, and performance.',
  icon: '📱',
  isBuiltIn: true,
  createdAt: new Date('2024-01-01').toISOString(),
  updatedAt: new Date('2024-01-01').toISOString(),
  items: [
    {
      id: 'mob-1',
      title: 'Touch targets are at least 44×44px',
      description: 'All interactive elements (buttons, links, form controls) meet the minimum 44×44 CSS pixel touch target size.',
      category: 'Usability',
      severityWeight: 'critical',
      enabled: true,
    },
    {
      id: 'mob-2',
      title: 'Responsive layout adapts across breakpoints',
      description: 'Content reflows correctly from mobile (320px) to tablet (768px) to desktop (1280px) without layout breaks.',
      category: 'Visual',
      severityWeight: 'critical',
      enabled: true,
    },
    {
      id: 'mob-3',
      title: 'Viewport meta tag is correctly configured',
      description: 'The page includes <meta name="viewport" content="width=device-width, initial-scale=1"> without disabling zoom.',
      category: 'Performance',
      severityWeight: 'serious',
      enabled: true,
    },
    {
      id: 'mob-4',
      title: 'No horizontal scrolling on mobile',
      description: 'Content stays within the viewport width. No elements overflow causing unwanted horizontal scrollbars.',
      category: 'Visual',
      severityWeight: 'serious',
      enabled: true,
    },
    {
      id: 'mob-5',
      title: 'Font sizes are legible without pinch-zoom',
      description: 'Body text is at least 16px equivalent. Line height is 1.5 or greater for comfortable reading on small screens.',
      category: 'Content',
      severityWeight: 'serious',
      enabled: true,
    },
    {
      id: 'mob-6',
      title: 'Images and media are optimized for mobile',
      description: 'Images use responsive sizing (srcset/sizes), lazy loading, and modern formats (WebP/AVIF) to reduce payload.',
      category: 'Performance',
      severityWeight: 'minor',
      enabled: true,
    },
  ],
}

const SEED_CHECKLISTS: Checklist[] = [WCAG_CHECKLIST, NIELSEN_CHECKLIST, MOBILE_CHECKLIST]

// ─── Store ───────────────────────────────────────────────────────────

export const useChecklistStore = create<ChecklistState>()(
  persist(
    (set, get) => ({
      checklists: SEED_CHECKLISTS,

      addChecklist: (data) => {
        const newChecklist: Checklist = {
          ...data,
          id: `cl-${crypto.randomUUID()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        set((state) => ({ checklists: [newChecklist, ...state.checklists] }))
        return newChecklist
      },

      updateChecklist: (id, updates) => {
        set((state) => ({
          checklists: state.checklists.map((c) =>
            c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c
          ),
        }))
      },

      deleteChecklist: (id) => {
        set((state) => ({
          checklists: state.checklists.filter((c) => c.id !== id),
        }))
      },

      duplicateChecklist: (id) => {
        const original = get().checklists.find((c) => c.id === id)
        if (!original) return undefined
        const duplicate: Checklist = {
          ...original,
          id: `cl-${crypto.randomUUID()}`,
          name: `${original.name} (Copy)`,
          isBuiltIn: false,
          items: original.items.map((item) => ({
            ...item,
            id: `item-${crypto.randomUUID()}`,
          })),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        set((state) => ({ checklists: [duplicate, ...state.checklists] }))
        return duplicate
      },

      toggleItem: (checklistId, itemId) => {
        set((state) => ({
          checklists: state.checklists.map((c) =>
            c.id === checklistId
              ? {
                  ...c,
                  updatedAt: new Date().toISOString(),
                  items: c.items.map((item) =>
                    item.id === itemId ? { ...item, enabled: !item.enabled } : item
                  ),
                }
              : c
          ),
        }))
      },

      addItem: (checklistId, item) => {
        const newItem: ChecklistItem = {
          ...item,
          id: `item-${crypto.randomUUID()}`,
        }
        set((state) => ({
          checklists: state.checklists.map((c) =>
            c.id === checklistId
              ? { ...c, items: [...c.items, newItem], updatedAt: new Date().toISOString() }
              : c
          ),
        }))
      },

      removeItem: (checklistId, itemId) => {
        set((state) => ({
          checklists: state.checklists.map((c) =>
            c.id === checklistId
              ? {
                  ...c,
                  items: c.items.filter((item) => item.id !== itemId),
                  updatedAt: new Date().toISOString(),
                }
              : c
          ),
        }))
      },

      updateItem: (checklistId, itemId, updates) => {
        set((state) => ({
          checklists: state.checklists.map((c) =>
            c.id === checklistId
              ? {
                  ...c,
                  updatedAt: new Date().toISOString(),
                  items: c.items.map((item) =>
                    item.id === itemId ? { ...item, ...updates } : item
                  ),
                }
              : c
          ),
        }))
      },

      reorderItems: (checklistId, fromIndex, toIndex) => {
        set((state) => ({
          checklists: state.checklists.map((c) => {
            if (c.id !== checklistId) return c
            const items = [...c.items]
            const [moved] = items.splice(fromIndex, 1)
            items.splice(toIndex, 0, moved)
            return { ...c, items, updatedAt: new Date().toISOString() }
          }),
        }))
      },

      getChecklist: (id) => get().checklists.find((c) => c.id === id),
    }),
    {
      name: 'uxray-checklists',
    }
  )
)
