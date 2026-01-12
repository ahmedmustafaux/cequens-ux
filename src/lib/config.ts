// Simple function to get app name from environment or use default
function getProjectName(): string {
  // Check for environment variable first (Vite uses import.meta.env)
  if (import.meta.env.VITE_APP_NAME) {
    return import.meta.env.VITE_APP_NAME
  }
  
  // Default fallback
  return "CEQUENS"
}

// Get the dynamic app name
const dynamicAppName = getProjectName()

export const appConfig = {
  name: dynamicAppName,
  description: "A modern communication platform for managing campaigns, contacts, and messages",
  version: "1.0.0",
  author: dynamicAppName,
  
  // SEO Configuration
  seo: {
    title: {
      template: `%s | ${dynamicAppName}`,
      default: `${dynamicAppName} - Communication Platform`
    },
    description: "Streamline your communication workflows with our modern platform for managing campaigns, contacts, and messages",
    keywords: ["communication", "campaigns", "messaging", "platform", "automation"],
    openGraph: {
      type: "website",
      locale: "en_US",
      siteName: dynamicAppName
    }
  }
}

// Helper function to generate page titles
export function generatePageTitle(pageTitle?: string): string {
  if (!pageTitle) return appConfig.seo.title.default
  return `${pageTitle} | ${appConfig.name}`
}

// Helper function to get full app name
export function getAppName(): string {
  return appConfig.name
}

// Helper function to get logo alt text
export function getLogoAltText(): string {
  return `${appConfig.name} Logo`
}

// Helper function to get account text
export function getAccountText(): string {
  return `${appConfig.name} account`
}

// Helper function to get welcome message
export function getWelcomeMessage(): string {
  return `Welcome to ${appConfig.name}! 🎉`
}

// Helper function to get join message
export function getJoinMessage(): string {
  return `Join ${appConfig.name} and start your journey`
}
