import * as React from "react"
import { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

interface InputProps extends React.ComponentProps<"input"> {
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

function Input({ 
  className, 
  type, 
  isLoading = false,
  leftIcon,
  rightIcon,
  ...props 
}: InputProps) {
  if (isLoading) {
    return <InputSkeleton className={className} />
  }

  return (
    <div className="relative w-full">
      {leftIcon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          {leftIcon}
        </div>
      )}
      <input
        type={type}
        data-slot="input"
        className={cn(
          "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-border-input flex h-10 sm:h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-2 sm:py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
          "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
          "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-border-destructive",
          leftIcon && "pl-10",
          rightIcon && "pr-10",
          className
        )}
        {...props}
      />
      {rightIcon && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          {rightIcon}
        </div>
      )}
    </div>
  )
}

function InputSkeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-skeleton"
      className={cn(
        "flex h-10 sm:h-9 w-full min-w-0 rounded-md bg-transparent px-3 py-2 sm:py-1",
        className
      )}
      {...props}
    >
      <Skeleton className="h-4 w-full" />
    </div>
  )
}

export { Input, InputSkeleton }
