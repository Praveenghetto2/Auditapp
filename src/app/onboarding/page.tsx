'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  PenTool, 
  Code, 
  Building, 
  ShieldAlert, 
  Sparkles, 
  Gauge, 
  Sun, 
  Moon,
  Laptop
} from 'lucide-react'
import { useAuthStore } from '@/lib/stores/auth-store'
import { useMockDataStore } from '@/lib/stores/mock-data-store'
import { toast } from 'sonner'
import { useTheme } from 'next-themes'

// ═══════════════════════════════════════════════════════════════════════
// Onboarding Experience — Cinematic 5-Step SaaS Stepper
// ═══════════════════════════════════════════════════════════════════════

const slideVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? 40 : -40,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: {
      x: { type: 'spring' as const, stiffness: 320, damping: 28 },
      opacity: { duration: 0.25 }
    }
  },
  exit: (dir: number) => ({
    x: dir < 0 ? 40 : -40,
    opacity: 0,
    transition: {
      x: { type: 'spring' as const, stiffness: 320, damping: 28 },
      opacity: { duration: 0.18 }
    }
  })
}

export default function OnboardingPage() {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  
  const user = useAuthStore((s) => s.user)
  const completeOnboarding = useAuthStore((s) => s.completeOnboarding)
  const addProject = useMockDataStore((s) => s.addProject)
  const addAudit = useMockDataStore((s) => s.addAudit)
  const completeAudit = useMockDataStore((s) => s.completeAudit)

  const [mounted, setMounted] = React.useState(false)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)

  // Onboarding States
  const [step, setStep] = React.useState<1 | 2 | 3 | 4>(1)
  const [direction, setDirection] = React.useState(1) // 1 = forward, -1 = back
  
  // Tour specific states
  const [tourTab, setTourTab] = React.useState<'contrast' | 'spacing' | 'touch'>('contrast')
  const [isTourInteracted, setIsTourInteracted] = React.useState(false)

  // Answers
  const [role, setRole] = React.useState<string>('')
  const [workspaceName, setWorkspaceName] = React.useState('')
  const [workspaceUrl, setWorkspaceUrl] = React.useState('')
  const [focusAreas, setFocusAreas] = React.useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
    if (user?.name) {
      const firstName = user.name.split(' ')[0]
      setWorkspaceName(`${firstName}'s Workspace`)
    }
  }, [user])

  // Canvas Constellation Particle Animation
  React.useEffect(() => {
    if (!mounted) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    let width = (canvas.width = canvas.offsetWidth)
    let height = (canvas.height = canvas.offsetHeight)

    interface Particle {
      x: number
      y: number
      vx: number
      vy: number
      radius: number
    }

    const particleCount = 30
    const particles: Particle[] = []

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        radius: Math.random() * 1.2 + 0.4,
      })
    }

    let mouseX = width / 2
    let mouseY = height / 2

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouseX = e.clientX - rect.left
      mouseY = e.clientY - rect.top
    }

    window.addEventListener('mousemove', handleMouseMove)

    const handleResize = () => {
      if (!canvas) return
      width = canvas.width = canvas.offsetWidth
      height = canvas.height = canvas.offsetHeight
    }

    window.addEventListener('resize', handleResize)

    const draw = () => {
      ctx.clearRect(0, 0, width, height)

      const isDark = document.documentElement.classList.contains('dark')
      const dotColor = isDark ? 'rgba(0, 229, 255, 0.1)' : 'rgba(112, 0, 255, 0.05)'
      const lineColor = isDark ? 'rgba(0, 229, 255, 0.02)' : 'rgba(112, 0, 255, 0.01)'

      particles.forEach((p) => {
        p.x += p.vx
        p.y += p.vy

        if (p.x < 0 || p.x > width) p.vx *= -1
        if (p.y < 0 || p.y > height) p.vy *= -1

        const dx = mouseX - p.x
        const dy = mouseY - p.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 150) {
          p.x += (dx / dist) * 0.04
          p.y += (dy / dist) * 0.04
        }

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fillStyle = dotColor
        ctx.fill()
      })

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const p1 = particles[i]
          const p2 = particles[j]
          const dx = p1.x - p2.x
          const dy = p1.y - p2.y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < 120) {
            ctx.beginPath()
            ctx.moveTo(p1.x, p1.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.strokeStyle = lineColor
            ctx.lineWidth = 0.5 * (1 - dist / 120)
            ctx.stroke()
          }
        }
      }

      animationFrameId = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('resize', handleResize)
    }
  }, [mounted])

  // Auto-rotate tour tabs on Step 2
  React.useEffect(() => {
    if (!mounted) return
    if (isTourInteracted) return
    if (step !== 2) return

    const tabs: ('contrast' | 'spacing' | 'touch')[] = ['contrast', 'spacing', 'touch']
    const interval = setInterval(() => {
      setTourTab((curr) => {
        const nextIndex = (tabs.indexOf(curr) + 1) % tabs.length
        return tabs[nextIndex]
      })
    }, 5500)

    return () => clearInterval(interval)
  }, [mounted, isTourInteracted, step])

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="size-6 animate-spin rounded-full border-2 border-muted/20 border-t-primary" />
      </div>
    )
  }

  // Navigation Handlers
  const handleNext = () => {
    if (step === 1 && !role) {
      toast.error('Please select your primary role to continue.')
      return
    }
    if (step === 3 && !workspaceName.trim()) {
      toast.error('Please enter a workspace name.')
      return
    }
    if (step === 4 && focusAreas.length === 0) {
      toast.error('Please select at least one visual audit focus area.')
      return
    }
    setDirection(1)
    setStep((prev) => (prev + 1) as any)
  }

  const handleBack = () => {
    setDirection(-1)
    setStep((prev) => (prev - 1) as any)
  }

  const toggleFocusArea = (area: string) => {
    setFocusAreas((prev) => 
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]
    )
  }

  const handleFinish = async () => {
    if (focusAreas.length === 0) {
      toast.error('Please select at least one visual audit focus area.')
      return
    }

    setIsSubmitting(true)
    const toastId = toast.loading('Initializing workspace and setting up design engines...')

    try {
      const defaultUrl = 'https://my-first-project.com'
      const newProject = addProject(workspaceName || 'My Workspace', defaultUrl)

      toast.loading('Deploying visual crawler & axe accessibility engine...', { id: toastId })
      const newAudit = addAudit(newProject.id)

      setTimeout(() => {
        const scores = {
          usability: focusAreas.includes('usability') ? 92 : 82,
          accessibility: focusAreas.includes('accessibility') ? 88 : 76,
          performance: focusAreas.includes('performance') ? 95 : 80,
          visual: focusAreas.includes('visual') ? 90 : 84,
        }
        completeAudit(newAudit.id, scores)
        toast.success('Your first UX/UI audit runs completed successfully!', { duration: 4000 })
      }, 5000)

      completeOnboarding()
      toast.success('Workspace created successfully!', { id: toastId })
      router.replace('/dashboard')
    } catch {
      toast.error('Failed to configure workspace. Please try again.', { id: toastId })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-background text-foreground font-sans transition-colors duration-500">
      
      {/* ── Background canvas ────────────────────────────────────────── */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <canvas ref={canvasRef} className="absolute inset-0 size-full" />
        <div className="absolute left-[-10%] top-[-10%] size-[500px] rounded-full bg-uxray-primary-300/10 dark:bg-uxray-primary-300/5 blur-[130px]" />
        <div className="absolute right-[-10%] bottom-[-10%] size-[500px] rounded-full bg-uxray-secondary-300/10 dark:bg-uxray-secondary-300/5 blur-[130px]" />
      </div>

      {/* ── Stepper Header ───────────────────────────────────────────── */}
      <header className="absolute top-0 left-0 right-0 z-50 flex h-20 items-center justify-between px-6 md:px-12 select-none">
        <div className="flex items-center gap-2">
          <div className="relative size-6 rounded-lg overflow-hidden border border-black/5 dark:border-white/10">
            <img src="/logo.png" alt="Logo" className="object-cover size-full" />
          </div>
          <span className="text-sm font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
            UXRay
          </span>
        </div>

        {/* Dynamic Progress indicator */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-muted-foreground tracking-wider">
            STEP {step} OF 4
          </span>
          <div className="flex gap-1.5">
            {([1, 2, 3, 4] as const).map((s) => {
              const active = s === step
              const passed = s < step
              return (
                <div 
                  key={s} 
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    active 
                      ? 'w-6 bg-uxray-primary-300' 
                      : passed 
                        ? 'w-2 bg-foreground/30' 
                        : 'w-2 bg-foreground/10'
                  }`}
                />
              )
            })}
          </div>
        </div>
      </header>

      {/* ── Main wizard card (Slightly wider for step 2 details) ─────── */}
      <div className="relative z-10 w-full max-w-2xl px-4 pt-12">
        <div className="rounded-3xl border border-black/[0.06] dark:border-white/[0.06] bg-white/70 dark:bg-[#161617]/75 p-6 sm:p-10 shadow-2xl dark:shadow-[0_24px_80px_rgba(0,0,0,0.85)] backdrop-blur-xl transition-colors duration-500 overflow-hidden min-h-[460px] flex flex-col justify-between">
          
          <div className="flex-1 flex flex-col justify-center">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={step}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="w-full flex flex-col gap-6"
              >
                {/* ── STEP 1: WELCOME & ROLE SELECTION ────────────────────────── */}
                {step === 1 && (
                  <div className="space-y-6">
                    <div className="space-y-2 text-center sm:text-left">
                      <div className="inline-flex size-10 items-center justify-center rounded-xl bg-uxray-primary-300/10 dark:bg-uxray-primary-300/5 text-uxray-primary-300 mb-2">
                        <Sparkles className="size-5" />
                      </div>
                      <h1 className="text-xl font-bold tracking-tight text-foreground bg-gradient-to-r from-foreground via-foreground/90 to-foreground/85 bg-clip-text text-transparent">
                        Welcome, {user?.name?.split(' ')[0] || 'Explorer'}
                      </h1>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Let&apos;s personalize your workspace. What is your primary focus area when auditing designs and interfaces?
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                      {[
                        { id: 'designer', label: 'UX/UI Designer', desc: 'Focuses on visual systems', icon: PenTool },
                        { id: 'developer', label: 'Frontend Developer', desc: 'Focuses on code & spacing', icon: Code },
                        { id: 'pm', label: 'Product Manager', desc: 'Focuses on flow & compliance', icon: Building },
                        { id: 'qa', label: 'QA / Audit Expert', desc: 'Focuses on accessibility', icon: ShieldAlert },
                      ].map((item) => {
                        const Icon = item.icon
                        const isSelected = role === item.id
                        return (
                          <button
                            key={item.id}
                            onClick={() => setRole(item.id)}
                            className={`flex flex-col items-start gap-2.5 p-3.5 rounded-2xl border text-left transition-all duration-200 cursor-pointer select-none group relative overflow-hidden ${
                              isSelected
                                ? 'bg-uxray-primary-300/5 dark:bg-uxray-primary-300/5 border-uxray-primary-300 shadow-md shadow-uxray-primary-300/5'
                                : 'bg-black/[0.01] border-black/10 dark:border-white/[0.04] hover:bg-black/5 dark:hover:bg-white/5 hover:border-black/15 dark:hover:border-white/10'
                            }`}
                          >
                            <div className={`flex size-8 items-center justify-center rounded-xl transition-colors ${
                              isSelected 
                                ? 'bg-uxray-primary-300 text-white' 
                                : 'bg-black/5 dark:bg-white/5 text-muted-foreground group-hover:text-foreground'
                            }`}>
                              <Icon className="size-4" />
                            </div>
                            <div>
                              <div className="text-xs font-bold tracking-tight">{item.label}</div>
                              <div className="text-xs text-muted-foreground mt-0.5">{item.desc}</div>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* ── STEP 2: DISCOVER UXRAY FEATURES walk-through ──────────── */}
                {step === 2 && (
                  <div className="space-y-5">
                    <div className="space-y-1.5 text-center sm:text-left">
                      <h1 className="text-xl font-bold tracking-tight text-foreground bg-gradient-to-r from-foreground via-foreground/90 to-foreground/85 bg-clip-text text-transparent">
                        Discover UXRay Capabilities
                      </h1>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Learn how our visual heuristics scanner crawls, audits, and flags design token anomalies.
                      </p>
                    </div>

                    <div className="flex flex-col md:flex-row gap-5 items-stretch min-h-[245px] pt-1">
                      {/* Left Side: Interactive tabs & explanations */}
                      <div className="flex-[4] flex flex-col gap-1.5 justify-center">
                        {[
                          { id: 'contrast', title: '🎨 Contrast Diagnostics', desc: 'Evaluates color combinations and typography scales against strict WCAG 2.2 accessibility standard checks.', icon: Sparkles },
                          { id: 'spacing', title: '📐 Spacing & Grid Alignment', desc: 'Measures exact component margins, padding configurations, and gaps to flag styling anomalies.', icon: PenTool },
                          { id: 'touch', title: '♿ Touch Target Compliance', desc: 'Finds interactive items and buttons below 48px to prevent touch collisions and fat-finger errors.', icon: ShieldAlert },
                        ].map((t) => {
                          const isActive = tourTab === t.id
                          const Icon = t.icon
                          return (
                            <button
                              key={t.id}
                              onClick={() => {
                                setTourTab(t.id as any)
                                setIsTourInteracted(true)
                              }}
                              className={`text-left p-3 rounded-2xl border transition-all cursor-pointer select-none ${
                                isActive
                                  ? 'bg-uxray-primary-300/5 dark:bg-uxray-primary-300/5 border-uxray-primary-300/40 shadow-sm'
                                  : 'bg-transparent border-transparent opacity-80 hover:opacity-95'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <Icon className={`size-3.5 ${isActive ? 'text-uxray-primary-300' : 'text-muted-foreground'}`} />
                                <span className="text-xs font-bold">{t.title}</span>
                              </div>
                              {isActive && (
                                <p className="text-xs text-muted-foreground/80 mt-1 leading-normal pl-5.5">
                                  {t.desc}
                                </p>
                              )}
                            </button>
                          )
                        })}
                      </div>

                      {/* Right Side: Miniature visual preview graphics */}
                      <div className="flex-[3] rounded-2xl border border-black/5 dark:border-white/[0.06] bg-black/[0.02] dark:bg-white/[0.02] p-4 flex flex-col justify-center items-center relative overflow-hidden select-none min-h-[170px] md:min-h-0 bg-white dark:bg-black/35 shadow-inner">
                        
                        {/* 1. Contrast Preview */}
                        {tourTab === 'contrast' && (
                          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full space-y-3.5 text-center">
                            <div className="relative p-2.5 rounded-xl border border-uxray-success-200/20 bg-uxray-success-50/5 inline-block w-full">
                              <span className="absolute -top-2 right-2 bg-success text-success-foreground font-mono text-[6px] px-1 py-0.5 rounded font-bold shadow-sm leading-none">7.4:1 Pass</span>
                              <div className="text-xs font-bold text-foreground">Premium Layout</div>
                            </div>
                            <div className="relative p-2.5 rounded-xl border border-rose-500/20 bg-rose-500/5 inline-block w-full">
                              <span className="absolute -top-2 right-2 bg-rose-500 text-success-foreground font-mono text-[6px] px-1 py-0.5 rounded font-bold shadow-sm leading-none">2.1:1 Fail</span>
                              <div className="text-xs font-medium text-black/25 dark:text-white/20">Faint subtitle text</div>
                            </div>
                          </motion.div>
                        )}

                        {/* 2. Spacing Preview */}
                        {tourTab === 'spacing' && (
                          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full flex flex-col items-center justify-center h-full relative">
                            {/* Columns overlay */}
                            <div className="absolute inset-0 flex gap-2 justify-center opacity-10">
                              <div className="w-4 h-full bg-pink-500" />
                              <div className="w-4 h-full bg-pink-500" />
                              <div className="w-4 h-full bg-pink-500" />
                              <div className="w-4 h-full bg-pink-500" />
                            </div>
                            {/* Spacing card */}
                            <div className="relative border border-dashed border-pink-500 bg-pink-500/5 p-4 rounded-lg flex flex-col gap-2 w-4/5 text-center z-10">
                              <div className="h-1.5 w-1/3 mx-auto bg-black/10 dark:bg-white/10 rounded" />
                              <div className="h-2 w-4/5 mx-auto bg-black/20 dark:bg-white/20 rounded" />
                              {/* Rulers */}
                              <div className="absolute left-[-16px] top-1/2 -translate-y-1/2 h-8 w-[1px] bg-pink-500 flex items-center justify-start pointer-events-none">
                                <span className="ml-1 bg-pink-500 text-success-foreground font-mono text-[5px] px-0.5 rounded leading-none py-0.5">padding:12px</span>
                                <div className="absolute top-0 left-[-1px] w-[3px] h-[1px] bg-pink-500" />
                                <div className="absolute bottom-0 left-[-1px] w-[3px] h-[1px] bg-pink-500" />
                              </div>
                            </div>
                          </motion.div>
                        )}

                        {/* 3. Touch target Preview */}
                        {tourTab === 'touch' && (
                          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full flex flex-col gap-5 items-center justify-center">
                            {/* Compliant button */}
                            <div className="relative inline-block w-4/5">
                              <button className="h-7 w-full rounded bg-foreground text-background text-xs font-bold">Compliant Target</button>
                              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 size-10 border border-success bg-success/10 rounded-full flex items-center justify-center">
                                <span className="bg-success text-success-foreground font-mono text-[5px] px-0.5 rounded leading-none font-bold shadow-sm py-0.5">40px</span>
                              </div>
                            </div>
                            {/* Failed small target */}
                            <div className="relative inline-block w-3/5">
                              <button className="h-4 w-full rounded bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 text-[7px] text-muted-foreground leading-none">Small Target</button>
                              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 size-10 border border-dashed border-rose-500 bg-rose-500/10 rounded-full flex items-center justify-center">
                                <span className="bg-rose-500 text-success-foreground font-mono text-[5px] px-0.5 rounded leading-none font-bold shadow-sm py-0.5">20px Fail</span>
                              </div>
                            </div>
                          </motion.div>
                        )}

                        
                      </div>
                    </div>
                  </div>
                )}

                {/* ── STEP 3: WORKSPACE SETUP ───────────────────────────────── */}
                {step === 3 && (
                  <div className="space-y-6">
                    <div className="space-y-2 text-center sm:text-left">
                      <div className="inline-flex size-10 items-center justify-center rounded-xl bg-uxray-secondary-300/10 dark:bg-uxray-secondary-300/5 text-uxray-secondary-300 mb-2">
                        <Building className="size-5" />
                      </div>
                      <h1 className="text-xl font-bold tracking-tight text-foreground bg-gradient-to-r from-foreground via-foreground/90 to-foreground/85 bg-clip-text text-transparent">
                        Create Your Workspace
                      </h1>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Specify a name for your organization workspace and choose your default interface theme configuration.
                      </p>
                    </div>

                    <div className="space-y-4 pt-2">
                      <div className="flex flex-col">
                        <label htmlFor="ws-name" className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                          Workspace Name
                        </label>
                        <input
                          id="ws-name"
                          type="text"
                          value={workspaceName}
                          onChange={(e) => setWorkspaceName(e.target.value)}
                          className="peer w-full h-11 border border-black/10 dark:border-white/[0.06] rounded-xl bg-black/[0.01] dark:bg-[#1c1c1e]/80 px-4 mt-1.5 text-sm text-foreground hover:border-black/20 dark:hover:border-uxray-primary-300/35 focus:border-uxray-primary-300 dark:focus:border-uxray-primary-300 focus:ring-4 focus:ring-uxray-primary-300/5 dark:focus:ring-uxray-primary-300/15 outline-none transition-all duration-200"
                          placeholder="My Workspace"
                          required
                        />
                      </div>

                      {/* Theme Toggle option */}
                      <div className="flex flex-col gap-2">
                        <span className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                          Default Interface Theme
                        </span>
                        <div className="grid grid-cols-3 gap-3.5 mt-0.5">
                          {[
                            { id: 'light', label: 'Light Theme', icon: Sun },
                            { id: 'dark', label: 'Dark Mode', icon: Moon },
                            { id: 'system', label: 'System Default', icon: Laptop },
                          ].map((t) => {
                            const Icon = t.icon
                            const isSelected = theme === t.id
                            return (
                              <button
                                key={t.id}
                                onClick={() => setTheme(t.id)}
                                className={`flex flex-col items-center justify-center gap-1.5 py-3 rounded-2xl border text-center transition-all cursor-pointer select-none ${
                                  isSelected
                                    ? 'bg-uxray-primary-300/5 dark:bg-uxray-primary-300/5 border-uxray-primary-300 shadow shadow-uxray-primary-300/5'
                                    : 'bg-black/[0.01] border-black/10 dark:border-white/[0.04] hover:bg-black/5 dark:hover:bg-white/5'
                                }`}
                              >
                                <Icon className={`size-4.5 ${isSelected ? 'text-uxray-primary-300' : 'text-muted-foreground'}`} />
                                <span className="text-xs font-semibold">{t.label}</span>
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── STEP 4: FOCUS AREAS ───────────────────────────────────── */}
                {step === 4 && (
                  <div className="space-y-6">
                    <div className="space-y-2 text-center sm:text-left">
                      <div className="inline-flex size-10 items-center justify-center rounded-xl bg-pink-500/10 dark:bg-pink-500/5 text-pink-500 mb-2">
                        <PenTool className="size-5" />
                      </div>
                      <h1 className="text-xl font-bold tracking-tight text-foreground bg-gradient-to-r from-foreground via-foreground/90 to-foreground/85 bg-clip-text text-transparent">
                        Choose Visual Focus Areas
                      </h1>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Select which heuristic categories UXRay should monitor and score on your dashboard pages.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-2 pt-2 select-none">
                      {[
                        { id: 'accessibility', label: '♿ Accessibility (WCAG 2.2)', desc: 'Contrast violations, touch target compliance, screen reader attributes', color: 'border-l-rose-500' },
                        { id: 'usability', label: '📐 Layout & Spacing', desc: 'Consistent margins, flex gaps, border grids, layout alignment rules', color: 'border-l-pink-500' },
                        { id: 'performance', label: '⚡ Core Web Vitals', desc: 'Largest Contentful Paint, Layout Shift (CLS), DOM node complexity', color: 'border-l-cyan-500' },
                        { id: 'visual', label: '👁️ Visual Design & Branding', desc: 'Font scaling matching style guides, media aspect ratios, element hierarchies', color: 'border-l-indigo-500' },
                      ].map((item) => {
                        const isSelected = focusAreas.includes(item.id)
                        return (
                          <button
                            key={item.id}
                            onClick={() => toggleFocusArea(item.id)}
                            className={`flex items-start gap-3.5 p-3 rounded-2xl border text-left transition-all duration-200 cursor-pointer border-l-3 ${item.color} ${
                              isSelected
                                ? 'bg-foreground/[0.02] border-foreground/15 dark:border-white/10 shadow-sm'
                                : 'bg-black/[0.01] border-black/10 dark:border-white/[0.04] opacity-65 hover:opacity-100'
                            }`}
                          >
                            <div className={`flex size-4.5 shrink-0 mt-0.5 items-center justify-center rounded-full border transition-colors ${
                              isSelected 
                                ? 'bg-uxray-primary-300 border-uxray-primary-300 text-white' 
                                : 'border-muted-foreground/30 bg-transparent'
                            }`}>
                              {isSelected && <Check className="size-3 stroke-[3px]" />}
                            </div>
                            <div>
                              <div className="text-xs font-bold tracking-tight">{item.label}</div>
                              <div className="text-xs text-muted-foreground/80 mt-0.5 leading-relaxed">{item.desc}</div>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          </div>

          {/* ── Stepper Navigation Buttons ───────────────────────────── */}
          <div className="flex items-center justify-between border-t border-black/5 dark:border-white/[0.06] pt-6 mt-8">
            <button
              onClick={handleBack}
              disabled={step === 1}
              className={`h-9 px-4 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all focus:outline-none select-none ${
                step === 1 
                  ? 'opacity-0 pointer-events-none' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 border border-black/5 dark:border-white/5 cursor-pointer'
              }`}
            >
              <ArrowLeft className="size-3.5" />
              Back
            </button>

            {step < 4 ? (
              <button
                onClick={handleNext}
                className="h-9 px-4 bg-foreground text-background text-xs font-bold rounded-xl flex items-center gap-1.5 hover:opacity-90 transition-all focus:outline-none cursor-pointer select-none"
              >
                Continue
                <ArrowRight className="size-3.5" />
              </button>
            ) : (
              <button
                onClick={handleFinish}
                disabled={isSubmitting}
                className="relative overflow-hidden group h-9 px-5 bg-gradient-to-r from-uxray-primary-300 to-uxray-secondary-300 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 hover:from-uxray-primary-400 hover:to-uxray-secondary-400 transition-all focus:outline-none shadow shadow-uxray-primary-300/10 cursor-pointer disabled:opacity-80 select-none"
              >
                <div className="absolute inset-0 w-[50%] h-full bg-white/20 skew-x-[-25deg] -translate-x-[150%] group-hover:translate-x-[250%] transition-transform duration-1000 ease-out" />
                Build Workspace & Run
                <ArrowRight className="size-3.5" />
              </button>
            )}
          </div>

        </div>
      </div>
      
    </div>
  )
}
