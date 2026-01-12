/**
 * CENTRALIZED FRAMER MOTION TRANSITIONS
 * ====================================
 * 
 * This file contains all animation configurations for the application.
 * AI should ALWAYS reference this file when implementing animations.
 * 
 * USAGE GUIDELINES:
 * - Always use these predefined transitions instead of creating custom ones
 * - Import specific variants and transitions as needed
 * - Maintain consistency across all components
 * 
 * AVAILABLE TRANSITIONS:
 * - pageVariants: For page-level animations
 * - directionalTabVariants: For tab switching with direction awareness
 * - smoothTransition: Ultra-smooth cubic-bezier easing
 * - modalVariants: For modals and dialogs
 * - loadingVariants: For loading states
 * - skeletonVariants: For skeleton loading animations
 * - skeletonStaggerVariants: For staggered skeleton loading
 * - skeletonItemVariants: For individual skeleton items
 * 
 * EXAMPLES:
 * ```tsx
 * import { motion } from "framer-motion"
 * import { pageVariants, smoothTransition } from "@/lib/transitions"
 * 
 * <motion.div
 *   variants={pageVariants}
 *   initial="initial"
 *   animate="animate"
 *   exit="exit"
 *   transition={smoothTransition}
 * >
 * ```
 */

import { Variants, Transition } from "framer-motion";

// Default Framer Motion transition presets (using native values)
export const motionTransitions = {
  // Duration presets (in seconds) - using Framer Motion defaults
  duration: {
    fast: 0.2,
    normal: 0.3,
    slow: 0.5,
    slower: 0.8,
  },
  
  // Easing presets - using Framer Motion native easing
  easing: {
    easeInOut: "easeInOut",
    easeOut: "easeOut", 
    easeIn: "easeIn",
    linear: "linear",
    spring: { type: "spring", stiffness: 300, damping: 30 },
    bounce: { type: "spring", stiffness: 400, damping: 10 },
  },
} as const;

// Common transition configurations using Framer Motion defaults
export const commonTransitions: Transition = {
  duration: motionTransitions.duration.normal,
  ease: motionTransitions.easing.easeOut,
};

// Fast transition for quick interactions
export const fastTransition: Transition = {
  duration: motionTransitions.duration.fast,
  ease: motionTransitions.easing.easeOut,
};

// Spring transition for bouncy effects
export const springTransition: Transition = motionTransitions.easing.spring;

// Bounce transition for playful interactions
export const bounceTransition: Transition = motionTransitions.easing.bounce;

// Default Framer Motion transition (uses all defaults)
export const defaultTransition: Transition = {};

// Ultra-smooth transition with custom cubic-bezier easing
export const smoothTransition: Transition = {
  duration: 0.5,
  ease: [0.25, 0.1, 0.25, 1], // Custom cubic-bezier for ultra-smooth feel
};

// Gentle transition for subtle animations
export const gentleTransition: Transition = {
  duration: 0.4,
  ease: [0.25, 0.1, 0.25, 1],
};

// Quick transition for responsive interactions
export const quickTransition: Transition = {
  duration: 0.3,
  ease: [0.4, 0, 1, 1],
};

// Smooth tabs transition variants using Framer Motion defaults
export const smoothTabVariants: Variants = {
  hidden: {
    opacity: 0,
    x: -50,
  },
  visible: {
    opacity: 1,
    x: 0,
  },
  exit: {
    opacity: 0,
    x: 50,
  },
};

// Ultra-smooth directional tabs variants with enhanced easing and timing
export const directionalTabVariants = (direction: number): Variants => ({
  hidden: {
    opacity: 0,
    x: direction > 0 ? 60 : -60, // Slide in from right when going forward, left when going backward
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.1, 0.25, 1], // Custom cubic-bezier for ultra-smooth feel
    },
  },
  exit: {
    opacity: 0,
    x: direction > 0 ? -60 : 60, // Slide out to left when going forward, right when going backward
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 1, 1], // Smooth exit easing
    },
  },
});

// Tab transition variants using Framer Motion defaults (legacy)
export const tabVariants: Variants = {
  initial: {
    opacity: 0,
    x: 20,
  },
  animate: {
    opacity: 1,
    x: 0,
  },
  exit: {
    opacity: 0,
    x: -20,
  },
};

// Ultra-smooth page transition variants with enhanced easing
export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 15,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.1, 0.25, 1], // Custom cubic-bezier for ultra-smooth feel
    },
  },
  exit: {
    opacity: 0,
    y: -15,
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 1, 1], // Smooth exit easing
    },
  },
};

// Modal/Dialog transition variants using Framer Motion defaults
export const modalVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
  },
  exit: {
    opacity: 0,
    y: 20,
  },
};

// Enhanced loading and skeleton transitions using Framer Motion
export const loadingVariants: Variants = {
  initial: {
    opacity: 0.7,
    y: 4,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: smoothTransition,
  },
  loading: {
    opacity: 0.7,
    y: 4,
    transition: quickTransition,
  },
};

// Skeleton shimmer animation variants
export const skeletonVariants: Variants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: smoothTransition,
  },
  shimmer: {
    opacity: 1,
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "linear",
    },
  },
};

// Staggered skeleton loading for multiple elements
export const skeletonStaggerVariants: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export const skeletonItemVariants: Variants = {
  initial: {
    opacity: 0,
    y: 10,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: smoothTransition,
  },
};

// Slide transition variants
export const slideVariants = {
  left: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  },
  right: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
  },
  up: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  },
  down: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
  },
} as const;

// Fade transition variants
export const fadeVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};


// Stagger animation variants for lists
export const staggerVariants: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

// Individual item variants for stagger animations
export const staggerItemVariants: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

// Initial Y-direction transition for tab content (coming soon components)
export const initialTabContentVariants: Variants = {
  initial: {
    opacity: 0,
    y: -20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: smoothTransition,
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: smoothTransition,
  },
};

// Legacy CSS-based transitions (kept for backward compatibility)
export const loadingTransitions = {
  // Page wrapper loading state (from globals.css)
  pageWrapper: {
    base: "transition-all duration-200 ease-in-out",
    loading: "opacity-70 translate-y-1", // opacity: 0.7; transform: translateY(4px)
  },
  
  // Skeleton shimmer animation
  skeleton: {
    base: "animate-pulse",
    shimmer: "before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent",
  },
} as const;

// Duration presets (CSS classes)
export const durations = {
  fast: "duration-150",
  normal: "duration-200",
  slow: "duration-300",
  slower: "duration-500",
} as const;

// Delay presets (CSS classes)
export const delays = {
  none: "",
  short: "delay-75",
  normal: "delay-100",
  long: "delay-150",
  longer: "delay-300",
} as const;
