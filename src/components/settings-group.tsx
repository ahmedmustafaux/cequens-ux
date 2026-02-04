import * as React from "react"
import { cn } from "@/lib/utils"

export interface SettingsGroupProps {
    title: string
    action?: React.ReactNode
    children: React.ReactNode
    className?: string
    contentClassName?: string
}

export function SettingsGroup({ title, action, children, className, contentClassName }: SettingsGroupProps) {
    return (
        <div className={cn("border rounded-xl bg-background overflow-hidden", className)}>
            <div className="px-4 py-3 flex items-center justify-between gap-4 border-b bg-muted/20">
                <h3 className="font-medium text-sm">{title}</h3>
                {action}
            </div>
            <div className={cn("p-4", contentClassName)}>
                {children}
            </div>
        </div>
    )
}
