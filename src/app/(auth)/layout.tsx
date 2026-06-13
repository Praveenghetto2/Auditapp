'use client'

import * as React from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from 'next-themes'
import { Sun, Moon, Sparkles, Check, AlertCircle } from 'lucide-react'
import { useAuthStore } from '@/lib/stores/auth-store'

// ═══════════════════════════════════════════════════════════════════════
// Auth Layout — Cinematic SaaS Experience
// ═══════════════════════════════════════════════════════════════════════

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const [mounted, setMounted] = React.useState(false)
  
  const containerRef = React.useRef<HTMLDivElement>(null)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)

  // Interactive Playground States
  const [activeTab, setActiveTab] = React.useState<'contrast' | 'spacing' | 'touch'>('contrast')
  const [isHovered, setIsHovered] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Redirect if already logged in
  React.useEffect(() => {
    if (mounted && isAuthenticated) {
      router.replace('/dashboard')
    }
  }, [mounted, isAuthenticated, router])

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

    const particleCount = 40
    const particles: Particle[] = []

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
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
      const dotColor = isDark ? 'rgba(0, 229, 255, 0.12)' : 'rgba(112, 0, 255, 0.06)'
      const lineColor = isDark ? 'rgba(0, 229, 255, 0.03)' : 'rgba(112, 0, 255, 0.015)'
      const mouseLineColor = isDark ? 'rgba(0, 229, 255, 0.06)' : 'rgba(112, 0, 255, 0.03)'

      particles.forEach((p) => {
        p.x += p.vx
        p.y += p.vy

        if (p.x < 0 || p.x > width) p.vx *= -1
        if (p.y < 0 || p.y > height) p.vy *= -1

        // Mouse attraction physics
        const dx = mouseX - p.x
        const dy = mouseY - p.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 130) {
          p.x += (dx / dist) * 0.06
          p.y += (dy / dist) * 0.06
        }

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fillStyle = dotColor
        ctx.fill()
      })

      // Draw lines between particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const p1 = particles[i]
          const p2 = particles[j]
          const dx = p1.x - p2.x
          const dy = p1.y - p2.y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < 110) {
            ctx.beginPath()
            ctx.moveTo(p1.x, p1.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.strokeStyle = lineColor
            ctx.lineWidth = 0.5 * (1 - dist / 110)
            ctx.stroke()
          }
        }
      }

      // Draw connecting lines to mouse
      particles.forEach((p) => {
        const dx = mouseX - p.x
        const dy = mouseY - p.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 130) {
          ctx.beginPath()
          ctx.moveTo(mouseX, mouseY)
          ctx.lineTo(p.x, p.y)
          ctx.strokeStyle = mouseLineColor
          ctx.lineWidth = 0.5 * (1 - dist / 130)
          ctx.stroke()
        }
      })

      animationFrameId = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('resize', handleResize)
    }
  }, [mounted, theme])

  // Auto-rotate the active tab in the playground
  React.useEffect(() => {
    if (!mounted) return
    if (isHovered) return

    const tabs: ('contrast' | 'spacing' | 'touch')[] = ['contrast', 'spacing', 'touch']
    const interval = setInterval(() => {
      setActiveTab((curr) => {
        const nextIndex = (tabs.indexOf(curr) + 1) % tabs.length
        return tabs[nextIndex]
      })
    }, 4500)

    return () => clearInterval(interval)
  }, [mounted, isHovered])

  // Mouse Glow Effect Coordinator
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    containerRef.current.style.setProperty('--mouse-x', `${x}px`)
    containerRef.current.style.setProperty('--mouse-y', `${y}px`)
  }

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (isAuthenticated) return null

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative flex min-h-screen w-full flex-col overflow-hidden bg-background text-foreground transition-colors duration-500 font-sans"
      style={{
        ['--mouse-x' as any]: '50%',
        ['--mouse-y' as any]: '50%',
      }}
    >
      {/* ── Immersive Canvas and Ambient Backdrop ───────────────────── */}
      <div className="pointer-events-none absolute inset-0 z-0">
        {/* HTML5 Particle Canvas */}
        <canvas ref={canvasRef} className="absolute inset-0 size-full" />

        {/* Faint static neon blurs */}
        <div className="absolute -left-[5%] top-[-5%] size-[550px] rounded-full bg-uxray-primary-300/10 dark:bg-uxray-primary-300/5 blur-[120px]" />
        <div className="absolute right-[5%] bottom-[-5%] size-[550px] rounded-full bg-uxray-secondary-300/10 dark:bg-uxray-secondary-300/5 blur-[120px]" />
      </div>

      {/* ── Minimalist Top Navigation Header ────────────────────────── */}
      <header className="absolute top-0 left-0 right-0 z-50 flex h-20 items-center justify-between px-6 md:px-12 select-none pointer-events-none">
        {/* Logo and branding */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-3 pointer-events-auto cursor-pointer"
          onClick={() => router.push('/')}
        >
          <div className="relative size-8 overflow-hidden rounded-xl border border-black/5 dark:border-white/10 shadow-sm shadow-black/5">
            <Image 
              src="/logo.png" 
              alt="UXRay Logo" 
              fill 
              className="object-cover" 
              priority
            />
          </div>
          <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-foreground/80 bg-clip-text text-transparent">
            UXRay
          </span>
        </motion.div>

        {/* Light/Dark Toggle */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="pointer-events-auto"
        >
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="relative flex size-9 items-center justify-center rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.02] text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 transition-all shadow-sm focus-visible:outline-none"
            aria-label="Toggle Theme"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-transform duration-500 dark:-rotate-90 dark:scale-0 text-amber-500" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-transform duration-500 dark:rotate-0 dark:scale-100 text-indigo-400" />
          </button>
        </motion.div>
      </header>

      {/* ── Content Grid Splitter ─────────────────────────────────────── */}
      <div className="relative z-10 flex min-h-screen w-full flex-col lg:flex-row">
        
        {/* Left: Interactive UX Auditing Sandbox Panel */}
        <div className="relative hidden w-full lg:flex lg:w-1/2 flex-col justify-center items-center px-12 xl:px-24 pt-24 pb-12 border-r border-black/[0.03] dark:border-white/[0.03]">
          
          <div className="relative flex flex-1 items-center justify-center w-full max-w-lg">
            
            {/* Visual Container */}
            <div 
              className="relative w-full aspect-[4/3] rounded-2xl border border-black/5 dark:border-white/[0.06] bg-white/40 dark:bg-[#121212]/50 backdrop-blur-md shadow-2xl dark:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.7)] flex flex-col overflow-hidden"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              
              {/* Window Header */}
              <div className="h-7 border-b border-black/5 dark:border-white/[0.06] flex items-center px-3 gap-1.5 bg-black/[0.01] dark:bg-white/[0.01]">
                <div className="size-2 rounded-full bg-uxray-danger-300/60" />
                <div className="size-2 rounded-full bg-uxray-warning-300/60" />
                <div className="size-2 rounded-full bg-success/60" />
                <div className="h-4 flex-1 rounded bg-black/5 dark:bg-white/5 mx-8 flex items-center justify-center text-xs text-muted-foreground tracking-wider font-mono select-none">
                  uxray.ai/audit/workspace
                </div>
              </div>

              {/* Playground Tab Controls */}
              <div className="flex border-b border-black/5 dark:border-white/[0.06] bg-black/[0.02] dark:bg-white/[0.02] p-1.5 gap-1 text-xs font-semibold text-muted-foreground select-none">
                {[
                  { id: 'contrast', label: 'Contrast Heuristics' },
                  { id: 'spacing', label: 'Spacing & Grid' },
                  { id: 'touch', label: 'Touch Targets' },
                ].map((t) => {
                  const isActive = activeTab === t.id
                  return (
                    <button
                      key={t.id}
                      onClick={() => setActiveTab(t.id as any)}
                      className={`flex-1 py-1 rounded-md text-center transition-all cursor-pointer ${
                        isActive
                          ? 'bg-white dark:bg-[#1c1c1e] text-foreground shadow-sm border border-black/5 dark:border-white/[0.04]'
                          : 'hover:text-foreground hover:bg-black/[0.02] dark:hover:bg-white/[0.02]'
                      }`}
                    >
                      {t.label}
                    </button>
                  )
                })}
              </div>

              {/* Simulated Audited Canvas Area */}
              <div className="relative flex-1 p-5 flex flex-col justify-center gap-4 bg-white dark:bg-[#080808]">
                

                {/* 2. Spacing Column Guides */}
                <AnimatePresence>
                  {activeTab === 'spacing' && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.15 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-x-5 inset-y-0 grid grid-cols-12 gap-4 pointer-events-none z-10"
                    >
                      {Array.from({ length: 12 }).map((_, i) => (
                        <div key={i} className="h-full bg-pink-500/20 border-x border-pink-500/30" />
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Mock Page Layout Content */}
                <div className="w-full flex flex-col gap-3.5 text-left select-none relative z-20">
                  
                  {/* Mock Navigation Header */}
                  <div className="flex items-center justify-between border-b border-black/[0.04] dark:border-white/[0.04] pb-2 text-xs text-muted-foreground/80 font-medium">
                    <div className="flex items-center gap-1 font-bold text-foreground">
                      <div className="size-2 rounded-full bg-uxray-primary-300" />
                      stellar
                    </div>
                    <div className="flex gap-4 font-semibold relative">
                      <span className="hover:text-foreground transition-colors relative">
                        Features
                        <AnimatePresence>
                          {activeTab === 'touch' && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="absolute -inset-x-1 -inset-y-1.5 border border-dashed border-success/50 bg-success/5 rounded pointer-events-none"
                            />
                          )}
                        </AnimatePresence>
                      </span>
                      <span className="hover:text-foreground transition-colors relative">
                        Pricing
                        <AnimatePresence>
                          {activeTab === 'touch' && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="absolute -inset-x-1 -inset-y-1.5 border border-dashed border-success/50 bg-success/5 rounded pointer-events-none"
                            />
                          )}
                        </AnimatePresence>
                      </span>
                      <span className="hover:text-foreground transition-colors relative">
                        Docs
                        <AnimatePresence>
                          {activeTab === 'touch' && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="absolute -inset-x-1 -inset-y-1.5 border border-dashed border-success/50 bg-success/5 rounded pointer-events-none"
                            />
                          )}
                        </AnimatePresence>
                      </span>

                      {/* Touch Target Spacing Warning */}
                      <AnimatePresence>
                        {activeTab === 'touch' && (
                          <motion.div
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 5 }}
                            className="absolute bottom-5 right-0 bg-rose-500 text-success-foreground font-mono text-[6px] font-bold px-1.5 py-0.5 rounded shadow z-40 flex items-center gap-1 whitespace-nowrap"
                          >
                            <AlertCircle className="size-2" />
                            <span>Spacing: 6px (Min: 8px)</span>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    <div className="h-5 px-2.5 rounded-full border border-black/10 dark:border-white/10 flex items-center justify-center font-bold text-[7px] bg-black/[0.02] dark:bg-white/[0.02] text-foreground">
                      Join
                    </div>
                  </div>

                  {/* Main hero grid split layout */}
                  <div className="grid grid-cols-12 gap-4 items-center">
                    
                    {/* Left Column - Hero Content */}
                    <div className="col-span-7 space-y-2.5 relative">
                      
                      {/* Eyebrow */}
                      <div className="relative inline-block">
                        <div className="inline-flex items-center gap-1 rounded bg-uxray-primary-300/10 dark:bg-uxray-primary-300/5 px-2 py-0.5 text-[7px] font-bold tracking-wider text-uxray-primary-300 uppercase">
                          V2.0 RELEASE
                        </div>
                        <AnimatePresence>
                          {activeTab === 'contrast' && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              className="absolute -inset-1.5 border border-success/40 rounded bg-success/[0.02] flex items-center justify-end z-20 pointer-events-none"
                            >
                              <span className="absolute -top-3 right-0 bg-success text-success-foreground font-mono text-[6px] font-bold px-0.5 rounded shadow whitespace-nowrap leading-none py-0.5">
                                4.5:1 AA
                              </span>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                      
                      {/* Title */}
                      <div className="relative">
                        <h3 className="text-sm font-extrabold tracking-tight text-foreground leading-snug">
                          Continuous UI audits for modern devs
                        </h3>
                        <AnimatePresence>
                          {activeTab === 'contrast' && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.98 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.98 }}
                              className="absolute -inset-1.5 border border-success/40 rounded-lg bg-success/[0.02] z-20 pointer-events-none"
                            >
                              <span className="absolute -top-3.5 right-2 bg-success text-success-foreground font-mono text-[6px] font-bold px-0.5 rounded shadow whitespace-nowrap leading-none py-0.5">
                                7.2:1 AAA
                              </span>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                      
                      {/* Subtitle (Low contrast color style) */}
                      <div className="relative">
                        <p className="text-xs leading-normal text-black/30 dark:text-white/20">
                          Automate visual diagnostics, contrast audits, and accessibility checks on every build.
                        </p>
                        <AnimatePresence>
                          {activeTab === 'contrast' && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.98 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.98 }}
                              className="absolute -inset-1.5 border border-rose-500/40 rounded-lg bg-rose-500/[0.02] z-20 pointer-events-none"
                            >
                              <span className="absolute -top-3.5 right-2 bg-rose-500 text-success-foreground font-mono text-[6px] font-bold px-0.5 rounded shadow whitespace-nowrap leading-none py-0.5">
                                2.1:1 Fail
                              </span>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                      
                      {/* Button Group Row */}
                      <div className="flex gap-3 items-center pt-0.5 relative">
                        
                        {/* Primary Button */}
                        <div className="relative inline-block">
                          <button className="h-7 px-3 rounded-lg bg-foreground text-background text-xs font-bold shadow hover:opacity-90 transition-all cursor-pointer">
                            Audit Now
                          </button>
                          
                          {/* Spacing Guide - Button Padding */}
                          <AnimatePresence>
                            {activeTab === 'spacing' && (
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 border border-dashed border-pink-500 bg-pink-500/10 rounded-lg z-20 pointer-events-none flex items-center justify-center"
                              >
                                <span className="bg-pink-500 text-success-foreground font-mono text-[5.5px] font-bold px-0.5 rounded leading-none py-0.5">
                                  P:8px 12px
                                </span>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          {/* Contrast Guide - Button Text */}
                          <AnimatePresence>
                            {activeTab === 'contrast' && (
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute -inset-1 border border-success rounded-lg bg-success/10 z-20 pointer-events-none"
                              >
                                <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-success text-success-foreground font-mono text-[6px] font-bold px-0.5 rounded shadow whitespace-nowrap leading-none py-0.5">
                                  6.4:1 AA
                                </span>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          {/* Touch Target Circle */}
                          <AnimatePresence>
                            {activeTab === 'touch' && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 size-10 border border-success bg-success/10 rounded-full z-20 pointer-events-none"
                              >
                                <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-success text-success-foreground font-mono text-[5.5px] font-bold px-0.5 rounded whitespace-nowrap shadow-sm leading-none py-0.5">
                                  Target: 40px
                                </span>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* Secondary Button */}
                        <div className="relative inline-block">
                          <button className="h-5 px-2 rounded bg-black/5 dark:bg-white/5 text-xs font-semibold text-muted-foreground border border-black/5 dark:border-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-all cursor-pointer">
                            View Logs
                          </button>

                          {/* Contrast Guide - Button Text */}
                          <AnimatePresence>
                            {activeTab === 'contrast' && (
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute -inset-1 border border-rose-500/40 rounded bg-rose-500/[0.02] z-20 pointer-events-none"
                              >
                                <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-rose-500 text-success-foreground font-mono text-[6px] font-bold px-0.5 rounded shadow whitespace-nowrap leading-none py-0.5">
                                  2.8:1 Fail
                                </span>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          {/* Touch Target Warning Circle */}
                          <AnimatePresence>
                            {activeTab === 'touch' && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 size-10 border border-dashed border-rose-500 bg-rose-500/10 rounded-full z-20 pointer-events-none"
                              >
                                <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-rose-500 text-success-foreground font-mono text-[5.5px] font-bold px-0.5 rounded whitespace-nowrap shadow-sm leading-none py-0.5">
                                  Target: 20px (Low)
                                </span>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                      </div>

                      {/* Spacing Spacers - Layout Margins */}
                      {/* Eyebrow to Title */}
                      <AnimatePresence>
                        {activeTab === 'spacing' && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute left-[30px] top-[14px] h-2.5 w-[1px] bg-pink-500 flex items-center justify-start z-30 pointer-events-none"
                          >
                            <span className="ml-1.5 bg-pink-500 text-success-foreground font-mono text-[5.5px] px-0.5 rounded whitespace-nowrap leading-none py-0.5">
                              gap: 10px
                            </span>
                            <div className="absolute top-0 left-[-1.5px] right-[-1.5px] h-[1px] bg-pink-500 w-[4px]" />
                            <div className="absolute bottom-0 left-[-1.5px] right-[-1.5px] h-[1px] bg-pink-500 w-[4px]" />
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Title to Subtitle */}
                      <AnimatePresence>
                        {activeTab === 'spacing' && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute left-[30px] top-[46px] h-2.5 w-[1px] bg-pink-500 flex items-center justify-start z-30 pointer-events-none"
                          >
                            <span className="ml-1.5 bg-pink-500 text-success-foreground font-mono text-[5.5px] px-0.5 rounded whitespace-nowrap leading-none py-0.5">
                              gap: 10px
                            </span>
                            <div className="absolute top-0 left-[-1.5px] right-[-1.5px] h-[1px] bg-pink-500 w-[4px]" />
                            <div className="absolute bottom-0 left-[-1.5px] right-[-1.5px] h-[1px] bg-pink-500 w-[4px]" />
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Subtitle to Buttons */}
                      <AnimatePresence>
                        {activeTab === 'spacing' && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute left-[30px] top-[80px] h-3.5 w-[1px] bg-pink-500 flex items-center justify-start z-30 pointer-events-none"
                          >
                            <span className="ml-1.5 bg-pink-500 text-success-foreground font-mono text-[5.5px] px-0.5 rounded whitespace-nowrap leading-none py-0.5">
                              gap: 14px
                            </span>
                            <div className="absolute top-0 left-[-1.5px] right-[-1.5px] h-[1px] bg-pink-500 w-[4px]" />
                            <div className="absolute bottom-0 left-[-1.5px] right-[-1.5px] h-[1px] bg-pink-500 w-[4px]" />
                          </motion.div>
                        )}
                      </AnimatePresence>

                    </div>

                    {/* Right Column - Mock Card / Diagram */}
                    <div className="col-span-5 relative">
                      
                      <div className="rounded-xl border border-black/5 dark:border-white/[0.06] bg-black/[0.01] dark:bg-white/[0.01] p-3 flex flex-col gap-2 shadow-sm relative overflow-hidden">
                        {/* Background glow in card */}
                        <div className="absolute -right-3 -top-3 size-10 rounded-full bg-uxray-primary-300/5 dark:bg-uxray-primary-300/10 blur-md pointer-events-none" />
                        
                        <div className="flex items-center justify-between">
                          <div className="h-2 w-10 rounded bg-black/10 dark:bg-white/10" />
                          <div className="size-2 rounded-full bg-success" />
                        </div>
                        <div className="h-10 rounded-lg bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5 flex items-center justify-center relative overflow-hidden">
                          <svg className="w-full h-8 px-2" viewBox="0 0 100 20" preserveAspectRatio="none">
                            <path d="M0 15 L20 12 L40 16 L60 8 L80 14 L100 5" fill="none" className="stroke-uxray-primary-300" strokeWidth="1" />
                          </svg>
                        </div>
                        <div className="space-y-1">
                          <div className="h-1.5 w-full rounded bg-black/5 dark:bg-white/5" />
                          <div className="h-1.5 w-2/3 rounded bg-black/5 dark:bg-white/5" />
                        </div>

                        {/* Spacing Guide Column Gap */}
                        <AnimatePresence>
                          {activeTab === 'spacing' && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="absolute left-[-20px] top-1/2 -translate-y-1/2 w-4 h-[1px] bg-pink-500 flex items-center justify-center z-30 pointer-events-none"
                            >
                              <span className="absolute bottom-1 bg-pink-500 text-success-foreground font-mono text-[5px] px-0.5 rounded whitespace-nowrap leading-none py-0.5">
                                gap: 16px
                              </span>
                              <div className="absolute left-0 top-[-2px] bottom-[-2px] w-[1px] bg-pink-500 h-[5px]" />
                              <div className="absolute right-0 top-[-2px] bottom-[-2px] w-[1px] bg-pink-500 h-[5px]" />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                    </div>

                  </div>
                </div>

              </div>

            </div>

          </div>

          {/* Marketing pitch text */}
          <div className="max-w-md mt-12 text-center lg:text-left space-y-4 select-none">
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground bg-gradient-to-r from-foreground via-foreground/90 to-foreground/75 bg-clip-text">
              See Beyond.<br />
              <span className="text-uxray-primary-300 font-extrabold bg-gradient-to-r from-uxray-primary-300 to-uxray-secondary-300 bg-clip-text text-transparent">
                Audit UI/UX with AI.
              </span>
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
              An X-Ray scanner for your design elements. Instantly map contrast errors, tap sizes, screen flows, and accessibility checkpoints.
            </p>
          </div>

        </div>

        {/* Right: Form Page (Centered Single Glassmorphic Panel) */}
        <div className="relative z-10 flex flex-1 flex-col justify-center items-center px-4 py-28 md:py-24 sm:px-6 lg:px-16 xl:px-24">
          
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            className="w-full max-w-md"
          >
            {/* Elegant SaaS-style container card */}
            <motion.div 
              layout="position"
              className="w-full rounded-3xl p-6 sm:p-10 shadow-2xl dark:shadow-[0_24px_80px_rgba(0,0,0,0.85)] glass-panel transition-colors duration-500 overflow-hidden"
              transition={{ type: "spring", stiffness: 350, damping: 35 }}
            >
              {children}
            </motion.div>
          </motion.div>

        </div>
        
      </div>
    </div>
  )
}
