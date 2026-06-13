# UXRay Coding Skills & Engineering Guide

This document defines the architectural patterns, styling principles, domain requirements, and coding standards required to build **UXRay** as a premium, production-grade SaaS application.

---

## 1. Product Concept & Domain Architecture

**UXRay** is an AI-first UI/UX audit platform that helps designers and developers scan interfaces (via Live URLs, Figma files, or screenshots) and get instant analysis on usability, accessibility, performance, and visual design.

```
                  ┌──────────────────────────────┐
                  │      1. Input Submission     │
                  │   (URL / Figma / Image)      │
                  └──────────────┬───────────────┘
                                 ▼
                  ┌──────────────────────────────┐
                  │    2. Real-Time Pipeline     │
                  │      (Status Indicators)     │
                  └──────────────┬───────────────┘
                                 ▼
                  ┌──────────────────────────────┐
                  │    3. Interactive Report     │
                  │ (Overview/Issues/Heatmaps...)│
                  └──────────────────────────────┘
```

---

## 2. Next.js 15+ & App Router Architecture

### Client vs. Server Components (RSC)
* **Server Components (Default)**: Use for data fetching, static layout wrappers, SEO metadata, and server-side logic. Keep components server-side unless they require interactivity.
* **Client Components (`'use client'`)**: Only use when using React hooks (`useState`, `useEffect`, `useContext`, `useRef`, `useCallback`), custom context providers, browser APIs, or animation libraries like `framer-motion`.
* **Placement**: Keep client components low in the component tree to maximize server rendering benefits.

### Hydration & Formatting
* Always add `suppressHydrationWarning` on the `html` element to prevent errors from theme-switching libraries (`next-themes`).
* Avoid using date formatting methods (e.g., `new Date().toLocaleDateString()`) directly in JSX without wrapping in `useEffect` or `useMemo` to prevent server-client mismatches.

---

## 3. Design System & Styling (Tailwind v4 - macOS 27 "Golden Gate" Specifications)

### A. Semantic Color & Background Layering (Apple Semantics)
Do not hardcode random hex values or use high-contrast primary neon background blocks. Adhere to Apple's semantic layering system:
* **System Backgrounds**:
  * **Light Mode**: `#f5f5f7` (System Gray 6 / secondary background) -> Use `bg-background`
  * **Dark Mode**: `#000000` (Pitch Black / system background) -> Use `bg-background`
* **Card & Elevated Containers**:
  * **Light Mode**: `#ffffff` (Pure White) -> Use `bg-card`
  * **Dark Mode**: `#1c1c1e` (System Gray 6 / elevated sheet) -> Use `bg-card`
* **Accents**: Use `bg-primary` (main brand violet) or `bg-secondary` (main brand blue) sparingly for active actions and focus indicators.
* **Feedback States**: Use `text-destructive` (System Red), `text-success` (System Green), and `text-warning` (System Orange).

### B. Typography Hierarchy (Apple Dynamic Type mapping)
All text elements must map directly to Apple's Dynamic Type system to establish an instant visual hierarchy and high readability:
* **Large Title**: `text-4xl font-bold tracking-tight text-foreground` (Main landing page headers, hero titles)
* **Title 1**: `text-3xl font-bold tracking-tight text-foreground` (Primary page headers, dashboard titles)
* **Title 2**: `text-2xl font-semibold tracking-tight text-foreground` (Section headings, major category group headers)
* **Title 3**: `text-xl font-semibold text-foreground` (Sub-sections, card headers)
* **Headline**: `text-base font-semibold text-foreground` (Table column headers, widget labels, input labels)
* **Body**: `text-base font-normal text-foreground` (Primary paragraphs, reading content)
* **Callout**: `text-sm font-medium text-foreground` (Inline notifications, highlight summaries)
* **Subheadline**: `text-sm font-normal text-muted-foreground` (Meta descriptions, helper texts, secondary labels)
* **Footnote**: `text-xs font-normal text-muted-foreground` (Timestamps, system logs, tiny footer links)
* **Caption 1**: `text-xs font-medium text-foreground` (Status badge pills, category markers)
* **Caption 2**: `text-xs font-normal text-muted-foreground/80` (Micro-indicators, label details)

### C. Spacing, Grid, & Hairline Dividers
* **4pt/8pt Grid Alignment**: All paddings, margins, gaps, and heights must align to a strict 4pt/8pt grid (e.g. `gap-1` (4px), `gap-2` (8px), `gap-4` (16px), `gap-6` (24px), `gap-8` (32px)).
* **Retina Hairline Borders**: Group card components using a hairline border rather than thick boundaries. Use `border-[0.5px] border-border/30` or `divide-[0.5px] divide-border/30` for clean dividers that separate components with absolute minimal visual noise.

### D. Interactive Sizing & Touch Targets (44x44pt Rule)
* **Minimum Click Targets**: To prevent accidental clicks on adjacent options, all interactive buttons, link items, inputs, switches, and tab bar anchors must have a minimum interactive height and width of `44x44pt` (`min-h-[44px]` and `min-w-[44px]`, or equivalent padding).
* **Button Height Presets**: Standard button variants in the component library (`src/components/ui/button.tsx`) map to the following height scales:
  - **Large**: `h-11` (44px) - matches the standard 44px target exactly.
  - **Default**: `h-10` (40px) - primary standard button height.
  - **Small**: `h-9` (36px) - secondary standard button height.
  - **Extra Small**: `h-8` (32px) - compact controls button height.
* **Adequate Margins**: Never pack interactive items closer than `8px` (`gap-2`) or `12px` (`gap-3`) to avoid finger/mouse mis-clicks.

### E. macOS 27 "Liquid Glass" Adaptive Materials
To match the macOS 27 Golden Gate system, design elements should leverage adaptive translucent materials:
* **Uniform Corner Radii**: All windows, modal boxes, and card containers must standardize on a uniform radius of `12px` (`--radius: 0.75rem` / `rounded-xl`), avoiding over-rounded corners.
* **Liquid Glass Presets**: Map component translucencies to three distinct functional tiers:
  - **Clear**: `.liquid-glass-clear` (`bg-card/30 backdrop-blur-3xl saturate-[200%] border-[0.5px] border-border/20`) - for headers, overlay bars, or top-level controls.
  - **Medium**: `.liquid-glass-medium` (`bg-card/50 backdrop-blur-2xl saturate-[170%] border-[0.5px] border-border/30`) - standard card containers, charts, and report sheets.
  - **Opaque**: `.liquid-glass-opaque` (`bg-card/85 backdrop-blur-xl border-[0.5px] border-border/40`) - dropdown menus, combobox lists, hover cards, and modal dialogs.
* **Reflective Inner Highlights (Depth & Separation)**: Cards and panels must define a physical overhead light refraction. Replicate this with an inner top border shadow combined with a thin outer border:
  ```css
  box-shadow: inset 0 1px 0 0 rgba(255, 255, 255, 0.08), 0 8px 30px rgba(0, 0, 0, 0.2);
  ```

### F. Sidebar Navigation & Colored Scanning Icons
* **Colored Nav Icons**: In macOS 27 Golden Gate, sidebars return to colored icons to ease visual scanning. Muted icons are shown for inactive items but light up with active system colors when hovered or selected:
  - **Dashboard**: System Blue (`text-blue-500` / `dark:text-blue-400`)
  - **Projects**: System Orange (`text-orange-500` / `dark:text-orange-400`)
  - **Audits**: System Green (`text-emerald-500` / `dark:text-emerald-400`)
  - **Reports**: System Indigo/Purple (`text-indigo-500` / `dark:text-indigo-400`)
  - **Settings**: System Gray (`text-gray-500` / `dark:text-gray-400`)
  - **Help**: System Rose (`text-rose-500` / `dark:text-rose-400`)
* **Brand Purple Gradient Selection**: The active navigation state must use a subtle brand purple gradient strip (`bg-gradient-to-r from-primary/12 via-primary/5 to-transparent`) with a solid left border indicator (`border-l-2 border-primary`) to anchor the active selection.

---

## 4. Framer Motion Animation Guidelines

To maintain smooth, organic transitions without causing layout shifts or lag:
* **Orchestration**: Use variants instead of inline initial/animate objects for nested animations.
* **Tuple Easing**: Always type-cast cubic-bezier arrays as const to satisfy TypeScript (e.g., `ease: [0.22, 1, 0.36, 1] as const`).
* **GPU Acceleration**: Animate `opacity`, `transform` (`scale`, `rotate`, `x`, `y`), and `filter` only. Avoid animating height or width directly as it triggers browser reflows.
* **Staggered Animations**: Use `staggerChildren` on parents to animate child elements in sequence.

---

## 5. Domain Features & Implementation Rules

### A. Input Handling & Submission Flow
* **Live Website URL**: Provide strict URL input validation (must match `http://` or `https://`).
* **Figma Link**: Match pattern `figma.com/file/[file-id]`.
* **Screenshot Upload**: Supported via Drag-and-Drop file picker accepting PNG/JPEG/WebP images.

### B. Real-Time Pipeline Progress
When an audit starts, display a detailed step-by-step progress list:
1. `Capturing screenshot` (Web/Figma)
2. `Parsing page structure & layout`
3. `Evaluating WCAG compliance` (Accessibility)
4. `Analyzing visual assets & performance`
5. `Generating AI Attention Heatmaps`
6. `Consolidating audit reports`
* **UI requirement**: Steps must progress with pulsing indicators and show elapsed time for each completed phase.

### C. The Interactive Audit Report (6 Core Tabs)
The report is a multi-tab interface:
1. **Overview Tab**: Displays overall UX Score Gauge (animated 0-100), individual sub-scores (Accessibility, Performance, Usability, Visual), and bullet points summarizing key findings.
2. **UI/UX Issues Tab**: A split-screen interface. Left side shows the interface screenshot; right side displays the issues list. Hovering/clicking an issue highlights the bounding box on the screenshot.
3. **Accessibility Tab**: Groups WCAG compliance failures (Critical/Serious/Moderate/Minor) with code snippets and remediation instructions.
4. **Performance Tab**: Displays Core Web Vitals metrics and Lighthouse speed improvements.
5. **Attention Heatmap Tab**: Overlays predicted attention maps using customizable opacity sliders and clarity indices.
6. **Recommendations Tab**: Lists actionable engineering tasks grouped by impact rating.

---

## 6. State Management & Data Fetching

* **Client State**: Use **Zustand** for lightweight, localized global state (e.g., sidebar toggling, search query states, active modal views). Keep state mutations pure.
* **Server State**: Use **TanStack React Query** for data fetching, caching, query invalidation, and background synchronization.
* **Optimistic UI Updates**: Implement optimistic rendering when mutations are triggered (e.g., creating a new project or starring an audit).

---

## 7. Verification & Build Safety

* **Type Safety**: Never use `any`. Define strong interfaces and types for all props, states, API payloads, and mock datasets.
* **Clean Compilation**: Always verify your changes before finishing a task by running:
  ```bash
  npm run build
  ```
  This catches ESLint rules, TypeScript compile-time errors, and Turbopack issues.

---

## 8. Code Cleanliness & Error Prevention Protocol

### A. Type Safety & Guard Clauses
* **No Implicit Any**: Ensure all function signatures, hook returns, and data models are fully typed. Use strict interfaces instead of inline types.
* **Asynchronous Safeguards**: Prevent runtime rendering errors of missing fields by using optional chaining (`?.`) and fallback default values (`??` or `||`).
* **Import Integrity**: Verify icon imports from `lucide-react` against the standard exported sets to prevent "export doesn't exist" Turbopack build crashes.

### B. Hydration Error Prevention
* **Server-Client Mismatch Guards**: Avoid referencing browser-only APIs (`window`, `document`, `localStorage`) inside the rendering lifecycle.
* **State Mounting**: For components using client-only variables (like window dimensions or theme settings), render a fallback placeholder until mounted:
  ```tsx
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) return <div className="animate-pulse bg-muted rounded-xl h-24" />;
  ```

### C. Build Check Verification Loop
For every file modification or component created, execute:
1. `npm run lint` — Confirm zero ESLint and formatting violations.
2. `npm run build` — Run the full Next.js optimizer and TypeScript type-checker to ensure a 100% successful build compile before finishing the task.

### D. Component Reuse & DRY Principles
* **Zero Duplication**: Do not recreate layouts, SVGs, or custom UI elements that are already defined in the codebase.
* **Use Component Library**: Always import and reuse the core visual components from `src/components/uxray/`:
  * `<ScoreGauge>` — For any radial circular score gauges (0-100).
  * `<AuditScoreCard>` — For category dashboard score metrics.
  * `<IssueBadge>` — For displaying issue severity levels (critical, serious, moderate, minor).
  * `<StatusIndicator>` — For pipeline states or audit progress logs.
  * `<EmptyState>` — For layouts displaying empty lists, projects, or audits.
  * `<LoadingScreen>` — For branded scanning loading states.

---

## 9. Interactive Flow & Cognitive Load Optimization Guidelines

### A. Reducing Cognitive Load (Clean Visual Hierarchies)
* **Progressive Disclosure**: Do not overwhelm users with dense logs and metrics immediately. Present a high-level overall summary first (using `<ScoreGauge>` and `<AuditScoreCard>`), allowing users to expand or click to drill down into element selectors and recommendations.
* **Unified Iconography**: Keep icons simple and standardized (e.g., standard folder/dashboard icons for nav, clean triangles/checkmarks for feedback). Minimize screen noise.
* **Responsive Visual Feedback**: Any active state change (like toggling sidebar, changing tabs, or pressing buttons) must show instant visual feedback (skeleton loaders, toggled state styling, loading spinners) to lower perceived latency.

### B. Apple-Style Tactile Interactions & Spring Physics
* **Tactile Clicks (Micro-Presses)**: Every interactive card, tab, and button should respond with a springy physical press. Implement micro-scale tapping:
  ```typescript
  whileTap={{ scale: 0.98 }}
  transition={{ type: "spring", stiffness: 400, damping: 25 }}
  ```
* **Fluid Spring Tuning**: Avoid rigid time-based easing functions (like linear or ease-in). Use calibrated springs that mimic natural momentum. We define three standardized spring presets:
  ```typescript
  // 1. Crisp/Snappy: For buttons, checkboxes, switches, tabs, and micro-presses
  const crispSpring = { type: "spring", stiffness: 380, damping: 30 };
  
  // 2. Fluid/Smooth: For major layout sweeps, collapsing sidebars, modals, and sheet flyouts
  const fluidSpring = { type: "spring", stiffness: 220, damping: 28 };

  // 3. Gentle/Attentive: For custom tooltips, micro-alerts, and attention-grabbing notifications
  const gentleSpring = { type: "spring", stiffness: 120, damping: 14 };
  ```
* **Interactive Hover Scaling**: When hovering over glass cards or list items, avoid dramatic vertical displacement or glowing border effects. Use a very subtle spring scale and soft shadow elevation matching the macOS 27 Golden Gate interactive spec:
  ```typescript
  whileHover={{ scale: 1.008 }}
  transition={{ type: "spring", stiffness: 300, damping: 25 }}
  ```
* **Staggered Layout Entrances**: Cards, listings, and grid widgets must glide up sequentially on page load using variants with `staggerChildren: 0.05` to build a smooth, wave-like entrance animation.
* **Seamless Layout Morphing**: Leverage Framer Motion `<motion.div layout>` and `layoutId` when swapping active tabs or expanding items so the layout smoothly resizes rather than snapping abruptly.

### C. Clean Drop Shadow & Translucency Regulations (No Glowing Neon Shadows)
* **Subtle Realism Over Neon Glows**: Do not use neon glows or high-opacity colored shadows (e.g. `shadow-primary/50`). All shadows must mimic a natural overhead light source:
  * Light Mode: Use very low opacity gray/black shadows.
    * Small: `shadow-[0_1px_2px_rgba(0,0,0,0.05)]`
    * Medium: `shadow-[0_4px_12px_rgba(0,0,0,0.05)]`
    * Large (Modals/Popovers): `shadow-[0_12px_30px_rgba(0,0,0,0.08)]`
  * Dark Mode: Use elevated background colors (e.g. `#1c1c1e`) combined with a faint border/shadow to define depth rather than glowing black shadows:
    * Small: `shadow-[0_1px_2px_rgba(0,0,0,0.2)] border-[0.5px] border-border/30`
    * Medium: `shadow-[0_4px_12px_rgba(0,0,0,0.3)] border-[0.5px] border-border/30`
* **Translucent Liquid Glass Materials**: Replicate macOS 27 Liquid Glass sheets by layering backdrop blur and saturations over translucent backgrounds (`bg-background/80 backdrop-blur-xl saturate-[170%]`). When content passes behind the translucent sheet, it should refract and blur naturally to maintain structural hierarchy and readability.

### D. Performance & Speed Optimizations
* **Memoization**: Cache chart calculation arrays, filters, and list sorting methods using `useMemo` and `useCallback` to prevent frame drops during dashboard interactions.
* **Component Lazy Loading**: Use Next.js dynamic imports (`next/dynamic`) for large modules (like Recharts layout grids or canvas-based heatmap scripts) to keep the initial page bundle lightweight and fast.
* **Optimized Font Swapping**: Leverage Next/Font optimization features inside `src/app/layout.tsx` to eliminate layout shift font flickering when loading fonts.

---

## 10. Claude Code Custom Skills Specification

This section documents the syntax, structures, and configuration details for defining custom commands and skills inside Claude Code.

### A. Location & Naming Conventions
* **Local Project Skills**: Checked in under `.claude/skills/<skill-name>/SKILL.md` or `.github/skills/<skill-name>/SKILL.md`.
* **Personal/Global Skills**: Saved under `~/.claude/skills/<skill-name>/SKILL.md` (available across all project roots).
* **Command Mapping**: The directory name (e.g., `summarize-changes`) dictates the slash command name `/summarize-changes` invoked in chat.

### B. YAML Frontmatter Schema
Skills require YAML frontmatter encapsulated within `---` blocks at the top of `SKILL.md`:
* `description`: Explicit summary of what the skill does. Claude scans this to automatically auto-trigger/load the skill context when relevant.
* `disable-model-invocation`: Set to `true` to restrict execution to user slash calls only (disallows model auto-triggering).
* `user-invocable`: Set to `false` to permit only Claude to trigger the skill.
* `allowed-tools`: List of specific shell execution tools pre-approved for execution without prompt approval (e.g., `allowed-tools: Bash(npm run build) Bash(npm run lint)`).

### C. Dynamic Context Injection & Preprocessing
* **Inline Injection**: Prefix shell commands with `!` to automatically inline output before Claude parses the prompt:
  ```markdown
  ## Repository Diff Status
  !`git diff HEAD`
  ```
* **Fenced Script Execution**: Use code blocks initialized with ````! for multi-line context scripts:
  ```!
  echo "Active branch: $(git branch --show-current)"
  npm run test -- --silent
  ```

### D. Parameterized Command Arguments
* **Arguments Placeholder**: Use `$ARGUMENTS` (or `$0`, `$1`, `$2` positioning shorthand) to inject values passed next to the slash command (e.g., `/fix-issue 123` replaces `$ARGUMENTS` with `123`).
