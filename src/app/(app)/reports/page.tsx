'use client'

import * as React from 'react'
import { motion, AnimatePresence, type Variants } from 'framer-motion'
import {
  Download, Calendar, TrendingUp, Folder, Play, LayoutGrid,
  Layers, Settings, Activity, CheckCircle2, ExternalLink, ShieldAlert,
  AlertTriangle, BookOpen, Lightbulb, ChevronRight, Check, XCircle, Gauge, Copy, Loader2, CircleDot
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { useBreadcrumbs } from '@/lib/hooks/use-breadcrumbs'
import { useMockDataStore } from '@/lib/stores/mock-data-store'
import type { Project, Audit } from '@/lib/stores/mock-data-store'
import { ScoreGauge } from '@/components/uxray/ScoreGauge'
import { IssueBadge } from '@/components/uxray/IssueBadge'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line
} from 'recharts'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } }
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } }
}

// Seed trend data for baseline global reporting
const SEED_TRENDS_7D = [
  { date: 'Jun 01', Accessibility: 89, Usability: 88, Performance: 93, Visual: 90 },
  { date: 'Jun 02', Accessibility: 90, Usability: 88, Performance: 94, Visual: 90 },
  { date: 'Jun 03', Accessibility: 91, Usability: 89, Performance: 94, Visual: 91 },
  { date: 'Jun 04', Accessibility: 91, Usability: 90, Performance: 95, Visual: 91 },
  { date: 'Jun 05', Accessibility: 92, Usability: 91, Performance: 95, Visual: 92 },
]

const SEED_TRENDS_30D = [
  { date: 'May 01', Accessibility: 72, Usability: 75, Performance: 80, Visual: 70 },
  { date: 'May 08', Accessibility: 75, Usability: 78, Performance: 82, Visual: 74 },
  { date: 'May 15', Accessibility: 80, Usability: 82, Performance: 84, Visual: 81 },
  { date: 'May 22', Accessibility: 88, Usability: 85, Performance: 90, Visual: 87 },
  { date: 'May 29', Accessibility: 90, Usability: 88, Performance: 94, Visual: 90 },
  { date: 'Jun 05', Accessibility: 92, Usability: 91, Performance: 95, Visual: 92 },
]

const SEED_TRENDS_90D = [
  { date: 'Mar 15', Accessibility: 50, Usability: 55, Performance: 60, Visual: 52 },
  { date: 'Apr 01', Accessibility: 58, Usability: 62, Performance: 68, Visual: 58 },
  { date: 'Apr 15', Accessibility: 65, Usability: 68, Performance: 75, Visual: 64 },
  { date: 'May 01', Accessibility: 72, Usability: 75, Performance: 80, Visual: 70 },
  { date: 'May 15', Accessibility: 80, Usability: 82, Performance: 84, Visual: 81 },
  { date: 'Jun 05', Accessibility: 92, Usability: 91, Performance: 95, Visual: 92 },
]

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="liquid-glass-opaque p-3 rounded-xl shadow-xl text-xs space-y-1.5 min-w-[160px] no-print">
        <p className="font-bold text-foreground/90 border-b border-border/40 pb-1 font-mono">{label}</p>
        <div className="space-y-1">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <span className="size-2 rounded-full shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]" style={{ backgroundColor: entry.stroke }} />
                <span className="font-semibold text-xs">{entry.name.replace(' Average', '')}</span>
              </div>
              <span className="font-bold font-mono text-foreground">{entry.value}%</span>
            </div>
          ))}
        </div>
      </div>
    )
  }
  return null
}

// Simulated historical data for newly created projects lacking historical audits
const SIMULATED_PROJECT_HISTORY = [
  { date: 'Audit #1', Accessibility: 65, Usability: 68, Performance: 70, Visual: 62 },
  { date: 'Audit #2', Accessibility: 74, Usability: 72, Performance: 75, Visual: 70 },
  { date: 'Audit #3', Accessibility: 82, Usability: 79, Performance: 84, Visual: 78 },
  { date: 'Latest', Accessibility: 88, Usability: 85, Performance: 90, Visual: 86 },
]

// Platform-wide issues breakdown data
const PLATFORM_CATEGORIES_BREAKDOWN = [
  { name: 'Accessibility Compliance', count: 4, percent: 80, color: 'bg-gradient-primary' },
  { name: 'Spacing & Layout Consistency', count: 3, percent: 60, color: 'bg-gradient-primary' },
  { name: 'Visual Hierarchy & Radiuses', count: 2, percent: 40, color: 'bg-gradient-success' },
  { name: 'Copy Clarity & CTAs', count: 2, percent: 40, color: 'bg-gradient-warning' },
  { name: 'Heuristics & Noise', count: 1, percent: 20, color: 'bg-gradient-danger' },
]

// Highest priority critical issues aggregated platform-wide
interface PlatformPriorityIssue {
  id: string
  title: string
  project: string
  projectId: string
  category: 'Accessibility' | 'Visual' | 'Copy' | 'Layout' | 'Heuristic'
  severity: 'critical' | 'serious'
  principle: string
  impact: string
}

const PLATFORM_PRIORITY_ISSUES: PlatformPriorityIssue[] = [
  {
    id: 'iss-1',
    title: 'Missing alt text on profile avatar image',
    project: 'Acme Corp Website',
    projectId: 'proj-1',
    category: 'Accessibility',
    severity: 'critical',
    principle: 'WCAG 2.2 SC 1.1.1 — Non-text Content',
    impact: 'Assistive screen readers fail to describe user profile links to visual-impaired users.'
  },
  {
    id: 'iss-2',
    title: 'Insufficient contrast ratio on primary active tab',
    project: 'Stark Industries Portal',
    projectId: 'proj-2',
    category: 'Accessibility',
    severity: 'critical',
    principle: 'WCAG 2.2 SC 1.4.3 — Contrast (Minimum)',
    impact: 'Violet background uses white text with a 2.4:1 contrast ratio, failing AA standards.'
  },
  {
    id: 'iss-3',
    title: 'No keyboard focus trapping in modal viewports',
    project: 'Acme Corp Website',
    projectId: 'proj-1',
    category: 'Accessibility',
    severity: 'critical',
    principle: 'WCAG 2.2 SC 2.4.3 — Focus Order',
    impact: 'Keyboard tab focus leaks out of active modals to background body elements.'
  }
]

// Project specific actionable recommendations
interface ProjectRecommendation {
  id: string
  title: string
  code: string
  improvement: string
}

const PROJECT_RECOMMENDATIONS: Record<string, ProjectRecommendation[]> = {
  'proj-1': [
    {
      id: 'rec-1',
      title: 'Fix Profile Avatar Alt Tag',
      code: '<img src="profile.jpg" alt="Sarah Jenkins, Account Menu" />',
      improvement: 'Add explicit image alternative description to profile avatar links.'
    },
    {
      id: 'rec-2',
      title: 'Boost Dashboard active tab contrast',
      code: '<div className="bg-uxray-primary-300 text-white font-semibold">Dashboard</div>',
      improvement: 'Darken background active element backgrounds to meet the 4.5:1 AA contrast ratio.'
    },
    {
      id: 'rec-3',
      title: 'Activate Modal Focus Trap',
      code: 'import FocusTrap from "focus-trap-react";',
      improvement: 'Wrap pricing modals in focus traps to restrict keyboard navigations.'
    }
  ],
  'proj-2': [
    {
      id: 'rec-1',
      title: 'Standardize Card Grid Spacing',
      code: '<div className="grid grid-cols-4 gap-6">',
      improvement: 'Unify layout card gaps to 24px (8px grid base multiple).'
    },
    {
      id: 'rec-2',
      title: 'Clarify Action CTAs labels',
      code: '<Button>Start My Free Trial</Button>',
      improvement: 'Replace generic "Submit" button copy with value-driven descriptions.'
    },
    {
      id: 'rec-3',
      title: 'Expand Mobile Nav Touch Targets',
      code: '<Link className="p-3 min-h-[44px]">Settings</Link>',
      improvement: 'Enlarge menu targets to at least 44x44px to support finger tap gestures.'
    }
  ]
}

// Design standards compliance checks
interface ComplianceCheck {
  name: string
  status: 'passed' | 'failed' | 'warning'
  description: string
}

const PROJECT_COMPLIANCE_CHECKS: Record<string, ComplianceCheck[]> = {
  'proj-1': [
    { name: 'WCAG AA Color Contrast', status: 'failed', description: 'Failed on dashboard active menu background.' },
    { name: '8px Baseline Spacing Alignment', status: 'passed', description: 'Container structures aligned to spacing scale.' },
    { name: 'Interactive Touch Targets (>44px)', status: 'passed', description: 'Mobile click items meet minimum heights.' },
    { name: 'Aria Semantic Landmarks', status: 'warning', description: 'Decorative vectors missing aria-hidden tags.' },
    { name: 'Brand Voice & Tone Consistency', status: 'passed', description: 'Copy flows align with corporate guidelines.' },
  ],
  'proj-2': [
    { name: 'WCAG AA Color Contrast', status: 'passed', description: 'Foreground copy passes contrast validation.' },
    { name: '8px Baseline Spacing Alignment', status: 'failed', description: 'Mixed card gaps (16px/20px) fail grid limits.' },
    { name: 'Interactive Touch Targets (>44px)', status: 'failed', description: 'Mobile nav links measure 28px tall.' },
    { name: 'Aria Semantic Landmarks', status: 'passed', description: 'Accessibility components correctly registered.' },
    { name: 'Brand Voice & Tone Consistency', status: 'warning', description: 'Submit buttons fail CTA clarity.' },
  ]
}

export default function ReportsPage() {
  useBreadcrumbs([{ label: 'Reports', href: '/reports' }])

  const [mounted, setMounted] = React.useState(false)
  const [reportType, setReportType] = React.useState<'overall' | 'project'>('overall')
  const [projectTab, setProjectTab] = React.useState<'performance' | 'violations' | 'history'>('performance')
  const [dateRange, setDateRange] = React.useState<'7d' | '30d' | '90d'>('30d')
  
  const [isExportingGlobal, setIsExportingGlobal] = React.useState(false)
  const [isExportingProject, setIsExportingProject] = React.useState(false)

  const handleExportGlobal = () => {
    setIsExportingGlobal(true)
    setTimeout(() => {
      setIsExportingGlobal(false)
      toast.success('Global report exported successfully!')
    }, 1200)
  }

  const handleExportProject = () => {
    setIsExportingProject(true)
    setTimeout(() => {
      setIsExportingProject(false)
      toast.success('Project report exported successfully!')
    }, 1200)
  }

  const activeTrendsData = React.useMemo(() => {
    switch (dateRange) {
      case '7d':
        return SEED_TRENDS_7D
      case '90d':
        return SEED_TRENDS_90D
      case '30d':
      default:
        return SEED_TRENDS_30D
    }
  }, [dateRange])

  const projects = useMockDataStore((s) => s.projects)
  const audits = useMockDataStore((s) => s.audits)

  const [selectedProjectId, setSelectedProjectId] = React.useState<string>('')

  React.useEffect(() => {
    setMounted(true)
    if (projects.length > 0) {
      setSelectedProjectId(projects[0].id)
    }
  }, [projects])

  if (!mounted) return null

  // Aggregated Overall Metrics
  const completedAudits = audits.filter(a => a.status === 'completed' && a.scores)
  
  const overallAvgScore = completedAudits.length > 0
    ? Math.round(
        completedAudits.reduce((acc, a) => {
          if (!a.scores) return acc
          return acc + (a.scores.usability + a.scores.accessibility + a.scores.performance + a.scores.visual) / 4
        }, 0) / completedAudits.length
      )
    : 85

  // Active project selection
  const selectedProject = projects.find(p => p.id === selectedProjectId) || projects[0]
  const projectAudits = selectedProject
    ? audits.filter(a => a.projectId === selectedProject.id && a.status === 'completed' && a.scores)
    : []

  const hasProjectAudits = projectAudits.length > 0

  // Format Project Historical Chart data
  const projectHistoryData = hasProjectAudits
    ? [...projectAudits]
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        .map((a, i) => ({
          date: `Audit #${i + 1}`,
          Accessibility: a.scores?.accessibility || 0,
          Usability: a.scores?.usability || 0,
          Performance: a.scores?.performance || 0,
          Visual: a.scores?.visual || 0,
        }))
    : SIMULATED_PROJECT_HISTORY

  // Calculate project average scores
  const projectAvgScores = hasProjectAudits && selectedProject
    ? projectAudits[0].scores
    : { usability: 85, accessibility: 88, performance: 90, visual: 84 }

  const projectScore = projectAvgScores
    ? Math.round((projectAvgScores.usability + projectAvgScores.accessibility + projectAvgScores.performance + projectAvgScores.visual) / 4)
    : 80

  const recommendations = PROJECT_RECOMMENDATIONS[selectedProject?.id] || PROJECT_RECOMMENDATIONS['proj-1']
  const complianceChecks = PROJECT_COMPLIANCE_CHECKS[selectedProject?.id] || PROJECT_COMPLIANCE_CHECKS['proj-1']

  // Grade calculation helper
  const getUXGrade = (score: number) => {
    if (score >= 95) return { letter: 'A+', color: 'text-uxray-success-300 bg-uxray-success-300/10 border-uxray-success-300/20', desc: 'Outstanding compliance' }
    if (score >= 90) return { letter: 'A', color: 'text-uxray-success-300 bg-uxray-success-300/10 border-uxray-success-300/20', desc: 'Excellent UI/UX Health' }
    if (score >= 85) return { letter: 'A-', color: 'text-uxray-success-300 bg-uxray-success-300/10 border-uxray-success-300/20', desc: 'Very Good quality baseline' }
    if (score >= 80) return { letter: 'B+', color: 'text-uxray-secondary-300 bg-uxray-secondary-300/10 border-uxray-secondary-300/20', desc: 'Good quality baseline' }
    if (score >= 75) return { letter: 'B', color: 'text-uxray-secondary-300 bg-uxray-secondary-300/10 border-uxray-secondary-300/20', desc: 'Moderate visual issues' }
    if (score >= 70) return { letter: 'B-', color: 'text-uxray-secondary-300 bg-uxray-secondary-300/10 border-uxray-secondary-300/20', desc: 'Needs style refinements' }
    return { letter: 'C', color: 'text-uxray-warning-300 bg-uxray-warning-300/10 border-uxray-warning-300/20', desc: 'Requires code re-evaluation' }
  }

  const projectGrade = getUXGrade(projectScore)

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports & Trends</h1>
          <p className="text-muted-foreground mt-1">
            Monitor compliance progress and score changes across all projects.
          </p>
        </div>
        <Button onClick={handleExportGlobal} disabled={isExportingGlobal} className="shrink-0 gap-2 font-semibold shadow-md bg-primary hover:bg-primary/90 text-primary-foreground" variant="outline">
          {isExportingGlobal ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
          {isExportingGlobal ? 'Exporting...' : 'Export Global Report'}
        </Button>
      </div>

      {/* Reports Switcher Toggle */}
      <div className="flex w-fit rounded-xl p-1 bg-card/60 border border-border/40 glass-panel text-sm font-medium select-none relative">
        <button
          onClick={() => setReportType('overall')}
          className={cn(
            "relative px-4 py-2 rounded-lg font-semibold transition-colors duration-300 cursor-pointer z-10 flex items-center gap-1.5",
            reportType === 'overall'
              ? 'text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground/80'
          )}
        >
          {reportType === 'overall' && (
            <motion.div
              layoutId="report-tab-pill"
              className="absolute inset-0 bg-primary rounded-lg shadow-md shadow-primary/20"
              style={{ zIndex: -1 }}
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            />
          )}
          <Layers className="size-4" />
          Overall Report
        </button>
        <button
          onClick={() => setReportType('project')}
          className={cn(
            "relative px-4 py-2 rounded-lg font-semibold transition-colors duration-300 cursor-pointer z-10 flex items-center gap-1.5",
            reportType === 'project'
              ? 'text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground/80'
          )}
        >
          {reportType === 'project' && (
            <motion.div
              layoutId="report-tab-pill"
              className="absolute inset-0 bg-primary rounded-lg shadow-md shadow-primary/20"
              style={{ zIndex: -1 }}
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            />
          )}
          <Folder className="size-4" />
          Project Reports
        </button>
      </div>

      {/* ───────────────────────────────────────────────────────────────────
          OVERALL PLATFORM REPORT VIEW
          ─────────────────────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {reportType === 'overall' ? (
          <motion.div
            key="overall"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            {/* Top overview statistics grid */}
            <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <motion.div variants={itemVariants}>
                <Card className="glass-panel card-glow-purple h-full">
                  <CardHeader className="pb-2">
                    <CardDescription className="text-xs uppercase font-bold text-muted-foreground tracking-wider">
                      Monitored Projects
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-extrabold text-foreground">{projects.length} Active</div>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <Activity className="size-3 text-uxray-secondary-300" />
                      Continuous monitoring enabled
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Card className="glass-panel card-glow-cyan h-full">
                  <CardHeader className="pb-2">
                    <CardDescription className="text-xs uppercase font-bold text-muted-foreground tracking-wider">
                      Conducted Audits
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-extrabold text-foreground">{audits.length} Runs</div>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <CheckCircle2 className="size-3 text-uxray-success-300" />
                      Platform audits executing dynamically
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Card className="glass-panel card-glow-warning h-full">
                  <CardHeader className="pb-2">
                    <CardDescription className="text-xs uppercase font-bold text-muted-foreground tracking-wider">
                      Average Platform Score
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-extrabold text-uxray-primary-300">{overallAvgScore} / 100</div>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <TrendingUp className="size-3 text-uxray-primary-300" />
                      Overall average platform grade
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Card className="glass-panel card-glow-danger h-full">
                  <CardHeader className="pb-2">
                    <CardDescription className="text-xs uppercase font-bold text-muted-foreground tracking-wider">
                      Active Violations
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-extrabold text-uxray-danger-300">12 Issues</div>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <ShieldAlert className="size-3 text-uxray-danger-300" />
                      Critical/serious issues requiring fixes
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>

            {/* Global Area Trends Chart */}
            <div className="grid gap-6 lg:grid-cols-5">
              <Card className="glass-panel lg:col-span-3">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <CardTitle className="text-base font-bold">Design Token Compliance Progress</CardTitle>
                      <CardDescription>Average category score trajectory across all projects.</CardDescription>
                    </div>
                    <div className="flex w-fit rounded-lg p-0.5 bg-[#13131b] border border-border/40 text-xs font-semibold select-none relative gap-1">
                      {(['7d', '30d', '90d'] as const).map((range) => (
                        <button
                          key={range}
                          onClick={() => setDateRange(range)}
                          className={cn(
                            "relative px-2.5 py-1 rounded-md font-semibold transition-colors duration-300 cursor-pointer z-10 flex items-center gap-1",
                            dateRange === range
                              ? 'text-primary-foreground'
                              : 'text-muted-foreground hover:text-foreground/80'
                          )}
                        >
                          {dateRange === range && (
                            <motion.div
                              layoutId="reports-date-pill"
                              className="absolute inset-0 bg-primary rounded-md shadow shadow-primary/20"
                              style={{ zIndex: -1 }}
                              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                            />
                          )}
                          <span>
                            {range === '7d' ? '7D' : range === '30d' ? '30D' : '90D'}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-[320px] w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={activeTrendsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          {/* Accessibility (Purple/Violet) */}
                          <linearGradient id="colorAcc" x1="0%" y1="0%" x2="0%" y2="100%" gradientUnits="userSpaceOnUse">
                            <stop offset="5%" stopColor="#8F1AFF" stopOpacity={0.15} />
                            <stop offset="95%" stopColor="#7000FF" stopOpacity={0.0} />
                          </linearGradient>
                          <linearGradient id="strokeAcc" x1="0%" y1="0%" x2="100%" y2="0%" gradientUnits="userSpaceOnUse">
                            <stop offset="0%" stopColor="#A855F7" stopOpacity={0.6} />
                            <stop offset="100%" stopColor="#7000FF" stopOpacity={0.4} />
                          </linearGradient>

                          {/* Usability (Teal/Cyan) */}
                          <linearGradient id="colorUsab" x1="0%" y1="0%" x2="0%" y2="100%" gradientUnits="userSpaceOnUse">
                            <stop offset="5%" stopColor="#00E5FF" stopOpacity={0.15} />
                            <stop offset="95%" stopColor="#006F80" stopOpacity={0.0} />
                          </linearGradient>
                          <linearGradient id="strokeUsab" x1="0%" y1="0%" x2="100%" y2="0%" gradientUnits="userSpaceOnUse">
                            <stop offset="0%" stopColor="#00E5FF" stopOpacity={0.6} />
                            <stop offset="100%" stopColor="#006F80" stopOpacity={0.4} />
                          </linearGradient>

                          {/* Performance (Neon Green to Dark Green) */}
                          <linearGradient id="colorPerf" x1="0%" y1="0%" x2="0%" y2="100%" gradientUnits="userSpaceOnUse">
                            <stop offset="5%" stopColor="#00FFAA" stopOpacity={0.15} />
                            <stop offset="95%" stopColor="#008060" stopOpacity={0.0} />
                          </linearGradient>
                          <linearGradient id="strokePerf" x1="0%" y1="0%" x2="100%" y2="0%" gradientUnits="userSpaceOnUse">
                            <stop offset="0%" stopColor="#00FFC4" stopOpacity={0.6} />
                            <stop offset="100%" stopColor="#008060" stopOpacity={0.4} />
                          </linearGradient>

                          {/* Visual (Pink/Magenta) */}
                          <linearGradient id="colorVis" x1="0%" y1="0%" x2="0%" y2="100%" gradientUnits="userSpaceOnUse">
                            <stop offset="5%" stopColor="#ec4899" stopOpacity={0.15} />
                            <stop offset="95%" stopColor="#C90041" stopOpacity={0.0} />
                          </linearGradient>
                          <linearGradient id="strokeVis" x1="0%" y1="0%" x2="100%" y2="0%" gradientUnits="userSpaceOnUse">
                            <stop offset="0%" stopColor="#FF6699" stopOpacity={0.6} />
                            <stop offset="100%" stopColor="#C90041" stopOpacity={0.4} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.15} />
                        <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                        <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} domain={[40, 100]} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend verticalAlign="top" height={36} iconType="circle" />
                        <Area type="monotone" name="Accessibility Average" dataKey="Accessibility" stroke="url(#strokeAcc)" strokeWidth={2.5} fillOpacity={1} fill="url(#colorAcc)" />
                        <Area type="monotone" name="Usability Average" dataKey="Usability" stroke="url(#strokeUsab)" strokeWidth={2.5} fillOpacity={1} fill="url(#colorUsab)" />
                        <Area type="monotone" name="Performance Average" dataKey="Performance" stroke="url(#strokePerf)" strokeWidth={2.5} fillOpacity={1} fill="url(#colorPerf)" />
                        <Area type="monotone" name="Visual Average" dataKey="Visual" stroke="url(#strokeVis)" strokeWidth={2.5} fillOpacity={1} fill="url(#colorVis)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Issue Category Distribution (Platform-wide) */}
              <Card className="glass-panel lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <TrendingUp className="size-4 text-uxray-secondary-300" />
                    Platform Issues Breakdown
                  </CardTitle>
                  <CardDescription>Issue frequency distribution aggregated across all active files.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-2">
                  {PLATFORM_CATEGORIES_BREAKDOWN.map((c, i) => (
                    <div key={i} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-muted-foreground">{c.name}</span>
                        <span className="font-bold">{c.count} active</span>
                      </div>
                      <div className="relative h-2 w-full rounded-full bg-muted overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${c.percent}%` }}
                          transition={{ duration: 1, type: "spring", bounce: 0.2 }}
                          viewport={{ once: true }}
                          className={cn('absolute inset-y-0 left-0 rounded-full shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)]', c.color)}
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Highest Priority Platform Issues Board */}
            <Card className="glass-panel card-glow-danger">
              <CardHeader>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <AlertTriangle className="size-4 text-uxray-danger-300 animate-pulse" />
                  Highest Priority Platform Issues
                </CardTitle>
                <CardDescription>Top platform-wide critical errors requiring immediate code attention.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 pb-5">
                {PLATFORM_PRIORITY_ISSUES.map((issue) => (
                  <div key={issue.id} className="rounded-xl border border-red-500/15 bg-red-500/5 p-4 flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-foreground">{issue.title}</span>
                        <span className="text-xs font-bold uppercase px-2 py-0.5 rounded bg-uxray-danger-300/10 text-uxray-danger-300 border border-uxray-danger-300/20">
                          {issue.category}
                        </span>
                        <span className="text-xs font-mono font-semibold text-muted-foreground/90 bg-muted/40 px-2 py-0.5 rounded border border-border/30">
                          Project: {issue.project}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed pt-1">{issue.impact}</p>
                      <div className="text-xs italic text-muted-foreground/75 flex items-center gap-1.5 pt-0.5">
                        <BookOpen className="size-3 shrink-0" />
                        {issue.principle}
                      </div>
                    </div>
                    <Button size="sm" variant="ghost" className="text-xs font-semibold shrink-0 gap-1" asChild>
                      <Link href={`/projects/${issue.projectId}`}>
                        Inspect Project <ChevronRight className="size-3" />
                      </Link>
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Platform Projects Comparison List */}
            <div>
              <h2 className="text-xl font-bold tracking-tight mb-4">Project Overview Comparison</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {projects.map((p) => {
                  const projAudits = audits.filter(a => a.projectId === p.id && a.status === 'completed')
                  const latest = projAudits[0]
                  const avg = latest?.scores
                    ? Math.round((latest.scores.usability + latest.scores.accessibility + latest.scores.performance + latest.scores.visual) / 4)
                    : 85

                  return (
                    <Card key={p.id} className="glass-panel border border-border/40 hover:border-primary/20 transition-all duration-300">
                      <CardContent className="py-5 flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <h4 className="font-bold text-sm truncate">{p.name}</h4>
                          <a href={p.url} target="_blank" rel="noreferrer" className="text-xs text-muted-foreground/80 hover:underline flex items-center gap-1 mt-1 truncate">
                            <ExternalLink className="size-3" />
                            {p.url.replace(/^https?:\/\//, '')}
                          </a>
                          <div className="flex items-center gap-3 mt-3.5 text-xs font-semibold text-muted-foreground">
                            <span>Sector: {p.sector}</span>
                            <span>·</span>
                            <span>Audits: {projAudits.length}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 shrink-0">
                          <ScoreGauge score={avg} size="sm" />
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/projects/${p.id}`}>Inspect</Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          </motion.div>
        ) : (
          /* ───────────────────────────────────────────────────────────────────
              INDIVIDUAL PROJECT REPORT VIEW (UPGRADED NESTED SUB-TAB WORKSPACE)
              ─────────────────────────────────────────────────────────────────── */
          <motion.div
            key="project"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            {/* Project Selection Dropdown Header */}
            <Card className="glass-panel shadow-md">
              <CardContent className="py-4 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                    Select Target Project
                  </label>
                  {projects.length > 0 ? (
                    <select
                      value={selectedProjectId}
                      onChange={(e) => setSelectedProjectId(e.target.value)}
                      className="w-full sm:max-w-xs h-11 border border-border/40 rounded-xl bg-card px-3 text-sm text-foreground outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all cursor-pointer font-semibold"
                    >
                      {projects.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="text-sm text-muted-foreground">No projects found. Please create a project first.</div>
                  )}
                </div>

                {selectedProject && (
                  <div className="flex items-center gap-2 sm:ml-auto">
                    <Button variant="outline" size="sm" className="font-semibold" asChild>
                      <Link href={`/projects/${selectedProject.id}`}>
                        Project Dashboard
                      </Link>
                    </Button>
                    <Button size="sm" className="font-semibold bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5">
                      <Download className="size-4" />
                      Export Project PDF
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {selectedProject && (
              <div className="space-y-6">
                {/* Visual Workspace Sub-Navigation Menu */}
                <div className="flex border-b border-border/40 gap-6 text-sm font-semibold select-none pb-2 mt-2">
                  <button
                    onClick={() => setProjectTab('performance')}
                    className={cn(
                      "pb-2 border-b-2 cursor-pointer transition-all",
                      projectTab === 'performance' ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                    )}
                  >
                    Performance & Trends
                  </button>
                  <button
                    onClick={() => setProjectTab('violations')}
                    className={cn(
                      "pb-2 border-b-2 cursor-pointer transition-all",
                      projectTab === 'violations' ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                    )}
                  >
                    Issues & Action Plan
                  </button>
                  <button
                    onClick={() => setProjectTab('history')}
                    className={cn(
                      "pb-2 border-b-2 cursor-pointer transition-all",
                      projectTab === 'history' ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                    )}
                  >
                    Audit Timeline History
                  </button>
                </div>

                {/* Sub-tab Rendering */}
                <AnimatePresence mode="wait">
                  {projectTab === 'performance' && (
                    <motion.div
                      key="performance"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-6"
                    >
                      {/* Overall UX Health Grade Widget Row */}
                      <div className="grid gap-6 md:grid-cols-5">
                        <Card className={cn("md:col-span-2 flex flex-col justify-center items-center py-6 border border-border/40 shadow-lg text-center relative", projectGrade.color)}>
                          <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5">
                            UX HEALTH GRADE
                          </span>
                          <span className="text-6xl font-extrabold tracking-tight mb-2">
                            {projectGrade.letter}
                          </span>
                          <span className="text-xs font-semibold text-foreground/80 mb-4 px-2">
                            {projectGrade.desc}
                          </span>
                          <ScoreGauge score={projectScore} size="md" />
                        </Card>

                        <Card className="md:col-span-3 glass-panel border border-border/40">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-semibold">Project Score Details</CardTitle>
                            <CardDescription>Individual component score breakdown from the latest crawl.</CardDescription>
                          </CardHeader>
                          <CardContent className="py-4">
                            {projectAvgScores && (
                              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                                <ProjectScoreCard label="Usability" score={projectAvgScores.usability} />
                                <ProjectScoreCard label="Accessibility" score={projectAvgScores.accessibility} />
                                <ProjectScoreCard label="Performance" score={projectAvgScores.performance} />
                                <ProjectScoreCard label="Visual Design" score={projectAvgScores.visual} />
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </div>

                      {/* Score History Trends LineChart */}
                      <Card className="glass-panel">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle className="text-base font-bold">Historical Audit Progress</CardTitle>
                              <CardDescription>
                                {hasProjectAudits
                                  ? 'Category score growth over consecutive audit executions.'
                                  : 'Baseline preview trend (no historical audits conducted yet).'}
                              </CardDescription>
                            </div>
                            {!hasProjectAudits && (
                              <span className="text-xs font-extrabold uppercase bg-uxray-warning-300/10 text-uxray-warning-300 border border-uxray-warning-300/20 px-2 py-0.5 rounded-full">
                                Simulated Data
                              </span>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="h-[280px] w-full mt-2">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={projectHistoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                  <linearGradient id="lineStrokeAcc" x1="0%" y1="0%" x2="100%" y2="0%" gradientUnits="userSpaceOnUse">
                                    <stop offset="0%" stopColor="#A855F7" />
                                    <stop offset="100%" stopColor="#7000FF" />
                                  </linearGradient>
                                  <linearGradient id="lineStrokeUsab" x1="0%" y1="0%" x2="100%" y2="0%" gradientUnits="userSpaceOnUse">
                                    <stop offset="0%" stopColor="#00E5FF" />
                                    <stop offset="100%" stopColor="#006F80" />
                                  </linearGradient>
                                  <linearGradient id="lineStrokePerf" x1="0%" y1="0%" x2="100%" y2="0%" gradientUnits="userSpaceOnUse">
                                    <stop offset="0%" stopColor="#00FFC4" />
                                    <stop offset="100%" stopColor="#008060" />
                                  </linearGradient>
                                  <linearGradient id="lineStrokeVis" x1="0%" y1="0%" x2="100%" y2="0%" gradientUnits="userSpaceOnUse">
                                    <stop offset="0%" stopColor="#FF6699" />
                                    <stop offset="100%" stopColor="#C90041" />
                                  </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.1} />
                                <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={10} tickLine={false} axisLine={false} />
                                <YAxis stroke="var(--muted-foreground)" fontSize={10} tickLine={false} axisLine={false} domain={[50, 100]} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                                <Line type="monotone" name="Usability" dataKey="Usability" stroke="url(#lineStrokeUsab)" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                <Line type="monotone" name="Accessibility" dataKey="Accessibility" stroke="url(#lineStrokeAcc)" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                <Line type="monotone" name="Performance" dataKey="Performance" stroke="url(#lineStrokePerf)" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                <Line type="monotone" name="Visual" dataKey="Visual" stroke="url(#lineStrokeVis)" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}

                  {projectTab === 'violations' && (
                    <motion.div
                      key="violations"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-6"
                    >
                      {/* Issues counts and standards compliance checks */}
                      <div className="grid gap-6 md:grid-cols-5">
                        {/* Project issues severity breakdown card */}
                        <Card className="glass-panel md:col-span-2">
                          <CardHeader>
                            <CardTitle className="text-base font-bold flex items-center gap-2">
                              <ShieldAlert className="size-4 text-uxray-danger-300" />
                              Violations Breakdown
                            </CardTitle>
                            <CardDescription>Severity distribution of outstanding design violations.</CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4 pt-2">
                            <div className="flex items-center justify-between p-3 rounded-xl border border-red-500/15 bg-red-500/5">
                              <div className="flex items-center gap-2">
                                <span className="size-2.5 rounded-full bg-gradient-danger" />
                                <span className="text-xs font-semibold">Critical Errors</span>
                              </div>
                              <span className="text-xs font-bold text-uxray-danger-300">2 Active</span>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-xl border border-amber-500/15 bg-amber-500/5">
                              <div className="flex items-center gap-2">
                                <span className="size-2.5 rounded-full bg-gradient-warning" />
                                <span className="text-xs font-semibold">Serious Warnings</span>
                              </div>
                              <span className="text-xs font-bold text-uxray-warning-300">4 Active</span>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-xl border border-border/40 bg-muted/20">
                              <div className="flex items-center gap-2">
                                <span className="size-2.5 rounded-full bg-zinc-500" />
                                <span className="text-xs font-semibold">Minor Suggestions</span>
                              </div>
                              <span className="text-xs font-bold text-muted-foreground">6 Active</span>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Standards Compliance Checklist */}
                        <Card className="glass-panel md:col-span-3">
                          <CardHeader>
                            <CardTitle className="text-base font-bold flex items-center gap-2">
                              <CheckCircle2 className="size-4 text-uxray-success-300" />
                              Design Standards Checklist
                            </CardTitle>
                            <CardDescription>Evaluation of layout against primary design guidelines.</CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4 pt-2">
                            {complianceChecks.map((check, i) => (
                              <div key={i} className="flex items-start gap-2.5">
                                {check.status === 'passed' ? (
                                  <Check className="size-4 text-uxray-success-300 shrink-0 mt-0.5" />
                                ) : check.status === 'failed' ? (
                                  <XCircle className="size-4 text-uxray-danger-300 shrink-0 mt-0.5" />
                                ) : (
                                  <AlertTriangle className="size-4 text-uxray-warning-300 shrink-0 mt-0.5" />
                                )}
                                <div className="space-y-0.5">
                                  <span className="text-xs font-bold block text-foreground leading-snug">{check.name}</span>
                                  <span className="text-xs text-muted-foreground block leading-tight">{check.description}</span>
                                </div>
                              </div>
                            ))}
                          </CardContent>
                        </Card>
                      </div>

                      {/* Top Recommended Actions */}
                      <Card className="glass-panel">
                        <CardHeader>
                          <CardTitle className="text-base font-bold flex items-center gap-2">
                            <Lightbulb className="size-4 text-uxray-secondary-300" />
                            Top Recommended Actions
                          </CardTitle>
                          <CardDescription>Actionable priority fixes generated to optimize the UI code.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-2 pb-5">
                          <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-4">
                            {recommendations.map((rec, i) => (
                              <motion.div variants={itemVariants} key={rec.id} className="liquid-glass-medium rounded-xl border border-border/40 p-4 space-y-2 relative overflow-hidden group">
                                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-uxray-primary-300 to-uxray-secondary-300 opacity-80" />
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-bold text-foreground pl-1">
                                    {i + 1}. {rec.title}
                                  </span>
                                  <span className="text-xs uppercase font-bold text-uxray-secondary-300 tracking-wider">
                                    Priority Fix
                                  </span>
                                </div>
                                <p className="text-xs text-muted-foreground leading-normal pl-1">{rec.improvement}</p>
                                <div className="relative mt-3 ml-1">
                                  <pre className="text-xs font-mono text-white/90 p-3 bg-[#0a0a0f]/80 rounded-lg border border-white/10 overflow-x-auto shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)]">
                                    <code>{rec.code}</code>
                                  </pre>
                                  <Button 
                                    size="icon-xs" 
                                    variant="ghost" 
                                    className="absolute top-1.5 right-1.5 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity bg-white/10 hover:bg-white/20 text-white"
                                    onClick={() => {
                                      navigator.clipboard.writeText(rec.code)
                                      toast.success('Code copied to clipboard!')
                                    }}
                                  >
                                    <Copy className="size-3" />
                                  </Button>
                                </div>
                              </motion.div>
                            ))}
                          </motion.div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}

                  {projectTab === 'history' && (
                    <motion.div
                      key="history"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-6"
                    >
                      {/* Audit Timeline */}
                      <div>
                        <h3 className="text-lg font-bold tracking-tight mb-3">Audit Runs Timeline</h3>
                        <Card className="glass-panel overflow-hidden">
                          <CardContent className="pt-6">
                            {projectAudits.length === 0 ? (
                              <div className="p-8 text-center text-muted-foreground text-xs">
                                No completed audits found for this project. Navigate to the project dashboard to launch a crawl.
                              </div>
                            ) : (
                              <div className="relative pl-4 space-y-8 border-l border-border/40 before:absolute before:inset-0 before:-left-px before:w-[2px] before:bg-gradient-to-b before:from-primary/50 before:to-transparent before:h-full pb-4">
                                {projectAudits.map((a, i) => {
                                  const isLatest = i === 0
                                  return (
                                    <motion.div 
                                      initial={{ opacity: 0, x: -10 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: i * 0.1, type: "spring" }}
                                      key={a.id} 
                                      className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                                    >
                                      <div className="absolute -left-[21px] top-1">
                                        {isLatest ? (
                                          <div className="size-2.5 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary),0.8)] ring-4 ring-primary/20" />
                                        ) : (
                                          <div className="size-2.5 rounded-full bg-muted-foreground/30 border border-border group-hover:bg-primary/50 transition-colors" />
                                        )}
                                      </div>
                                      
                                      <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2">
                                          <span className="text-xs font-bold text-foreground">Audit #{a.id.slice(-6).toUpperCase()}</span>
                                          {isLatest && (
                                            <span className="text-xs uppercase font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded border border-primary/20">
                                              Latest
                                            </span>
                                          )}
                                        </div>
                                        <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                                          <Calendar className="size-3" />
                                          {new Date(a.createdAt).toLocaleString()}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-4">
                                        {a.scores && (
                                          <div className="flex items-center gap-2">
                                            <div className="h-1.5 w-16 bg-muted rounded-full overflow-hidden">
                                              <div 
                                                className={cn("h-full rounded-full", isLatest ? "bg-primary" : "bg-muted-foreground/40")} 
                                                style={{ width: `${Math.round((a.scores.usability + a.scores.accessibility + a.scores.performance + a.scores.visual) / 4)}%` }}
                                              />
                                            </div>
                                            <span className="text-xs font-bold font-mono">
                                              {Math.round((a.scores.usability + a.scores.accessibility + a.scores.performance + a.scores.visual) / 4)}
                                            </span>
                                          </div>
                                        )}
                                        <Button size="sm" variant="ghost" className="h-8 text-xs bg-background/50 hover:bg-background" asChild>
                                          <Link href={`/audits/${a.id}`}>Inspect Report <ChevronRight className="size-3 ml-1" /></Link>
                                        </Button>
                                      </div>
                                    </motion.div>
                                  )
                                })}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function ProjectScoreCard({ label, score }: { label: string; score: number }) {
  let scoreColor = 'text-uxray-success-300'
  if (score < 55) scoreColor = 'text-uxray-danger-300'
  else if (score < 80) scoreColor = 'text-uxray-warning-300'

  return (
    <div className="flex flex-col gap-1 rounded-lg border border-border/20 bg-muted/20 p-2.5">
      <span className="text-xs uppercase font-bold text-muted-foreground tracking-wider">{label}</span>
      <span className={cn("text-xl font-bold mt-1.5", scoreColor)}>{score}</span>
      <div className="h-1 w-full bg-muted overflow-hidden rounded-full mt-2">
        <div className="h-full bg-current rounded-full" style={{ width: `${score}%` }} />
      </div>
    </div>
  )
}
