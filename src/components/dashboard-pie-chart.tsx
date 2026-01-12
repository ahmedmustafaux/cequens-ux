import * as React from "react"
import { motion } from "framer-motion"
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CardSkeleton } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { loadingVariants, smoothTransition } from "@/lib/transitions"
import { getChartData } from "@/data/mock-data"

interface DashboardPieChartProps {
  timeRange: string
  isLoading?: boolean
  isEmpty?: boolean
}

export function DashboardPieChart({ timeRange, isLoading = false, isEmpty = false }: DashboardPieChartProps) {
  const [pieColors, setPieColors] = React.useState<{ whatsapp: string; sms: string }>({
    whatsapp: '',
    sms: ''
  })
  const chartRef = React.useRef<HTMLDivElement>(null)
  
  // Prevent rendering if component is unmounting (helps avoid React warnings during navigation)
  const [isMounted, setIsMounted] = React.useState(true)
  
  React.useEffect(() => {
    setIsMounted(true)
    return () => {
      setIsMounted(false)
    }
  }, [])
  
  // Get computed colors from chart config CSS variables
  React.useEffect(() => {
    const updateColors = () => {
      if (chartRef.current) {
        const chartElement = chartRef.current.querySelector('[data-chart]') as HTMLElement
        if (chartElement) {
          const computed = getComputedStyle(chartElement)
          const whatsappColor = computed.getPropertyValue('--color-whatsapp').trim()
          const smsColor = computed.getPropertyValue('--color-sms').trim()
          if (whatsappColor && smsColor) {
            setPieColors({
              whatsapp: whatsappColor,
              sms: smsColor
            })
          }
        }
      }
    }
    
    updateColors()
    // Update on theme changes
    const observer = new MutationObserver(updateColors)
    if (chartRef.current) {
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class']
      })
    }
    
    return () => observer.disconnect()
  }, [])
  
  // Get chart data from mock data
  const chartData = getChartData(timeRange)
  
  if (!isMounted) {
    return null
  }

  if (isLoading) {
    return <CardSkeleton className="h-[250px]" />
  }

  // Calculate totals for WhatsApp and SMS
  const whatsappTotal = isEmpty ? 0 : chartData.reduce((sum, item) => sum + item.whatsapp, 0)
  const smsTotal = isEmpty ? 0 : chartData.reduce((sum, item) => sum + item.sms, 0)

  // Prepare data for pie chart - using computed colors from chart config
  const pieData = [
    { name: 'WhatsApp', value: whatsappTotal, color: pieColors.whatsapp || 'var(--primary)' },
    { name: 'SMS', value: smsTotal, color: pieColors.sms || 'var(--chart-2)' },
  ]

  return (
    <motion.div
      variants={loadingVariants}
      animate={isLoading ? "loading" : "animate"}
      transition={smoothTransition}
    >
      <Card className="py-0">
        <CardHeader className="flex flex-col items-stretch border-b border-border !p-0 sm:flex-row">
          <div className="flex flex-1 flex-col justify-center gap-1 px-4 pt-4 pb-3 sm:!py-6">
            <CardTitle>Message Distribution</CardTitle>
            <CardDescription>
              WhatsApp vs SMS message distribution
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="px-2 sm:p-6">
          <div className="h-[250px] w-full" ref={chartRef}>
            <ChartContainer 
              config={{
                whatsapp: {
                  label: "WhatsApp",
                  color: "var(--primary)"
                },
                sms: {
                  label: "SMS",
                  color: "var(--chart-1)"
                }
              }}
              className="aspect-auto h-[250px] w-full"
            >
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill={pieColors.whatsapp || 'var(--primary)'}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={
                    <ChartTooltipContent
                      className="w-[150px]"
                      nameKey="name"
                    />
                  }
                />
                <Legend />
              </PieChart>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}