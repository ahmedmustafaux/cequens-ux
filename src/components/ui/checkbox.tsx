import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { CheckIcon, MinusIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
interface CheckboxProps extends React.ComponentProps<typeof CheckboxPrimitive.Root> {
  containerClickable?: boolean
}
function Checkbox({
  className,
  containerClickable = false,
  ...props
}: CheckboxProps) {
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    // Always stop propagation to prevent row click handlers from being triggered
    event.stopPropagation()
    // Call the original onClick if it exists
    if (props.onClick) {
      props.onClick(event)
    }
  }
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer border-border-input dark:bg-input/30 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground dark:data-[state=checked]:bg-primary dark:data-[state=indeterminate]:bg-primary data-[state=checked]:border-border-primary data-[state=indeterminate]:border-border-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-border-destructive size-4 shrink-0 rounded-[4px] border shadow-xs transition-shadow outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer",
        containerClickable && "cursor-pointer",
        className
      )}
      onClick={handleClick}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="flex items-center justify-center text-current transition-none"
      >
        {props.checked === "indeterminate" ? (
          <MinusIcon className="size-3.5" />
        ) : (
          <CheckIcon className="size-3.5" />
        )}
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}
function CheckboxSkeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <Skeleton 
      className={cn("h-4 w-4 rounded-sm", className)} 
      {...props} 
    />
  )
}
export { Checkbox, CheckboxSkeleton }
