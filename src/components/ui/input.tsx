import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-11 w-full min-w-0 rounded-lg border border-input bg-foreground/[0.03] px-3 py-2 text-base transition-all duration-300 outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-primary focus-visible:bg-transparent focus-visible:ring-1 focus-visible:ring-primary disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-80 aria-invalid:border-destructive aria-invalid:ring-destructive/20 md:text-sm dark:bg-background/30 dark:border-white/8",
        className
      )}
      {...props}
    />
  )
}

export { Input }
