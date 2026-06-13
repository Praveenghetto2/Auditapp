'use client'

import * as React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowLeft, GitCompareArrows, TrendingUp, TrendingDown, Minus,
  ChevronDown, CheckCircle2, XCircle, AlertTriangle, ArrowRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScoreGauge } from '@/components/uxray/ScoreGauge'
import { useMockDataStore } from '@/lib/stores/mock-data-store'
import { useBreadcrumbs } from '@/lib/hooks/use-breadcrumbs'
import { cn } from '@/lib/utils'
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Tooltip as RechartsTooltip, Legend
} from 'recharts'

// ═══════════════════════════════════════════════════════════════════════
// Audit Comparison Page — Side-by-side diff view
// ═══════════════════════════════════════════════════════════════════════

// Mock issues for comparison
const AUDIT_A_ISSUES = [
  { id: 'iss-1', title: 'Missing alt text on hero image', severity: 'critical' as const, resolved: false },
  { id: 'iss-2', title: 'Insufficient contrast ratio on CTA', severity: 'critical' as const, resolved: false },
  { id: 'iss-3', title: 'No keyboard nav for modal dialogs', severity: 'critical' as const, resolved: false },
  { id: 'iss-4', title: 'Inconsistent button hierarchy', severity: 'serious' as const, resolved: false },
  { id: 'iss-5', title: 'Hero copy uses passive voice', severity: 'serious' as const, resolved: false },
  { id: 'iss-6', title: 'Search input lacking label', severity: 'minor' as const, resolved: false },
]

const AUDIT_B_ISSUES = [
  { id: 'iss-1', title: 'Missing alt text on hero image', severity: 'critical' as const, resolved: true },
  { id: 'iss-2', title: 'Insufficient contrast ratio on CTA', severity: 'critical' as const, resolved: true },
  { id: 'iss-3', title: 'No keyboard nav for modal dialogs', severity: 'critical' as const, resolved: false },
  { id: 'iss-4', title: 'Inconsistent button hierarchy', severity: 'serious' as const, resolved: true },
  { id: 'iss-5', title: 'Hero copy uses passive voice', severity: 'serious' as const, resolved: true },
  { id: 'iss-6', title: 'Search input lacking label', severity: 'minor' as const, resolved: true },
  { id: 'iss-7', title: 'New: Touch target too small on mobile', severity: 'serious' as const, resolved: false },
]

const SCORES_A = { usability: 62, accessibility: 58, performance: 78, visual: 71 }
const SCORES_B = { usability: 88, accessibility: 85, performance: 91, visual: 93 }

function DeltaBadge({ before, after }: { before: number; after: number }) {
  const delta = after - before
  if (delta === 0) return <Badge variant="outline" className="text-xs text-muted-foreground border-border/40"><Minus className="size-3 mr-0.5" />0%</Badge>
  if (delta > 0) return <Badge className="text-xs bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-0"><TrendingUp className="size-3 mr-0.5" />+{delta}%</Badge>
  return <Badge className="text-xs bg-red-500/15 text-red-600 dark:text-red-400 border-0"><TrendingDown className="size-3 mr-0.5" />{delta}%</Badge>
}

function ScoreComparisonCard({ label, before, after }: { label: string; before: number; after: number }) {
  const delta = after - before
  const color = delta > 0 ? 'text-emerald-500' : delta < 0 ? 'text-red-500' : 'text-muted-foreground'
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="glass-panel border-border/40 overflow-hidden">
        <CardContent className="p-5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">{label}</p>
          <div className="flex items-end justify-between">
            <div className="flex items-baseline gap-3">
              <span className="text-lg font-bold text-muted-foreground line-through opacity-60">{before}%</span>
              <ArrowRight className="size-4 text-muted-foreground" />
              <span className={cn("text-3xl font-black", color)}>{after}%</span>
            </div>
            <DeltaBadge before={before} after={after} />
          </div>
          {/* Progress bar comparison */}
          <div className="mt-4 space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground w-12 shrink-0">Before</span>
              <div className="flex-1 h-2 rounded-full bg-muted/40 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${before}%` }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="h-full rounded-full bg-muted-foreground/30"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground w-12 shrink-0">After</span>
              <div className="flex-1 h-2 rounded-full bg-muted/40 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${after}%` }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className="h-full rounded-full bg-gradient-to-r from-uxray-primary-300 to-uxray-secondary-300"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default function AuditComparePage() {
  const audits = useMockDataStore((s) => s.audits)
  const projects = useMockDataStore((s) => s.projects)
  const completedAudits = audits.filter((a) => a.status === 'completed')

  const [auditAId, setAuditAId] = React.useState(completedAudits[0]?.id || '')
  const [auditBId, setAuditBId] = React.useState(completedAudits[1]?.id || completedAudits[0]?.id || '')

  useBreadcrumbs([
    { label: 'Audits', href: '/audits' },
    { label: 'Compare', href: '/audits/compare' },
  ])

  const auditA = completedAudits.find((a) => a.id === auditAId)
  const auditB = completedAudits.find((a) => a.id === auditBId)
  const projectA = auditA ? projects.find((p) => p.id === auditA.projectId) : null
  const projectB = auditB ? projects.find((p) => p.id === auditB.projectId) : null

  const overallA = Math.round((SCORES_A.usability + SCORES_A.accessibility + SCORES_A.performance + SCORES_A.visual) / 4)
  const overallB = Math.round((SCORES_B.usability + SCORES_B.accessibility + SCORES_B.performance + SCORES_B.visual) / 4)

  const radarData = [
    { dimension: 'Usability', before: SCORES_A.usability, after: SCORES_B.usability },
    { dimension: 'Accessibility', before: SCORES_A.accessibility, after: SCORES_B.accessibility },
    { dimension: 'Performance', before: SCORES_A.performance, after: SCORES_B.performance },
    { dimension: 'Visual', before: SCORES_A.visual, after: SCORES_B.visual },
  ]

  const resolvedCount = AUDIT_B_ISSUES.filter((i) => i.resolved).length
  const newIssues = AUDIT_B_ISSUES.filter((i) => !AUDIT_A_ISSUES.find((a) => a.id === i.id))
  const persistentIssues = AUDIT_B_ISSUES.filter((i) => !i.resolved && AUDIT_A_ISSUES.find((a) => a.id === i.id))

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-2">
          <Button variant="ghost" size="sm" asChild className="w-fit -ml-2 mb-1">
            <Link href="/audits">
              <ArrowLeft className="mr-1.5 size-3.5" />
              Back to Audits
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <GitCompareArrows className="size-8 text-uxray-primary-300" />
            Audit Comparison
          </h1>
          <p className="text-muted-foreground mt-1">
            Compare two audit runs to visualize score improvements and track issue resolution.
          </p>
        </div>
      </div>

      {/* Audit Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="glass-panel border-border/40">
          <CardContent className="p-4">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Baseline Audit (Before)</label>
            <Select value={auditAId} onValueChange={setAuditAId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select audit..." />
              </SelectTrigger>
              <SelectContent>
                {completedAudits.map((a) => {
                  const p = projects.find((pr) => pr.id === a.projectId)
                  return (
                    <SelectItem key={a.id} value={a.id}>
                      {p?.name || 'Unknown'} — {new Date(a.createdAt).toLocaleDateString()}
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
            {projectA && (
              <div className="mt-3 flex items-center gap-2">
                <ScoreGauge score={overallA} size="sm" label="Score" />
                <span className="text-sm text-muted-foreground">{projectA.name}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="glass-panel border-border/40 border-uxray-primary-300/20">
          <CardContent className="p-4">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Comparison Audit (After)</label>
            <Select value={auditBId} onValueChange={setAuditBId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select audit..." />
              </SelectTrigger>
              <SelectContent>
                {completedAudits.map((a) => {
                  const p = projects.find((pr) => pr.id === a.projectId)
                  return (
                    <SelectItem key={a.id} value={a.id}>
                      {p?.name || 'Unknown'} — {new Date(a.createdAt).toLocaleDateString()}
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
            {projectB && (
              <div className="mt-3 flex items-center gap-2">
                <ScoreGauge score={overallB} size="sm" label="Score" />
                <span className="text-sm text-muted-foreground">{projectB.name}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Overall Improvement Banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="glass-panel border-emerald-500/20 bg-emerald-500/5 overflow-hidden">
          <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="size-14 rounded-2xl bg-emerald-500/15 flex items-center justify-center">
                <TrendingUp className="size-7 text-emerald-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">+{overallB - overallA}% Overall Improvement</h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {resolvedCount} issues resolved · {newIssues.length} new issue{newIssues.length !== 1 ? 's' : ''} · {persistentIssues.length} persistent
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-center">
                <p className="text-2xl font-black text-muted-foreground">{overallA}%</p>
                <p className="text-xs text-muted-foreground">Before</p>
              </div>
              <ArrowRight className="size-5 text-muted-foreground" />
              <div className="text-center">
                <p className="text-2xl font-black text-emerald-500">{overallB}%</p>
                <p className="text-xs text-muted-foreground">After</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Score Comparison Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <ScoreComparisonCard label="Usability" before={SCORES_A.usability} after={SCORES_B.usability} />
        <ScoreComparisonCard label="Accessibility" before={SCORES_A.accessibility} after={SCORES_B.accessibility} />
        <ScoreComparisonCard label="Performance" before={SCORES_A.performance} after={SCORES_B.performance} />
        <ScoreComparisonCard label="Visual Design" before={SCORES_A.visual} after={SCORES_B.visual} />
      </div>

      {/* Radar Chart */}
      <Card className="glass-panel border-border/40">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Dimension Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="hsl(var(--border))" strokeOpacity={0.3} />
                <PolarAngleAxis dataKey="dimension" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
                <Radar name="Before" dataKey="before" stroke="#6b7280" fill="#6b7280" fillOpacity={0.15} strokeWidth={2} strokeDasharray="5 5" />
                <Radar name="After" dataKey="after" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} strokeWidth={2} />
                <Legend />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '12px',
                    color: 'hsl(var(--foreground))',
                    fontSize: '12px',
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Issues Diff Table */}
      <Card className="glass-panel border-border/40">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Issues Resolution Tracker</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {AUDIT_B_ISSUES.map((issue, i) => {
              const wasExisting = AUDIT_A_ISSUES.find((a) => a.id === issue.id)
              const isNew = !wasExisting
              const severityColor = issue.severity === 'critical' ? 'text-red-500' : issue.severity === 'serious' ? 'text-amber-500' : 'text-blue-400'

              return (
                <motion.div
                  key={issue.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border transition-colors",
                    issue.resolved
                      ? "bg-emerald-500/5 border-emerald-500/20"
                      : isNew
                        ? "bg-amber-500/5 border-amber-500/20"
                        : "bg-card/60 border-border/40"
                  )}
                >
                  {issue.resolved ? (
                    <CheckCircle2 className="size-5 text-emerald-500 shrink-0" />
                  ) : isNew ? (
                    <AlertTriangle className="size-5 text-amber-500 shrink-0" />
                  ) : (
                    <XCircle className="size-5 text-red-500 shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-sm font-medium", issue.resolved && "line-through text-muted-foreground")}>{issue.title}</p>
                  </div>
                  <Badge variant="outline" className={cn("text-xs shrink-0 border-0", severityColor)}>
                    {issue.severity}
                  </Badge>
                  {issue.resolved && <Badge className="text-xs bg-emerald-500/15 text-emerald-500 border-0 shrink-0">Resolved</Badge>}
                  {isNew && <Badge className="text-xs bg-amber-500/15 text-amber-500 border-0 shrink-0">New</Badge>}
                  {!issue.resolved && !isNew && <Badge className="text-xs bg-red-500/15 text-red-500 border-0 shrink-0">Persistent</Badge>}
                </motion.div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
