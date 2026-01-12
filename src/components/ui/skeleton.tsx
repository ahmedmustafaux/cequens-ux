import { cn } from "@/lib/utils"
import { motion, HTMLMotionProps } from "framer-motion"
import { skeletonVariants } from "@/lib/transitions"

// Exclude conflicting props between React and Framer Motion
type SkeletonProps = Omit<HTMLMotionProps<"div">, "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart" | "onAnimationEnd" | "onAnimationIteration"> & {
  className?: string
}

function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <motion.div
      data-slot="skeleton"
      className={cn(
        "bg-muted animate-pulse rounded-md",
        "before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent before:rounded-md",
        "relative overflow-hidden",
        className
      )}
      variants={skeletonVariants}
      initial="initial"
      animate="animate"
      {...props}
    />
  )
}

export { Skeleton }
