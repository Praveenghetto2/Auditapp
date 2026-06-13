import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface BoardTask {
  id: string
  title: string
  severity: 'critical' | 'serious' | 'minor'
  category: string
  status: 'todo' | 'in_progress' | 'in_review' | 'done'
  assigneeId: string | null
  description: string
  currentCode?: string
  betterCode?: string
  projectId: string
}

interface BoardState {
  tasks: BoardTask[]
  moveTask: (id: string, status: BoardTask['status']) => void
  assignTask: (id: string, assigneeId: string | null) => void
  addTask: (task: BoardTask) => void
}

// Raw issue templates based on the 12 mock issues from the audit details
const ISSUES_TEMPLATES = [
  {
    id: 'iss-1',
    title: 'Missing alt text on hero image',
    category: 'Accessibility',
    severity: 'critical' as const,
    description: 'The primary hero image lacks descriptive alternative text, rendering it invisible to screen reader users and failing WCAG 2.2 Level A compliance.',
    currentCode: '<img src="hero.jpg">',
    betterCode: '<img src="hero.jpg" alt="Team collaborating on design sprint">',
    status: 'in_progress' as const,
    assigneeId: 'member-1',
  },
  {
    id: 'iss-2',
    title: 'Insufficient contrast ratio on primary CTA',
    category: 'Accessibility',
    severity: 'critical' as const,
    description: 'The "Get Started" button uses white text (#FFFFFF) on a light violet (#B870FF) background with a contrast ratio of only 2.4:1, far below the WCAG AA minimum of 4.5:1.',
    currentCode: 'bg: #B870FF / text: #FFFFFF → Ratio 2.4:1',
    betterCode: 'bg: #7000FF / text: #FFFFFF → Ratio 8.2:1',
    status: 'todo' as const,
    assigneeId: 'member-2',
  },
  {
    id: 'iss-3',
    title: 'No keyboard navigation for modal dialogs',
    category: 'Accessibility',
    severity: 'critical' as const,
    description: 'Modal dialogs do not trap focus, allowing keyboard-only users to tab behind the overlay and interact with obscured content.',
    currentCode: 'Focus escapes modal to background elements',
    betterCode: 'Implement focus trap with returnFocus on close',
    status: 'todo' as const,
    assigneeId: null,
  },
  {
    id: 'iss-4',
    title: 'Inconsistent spacing between feature cards',
    category: 'Layout',
    severity: 'serious' as const,
    description: 'Feature cards on the pricing page use varying gaps: 16px, 24px, and 20px between sections, breaking the visual rhythm and 8px grid alignment.',
    currentCode: 'gap: 16px | 24px | 20px (mixed)',
    betterCode: 'gap: 24px (consistent 8px multiple)',
    status: 'todo' as const,
    assigneeId: null,
  },
  {
    id: 'iss-5',
    title: 'Unclear primary call-to-action copy',
    category: 'Copy',
    severity: 'serious' as const,
    description: 'The main CTA reads "Submit" which is generic and fails to communicate the value proposition or expected outcome to users.',
    currentCode: '"Submit"',
    betterCode: '"Start My Free Trial"',
    status: 'in_review' as const,
    assigneeId: 'member-3',
  },
  {
    id: 'iss-6',
    title: 'Form inputs lack visible labels',
    category: 'Accessibility',
    severity: 'serious' as const,
    description: 'The sign-up form uses only placeholder text as labels. When users begin typing, they lose context of what field they are completing.',
    currentCode: '<input placeholder="Email address">',
    betterCode: '<label>Email address</label><input placeholder="you@company.com">',
    status: 'done' as const,
    assigneeId: 'member-2',
  },
  {
    id: 'iss-7',
    title: 'Touch targets below 44px minimum',
    category: 'Accessibility',
    severity: 'serious' as const,
    description: 'Navigation links in the mobile menu measure 32×28px, well below the WCAG 2.2 SC 2.5.8 minimum target size of 44×44px.',
    currentCode: 'height: 28px / width: 32px',
    betterCode: 'min-height: 44px / min-width: 44px with 8px padding',
    status: 'todo' as const,
    assigneeId: null,
  },
  {
    id: 'iss-8',
    title: 'Inconsistent border-radius across card components',
    category: 'Visual',
    severity: 'minor' as const,
    description: 'Card components use border-radius values of 8px, 12px, and 16px across different sections, creating visual inconsistency.',
    currentCode: 'border-radius: 8px | 12px | 16px',
    betterCode: 'border-radius: 12px (unified)',
    status: 'done' as const,
    assigneeId: 'member-1',
  },
  {
    id: 'iss-9',
    title: 'Orphaned text line in testimonial section',
    category: 'Visual',
    severity: 'minor' as const,
    description: 'The final line of the testimonial quote contains a single word "today" that wraps to a new line, creating an orphaned text element.',
    currentCode: '"...transform your workflow\\ntoday"',
    betterCode: '"...transform your\\nworkflow today"',
    status: 'todo' as const,
    assigneeId: null,
  },
  {
    id: 'iss-10',
    title: 'Redundant tooltip on labeled icon button',
    category: 'Heuristic',
    severity: 'minor' as const,
    description: 'The "Download Report" button has both a visible text label and an identical tooltip that adds no new information on hover.',
    currentCode: 'Button: "Download Report" + Tooltip: "Download Report"',
    betterCode: 'Remove tooltip (label is sufficient) or add detail: "Download as PDF"',
    status: 'todo' as const,
    assigneeId: null,
  },
  {
    id: 'iss-11',
    title: 'Decorative icon missing aria-hidden',
    category: 'Accessibility',
    severity: 'minor' as const,
    description: 'A decorative star icon next to the pricing header is announced by screen readers as "image" without providing meaningful context.',
    currentCode: '<svg role="img">★</svg>',
    betterCode: '<svg aria-hidden="true">★</svg>',
    status: 'done' as const,
    assigneeId: 'member-4',
  },
  {
    id: 'iss-12',
    title: 'Inconsistent hover state timing on navigation',
    category: 'Visual',
    severity: 'minor' as const,
    description: 'Navigation links use 150ms transition for background color but 300ms for text color, creating a subtly mismatched animation feel.',
    currentCode: 'bg: transition 150ms / color: transition 300ms',
    betterCode: 'all: transition 200ms cubic-bezier(0.4, 0, 0.2, 1)',
    status: 'todo' as const,
    assigneeId: null,
  },
]

const generateSeedTasks = (): BoardTask[] => {
  const seedTasks: BoardTask[] = []
  
  // Seed for proj-1 (Acme Corp Website) using exact IDs
  ISSUES_TEMPLATES.forEach(t => {
    seedTasks.push({
      ...t,
      projectId: 'proj-1'
    })
  })
  
  // Seed for proj-2 (Stark Industries Portal) using unique but matching IDs
  ISSUES_TEMPLATES.forEach(t => {
    seedTasks.push({
      ...t,
      id: `${t.id}-proj-2`,
      projectId: 'proj-2'
    })
  })
  
  return seedTasks
}

export const useBoardStore = create<BoardState>()(
  persist(
    (set) => ({
      tasks: generateSeedTasks(),
      
      moveTask: (id, status) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, status } : task
          ),
        }))
      },
      
      assignTask: (id, assigneeId) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, assigneeId } : task
          ),
        }))
      },
      
      addTask: (task) => {
        set((state) => ({
          tasks: [...state.tasks, task],
        }))
      },
    }),
    {
      name: 'uxray-project-board',
    }
  )
)
