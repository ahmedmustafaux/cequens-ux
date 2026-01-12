import * as React from "react"

import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "bg-card text-card-foreground flex flex-col gap-4 rounded-xl border py-4 shadow-sm",
        className
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-4 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-4",
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("leading-none font-semibold", className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-4", className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-4 [.border-t]:pt-4", className)}
      {...props}
    />
  )
}

// Skeleton variants for Card components
function CardSkeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-skeleton"
      className={cn(
        "bg-card text-card-foreground flex flex-col gap-4 rounded-xl py-4 shadow-sm",
        className
      )}
      {...props}
    >
      <div className="px-4 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-6 w-1/2" />
      </div>
      <div className="px-4 space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
      </div>
    </div>
  )
}

function CardHeaderSkeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header-skeleton"
      className={cn("px-4 space-y-2", className)}
      {...props}
    >
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-6 w-1/2" />
    </div>
  )
}

function CardContentSkeleton({ 
  lines = 3, 
  className, 
  ...props 
}: React.ComponentProps<"div"> & { lines?: number }) {
  return (
    <div
      data-slot="card-content-skeleton"
      className={cn("px-4 space-y-2", className)}
      {...props}
    >
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton 
          key={index} 
          className={`h-4 ${index === lines - 1 ? 'w-4/6' : 'w-full'}`} 
        />
      ))}
    </div>
  )
}

function CardFooterSkeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer-skeleton"
      className={cn("flex items-center px-4", className)}
      {...props}
    >
      <Skeleton className="h-8 w-24" />
    </div>
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
  CardSkeleton,
  CardHeaderSkeleton,
  CardContentSkeleton,
  CardFooterSkeleton,
}
