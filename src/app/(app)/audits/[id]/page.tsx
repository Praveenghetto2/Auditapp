'use client'

import * as React from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Sparkles, PenTool, ShieldAlert, Gauge, ChevronDown, ChevronRight,
  Copy, Check, AlertTriangle, Type, Eye, Grid3X3, Brain, Palette, LayoutGrid,
  Target, Zap, MousePointerClick, BookOpen, Heart, Lightbulb, Users, Layers,
  Megaphone, CheckCircle2, XCircle, MinusCircle, Circle, Hash, Shapes,
  Search, Home, Settings, User, Bell, Mail, Star, Trash2, Edit, Share2, Download, Loader2, UploadCloud,
  ExternalLink, Flame, Wand2, Send, Info, Cpu, Activity
} from 'lucide-react'
import { ExportDialog } from '@/components/uxray/ExportDialog'
import { HeatmapOverlay, DEFAULT_HEAT_ZONES } from '@/components/uxray/HeatmapOverlay'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScoreGauge } from '@/components/uxray/ScoreGauge'
import { IssueBadge } from '@/components/uxray/IssueBadge'
import { useMockDataStore } from '@/lib/stores/mock-data-store'
import { useBreadcrumbs } from '@/lib/hooks/use-breadcrumbs'
import { useTeamStore } from '@/lib/stores/team-store'
import { cn } from '@/lib/utils'
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Tooltip as RechartsTooltip
} from 'recharts'

// ═══════════════════════════════════════════════════════════════════════
// TYPES & MOCK DATA
// ═══════════════════════════════════════════════════════════════════════

type TabId = 'overview' | 'issues' | 'ai-suggestions' | 'copy' | 'typography' | 'accessibility' | 'spacing' | 'coach' | 'automated-scan'

interface TabDef {
  id: TabId
  label: string
  icon: React.ReactNode
}

const TABS: TabDef[] = [
  { id: 'overview', label: 'Overview', icon: <Sparkles className="size-3.5" /> },
  { id: 'issues', label: 'Issues', icon: <AlertTriangle className="size-3.5" /> },
  { id: 'ai-suggestions', label: 'AI Suggestions', icon: <Wand2 className="size-3.5" /> },
  { id: 'copy', label: 'Copy Analysis', icon: <PenTool className="size-3.5" /> },
  { id: 'typography', label: 'Typography & Icons', icon: <Type className="size-3.5" /> },
  { id: 'accessibility', label: 'Accessibility', icon: <Eye className="size-3.5" /> },
  { id: 'spacing', label: 'Spacing & Layout', icon: <Grid3X3 className="size-3.5" /> },
  { id: 'coach', label: 'AI Coach', icon: <Brain className="size-3.5" /> },
  { id: 'automated-scan', label: 'Automated Scan', icon: <Cpu className="size-3.5" /> },
]

// Radar chart dimensions data
const RADAR_DATA = [
  { dimension: 'Accessibility', value: 82, fullMark: 100 },
  { dimension: 'Visual Hierarchy', value: 74, fullMark: 100 },
  { dimension: 'Copy Clarity', value: 68, fullMark: 100 },
  { dimension: 'Heuristics', value: 79, fullMark: 100 },
  { dimension: 'Brand & Emotion', value: 85, fullMark: 100 },
  { dimension: 'Handoff Ready', value: 71, fullMark: 100 },
]

// Issues mock data
interface AuditIssue {
  id: string
  title: string
  category: 'Accessibility' | 'Visual' | 'Copy' | 'Layout' | 'Heuristic'
  severity: 'critical' | 'serious' | 'minor'
  description: string
  principle: string
  current: string
  better: string
  details: string
}

const MOCK_ISSUES: AuditIssue[] = [
  // Critical (3)
  {
    id: 'iss-1',
    title: 'Missing alt text on hero image',
    category: 'Accessibility',
    severity: 'critical',
    description: 'The primary hero image lacks descriptive alternative text, rendering it invisible to screen reader users and failing WCAG 2.2 Level A compliance.',
    principle: 'Violates WCAG 2.2 SC 1.1.1 — Non-text Content',
    current: '<img src="hero.jpg">',
    better: '<img src="hero.jpg" alt="Team collaborating on design sprint">',
    details: 'Screen readers announce this as "image" with no context. Approximately 15% of users rely on assistive technology. This is the first element users encounter, making it a high-impact issue.',
  },
  {
    id: 'iss-2',
    title: 'Insufficient contrast ratio on primary CTA',
    category: 'Accessibility',
    severity: 'critical',
    description: 'The "Get Started" button uses white text (#FFFFFF) on a light violet (#B870FF) background with a contrast ratio of only 2.4:1, far below the WCAG AA minimum of 4.5:1.',
    principle: 'Violates WCAG 2.2 SC 1.4.3 — Contrast (Minimum)',
    current: 'bg: #B870FF / text: #FFFFFF → Ratio 2.4:1',
    better: 'bg: #7000FF / text: #FFFFFF → Ratio 8.2:1',
    details: 'This button is the primary conversion action and is nearly invisible under bright ambient light or for users with low vision. Darken the background to at least #7000FF.',
  },
  {
    id: 'iss-3',
    title: 'No keyboard navigation for modal dialogs',
    category: 'Accessibility',
    severity: 'critical',
    description: 'Modal dialogs do not trap focus, allowing keyboard-only users to tab behind the overlay and interact with obscured content.',
    principle: 'Violates WCAG 2.2 SC 2.4.3 — Focus Order',
    current: 'Focus escapes modal to background elements',
    better: 'Implement focus trap with returnFocus on close',
    details: 'When the pricing modal opens, pressing Tab 3 times moves focus to the footer links behind the overlay. This disorients keyboard users and breaks the interaction flow entirely.',
  },
  // Serious (4)
  {
    id: 'iss-4',
    title: 'Inconsistent spacing between feature cards',
    category: 'Layout',
    severity: 'serious',
    description: 'Feature cards on the pricing page use varying gaps: 16px, 24px, and 20px between sections, breaking the visual rhythm and 8px grid alignment.',
    principle: 'Violates Gestalt Principle of Uniform Connectedness',
    current: 'gap: 16px | 24px | 20px (mixed)',
    better: 'gap: 24px (consistent 8px multiple)',
    details: 'The inconsistency creates a subtle visual tension that reduces perceived quality. Standardize to 24px (3× base unit) for all card groups.',
  },
  {
    id: 'iss-5',
    title: 'Unclear primary call-to-action copy',
    category: 'Copy',
    severity: 'serious',
    description: 'The main CTA reads "Submit" which is generic and fails to communicate the value proposition or expected outcome to users.',
    principle: 'Violates Nielsen\'s Heuristic #2 — Match Between System and Real World',
    current: '"Submit"',
    better: '"Start My Free Trial"',
    details: 'Action-oriented, benefit-driven CTA copy converts 30–40% better than generic labels. The user should know exactly what happens when they click.',
  },
  {
    id: 'iss-6',
    title: 'Form inputs lack visible labels',
    category: 'Accessibility',
    severity: 'serious',
    description: 'The sign-up form uses only placeholder text as labels. When users begin typing, they lose context of what field they are completing.',
    principle: 'Violates WCAG 2.2 SC 3.3.2 — Labels or Instructions',
    current: '<input placeholder="Email address">',
    better: '<label>Email address</label><input placeholder="you@company.com">',
    details: 'Placeholders disappear on focus, causing confusion for users with cognitive disabilities and anyone who tabs away and returns to the form.',
  },
  {
    id: 'iss-7',
    title: 'Touch targets below 44px minimum',
    category: 'Accessibility',
    severity: 'serious',
    description: 'Navigation links in the mobile menu measure 32×28px, well below the WCAG 2.2 SC 2.5.8 minimum target size of 44×44px.',
    principle: 'Violates WCAG 2.2 SC 2.5.8 — Target Size (Minimum)',
    current: 'height: 28px / width: 32px',
    better: 'min-height: 44px / min-width: 44px with 8px padding',
    details: 'Small touch targets cause frequent mis-taps, particularly for users with motor impairments. The 44px minimum ensures comfortable touch interaction.',
  },
  // Minor (5)
  {
    id: 'iss-8',
    title: 'Inconsistent border-radius across card components',
    category: 'Visual',
    severity: 'minor',
    description: 'Card components use border-radius values of 8px, 12px, and 16px across different sections, creating visual inconsistency.',
    principle: 'Violates Gestalt Principle of Similarity',
    current: 'border-radius: 8px | 12px | 16px',
    better: 'border-radius: 12px (unified)',
    details: 'Standardize border-radius to a single token value. Using --radius-lg: 12px across all cards creates visual cohesion.',
  },
  {
    id: 'iss-9',
    title: 'Orphaned text line in testimonial section',
    category: 'Visual',
    severity: 'minor',
    description: 'The final line of the testimonial quote contains a single word "today" that wraps to a new line, creating an orphaned text element.',
    principle: 'Typography best practice — Avoid widows and orphans',
    current: '"...transform your workflow\\ntoday"',
    better: '"...transform your\\nworkflow today"',
    details: 'Use CSS text-wrap: balance or adjust max-width to prevent single-word lines that look unfinished.',
  },
  {
    id: 'iss-10',
    title: 'Redundant tooltip on labeled icon button',
    category: 'Heuristic',
    severity: 'minor',
    description: 'The "Download Report" button has both a visible text label and an identical tooltip that adds no new information on hover.',
    principle: 'Violates Nielsen\'s Heuristic #8 — Aesthetic and Minimalist Design',
    current: 'Button: "Download Report" + Tooltip: "Download Report"',
    better: 'Remove tooltip (label is sufficient) or add detail: "Download as PDF"',
    details: 'Redundant tooltips add interaction noise without value. Either remove the tooltip or make it provide additional context.',
  },
  {
    id: 'iss-11',
    title: 'Decorative icon missing aria-hidden',
    category: 'Accessibility',
    severity: 'minor',
    description: 'A decorative star icon next to the pricing header is announced by screen readers as "image" without providing meaningful context.',
    principle: 'WCAG 2.2 SC 1.1.1 — Decorative images should be hidden',
    current: '<svg role="img">★</svg>',
    better: '<svg aria-hidden="true">★</svg>',
    details: 'Decorative elements should use aria-hidden="true" so assistive technology skips them, reducing noise for screen reader users.',
  },
  {
    id: 'iss-12',
    title: 'Inconsistent hover state timing on navigation',
    category: 'Visual',
    severity: 'minor',
    description: 'Navigation links use 150ms transition for background color but 300ms for text color, creating a subtly mismatched animation feel.',
    principle: 'Visual consistency — Unified motion timing',
    current: 'bg: transition 150ms / color: transition 300ms',
    better: 'all: transition 200ms cubic-bezier(0.4, 0, 0.2, 1)',
    details: 'Standardize all hover transitions to a single easing curve and duration for a polished, cohesive interaction feel.',
  },
]

// Custom Brand Voice Tonality mapping
const BRAND_VOICE_REWRITES: Record<string, Record<string, string[]>> = {
  'copy-1': {
    startup: ["Explore the console 🚀", "Dive into features", "Discover the stack"],
    empathetic: ["Empower your workspace", "Support your team", "Learn how we assist"],
    casual: ["Check it out!", "Take a look!", "Curious? Learn more"],
    strict: ["Read documentation", "Review specifications", "Analyze systems"],
    custom: ["Custom Brand Guideline Rewrite 🤖", "Explore Brand Values", "Engage with Content"]
  },
  'copy-2': {
    startup: ["Deploy now", "Spin up project", "Get keys"],
    empathetic: ["Partner with us", "Begin collaboration", "Submit registration"],
    casual: ["I'm in!", "Let's do this!", "Count me in! 🎉"],
    strict: ["Execute transaction", "Confirm validation", "Submit payload"],
    custom: ["Submit secure request 🔒", "Finalize action", "Process details"]
  },
  'copy-3': {
    startup: ["Deprovision resources? No undo.", "Teardown database?", "Destroy container?"],
    empathetic: ["Would you like to archiving instead?", "Delete project and connections?", "Confirm cancellation."],
    casual: ["Whoops, hold on! Delete this?", "Sure you want to trash this?", "Ayo, delete project?"],
    strict: ["Abort instance execution?", "Terminate project lifecycle?", "Confirm destructive action."],
    custom: ["Confirm permanent deletion", "Irreversible action: delete?", "Acknowledge project destruction"]
  }
}

// Copy analysis mock data
const COPY_ISSUES = [
  {
    id: 'copy-1',
    original: 'Click here to learn more',
    context: 'Features section link text',
    rewrites: {
      professional: [
        'Explore feature details',
        'Analyze full capabilities',
        'Review product specifications',
      ],
      friendly: [
        'See what makes this special ✨',
        'Take a peek inside!',
        'Discover all the cool stuff here',
      ],
      bold: [
        'Discover the full power',
        'Unlock absolute performance',
        'Dominate your workflow now',
      ],
      minimal: [
        'View details',
        'Learn more',
        'Explore',
      ],
    },
  },
  {
    id: 'copy-2',
    original: 'Submit',
    context: 'Sign-up form primary CTA button',
    rewrites: {
      professional: [
        'Create your account',
        'Complete registration',
        'Submit application data',
      ],
      friendly: [
        'Let\'s get started!',
        'Join the family!',
        'Start your journey',
      ],
      bold: [
        'Unlock your access now',
        'Claim your free pass',
        'Get instant access',
      ],
      minimal: [
        'Sign up',
        'Submit',
        'Register',
      ],
    },
  },
  {
    id: 'copy-3',
    original: 'Are you sure you want to delete this?',
    context: 'Destructive action confirmation dialog',
    rewrites: {
      professional: [
        'This project will be permanently removed. Continue?',
        'Confirm permanent deletion of this project.',
        'Delete confirmation required.',
      ],
      friendly: [
        'Heads up — this can\'t be undone. Delete anyway?',
        'Are you sure? We\'d hate to lose your progress!',
        'Wait, check twice! Remove this project?',
      ],
      bold: [
        'Permanent deletion. No going back.',
        'Erase project forever.',
        'Destroy all associated data.',
      ],
      minimal: [
        'Delete permanently?',
        'Confirm deletion',
        'Delete',
      ],
    },
  },
  {
    id: 'copy-4',
    original: 'Error occurred',
    context: 'Generic error state message',
    rewrites: {
      professional: [
        'We couldn\'t process your request. Please try again.',
        'An unexpected transaction error occurred.',
        'Request validation failed. Verify connection.',
      ],
      friendly: [
        'Oops! Something went wrong on our end. Let\'s try that again.',
        'Our servers took a little nap. Try reloading!',
        'Uh oh, something hiccuped. Let\'s fix it together.',
      ],
      bold: [
        'Request failed. Here\'s what you can do.',
        'Critical action error. Try again.',
        'System failure. Check connection status.',
      ],
      minimal: [
        'Unable to load. Retry.',
        'Error. Try again.',
        'Connection failed.',
      ],
    },
  },
]

const BIAS_ISSUES = [
  {
    id: 'bias-1',
    text: 'Simple enough for anyone',
    category: 'Exclusionary Language',
    severity: 'critical',
    issue: 'Implies varying capability levels and can feel exclusionary or condescending to users with disabilities.',
    suggestion: 'Designed for effortless use',
  },
  {
    id: 'bias-2',
    text: 'He can manage his account settings',
    category: 'Gender Assumption',
    severity: 'critical',
    issue: 'Uses gendered pronoun assumption. Not all users identify as male.',
    suggestion: 'Users can manage their account settings',
  },
  {
    id: 'bias-3',
    text: 'Just enter your details',
    category: 'Minimizing Language',
    severity: 'warning',
    issue: 'The word "just" minimizes the effort and can frustrate users who find the process complex.',
    suggestion: 'Enter your details below',
  },
]

// Typography mock data
const FONT_STACK = [
  { role: 'Heading', family: 'Inter', weight: '700', size: '32px / 24px / 20px', rating: 'Excellent' },
  { role: 'Body', family: 'Inter', weight: '400', size: '16px / 14px', rating: 'Good' },
  { role: 'Caption', family: 'Inter', weight: '500', size: '12px / 11px', rating: 'Good' },
  { role: 'Monospace', family: 'Geist Mono', weight: '400', size: '14px / 13px', rating: 'Excellent' },
]

const FONT_SCALE = [
  { label: 'Display', size: 48, ratio: '3.000', usage: 'Hero headings' },
  { label: 'H1', size: 32, ratio: '2.000', usage: 'Page titles' },
  { label: 'H2', size: 24, ratio: '1.500', usage: 'Section headings' },
  { label: 'H3', size: 20, ratio: '1.250', usage: 'Card titles' },
  { label: 'Body', size: 16, ratio: '1.000', usage: 'Base text (reference)' },
  { label: 'Small', size: 14, ratio: '0.875', usage: 'Secondary text' },
  { label: 'Caption', size: 12, ratio: '0.750', usage: 'Labels, meta' },
]

const ICON_GRID = [
  { name: 'Search', style: 'Outline', size: '24px', consistent: true },
  { name: 'Home', style: 'Outline', size: '24px', consistent: true },
  { name: 'Settings', style: 'Filled', size: '24px', consistent: false },
  { name: 'User', style: 'Outline', size: '24px', consistent: true },
  { name: 'Bell', style: 'Duotone', size: '20px', consistent: false },
  { name: 'Mail', style: 'Outline', size: '24px', consistent: true },
  { name: 'Heart', style: 'Filled', size: '22px', consistent: false },
  { name: 'Star', style: 'Outline', size: '24px', consistent: true },
  { name: 'Trash', style: 'Outline', size: '24px', consistent: true },
  { name: 'Edit', style: 'Outline', size: '20px', consistent: false },
  { name: 'Share', style: 'Outline', size: '24px', consistent: true },
  { name: 'Download', style: 'Outline', size: '24px', consistent: true },
]

// Color palette for accessibility tab
const COLOR_PALETTE = [
  { hex: '#7000FF', name: 'Primary Violet', usage: 'CTAs, links' },
  { hex: '#00E5FF', name: 'Neon Cyan', usage: 'Accents, highlights' },
  { hex: '#FFFFFF', name: 'White', usage: 'Text on dark bg' },
  { hex: '#161617', name: 'Dark Surface', usage: 'Card backgrounds' },
  { hex: '#FF0055', name: 'Danger Red', usage: 'Errors, alerts' },
  { hex: '#00FFAA', name: 'Success Green', usage: 'Success states' },
  { hex: '#A1A1AA', name: 'Muted Gray', usage: 'Secondary text' },
  { hex: '#FFD500', name: 'Warning Gold', usage: 'Warning states' },
]

const CONTRAST_PAIRS = [
  { fg: '#FFFFFF', bg: '#7000FF', ratio: '8.2:1', passes: true },
  { fg: '#FFFFFF', bg: '#B870FF', ratio: '2.4:1', passes: false },
  { fg: '#00E5FF', bg: '#161617', ratio: '12.8:1', passes: true },
  { fg: '#A1A1AA', bg: '#161617', ratio: '5.1:1', passes: true },
  { fg: '#A1A1AA', bg: '#FFFFFF', ratio: '3.5:1', passes: false },
  { fg: '#FF0055', bg: '#161617', ratio: '4.8:1', passes: true },
]

const HEADING_STRUCTURE = [
  { tag: 'h1', text: 'Welcome to Acme Corp', valid: true, note: 'Single H1 — correct' },
  { tag: 'h2', text: 'Our Features', valid: true, note: 'Proper hierarchy' },
  { tag: 'h3', text: 'Speed & Performance', valid: true, note: 'Nested under H2' },
  { tag: 'h3', text: 'Security First', valid: true, note: 'Sibling H3' },
  { tag: 'h2', text: 'Pricing Plans', valid: true, note: 'Proper hierarchy' },
  { tag: 'h4', text: 'Enterprise Features', valid: false, note: 'Skipped H3 level!' },
  { tag: 'h2', text: 'Testimonials', valid: true, note: 'Proper hierarchy' },
]

const TOUCH_TARGETS = [
  { element: 'Primary CTA Button', size: '48×48px', passes: true },
  { element: 'Navigation Links', size: '32×28px', passes: false },
  { element: 'Social Media Icons', size: '36×36px', passes: false },
  { element: 'Form Checkbox', size: '44×44px', passes: true },
  { element: 'Close (×) Button', size: '24×24px', passes: false },
  { element: 'Tab Buttons', size: '48×40px', passes: false },
]

// Spacing mock data
const SPACING_SCALE = [
  { token: '4px', used: true, count: 12 },
  { token: '8px', used: true, count: 34 },
  { token: '12px', used: true, count: 18 },
  { token: '16px', used: true, count: 42 },
  { token: '20px', used: false, count: 7 },
  { token: '24px', used: true, count: 28 },
  { token: '32px', used: true, count: 15 },
  { token: '48px', used: true, count: 8 },
  { token: '64px', used: true, count: 4 },
]

const SPACING_HEATMAP = [
  { component: 'Header', top: 16, right: 24, bottom: 16, left: 24, aligned: true },
  { component: 'Hero Section', top: 64, right: 24, bottom: 48, left: 24, aligned: true },
  { component: 'Feature Cards', top: 14, right: 16, bottom: 14, left: 16, aligned: false },
  { component: 'Pricing Table', top: 32, right: 24, bottom: 32, left: 24, aligned: true },
  { component: 'Footer', top: 48, right: 24, bottom: 24, left: 24, aligned: true },
  { component: 'Testimonial', top: 20, right: 16, bottom: 22, left: 16, aligned: false },
]

// AI Coach data
const UX_PRINCIPLES = [
  {
    id: 'fitts',
    name: "Fitts' Law",
    icon: <MousePointerClick className="size-5" />,
    summary: 'Make clickable targets large and close to the user\'s cursor path.',
    application: 'The primary CTA button (32px height) is undersized. Users spend 40% more time acquiring small targets.',
    relatedIssues: ['iss-7'],
    before: 'Button: 32px height, tucked in corner',
    after: 'Button: 48px height, centered in content flow',
  },
  {
    id: 'hick',
    name: "Hick's Law",
    icon: <Zap className="size-5" />,
    summary: 'Reduce the number of choices to speed up decision making.',
    application: 'The navigation presents 12 top-level items. Decision time increases logarithmically with each option.',
    relatedIssues: [],
    before: '12 navigation items visible simultaneously',
    after: '5 primary items + "More" dropdown for secondary',
  },
  {
    id: 'miller',
    name: "Miller's Law",
    icon: <Layers className="size-5" />,
    summary: 'Group information into chunks of 7±2 items.',
    application: 'The feature comparison table has 18 ungrouped rows. Chunking into 3–4 categories improves scannability.',
    relatedIssues: [],
    before: '18 feature rows in a flat list',
    after: '4 categories × 4–5 features each with visual separators',
  },
  {
    id: 'jakob',
    name: "Jakob's Law",
    icon: <Users className="size-5" />,
    summary: 'Users prefer your site to work like other sites they know.',
    application: 'The hamburger menu opens from the right but closes with a left-swipe gesture, contrary to most apps.',
    relatedIssues: [],
    before: 'Non-standard close gesture (swipe left)',
    after: 'Standard close: tap ✕ button or swipe right',
  },
  {
    id: 'gestalt-proximity',
    name: 'Gestalt: Proximity',
    icon: <LayoutGrid className="size-5" />,
    summary: 'Elements placed near each other are perceived as related.',
    application: 'Form field labels are equidistant from the field above and below, creating ambiguity about which field they describe.',
    relatedIssues: ['iss-4', 'iss-6'],
    before: 'Label margin-bottom: 12px, margin-top: 12px',
    after: 'Label margin-bottom: 4px, margin-top: 16px',
  },
]

const EMOTION_TAGS = [
  { tag: 'Professional', score: 88, color: 'bg-uxray-secondary-300/15 text-uxray-secondary-300 border-uxray-secondary-300/25' },
  { tag: 'Modern', score: 82, color: 'bg-uxray-primary-300/15 text-uxray-primary-300 border-uxray-primary-300/25' },
  { tag: 'Trustworthy', score: 75, color: 'bg-uxray-success-300/15 text-uxray-success-300 border-uxray-success-300/25' },
  { tag: 'Innovative', score: 70, color: 'bg-uxray-secondary-300/15 text-uxray-secondary-300 border-uxray-secondary-300/25' },
  { tag: 'Approachable', score: 65, color: 'bg-uxray-warning-300/15 text-uxray-warning-300 border-uxray-warning-300/25' },
]

const BRAND_RADAR = [
  { trait: 'Professionalism', value: 88, fullMark: 100 },
  { trait: 'Innovation', value: 70, fullMark: 100 },
  { trait: 'Warmth', value: 55, fullMark: 100 },
  { trait: 'Authority', value: 82, fullMark: 100 },
  { trait: 'Playfulness', value: 35, fullMark: 100 },
  { trait: 'Simplicity', value: 78, fullMark: 100 },
]


// ═══════════════════════════════════════════════════════════════════════
// HELPER COMPONENTS
// ═══════════════════════════════════════════════════════════════════════

/** Collapsible section with smooth animation */
function CollapsibleSection({
  title,
  defaultOpen = false,
  badge,
  accentColor,
  children,
}: {
  title: string
  defaultOpen?: boolean
  badge?: React.ReactNode
  accentColor?: string
  children: React.ReactNode
}) {
  const [open, setOpen] = React.useState(defaultOpen)
  return (
    <div className="rounded-xl border border-border/40 overflow-hidden glass-panel">
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "w-full flex items-center justify-between px-5 py-4 text-left font-semibold text-sm transition-colors hover:bg-white/5",
          accentColor
        )}
      >
        <span className="flex items-center gap-3">
          {title}
          {badge}
        </span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="size-4 text-muted-foreground" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-1">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>    </div>
  )
}

/** Category badge for issue cards */
function CategoryBadge({ category }: { category: string }) {
  const colorMap: Record<string, string> = {
    Accessibility: 'bg-uxray-secondary-300/10 text-uxray-secondary-300 border-uxray-secondary-300/20',
    Visual: 'bg-uxray-primary-300/10 text-uxray-primary-300 border-uxray-primary-300/20',
    Copy: 'bg-uxray-warning-300/10 text-uxray-warning-300 border-uxray-warning-300/20',
    Layout: 'bg-uxray-secondary-300/10 text-uxray-secondary-300 border-uxray-secondary-300/20',
    Heuristic: 'bg-uxray-danger-300/10 text-uxray-danger-300 border-uxray-danger-300/20',
  }
  return (
    <span className={cn('text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border', colorMap[category] || 'bg-muted text-muted-foreground')}>
      {category}
    </span>
  )
}

/** Single issue card */
function IssueCard({ issue }: { issue: AuditIssue }) {
  const [expanded, setExpanded] = React.useState(false)
  return (
    <motion.div
      layout
      className="rounded-xl border border-border/40 glass-panel overflow-hidden"
    >
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-foreground leading-snug">{issue.title}</h4>
            <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{issue.description}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <CategoryBadge category={issue.category} />
            <IssueBadge severity={issue.severity} />
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <BookOpen className="size-3 shrink-0" />
          <span className="italic">{issue.principle}</span>
        </div>

        {/* Current → Better comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div className="rounded-lg border border-red-500/15 bg-red-500/5 p-3">
            <span className="text-xs uppercase font-bold text-red-400 tracking-wider">Current</span>
            <p className="text-xs font-mono mt-1 text-foreground/80 break-all">{issue.current}</p>
          </div>
          <div className="rounded-lg border border-emerald-500/15 bg-emerald-500/5 p-3">
            <span className="text-xs uppercase font-bold text-emerald-400 tracking-wider">Suggested</span>
            <p className="text-xs font-mono mt-1 text-foreground/80 break-all">{issue.better}</p>
          </div>
        </div>

        {/* Expandable details */}
        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center gap-1.5 text-xs text-uxray-secondary-300 hover:text-uxray-secondary-200 font-semibold transition-colors"
        >
          <ChevronRight className={cn('size-3 transition-transform', expanded && 'rotate-90')} />
          {expanded ? 'Hide details' : 'Show details'}
        </button>
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="text-xs text-muted-foreground leading-relaxed bg-muted/30 rounded-lg p-3 border border-border/30">
                {issue.details}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

function CopyInlineButton({ text }: { text: string }) {
  const [copied, setCopied] = React.useState(false)
  const handleCopy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <Button
      variant="ghost"
      size="sm"
      className="shrink-0 h-7 text-xs hover:bg-emerald-500/15 text-emerald-400 hover:text-emerald-300 gap-1"
      onClick={handleCopy}
    >
      {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
      {copied ? 'Copied' : 'Copy'}
    </Button>
  )
}

/** Copy rewrite card with tone tabs and 3-5 rewrites */
function CopyRewriteCard({ item, brandVoice }: { item: typeof COPY_ISSUES[0]; brandVoice?: string }) {
  const [tone, setTone] = React.useState<string>('professional')
  const baseTones = ['professional', 'friendly', 'bold', 'minimal'] as const
  const toneIcons: Record<string, string> = {
    professional: '💼', friendly: '😊', bold: '⚡', minimal: '✂️',
    brand: '🤖'
  }

  React.useEffect(() => {
    if (brandVoice) {
      setTone('brand')
    } else {
      setTone('professional')
    }
  }, [brandVoice])

  let options = item.rewrites[tone as keyof typeof item.rewrites] || []
  if (tone === 'brand' && brandVoice) {
    options = BRAND_VOICE_REWRITES[item.id]?.[brandVoice] || []
  }

  return (
    <div className="rounded-xl border border-border/40 glass-panel overflow-hidden">
      <div className="p-4 space-y-3">
        <div>
          <span className="text-xs uppercase font-bold text-muted-foreground tracking-wider">Original</span>
          <p className="text-sm font-semibold text-red-400 mt-0.5">&ldquo;{item.original}&rdquo;</p>
          <p className="text-xs text-muted-foreground mt-1">{item.context}</p>
        </div>

        {/* Tone tabs */}
        <div className="flex flex-wrap gap-1 p-1 bg-muted/40 rounded-lg">
          {baseTones.map((t) => (
            <button
              key={t}
              onClick={() => setTone(t)}
              className={cn(
                'flex-1 text-xs font-semibold py-1.5 rounded-md transition-all capitalize cursor-pointer min-w-[70px]',
                tone === t
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {toneIcons[t]} {t}
            </button>
          ))}

          {brandVoice && (
            <button
              onClick={() => setTone('brand')}
              className={cn(
                'flex-1 text-xs font-semibold py-1.5 rounded-md transition-all capitalize cursor-pointer border border-uxray-secondary-300/30 min-w-[95px]',
                tone === 'brand'
                  ? 'bg-gradient-to-r from-uxray-primary-300 to-uxray-secondary-300 text-white shadow-sm'
                  : 'text-uxray-secondary-300 hover:bg-uxray-secondary-300/5'
              )}
            >
              🤖 Brand Voice
            </button>
          )}
        </div>

        {/* Rewrite outputs */}
        <AnimatePresence mode="wait">
          <motion.div
            key={tone}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="space-y-2"
          >
            {options.map((rewriteText, idx) => (
              <div
                key={`${tone}-${idx}`}
                className="flex items-center justify-between gap-3 p-3 rounded-lg border border-emerald-500/15 bg-emerald-500/5 hover:bg-emerald-500/10 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <span className="text-xs uppercase font-bold text-emerald-400 tracking-wider">
                    {tone === 'brand' ? 'AI Auto-Brand Option' : 'Option'} {idx + 1}
                  </span>
                  <p className="text-sm font-medium text-foreground mt-0.5">&ldquo;{rewriteText}&rdquo;</p>
                </div>
                <CopyInlineButton text={rewriteText} />
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}


// ═══════════════════════════════════════════════════════════════════════
// TAB CONTENT COMPONENTS
// ═══════════════════════════════════════════════════════════════════════

/** Tab 1: Overview */
function OverviewTab({ scores, overallScore, isFixed }: { scores: { usability: number; accessibility: number; performance: number; visual: number }; overallScore: number; isFixed?: boolean }) {
  const criticalIssues = isFixed ? [] : MOCK_ISSUES.filter((i) => i.severity === 'critical')

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Quick Summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Issues', value: MOCK_ISSUES.length.toString(), sub: `${criticalIssues.length} critical · ${MOCK_ISSUES.filter(i=>i.severity==='serious').length} serious · ${MOCK_ISSUES.filter(i=>i.severity==='minor').length} minor`, icon: <AlertTriangle className="size-4" />, glow: 'card-glow-danger' },
          { label: 'Overall Score', value: `${overallScore}`, sub: 'Across 4 dimensions', icon: <Target className="size-4" />, glow: 'card-glow-cyan' },
          { label: 'Audit Duration', value: '42s', sub: 'Screenshot + AI analysis', icon: <Gauge className="size-4" />, glow: 'card-glow-purple' },
          { label: 'Input Type', value: 'URL', sub: 'Full page screenshot', icon: <Eye className="size-4" />, glow: 'card-glow-cyan' },
        ].map((stat, i) => (
          <Card key={i} className={cn("glass-panel shadow-md", stat.glow)}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-muted-foreground">{stat.label}</span>
                <span className="text-muted-foreground">{stat.icon}</span>
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{stat.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Score Gauges */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Usability', score: scores.usability, icon: <Sparkles className="size-4 text-uxray-primary-300" />, glow: 'card-glow-cyan' },
          { label: 'Accessibility', score: scores.accessibility, icon: <ShieldAlert className="size-4 text-rose-500" />, glow: 'card-glow-danger' },
          { label: 'Performance', score: scores.performance, icon: <Gauge className="size-4 text-cyan-500" />, glow: 'card-glow-cyan' },
          { label: 'Visual Design', score: scores.visual, icon: <PenTool className="size-4 text-pink-500" />, glow: 'card-glow-purple' },
        ].map((item, i) => (
          <Card key={i} className={cn("glass-panel shadow-md", item.glow)}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                {item.label}
                {item.icon}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center py-4">
              <ScoreGauge score={item.score} size="md" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Radar Chart + Top Critical Issues */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Radar Chart */}
        <Card className="glass-panel shadow-md card-glow-purple">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Audit Dimensions Radar</CardTitle>
            <CardDescription>6-dimension UX analysis weighted by impact</CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={RADAR_DATA} cx="50%" cy="50%" outerRadius="75%">
                  <defs>
                    <linearGradient id="radarFill" x1="0%" y1="0%" x2="0%" y2="100%" gradientUnits="userSpaceOnUse">
                      <stop offset="5%" stopColor="#8F1AFF" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#7000FF" stopOpacity={0.15} />
                    </linearGradient>
                    <linearGradient id="radarStroke" x1="0%" y1="0%" x2="100%" y2="0%" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#A855F7" />
                      <stop offset="100%" stopColor="#7000FF" />
                    </linearGradient>
                  </defs>
                  <PolarGrid stroke="rgba(255,255,255,0.08)" />
                  <PolarAngleAxis
                    dataKey="dimension"
                    tick={{ fill: 'var(--muted-foreground)', fontSize: 11, fontWeight: 500 }}
                  />
                  <PolarRadiusAxis
                    angle={90}
                    domain={[0, 100]}
                    tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }}
                    axisLine={false}
                  />
                  <Radar
                    name="Score"
                    dataKey="value"
                    stroke="url(#radarStroke)"
                    fill="url(#radarFill)"
                    fillOpacity={1}
                    strokeWidth={2}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: 'rgba(22,22,23,0.95)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Critical Issues */}
        <Card className="glass-panel shadow-md card-glow-danger">
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <AlertTriangle className="size-4 text-red-400" />
              Top Critical Issues
            </CardTitle>
            <CardDescription>Highest-priority issues requiring immediate attention</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {criticalIssues.map((issue) => (
              <div key={issue.id} className="rounded-lg border border-red-500/15 bg-red-500/5 p-3 space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-xs font-bold text-foreground">{issue.title}</h4>
                  <IssueBadge severity="critical" />
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{issue.description}</p>
                <p className="text-xs text-muted-foreground italic flex items-center gap-1">
                  <BookOpen className="size-2.5" /> {issue.principle}
                </p>
              </div>
            ))}
            <p className="text-xs text-uxray-secondary-300 font-semibold cursor-pointer hover:underline">
              View all {MOCK_ISSUES.length} issues →
            </p>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  )
}

/** Copy code helper button */
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = React.useState(false)
  const handleCopy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <Button
      variant="ghost"
      size="icon"
      className="size-7 text-muted-foreground hover:text-foreground hover:bg-white/[0.04] transition-colors"
      onClick={handleCopy}
    >
      {copied ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
    </Button>
  )
}

// Coordinate mapping for visual hotspots on the screenshot
const ISSUE_COORDINATES: Record<string, { x: number; y: number }> = {
  'iss-1': { x: 85.5, y: 13.5 }, // User Profile Avatar in Header
  'iss-2': { x: 12.5, y: 18.5 }, // Active "Dashboard" Sidebar item
  'iss-3': { x: 81.5, y: 13.5 }, // Search/Notification Bell area
  'iss-4': { x: 57.5, y: 31.0 }, // Inconsistent spacing between feature cards
  'iss-5': { x: 79.5, y: 34.5 }, // Export Report CTA copy
  'iss-6': { x: 69.0, y: 13.5 }, // Search input lacking label
  'iss-7': { x: 11.0, y: 37.0 }, // Touch targets under 44px
  'iss-8': { x: 31.0, y: 24.0 }, // Top row widgets border radius
  'iss-9': { x: 49.0, y: 72.0 }, // Bottom widget label spacing
  'iss-10': { x: 90.0, y: 34.5 }, // Tooltip on Filter button icon
  'iss-11': { x: 7.0, y: 13.5 }, // Decorative logo icon lacking aria-hidden
  'iss-12': { x: 10.0, y: 28.0 }, // Sidebar Report item hover state
}

// Actionable solutions and copyable code fixes
const ISSUE_SOLUTIONS: Record<string, { code: string; language: string; description: string }> = {
  'iss-1': {
    code: `<img 
  src="avatar.jpg" 
  alt="Sarah Jenkins, Account Settings Menu" 
  className="rounded-full size-8" 
/>`,
    language: 'html',
    description: 'Add a descriptive alt attribute to profile image links so screen reader users know the purpose and destination of the icon.'
  },
  'iss-2': {
    code: `/* CSS High Contrast Fix */
.sidebar-item-active {
  background-color: #7000FF; /* High-contrast primary */
  color: #FFFFFF;
}

/* Tailwind implementation */
<div className="bg-gradient-primary text-gray-900 dark:text-white font-semibold shadow-md">
  Dashboard
</div>`,
    language: 'tsx',
    description: 'Ensure active focus/pill background uses high-contrast purple theme token (#7000FF) relative to white text, exceeding the 4.5:1 WCAG AA baseline.'
  },
  'iss-3': {
    code: `import FocusTrap from 'focus-trap-react';

export function ModalWrapper({ isOpen, onClose, children }) {
  return (
    <FocusTrap active={isOpen}>
      <div className="modal-overlay" role="dialog" aria-modal="true">
        <div className="modal-content">
          {children}
        </div>
      </div>
    </FocusTrap>
  );
}`,
    language: 'tsx',
    description: 'Wrap active modal structures in a focus trap library (like focus-trap-react) to prevent keyboard tab focus from escaping to background elements.'
  },
  'iss-4': {
    code: `/* Apply uniform 8px baseline alignment grid spacing */
<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
  <StatCard />
  <StatCard />
  <StatCard />
  <StatCard />
</div>`,
    language: 'tsx',
    description: 'Enforce standard spacing intervals. Use consistent gap configurations (e.g. gap-6 / 24px) for all primary dashboard container components.'
  },
  'iss-5': {
    code: `{/* Replace ambiguous CTA labels with explicit target outcomes */}
<Button variant="outline" className="gap-2">
  <Download className="size-4" />
  Export PDF Report
</Button>`,
    language: 'tsx',
    description: 'Ensure CTA button copy uses action-oriented, descriptive verbs (e.g. "Export PDF Report" instead of generic "Export") to clarify outcomes.'
  },
  'iss-6': {
    code: `<div className="flex flex-col gap-1">
  {/* Visually hidden but accessible label */}
  <label htmlFor="dashboard-search" className="sr-only">
    Search analytics and logs
  </label>
  <input 
    id="dashboard-search"
    type="search"
    placeholder="Search data..." 
  />
</div>`,
    language: 'tsx',
    description: 'Pair search fields with a hidden accessible label (`sr-only` class) pointing to the input ID to pass screen reader accessibility requirements.'
  },
  'iss-7': {
    code: `/* Ensure interactive items conform to the 44px min touch standard */
<Link href="/settings" className="flex items-center gap-3 p-3 min-h-[44px]">
  <Settings className="size-4" />
  <span>Settings</span>
</Link>`,
    language: 'tsx',
    description: 'Increase navigation sidebar link sizes to at least 44px vertical height to prevent mistaps and support motor-impaired mobile users.'
  },
  'iss-8': {
    code: `/* Standardize component border-radius styling variables */
.card-widget-container {
  border-radius: var(--radius-2xl); /* Unified 16px radius */
  overflow: hidden;
}`,
    language: 'css',
    description: 'Harmonize UI aesthetics by standardizing card elements to a single container token value, such as var(--radius-2xl).'
  },
  'iss-9': {
    code: `/* Prevent orphan words using the CSS text-balance rule */
<p className="text-balance text-xs text-muted-foreground">
  Display metrics details updated 5 minutes ago from system logs
</p>`,
    language: 'tsx',
    description: 'Apply text-wrap: balance (or Tailwind text-balance) to paragraph and label elements to avoid orphans wrapping to a new line.'
  },
  'iss-10': {
    code: `/* Provide descriptive tooltips only on pure icon buttons */
<Tooltip>
  <TooltipTrigger asChild>
    <Button size="icon" aria-label="Toggle visual filter menu">
      <SlidersHorizontal className="size-4" />
    </Button>
  </TooltipTrigger>
  <TooltipContent>
    <span>Filter active data streams</span>
  </TooltipContent>
</Tooltip>`,
    language: 'tsx',
    description: 'Remove tooltips from elements that already contain clear text labels. Extend icon-only tooltips to clarify format parameters.'
  },
  'iss-11': {
    code: `{/* Set aria-hidden to ensure screen readers ignore vector decoration */}
<Sparkles className="text-primary size-5" aria-hidden="true" />`,
    language: 'tsx',
    description: 'Apply aria-hidden="true" on decorative assets (like SVGs or brand graphics) to filter out non-informative elements from accessibility trees.'
  },
  'iss-12': {
    code: `/* Apply unified system transition speeds for states */
.nav-interactive-link {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}`,
    language: 'css',
    description: 'Consolidate micro-animation timing properties. Define consistent transit durations (e.g. 200ms) on links and interactive states.'
  }
}

function formatRelativeDate(dateString: string): string {
  const now = Date.now()
  const then = new Date(dateString).getTime()
  const diffMs = now - then
  const diffMins = Math.floor(diffMs / 60_000)
  const diffHours = Math.floor(diffMs / 3_600_000)
  const diffDays = Math.floor(diffMs / 86_400_000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

/** Tab 2: Issues */
function IssuesTab({ isFixed }: { isFixed?: boolean }) {
  if (isFixed) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center gap-4 animate-in fade-in zoom-in-95 duration-500">
        <div className="size-20 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
          <CheckCircle2 className="size-10" />
        </div>
        <h3 className="text-2xl font-bold text-foreground">Clean Bill of Health!</h3>
        <p className="text-muted-foreground max-w-md">All previously reported issues have been resolved. Your design is fully compliant with WCAG 2.2 AA and UX best practices.</p>
      </div>
    )
  }
  const params = useParams()
  const auditId = params.id as string

  const teamStore = useTeamStore()
  const [commentText, setCommentText] = React.useState('')
  const [heatmapEnabled, setHeatmapEnabled] = React.useState(false)

  const [viewMode, setViewMode] = React.useState<'list' | 'visual'>('visual')
  const [inspectorMode, setInspectorMode] = React.useState<'audited' | 'fixed'>('audited')
  const [selectedIssueId, setSelectedIssueId] = React.useState<string>('iss-1')

  const assignment = teamStore.getAssignment(auditId, selectedIssueId)
  const assignee = assignment ? teamStore.members.find(m => m.id === assignment.assigneeId) : null
  const comments = teamStore.getCommentsByIssue(auditId, selectedIssueId)

  const handleAssign = (assigneeId: string) => {
    if (assigneeId) {
      teamStore.assignIssue({ auditId, issueId: selectedIssueId, assigneeId })
      toast.success(`Issue assigned to ${teamStore.members.find(m => m.id === assigneeId)?.name}`)
    } else {
      teamStore.assignIssue({ auditId, issueId: selectedIssueId, assigneeId: '' })
      toast.success("Issue unassigned")
    }
  }

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentText.trim()) return
    teamStore.addComment({
      auditId,
      issueId: selectedIssueId,
      authorId: 'member-1',
      text: commentText
    })
    setCommentText('')
    toast.success("Comment added!")
  }

  const groupBySeverity = (severity: AuditIssue['severity']) => MOCK_ISSUES.filter((i) => i.severity === severity)
  
  const groups: { severity: AuditIssue['severity']; label: string; color: string }[] = [
    { severity: 'critical', label: 'Critical Issues', color: 'border-l-red-500' },
    { severity: 'serious', label: 'Serious Issues', color: 'border-l-amber-500' },
    { severity: 'minor', label: 'Minor Issues', color: 'border-l-zinc-500' },
  ]

  const selectedIssue = MOCK_ISSUES.find((i) => i.id === selectedIssueId) || MOCK_ISSUES[0]
  const selectedSolution = ISSUE_SOLUTIONS[selectedIssue.id]

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      {/* Summary bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl glass-panel border border-border/40">
        <div className="flex items-center gap-4">
          <span className="text-sm font-semibold text-foreground">{MOCK_ISSUES.length} issues found</span>
          <div className="flex items-center gap-2">
            <IssueBadge severity="critical" count={groupBySeverity('critical').length} />
            <IssueBadge severity="serious" count={groupBySeverity('serious').length} />
            <IssueBadge severity="minor" count={groupBySeverity('minor').length} />
          </div>
        </div>

        {/* View Switcher Toggle */}
        <div className="flex rounded-xl p-1 bg-card/60 border border-border/40 glass-panel text-xs font-semibold text-muted-foreground select-none max-w-[280px]">
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={cn(
              'flex-1 py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all duration-300 cursor-pointer',
              viewMode === 'list'
                ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                : 'hover:text-foreground'
            )}
          >
            <LayoutGrid className="size-3.5" />
            List View
          </button>
          <button
            type="button"
            onClick={() => setViewMode('visual')}
            className={cn(
              'flex-1 py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all duration-300 cursor-pointer',
              viewMode === 'visual'
                ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                : 'hover:text-foreground'
            )}
          >
            <Eye className="size-3.5" />
            Visual Inspector
          </button>
        </div>
      </div>

      {viewMode === 'list' ? (
        <div className="space-y-4">
          {groups.map((group) => {
            const issues = groupBySeverity(group.severity)
            if (issues.length === 0) return null
            return (
              <CollapsibleSection
                key={group.severity}
                title={group.label}
                defaultOpen={group.severity === 'critical'}
                badge={<IssueBadge severity={group.severity} count={issues.length} />}
              >
                <div className="space-y-3">
                  {issues.map((issue) => (
                    <IssueCard key={issue.id} issue={issue} />
                  ))}
                </div>
              </CollapsibleSection>
            )
          })}
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-5">
          {/* Screenshot Viewport (Left column, col-span-3) */}
          <div className="lg:col-span-3 flex flex-col gap-4">
            <Card className="glass-panel overflow-hidden flex-1 relative border border-border/40">
              <CardHeader className="pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Eye className="size-4 text-uxray-primary-300" />
                    Interactive Canvas Inspector
                  </CardTitle>
                  <CardDescription className="max-w-[340px]">
                    {inspectorMode === 'audited'
                      ? 'Select a hotspot badge directly on the design preview to view its details.'
                      : 'Select the green checkmarks to inspect the visual fixes implemented.'}
                  </CardDescription>
                </div>

                <div className="flex items-center gap-3">
                  {/* Heatmap Toggle */}
                  {inspectorMode === 'audited' && (
                    <button
                      type="button"
                      onClick={() => setHeatmapEnabled(!heatmapEnabled)}
                      className={cn(
                        'h-8 px-3 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer',
                        heatmapEnabled
                          ? 'bg-red-500/15 border-red-500/30 text-red-400 hover:bg-red-500/20'
                          : 'border-border/40 hover:bg-muted/30 text-muted-foreground hover:text-foreground'
                      )}
                    >
                      <Flame className="size-3.5" />
                      Heatmap
                    </button>
                  )}

                  {/* Audited UI vs Proposed Solution Toggle */}
                  <div className="flex rounded-xl p-1 bg-card/60 border border-border/40 glass-panel text-xs font-semibold text-muted-foreground select-none max-w-[220px]">
                    <button
                      type="button"
                      onClick={() => setInspectorMode('audited')}
                      className={cn(
                        'py-1 px-3 rounded-lg flex items-center justify-center gap-1 transition-all duration-300 cursor-pointer',
                        inspectorMode === 'audited'
                          ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                          : 'hover:text-foreground'
                      )}
                    >
                      Audited UI
                    </button>
                    <button
                      type="button"
                      onClick={() => setInspectorMode('fixed')}
                      className={cn(
                        'py-1 px-3 rounded-lg flex items-center justify-center gap-1 transition-all duration-300 cursor-pointer',
                        inspectorMode === 'fixed'
                          ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                          : 'hover:text-foreground'
                      )}
                    >
                      Fixed UI
                    </button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pb-5 pt-2 flex items-center justify-center">
                <div className="relative w-full aspect-square md:aspect-video rounded-lg overflow-hidden border border-white/[0.04] bg-[#0c0c12]">
                  {/* Screenshot Image (Conditional swap based on toggle state) */}
                  <img
                    src={inspectorMode === 'audited' ? "/screenshots/dashboard_audit_screenshot.png" : "/screenshots/dashboard_audit_solution.png"}
                    alt={inspectorMode === 'audited' ? "Audited Dashboard UI Preview" : "Fixed Proposed Design Solution Preview"}
                    className="w-full h-full object-contain pointer-events-none select-none"
                  />

                  {/* Heatmap Overlay */}
                  <HeatmapOverlay
                    enabled={heatmapEnabled && inspectorMode === 'audited'}
                    zones={MOCK_ISSUES.map(issue => {
                      const coords = ISSUE_COORDINATES[issue.id] || { x: 50, y: 50 }
                      const intensityMap = { critical: 1, serious: 0.7, minor: 0.4 }
                      return {
                        x: coords.x,
                        y: coords.y,
                        intensity: intensityMap[issue.severity],
                        severity: issue.severity,
                        issueId: issue.id,
                        label: issue.title
                      }
                    })}
                    onZoneClick={(issueId) => setSelectedIssueId(issueId)}
                  />

                  {/* Hotspots Overlay */}
                  {!heatmapEnabled && MOCK_ISSUES.map((issue, index) => {
                    const coords = ISSUE_COORDINATES[issue.id]
                    if (!coords) return null

                    const isSelected = selectedIssueId === issue.id
                    const num = index + 1

                    let colorClass = ''
                    if (inspectorMode === 'fixed') {
                      colorClass = 'bg-gradient-success text-gray-900 dark:text-white shadow-uxray-success-300/40'
                    } else {
                      colorClass =
                        issue.severity === 'critical'
                          ? 'bg-gradient-danger text-gray-900 dark:text-white shadow-uxray-danger-300/40'
                          : issue.severity === 'serious'
                          ? 'bg-gradient-warning text-gray-900 dark:text-white shadow-uxray-warning-300/40 font-bold'
                          : 'bg-zinc-500 text-white shadow-zinc-500/40'
                    }

                    return (
                      <button
                        key={issue.id}
                        onClick={() => setSelectedIssueId(issue.id)}
                        className={cn(
                          'absolute flex items-center justify-center size-6.5 rounded-full font-mono text-xs font-bold shadow-lg border border-white/20 select-none cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 hover:scale-110 z-20',
                          colorClass,
                          isSelected && 'scale-125 z-30 ring-4 ring-white/30 shadow-xl'
                        )}
                        style={{
                          left: `${coords.x}%`,
                          top: `${coords.y}%`,
                        }}
                      >
                        {/* Animated ripple circle */}
                        {!isSelected && (
                          <motion.span
                            animate={{ scale: [1, 1.8, 1], opacity: [0.5, 0, 0.5] }}
                            transition={{
                              duration: 2.2,
                              repeat: Infinity,
                              ease: 'easeInOut',
                            }}
                            className={cn(
                              'absolute inset-0 rounded-full',
                              inspectorMode === 'fixed'
                                ? 'bg-uxray-success-300/30'
                                : issue.severity === 'critical'
                                ? 'bg-uxray-danger-300/30'
                                : issue.severity === 'serious'
                                ? 'bg-uxray-warning-300/30'
                                : 'bg-zinc-500/30'
                            )}
                          />
                        )}
                        {inspectorMode === 'fixed' ? <Check className="size-3.5" /> : num}
                      </button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Issue Details Panel (Right column, col-span-2) */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <Card className="glass-panel border border-border/40 h-full flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Violations Switcher
                  </label>
                  <select
                    value={selectedIssueId}
                    onChange={(e) => setSelectedIssueId(e.target.value)}
                    className="w-full h-11 border border-border/40 rounded-xl bg-card px-3 text-xs text-foreground outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all cursor-pointer"
                  >
                    {MOCK_ISSUES.map((issue, index) => (
                      <option key={issue.id} value={issue.id}>
                        {index + 1}. [{issue.severity.toUpperCase()}] {issue.title}
                      </option>
                    ))}
                  </select>
                </div>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col gap-4 overflow-y-auto max-h-[550px]">
                {/* Details view */}
                <div className="space-y-4 border-t border-border/20 pt-4">
                  {/* Fixed verification banner */}
                  {inspectorMode === 'fixed' && (
                    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3.5 flex items-start gap-2 text-emerald-400">
                      <CheckCircle2 className="size-4 shrink-0 mt-0.5 text-emerald-400" />
                      <div className="space-y-0.5">
                        <p className="text-xs font-bold uppercase tracking-wider">Verified Design Correction</p>
                        <p className="text-xs text-muted-foreground/80 leading-normal">
                          This element has been updated in the solution layout to conform with design system tokens and WCAG AA rules.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-1.5">
                      <CategoryBadge category={selectedIssue.category} />
                      <IssueBadge severity={selectedIssue.severity} />
                    </div>
                    <span className="text-xs font-mono text-muted-foreground/80 font-semibold">
                      Pin Index: #{MOCK_ISSUES.findIndex((i) => i.id === selectedIssueId) + 1}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-base font-bold text-foreground leading-snug">
                      {selectedIssue.title}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                      {selectedIssue.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground border-b border-border/20 pb-3.5">
                    <BookOpen className="size-3 shrink-0" />
                    <span className="italic">{selectedIssue.principle}</span>
                  </div>

                  {/* Comparisons */}
                  <div className="grid grid-cols-1 gap-2.5 pt-1">
                    <div className="rounded-xl border border-red-500/15 bg-red-500/5 p-3.5">
                      <span className="text-xs uppercase font-bold text-red-400 tracking-wider">
                        Current Element Code
                      </span>
                      <p className="text-xs font-mono mt-1.5 text-foreground/90 break-all leading-normal bg-black/20 p-2 rounded border border-red-500/10">
                        {selectedIssue.current}
                      </p>
                    </div>
                    <div className="rounded-xl border border-emerald-500/15 bg-emerald-500/5 p-3.5">
                      <span className="text-xs uppercase font-bold text-emerald-400 tracking-wider">
                        Recommended Solution
                      </span>
                      <p className="text-xs font-mono mt-1.5 text-foreground/90 break-all leading-normal bg-black/20 p-2 rounded border border-emerald-500/10">
                        {selectedIssue.better}
                      </p>
                    </div>
                  </div>

                  {/* Fix Code Block */}
                  {selectedSolution && (
                    <div className="rounded-xl border border-border/40 bg-[#0c0c12] p-3.5 space-y-2 mt-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs uppercase font-bold text-uxray-secondary-300 tracking-wider flex items-center gap-1.5">
                          <Lightbulb className="size-3 text-uxray-secondary-300" />
                          Fix Implementation
                        </span>
                        <CopyButton text={selectedSolution.code} />
                      </div>
                      <pre className="text-xs font-mono text-white/80 overflow-x-auto p-2.5 bg-black/40 rounded-lg border border-white/[0.03] max-h-36 leading-relaxed">
                        <code>{selectedSolution.code}</code>
                      </pre>
                      <p className="text-xs text-muted-foreground leading-relaxed pt-2.5 border-t border-white/[0.04]">
                        {selectedSolution.description}
                      </p>
                    </div>
                  )}

                  {/* Context explanation */}
                  <div className="text-xs text-muted-foreground leading-relaxed bg-muted/20 rounded-xl p-3.5 border border-border/30 mt-2">
                    <strong>Feedback Context:</strong> {selectedIssue.details}
                  </div>

                  {/* Team Collaboration Section */}
                  <div className="border-t border-border/20 pt-4 mt-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h5 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <Users className="size-3.5" />
                        Team Assignment & Comments
                      </h5>
                    </div>

                    {/* Assignee Selection */}
                    <div className="flex items-center justify-between gap-3 bg-muted/10 p-2.5 rounded-xl border border-border/20">
                      <div className="flex items-center gap-2">
                        {assignee ? (
                          <div
                            className="size-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm shadow-black/20"
                            style={{ backgroundColor: assignee.avatarColor }}
                          >
                            {assignee.initials}
                          </div>
                        ) : (
                          <div className="size-7 rounded-full border border-dashed border-border/60 flex items-center justify-center text-muted-foreground bg-muted/20">
                            <User className="size-3.5" />
                          </div>
                        )}
                        <div className="flex flex-col">
                          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Assignee</span>
                          <span className="text-xs font-semibold">{assignee ? assignee.name : 'Unassigned'}</span>
                        </div>
                      </div>

                      <select
                        value={assignment?.assigneeId || ''}
                        onChange={(e) => handleAssign(e.target.value)}
                        className="h-8 border border-border/40 rounded-lg bg-card px-2 text-[11px] text-foreground outline-none focus:border-primary transition-all cursor-pointer max-w-[140px]"
                      >
                        <option value="">Assign issue...</option>
                        {teamStore.members.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name} ({m.role})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Comments Thread */}
                    <div className="space-y-3">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block font-semibold">Comments ({comments.length})</span>
                      
                      {comments.length > 0 ? (
                        <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                          {comments.map((comment) => {
                            const author = teamStore.members.find(m => m.id === comment.authorId)
                            return (
                              <div key={comment.id} className="bg-card/40 p-2.5 rounded-lg border border-border/10 flex gap-2.5">
                                <div
                                  className="size-6.5 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0 mt-0.5 shadow-sm shadow-black/20"
                                  style={{ backgroundColor: author?.avatarColor || '#6b7280' }}
                                >
                                  {author?.initials || '??'}
                                </div>
                                <div className="space-y-1 flex-1">
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="text-xs font-bold text-foreground">{author?.name || 'Unknown User'}</span>
                                    <span className="text-[9px] text-muted-foreground font-semibold">{formatRelativeDate(comment.createdAt)}</span>
                                  </div>
                                  <p className="text-xs text-muted-foreground/90 leading-relaxed font-normal">{comment.text}</p>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground italic pl-1 font-medium">No comments yet. Start the discussion below.</p>
                      )}

                      {/* Add Comment Form */}
                      <form onSubmit={handleAddComment} className="flex gap-2 pt-1">
                        <input
                          type="text"
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          placeholder="Type a comment..."
                          className="flex-1 h-9 border border-border/40 rounded-lg bg-card px-3 text-xs text-foreground outline-none focus:border-primary transition-all"
                        />
                        <Button type="submit" size="sm" className="h-9 font-semibold text-xs gap-1 px-3 cursor-pointer">
                          <Send className="size-3" />
                          Send
                        </Button>
                      </form>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </motion.div>
  )
}

function BiasIssueCard({ item }: { item: typeof BIAS_ISSUES[0] }) {
  const [applied, setApplied] = React.useState(false)
  return (
    <div className={cn(
      "rounded-xl border p-4 glass-panel transition-all duration-300 relative",
      item.severity === 'critical' ? 'border-red-500/20 bg-red-500/5 card-glow-danger' : 'border-amber-500/20 bg-amber-500/5 card-glow-warning'
    )}>
      <div className="flex items-start gap-3">
        <AlertTriangle className={cn("size-4 shrink-0 mt-0.5", item.severity === 'critical' ? 'text-red-400' : 'text-amber-400')} />
        <div className="space-y-3 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className={cn(
              "text-xs uppercase tracking-wider font-bold",
              item.severity === 'critical' ? 'border-red-500/30 text-red-400 bg-red-500/10' : 'border-amber-500/30 text-amber-400 bg-amber-500/10'
            )}>
              {item.severity === 'critical' ? 'Inclusivity Violation' : 'Clarity Warning'}
            </Badge>
            <Badge variant="outline" className="text-xs border-primary/30 text-primary-300 bg-primary/10 uppercase tracking-wider font-bold">
              {item.category}
            </Badge>
          </div>

          <div className="space-y-1">
            <span className="text-xs uppercase font-bold text-muted-foreground tracking-wider">UI Copy Context</span>
            <p className="text-sm font-semibold text-foreground leading-normal">
              &ldquo;
              <span className={cn(
                "underline decoration-2 underline-offset-2 transition-all",
                applied ? 'text-emerald-400 decoration-emerald-500/40 font-semibold' : item.severity === 'critical' ? 'text-red-400 decoration-red-500/40' : 'text-amber-400 decoration-amber-500/40'
              )}>
                {applied ? item.suggestion : item.text}
              </span>
              &rdquo;
            </p>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed">{item.issue}</p>

          <div className="flex items-center justify-between gap-4 pt-1.5 border-t border-white/[0.04]">
            <div className="flex items-center gap-2 p-2 rounded-lg border border-emerald-500/15 bg-emerald-500/5 flex-1">
              <Lightbulb className="size-3 text-emerald-400 shrink-0" />
              <span className="text-xs text-emerald-400 font-medium">Suggestion: &ldquo;{item.suggestion}&rdquo;</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "h-8 text-xs font-semibold shrink-0 gap-1.5 transition-all cursor-pointer",
                applied ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20' : 'hover:bg-muted/40'
              )}
              onClick={() => setApplied(!applied)}
            >
              {applied ? <CheckCircle2 className="size-3.5" /> : <Sparkles className="size-3.5" />}
              {applied ? 'Applied' : 'Apply Fix'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

/** Tab: AI Design Suggestions */
function AiSuggestionsTab() {
  const [applied, setApplied] = React.useState<Record<string, boolean>>({})
  
  const suggestions = [
    {
      id: 'sug-1',
      title: 'Alt Text & Accessible Label Auto-Fix',
      description: 'Inject descriptive alt tags to 4 decorative images and 1 hero banner. Add aria-label to the header search input.',
      category: 'Accessibility',
      impact: '+12 Score',
      confidence: '96% confidence',
      codeBefore: `<img src="/assets/hero-banner.jpg" />\n<input type="search" placeholder="Search..." />`,
      codeAfter: `<img src="/assets/hero-banner.jpg" alt="UXRay platform dashboard preview highlighting audit metrics" />\n<input type="search" placeholder="Search..." aria-label="Search site audits and projects" />`,
      details: 'Resolves WCAG 2.2 SC 1.1.1 (Non-text Content) and SC 4.1.2 (Name, Role, Value).'
    },
    {
      id: 'sug-2',
      title: 'Contrast Ratio Contrast Booster',
      description: 'Shift text colors on the primary call-to-action button and secondary navigation items to hit WCAG 4.5:1 AA standards.',
      category: 'Visual Hierarchy',
      impact: '+15 Score',
      confidence: '98% confidence',
      codeBefore: `/* Primary CTA Button */\nbackground-color: #8B5CF6;\ncolor: #C084FC; /* Contrast is 2.8:1 */`,
      codeAfter: `/* Primary CTA Button */\nbackground-color: #8B5CF6;\ncolor: #FFFFFF; /* Contrast is 5.4:1 */`,
      details: 'Fixes insufficient color contrast on page navigation links and main dashboard controls.'
    },
    {
      id: 'sug-3',
      title: 'Grid Alignment & Spacing Standardization',
      description: 'Adjust grid gaps and card paddings to enforce a strict 8px layout grid, resolving inconsistent spacing warnings.',
      category: 'Layout Consistency',
      impact: '+8 Score',
      confidence: '91% confidence',
      codeBefore: `/* Dashboard widget grid */\ngap: 19px;\npadding: 13px 17px 9px 21px;`,
      codeAfter: `/* Standardized 8px-based grid */\ngap: 24px;\npadding: 16px; /* 4 units of 4px */`,
      details: 'Standardizes layout alignment to improve scannability and professional polish.'
    }
  ]

  const handleApply = (id: string) => {
    setApplied(prev => ({ ...prev, [id]: !prev[id] }))
    toast.success(applied[id] ? "Fix rolled back" : "AI recommendation applied and layout compiled!")
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl glass-panel border border-border/40">
        <div>
          <h3 className="text-base font-bold flex items-center gap-2 text-foreground">
            <Wand2 className="size-4 text-uxray-secondary-300" />
            AI Design Suggestions
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Auto-generated code refactoring recommendations to resolve identified UX violations
          </p>
        </div>
        <Badge className="bg-primary/15 text-primary border-primary/20 shrink-0 uppercase tracking-wider font-bold text-xs py-1 px-2.5">
          Copilot Enabled
        </Badge>
      </div>

      <div className="grid gap-6">
        {suggestions.map((sug) => {
          const isApplied = applied[sug.id]
          return (
            <Card key={sug.id} className={cn(
              "glass-panel shadow-md border overflow-hidden transition-all duration-300",
              isApplied ? 'border-emerald-500/20 bg-emerald-500/5 card-glow-success' : 'border-border/40'
            )}>
              <div className="p-5 flex flex-col md:flex-row gap-5">
                <div className="flex-1 space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className="bg-secondary/15 text-secondary-300 border-secondary/20 font-bold uppercase tracking-wider text-[10px]">
                      {sug.category}
                    </Badge>
                    <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/20 font-bold uppercase tracking-wider text-[10px]">
                      {sug.impact}
                    </Badge>
                    <Badge className="bg-primary/10 text-primary-300 border-primary/25 font-bold text-[10px]">
                      {sug.confidence}
                    </Badge>
                  </div>

                  <div>
                    <h4 className="text-base font-bold text-foreground">{sug.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{sug.description}</p>
                  </div>

                  <p className="text-[11px] text-muted-foreground italic flex items-center gap-1.5 font-semibold">
                    <Info className="size-3.5" />
                    {sug.details}
                  </p>
                </div>

                <div className="flex-1 flex flex-col gap-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div className="rounded-xl border border-red-500/15 bg-red-500/5 p-3">
                      <span className="text-[10px] uppercase font-bold text-red-400 tracking-wider block mb-1">Before Fix</span>
                      <pre className="text-[10px] font-mono text-foreground/80 break-all leading-normal bg-black/20 p-2 rounded max-h-24 overflow-y-auto">
                        <code>{sug.codeBefore}</code>
                      </pre>
                    </div>
                    <div className={cn(
                      "rounded-xl border p-3 transition-all",
                      isApplied ? "border-emerald-500/30 bg-emerald-500/10" : "border-emerald-500/15 bg-emerald-500/5"
                    )}>
                      <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider block mb-1">After Fix</span>
                      <pre className="text-[10px] font-mono text-foreground/80 break-all leading-normal bg-black/20 p-2 rounded max-h-24 overflow-y-auto">
                        <code>{sug.codeAfter}</code>
                      </pre>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(sug.codeAfter)
                        toast.success("Corrected code fix copied to clipboard!")
                      }}
                      className="h-9 text-xs font-semibold gap-1 cursor-pointer border-border/40 hover:bg-muted/30"
                    >
                      <Copy className="size-3.5" />
                      Copy Code
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleApply(sug.id)}
                      className={cn(
                        "h-9 text-xs font-semibold gap-1.5 cursor-pointer shadow-md transition-all",
                        isApplied 
                          ? "bg-emerald-500 text-white hover:bg-emerald-600" 
                          : "bg-primary text-primary-foreground hover:opacity-90"
                      )}
                    >
                      {isApplied ? <CheckCircle2 className="size-3.5" /> : <Sparkles className="size-3.5" />}
                      {isApplied ? 'Applied' : 'Apply Suggestion'}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </motion.div>
  )
}

/** Tab 3: Copy Analysis */
function CopyTab() {
  const [selectedVoice, setSelectedVoice] = React.useState<string>('')
  const [customGuidelines, setCustomGuidelines] = React.useState<string>('')

  const handleApplyVoice = (voiceId: string) => {
    setSelectedVoice(voiceId)
    toast.success(`Brand voice profile shifted to ${voiceId.toUpperCase()}! Copilot rewrites re-aligned.`)
  }

  const handleApplyCustom = (e: React.FormEvent) => {
    e.preventDefault()
    if (!customGuidelines.trim()) return
    setSelectedVoice('custom')
    toast.success("AI Copilot compiled custom brand guidelines! Review rewrites below.")
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Brand Voice Editor Card */}
      <Card className="glass-panel border-border/40 card-glow-purple overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Sparkles className="size-4 text-uxray-secondary-300" />
            AI Brand Voice Copilot Settings
          </CardTitle>
          <CardDescription>
            Configure style guidelines to customize copy suggestions across all diagnostics.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Preset Buttons */}
          <div>
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-2 block font-semibold">Voice Presets</span>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'startup', label: 'Startup Tech 🚀', desc: 'Punchy, actionable' },
                { id: 'empathetic', label: 'Empathetic Corporate 🤝', desc: 'Helpful, reassuring' },
                { id: 'casual', label: 'Casual Friendly 😊', desc: 'Direct, warm' },
                { id: 'strict', label: 'Strict Professional 💼', desc: 'Formal, precise' }
              ].map((voice) => {
                const isActive = selectedVoice === voice.id
                return (
                  <button
                    key={voice.id}
                    onClick={() => handleApplyVoice(voice.id)}
                    className={cn(
                      "h-9 px-3 rounded-lg border text-xs font-semibold flex flex-col justify-center items-start text-left cursor-pointer transition-all min-w-[120px]",
                      isActive
                        ? "border-uxray-secondary-300/40 bg-uxray-secondary-300/10 text-uxray-secondary-300 shadow-sm"
                        : "border-border/40 bg-card/40 hover:bg-muted/30 text-muted-foreground hover:text-foreground"
                    )}
                    title={voice.desc}
                  >
                    <span>{voice.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Custom style guidelines */}
          <form onSubmit={handleApplyCustom} className="space-y-2 pt-2 border-t border-border/10">
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block font-semibold">Custom Brand Guidelines (.txt or text instructions)</span>
            <div className="flex gap-2">
              <input
                type="text"
                value={customGuidelines}
                onChange={(e) => setCustomGuidelines(e.target.value)}
                placeholder="e.g. Always speak in first-person plural, avoid technical jargon, use exclamation marks..."
                className="flex-1 h-9 border border-border/40 rounded-lg bg-card px-3 text-xs text-foreground outline-none focus:border-primary transition-all"
              />
              <Button type="submit" size="sm" className="h-9 font-semibold text-xs cursor-pointer">
                Apply Guidelines
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Copy Rewriter Section */}
      <div>
        <h3 className="text-lg font-bold mb-1 flex items-center gap-2">
          <PenTool className="size-4 text-uxray-secondary-300" />
          Copy Rewriter
        </h3>
        <p className="text-xs text-muted-foreground mb-4">
          Flagged copy with AI-generated rewrites across 4 tone profiles
        </p>
        <div className="grid gap-4 lg:grid-cols-2">
          {COPY_ISSUES.map((item) => (
            <CopyRewriteCard key={item.id} item={item} brandVoice={selectedVoice} />
          ))}
        </div>
      </div>

      {/* Bias Detection */}
      <div>
        <h3 className="text-lg font-bold mb-1 flex items-center gap-2">
          <AlertTriangle className="size-4 text-amber-400" />
          Bias & Inclusivity Detector
        </h3>
        <p className="text-xs text-muted-foreground mb-4">
          Language patterns that may unintentionally exclude or alienate users
        </p>
        <div className="space-y-3">
          {BIAS_ISSUES.map((item) => (
            <BiasIssueCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </motion.div>
  )
}

/** Tab: Automated Web Accessibility & Performance Scanner */
function AutomatedScanTab() {
  const [scanState, setScanState] = React.useState<'idle' | 'scanning' | 'complete'>('idle')
  const [scanProgress, setScanProgress] = React.useState(0)
  const [scanLog, setScanLog] = React.useState<string[]>([])

  const logs = [
    "Initialising Axe-core engine...",
    "Querying Document Object Model...",
    "Analyzing semantic heading structures...",
    "Checking image alternative text tags...",
    "Evaluating background/foreground color contrast ratios...",
    "Testing keyboard accessibility and focus rings...",
    "Calculating PageSpeed performance metrics...",
    "Validating meta tags and SEO indexing attributes...",
    "Diagnostics compiled! Generating report cards..."
  ]

  const runDiagnostics = () => {
    setScanState('scanning')
    setScanProgress(0)
    setScanLog([])
    
    let currentIdx = 0
    const interval = setInterval(() => {
      if (currentIdx < logs.length) {
        setScanLog(prev => [...prev, logs[currentIdx]])
        setScanProgress(Math.min(((currentIdx + 1) / logs.length) * 100, 100))
        currentIdx++
      } else {
        clearInterval(interval)
        setScanState('complete')
        toast.success("Automated scanner compiled accessibility and performance metrics!")
      }
    }, 450)
  }

  const reports = [
    { label: "Performance", score: 78, color: "text-amber-500", glow: "card-glow-warning" },
    { label: "Accessibility", score: 92, color: "text-emerald-400", glow: "card-glow-success" },
    { label: "Best Practices", score: 88, color: "text-emerald-400", glow: "card-glow-success" },
    { label: "SEO", score: 85, color: "text-emerald-400", glow: "card-glow-success" }
  ]

  const violations = [
    {
      id: "v-1",
      severity: "critical" as const,
      impact: "Axe-core rule: color-contrast",
      title: "Elements must have sufficient color contrast (WCAG SC 1.4.3)",
      description: "Found 2 text elements with contrast ratios less than 4.5:1 on background layers. Affected selector: `button.cta-primary`.",
      code: `<button className="text-[#C084FC] bg-[#8B5CF6]">Get Started</button>`
    },
    {
      id: "v-2",
      severity: "critical" as const,
      impact: "Axe-core rule: image-alt",
      title: "Images must have alternate text attributes (WCAG SC 1.1.1)",
      description: "The primary decorative hero image lacks alt tag attributes. Affected selector: `img.hero-banner`.",
      code: `<img src="/assets/hero-banner.jpg" className="hero-banner" />`
    },
    {
      id: "v-3",
      severity: "serious" as const,
      impact: "Axe-core rule: button-name",
      title: "Buttons must have discernible accessible names (WCAG SC 4.1.2)",
      description: "Interactive button controls containing only icons must have aria-label descriptors. Affected selector: `button.search-submit`.",
      code: `<button className="search-submit"><SearchIcon /></button>`
    },
    {
      id: "v-4",
      severity: "minor" as const,
      impact: "Axe-core rule: heading-order",
      title: "Heading levels should only increase by one (WCAG SC 1.3.1)",
      description: "Layout skipped from H1 directly to H3. Ensure heading markup follows nesting order.",
      code: `<h1>Dashboard</h1>\n<h3>Recent Projects</h3>`
    }
  ]

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl glass-panel border border-border/40">
        <div>
          <h3 className="text-base font-bold flex items-center gap-2 text-foreground">
            <Cpu className="size-4 text-uxray-primary-300" />
            Axe-Core & Lighthouse Diagnostics
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Run automated checks to verify DOM accessibility conformance and Core Web Vitals performance
          </p>
        </div>
        {scanState !== 'scanning' && (
          <Button
            onClick={runDiagnostics}
            className="bg-primary text-primary-foreground hover:opacity-90 font-semibold gap-1.5 shrink-0 h-9"
          >
            <Activity className="size-4 animate-pulse" />
            {scanState === 'complete' ? 'Run Again' : 'Start Diagnostic Scan'}
          </Button>
        )}
      </div>

      {scanState === 'idle' && (
        <Card className="glass-panel border-border/40 p-8 text-center flex flex-col items-center justify-center gap-4">
          <div className="size-16 rounded-full bg-primary/10 border border-primary/20 text-primary-300 flex items-center justify-center">
            <Cpu className="size-8" />
          </div>
          <div className="max-w-md space-y-1">
            <h4 className="text-sm font-bold text-foreground">Automated Web Accessibility Scanner</h4>
            <p className="text-xs text-muted-foreground leading-normal">
              Execute WCAG 2.2 AA rules checks. This scanner runs Axe-core and Lighthouse engines in the browser context.
            </p>
          </div>
          <Button onClick={runDiagnostics} className="font-semibold text-xs h-9">
            Execute Scan
          </Button>
        </Card>
      )}

      {scanState === 'scanning' && (
        <Card className="glass-panel border-border/40 p-6 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-muted-foreground uppercase tracking-wider">
              <span>Running Diagnostics...</span>
              <span>{Math.round(scanProgress)}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted/40 overflow-hidden relative border border-white/[0.03]">
              <motion.div
                className="h-full bg-gradient-to-r from-uxray-primary-300 to-uxray-secondary-300"
                style={{ width: `${scanProgress}%` }}
                transition={{ ease: "easeInOut" }}
              />
            </div>
          </div>

          <div className="rounded-lg bg-black/40 border border-white/[0.04] p-4 h-48 overflow-y-auto font-mono text-[10px] text-muted-foreground space-y-1.5 leading-relaxed">
            {scanLog.map((log, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2"
              >
                <span className="text-uxray-primary-300 font-bold">▶</span>
                <span>{log}</span>
              </motion.div>
            ))}
          </div>
        </Card>
      )}

      {scanState === 'complete' && (
        <div className="space-y-6">
          {/* Lighthouse Score Rings */}
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            {reports.map((report) => (
              <Card key={report.label} className={cn("glass-panel border-border/40 shadow-md", report.glow)}>
                <CardContent className="p-4 flex flex-col items-center justify-center gap-3">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{report.label}</span>
                  <div className="relative size-16 flex items-center justify-center">
                    <svg width="64" height="64" className="-rotate-90">
                      <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
                      <motion.circle
                        cx="32"
                        cy="32"
                        r="28"
                        fill="none"
                        stroke={report.score >= 90 ? "var(--uxray-success-300)" : "var(--uxray-warning-300)"}
                        strokeWidth="6"
                        strokeDasharray={2 * Math.PI * 28}
                        initial={{ strokeDashoffset: 2 * Math.PI * 28 }}
                        animate={{ strokeDashoffset: 2 * Math.PI * 28 * (1 - report.score / 100) }}
                        transition={{ duration: 1, ease: "easeOut" }}
                      />
                    </svg>
                    <span className={cn("absolute text-sm font-bold", report.color)}>{report.score}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Automated Violations */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-foreground">Axe-Core Automated Findings ({violations.length})</h3>
            <div className="grid gap-4">
              {violations.map((v) => (
                <Card key={v.id} className="glass-panel border-border/40 shadow-sm">
                  <CardContent className="p-4 flex flex-col md:flex-row gap-4 justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className={cn(
                          "text-[9px] uppercase tracking-wider font-bold",
                          v.severity === 'critical' ? 'border-red-500/30 text-red-400 bg-red-500/10' :
                          v.severity === 'serious' ? 'border-amber-500/30 text-amber-400 bg-amber-500/10' :
                          'border-blue-500/30 text-blue-400 bg-blue-500/10'
                        )}>
                          {v.severity}
                        </Badge>
                        <span className="text-[10px] font-mono text-muted-foreground/80 font-semibold bg-muted/20 px-2 py-0.5 rounded border border-border/20">
                          {v.impact}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-foreground leading-normal">{v.title}</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed font-normal">{v.description}</p>
                    </div>

                    <div className="w-full md:w-56 shrink-0 space-y-1">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground block font-semibold">Code Context</span>
                      <pre className="p-2 bg-black/30 border border-white/[0.04] rounded-lg text-[9px] font-mono text-white/80 overflow-x-auto leading-normal">
                        <code>{v.code}</code>
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  )
}

/** Tab 4: Typography & Icons */
const ICON_MAP: Record<string, React.ComponentType<{ className?: string; fill?: string }>> = {
  Search,
  Home,
  Settings,
  User,
  Bell,
  Mail,
  Heart,
  Star,
  Trash: Trash2,
  Edit,
  Share: Share2,
  Download,
}

function TypographyTab() {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Font Pairing Checker */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="glass-panel shadow-md card-glow-purple">
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Type className="size-4" /> Font Stack Analysis
            </CardTitle>
            <CardDescription>Detected typefaces and their usage roles</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {FONT_STACK.map((font, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-border/30 bg-muted/20">
                <div>
                  <p className="text-sm font-bold">{font.family}</p>
                  <p className="text-xs text-muted-foreground">{font.role} · Weight {font.weight} · {font.size}</p>
                </div>
                <Badge variant="outline" className={cn(
                  'text-xs',
                  font.rating === 'Excellent' ? 'border-uxray-success-300/30 text-uxray-success-300' : 'border-uxray-secondary-300/30 text-uxray-secondary-300'
                )}>
                  {font.rating}
                </Badge>
              </div>
            ))}
            <div className="p-3 rounded-lg border border-uxray-success-300/15 bg-uxray-success-300/5">
              <p className="text-xs font-semibold text-uxray-success-300 flex items-center gap-1.5">
                <CheckCircle2 className="size-3" /> Pairing Verdict: Inter + Geist Mono is an excellent combination
              </p>
              <p className="text-xs text-muted-foreground mt-1">Clear hierarchy, high readability, modern aesthetic. Consistent weight usage across roles.</p>
            </div>
          </CardContent>
        </Card>

        {/* Font Scale Ladder */}
        <Card className="glass-panel shadow-md card-glow-cyan">
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Hash className="size-4" /> Type Scale Ladder
            </CardTitle>
            <CardDescription>Font size progression and ratio consistency</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {FONT_SCALE.map((step, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-16 text-right">
                  <span className="text-xs font-mono text-muted-foreground">{step.size}px</span>
                </div>
                <div className="flex-1 flex items-center gap-2">
                  <div
                    className="bg-gradient-to-r from-uxray-primary-300 to-uxray-secondary-300 rounded-full h-2"
                    style={{ width: `${(step.size / 48) * 100}%`, minWidth: '12px' }}
                  />
                  <span className="text-xs font-semibold shrink-0">{step.label}</span>
                </div>
                <span className="text-xs text-muted-foreground font-mono w-12 text-right">×{step.ratio}</span>
              </div>
            ))}
            <p className="text-xs text-muted-foreground pt-2 border-t border-border/30 mt-3">
              Scale ratio: 1.25 (Major Third) — balanced for both headings and body text
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Icon Consistency Grid */}
      <Card className="glass-panel shadow-md">
        <CardHeader>
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Shapes className="size-4" /> Icon Consistency Audit
          </CardTitle>
          <CardDescription>
            {ICON_GRID.filter(i => !i.consistent).length} of {ICON_GRID.length} icons flagged for style or size inconsistency
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {ICON_GRID.map((icon, i) => {
              const IconComponent = ICON_MAP[icon.name] || Shapes
              
              // Handle size styles to show size discrepancies visually
              let iconSizeClass = 'size-5' // default 20px
              if (icon.size === '24px') {
                iconSizeClass = 'size-6'
              } else if (icon.size === '22px') {
                iconSizeClass = 'size-[22px]'
              } else if (icon.size === '20px') {
                iconSizeClass = 'size-5'
              }

              // Handle fill color for filled icons
              const fillProp = icon.style === 'Filled' ? 'currentColor' : undefined

              return (
                <div
                  key={i}
                  className={cn(
                    'flex flex-col items-center gap-2 p-3 rounded-xl border text-center transition-colors',
                    icon.consistent
                      ? 'border-border/30 bg-muted/10'
                      : 'border-amber-500/30 bg-amber-500/5'
                  )}
                >
                  <div className={cn(
                    'size-10 rounded-lg flex items-center justify-center',
                    icon.consistent ? 'bg-muted/40' : 'bg-amber-500/10'
                  )}>
                    <IconComponent
                      className={cn(iconSizeClass, icon.consistent ? 'text-muted-foreground' : 'text-amber-400')}
                      fill={fillProp}
                    />
                  </div>
                  <span className="text-xs font-semibold">{icon.name}</span>
                  <div className="flex items-center gap-1">
                    <Badge variant="outline" className={cn(
                      'text-xs px-1.5 py-0',
                      icon.consistent ? 'border-border/40 text-muted-foreground' : 'border-amber-500/30 text-amber-400'
                    )}>
                      {icon.style}
                    </Badge>
                    {icon.size !== '24px' && (
                      <Badge variant="outline" className="text-xs px-1.5 py-0 border-amber-500/30 text-amber-400">
                        {icon.size}
                      </Badge>
                    )}
                  </div>
                  {!icon.consistent && (
                    <AlertTriangle className="size-3 text-amber-400 animate-bounce" />
                  )}
                </div>
              )
            })}
          </div>
          <div className="mt-4 p-3 rounded-lg border border-amber-500/15 bg-amber-500/5">
            <p className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
              <AlertTriangle className="size-3" /> 4 icons use inconsistent styles
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              The dominant style is <strong>Outline</strong> (8/12 icons). Standardize Settings, Bell, Heart, and Edit to outline style at 24px.
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

/** Tab 5: Accessibility (enhanced) */
function AccessibilityTab({ scores }: { scores: { accessibility: number } }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-3">
        {/* WCAG Contrast Checks */}
        <Card className="lg:col-span-2 glass-panel shadow-md border-rose-500/10">
          <CardHeader>
            <CardTitle>WCAG Contrast Standards & Audits</CardTitle>
            <CardDescription>Color contrast ratios checked against WCAG 2.2 AA (4.5:1) standards.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { selector: 'body > main > section.hero > h1', value: '3.4:1', target: '4.5:1', status: 'Fail', fix: 'Increase font weight or darken text color.', color: 'text-rose-400 border-rose-500/25 bg-rose-500/5 card-glow-danger', fg: '#DDA0FF', bg: '#FFFFFF' },
              { selector: 'button.btn-secondary', value: '2.8:1', target: '4.5:1', status: 'Fail', fix: 'Use background color with higher opacity.', color: 'text-rose-400 border-rose-500/25 bg-rose-500/5 card-glow-danger', fg: '#FFFFFF', bg: '#C5B4E3' },
              { selector: '.pricing-card .price-label', value: '3.9:1', target: '4.5:1', status: 'Fail', fix: 'Darken text from #8B8B8B to #6B6B6B.', color: 'text-rose-400 border-rose-500/25 bg-rose-500/5 card-glow-danger', fg: '#8B8B8B', bg: '#FFFFFF' },
              { selector: 'body > footer > p.copyright', value: '8.2:1', target: '4.5:1', status: 'Pass', fix: 'N/A', color: 'text-uxray-success-300 border-uxray-success-200/20 bg-uxray-success-50/5', fg: '#374151', bg: '#F9FAFB' },
              { selector: 'nav > a.active', value: '12.6:1', target: '4.5:1', status: 'Pass', fix: 'N/A', color: 'text-uxray-success-300 border-uxray-success-200/20 bg-uxray-success-50/5', fg: '#7000FF', bg: '#F5F3FF' },
            ].map((item, i) => (
              <div key={i} className={cn("p-4 rounded-xl border flex flex-col gap-3 font-sans relative overflow-hidden", item.color)}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex flex-col gap-1 min-w-0">
                    <span className="truncate max-w-[100%] text-foreground/90 bg-muted/60 dark:bg-black/45 px-2 py-0.5 rounded border border-border/40 text-xs w-fit font-mono">{item.selector}</span>
                    <span className="text-xs font-bold font-mono mt-1">{item.value} <span className="opacity-55">(Target {item.target})</span> — {item.status}</span>
                  </div>
                  
                  {/* Side-by-Side Color Swatch Visualizer */}
                  <div className="flex items-center gap-2.5 bg-black/20 px-2.5 py-1.5 rounded-lg border border-white/[0.04] w-fit shrink-0 no-print">
                    <div className="flex items-center justify-center w-12 h-7 rounded border border-white/10 font-extrabold text-xs select-none shadow-inner" style={{ backgroundColor: item.bg, color: item.fg }}>
                      Aa
                    </div>
                    <div className="flex flex-col text-xs font-mono text-muted-foreground leading-tight">
                      <span>FG: <strong className="text-foreground">{item.fg}</strong></span>
                      <span>BG: <strong className="text-foreground">{item.bg}</strong></span>
                    </div>
                  </div>
                </div>
                {item.fix !== 'N/A' && (
                  <p className="text-xs text-muted-foreground font-medium pl-1.5 border-l-2 border-primary/45 mt-0.5">🛠️ Recommendation: {item.fix}</p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Score Card */}
        <Card className="glass-panel shadow-md">
          <CardHeader>
            <CardTitle>Score Card</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center py-6">
            <ScoreGauge score={scores.accessibility} size="lg" label="Accessibility Score" />
          </CardContent>
        </Card>
      </div>

      {/* Color Palette Extractor */}
      <Card className="glass-panel shadow-md card-glow-cyan">
        <CardHeader>
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Palette className="size-4" /> Extracted Color Palette
          </CardTitle>
          <CardDescription>All colors detected in the design with their usage context</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-3 mb-4">
            {COLOR_PALETTE.map((color, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5">
                <div
                  className="size-12 rounded-xl border border-border/40 shadow-sm"
                  style={{ backgroundColor: color.hex }}
                />
                <span className="text-xs font-mono text-muted-foreground">{color.hex}</span>
                <span className="text-xs text-muted-foreground text-center leading-tight">{color.usage}</span>
              </div>
            ))}
          </div>

          {/* Contrast Pairs */}
          <h4 className="text-xs font-bold text-foreground mb-2 mt-4">Contrast Ratio Matrix</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {CONTRAST_PAIRS.map((pair, i) => (
              <div key={i} className={cn(
                'flex items-center justify-between gap-3 p-3 rounded-xl border transition-all duration-300 hover:scale-[1.01]',
                pair.passes ? 'border-emerald-500/15 bg-emerald-500/5 hover:border-emerald-500/30' : 'border-red-500/15 bg-red-500/5 hover:border-red-500/30'
              )}>
                <div className="flex flex-col gap-1.5 min-w-0">
                  <div className="flex items-center gap-1">
                    <div className="size-4 rounded-sm border border-white/[0.08]" style={{ backgroundColor: pair.fg }} title={`Foreground: ${pair.fg}`} />
                    <span className="text-xs font-mono text-muted-foreground truncate">{pair.fg}</span>
                    <span className="text-xs text-muted-foreground px-0.5">on</span>
                    <div className="size-4 rounded-sm border border-white/[0.08]" style={{ backgroundColor: pair.bg }} title={`Background: ${pair.bg}`} />
                    <span className="text-xs font-mono text-muted-foreground truncate">{pair.bg}</span>
                  </div>
                  <span className="text-xs font-bold text-foreground/90 font-mono">{pair.ratio} Contrast</span>
                </div>
                {pair.passes ? (
                  <div className="size-6 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="size-3.5 text-emerald-400" />
                  </div>
                ) : (
                  <div className="size-6 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                    <XCircle className="size-3.5 text-red-400" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Heading Structure + Touch Targets */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Heading Structure */}
        <Card className="glass-panel shadow-md">
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Hash className="size-4" /> Heading Structure Audit
            </CardTitle>
            <CardDescription>HTML heading hierarchy compliance check</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {HEADING_STRUCTURE.map((h, i) => (
              <div key={i} className={cn(
                'flex items-center gap-3 p-2.5 rounded-lg border',
                h.valid ? 'border-border/30 bg-muted/10' : 'border-red-500/20 bg-red-500/5'
              )}>
                <span className={cn(
                  'text-xs font-mono font-bold w-8 text-center rounded-md py-0.5',
                  h.valid ? 'bg-muted/40 text-foreground' : 'bg-red-500/15 text-red-400'
                )}>
                  {h.tag}
                </span>
                <span
                  className="text-sm text-foreground/80 flex-1"
                  style={{ paddingLeft: `${(parseInt(h.tag.replace('h', '')) - 1) * 16}px` }}
                >
                  {h.text}
                </span>
                <span className={cn(
                  'text-xs shrink-0',
                  h.valid ? 'text-muted-foreground' : 'text-red-400 font-semibold'
                )}>
                  {h.note}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Touch Targets */}
        <Card className="glass-panel shadow-md">
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Target className="size-4" /> Touch Target Compliance
            </CardTitle>
            <CardDescription>Minimum 44×44px target size check (WCAG 2.5.8)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {TOUCH_TARGETS.map((target, i) => (
              <div key={i} className={cn(
                'flex items-center justify-between p-2.5 rounded-lg border',
                target.passes ? 'border-border/30 bg-muted/10' : 'border-red-500/20 bg-red-500/5'
              )}>
                <span className="text-sm text-foreground/80">{target.element}</span>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    'text-xs font-mono font-bold',
                    target.passes ? 'text-emerald-400' : 'text-red-400'
                  )}>
                    {target.size}
                  </span>
                  {target.passes ? (
                    <CheckCircle2 className="size-3.5 text-emerald-400" />
                  ) : (
                    <XCircle className="size-3.5 text-red-400" />
                  )}
                </div>
              </div>
            ))}
            <div className="p-3 rounded-lg border border-amber-500/15 bg-amber-500/5 mt-2">
              <p className="text-xs text-amber-400 font-semibold">
                {TOUCH_TARGETS.filter(t => !t.passes).length}/{TOUCH_TARGETS.length} elements fail the 44px minimum target size requirement
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  )
}

/** Tab 6: Spacing & Layout (enhanced) */
function SpacingTab({ scores }: { scores: { usability: number } }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Original spacing checks */}
        <Card className="lg:col-span-2 glass-panel shadow-md">
          <CardHeader>
            <CardTitle>Margins & Component Spacing Alignment</CardTitle>
            <CardDescription>Evaluates padding consistency and margins against the 8px baseline layout grid.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { item: 'Card Component Padding', value: '14px', expected: '16px / 12px', fix: 'Adjust margin-top/padding-left to snap to 8px multiple (16px).' },
              { item: 'Button Group Flex Gap', value: '10px', expected: '8px / 12px', fix: 'Snap flex-gap to standard spacing sizes.' },
              { item: 'Hero Section Margin', value: '60px', expected: '64px', fix: 'Round up to nearest 8px multiple.' },
              { item: 'Container Section Margins', value: '64px', expected: '64px', fix: 'Perfect alignment.' },
              { item: 'Footer Padding Top', value: '48px', expected: '48px', fix: 'Perfect alignment.' },
            ].map((item, i) => (
              <div key={i} className="p-4 rounded-xl border border-border/40 bg-card flex items-start justify-between gap-4 glass-panel">
                <div>
                  <h4 className="text-sm font-bold">{item.item}</h4>
                  <p className="text-xs text-muted-foreground mt-1">🛠️ Fix: {item.fix}</p>
                </div>
                <div className="text-right shrink-0 flex flex-col gap-0.5 font-mono text-xs font-bold">
                  <span className={item.value !== item.expected ? 'text-amber-500' : 'text-uxray-success-300'}>
                    {item.value}
                  </span>
                  <span className="text-xs text-muted-foreground">Target: {item.expected}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Score Card */}
        <Card className="glass-panel shadow-md">
          <CardHeader>
            <CardTitle>Score Card</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center py-6">
            <ScoreGauge score={scores.usability} size="lg" label="Layout Score" />
          </CardContent>
        </Card>
      </div>

      {/* Spacing Scale Compliance */}
      <Card className="glass-panel shadow-md card-glow-cyan">
        <CardHeader>
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <LayoutGrid className="size-4" /> Spacing Scale Compliance
          </CardTitle>
          <CardDescription>Usage frequency of each spacing token against the 4/8-based scale</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2.5">
            {SPACING_SCALE.map((s, i) => {
              const maxCount = Math.max(...SPACING_SCALE.map(x => x.count))
              const isOffGrid = !s.used
              return (
                <div key={i} className="flex items-center gap-3">
                  <span className={cn(
                    'text-xs font-mono font-bold w-12 text-right',
                    isOffGrid ? 'text-amber-400' : 'text-foreground'
                  )}>
                    {s.token}
                  </span>
                  <div className="flex-1 h-5 bg-muted/20 rounded-full overflow-hidden relative">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(s.count / maxCount) * 100}%` }}
                      transition={{ duration: 0.6, delay: i * 0.05 }}
                      className={cn(
                        'h-full rounded-full',
                        isOffGrid
                          ? 'bg-gradient-to-r from-amber-500/60 to-amber-500/30'
                          : 'bg-gradient-to-r from-uxray-primary-300/60 to-uxray-secondary-300/40'
                      )}
                    />
                    <span className="absolute inset-y-0 right-2 flex items-center text-xs font-bold text-muted-foreground">
                      {s.count}×
                    </span>
                  </div>
                  {isOffGrid && (
                    <Badge variant="outline" className="text-xs border-amber-500/30 text-amber-400">Off-grid</Badge>
                  )}
                </div>
              )
            })}
          </div>
          <div className="p-3 rounded-lg border border-amber-500/15 bg-amber-500/5 mt-4">
            <p className="text-xs text-amber-400 font-semibold flex items-center gap-1.5">
              <AlertTriangle className="size-3" /> 20px appears 7 times — not in the standard 4/8 scale
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Replace with 16px or 24px to maintain grid alignment consistency.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Spacing Heatmap */}
      <Card className="glass-panel shadow-md card-glow-purple">
        <CardHeader>
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Grid3X3 className="size-4" /> Component Spacing Heatmap
          </CardTitle>
          <CardDescription>Padding values for each component, colored by grid compliance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border/40">
                  <th className="text-left py-2 pr-4 font-semibold text-muted-foreground">Component</th>
                  <th className="py-2 px-3 font-semibold text-muted-foreground text-center">Top</th>
                  <th className="py-2 px-3 font-semibold text-muted-foreground text-center">Right</th>
                  <th className="py-2 px-3 font-semibold text-muted-foreground text-center">Bottom</th>
                  <th className="py-2 px-3 font-semibold text-muted-foreground text-center">Left</th>
                  <th className="py-2 px-3 font-semibold text-muted-foreground text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {SPACING_HEATMAP.map((row, i) => {
                  const isGridAligned = (val: number) => val % 8 === 0 || val % 4 === 0
                  return (
                    <tr key={i} className="border-b border-border/20">
                      <td className="py-2.5 pr-4 font-semibold text-foreground">{row.component}</td>
                      {[row.top, row.right, row.bottom, row.left].map((val, j) => (
                        <td key={j} className="py-2.5 px-3 text-center">
                          <span className={cn(
                            'font-mono font-bold px-2 py-0.5 rounded',
                            isGridAligned(val)
                              ? 'text-emerald-400 bg-emerald-500/10'
                              : 'text-amber-400 bg-amber-500/10'
                          )}>
                            {val}px
                          </span>
                        </td>
                      ))}
                      <td className="py-2.5 px-3 text-center">
                        {row.aligned ? (
                          <CheckCircle2 className="size-4 text-emerald-400 mx-auto" />
                        ) : (
                          <AlertTriangle className="size-4 text-amber-400 mx-auto" />
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

interface QAPair {
  q: string
  a: string
}

const COACH_QA: Record<string, QAPair[]> = {
  fitts: [
    {
      q: "Why is 48px the standard for touch targets?",
      a: "According to Fitts' Law and mobile ergonomics, a 48x48dp target maps to roughly 9mm, which is the average width of a human finger pad. Smaller targets slow down acquisition exponentially (by 40%+) and increase miss rates, leading to user frustration."
    },
    {
      q: "How does distance affect the speed of target acquisition?",
      a: "Fitts' Law states that the time to acquire a target is a function of the distance to the target divided by the target width. The further away a target is and the smaller it is, the longer it takes for a user's cursor or finger to reach it. Designing primary actions close to the user's natural scanning and navigation flow minimizes this distance."
    }
  ],
  hick: [
    {
      q: "How can I group choices to reduce decision fatigue?",
      a: "Hick's Law indicates that decision time increases logarithmically with the number of options. By categorizing or chunking a list of 12 items into 3-4 primary thematic groups (or hiding secondary options in a dropdown), you decrease the visual complexity at any single decision level, reducing cognitive load."
    },
    {
      q: "When does Hick's Law not apply?",
      a: "Hick's Law does not apply when options are highly structured, alphabetical (like a glossary or phone book where users know exactly what they are looking for), or inside complex professional layouts where visual accessibility of multiple actions is prioritized over decision speed."
    }
  ],
  miller: [
    {
      q: "Why 7±2? Is it a hard limit for all UI lists?",
      a: "George Miller's 1956 research showed that the human working memory can hold roughly 7 items plus or minus 2. It is not a limit on how much content you can show on a screen, but rather on how much information a user can synthesize at once. Dividing high-density lists (e.g. 18 items) into distinct visual chunks ensures users can scan and retain the list easily."
    },
    {
      q: "What is chunking and how do I apply it?",
      a: "Chunking groups individual items into larger, meaningful categories. In UI design, you chunk content using cards, spacing, borders, or tabs. For example, instead of listing 18 items in a single long column, structure them into 3-4 categories with distinct subheadings and borders."
    }
  ],
  jakob: [
    {
      q: "When should we break standard web conventions?",
      a: "Jakob's Law states: 'Users spend most of their time on other sites.' This means they expect your site to behave like others. You should only break standard conventions (like top navigation, search placement, or common interaction patterns) if your custom pattern offers a massive, self-explanatory usability improvement."
    },
    {
      q: "How does cognitive styling influence brand perception?",
      a: "Familiar UX patterns make users feel in control, creating positive brand sentiment and trust. If a user has to learn how to open/close a sidebar in a custom way (like a non-standard swipe gesture), they attribute that frustration directly to the brand."
    }
  ],
  'gestalt-proximity': [
    {
      q: "How do I fix label-input alignment issues?",
      a: "Under the Gestalt Principle of Proximity, elements that are close together are perceived as a single group. If form label spacing is equal above and below (e.g. 12px margin), it causes visual confusion. Make the bottom margin (to the input it describes) smaller (e.g. 4px) than the top margin to the previous input (e.g. 16px)."
    },
    {
      q: "How does spacing affect grid layouts?",
      a: "By carefully adjusting spacing (margins, gaps), you create clear visual structures without adding borders or background colors, maintaining a cleaner and less cluttered UI."
    }
  ]
}

function UXPrincipleCoachConsole({ principleId }: { principleId: string }) {
  const qaList = COACH_QA[principleId] || []
  const [selectedQA, setSelectedQA] = React.useState<QAPair | null>(null)
  const [displayedAnswer, setDisplayedAnswer] = React.useState('')
  const [isTyping, setIsTyping] = React.useState(false)
  const typingTimerRef = React.useRef<NodeJS.Timeout | null>(null)

  React.useEffect(() => {
    return () => {
      if (typingTimerRef.current) {
        clearInterval(typingTimerRef.current)
      }
    }
  }, [])

  const handleQuestionSelect = (qa: QAPair) => {
    if (typingTimerRef.current) {
      clearInterval(typingTimerRef.current)
    }
    
    setSelectedQA(qa)
    setDisplayedAnswer('')
    setIsTyping(true)
    
    let index = 0
    const fullText = qa.a
    const speed = 15 // ms per character
    
    typingTimerRef.current = setInterval(() => {
      if (index < fullText.length) {
        setDisplayedAnswer((prev) => prev + fullText.charAt(index))
        index++
      } else {
        setIsTyping(false)
        if (typingTimerRef.current) {
          clearInterval(typingTimerRef.current)
        }
      }
    }, speed)
  }

  const handleReset = () => {
    if (typingTimerRef.current) {
      clearInterval(typingTimerRef.current)
    }
    setSelectedQA(null)
    setDisplayedAnswer('')
    setIsTyping(false)
  }

  return (
    <div className="mt-3 p-3.5 rounded-xl border border-uxray-primary-300/10 bg-black/30 backdrop-blur-md shadow-inner">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <div className="size-2 rounded-full bg-uxray-primary-300 animate-pulse" />
          <span className="text-xs font-mono uppercase tracking-wider text-uxray-primary-300/80 font-semibold">
            AI Coach Console
          </span>
        </div>
        {selectedQA && (
          <Button
            variant="ghost"
            size="xs"
            onClick={handleReset}
            className="h-6 text-xs hover:text-foreground text-muted-foreground py-0.5 px-2 hover:bg-muted/30"
          >
            Clear Console
          </Button>
        )}
      </div>

      {!selectedQA ? (
        <div className="space-y-1.5">
          <p className="text-xs text-muted-foreground font-sans">
            Ask the AI coach about this principle:
          </p>
          <div className="flex flex-col gap-1.5">
            {qaList.map((qa, idx) => (
              <button
                key={idx}
                onClick={() => handleQuestionSelect(qa)}
                className="text-left text-xs bg-muted/20 hover:bg-uxray-primary-300/10 hover:border-uxray-primary-300/30 text-foreground/80 hover:text-foreground p-2 rounded-lg border border-border/30 transition-all flex items-center justify-between group cursor-pointer"
              >
                <span className="font-sans line-clamp-1">{qa.q}</span>
                <ChevronRight className="size-3 text-muted-foreground group-hover:text-uxray-primary-300 transition-colors shrink-0 ml-2" />
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="bg-muted/10 p-2 rounded-lg border border-border/20">
            <span className="text-xs uppercase font-bold text-muted-foreground font-mono block">Question</span>
            <p className="text-xs text-foreground font-medium font-sans mt-0.5">{selectedQA.q}</p>
          </div>
          <div className="bg-uxray-primary-300/5 p-2.5 rounded-lg border border-uxray-primary-300/10 relative overflow-hidden">
            <span className="text-xs uppercase font-bold text-uxray-primary-300 font-mono block mb-1">
              AI Coach Response
            </span>
            <p className="text-xs text-foreground/90 font-sans leading-relaxed whitespace-pre-line">
              {displayedAnswer}
              {isTyping && <span className="inline-block w-1.5 h-3.5 ml-1 bg-uxray-primary-300 animate-pulse align-middle" />}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

/** Tab 7: AI Coach */
function CoachTab() {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* UX Principles */}
      <div>
        <h3 className="text-lg font-bold mb-1 flex items-center gap-2">
          <Brain className="size-4 text-uxray-primary-300" />
          AI Design Coach
        </h3>
        <p className="text-xs text-muted-foreground mb-4">
          UX principles mapped to issues found in this audit
        </p>
        <div className="space-y-4">
          {UX_PRINCIPLES.map((principle) => (
            <Card key={principle.id} className="glass-panel shadow-md glass-card-hover">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="size-10 rounded-xl bg-gradient-to-br from-uxray-primary-300/20 to-uxray-secondary-300/10 flex items-center justify-center shrink-0 text-uxray-secondary-300">
                    {principle.icon}
                  </div>
                  <div className="flex-1 space-y-3">
                    <div>
                      <h4 className="text-sm font-bold text-foreground">{principle.name}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">{principle.summary}</p>
                    </div>

                    <div className="p-3 rounded-lg border border-uxray-primary-300/15 bg-uxray-primary-300/5">
                      <p className="text-xs font-semibold text-uxray-primary-200 flex items-center gap-1.5 mb-1">
                        <Lightbulb className="size-3" /> How this applies here
                      </p>
                      <p className="text-xs text-foreground/80 leading-relaxed">{principle.application}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div className="rounded-lg border border-red-500/15 bg-red-500/5 p-3">
                        <span className="text-xs uppercase font-bold text-red-400 tracking-wider">Before</span>
                        <p className="text-xs mt-1 text-foreground/80">{principle.before}</p>
                      </div>
                      <div className="rounded-lg border border-emerald-500/15 bg-emerald-500/5 p-3">
                        <span className="text-xs uppercase font-bold text-emerald-400 tracking-wider">After</span>
                        <p className="text-xs mt-1 text-foreground/80">{principle.after}</p>
                      </div>
                    </div>

                    <UXPrincipleCoachConsole principleId={principle.id} />

                    {principle.relatedIssues.length > 0 && (
                      <p className="text-xs text-muted-foreground">
                        Related issues: {principle.relatedIssues.map(id => {
                          const issue = MOCK_ISSUES.find(i => i.id === id)
                          return issue ? issue.title : id
                        }).join(', ')}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Emotion & Brand Tone */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Emotion Tags */}
        <Card className="glass-panel shadow-md card-glow-purple">
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Heart className="size-4" /> Detected Emotion Tags
            </CardTitle>
            <CardDescription>Emotional attributes detected from visual and copy analysis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {EMOTION_TAGS.map((tag, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className={cn('text-xs font-bold px-2.5 py-1 rounded-full border', tag.color)}>
                  {tag.tag}
                </span>
                <div className="flex-1 h-2 bg-muted/20 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${tag.score}%` }}
                    transition={{ duration: 0.8, delay: i * 0.1 }}
                    className="h-full rounded-full bg-gradient-to-r from-uxray-primary-300 to-uxray-secondary-300"
                  />
                </div>
                <span className="text-xs font-mono font-bold text-muted-foreground w-8 text-right">{tag.score}%</span>
              </div>
            ))}
            <div className="p-3 rounded-lg border border-border/30 bg-muted/10 mt-2">
              <p className="text-xs text-foreground font-semibold">Tone Consistency Score: 76/100</p>
              <p className="text-xs text-muted-foreground mt-1">
                The design conveys a primarily professional and modern tone, but the &ldquo;Approachable&rdquo; dimension is underrepresented in the visual language compared to the copy.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Brand Personality Radar */}
        <Card className="glass-panel shadow-md card-glow-cyan">
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Megaphone className="size-4" /> Brand Personality Radar
            </CardTitle>
            <CardDescription>Multi-dimensional brand trait analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={BRAND_RADAR} cx="50%" cy="50%" outerRadius="70%">
                  <defs>
                    <linearGradient id="brandRadarFill" x1="0%" y1="0%" x2="0%" y2="100%" gradientUnits="userSpaceOnUse">
                      <stop offset="5%" stopColor="#00E5FF" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#006F80" stopOpacity={0.15} />
                    </linearGradient>
                    <linearGradient id="brandRadarStroke" x1="0%" y1="0%" x2="100%" y2="0%" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#00E5FF" />
                      <stop offset="100%" stopColor="#006F80" />
                    </linearGradient>
                  </defs>
                  <PolarGrid stroke="rgba(255,255,255,0.08)" />
                  <PolarAngleAxis
                    dataKey="trait"
                    tick={{ fill: 'var(--muted-foreground)', fontSize: 11, fontWeight: 500 }}
                  />
                  <PolarRadiusAxis
                    angle={90}
                    domain={[0, 100]}
                    tick={false}
                    axisLine={false}
                  />
                  <Radar
                    name="Brand"
                    dataKey="value"
                    stroke="url(#brandRadarStroke)"
                    fill="url(#brandRadarFill)"
                    fillOpacity={1}
                    strokeWidth={2}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: 'rgba(22,22,23,0.95)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="p-3 rounded-lg border border-border/30 bg-muted/10">
              <p className="text-xs text-muted-foreground leading-relaxed">
                <strong className="text-foreground">Key Insight:</strong> High professionalism and authority, but low playfulness may create emotional distance. Consider adding subtle micro-interactions or warmer color accents to increase approachability.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  )
}


interface PDFExportModalProps {
  isOpen: boolean
  onClose: () => void
  onComplete: () => void
}

function PDFExportModal({ isOpen, onClose, onComplete }: PDFExportModalProps) {
  const [progress, setProgress] = React.useState(0)
  const [logs, setLogs] = React.useState<string[]>([])
  
  const stages = [
    { threshold: 15, msg: "Establishing secure connection to headless PDF renderer..." },
    { threshold: 35, msg: "Capturing high-resolution canvas annotations and coordinates..." },
    { threshold: 55, msg: "Aggregating WCAG accessibility scores and color contrast checks..." },
    { threshold: 75, msg: "Structuring CSS style mappings and baseline grids..." },
    { threshold: 95, msg: "Assembling magazine-quality layout pages & PDF binary..." },
  ]

  React.useEffect(() => {
    if (!isOpen) {
      setProgress(0)
      setLogs([])
      return
    }

    setLogs(["[SYSTEM] Initiating PDF Export Pipeline v1.2.0..."])
    
    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 2
        if (next >= 100) {
          clearInterval(interval)
          setTimeout(() => {
            onComplete()
          }, 500)
          return 100
        }
        
        // Check if we passed a stage threshold to log it
        const currentStage = stages.find(s => prev < s.threshold && next >= s.threshold)
        if (currentStage) {
          setLogs(l => [...l, `[INFO] ${currentStage.msg}`])
        }
        
        return next
      })
    }, 30) // Fast visual feedback

    return () => clearInterval(interval)
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-md p-4 no-print">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-md rounded-2xl border border-uxray-primary-300/20 bg-[#09090f]/90 backdrop-blur-xl p-6 shadow-2xl overflow-hidden card-glow-purple"
      >
        {/* Shimmer line */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-uxray-primary-300 to-uxray-secondary-300" />
        
        <div className="flex items-center gap-3 mb-4">
          <Loader2 className="size-5 text-uxray-primary-300 animate-spin" />
          <h3 className="text-lg font-bold text-gradient-cyan-purple">Exporting PDF Report</h3>
        </div>
        
        <div className="space-y-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-muted-foreground">Compilation Progress</span>
              <span className="font-mono text-uxray-secondary-300">{progress}%</span>
            </div>
            {/* Progress track */}
            <div className="h-2 w-full rounded-full bg-muted/30 overflow-hidden border border-white/[0.04]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-uxray-primary-300 to-uxray-secondary-300 transition-all duration-75"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          
          {/* Logs Output Console */}
          <div className="h-44 rounded-xl border border-white/[0.04] bg-[#050508] p-3.5 font-mono text-xs leading-relaxed text-white/90 overflow-y-auto space-y-1">
            {logs.map((log, i) => (
              <div key={i} className="flex gap-1.5">
                <span className="text-white/20 select-none">[{new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}]</span>
                <span className={log.startsWith('[SYSTEM]') ? 'text-uxray-secondary-300' : log.startsWith('[INFO]') ? 'text-foreground/90' : 'text-uxray-success-300'}>
                  {log}
                </span>
              </div>
            ))}
            {progress < 100 && (
              <span className="inline-block w-1.5 h-3 bg-uxray-primary-300 animate-pulse ml-0.5 align-middle" />
            )}
          </div>

          <div className="flex justify-end pt-1">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs h-8 border-border/40 hover:bg-muted/30 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              Cancel
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════
// MAIN PAGE COMPONENT
// ═══════════════════════════════════════════════════════════════════════

export default function AuditReportPage() {
  const params = useParams()
  const auditId = params.id as string

  const audits = useMockDataStore((s) => s.audits)
  const projects = useMockDataStore((s) => s.projects)

  const [mounted, setMounted] = React.useState(false)
  const [activeTab, setActiveTab] = React.useState<TabId>('overview')
  const [isExportingPDF, setIsExportingPDF] = React.useState(false)
  const [isExportDialogOpen, setIsExportDialogOpen] = React.useState(false)
  const [isVerifyDialogOpen, setIsVerifyDialogOpen] = React.useState(false)
  const [isVerifying, setIsVerifying] = React.useState(false)
  const [isFixed, setIsFixed] = React.useState(false)

  React.useEffect(() => setMounted(true), [])

  const audit = audits.find((a) => a.id === auditId)
  const project = audit ? projects.find((p) => p.id === audit.projectId) : null

  // Update breadcrumbs
  useBreadcrumbs([
    { label: 'Audits', href: '/audits' },
    { label: audit ? `Audit ${audit.id.slice(-6)}` : 'Loading...', href: `/audits/${auditId}` },
  ])

  if (!mounted) return null

  if (!audit || !project) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <h2 className="text-2xl font-bold">Audit report not found</h2>
        <Button variant="outline" asChild>
          <Link href="/audits">
            <ArrowLeft className="mr-2 size-4" />
            Back to Audits
          </Link>
        </Button>
      </div>
    )
  }

  let scores = audit.scores || { usability: 85, accessibility: 90, performance: 88, visual: 92 }
  if (isFixed) {
    scores = { usability: 100, accessibility: 100, performance: 100, visual: 100 }
  }
  const overallScore = Math.round((scores.usability + scores.accessibility + scores.performance + scores.visual) / 4)

  const handleCopyMarkdown = () => {
    const summary = `
# UX Audit Report: ${project.name}
**Overall UX Score:** ${overallScore}%
**Audited URL:** ${project.url}
**Date of Audit:** ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}

---

## Executive Summary
This report presents design diagnostics across usability, accessibility, typography, layout consistency, and content quality. Out of ${MOCK_ISSUES.length} design violations found, we recommend prioritising the critical-severity items below to improve user acquisition and WCAG 2.2 Level AA conformance.

---

## Issues Summary (${MOCK_ISSUES.length} Total)
- **Critical:** ${MOCK_ISSUES.filter(i => i.severity === 'critical').length}
- **Serious:** ${MOCK_ISSUES.filter(i => i.severity === 'serious').length}
- **Minor:** ${MOCK_ISSUES.filter(i => i.severity === 'minor').length}

---

## Detailed Findings

${MOCK_ISSUES.map((issue, idx) => `
### ${idx + 1}. [${issue.severity.toUpperCase()}] ${issue.title}
- **Category:** ${issue.category}
- **UX Principle / Rule:** ${issue.principle}
- **Implication:** ${issue.description}
- **Feedback Context:** ${issue.details}
- **Current Layout/CSS:** 
\`\`\`
${issue.current}
\`\`\`
- **Recommended Correction:** 
\`\`\`
${issue.better}
\`\`\`
`).join('\n')}

---
*Generated by UXRay — Heuristic Auditing Engine*
    `.trim()

    navigator.clipboard.writeText(summary)
    toast.success("Structured Markdown report copied! Ready to paste into Notion or Linear.")
  }

  const handleShareLink = () => {
    const shareUrl = `${window.location.origin}/share/${audit.id}`
    navigator.clipboard.writeText(shareUrl)
    toast.success("Read-only client sharing portal link copied to clipboard!")
  }

    const handleVerifyStart = () => {
    setIsVerifying(true)
    setTimeout(() => {
      setIsVerifying(false)
      setIsFixed(true)
      setIsVerifyDialogOpen(false)
      toast.success('Verification complete! All issues have been successfully resolved.')
    }, 2500)
  }

  const handleExportPDF = () => {
    setIsExportingPDF(true)
  }

  const handlePDFComplete = () => {
    setIsExportingPDF(false)
    window.print()
    toast.success("PDF compilation complete! Opened browser print dialog.")
  }

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Back link & Header */}
      
      {isFixed && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between shadow-lg shadow-emerald-500/5 glass-panel gap-4"
        >
          <div className="flex items-center gap-3">
            <CheckCircle2 className="size-6 shrink-0" />
            <p className="text-sm font-medium"><strong>Verification Complete:</strong> All critical and serious UI issues have been completely resolved! The design now meets WCAG 2.2 AA and UX best practices.</p>
          </div>
          <Badge className="bg-emerald-500 text-white border-0 shadow-none shrink-0">100% Score</Badge>
        </motion.div>
      )}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-2">
          <Button variant="ghost" size="sm" asChild className="w-fit -ml-2 mb-1">
            <Link href={`/projects/${project.id}`}>
              <ArrowLeft className="mr-1.5 size-3.5" />
              Back to {project.name}
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Audit Report</h1>
          <p className="text-muted-foreground mt-1">
            Visual analysis diagnostics for <span className="font-semibold text-foreground">{project.name}</span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 no-print">
          
          {!isFixed && (
            <Button
              onClick={() => setIsVerifyDialogOpen(true)}
              size="sm"
              className="gap-1.5 font-semibold text-xs cursor-pointer shadow-md bg-gradient-to-r from-emerald-400 to-teal-500 text-white border-0 hover:opacity-90 animate-shimmer"
            >
              <UploadCloud className="size-3.5" />
              Verify Fixes
            </Button>
          )}
          <Button
            onClick={handleCopyMarkdown}
            variant="outline"
            className="gap-1.5 font-semibold text-xs border-border/40 hover:bg-muted/30 cursor-pointer"
          >
            <Copy className="size-3.5" />
            Copy Markdown
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExportDialogOpen(true)}
            className="gap-1.5 font-semibold text-xs border-border/40 hover:bg-muted/30 cursor-pointer text-uxray-secondary-300 border-uxray-secondary-300/30 hover:border-uxray-secondary-300/50"
          >
            <ExternalLink className="size-3.5" />
            Export Issues
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleShareLink}
            className="gap-1.5 font-semibold text-xs border-border/40 hover:bg-muted/30 cursor-pointer"
          >
            <Share2 className="size-3.5" />
            Share Report
          </Button>
          <Button
            onClick={handleExportPDF}
            size="sm"
            className="gap-1.5 font-semibold text-xs cursor-pointer shadow-md bg-gradient-to-r from-uxray-primary-300 to-uxray-secondary-300 text-white border-0 hover:opacity-90 animate-shimmer"
          >
            <Download className="size-3.5" />
            Export PDF
          </Button>
          <ScoreGauge score={overallScore} size="sm" label="Overall Score" />
        </div>
      </div>

      {/* Tabs Switcher — scrollable on mobile */}
      <div className="overflow-x-auto -mx-1 px-1 pb-1">
        <div className="flex w-fit rounded-xl p-1 bg-card/60 border border-border/40 glass-panel text-sm font-medium select-none relative">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "relative px-3 sm:px-4 py-2 rounded-lg font-semibold transition-colors duration-300 cursor-pointer z-10 flex items-center gap-1.5 whitespace-nowrap text-xs sm:text-sm",
                  isActive
                    ? "text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground/80"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="audit-tab-pill"
                    className="absolute inset-0 bg-primary rounded-lg shadow-md shadow-primary/20"
                    style={{ zIndex: -1 }}
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                {tab.icon}
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <div key={activeTab}>
          {activeTab === 'overview' && <OverviewTab scores={scores} overallScore={overallScore} isFixed={isFixed} />}
          {activeTab === 'issues' && <IssuesTab isFixed={isFixed} />}
          {activeTab === 'ai-suggestions' && <AiSuggestionsTab />}
          {activeTab === 'copy' && <CopyTab />}
          {activeTab === 'typography' && <TypographyTab />}
          {activeTab === 'accessibility' && <AccessibilityTab scores={scores} />}
          {activeTab === 'spacing' && <SpacingTab scores={scores} />}
          {activeTab === 'coach' && <CoachTab />}
          {activeTab === 'automated-scan' && <AutomatedScanTab />}
        </div>
      </AnimatePresence>

      <PDFExportModal
        isOpen={isExportingPDF}
        onClose={() => setIsExportingPDF(false)}
        onComplete={handlePDFComplete}
      />

      <ExportDialog
        open={isExportDialogOpen}
        onOpenChange={setIsExportDialogOpen}
        issues={MOCK_ISSUES.map(issue => ({
          id: issue.id,
          title: issue.title,
          severity: issue.severity,
          category: issue.category,
          description: issue.description
        }))}
        projectName={project.name}
      />

      <style>{`
        @media print {
          /* Hide non-printable app wrapper elements */
          aside, header, nav, button, select, .no-print, [role="tablist"] {
            display: none !important;
          }
          
          /* Force printable page background to white and text to dark gray */
          body, html, main, #__next, .glass-panel {
            background: #ffffff !important;
            color: #121214 !important;
            box-shadow: none !important;
            border: none !important;
          }

          /* Ensure all text is readable */
          h1, h2, h3, h4, p, span, td, th {
            color: #121214 !important;
          }

          /* Expand cards to standard A4 printing widths */
          .glass-panel {
            border: 1px solid #e2e8f0 !important;
            border-radius: 12px !important;
            margin-bottom: 20px !important;
            page-break-inside: avoid !important;
          }

          /* Ensure code snippets print cleanly */
          pre, code {
            background: #f4f4f5 !important;
            color: #09090b !important;
            border: 1px solid #e2e8f0 !important;
          }
        }
      `}</style>

      {/* Verify Fixes Dialog */}
      <Dialog open={isVerifyDialogOpen} onOpenChange={setIsVerifyDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UploadCloud className="size-5 text-emerald-500" />
              Re-upload & Verify Fixes
            </DialogTitle>
            <DialogDescription>
              Upload the updated design or provide a live URL. Our AI engine will run a diff against the previously reported issues to confirm they are resolved.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col gap-4 py-4">
            <div className="border-2 border-dashed border-border/50 rounded-xl p-8 flex flex-col items-center justify-center text-center bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer group">
              <div className="size-12 rounded-full bg-background border flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform mb-3">
                <UploadCloud className="size-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-semibold text-foreground">Click to upload or drag & drop</p>
              <p className="text-xs text-muted-foreground mt-1">SVG, PNG, JPG or Figma URL</p>
            </div>
            
            {isVerifying && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="flex flex-col items-center gap-3 p-4 bg-muted/30 rounded-lg border border-border/40 overflow-hidden"
              >
                <Loader2 className="size-6 animate-spin text-emerald-500" />
                <p className="text-sm font-medium animate-pulse text-muted-foreground">Running AI verification scan...</p>
              </motion.div>
            )}
          </div>
          
          <DialogFooter className="sm:justify-between">
            <Button variant="ghost" onClick={() => setIsVerifyDialogOpen(false)} disabled={isVerifying}>
              Cancel
            </Button>
            <Button onClick={handleVerifyStart} disabled={isVerifying} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              {isVerifying ? 'Verifying...' : 'Start Verification'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
