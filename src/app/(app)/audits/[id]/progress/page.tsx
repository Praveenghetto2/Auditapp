'use client'

import * as React from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ArrowRight, Check, Loader2, Circle, Terminal, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { ScoreGauge } from '@/components/uxray/ScoreGauge'
import { useMockDataStore, PIPELINE_STEPS_TEMPLATE } from '@/lib/stores/mock-data-store'
import type { PipelineStepStatus } from '@/lib/stores/mock-data-store'
import { useBreadcrumbs } from '@/lib/hooks/use-breadcrumbs'
import { cn } from '@/lib/utils'

// ═══════════════════════════════════════════════════════════════════════
// Console log messages keyed by pipeline step id
// ═══════════════════════════════════════════════════════════════════════
const CONSOLE_MESSAGES: Record<string, string[]> = {
  'screen-capture': [
    'Initializing visual crawler engine...',
    'Connecting to headless browser instance...',
    'Navigating to target URL...',
    'Waiting for page load (DOMContentLoaded)...',
    'Screenshot captured (1440×900 viewport)',
    'Screenshot captured (768×1024 tablet)',
    'Screenshot captured (375×812 mobile)',
    'All viewport captures complete ✓',
  ],
  'dom-parsing': [
    'Parsing DOM tree structure...',
    '847 nodes detected in document',
    'Extracting semantic landmarks...',
    'Building component hierarchy map...',
    'Identified 23 interactive elements',
    'DOM structure analysis complete ✓',
  ],
  'visual-analysis': [
    "Running Nielsen's 10 heuristics evaluation...",
    'Analyzing color contrast ratios...',
    'Evaluating visual hierarchy & typography...',
    'Checking consistency of design patterns...',
    'Found 3 critical issues, 5 moderate issues',
    'Heuristic evaluation complete ✓',
  ],
  'accessibility-scan': [
    'Initializing WCAG 2.2 AA compliance scanner...',
    'Checking color contrast ratios (4.5:1 target)...',
    'Validating ARIA labels and roles...',
    'Checking keyboard navigation paths...',
    'Testing screen reader compatibility...',
    'Found 2 contrast violations, 1 missing alt text',
    'Accessibility scan complete ✓',
  ],
  'layout-analysis': [
    'Analyzing 8px baseline grid alignment...',
    'Checking component spacing consistency...',
    'Evaluating responsive breakpoint behavior...',
    'Validating flex/grid layout patterns...',
    'Measuring whitespace distribution...',
    'Layout analysis complete ✓',
  ],
  'copy-analysis': [
    'Extracting text content from all elements...',
    'Analyzing reading level (Flesch-Kincaid)...',
    'Checking CTA clarity and action-orientation...',
    'Evaluating heading hierarchy structure...',
    'Scanning for jargon and ambiguous language...',
    'Copy analysis complete ✓',
  ],
  'ai-consolidation': [
    'Aggregating findings across all analyzers...',
    'Generating severity-weighted priority matrix...',
    'Computing composite UX health scores...',
    'Building actionable recommendation list...',
    'Generating comprehensive visual audit report...',
    'Report generation complete ✓',
  ],
}

// ═══════════════════════════════════════════════════════════════════════
// Step timing config (ms) — realistic variable durations
// ═══════════════════════════════════════════════════════════════════════
const STEP_DURATIONS = [2800, 2200, 3000, 2600, 2400, 2000, 3200]

// ═══════════════════════════════════════════════════════════════════════
// Console Log Entry type
// ═══════════════════════════════════════════════════════════════════════
interface LogEntry {
  time: string
  message: string
  type: 'info' | 'success' | 'warn' | 'system'
}

function getTimeString() {
  const now = new Date()
  return now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

// ═══════════════════════════════════════════════════════════════════════
// Step Icon Component
// ═══════════════════════════════════════════════════════════════════════
function StepIcon({ status }: { status: PipelineStepStatus }) {
  if (status === 'completed') {
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        className="flex items-center justify-center size-8 rounded-full bg-uxray-success-300/20 ring-2 ring-uxray-success-300"
      >
        <Check className="size-4 text-uxray-success-300" />
      </motion.div>
    )
  }
  if (status === 'active') {
    return (
      <motion.div
        animate={{
          boxShadow: [
            '0 0 0px rgba(143,26,255,0.3)',
            '0 0 20px rgba(143,26,255,0.6)',
            '0 0 0px rgba(143,26,255,0.3)',
          ],
        }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        className="flex items-center justify-center size-8 rounded-full bg-uxray-primary-300/20 ring-2 ring-uxray-primary-300"
      >
        <Loader2 className="size-4 text-uxray-primary-300 animate-spin" />
      </motion.div>
    )
  }
  if (status === 'failed') {
    return (
      <div className="flex items-center justify-center size-8 rounded-full bg-uxray-danger-300/20 ring-2 ring-uxray-danger-300">
        <span className="text-xs font-bold text-uxray-danger-300">!</span>
      </div>
    )
  }
  return (
    <div className="flex items-center justify-center size-8 rounded-full bg-muted/40 ring-2 ring-border/60">
      <Circle className="size-3 text-muted-foreground" />
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════
// Main Page Component
// ═══════════════════════════════════════════════════════════════════════
export default function AuditProgressPage() {
  const params = useParams()
  const router = useRouter()
  const auditId = params.id as string

  const audits = useMockDataStore((s) => s.audits)
  const projects = useMockDataStore((s) => s.projects)
  const auditPipelines = useMockDataStore((s) => s.auditPipelines)
  const initAuditPipeline = useMockDataStore((s) => s.initAuditPipeline)
  const updatePipelineStep = useMockDataStore((s) => s.updatePipelineStep)
  const completeAudit = useMockDataStore((s) => s.completeAudit)

  const [mounted, setMounted] = React.useState(false)
  const [currentStepIndex, setCurrentStepIndex] = React.useState(-1)
  const [isComplete, setIsComplete] = React.useState(false)
  const [logs, setLogs] = React.useState<LogEntry[]>([])
  const [progressPercent, setProgressPercent] = React.useState(0)
  const [generatedScores, setGeneratedScores] = React.useState<{
    usability: number; accessibility: number; performance: number; visual: number
  } | null>(null)
  const consoleRef = React.useRef<HTMLDivElement>(null)
  const hasStarted = React.useRef(false)

  const audit = audits.find((a) => a.id === auditId)
  const project = audit ? projects.find((p) => p.id === audit.projectId) : null
  const pipeline = auditPipelines[auditId] || []

  useBreadcrumbs([
    { label: 'Audits', href: '/audits' },
    { label: audit ? `Audit ${audit.id.slice(-6)}` : 'Loading...', href: `/audits/${auditId}` },
    { label: 'Progress', href: `/audits/${auditId}/progress` },
  ])

  React.useEffect(() => setMounted(true), [])

  // Auto-scroll console
  React.useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight
    }
  }, [logs])

  // Add log helper
  const addLog = React.useCallback((message: string, type: LogEntry['type'] = 'info') => {
    setLogs((prev) => [...prev, { time: getTimeString(), message, type }])
  }, [])

  // Initialize pipeline & run auto-progression
  React.useEffect(() => {
    if (!mounted || !audit || hasStarted.current) return
    hasStarted.current = true

    // If audit is already completed, redirect directly
    if (audit.status === 'completed') {
      router.replace(`/audits/${auditId}`)
      return
    }

    // Initialize pipeline
    initAuditPipeline(auditId)
    addLog('UXRay Visual Audit Engine v2.4.1 initialized', 'system')
    addLog(`Target: ${project?.url || 'unknown'}`, 'system')
    addLog('─'.repeat(48), 'system')

    const steps = PIPELINE_STEPS_TEMPLATE
    let stepIdx = 0

    const runStep = () => {
      if (stepIdx >= steps.length) {
        // All steps complete
        const scores = {
          usability: Math.floor(Math.random() * 12) + 84,
          accessibility: Math.floor(Math.random() * 12) + 84,
          performance: Math.floor(Math.random() * 12) + 84,
          visual: Math.floor(Math.random() * 12) + 84,
        }
        setGeneratedScores(scores)
        completeAudit(auditId, scores)
        setProgressPercent(100)
        addLog('─'.repeat(48), 'system')
        addLog('All analysis steps completed successfully', 'success')
        addLog('Visual audit report is ready for review', 'success')
        setIsComplete(true)
        return
      }

      const step = steps[stepIdx]
      const duration = STEP_DURATIONS[stepIdx]
      const messages = CONSOLE_MESSAGES[step.id] || []

      // Mark step as active
      updatePipelineStep(auditId, step.id, 'active')
      setCurrentStepIndex(stepIdx)
      setProgressPercent(Math.round(((stepIdx) / steps.length) * 100))
      addLog(`▸ ${step.icon} ${step.label}: ${step.description}`, 'info')

      // Drip-feed console messages
      const msgInterval = duration / (messages.length + 1)
      messages.forEach((msg, i) => {
        setTimeout(() => {
          const isLast = i === messages.length - 1
          addLog(msg, isLast ? 'success' : 'info')
        }, msgInterval * (i + 1))
      })

      // Complete step after duration
      setTimeout(() => {
        updatePipelineStep(auditId, step.id, 'completed')
        setProgressPercent(Math.round(((stepIdx + 1) / steps.length) * 100))
        stepIdx++
        runStep()
      }, duration)
    }

    // Start after a brief delay for the UI to mount
    setTimeout(runStep, 600)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, audit?.id])

  // ETA calculation
  const remainingSteps = PIPELINE_STEPS_TEMPLATE.length - (currentStepIndex + 1)
  const avgStepDuration = STEP_DURATIONS.reduce((a, b) => a + b, 0) / STEP_DURATIONS.length
  const etaSeconds = Math.max(0, Math.round((remainingSteps * avgStepDuration) / 1000))

  if (!mounted) return null

  if (!audit || !project) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <h2 className="text-2xl font-bold">Audit not found</h2>
        <Button variant="outline" asChild>
          <Link href="/audits">
            <ArrowLeft className="mr-2 size-4" />
            Back to Audits
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 pb-12 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/audits">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {isComplete ? (
              <span className="text-gradient-cyan-purple">Audit Complete</span>
            ) : (
              <>Scanning <span className="text-gradient-cyan-purple">{project.name}</span></>
            )}
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {isComplete
              ? 'Your visual audit report is ready for review.'
              : `Running visual analysis pipeline on ${project.url.replace(/^https?:\/\//, '')}`}
          </p>
        </div>
      </div>

      {/* Overall Progress Bar */}
      <Card className="glass-panel card-glow-cyan overflow-hidden">
        <CardContent className="py-4 px-5">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-foreground">Overall Progress</span>
              {!isComplete && (
                <motion.span
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="text-xs text-muted-foreground"
                >
                  {currentStepIndex >= 0
                    ? `Step ${currentStepIndex + 1} of ${PIPELINE_STEPS_TEMPLATE.length}`
                    : 'Initializing...'}
                </motion.span>
              )}
            </div>
            <div className="flex items-center gap-3">
              {!isComplete && etaSeconds > 0 && (
                <span className="text-xs text-muted-foreground font-mono">
                  ETA ~{etaSeconds}s
                </span>
              )}
              <span
                className={cn(
                  'text-sm font-bold font-mono tabular-nums',
                  isComplete ? 'text-uxray-success-300' : 'text-uxray-primary-300'
                )}
              >
                {progressPercent}%
              </span>
            </div>
          </div>
          {/* Progress Track */}
          <div className="relative h-2.5 w-full rounded-full bg-muted/60 overflow-hidden">
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full"
              style={{
                background: isComplete
                  ? 'linear-gradient(90deg, var(--uxray-success-300), var(--uxray-success-200))'
                  : 'linear-gradient(90deg, var(--uxray-primary-300), var(--uxray-secondary-300))',
              }}
              initial={{ width: '0%' }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
            {/* Shimmer overlay when active */}
            {!isComplete && (
              <motion.div
                className="absolute inset-y-0 w-24 rounded-full"
                style={{
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)',
                }}
                animate={{ x: ['-96px', '800px'] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              />
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Pipeline Steps — Left Column */}
        <div className="lg:col-span-2">
          <Card className="glass-panel">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Sparkles className="size-4 text-uxray-primary-300" />
                Analysis Pipeline
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-5">
              <div className="relative flex flex-col gap-0">
                {PIPELINE_STEPS_TEMPLATE.map((step, index) => {
                  const stepStatus: PipelineStepStatus =
                    pipeline[index]?.status || 'pending'
                  const isActive = stepStatus === 'active'
                  const isDone = stepStatus === 'completed'

                  return (
                    <div key={step.id} className="relative flex items-start gap-3">
                      {/* Vertical connector line */}
                      {index < PIPELINE_STEPS_TEMPLATE.length - 1 && (
                        <div
                          className={cn(
                            'absolute left-[15px] top-[32px] w-0.5 h-[calc(100%-8px)]',
                            isDone
                              ? 'bg-uxray-success-300/40'
                              : isActive
                              ? 'bg-uxray-primary-300/30'
                              : 'bg-border/40'
                          )}
                        />
                      )}

                      {/* Icon */}
                      <div className="relative z-10 shrink-0 mt-0.5">
                        <StepIcon status={stepStatus} />
                      </div>

                      {/* Content */}
                      <motion.div
                        className={cn(
                          'flex-1 py-2.5 px-3 rounded-xl mb-1 transition-colors duration-300',
                          isActive && 'bg-uxray-primary-300/5 border border-uxray-primary-300/20',
                          isDone && 'opacity-80',
                          !isActive && !isDone && 'opacity-45'
                        )}
                        animate={
                          isActive
                            ? {
                                borderColor: [
                                  'rgba(143,26,255,0.15)',
                                  'rgba(0,229,255,0.25)',
                                  'rgba(143,26,255,0.15)',
                                ],
                              }
                            : {}
                        }
                        transition={
                          isActive
                            ? { duration: 2.5, repeat: Infinity, ease: 'easeInOut' }
                            : {}
                        }
                      >
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-base">{step.icon}</span>
                          <span
                            className={cn(
                              'text-sm font-semibold',
                              isActive && 'text-foreground',
                              isDone && 'text-uxray-success-300'
                            )}
                          >
                            {step.label}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground pl-7">
                          {step.description}
                        </p>

                        {/* Micro progress bar for active step */}
                        {isActive && (
                          <div className="mt-2 ml-7 h-1 w-3/4 rounded-full bg-muted/40 overflow-hidden">
                            <motion.div
                              className="h-full rounded-full"
                              style={{
                                background:
                                  'linear-gradient(90deg, var(--uxray-primary-300), var(--uxray-secondary-300))',
                              }}
                              initial={{ width: '5%' }}
                              animate={{ width: '90%' }}
                              transition={{
                                duration: (STEP_DURATIONS[index] || 2500) / 1000,
                                ease: 'easeInOut',
                              }}
                            />
                          </div>
                        )}
                      </motion.div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Console Log — Right Column */}
        <div className="lg:col-span-3">
          <Card className="glass-panel card-glow-purple h-full flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Terminal className="size-4 text-uxray-secondary-300" />
                Live Console
                {!isComplete && (
                  <motion.span
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                    className="inline-block size-2 rounded-full bg-uxray-success-300 ml-1"
                  />
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 pb-4">
              <div
                ref={consoleRef}
                className="relative h-[380px] lg:h-[430px] overflow-y-auto rounded-xl bg-[#0a0a0f] border border-white/[0.04] p-4 font-mono text-xs leading-relaxed"
              >
                {/* Scanline overlay effect */}
                <div
                  className="pointer-events-none absolute inset-0 z-10 rounded-xl"
                  style={{
                    background:
                      'repeating-linear-gradient(0deg, rgba(255,255,255,0.01) 0px, rgba(255,255,255,0.01) 1px, transparent 1px, transparent 3px)',
                  }}
                />

                <AnimatePresence initial={false}>
                  {logs.map((log, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex gap-2 mb-0.5"
                    >
                      <span className="text-white/20 shrink-0 select-none">
                        [{log.time}]
                      </span>
                      <span
                        className={cn(
                          log.type === 'success' && 'text-uxray-success-300',
                          log.type === 'warn' && 'text-uxray-warning-300',
                          log.type === 'system' && 'text-uxray-secondary-300/70',
                          log.type === 'info' && 'text-white/90'
                        )}
                      >
                        {log.message}
                      </span>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Blinking cursor */}
                {!isComplete && (
                  <motion.span
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity }}
                    className="inline-block w-2 h-3.5 bg-uxray-secondary-300/80 ml-1 mt-1"
                  />
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Completion State */}
      <AnimatePresence>
        {isComplete && generatedScores && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <Card className="glass-panel glowing-border-pulse overflow-hidden">
              {/* Success header glow bar */}
              <div
                className="h-1 w-full"
                style={{
                  background: 'linear-gradient(90deg, var(--uxray-success-300), var(--uxray-primary-300), var(--uxray-secondary-300))',
                }}
              />
              <CardHeader className="text-center pb-2">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.2 }}
                  className="mx-auto mb-3 flex items-center justify-center size-14 rounded-full bg-uxray-success-300/15 ring-2 ring-uxray-success-300/40"
                >
                  <Check className="size-7 text-uxray-success-300" />
                </motion.div>
                <CardTitle className="text-xl">
                  <span className="text-gradient-cyan-purple">Audit Complete</span>
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  All 7 analysis steps finished successfully. Here are your scores:
                </p>
              </CardHeader>
              <CardContent className="pb-6">
                {/* Score Gauges */}
                <motion.div
                  className="grid grid-cols-2 sm:grid-cols-4 gap-6 justify-items-center py-4"
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: {},
                    visible: {
                      transition: { staggerChildren: 0.15, delayChildren: 0.3 },
                    },
                  }}
                >
                  {([
                    { key: 'usability', label: 'Usability' },
                    { key: 'accessibility', label: 'Accessibility' },
                    { key: 'performance', label: 'Performance' },
                    { key: 'visual', label: 'Visual Design' },
                  ] as const).map(({ key, label }) => (
                    <motion.div
                      key={key}
                      variants={{
                        hidden: { opacity: 0, y: 16, scale: 0.9 },
                        visible: { opacity: 1, y: 0, scale: 1 },
                      }}
                      transition={{ duration: 0.4, ease: 'easeOut' }}
                    >
                      <ScoreGauge
                        score={generatedScores[key]}
                        size="md"
                        label={label}
                      />
                    </motion.div>
                  ))}
                </motion.div>

                {/* Action Buttons */}
                <motion.div
                  className="flex justify-center gap-3 pt-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                >
                  <Button variant="outline" asChild>
                    <Link href="/audits">
                      <ArrowLeft className="mr-2 size-4" />
                      All Audits
                    </Link>
                  </Button>
                  <Button asChild className="font-semibold shadow-md gap-2">
                    <Link href={`/audits/${auditId}`}>
                      View Full Report
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
