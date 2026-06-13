'use client'

import { useParams } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import {
  Shield,
  Eye,
  Zap,
  Palette,
  AlertTriangle,
  AlertCircle,
  Info,
  Lightbulb,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Calendar,
  Globe,
  Lock,
  Sparkles,
} from 'lucide-react'

/* ─── Animated section wrapper ────────────────────────────────────── */
function AnimatedSection({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode
  className?: string
  delay?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 32 }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/* ─── SVG Circular Gauge ──────────────────────────────────────────── */
function CircularGauge({
  value,
  size = 180,
  strokeWidth = 12,
  colorClass,
  label,
}: {
  value: number
  size?: number
  strokeWidth?: number
  colorClass: string
  label?: string
}) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const progress = (value / 100) * circumference
  const center = size / 2

  const colorMap: Record<string, string> = {
    primary: 'var(--primary)',
    success: 'var(--uxray-success-300)',
    warning: 'var(--uxray-warning-300)',
    secondary: 'var(--uxray-secondary-300)',
    danger: 'var(--uxray-danger-300)',
  }

  const strokeColor = colorMap[colorClass] || colorMap.primary

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        {/* Background track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/40"
        />
        {/* Progress arc */}
        <motion.circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - progress }}
          transition={{ duration: 1.4, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          style={{ filter: `drop-shadow(0 0 8px ${strokeColor}40)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="text-4xl font-bold text-foreground tracking-tight"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          style={{ fontSize: size > 120 ? '2.25rem' : '1.25rem' }}
        >
          {value}%
        </motion.span>
        {label && (
          <span
            className="text-muted-foreground mt-0.5"
            style={{ fontSize: size > 120 ? '0.875rem' : '0.7rem' }}
          >
            {label}
          </span>
        )}
      </div>
    </div>
  )
}

/* ─── Mini Gauge for Score Cards ──────────────────────────────────── */
function MiniGauge({
  value,
  color,
}: {
  value: number
  color: string
}) {
  const size = 80
  const strokeWidth = 7
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const progress = (value / 100) * circumference
  const center = size / 2

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/30"
        />
        <motion.circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - progress }}
          transition={{ duration: 1.2, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          style={{ filter: `drop-shadow(0 0 6px ${color}50)` }}
        />
      </svg>
      <span className="absolute text-lg font-bold text-foreground">{value}%</span>
    </div>
  )
}

/* ─── Mock Data ───────────────────────────────────────────────────── */
const REPORT = {
  project: 'Acme Corp Website',
  url: 'https://acmecorp.example.com',
  auditDate: 'June 13, 2026',
  overallScore: 86,
  status: 'Completed',
  scores: [
    { label: 'Usability', value: 85, icon: Eye, color: 'var(--primary)', glowClass: 'card-glow-purple' },
    { label: 'Accessibility', value: 92, icon: Shield, color: 'var(--uxray-success-300)', glowClass: 'card-glow-success' },
    { label: 'Performance', value: 78, icon: Zap, color: 'var(--uxray-warning-300)', glowClass: 'card-glow-warning' },
    { label: 'Visual Design', value: 88, icon: Palette, color: 'var(--uxray-secondary-300)', glowClass: 'card-glow-cyan' },
  ],
  severities: [
    { label: 'Critical', count: 3, color: 'bg-red-500' },
    { label: 'Serious', count: 4, color: 'bg-orange-500' },
    { label: 'Minor', count: 5, color: 'bg-yellow-500' },
  ],
  criticalIssues: [
    {
      title: 'Missing alt text on hero images',
      category: 'Accessibility',
      description:
        'Three primary hero images lack descriptive alt attributes, preventing screen-reader users from understanding key page content.',
    },
    {
      title: 'CTA button has insufficient color contrast',
      category: 'Visual Design',
      description:
        'The primary call-to-action button fails WCAG AA contrast ratio (2.8:1 measured vs 4.5:1 required) on the pricing page.',
    },
    {
      title: 'Mobile nav menu unreachable via keyboard',
      category: 'Usability',
      description:
        'The hamburger menu toggle and its dropdown items cannot be activated using keyboard navigation, blocking non-mouse users.',
    },
  ],
  recommendations: [
    {
      icon: Shield,
      title: 'Implement ARIA landmarks',
      description:
        'Add proper ARIA roles and landmarks throughout the page structure to improve assistive technology navigation and WCAG 2.1 compliance.',
      priority: 'High',
    },
    {
      icon: Zap,
      title: 'Optimize image loading pipeline',
      description:
        'Convert hero and product images to WebP/AVIF formats, implement responsive srcsets, and add lazy-loading to reduce LCP by an estimated 40%.',
      priority: 'Medium',
    },
    {
      icon: Palette,
      title: 'Establish consistent spacing scale',
      description:
        'Adopt an 8px baseline grid and standardize component margins to improve visual rhythm, hierarchy, and overall design cohesion.',
      priority: 'Medium',
    },
  ],
}

const categoryColors: Record<string, string> = {
  Accessibility: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  'Visual Design': 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
  Usability: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
}

const priorityColors: Record<string, string> = {
  High: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
  Medium: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  Low: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
}

/* ═══════════════════════════════════════════════════════════════════ */
/*  PAGE COMPONENT                                                    */
/* ═══════════════════════════════════════════════════════════════════ */
export default function SharedReportPage() {
  const params = useParams<{ token: string }>()

  return (
    <div className="min-h-screen bg-background relative">
      {/* ── Subtle grid background ──────────────────────────────── */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage:
            'linear-gradient(rgba(0,0,0,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.015) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />
      <div
        className="pointer-events-none fixed inset-0 z-0 hidden dark:block"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* ── Ambient gradient blobs ──────────────────────────────── */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-[300px] left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute top-[40%] -right-[200px] w-[500px] h-[500px] rounded-full bg-uxray-secondary-300/5 blur-[100px]" />
        <div className="absolute bottom-[10%] -left-[200px] w-[400px] h-[400px] rounded-full bg-uxray-success-300/5 blur-[100px]" />
      </div>

      {/* ━━━ HEADER BAR ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 border-b border-border/60 glass-panel"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-purple-600 shadow-lg shadow-primary/25">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-foreground">
                UX<span className="text-primary">Ray</span>
              </span>
            </div>
            <div className="hidden sm:block h-5 w-px bg-border/60 mx-1" />
            <span className="hidden sm:inline text-sm text-muted-foreground font-medium">
              Shared Audit Report
            </span>
          </div>

          <Badge
            variant="outline"
            className="gap-1.5 px-3 py-1 text-xs font-medium border-primary/20 text-primary bg-primary/5"
          >
            <Lock className="h-3 w-3" />
            Powered by UXRay
          </Badge>
        </div>
      </motion.header>

      {/* ━━━ MAIN CONTENT ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <main className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10 sm:space-y-14">

        {/* ── HERO SECTION ──────────────────────────────────────── */}
        <AnimatedSection>
          <div className="glass-panel rounded-2xl shadow-lg overflow-hidden">
            {/* Top accent bar */}
            <div className="h-1 w-full bg-gradient-to-r from-primary via-purple-500 to-uxray-secondary-300" />

            <div className="p-6 sm:p-10 flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
              {/* Left: Project info */}
              <div className="flex-1 text-center lg:text-left space-y-4">
                <div className="inline-flex items-center gap-2">
                  <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 gap-1.5 px-2.5 py-0.5 text-xs font-medium">
                    <CheckCircle2 className="h-3 w-3" />
                    {REPORT.status}
                  </Badge>
                </div>

                <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
                  {REPORT.project}
                </h1>

                <div className="flex flex-col sm:flex-row items-center lg:items-start gap-3 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <Globe className="h-4 w-4" />
                    <a
                      href={REPORT.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-primary transition-colors underline underline-offset-2 decoration-border"
                    >
                      {REPORT.url}
                    </a>
                  </span>
                  <span className="hidden sm:inline">·</span>
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    {REPORT.auditDate}
                  </span>
                </div>

                <p className="text-sm text-muted-foreground max-w-md mx-auto lg:mx-0 leading-relaxed">
                  Comprehensive heuristic analysis covering usability, accessibility, performance, and visual design dimensions.
                </p>
              </div>

              {/* Right: Overall Score Gauge */}
              <div className="flex-shrink-0">
                <div className="relative">
                  <CircularGauge
                    value={REPORT.overallScore}
                    size={200}
                    strokeWidth={14}
                    colorClass="primary"
                    label="Overall Score"
                  />
                  {/* Subtle glow ring */}
                  <div className="absolute inset-0 rounded-full bg-primary/5 blur-2xl -z-10 scale-125" />
                </div>
              </div>
            </div>
          </div>
        </AnimatedSection>

        {/* ── SCORE BREAKDOWN ───────────────────────────────────── */}
        <AnimatedSection delay={0.1}>
          <div className="space-y-5">
            <h2 className="text-xl font-semibold text-foreground tracking-tight">
              Score Breakdown
            </h2>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {REPORT.scores.map((metric, i) => {
                const Icon = metric.icon
                return (
                  <motion.div
                    key={metric.label}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                    className={cn(
                      'glass-panel glass-card-hover rounded-2xl p-5 flex flex-col items-center gap-3 relative overflow-hidden',
                      metric.glowClass
                    )}
                  >
                    <MiniGauge value={metric.value} color={metric.color} />
                    <div className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      {metric.label}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </AnimatedSection>

        {/* ── KEY FINDINGS ──────────────────────────────────────── */}
        <AnimatedSection delay={0.15}>
          <div className="space-y-5">
            <h2 className="text-xl font-semibold text-foreground tracking-tight">
              Key Findings
            </h2>

            <div className="glass-panel rounded-2xl shadow-lg overflow-hidden">
              {/* Severity pills */}
              <div className="p-5 sm:p-6 border-b border-border/40">
                <div className="flex flex-wrap items-center gap-4">
                  <span className="text-sm text-muted-foreground font-medium mr-1">
                    Issues Found
                  </span>
                  {REPORT.severities.map((sev) => (
                    <div key={sev.label} className="flex items-center gap-2">
                      <span className={cn('h-2.5 w-2.5 rounded-full', sev.color)} />
                      <span className="text-sm font-medium text-foreground">{sev.count}</span>
                      <span className="text-sm text-muted-foreground">{sev.label}</span>
                    </div>
                  ))}
                  <Badge
                    variant="outline"
                    className="ml-auto text-xs text-muted-foreground border-border/60"
                  >
                    {REPORT.severities.reduce((a, s) => a + s.count, 0)} Total
                  </Badge>
                </div>
              </div>

              {/* Critical issues list */}
              <div className="divide-y divide-border/30">
                {REPORT.criticalIssues.map((issue, i) => (
                  <motion.div
                    key={issue.title}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
                    className="p-5 sm:p-6 flex gap-4 items-start hover:bg-muted/20 transition-colors"
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      <div className="h-8 w-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-semibold text-foreground">
                          {issue.title}
                        </h3>
                        <Badge
                          variant="outline"
                          className={cn(
                            'text-[10px] px-2 py-0',
                            categoryColors[issue.category]
                          )}
                        >
                          {issue.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {issue.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </AnimatedSection>

        {/* ── RECOMMENDATIONS ──────────────────────────────────── */}
        <AnimatedSection delay={0.2}>
          <div className="space-y-5">
            <h2 className="text-xl font-semibold text-foreground tracking-tight">
              Recommendations
            </h2>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {REPORT.recommendations.map((rec, i) => {
                const Icon = rec.icon
                return (
                  <motion.div
                    key={rec.title}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 + i * 0.12 }}
                    className="glass-panel glass-card-hover rounded-2xl p-6 flex flex-col gap-4 relative overflow-hidden"
                  >
                    {/* Icon + Priority row */}
                    <div className="flex items-start justify-between">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <Badge
                        variant="outline"
                        className={cn(
                          'text-[10px] px-2 py-0 font-medium',
                          priorityColors[rec.priority]
                        )}
                      >
                        {rec.priority} Priority
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-sm font-semibold text-foreground leading-tight">
                        {rec.title}
                      </h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {rec.description}
                      </p>
                    </div>

                    <div className="mt-auto pt-2">
                      <span className="inline-flex items-center gap-1 text-xs text-primary font-medium hover:underline cursor-pointer transition-colors">
                        View details
                        <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </AnimatedSection>

        {/* ── CTA BANNER ───────────────────────────────────────── */}
        <AnimatedSection delay={0.25}>
          <div className="glass-panel rounded-2xl shadow-lg overflow-hidden relative">
            <div className="h-0.5 w-full bg-gradient-to-r from-uxray-success-300 via-primary to-uxray-secondary-300" />
            <div className="p-6 sm:p-8 text-center space-y-4">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-primary/10 mx-auto">
                <Lightbulb className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">
                Want the full detailed report?
              </h3>
              <p className="text-sm text-muted-foreground max-w-lg mx-auto">
                This is an executive summary. Request full access to explore every finding, annotated screenshots, remediation guidance, and team collaboration tools.
              </p>
              <a
                href="#"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-primary-foreground bg-gradient-to-r from-primary to-purple-600 shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Request Full Access
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>
        </AnimatedSection>
      </main>

      {/* ━━━ FOOTER ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="relative z-10 border-t border-border/40 mt-8"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                This report was generated by{' '}
                <span className="font-semibold text-foreground">
                  UX<span className="text-primary">Ray</span>
                </span>{' '}
                — Heuristic Auditing Engine
              </p>
              <p className="text-xs text-muted-foreground/70">
                © {new Date().getFullYear()} UXRay. All rights reserved.
              </p>
            </div>

            <a
              href="#"
              className="inline-flex items-center gap-1.5 text-sm text-primary font-medium hover:underline underline-offset-2 transition-colors"
            >
              Request full access
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>

          {/* Share token reference */}
          <div className="mt-4 pt-4 border-t border-border/20 flex items-center justify-center">
            <span className="text-[10px] text-muted-foreground/50 font-mono tracking-wider">
              REPORT TOKEN: {params.token}
            </span>
          </div>
        </div>
      </motion.footer>
    </div>
  )
}
