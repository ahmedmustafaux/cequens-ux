import { ReactNode } from 'react'
import { ThemeSwitcher } from '@/components/theme-switcher'

interface LoginLayoutProps {
  children: ReactNode
}

export default function LoginLayout({ children }: LoginLayoutProps) {
  return (
    <div className="min-h-screen bg-layout flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Theme Switcher - Top Right Corner */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
        <ThemeSwitcher />
      </div>
      {children}
    </div>
  )
}
