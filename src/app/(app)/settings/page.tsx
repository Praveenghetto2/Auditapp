'use client'

import * as React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Moon, Sun, Laptop, Check, Wand2, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useBreadcrumbs } from '@/lib/hooks/use-breadcrumbs'
import { useTheme } from 'next-themes'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export default function SettingsPage() {
  useBreadcrumbs([{ label: 'Settings', href: '/settings' }])
  const { theme, setTheme } = useTheme()

  const [mounted, setMounted] = React.useState(false)
  const [activeSubTab, setActiveSubTab] = React.useState<'profile' | 'appearance' | 'figma'>('profile')

  const [name, setName] = React.useState('Alex Morgan')
  const [email, setEmail] = React.useState('alex.morgan@uxray.ai')
  const [figmaToken, setFigmaToken] = React.useState('figd_xxxx_xxxx_xxxx')

  React.useEffect(() => setMounted(true), [])

  if (!mounted) return null

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault()
    toast.success('Profile settings updated successfully!')
  }

  const handleSaveFigma = (e: React.FormEvent) => {
    e.preventDefault()
    toast.success('Figma API token connected successfully!')
  }

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">Configure your workspace preferences and integrations.</p>
      </div>

      {/* Tabs */}
      <div role="tablist" aria-label="Settings sub-tabs" className="flex border-b border-border/50 text-sm font-medium text-muted-foreground gap-6 relative">
        <button
          onClick={() => setActiveSubTab('profile')}
          role="tab"
          aria-selected={activeSubTab === 'profile'}
          aria-controls="profile-panel"
          id="tab-profile"
          className={cn(
            "relative pb-3 font-semibold transition-colors duration-300 cursor-pointer",
            activeSubTab === 'profile'
              ? 'text-primary'
              : 'hover:text-foreground/80'
          )}
        >
          👤 Profile Settings
          {activeSubTab === 'profile' && (
            <motion.div
              layoutId="settings-tab-line"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            />
          )}
        </button>
        <button
          onClick={() => setActiveSubTab('appearance')}
          role="tab"
          aria-selected={activeSubTab === 'appearance'}
          aria-controls="appearance-panel"
          id="tab-appearance"
          className={cn(
            "relative pb-3 font-semibold transition-colors duration-300 cursor-pointer",
            activeSubTab === 'appearance'
              ? 'text-primary'
              : 'hover:text-foreground/80'
          )}
        >
          🎨 Appearance
          {activeSubTab === 'appearance' && (
            <motion.div
              layoutId="settings-tab-line"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            />
          )}
        </button>
        <button
          onClick={() => setActiveSubTab('figma')}
          role="tab"
          aria-selected={activeSubTab === 'figma'}
          aria-controls="figma-panel"
          id="tab-figma"
          className={cn(
            "relative pb-3 font-semibold transition-colors duration-300 cursor-pointer",
            activeSubTab === 'figma'
              ? 'text-primary'
              : 'hover:text-foreground/80'
          )}
        >
          ❖ Figma Integration
          {activeSubTab === 'figma' && (
            <motion.div
              layoutId="settings-tab-line"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            />
          )}
        </button>
      </div>

      <div className="max-w-xl">
        {activeSubTab === 'profile' && (
          <motion.div id="profile-panel" role="tabpanel" aria-labelledby="tab-profile" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
            <Card className="glass-panel border-border/40 shadow-md card-glow-purple">
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your email address and profile name.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="settings-name" className="text-xs font-semibold text-muted-foreground/80">Full Name</label>
                    <Input id="settings-name" value={name} onChange={(e) => setName(e.target.value)} required className="glass-panel bg-card/45 border-border/40 focus-visible:ring-primary/20" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="settings-email" className="text-xs font-semibold text-muted-foreground/80">Email Address</label>
                    <Input id="settings-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="glass-panel bg-card/45 border-border/40 focus-visible:ring-primary/20" />
                  </div>
                  <Button type="submit" className="font-semibold shadow-md bg-primary text-primary-foreground hover:bg-primary/95">
                    Save Profile
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {activeSubTab === 'appearance' && (
          <motion.div id="appearance-panel" role="tabpanel" aria-labelledby="tab-appearance" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
            <Card className="glass-panel border-border/40 shadow-md card-glow-cyan">
              <CardHeader>
                <CardTitle>Interface Theme</CardTitle>
                <CardDescription>Select your visual theme preference for UXRay.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div role="radiogroup" aria-label="Select Interface Theme" className="grid grid-cols-3 gap-4">
                  {[
                    { id: 'light', label: 'Light Theme', icon: Sun, bg: 'bg-white border-zinc-200', sidebar: 'bg-zinc-100 border-r border-zinc-200', text: 'bg-zinc-200', accent: 'bg-primary/80' },
                    { id: 'dark', label: 'Dark Mode', icon: Moon, bg: 'bg-[#0a0a0f] border-zinc-800', sidebar: 'bg-zinc-900 border-r border-zinc-850', text: 'bg-zinc-800', accent: 'bg-primary' },
                    { id: 'system', label: 'System Default', icon: Laptop, bg: 'bg-gradient-to-br from-white via-zinc-400 to-[#0a0a0f] border-zinc-500', sidebar: 'bg-zinc-100 dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800', text: 'bg-zinc-300 dark:bg-zinc-800', accent: 'bg-primary' },
                  ].map((t) => {
                    const Icon = t.icon
                    const isSelected = theme === t.id
                    return (
                      <button
                        key={t.id}
                        role="radio"
                        aria-checked={isSelected}
                        onClick={() => {
                          setTheme(t.id)
                          toast.success(`Theme updated to ${t.label}!`)
                        }}
                        className={cn(
                          "flex flex-col items-center p-3 rounded-xl border text-center transition-all duration-300 cursor-pointer select-none group relative w-full",
                          isSelected
                            ? 'border-primary bg-primary/10 shadow-sm'
                            : 'bg-card/25 border-border/40 hover:border-primary/25 hover:bg-card/45'
                        )}
                      >
                        {isSelected && (
                          <span className="absolute top-2 right-2 flex items-center justify-center size-4 rounded-full bg-primary text-primary-foreground z-10 animate-in zoom-in duration-200">
                            <Check className="size-2.5" />
                          </span>
                        )}
                        
                        {/* Visual Mock Layout representing Theme */}
                        <div className={cn("w-full h-16 rounded-lg border flex overflow-hidden mb-3", t.bg)}>
                          {/* Mock Sidebar */}
                          <div className={cn("w-1/4 h-full p-1.5 flex flex-col gap-1 shrink-0", t.sidebar)}>
                            <div className={cn("h-1.5 w-full rounded", t.accent)} />
                            <div className={cn("h-1 w-2/3 rounded opacity-80", t.text)} />
                            <div className={cn("h-1 w-1/2 rounded opacity-80", t.text)} />
                          </div>
                          {/* Mock Body */}
                          <div className="flex-1 p-2 flex flex-col gap-1.5 justify-center">
                            <div className={cn("h-2 w-3/4 rounded-sm", t.text)} />
                            <div className="flex gap-1">
                              <div className={cn("h-4 w-1/3 rounded-sm", t.accent, "opacity-20")} />
                              <div className={cn("h-4 w-1/3 rounded-sm", t.text, "opacity-30")} />
                              <div className={cn("h-4 w-1/3 rounded-sm", t.text, "opacity-30")} />
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 mt-1">
                          <Icon className={cn("size-3.5", isSelected ? 'text-primary' : 'text-muted-foreground')} />
                          <span className="text-xs font-bold">{t.label}</span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {activeSubTab === 'figma' && (
          <motion.div id="figma-panel" role="tabpanel" aria-labelledby="tab-figma" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
            <Card className="glass-panel border-border/40 shadow-md card-glow-purple">
              <CardHeader>
                <CardTitle>Figma API Token Connection</CardTitle>
                <CardDescription>
                  Connect your Figma account to sync design file layers directly for heuristics checking.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveFigma} className="space-y-4">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="settings-figma-token" className="text-xs font-semibold text-muted-foreground/80">Personal Access Token</label>
                    <Input
                      id="settings-figma-token"
                      type="password"
                      value={figmaToken}
                      onChange={(e) => setFigmaToken(e.target.value)}
                      placeholder="figd_..."
                      required
                      className="glass-panel bg-card/45 border-border/40 focus-visible:ring-primary/20"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground leading-normal">
                    Generate this token in your Figma Settings → Personal Access Tokens section.
                  </p>
                  <Button type="submit" className="font-semibold shadow-md bg-primary text-primary-foreground hover:bg-primary/95">
                    Connect Figma
                  </Button>
                </form>

                <div className="mt-6 pt-6 border-t border-border/40 space-y-3">
                  <h4 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                    <Wand2 className="size-4 text-primary" />
                    Try Figma Plugin Companion
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Open our high-fidelity, interactive plugin preview screen. Inspect mock canvas layers, trigger automatic fixes, and watch design scores update in real-time.
                  </p>
                  <Button variant="outline" size="sm" className="gap-1.5 font-semibold text-xs border-white/[0.08] hover:bg-white/[0.05]" asChild>
                    <Link href="/integrations/figma">
                      Launch Plugin Companion
                      <ArrowRight className="size-3.5" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  )
}
