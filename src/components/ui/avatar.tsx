import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
function Avatar({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root>) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn(
        "relative flex size-8 shrink-0 overflow-hidden rounded-full",
        className
      )}
      {...props}
    />
  )
}
function AvatarImage({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn("aspect-square size-full", className)}
      {...props}
    />
  )
}
function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        "bg-muted flex size-full items-center justify-center rounded-full",
        className
      )}
      {...props}
    />
  )
}
function AvatarSkeleton({ 
  size = "default", 
  className, 
  ...props 
}: React.ComponentProps<"div"> & { size?: "sm" | "default" | "lg" }) {
  const sizeClasses = {
    sm: "size-6",
    default: "size-8", 
    lg: "size-12"
  }
  return (
    <div
      data-slot="avatar-skeleton"
      className={cn(
        "relative flex shrink-0 overflow-hidden rounded-full",
        sizeClasses[size],
        className
      )}
      {...props}
    >
      <Skeleton className="size-full rounded-full" />
    </div>
  )
}
export { Avatar, AvatarImage, AvatarFallback, AvatarSkeleton }
