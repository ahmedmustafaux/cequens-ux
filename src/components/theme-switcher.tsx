import React, { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Moon, Sun } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function ThemeSwitcher({ className = "" }: { className?: string }) {
  const [isDark, setIsDark] = useState(() => {
    // Initialize from localStorage or system preference to avoid flash
    if (typeof window !== "undefined") {
      const storedTheme = localStorage.getItem("theme")
      if (storedTheme === "dark") return true
      if (storedTheme === "light") return false
      return window.matchMedia("(prefers-color-scheme: dark)").matches
    }
    return false
  })

  useEffect(() => {
    // Check localStorage and system preference on mount
    const storedTheme = localStorage.getItem("theme")
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    
    // Determine initial theme
    let shouldBeDark = false
    if (storedTheme === "dark") {
      shouldBeDark = true
    } else if (storedTheme === "light") {
      shouldBeDark = false
    } else {
      // No stored preference, use system preference
      shouldBeDark = prefersDark
    }
    
    setIsDark(shouldBeDark)
    updateTheme(shouldBeDark)

    // Listen for system theme changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    const handleChange = (e: MediaQueryListEvent) => {
      // Only update if user hasn't set a preference
      if (!localStorage.getItem("theme")) {
        setIsDark(e.matches)
        updateTheme(e.matches)
      }
    }
    
    mediaQuery.addEventListener("change", handleChange)
    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [])

  const updateTheme = (dark: boolean) => {
    const root = document.documentElement
    if (dark) {
      root.classList.add("dark")
    } else {
      root.classList.remove("dark")
    }
  }

  const toggleTheme = () => {
    const newTheme = !isDark
    setIsDark(newTheme)
    updateTheme(newTheme)
    localStorage.setItem("theme", newTheme ? "dark" : "light")
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={`size-7 ${className}`}
          onClick={toggleTheme}
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDark ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom" align="center">
        <p>{isDark ? "Switch to light mode" : "Switch to dark mode"}</p>
      </TooltipContent>
    </Tooltip>
  )
}
