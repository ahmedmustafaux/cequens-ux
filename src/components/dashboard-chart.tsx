import * as React from "react"
import { motion } from "framer-motion"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CardSkeleton } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { loadingVariants, smoothTransition } from "@/lib/transitions"
import { getDashboardChartData } from "@/data/mock-data"

interface DashboardChartProps {
  timeRange: string
  isLoading?: boolean
  isEmpty?: boolean
  className?: string
}

export function DashboardChart({ timeRange, isLoading = false, isEmpty = false, className }: DashboardChartProps) {
  const [activeMetric, setActiveMetric] = React.useState<"messages" | "senders">("messages")
  const [barColor, setBarColor] = React.useState<string>('')
  const chartRef = React.useRef<HTMLDivElement>(null)
  
  // Get computed color from chart config CSS variable
  React.useEffect(() => {
    const updateColor = () => {
      if (chartRef.current) {
        const chartElement = chartRef.current.querySelector('[data-chart]') as HTMLElement
        if (chartElement) {
          const computed = getComputedStyle(chartElement)
          const colorVar = computed.getPropertyValue(`--color-${activeMetric}`).trim()
          if (colorVar) {
            setBarColor(colorVar)
          }
        }
      }
    }
    
    updateColor()
    // Update on theme changes
    const observer = new MutationObserver(updateColor)
    if (chartRef.current) {
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class']
      })
    }
    
    return () => observer.disconnect()
  }, [activeMetric])
  
  // Get chart data from mock data
  const chartData = getDashboardChartData(timeRange)
  
  // Empty data for new users
  const emptyData = chartData.map(item => ({
    ...item,
    messages: 0,
    senders: 0
  }))
  
  const data = isEmpty ? emptyData : chartData

  if (isLoading) {
    return <CardSkeleton className="h-[400px]" />
  }

  // Calculate totals for the summary
  const messagesTotal = data.reduce((sum, item) => sum + item.messages, 0)
  const sendersTotal = data.reduce((sum, item) => sum + item.senders, 0)

  const totals = {
    messages: messagesTotal,
    senders: sendersTotal
  }

  // Prevent rendering if component is unmounting (helps avoid React warnings during navigation)
  const [isMounted, setIsMounted] = React.useState(true)
  
  React.useEffect(() => {
    setIsMounted(true)
    return () => {
      setIsMounted(false)
    }
  }, [])

  if (!isMounted) {
    return null
  }

  return (
    <motion.div
      variants={loadingVariants}
      animate={isLoading ? "loading" : "animate"}
      transition={smoothTransition}
      className={`${className || ""}`}
    >
      <Card className="py-0">
        <CardHeader className="flex flex-col items-stretch border-b border-border !p-0 sm:flex-row">
          <div className="flex flex-1 flex-col justify-center gap-1 px-4 pt-4 pb-3 sm:!py-6">
            <CardTitle>Performance Metrics</CardTitle>
            <CardDescription>
              Showing total messages and active senders
            </CardDescription>
          </div>
          <div className="flex">
            {["messages", "senders"].map((key) => {
              const metric = key as keyof typeof totals
              return (
                <button
                  key={metric}
                  data-active={activeMetric === metric}
                  className="data-[active=true]:bg-muted/50 relative z-30 flex flex-1 flex-col justify-center gap-1 border-t border-border px-3 py-3 text-left even:border-l even:border-border sm:border-t-0 sm:border-l sm:border-border sm:px-4 sm:py-6 min-w-[120px] sm:min-w-[160px] cursor-pointer hover:bg-muted/50"
                  onClick={() => setActiveMetric(metric)}
                  disabled={isEmpty}
                >
                  <span className="text-muted-foreground text-xs whitespace-nowrap">
                    {metric === "messages" ? "Messages Sent" : "Active Senders"}
                  </span>
                  <span className="text-lg leading-none font-bold sm:text-xl">
                    {totals[metric].toLocaleString()}
                  </span>
                </button>
              )
            })}
          </div>
        </CardHeader>
        <CardContent className="px-2 sm:p-6">
          <div className="h-[250px] w-full" ref={chartRef}>
            <ChartContainer 
              config={{
                messages: {
                  label: "Messages Sent",
                  color: "var(--primary)"
                },
                senders: {
                  label: "Active Senders",
                  color: "var(--primary)"
                }
              }}
              className="aspect-auto h-[250px] w-full"
            >
              <BarChart
                accessibilityLayer
                data={data}
                margin={{
                  left: 12,
                  right: 12,
                }}
              >
                <CartesianGrid vertical={false} />
                <XAxis 
                  dataKey="period" 
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  interval={timeRange === "7d" ? 0 : timeRange === "30d" ? 4 : 9} // Adjust interval based on time range
                  tick={{ fontSize: 12, fill: 'oklch(var(--muted-foreground))' }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: 'oklch(var(--muted-foreground))' }}
                  tickFormatter={(value) => `${value.toLocaleString()}`}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      className="w-[150px]"
                      nameKey="views"
                      labelFormatter={(value) => {
                        // Find the corresponding data point to get the full date
                        const dataPoint = data.find(d => d.period === value)
                        if (dataPoint) {
                          const date = new Date(dataPoint.date)
                          return date.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        }
                        return value
                      }}
                    />
                  }
                />
                <Bar 
                  dataKey={activeMetric} 
                  fill={barColor || 'var(--primary)'}
                  radius={[4, 4, 0, 0]} 
                />
              </BarChart>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}