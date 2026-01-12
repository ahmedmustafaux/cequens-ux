import { ReactNode } from "react"
import { motion } from "framer-motion"

interface PageWrapperProps {
  children: ReactNode
  isLoading?: boolean // Keep the prop but ignore it
}

export function PageWrapper({ 
  children,
  isLoading: _ = false // Ignore the loading prop
}: PageWrapperProps) {
  return (
    <div className="min-h-full">
      <motion.div
        key="content"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="flex flex-col gap-6 md:gap-6 lg:gap-6"
      >
        {children}
      </motion.div>
    </div>
  )
}