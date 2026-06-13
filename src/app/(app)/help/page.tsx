'use client'

import * as React from 'react'
import { BookOpen, Book, ChevronDown } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { useBreadcrumbs } from '@/lib/hooks/use-breadcrumbs'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

const FAQ_ITEMS = [
  {
    q: 'What is WCAG 2.2 color contrast requirement?',
    a: 'WCAG 2.2 level AA requires a contrast ratio of at least 4.5:1 for normal text and 3:1 for large text (18pt or larger, or 14pt bold). Level AAA requires 7:1 for normal text and 4.5:1 for large text. UXRay scans color combinations of background and text to ensure these guidelines are met.',
  },
  {
    q: 'How is touch target size evaluated?',
    a: 'According to mobile accessibility standards, all interactive elements (buttons, links, form inputs) must have a touch target size of at least 48x48 physical pixels. A target smaller than 48px is flagged as a failure to prevent fat-finger mistakes.',
  },
  {
    q: 'What does the spacing baseline measure?',
    a: 'Modern layout grids generally snap padding, margins, and gaps to multiples of 4px or 8px. UXRay parses CSS attributes to verify that margins and paddings match spacing variables and highlights anomalies that break grid alignment.',
  },
  {
    q: 'How does the Attention Heatmap model work?',
    a: 'Our predictive visual attention model evaluates visual weights, contrast ratios, and element sizing to construct a simulated user attention map. Red hotspots represent areas that will draw the eye first, confirming if primary buttons are visible.',
  },
]

export default function HelpDocsPage() {
  useBreadcrumbs([{ label: 'Help & Docs', href: '/help' }])

  const [mounted, setMounted] = React.useState(false)
  const [openIndex, setOpenIndex] = React.useState<number | null>(null)

  React.useEffect(() => setMounted(true), [])

  if (!mounted) return null

  return (
    <div className="flex flex-col gap-6 pb-12 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Help & Documentation</h1>
        <p className="text-muted-foreground mt-1">
          Learn how visual heuristics calculations evaluate design tokens and components.
        </p>
      </div>

      {/* Docs Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="glass-panel border-border/40 hover:border-primary/30 shadow-sm glass-card-hover card-glow-purple">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BookOpen className="size-4.5 text-primary" />
              Developer Guides
            </CardTitle>
            <CardDescription>Setup guides for CLI integrations and API hooks.</CardDescription>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground/80 leading-relaxed">
            <p>
              Integrate UXRay directly into your Playwright or Cypress automation suites to automatically catch color contrast regressions and broken spacing rules in CI/CD pipelines.
            </p>
          </CardContent>
        </Card>

        <Card className="glass-panel border-border/40 hover:border-primary/30 shadow-sm glass-card-hover card-glow-cyan">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Book className="size-4.5 text-primary" />
              Design System Snapping
            </CardTitle>
            <CardDescription>Sync style guides and token standards.</CardDescription>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground/80 leading-relaxed">
            <p>
              Connect Figma libraries to sync typography definitions. Ensure developers snap components to the correct visual scales defined in style system files.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* FAQ Accordions */}
      <div className="space-y-3 mt-4">
        <h2 className="text-xl font-bold tracking-tight mb-4">Frequently Asked Questions</h2>
        {FAQ_ITEMS.map((faq, idx) => {
          const isOpen = openIndex === idx
          return (
            <Card key={idx} className="overflow-hidden glass-panel border-border/40 shadow-sm">
              <button
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full flex items-center justify-between p-4 text-left font-semibold text-sm hover:bg-muted/30 transition-colors cursor-pointer select-none"
              >
                <span>{faq.q}</span>
                <ChevronDown className={cn("size-4 transition-transform duration-300", isOpen ? 'rotate-180 text-primary' : 'text-muted-foreground')} />
              </button>
              
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 pt-0 text-xs text-muted-foreground/90 leading-relaxed border-t border-border/30 bg-muted/5">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
