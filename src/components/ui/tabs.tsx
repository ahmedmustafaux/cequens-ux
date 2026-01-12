import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
interface TabsProps extends React.ComponentProps<typeof TabsPrimitive.Root> {
  isLoading?: boolean
  loadingTabCount?: number
  showContentSkeleton?: boolean
  skeletonComponent?: React.ReactNode
}
function Tabs({
  className,
  isLoading = false,
  loadingTabCount = 3,
  showContentSkeleton = false,
  skeletonComponent,
  children,
  ...props
}: TabsProps) {
  if (isLoading) {
    return (
      <div className={cn("flex flex-col gap-6", className)}>
        <div className="px-4 lg:px-6 flex justify-start">
          <div className="bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-lg p-[3px] gap-2">
            {Array.from({ length: loadingTabCount }).map((_, index) => (
              <Skeleton 
                key={index} 
                className="h-[calc(100%-1px)] rounded-md px-2 py-1"
                style={{ width: `${60 + Math.random() * 40}px` }}
              />
            ))}
          </div>
        </div>
        
        {showContentSkeleton && (
          <div className="px-4 lg:px-6">
            {skeletonComponent || (
              <div className="space-y-4">
                {/* Default content skeleton */}
                <div className="space-y-3">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Skeleton key={index} className="h-12 w-full" />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-4", className)}
      {...props}
    >
      {children}
    </TabsPrimitive.Root>
  )
}
function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        "bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-lg p-[3px] gap-2",
        className
      )}
      {...props}
    />
  )
}
function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "data-[state=active]:bg-background dark:data-[state=active]:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring dark:data-[state=active]:border-border-input dark:data-[state=active]:bg-input/30 text-foreground dark:text-muted-foreground inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-all duration-200 ease-in-out focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:shadow-sm [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 cursor-pointer hover:bg-background/50",
        className
      )}
      {...props}
    />
  )
}
function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn(
        "flex-1 outline-none",
        "data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:slide-in-from-right-2 data-[state=active]:duration-200 data-[state=active]:delay-100 data-[state=active]:ease-in-out",
        "data-[state=inactive]:animate-out data-[state=inactive]:fade-out-0 data-[state=inactive]:slide-out-to-left-2 data-[state=inactive]:duration-200 data-[state=inactive]:ease-in-out",
        className
      )}
      {...props}
    />
  )
}
export { Tabs, TabsList, TabsTrigger, TabsContent }
