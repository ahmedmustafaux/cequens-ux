import * as React from "react"
import { cn } from "@/lib/utils"

interface PasswordStrengthProps {
  password: string
  className?: string
}

export function PasswordStrength({ password, className }: PasswordStrengthProps) {
  const getPasswordStrength = (password: string) => {
    if (!password) return { score: 0, label: "", color: "" }
    
    let score = 0
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password),
      special: /[@$!%*?&]/.test(password)
    }
    
    score = Object.values(checks).filter(Boolean).length
    
    if (score <= 2) return { score, label: "Weak", color: "bg-destructive" }
    if (score <= 3) return { score, label: "Fair", color: "bg-warning" }
    if (score <= 4) return { score, label: "Good", color: "bg-info" }
    return { score, label: "Strong", color: "bg-success" }
  }
  
  const strength = getPasswordStrength(password)
  
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Password strength:</span>
        <span className={cn(
          "font-medium",
          strength.score <= 2 ? "text-destructive" : 
          strength.score <= 3 ? "text-warning-foreground" : 
          strength.score <= 4 ? "text-info-foreground" : "text-success-foreground"
        )}>
          {strength.label}
        </span>
      </div>
      
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((level) => (
          <div
            key={level}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors",
              level <= strength.score ? strength.color : "bg-muted"
            )}
          />
        ))}
      </div>
      
      <div className="text-xs text-muted-foreground space-y-1">
        <div className="flex items-center gap-1">
          <div className={cn("w-1 h-1 rounded-full", password.length >= 8 ? "bg-success" : "bg-muted-foreground/30")} />
          <span>At least 8 characters</span>
        </div>
        <div className="flex items-center gap-1">
          <div className={cn("w-1 h-1 rounded-full", /[a-z]/.test(password) ? "bg-success" : "bg-muted-foreground/30")} />
          <span>One lowercase letter</span>
        </div>
        <div className="flex items-center gap-1">
          <div className={cn("w-1 h-1 rounded-full", /[A-Z]/.test(password) ? "bg-success" : "bg-muted-foreground/30")} />
          <span>One uppercase letter</span>
        </div>
        <div className="flex items-center gap-1">
          <div className={cn("w-1 h-1 rounded-full", /\d/.test(password) ? "bg-success" : "bg-muted-foreground/30")} />
          <span>One number</span>
        </div>
        <div className="flex items-center gap-1">
          <div className={cn("w-1 h-1 rounded-full", /[@$!%*?&]/.test(password) ? "bg-success" : "bg-muted-foreground/30")} />
          <span>One special character (@$!%*?&)</span>
        </div>
      </div>
    </div>
  )
}
