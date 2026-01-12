import { Toaster as Sonner, ToasterProps } from "sonner"
import { useEffect, useState } from "react"

const Toaster = ({ ...props }: ToasterProps) => {
  // Default position is top-right, but check localStorage for saved preference
  const [position, setPosition] = useState<ToasterProps["position"]>("top-right")
  // Track theme state
  const [theme, setTheme] = useState<"light" | "dark" | "system">(() => {
    if (typeof window !== "undefined") {
      const storedTheme = localStorage.getItem("theme")
      if (storedTheme === "dark") return "dark"
      if (storedTheme === "light") return "light"
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
    }
    return "light"
  })
  
  useEffect(() => {
    // Get position from localStorage on component mount
    const savedPosition = localStorage.getItem("toast-position")
    if (savedPosition) {
      setPosition(savedPosition as ToasterProps["position"])
    }
    
    // Listen for storage changes (when position is updated in settings)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "toast-position" && e.newValue) {
        setPosition(e.newValue as ToasterProps["position"])
      } else if (e.key === "theme" && e.newValue) {
        setTheme(e.newValue === "dark" ? "dark" : "light")
      }
    }
    
    // Listen for custom event (for same-tab updates)
    const handlePositionChange = (e: CustomEvent) => {
      if (e.detail) {
        setPosition(e.detail as ToasterProps["position"])
      }
    }
    
    // Listen for theme changes by observing the document class
    const updateTheme = () => {
      const isDark = document.documentElement.classList.contains("dark")
      setTheme(isDark ? "dark" : "light")
    }
    
    // Initial theme check
    updateTheme()
    
    // Watch for class changes on document element
    const observer = new MutationObserver(updateTheme)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    })
    
    // Listen for system theme changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem("theme")) {
        setTheme(e.matches ? "dark" : "light")
      }
    }
    
    window.addEventListener("storage", handleStorageChange)
    window.addEventListener("toast-position-changed" as any, handlePositionChange as any)
    mediaQuery.addEventListener("change", handleSystemThemeChange)
    
    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("toast-position-changed" as any, handlePositionChange as any)
      mediaQuery.removeEventListener("change", handleSystemThemeChange)
      observer.disconnect()
    }
  }, [])
  
  return (
    <Sonner
      theme={theme}
      position={position}
      className="toaster"
      toastOptions={{
        duration: 4000,
        closeButton: false,
      }}
      {...props}
    />
  )
}
export { Toaster }
