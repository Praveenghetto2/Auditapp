'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Play, 
  RefreshCw, 
  ZoomIn, 
  ZoomOut, 
  CheckCircle2, 
  AlertTriangle, 
  Eye, 
  ShieldAlert, 
  Sparkles, 
  Check, 
  Info, 
  Settings, 
  User, 
  Compass, 
  ChevronDown, 
  ChevronRight, 
  X, 
  Maximize2, 
  Wand2, 
  Frame, 
  Type, 
  Layers, 
  Sliders, 
  Accessibility, 
  ArrowRight, 
  MousePointer, 
  Grid3X3,
  HelpCircle,
  Sparkle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { toast } from 'sonner'
import { useBreadcrumbs } from '@/lib/hooks/use-breadcrumbs'
import { useMockDataStore } from '@/lib/stores/mock-data-store'
import { cn } from '@/lib/utils'
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts'

// ═══════════════════════════════════════════════════════════════════════
// TYPES & DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════

interface Issue {
  id: string
  layerId: string
  title: string
  category: 'Accessibility' | 'Visual' | 'Layout'
  severity: 'critical' | 'serious' | 'minor'
  description: string
  principle: string
  currentValue: string
  fixedValue: string
  propertyLabel: string
  details: string
}

const MOCK_FIGMA_ISSUES: Issue[] = [
  {
    id: 'iss-1',
    layerId: 'profile-avatar',
    title: 'Missing alt text on profile avatar',
    category: 'Accessibility',
    severity: 'serious',
    description: 'The user profile photo layer does not have any descriptive alternative text, making it inaccessible for screen readers.',
    principle: 'WCAG 2.2 SC 1.1.1 — Non-text Content',
    currentValue: 'ellipse-avatar (No alt)',
    fixedValue: 'alt: "Jane Doe Profile Photo"',
    propertyLabel: 'Alt Text',
    details: 'Screen readers will skip this element or read the default name. Adding an alt attribute allows visually impaired users to understand user context.'
  },
  {
    id: 'iss-2',
    layerId: 'primary-cta',
    title: 'Insufficient contrast ratio on Primary CTA',
    category: 'Visual',
    severity: 'critical',
    description: 'The white text on light violet background (#B870FF) has a 2.4:1 contrast ratio, failing the WCAG AA minimum requirement of 4.5:1.',
    principle: 'WCAG 2.2 SC 1.4.3 — Contrast (Minimum)',
    currentValue: 'bg: #B870FF (Ratio 2.4:1)',
    fixedValue: 'bg: #6366F1 (Ratio 4.8:1)',
    propertyLabel: 'Fill Color',
    details: 'Primary conversion button needs to be highly readable. Changing the background to Indigo (#6366F1) increases contrast to 4.8:1, satisfying WCAG AA.'
  },
  {
    id: 'iss-3',
    layerId: 'metrics-grid',
    title: 'Inconsistent card spacing in Grid',
    category: 'Layout',
    severity: 'minor',
    description: 'The metrics grid is spacing cards at 17px, which violates the 8px layout grid rule and creates visual misalignment.',
    principle: 'Grid Alignment Heuristic',
    currentValue: 'gap: 17px',
    fixedValue: 'gap: 24px (8px multiple)',
    propertyLabel: 'Auto Layout Gap',
    details: 'Standardizing card layout gaps to 24px aligns the cards perfectly with the default 8px layout system, optimizing visual scanability.'
  }
]

// ═══════════════════════════════════════════════════════════════════════
// COMPONENT IMPLEMENTATION
// ═══════════════════════════════════════════════════════════════════════

export default function FigmaIntegrationPage() {
  useBreadcrumbs([
    { label: 'Integrations', href: '#' },
    { label: 'Figma Plugin', href: '/integrations/figma' }
  ])

  // Get project information from mock store for context
  const projects = useMockDataStore((s) => s.projects)
  const activeProject = React.useMemo(() => {
    return projects[0] || { name: 'Acme Corp Website' }
  }, [projects])

  // Component states
  const [fixedIssueIds, setFixedIssueIds] = React.useState<string[]>([])
  const [fixingIssueId, setFixingIssueId] = React.useState<string | null>(null)
  const [activeIssueId, setActiveIssueId] = React.useState<string | null>('iss-2')
  const [selectedLayerId, setSelectedLayerId] = React.useState<string | null>('primary-cta')
  const [zoomLevel, setZoomLevel] = React.useState<number>(100)
  const [showGrid, setShowGrid] = React.useState<boolean>(true)
  const [mobileActiveTab, setMobileActiveTab] = React.useState<'canvas' | 'plugin'>('canvas')
  const [isFixAllRunning, setIsFixAllRunning] = React.useState<boolean>(false)

  // Sync selected layer and active issue
  const handleSelectIssue = (issueId: string) => {
    setActiveIssueId(issueId)
    const issue = MOCK_FIGMA_ISSUES.find(i => i.id === issueId)
    if (issue) {
      setSelectedLayerId(issue.layerId)
    }
  }

  const handleSelectLayer = (layerId: string) => {
    setSelectedLayerId(layerId)
    const issue = MOCK_FIGMA_ISSUES.find(i => i.layerId === layerId)
    if (issue) {
      setActiveIssueId(issue.id)
    } else {
      setActiveIssueId(null)
    }
  }

  // Auto-Fix implementation
  const applyFix = async (issueId: string) => {
    if (fixingIssueId || fixedIssueIds.includes(issueId)) return

    setFixingIssueId(issueId)
    const issue = MOCK_FIGMA_ISSUES.find(i => i.id === issueId)
    
    // Smooth delay simulating figma plugin engine execution
    await new Promise(resolve => setTimeout(resolve, 1500))

    setFixedIssueIds(prev => [...prev, issueId])
    setFixingIssueId(null)
    toast.success(`Applied Auto-Fix for: ${issue?.title}`, {
      description: `Updated properties from "${issue?.currentValue}" to "${issue?.fixedValue}".`,
      duration: 4000
    })
  }

  const applyFixAll = async () => {
    setIsFixAllRunning(true)
    const issuesToFix = MOCK_FIGMA_ISSUES.filter(i => !fixedIssueIds.includes(i.id))
    
    for (const issue of issuesToFix) {
      setActiveIssueId(issue.id)
      setSelectedLayerId(issue.layerId)
      setFixingIssueId(issue.id)
      await new Promise(resolve => setTimeout(resolve, 1200))
      setFixedIssueIds(prev => [...prev, issue.id])
      toast.success(`Fixed: ${issue.title}`)
    }
    
    setFixingIssueId(null)
    setIsFixAllRunning(false)
    toast.success('All design audit issues auto-fixed successfully!')
  }

  const resetAll = () => {
    setFixedIssueIds([])
    setFixingIssueId(null)
    setActiveIssueId('iss-2')
    setSelectedLayerId('primary-cta')
    toast.info('Design states reset back to default audit values.')
  }

  // Dynamic radar score calculation
  const radarData = React.useMemo(() => {
    const isAvatarFixed = fixedIssueIds.includes('iss-1')
    const isCtaFixed = fixedIssueIds.includes('iss-2')
    const isGridFixed = fixedIssueIds.includes('iss-3')

    return [
      { subject: 'Accessibility', A: isAvatarFixed ? 98 : 45, B: 100 },
      { subject: 'Contrast', A: isCtaFixed ? 96 : 40, B: 100 },
      { subject: 'Spacing', A: isGridFixed ? 94 : 55, B: 100 },
      { subject: 'Grid System', A: isGridFixed ? 92 : 62, B: 100 },
      { subject: 'Usability', A: isCtaFixed && isGridFixed ? 95 : 72, B: 100 }
    ]
  }, [fixedIssueIds])

  const overallScore = React.useMemo(() => {
    const total = radarData.reduce((acc, curr) => acc + curr.A, 0)
    return Math.round(total / radarData.length)
  }, [radarData])

  // Figma Layer Tree Data
  const layersList = [
    { id: 'dashboard-frame', name: '❖ Dashboard Mockup', type: 'frame', depth: 0, selectable: false },
    { id: 'nav-header', name: '❖ Header Navigation', type: 'frame', depth: 1, selectable: false },
    { id: 'logo-layer', name: '⬡ Logo Icon', type: 'vector', depth: 2, selectable: false },
    { id: 'profile-avatar', name: '👤 profile-avatar', type: 'ellipse', depth: 2, selectable: true, hasIssue: true, issueId: 'iss-1' },
    { id: 'hero-section', name: '❖ Hero Banner', type: 'frame', depth: 1, selectable: false },
    { id: 'hero-title', name: '📝 Heading Title', type: 'text', depth: 2, selectable: false },
    { id: 'primary-cta', name: '🔘 primary-cta-btn', type: 'rectangle', depth: 2, selectable: true, hasIssue: true, issueId: 'iss-2' },
    { id: 'metrics-grid', name: '❖ metrics-grid (Auto Layout)', type: 'frame', depth: 1, selectable: true, hasIssue: true, issueId: 'iss-3' },
    { id: 'card-1', name: '📦 Conversion Card', type: 'frame', depth: 2, selectable: false },
    { id: 'card-2', name: '📦 Bounce Rate Card', type: 'frame', depth: 2, selectable: false },
    { id: 'card-3', name: '📦 Active Users Card', type: 'frame', depth: 2, selectable: false }
  ]

  // Retrieve current active layer details for Figma properties inspector
  const activeLayerProperties = React.useMemo(() => {
    if (selectedLayerId === 'profile-avatar') {
      const isFixed = fixedIssueIds.includes('iss-1')
      return {
        name: isFixed ? 'profile-avatar' : 'Ellipse 12',
        x: '864 px',
        y: '22 px',
        w: '36 px',
        h: '36 px',
        fill: 'Image (avatar.png)',
        altText: isFixed ? 'Jane Doe Profile Photo' : 'Not defined',
        opacity: '100%',
        accessibilityStatus: isFixed ? 'Compliant' : 'Fail'
      }
    } else if (selectedLayerId === 'primary-cta') {
      const isFixed = fixedIssueIds.includes('iss-2')
      return {
        name: 'primary-cta-btn',
        x: '48 px',
        y: '240 px',
        w: '154 px',
        h: '42 px',
        fill: isFixed ? '#6366F1' : '#B870FF',
        contrast: isFixed ? '4.8:1 (WCAG AA Pass)' : '2.4:1 (Fail)',
        radius: '8 px',
        textColor: '#FFFFFF',
        accessibilityStatus: isFixed ? 'Compliant' : 'Fail'
      }
    } else if (selectedLayerId === 'metrics-grid') {
      const isFixed = fixedIssueIds.includes('iss-3')
      return {
        name: 'metrics-grid',
        x: '48 px',
        y: '334 px',
        w: '864 px',
        h: '110 px',
        layout: 'Auto Layout (Horizontal)',
        gap: isFixed ? '24 px' : '17 px',
        padding: '0 px',
        align: 'Top Left'
      }
    }
    return null
  }, [selectedLayerId, fixedIssueIds])

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* ── Page Header ────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Figma Copilot</h1>
          <p className="text-muted-foreground mt-1">
            Real-time interactive playground of the UXRay design companion plugin. Auditing Figma designs and applying automated structural & visual fixes.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={resetAll}
            className="border-white/[0.08] hover:bg-white/[0.05] gap-2 font-medium"
          >
            <RefreshCw className="size-3.5" />
            Reset Design
          </Button>
          <Button 
            onClick={applyFixAll} 
            disabled={isFixAllRunning || fixedIssueIds.length === MOCK_FIGMA_ISSUES.length}
            className="bg-gradient-primary text-white border-0 gap-2 font-semibold shadow-md"
          >
            <Wand2 className="size-4" />
            {isFixAllRunning ? 'Fixing All...' : fixedIssueIds.length === MOCK_FIGMA_ISSUES.length ? 'All Fixed' : 'Auto-Fix All Issues'}
          </Button>
        </div>
      </div>

      {/* Mobile Tab Swapper */}
      <div className="flex xl:hidden w-full bg-muted/50 p-1 rounded-lg border border-white/[0.06]">
        <button
          onClick={() => setMobileActiveTab('canvas')}
          className={cn(
            "flex-1 py-2 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-2",
            mobileActiveTab === 'canvas' ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Frame className="size-4" />
          Figma Workspace
        </button>
        <button
          onClick={() => setMobileActiveTab('plugin')}
          className={cn(
            "flex-1 py-2 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-2",
            mobileActiveTab === 'plugin' ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Sparkle className="size-4" />
          UXRay Companion Panel ({MOCK_FIGMA_ISSUES.length - fixedIssueIds.length} Left)
        </button>
      </div>

      {/* ── Main Layout Workspace ──────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">
        
        {/* LEFT COLUMN: FIGMA WORKSPACE MOCKUP (Col Span 3) */}
        <div className={cn(
          "xl:col-span-3 flex flex-col rounded-xl overflow-hidden border border-white/[0.06] bg-[#1E1E1E] text-white shadow-2xl h-[780px] relative transition-all",
          mobileActiveTab !== 'canvas' && "hidden xl:flex"
        )}>
          {/* Figma Top Toolbar */}
          <div className="h-10 bg-[#2C2C2C] border-b border-[#1E1E1E] px-3 flex items-center justify-between text-xs select-none">
            {/* Toolbar: Left Buttons */}
            <div className="flex items-center gap-2.5">
              <div className="size-5 bg-gradient-to-tr from-amber-500 via-purple-600 to-cyan-500 rounded-sm flex items-center justify-center font-extrabold text-[10px] text-white font-mono">
                F
              </div>
              <div className="h-4 w-px bg-white/10" />
              <button className="p-1 hover:bg-white/10 rounded text-cyan-400">
                <MousePointer className="size-3.5" />
              </button>
              <button className="p-1 hover:bg-white/10 rounded text-white/70">
                <Frame className="size-3.5" />
              </button>
              <button className="p-1 hover:bg-white/10 rounded text-white/70">
                <Grid3X3 className="size-3.5" />
              </button>
              <button className="p-1 hover:bg-white/10 rounded text-white/70">
                <Type className="size-3.5" />
              </button>
              <button className="p-1 hover:bg-white/10 rounded text-white/70">
                <Sliders className="size-3.5" />
              </button>
            </div>

            {/* Toolbar: Middle File Indicator */}
            <div className="flex items-center gap-1 font-medium text-white/90">
              <span>{activeProject.name}</span>
              <ChevronDown className="size-3 text-white/40" />
              <span className="text-white/40 mx-1">/</span>
              <span className="text-white/60">UXRay-Audited Mockup</span>
            </div>

            {/* Toolbar: Right Section */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setZoomLevel(prev => Math.max(50, prev - 10))}
                  className="p-1 hover:bg-white/10 rounded text-white/60 hover:text-white"
                  title="Zoom Out"
                >
                  <ZoomOut className="size-3" />
                </button>
                <span className="w-10 text-center font-mono text-[10px] text-white/60">{zoomLevel}%</span>
                <button 
                  onClick={() => setZoomLevel(prev => Math.min(150, prev + 10))}
                  className="p-1 hover:bg-white/10 rounded text-white/60 hover:text-white"
                  title="Zoom In"
                >
                  <ZoomIn className="size-3" />
                </button>
              </div>
              <div className="h-4 w-px bg-white/10" />
              <button 
                onClick={() => setShowGrid(!showGrid)}
                className={cn(
                  "px-2 py-0.5 rounded text-[10px] font-medium transition-all",
                  showGrid ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30" : "bg-white/5 text-white/60 hover:bg-white/10"
                )}
              >
                Grid: {showGrid ? 'ON' : 'OFF'}
              </button>
              <div className="flex -space-x-1">
                <div className="size-5 rounded-full bg-purple-500 border border-[#2C2C2C] flex items-center justify-center text-[9px] font-bold">JD</div>
                <div className="size-5 rounded-full bg-emerald-500 border border-[#2C2C2C] flex items-center justify-center text-[9px] font-bold">PK</div>
              </div>
            </div>
          </div>

          {/* Figma Workspace Body */}
          <div className="flex flex-1 overflow-hidden">
            
            {/* Layers panel (Left Sidebar inside figma) */}
            <div className="w-52 bg-[#1E1E1E] border-r border-[#2C2C2C] flex flex-col text-[11px] select-none">
              <div className="p-2 border-b border-[#2C2C2C] font-semibold text-white/40 flex items-center gap-1.5 uppercase tracking-wider text-[9px]">
                <Layers className="size-3 text-white/60" />
                Layers
              </div>
              <div className="flex-1 overflow-y-auto py-2">
                {layersList.map((layer) => (
                  <button
                    key={layer.id}
                    onClick={() => layer.selectable && handleSelectLayer(layer.id)}
                    className={cn(
                      "w-full text-left py-1.5 px-3 flex items-center justify-between transition-all border-l-2",
                      selectedLayerId === layer.id 
                        ? "bg-cyan-500/15 border-cyan-500 text-cyan-300 font-medium" 
                        : "border-transparent text-white/65 hover:bg-white/[0.03] hover:text-white",
                      layer.depth === 1 && "pl-6",
                      layer.depth === 2 && "pl-9",
                      !layer.selectable && "cursor-default opacity-80"
                    )}
                  >
                    <span className="truncate flex items-center gap-1.5">
                      {layer.name}
                    </span>
                    {layer.hasIssue && !fixedIssueIds.includes(layer.issueId || '') && (
                      <span className={cn(
                        "size-1.5 rounded-full bg-red-500 animate-pulse shrink-0",
                        selectedLayerId === layer.id && "bg-cyan-400"
                      )} />
                    )}
                    {layer.hasIssue && fixedIssueIds.includes(layer.issueId || '') && (
                      <Check className="size-3 text-emerald-400 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Figma Canvas (Center View) */}
            <div className="flex-1 bg-[#151515] relative overflow-hidden flex items-center justify-center">
              {/* Canvas Infinite Background Dots */}
              {showGrid && (
                <div 
                  className="absolute inset-0 opacity-[0.04]"
                  style={{
                    backgroundImage: 'radial-gradient(circle, #ffffff 1.5px, transparent 1.5px)',
                    backgroundSize: '16px 16px',
                  }}
                />
              )}

              {/* Dynamic canvas scale container */}
              <motion.div 
                animate={{ scale: zoomLevel / 100 }} 
                transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                className="relative p-12 flex items-center justify-center"
              >
                
                {/* Figma Canvas Artboard Label */}
                <div className="absolute -top-6 left-0 text-[10px] text-white/40 font-mono font-bold flex items-center gap-1.5">
                  <span className="text-cyan-400">#</span> Dashboard Mockup
                </div>

                {/* THE DASHBOARD MOCKUP CONTAINER */}
                <div 
                  className="w-[960px] h-[520px] rounded-lg bg-slate-900 border border-white/[0.08] shadow-2xl relative flex flex-col overflow-hidden text-slate-100"
                  style={{ transition: 'all 0.3s ease' }}
                >
                  {/* Mockup Header Navigation */}
                  <div className="h-16 border-b border-white/[0.05] bg-slate-900/60 backdrop-blur-md px-6 flex items-center justify-between select-none">
                    <div className="flex items-center gap-8">
                      <div className="flex items-center gap-2">
                        <div className="size-7 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center font-bold text-sm text-white">
                          A
                        </div>
                        <span className="font-extrabold text-sm tracking-wider uppercase bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                          AcmeSaaS
                        </span>
                      </div>
                      <div className="flex items-center gap-5 text-xs font-semibold text-slate-400">
                        <span className="text-white hover:text-white cursor-pointer transition-colors">Overview</span>
                        <span className="hover:text-white cursor-pointer transition-colors">Analytics</span>
                        <span className="hover:text-white cursor-pointer transition-colors">Billing</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* PROFILE AVATAR LAYER */}
                      <div 
                        onClick={(e) => {
                          e.stopPropagation()
                          handleSelectLayer('profile-avatar')
                        }}
                        className={cn(
                          "relative rounded-full p-0.5 cursor-pointer transition-all",
                          selectedLayerId === 'profile-avatar' ? "ring-2 ring-cyan-500 scale-105" : "hover:scale-105"
                        )}
                      >
                        {/* Profile photo container */}
                        <div className="size-9 rounded-full bg-slate-800 border border-white/10 overflow-hidden flex items-center justify-center">
                          {/* Simulated Profile Pic */}
                          <img 
                            src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120&h=120"
                            alt={fixedIssueIds.includes('iss-1') ? "Jane Doe Profile Photo" : ""}
                            className="size-full object-cover"
                          />
                        </div>

                        {/* HOTSPOT OVERLAY - MISSING ALT TEXT */}
                        {!fixedIssueIds.includes('iss-1') && (
                          <div className="absolute -top-1 -right-1 z-30">
                            <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 animate-ping" />
                            <div className={cn(
                              "relative size-3.5 rounded-full flex items-center justify-center text-[8px] font-bold text-white shadow-lg transition-colors duration-300",
                              activeIssueId === 'iss-1' ? "bg-red-500 scale-125" : "bg-red-500/70"
                            )}>
                              !
                            </div>
                          </div>
                        )}

                        {/* Scanner / Ripple Fixing Overlay */}
                        {fixingIssueId === 'iss-1' && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: [0, 1, 1, 0], scale: [0.9, 1.2, 1.2, 1], border: ["2px solid #ef4444", "4px solid #10b981", "4px solid #10b981", "0px solid #10b981"] }}
                            transition={{ duration: 1.4, ease: "easeInOut" }}
                            className="absolute inset-0 bg-emerald-500/20 rounded-full pointer-events-none z-30"
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Mockup Dashboard Content */}
                  <div className="flex-1 p-8 flex flex-col justify-between relative bg-slate-950/40">
                    
                    {/* Background Visual Accents */}
                    <div className="absolute top-1/4 left-1/3 size-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute bottom-10 right-10 size-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

                    {/* HERO BANNER BLOCK */}
                    <div className="space-y-4 max-w-xl">
                      <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/[0.03] border border-white/[0.05] text-[10px] font-semibold text-slate-400">
                        <Badge variant="outline" className="text-[9px] h-4 border-indigo-500/30 text-indigo-400 bg-indigo-500/5">New</Badge>
                        Design System v2.4 Live
                      </div>
                      <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                        Visual Audits. Perfect Code.
                      </h2>
                      <p className="text-xs text-slate-400 leading-relaxed max-w-md">
                        Automate accessibility, visual regression, and standard components audit for your web apps and design system.
                      </p>

                      {/* PRIMARY CTA LAYER */}
                      <div 
                        onClick={(e) => {
                          e.stopPropagation()
                          handleSelectLayer('primary-cta')
                        }}
                        className={cn(
                          "relative inline-block rounded-lg p-0.5 cursor-pointer transition-all",
                          selectedLayerId === 'primary-cta' ? "ring-2 ring-cyan-500 scale-[1.02]" : "hover:scale-[1.01]"
                        )}
                      >
                        <button 
                          className="px-6 py-2.5 rounded-md text-xs font-bold text-white transition-all shadow-md relative overflow-hidden"
                          style={{
                            backgroundColor: fixedIssueIds.includes('iss-2') ? '#6366F1' : '#B870FF',
                          }}
                        >
                          Get Started Today
                        </button>

                        {/* HOTSPOT OVERLAY - CONTRAST RATIO */}
                        {!fixedIssueIds.includes('iss-2') && (
                          <div className="absolute -top-1 -right-1 z-30">
                            <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 animate-ping" />
                            <div className={cn(
                              "relative size-3.5 rounded-full flex items-center justify-center text-[8px] font-bold text-white shadow-lg transition-colors duration-300",
                              activeIssueId === 'iss-2' ? "bg-red-500 scale-125" : "bg-red-500/70"
                            )}>
                              !
                            </div>
                          </div>
                        )}

                        {/* Scanner / Ripple Fixing Overlay */}
                        {fixingIssueId === 'iss-2' && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: [0, 1, 1, 0], scale: [0.95, 1.05, 1.05, 1], border: ["2px solid #ef4444", "4px solid #10b981", "4px solid #10b981", "0px solid #10b981"] }}
                            transition={{ duration: 1.4, ease: "easeInOut" }}
                            className="absolute inset-0 bg-emerald-500/20 rounded-md pointer-events-none z-30"
                          />
                        )}
                      </div>
                    </div>

                    {/* METRICS CARD GRID LAYER */}
                    <div 
                      onClick={(e) => {
                        e.stopPropagation()
                        handleSelectLayer('metrics-grid')
                      }}
                      className={cn(
                        "relative rounded-xl p-1.5 cursor-pointer transition-all border border-transparent",
                        selectedLayerId === 'metrics-grid' ? "bg-cyan-500/5 border-dashed border-cyan-500/30 scale-[1.005]" : "hover:bg-white/[0.01]"
                      )}
                    >
                      {/* Metric cards layout box */}
                      <div 
                        className="flex w-full transition-all duration-500 ease-out"
                        style={{
                          gap: fixedIssueIds.includes('iss-3') ? '24px' : '17px'
                        }}
                      >
                        {/* Card 1 */}
                        <div className="flex-1 bg-slate-900/40 border border-white/[0.05] rounded-xl p-4 flex flex-col gap-1 shadow-sm">
                          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Conversion Rate</span>
                          <div className="flex items-baseline gap-2 mt-1">
                            <span className="text-xl font-extrabold text-white">3.48%</span>
                            <span className="text-[9px] font-bold text-emerald-400">+12%</span>
                          </div>
                        </div>

                        {/* Card 2 */}
                        <div className="flex-1 bg-slate-900/40 border border-white/[0.05] rounded-xl p-4 flex flex-col gap-1 shadow-sm">
                          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Bounce Rate</span>
                          <div className="flex items-baseline gap-2 mt-1">
                            <span className="text-xl font-extrabold text-white">41.2%</span>
                            <span className="text-[9px] font-bold text-rose-400">-4%</span>
                          </div>
                        </div>

                        {/* Card 3 */}
                        <div className="flex-1 bg-slate-900/40 border border-white/[0.05] rounded-xl p-4 flex flex-col gap-1 shadow-sm">
                          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Active Users</span>
                          <div className="flex items-baseline gap-2 mt-1">
                            <span className="text-xl font-extrabold text-white">12,854</span>
                            <span className="text-[9px] font-bold text-emerald-400">+28%</span>
                          </div>
                        </div>
                      </div>

                      {/* HOTSPOT OVERLAY - METRICS SPACING */}
                      {!fixedIssueIds.includes('iss-3') && (
                        <div className="absolute top-1/2 left-1/3 -translate-y-1/2 z-30">
                          <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 animate-ping" />
                          <div className={cn(
                            "relative size-3.5 rounded-full flex items-center justify-center text-[8px] font-bold text-white shadow-lg transition-colors duration-300",
                            activeIssueId === 'iss-3' ? "bg-red-500 scale-125" : "bg-red-500/70"
                          )}>
                            !
                          </div>
                        </div>
                      )}

                      {/* Scanner / Ripple Fixing Overlay */}
                      {fixingIssueId === 'iss-3' && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: [0, 1, 1, 0], scale: [0.99, 1.01, 1.01, 1], border: ["2px solid #ef4444", "4px solid #10b981", "4px solid #10b981", "0px solid #10b981"] }}
                          transition={{ duration: 1.4, ease: "easeInOut" }}
                          className="absolute inset-0 bg-emerald-500/20 rounded-xl pointer-events-none z-30"
                        />
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Properties Panel (Right Sidebar inside figma) */}
            <div className="w-56 bg-[#1E1E1E] border-l border-[#2C2C2C] flex flex-col text-[11px] select-none">
              <div className="p-2 border-b border-[#2C2C2C] font-semibold text-white/40 flex items-center gap-1.5 uppercase tracking-wider text-[9px]">
                <Sliders className="size-3 text-white/60" />
                Properties
              </div>

              {activeLayerProperties ? (
                <div className="flex-1 overflow-y-auto p-3 space-y-4">
                  {/* Layer Title */}
                  <div>
                    <label className="text-white/40 text-[9px] uppercase tracking-wider font-bold">Selected Layer</label>
                    <div className="text-white font-medium text-xs truncate mt-0.5 flex items-center gap-1">
                      <Frame className="size-3 text-cyan-400" />
                      {activeLayerProperties.name}
                    </div>
                  </div>

                  <div className="border-t border-white/5 my-2" />

                  {/* Alignment & Layout Coordinates */}
                  <div className="grid grid-cols-2 gap-2 font-mono text-[10px]">
                    <div className="flex items-center gap-1 bg-white/[0.02] p-1.5 rounded border border-white/5">
                      <span className="text-white/30">X</span>
                      <span className="text-white/80">{activeLayerProperties.x}</span>
                    </div>
                    <div className="flex items-center gap-1 bg-white/[0.02] p-1.5 rounded border border-white/5">
                      <span className="text-white/30">Y</span>
                      <span className="text-white/80">{activeLayerProperties.y}</span>
                    </div>
                    <div className="flex items-center gap-1 bg-white/[0.02] p-1.5 rounded border border-white/5">
                      <span className="text-white/30">W</span>
                      <span className="text-white/80">{activeLayerProperties.w}</span>
                    </div>
                    <div className="flex items-center gap-1 bg-white/[0.02] p-1.5 rounded border border-white/5">
                      <span className="text-white/30">H</span>
                      <span className="text-white/80">{activeLayerProperties.h}</span>
                    </div>
                  </div>

                  <div className="border-t border-white/5 my-2" />

                  {/* Layer Specific Settings */}
                  <div className="space-y-3">
                    {/* Fill Color Property */}
                    {activeLayerProperties.fill !== undefined && (
                      <div>
                        <label className="text-white/40 text-[9px] uppercase tracking-wider font-bold">Fill Style</label>
                        <div className="flex items-center gap-2 mt-1">
                          {activeLayerProperties.fill.startsWith('#') ? (
                            <>
                              <div 
                                className="size-4 rounded-sm border border-white/20 shadow-inner" 
                                style={{ backgroundColor: activeLayerProperties.fill }}
                              />
                              <span className="font-mono text-[11px] text-white/95">{activeLayerProperties.fill}</span>
                            </>
                          ) : (
                            <span className="text-white/80">{activeLayerProperties.fill}</span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Layout Settings Property (for Auto Layout) */}
                    {activeLayerProperties.layout !== undefined && (
                      <div className="space-y-2">
                        <div>
                          <label className="text-white/40 text-[9px] uppercase tracking-wider font-bold">Layout Mode</label>
                          <div className="text-white/95 font-medium mt-0.5">{activeLayerProperties.layout}</div>
                        </div>
                        <div>
                          <label className="text-white/40 text-[9px] uppercase tracking-wider font-bold">Gap Spacing</label>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={cn(
                              "font-mono text-xs px-1.5 py-0.5 rounded",
                              activeLayerProperties.gap === '24 px' ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"
                            )}>
                              {activeLayerProperties.gap}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Accessibility Alt Text Property */}
                    {activeLayerProperties.altText !== undefined && (
                      <div>
                        <label className="text-white/40 text-[9px] uppercase tracking-wider font-bold">Accessibility Alt Text</label>
                        <div className={cn(
                          "text-[10px] mt-1 p-2 rounded border font-mono truncate",
                          activeLayerProperties.altText === 'Not defined' ? "bg-red-500/5 border-red-500/20 text-red-400" : "bg-emerald-500/5 border-emerald-500/20 text-emerald-400"
                        )}>
                          {activeLayerProperties.altText}
                        </div>
                      </div>
                    )}

                    {/* Contrast Property */}
                    {activeLayerProperties.contrast !== undefined && (
                      <div>
                        <label className="text-white/40 text-[9px] uppercase tracking-wider font-bold font-semibold">Contrast Ratio (White Text)</label>
                        <div className={cn(
                          "text-[10px] mt-1 p-2 rounded border font-semibold",
                          activeLayerProperties.contrast.includes('Fail') ? "bg-red-500/5 border-red-500/20 text-red-400" : "bg-emerald-500/5 border-emerald-500/20 text-emerald-400"
                        )}>
                          {activeLayerProperties.contrast}
                        </div>
                      </div>
                    )}

                    {/* Compliance/Audit Tag */}
                    {activeLayerProperties.accessibilityStatus && (
                      <div>
                        <label className="text-white/40 text-[9px] uppercase tracking-wider font-bold">UXRay Compliance</label>
                        <div className="mt-1">
                          <Badge 
                            variant="outline" 
                            className={cn(
                              "text-[9px] px-2 py-0.5 border font-semibold",
                              activeLayerProperties.accessibilityStatus === 'Compliant'
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                                : "bg-red-500/10 text-red-400 border-red-500/30"
                            )}
                          >
                            {activeLayerProperties.accessibilityStatus}
                          </Badge>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-4 text-center text-white/30 text-[10px]">
                  <HelpCircle className="size-8 text-white/10 mb-2" />
                  Select an audited layer in the list or canvas to view detailed design parameters.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: UXRAY COMPANION PLUGIN PANEL (Col Span 1) */}
        <div className={cn(
          "xl:col-span-1 flex flex-col rounded-xl overflow-hidden glass-panel border border-white/[0.08] shadow-2xl h-[780px] bg-slate-900/90 text-slate-100 relative transition-all",
          mobileActiveTab !== 'plugin' && "hidden xl:flex"
        )}>
          {/* Plugin Header */}
          <div className="h-12 bg-slate-950 border-b border-white/[0.06] px-4 flex items-center justify-between select-none">
            <div className="flex items-center gap-2">
              {/* Figma logo container */}
              <div className="flex -space-x-1 items-center">
                <div className="size-4 bg-gradient-to-tr from-amber-500 via-purple-600 to-cyan-500 rounded-sm flex items-center justify-center text-[7px] text-white font-extrabold font-mono">F</div>
                <div className="size-4 bg-primary rounded-sm flex items-center justify-center text-[7px] text-white font-bold">U</div>
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold tracking-tight text-white leading-tight">UXRay Copilot</span>
                <span className="text-[8px] text-muted-foreground leading-none">Companion Plugin v1.2</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] font-semibold text-slate-400">Sync Active</span>
            </div>
          </div>

          {/* Plugin Score Dashboard */}
          <div className="p-4 bg-slate-950/40 border-b border-white/[0.06] space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-[9px] uppercase tracking-wider font-bold text-slate-400">Current Design Audit Score</label>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className={cn(
                    "text-2xl font-black tracking-tight",
                    overallScore >= 90 ? "text-emerald-400" : overallScore >= 70 ? "text-yellow-400" : "text-rose-400"
                  )}>
                    {overallScore}%
                  </span>
                  <span className="text-[10px] text-muted-foreground">overall</span>
                </div>
              </div>
              <Badge 
                variant="outline"
                className={cn(
                  "text-[10px] border px-2.5 py-0.5 font-bold shadow-sm",
                  fixedIssueIds.length === MOCK_FIGMA_ISSUES.length 
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                    : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                )}
              >
                {fixedIssueIds.length} / {MOCK_FIGMA_ISSUES.length} Issues Fixed
              </Badge>
            </div>

            {/* Recharts radar chart inside sidebar */}
            <div className="h-28 w-full flex items-center justify-center my-1 select-none">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.06)" />
                  <PolarAngleAxis 
                    dataKey="subject" 
                    tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 7, fontWeight: 600 }}
                  />
                  <PolarRadiusAxis 
                    angle={30} 
                    domain={[0, 100]} 
                    tick={false} 
                    axisLine={false}
                  />
                  <Radar
                    name="UXScore"
                    dataKey="A"
                    stroke="#6366F1"
                    fill="#6366F1"
                    fillOpacity={0.25}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Plugin Issues List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center justify-between mb-2">
              <span>Detected Design Flaws</span>
              <span>Sorted by Severity</span>
            </div>

            <div className="space-y-3">
              {MOCK_FIGMA_ISSUES.map((issue) => {
                const isFixed = fixedIssueIds.includes(issue.id)
                const isFixing = fixingIssueId === issue.id
                const isActive = activeIssueId === issue.id

                return (
                  <div
                    key={issue.id}
                    onClick={() => handleSelectIssue(issue.id)}
                    className={cn(
                      "group relative rounded-xl border p-3.5 transition-all cursor-pointer flex flex-col gap-2.5",
                      isActive 
                        ? "bg-slate-950/80 border-cyan-500/60 shadow-lg shadow-cyan-500/5" 
                        : "bg-slate-950/30 border-white/[0.04] hover:bg-slate-950/50 hover:border-white/[0.08]",
                      isFixed && "border-emerald-500/20 bg-slate-950/15"
                    )}
                  >
                    {/* Severity & Category header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "text-[8px] font-bold uppercase tracking-wider py-0 px-2 h-4.5 border-0",
                            issue.severity === 'critical' ? "bg-rose-500/10 text-rose-400" :
                            issue.severity === 'serious' ? "bg-amber-500/10 text-amber-400" :
                            "bg-blue-500/10 text-blue-400"
                          )}
                        >
                          {issue.severity}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground font-semibold">{issue.category}</span>
                      </div>

                      {isFixed ? (
                        <span className="flex items-center gap-1 text-emerald-400 text-[10px] font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          <CheckCircle2 className="size-3" />
                          Fixed
                        </span>
                      ) : (
                        <span className="text-white/20 group-hover:text-white/40 transition-colors">
                          <ChevronRight className="size-3.5" />
                        </span>
                      )}
                    </div>

                    {/* Issue Title and description */}
                    <div className="space-y-1">
                      <h4 className={cn(
                        "text-xs font-bold leading-snug transition-colors",
                        isActive ? "text-cyan-400" : "text-white/90",
                        isFixed && "text-slate-400 line-through"
                      )}>
                        {issue.title}
                      </h4>
                      <p className="text-[10px] text-slate-400 leading-normal">
                        {issue.description}
                      </p>
                    </div>

                    {/* Suggested fix values comparison block */}
                    <div className="grid grid-cols-2 gap-2 text-[9px] font-mono p-2 rounded-lg bg-slate-950/40 border border-white/[0.03]">
                      <div className="space-y-0.5 border-r border-white/5 pr-2">
                        <span className="text-slate-500 font-bold block">CURRENT</span>
                        <span className="text-rose-400 font-semibold truncate block">{issue.currentValue}</span>
                      </div>
                      <div className="space-y-0.5 pl-1">
                        <span className="text-slate-500 font-bold block">PROPOSED FIX</span>
                        <span className="text-emerald-400 font-semibold truncate block">{issue.fixedValue}</span>
                      </div>
                    </div>

                    {/* Action buttons (only show if not fixed, or show status) */}
                    <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-white/[0.04] mt-1.5">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation()
                          handleSelectIssue(issue.id)
                        }}
                        className="text-[10px] text-slate-400 hover:text-white font-semibold flex items-center gap-1 py-1 transition-colors"
                      >
                        <Eye className="size-3" />
                        Inspect Layer
                      </button>

                      <Button
                        size="sm"
                        disabled={isFixed || isFixing}
                        onClick={(e) => {
                          e.stopPropagation()
                          applyFix(issue.id)
                        }}
                        className={cn(
                          "h-7 text-[10px] font-bold px-3 transition-all",
                          isFixed 
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                            : "bg-indigo-600 hover:bg-indigo-500 text-white shadow"
                        )}
                      >
                        {isFixing ? (
                          <div className="flex items-center gap-1.5">
                            <span className="size-2 rounded-full border border-white/30 border-t-white animate-spin" />
                            Fixing...
                          </div>
                        ) : isFixed ? (
                          'Applied ✓'
                        ) : (
                          'Apply Auto-Fix'
                        )}
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Plugin Footer Actions */}
          <div className="p-4 bg-slate-950 border-t border-white/[0.06] flex items-center justify-between text-[10px] select-none text-muted-foreground">
            <div className="flex items-center gap-1">
              <Info className="size-3" />
              <span>Target: Web Dashboard</span>
            </div>
            <span>v1.2.0-stable</span>
          </div>

        </div>

      </div>

      {/* ── Companion Explainer section ───────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
        <Card className="glass-panel border-white/[0.06] bg-slate-900/20 backdrop-blur-md">
          <CardHeader className="pb-2">
            <div className="size-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-2">
              <Wand2 className="size-4" />
            </div>
            <CardTitle className="text-sm font-bold text-foreground">AI auto-fix technology</CardTitle>
            <CardDescription className="text-xs text-muted-foreground leading-relaxed">
              Auto-fix patches accessibility anomalies and structural spacing errors. It rewrites layout parameters, updates fills, and binds WCAG-compliant attributes automatically.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="glass-panel border-white/[0.06] bg-slate-900/20 backdrop-blur-md">
          <CardHeader className="pb-2">
            <div className="size-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-2">
              <Layers className="size-4" />
            </div>
            <CardTitle className="text-sm font-bold text-foreground">Bi-directional inspection</CardTitle>
            <CardDescription className="text-xs text-muted-foreground leading-relaxed">
              Clicking elements inside the Figma canvas highlights them inside the UXRay companion sidebar panel. Selecting issues in the sidebar auto-focuses target design layers.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="glass-panel border-white/[0.06] bg-slate-900/20 backdrop-blur-md">
          <CardHeader className="pb-2">
            <div className="size-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-2">
              <CheckCircle2 className="size-4" />
            </div>
            <CardTitle className="text-sm font-bold text-foreground">Design system synchronization</CardTitle>
            <CardDescription className="text-xs text-muted-foreground leading-relaxed">
              All fixes follow default design system variables (such as 8px grid alignment or primary theme colors) so updates remain cohesive and compile perfectly in downstream code templates.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

    </div>
  )
}
