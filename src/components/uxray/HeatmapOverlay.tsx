'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

// ═══════════════════════════════════════════════════════════════════════
// HeatmapOverlay — Canvas-based heat gradient overlay on screenshots
// ═══════════════════════════════════════════════════════════════════════

interface HeatZone {
  x: number // percentage from left
  y: number // percentage from top
  intensity: number // 0-1
  severity: 'critical' | 'serious' | 'minor'
  issueId: string
  label: string
}

interface HeatmapOverlayProps {
  zones: HeatZone[]
  enabled: boolean
  opacity?: number
  onZoneClick?: (issueId: string) => void
  className?: string
}

const SEVERITY_COLORS = {
  critical: { r: 239, g: 68, b: 68 },   // red-500
  serious: { r: 245, g: 158, b: 11 },    // amber-500
  minor: { r: 59, g: 130, b: 246 },      // blue-500
}

export function HeatmapOverlay({ zones, enabled, opacity = 0.45, onZoneClick, className }: HeatmapOverlayProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const containerRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (!enabled || !canvasRef.current || !containerRef.current) return

    const canvas = canvasRef.current
    const container = containerRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = container.getBoundingClientRect()
    canvas.width = rect.width
    canvas.height = rect.height

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    zones.forEach((zone) => {
      const x = (zone.x / 100) * canvas.width
      const y = (zone.y / 100) * canvas.height
      const radius = 60 + zone.intensity * 40
      const color = SEVERITY_COLORS[zone.severity]

      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius)
      gradient.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, ${0.6 * zone.intensity})`)
      gradient.addColorStop(0.4, `rgba(${color.r}, ${color.g}, ${color.b}, ${0.3 * zone.intensity})`)
      gradient.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`)

      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    })
  }, [enabled, zones, opacity])

  return (
    <div ref={containerRef} className={cn("absolute inset-0 pointer-events-none", className)}>
      <AnimatePresence>
        {enabled && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0"
          >
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full"
              style={{ opacity }}
            />
            {/* Clickable zone markers */}
            {zones.map((zone) => (
              <button
                key={zone.issueId}
                onClick={() => onZoneClick?.(zone.issueId)}
                className={cn(
                  "absolute size-6 rounded-full border-2 flex items-center justify-center text-xs font-bold pointer-events-auto cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 hover:scale-125 shadow-lg",
                  zone.severity === 'critical' && "bg-red-500/80 border-red-300 text-white",
                  zone.severity === 'serious' && "bg-amber-500/80 border-amber-300 text-white",
                  zone.severity === 'minor' && "bg-blue-500/80 border-blue-300 text-white",
                )}
                style={{ left: `${zone.x}%`, top: `${zone.y}%` }}
                title={zone.label}
              >
                {zone.severity === 'critical' ? '!' : zone.severity === 'serious' ? '⚠' : '·'}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Default heat zones for the mock audit
export const DEFAULT_HEAT_ZONES: HeatZone[] = [
  { x: 50, y: 20, intensity: 0.9, severity: 'critical', issueId: 'iss-1', label: 'Missing alt text on hero image' },
  { x: 50, y: 65, intensity: 0.95, severity: 'critical', issueId: 'iss-2', label: 'Insufficient contrast on CTA' },
  { x: 82, y: 13, intensity: 0.8, severity: 'critical', issueId: 'iss-3', label: 'No keyboard nav for modals' },
  { x: 50, y: 50, intensity: 0.6, severity: 'serious', issueId: 'iss-4', label: 'Inconsistent button hierarchy' },
  { x: 35, y: 30, intensity: 0.5, severity: 'serious', issueId: 'iss-5', label: 'Hero copy uses passive voice' },
  { x: 69, y: 13, intensity: 0.4, severity: 'minor', issueId: 'iss-6', label: 'Search input lacking label' },
]
