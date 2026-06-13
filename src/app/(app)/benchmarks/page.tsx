'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import {
  Trophy,
  TrendingUp,
  TrendingDown,
  Minus,
  Crown,
  Target,
  BarChart3,
  Sparkles,
  Eye,
  Accessibility,
  Zap,
  Palette,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Progress } from '@/components/ui/progress'
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  Legend,
} from 'recharts'
import { useBreadcrumbs } from '@/lib/hooks/use-breadcrumbs'
import { useMockDataStore } from '@/lib/stores/mock-data-store'
import { cn } from '@/lib/utils'

// ═══════════════════════════════════════════════════════════════════════
// Mock Industry Competitor Data
// ═══════════════════════════════════════════════════════════════════════

interface CompetitorScores {
  usability: number
  accessibility: number
  performance: number
  visual: number
}

interface Competitor {
  name: string
  scores: CompetitorScores
}

const INDUSTRY_DATA: Record<string, Competitor[]> = {
  SaaS: [
    { name: 'Stripe Dashboard', scores: { usability: 96, accessibility: 94, performance: 98, visual: 95 } },
    { name: 'Linear App', scores: { usability: 98, accessibility: 91, performance: 97, visual: 99 } },
    { name: 'Notion', scores: { usability: 93, accessibility: 88, performance: 90, visual: 94 } },
    { name: 'Figma', scores: { usability: 95, accessibility: 86, performance: 92, visual: 97 } },
    { name: 'Slack', scores: { usability: 91, accessibility: 90, performance: 88, visual: 89 } },
  ],
  'E-Commerce': [
    { name: 'Shopify Storefront', scores: { usability: 94, accessibility: 92, performance: 96, visual: 93 } },
    { name: 'Amazon', scores: { usability: 88, accessibility: 85, performance: 95, visual: 78 } },
    { name: 'Gumroad', scores: { usability: 92, accessibility: 89, performance: 91, visual: 96 } },
  ],
  Dashboard: [
    { name: 'Vercel Dashboard', scores: { usability: 97, accessibility: 93, performance: 99, visual: 98 } },
    { name: 'Supabase Studio', scores: { usability: 94, accessibility: 90, performance: 95, visual: 96 } },
    { name: 'Railway', scores: { usability: 91, accessibility: 87, performance: 93, visual: 94 } },
  ],
}

const METRIC_ICONS: Record<string, React.ReactNode> = {
  usability: <Eye className="size-4" />,
  accessibility: <Accessibility className="size-4" />,
  performance: <Zap className="size-4" />,
  visual: <Palette className="size-4" />,
}

const METRIC_COLORS: Record<string, string> = {
  usability: 'text-uxray-primary-300',
  accessibility: 'text-uxray-secondary-300',
  performance: 'text-uxray-warning-300',
  visual: 'text-uxray-success-300',
}

const METRIC_BAR_GRADIENTS: Record<string, string> = {
  usability: 'bg-gradient-primary',
  accessibility: 'bg-gradient-secondary',
  performance: 'bg-gradient-warning',
  visual: 'bg-gradient-success',
}

function getOverallScore(scores: CompetitorScores): number {
  return Math.round(
    (scores.usability + scores.accessibility + scores.performance + scores.visual) / 4
  )
}

// ═══════════════════════════════════════════════════════════════════════
// Page Component
// ═══════════════════════════════════════════════════════════════════════

export default function BenchmarksPage() {
  useBreadcrumbs([{ label: 'Benchmarks', href: '/benchmarks' }])

  const projects = useMockDataStore((s) => s.projects)
  const audits = useMockDataStore((s) => s.audits)
  const getLatestAudit = useMockDataStore((s) => s.getLatestAudit)

  const [selectedIndustry, setSelectedIndustry] = React.useState<string>('SaaS')
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])

  if (!mounted) return null

  // Get first project with a completed audit for comparison
  const activeProject = projects.find((p) => {
    const audit = getLatestAudit(p.id)
    return audit?.status === 'completed' && audit?.scores
  })
  const latestAudit = activeProject ? getLatestAudit(activeProject.id) : undefined
  const userScores: CompetitorScores = latestAudit?.scores ?? {
    usability: 0,
    accessibility: 0,
    performance: 0,
    visual: 0,
  }
  const userOverall = getOverallScore(userScores)
  const userProjectName = activeProject?.name ?? 'Your Site'

  // Competitor data for selected industry
  const competitors = INDUSTRY_DATA[selectedIndustry] || []

  // Industry average
  const industryAvg: CompetitorScores = {
    usability: Math.round(competitors.reduce((s, c) => s + c.scores.usability, 0) / Math.max(competitors.length, 1)),
    accessibility: Math.round(competitors.reduce((s, c) => s + c.scores.accessibility, 0) / Math.max(competitors.length, 1)),
    performance: Math.round(competitors.reduce((s, c) => s + c.scores.performance, 0) / Math.max(competitors.length, 1)),
    visual: Math.round(competitors.reduce((s, c) => s + c.scores.visual, 0) / Math.max(competitors.length, 1)),
  }
  const industryAvgOverall = getOverallScore(industryAvg)

  // Top performer
  const topPerformer = competitors.reduce(
    (best, c) => (getOverallScore(c.scores) > getOverallScore(best.scores) ? c : best),
    competitors[0] || { name: 'N/A', scores: { usability: 0, accessibility: 0, performance: 0, visual: 0 } }
  )

  // Percentile calculation: what percent of competitors does the user beat?
  const allOveralls = competitors.map((c) => getOverallScore(c.scores))
  const beaten = allOveralls.filter((s) => userOverall >= s).length
  const percentile = competitors.length > 0 ? Math.round((beaten / competitors.length) * 100) : 0
  const topPercent = 100 - percentile

  // Build leaderboard
  const leaderboardEntries = [
    ...competitors.map((c) => ({ name: c.name, scores: c.scores, isUser: false })),
    { name: userProjectName, scores: userScores, isUser: true },
  ].sort((a, b) => getOverallScore(b.scores) - getOverallScore(a.scores))

  // Radar chart data
  const radarData = [
    { metric: 'Usability', user: userScores.usability, average: industryAvg.usability, top: topPerformer.scores.usability },
    { metric: 'Accessibility', user: userScores.accessibility, average: industryAvg.accessibility, top: topPerformer.scores.accessibility },
    { metric: 'Performance', user: userScores.performance, average: industryAvg.performance, top: topPerformer.scores.performance },
    { metric: 'Visual', user: userScores.visual, average: industryAvg.visual, top: topPerformer.scores.visual },
  ]

  // Staggered animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] as const } },
  }

  return (
    <motion.div
      className="flex flex-col gap-6 pb-12"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* ── Header ──────────────────────────────────────────────────── */}
      <motion.div variants={itemVariants} className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-uxray-primary-300 uppercase tracking-widest mb-2">
            <BarChart3 className="size-3.5" />
            Competitive Intelligence
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Competitive Benchmarks</h1>
          <p className="text-muted-foreground mt-1 text-sm max-w-xl">
            See how your UX scores stack up against leading products in your industry. Identify gaps, celebrate wins, and track your competitive position.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-sm text-muted-foreground font-medium">Industry:</span>
          <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Select industry" />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(INDUSTRY_DATA).map((industry) => (
                <SelectItem key={industry} value={industry}>
                  {industry}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      {/* ── Your Position Card ──────────────────────────────────────── */}
      <motion.div variants={itemVariants}>
        <Card className="glass-panel relative overflow-hidden border border-white/[0.06] shadow-xl">
          {/* Decorative glow */}
          <div className="absolute -top-16 -right-16 size-56 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 size-56 rounded-full bg-emerald-500/8 blur-3xl pointer-events-none" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

          <CardContent className="relative z-10 p-6 sm:p-8">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              {/* Percentile Badge */}
              <div className="flex flex-col items-center gap-2 shrink-0">
                <div className="relative">
                  <div className="size-28 rounded-full bg-gradient-to-br from-primary/20 via-primary/10 to-emerald-500/10 border border-primary/20 flex items-center justify-center">
                    <div className="flex flex-col items-center">
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Top</span>
                      <span className="text-4xl font-black text-foreground leading-none">
                        {topPercent > 0 ? topPercent : 1}%
                      </span>
                    </div>
                  </div>
                  <div className="absolute -top-1 -right-1">
                    <div className="size-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
                      <Crown className="size-4 text-white" />
                    </div>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs font-semibold px-3 py-1">
                  <Trophy className="size-3 mr-1" />
                  Rank #{leaderboardEntries.findIndex((e) => e.isUser) + 1} of {leaderboardEntries.length}
                </Badge>
              </div>

              {/* Score Comparison */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="size-4 text-primary animate-pulse" />
                  <h3 className="text-lg font-bold text-foreground">{userProjectName}</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Your overall UX score of <span className="font-bold text-foreground">{userOverall}</span> places you{' '}
                  {userOverall >= industryAvgOverall ? (
                    <span className="text-emerald-400 font-semibold">above</span>
                  ) : (
                    <span className="text-amber-400 font-semibold">below</span>
                  )}{' '}
                  the {selectedIndustry} industry average of <span className="font-bold text-foreground">{industryAvgOverall}</span>.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {(Object.keys(userScores) as Array<keyof CompetitorScores>).map((metric) => {
                    const delta = userScores[metric] - industryAvg[metric]
                    return (
                      <div key={metric} className="rounded-lg bg-muted/30 border border-border/20 p-3 text-center">
                        <p className="text-xs text-muted-foreground capitalize font-medium mb-1">{metric}</p>
                        <p className="text-xl font-bold text-foreground">{userScores[metric]}</p>
                        <div className={cn(
                          'flex items-center justify-center gap-0.5 text-xs font-semibold mt-1',
                          delta > 0 ? 'text-emerald-400' : delta < 0 ? 'text-rose-400' : 'text-muted-foreground'
                        )}>
                          {delta > 0 ? <TrendingUp className="size-3" /> : delta < 0 ? <TrendingDown className="size-3" /> : <Minus className="size-3" />}
                          {delta > 0 ? '+' : ''}{delta} vs avg
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Radar Chart + Leaderboard Grid ──────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Radar Chart */}
        <motion.div variants={itemVariants}>
          <Card className="glass-panel h-full shadow-sm border border-border/40">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Target className="size-4 text-primary" />
                <CardTitle className="text-base font-semibold">Score Comparison Radar</CardTitle>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Overlay of your scores vs. industry average and top performer
              </p>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-[340px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="72%">
                    <PolarGrid stroke="hsl(var(--border))" strokeOpacity={0.3} />
                    <PolarAngleAxis
                      dataKey="metric"
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12, fontWeight: 500 }}
                    />
                    {/* Industry Average – gray dashed */}
                    <Radar
                      name="Industry Avg"
                      dataKey="average"
                      stroke="hsl(var(--muted-foreground))"
                      fill="hsl(var(--muted-foreground))"
                      fillOpacity={0.05}
                      strokeDasharray="6 3"
                      strokeWidth={1.5}
                    />
                    {/* Top Performer – emerald */}
                    <Radar
                      name={topPerformer.name}
                      dataKey="top"
                      stroke="#34d399"
                      fill="#34d399"
                      fillOpacity={0.08}
                      strokeWidth={1.5}
                    />
                    {/* Your Site – primary purple */}
                    <Radar
                      name={userProjectName}
                      dataKey="user"
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary))"
                      fillOpacity={0.15}
                      strokeWidth={2}
                    />
                    <Legend
                      wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
                      iconType="circle"
                      iconSize={8}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Leaderboard Table */}
        <motion.div variants={itemVariants}>
          <Card className="glass-panel h-full shadow-sm border border-border/40">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Trophy className="size-4 text-amber-400" />
                <CardTitle className="text-base font-semibold">Industry Leaderboard</CardTitle>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Ranked by overall UX score across all metrics
              </p>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/30">
                      <TableHead className="w-12 text-xs">#</TableHead>
                      <TableHead className="text-xs">Product</TableHead>
                      <TableHead className="text-xs text-right">Overall</TableHead>
                      <TableHead className="text-xs text-right hidden sm:table-cell">Usab.</TableHead>
                      <TableHead className="text-xs text-right hidden sm:table-cell">A11y</TableHead>
                      <TableHead className="text-xs text-right hidden md:table-cell">Perf.</TableHead>
                      <TableHead className="text-xs text-right hidden md:table-cell">Visual</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leaderboardEntries.map((entry, idx) => {
                      const overall = getOverallScore(entry.scores)
                      const rank = idx + 1
                      return (
                        <TableRow
                          key={entry.name}
                          className={cn(
                            'border-border/20 transition-colors',
                            entry.isUser && 'bg-primary/8 border-primary/20 hover:bg-primary/12'
                          )}
                        >
                          <TableCell className="font-bold text-sm">
                            {rank === 1 ? (
                              <span className="flex items-center justify-center size-6 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-white text-xs">
                                1
                              </span>
                            ) : rank === 2 ? (
                              <span className="flex items-center justify-center size-6 rounded-full bg-gradient-to-br from-gray-300 to-gray-500 text-white text-xs">
                                2
                              </span>
                            ) : rank === 3 ? (
                              <span className="flex items-center justify-center size-6 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 text-white text-xs">
                                3
                              </span>
                            ) : (
                              <span className="text-muted-foreground text-xs ml-1">{rank}</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className={cn('text-sm font-medium', entry.isUser && 'text-primary font-bold')}>
                                {entry.name}
                              </span>
                              {entry.isUser && (
                                <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-primary/30 text-primary">
                                  YOU
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <span className={cn(
                              'text-sm font-bold',
                              overall >= 95 ? 'text-emerald-400' : overall >= 85 ? 'text-foreground' : 'text-amber-400'
                            )}>
                              {overall}
                            </span>
                          </TableCell>
                          <TableCell className="text-right text-sm text-muted-foreground hidden sm:table-cell">
                            {entry.scores.usability}
                          </TableCell>
                          <TableCell className="text-right text-sm text-muted-foreground hidden sm:table-cell">
                            {entry.scores.accessibility}
                          </TableCell>
                          <TableCell className="text-right text-sm text-muted-foreground hidden md:table-cell">
                            {entry.scores.performance}
                          </TableCell>
                          <TableCell className="text-right text-sm text-muted-foreground hidden md:table-cell">
                            {entry.scores.visual}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ── Score Breakdown Cards ───────────────────────────────────── */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="size-4 text-primary" />
          <h2 className="text-lg font-semibold tracking-tight">Metric Breakdown</h2>
          <span className="text-xs text-muted-foreground ml-1">Your score vs. {selectedIndustry} average</span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {(Object.keys(userScores) as Array<keyof CompetitorScores>).map((metric, i) => {
            const yours = userScores[metric]
            const avg = industryAvg[metric]
            const delta = yours - avg
            const deltaPercent = avg > 0 ? Math.round((delta / avg) * 100) : 0

            return (
              <motion.div
                key={metric}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.08, duration: 0.4 }}
              >
                <Card className="glass-panel shadow-sm border border-border/40 h-full">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className={cn('size-8 rounded-lg bg-muted/40 border border-border/20 flex items-center justify-center', METRIC_COLORS[metric])}>
                          {METRIC_ICONS[metric]}
                        </div>
                        <span className="text-sm font-semibold capitalize text-foreground">{metric}</span>
                      </div>
                      <div className={cn(
                        'flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full',
                        delta > 0
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : delta < 0
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : 'bg-muted text-muted-foreground border border-border/30'
                      )}>
                        {delta > 0 ? <TrendingUp className="size-3" /> : delta < 0 ? <TrendingDown className="size-3" /> : <Minus className="size-3" />}
                        {delta > 0 ? '+' : ''}{deltaPercent}%
                      </div>
                    </div>

                    {/* Your Score */}
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground font-medium">Your Score</span>
                        <span className="font-bold text-foreground">{yours}</span>
                      </div>
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div
                          className={cn('h-full rounded-full transition-all duration-700', METRIC_BAR_GRADIENTS[metric])}
                          style={{ width: `${yours}%` }}
                        />
                      </div>
                    </div>

                    {/* Industry Average */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground font-medium">Industry Avg</span>
                        <span className="font-semibold text-muted-foreground">{avg}</span>
                      </div>
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-muted-foreground/30 transition-all duration-700"
                          style={{ width: `${avg}%` }}
                        />
                      </div>
                    </div>

                    {/* Delta label */}
                    <p className="text-xs text-muted-foreground mt-3 text-center">
                      {delta > 0
                        ? `${delta} points above average`
                        : delta < 0
                        ? `${Math.abs(delta)} points below average`
                        : 'On par with average'}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </motion.div>
    </motion.div>
  )
}
