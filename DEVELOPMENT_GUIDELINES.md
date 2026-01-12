# 🚀 Development Guidelines

## **Project Overview**
This is a Vite React application with TypeScript, Tailwind CSS, and Framer Motion for animations.

## **Architecture & Structure**

### **Key Directories**
- `src/pages/` - React Router pages
- `src/components/` - Reusable UI components
- `src/lib/` - Utilities, configurations, and shared logic
- `src/hooks/` - Custom React hooks
- `public/` - Static assets

### **Component Structure**
- Use shadcn/ui components as base
- Follow atomic design principles
- Keep components focused and reusable
- Use TypeScript for all components

## **Styling Guidelines**

### **Tailwind CSS**
- Use utility-first approach
- Follow responsive design patterns
- Use design tokens consistently
- Prefer Tailwind classes over custom CSS

### **Component Styling**
```tsx
// ✅ Good - Use className with Tailwind
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm">

// ❌ Avoid - Inline styles
<div style={{ display: 'flex', padding: '16px' }}>
```

## **Animation Guidelines**

### **Framer Motion Usage**
- **ALWAYS** use centralized transitions from `src/lib/transitions.ts`
- **NEVER** create custom animation variants
- Import specific variants as needed

### **Required Imports**
```tsx
import { motion } from "framer-motion"
import { 
  pageVariants, 
  smoothTransition, 
  directionalTabVariants,
  modalVariants,
  loadingVariants,
  pageWrapperLoadingVariants,
  skeletonVariants,
  skeletonStaggerVariants,
  skeletonItemVariants
} from "@/lib/transitions"
```

### **Common Animation Patterns**
```tsx
// Page transitions
<motion.div variants={pageVariants} initial="initial" animate="animate" transition={smoothTransition}>

// Tab switching with direction
<motion.div variants={directionalTabVariants(direction)} initial="hidden" animate="visible" transition={smoothTransition}>

// Modal animations
<motion.div variants={modalVariants} initial="initial" animate="animate" transition={smoothTransition}>

// Loading states
<motion.div variants={loadingVariants} initial="initial" animate="animate" transition={smoothTransition}>

// Skeleton loading with stagger
<motion.div variants={skeletonStaggerVariants} initial="initial" animate="animate">
  <motion.div variants={skeletonItemVariants}>Content</motion.div>
</motion.div>

// Page wrapper loading
<motion.div variants={pageWrapperLoadingVariants} animate={isLoading ? "loading" : "loaded"}>
```

## **Code Quality Standards**

### **TypeScript**
- Use strict typing
- Define interfaces for props and data
- Avoid `any` type
- Use proper type imports

### **React Best Practices**
- Use functional components with hooks
- Implement proper error boundaries
- Follow React naming conventions
- Use proper key props for lists

### **Performance**
- Use React.memo for expensive components
- Implement proper loading states
- Optimize images with proper sizing and formats
- Use dynamic imports for code splitting

## **State Management**

### **Local State**
- Use useState for component state
- Use useReducer for complex state logic
- Implement proper state updates

### **Global State**
- Use React Context for app-wide state
- Implement custom hooks for state logic
- Keep state as close to usage as possible

## **API & Data Fetching**

### **Data Fetching**
- Use React Query for server state
- Implement proper loading and error states
- Use proper TypeScript types for API responses

### **Mock Data**
- Use centralized mock data from `src/data/mock-data.ts`
- Keep data generation logic in the mock data file, not in components
- Components should import and use mock data functions
- This separation makes it easier to replace with real API calls later

### **Form Handling**
- Use react-hook-form for form management
- Implement proper validation with Zod
- Handle form errors gracefully

## **File Naming Conventions**

### **Components**
- Use PascalCase: `UserProfile.tsx`
- Use descriptive names: `CampaignSettings.tsx`
- Group related components in folders

### **Utilities**
- Use camelCase: `formatDate.ts`
- Use descriptive names: `validateEmail.ts`
- Group in appropriate lib folders

### **Pages**
- Follow React Router conventions
- Use PascalCase for page components: `CampaignSettings.tsx`
- Keep page components focused

## **Testing Guidelines**

### **Component Testing**
- Test component behavior, not implementation
- Use proper test utilities
- Mock external dependencies
- Test error states and edge cases

### **Integration Testing**
- Test user workflows
- Test API integrations
- Test responsive behavior

## **Accessibility**

### **WCAG Compliance**
- Use semantic HTML elements
- Implement proper ARIA labels
- Ensure keyboard navigation
- Test with screen readers

### **Performance**
- Optimize for Core Web Vitals
- Implement proper loading states
- Use efficient animations
- Minimize bundle size

## **Development Workflow**

### **Git Workflow**
- Use descriptive commit messages
- Create feature branches
- Use pull requests for code review
- Keep commits atomic

### **Code Review**
- Review for functionality and performance
- Check TypeScript types
- Verify accessibility
- Test responsive design

## **Dependencies**

### **Core Dependencies**
- Vite 5.4.10 - Build tool
- React 19.0.0 - UI library
- TypeScript 5 - Type safety
- Tailwind CSS 4 - Styling
- Framer Motion 12.23.12 - Animations
- React Router 6.28.0 - Routing

### **UI Components**
- shadcn/ui - Component library
- Radix UI - Headless components
- Lucide React - Icons

### **Utilities**
- clsx - Conditional classes
- tailwind-merge - Tailwind class merging
- date-fns - Date manipulation
- Zod - Schema validation

## **Quick Commands**

```bash
# Development
npm run dev

# Build
npm run build

# Lint
npm run lint

# Animation guidelines
npm run animations
```

## **Important Files**

- `src/lib/transitions.ts` - Animation configurations
- `src/lib/utils.ts` - Utility functions
- `src/lib/validation.ts` - Form validation schemas
- `components.json` - shadcn/ui configuration
- `tailwind.config.js` - Tailwind configuration
