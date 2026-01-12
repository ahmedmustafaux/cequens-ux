import * as React from "react"
import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { Check, ChevronRight, Loader2, Code, AppWindow } from "lucide-react"
import { EnvelopeSimple, ChatText, Phone as PhoneIcon, Bell } from "phosphor-react"
import { useAuth } from "@/hooks/use-auth"
import { useOnboarding } from "@/contexts/onboarding-context"
import { smoothTransition, pageVariants } from "@/lib/transitions"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { OnboardingTemplateSelection, IndustryTemplate } from "@/components/onboarding-template-selection"
import { OnboardingIndustryOverview } from "@/components/onboarding-industry-overview"
import { ThemeSwitcher } from "@/components/theme-switcher"

// Define interfaces for option types
interface BaseOption {
  id: string;
  label: string;
}

interface IconOption extends BaseOption {
  iconType: "lucide" | "svg" | "img" | "visual" | "phosphor";
  icon: string;
}

type Option = BaseOption | IconOption;

interface OnboardingStep {
  id: number;
  question: string;
  options: Option[];
  multiSelect: boolean;
  visualOptions?: boolean;
}

// Helper function to check if an option has an icon
const hasIcon = (option: Option): option is IconOption => {
  return 'iconType' in option && 'icon' in option;
};

// Grayscale visual components
const CodeSnippetVisual = () => (
  <svg
    width="100%"
    height="100"
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="grayscale w-full"
    preserveAspectRatio="xMidYMid meet"
  >
    {/* Code editor background */}
    <rect x="10" y="15" width="80" height="70" rx="5" fill="var(--visual-bg)" stroke="var(--visual-border)" strokeWidth="2"/>
    {/* Window controls */}
    <circle cx="22" cy="25" r="4" fill="var(--visual-accent)"/>
    <circle cx="35" cy="25" r="4" fill="var(--visual-accent)"/>
    <circle cx="48" cy="25" r="4" fill="var(--visual-accent)"/>
    {/* Code lines */}
    <rect x="20" y="40" width="60" height="4" rx="2" fill="var(--visual-border)"/>
    <rect x="20" y="50" width="50" height="4" rx="2" fill="var(--visual-border)"/>
    <rect x="20" y="60" width="65" height="4" rx="2" fill="var(--visual-border)"/>
    <rect x="25" y="70" width="55" height="4" rx="2" fill="var(--visual-border)"/>
    {/* Syntax highlighting accents */}
    <rect x="20" y="40" width="10" height="4" rx="2" fill="var(--visual-accent)"/>
    <rect x="20" y="50" width="15" height="4" rx="2" fill="var(--visual-accent)"/>
  </svg>
);

const DashboardVisual = () => (
  <svg
    width="100%"
    height="100"
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="grayscale w-full"
    preserveAspectRatio="xMidYMid meet"
  >
    {/* Dashboard background */}
    <rect x="10" y="15" width="80" height="70" rx="5" fill="var(--visual-bg)" stroke="var(--visual-border)" strokeWidth="2"/>
    {/* Header bar */}
    <rect x="10" y="15" width="80" height="15" rx="5" fill="var(--visual-muted)"/>
    {/* Sidebar */}
    <rect x="10" y="30" width="20" height="55" rx="0" fill="var(--visual-muted)"/>
    {/* Chart area */}
    <rect x="35" y="35" width="50" height="25" rx="2" fill="var(--visual-border)" opacity="0.5"/>
    {/* Chart bars */}
    <rect x="40" y="50" width="5" height="10" rx="1" fill="var(--visual-accent)"/>
    <rect x="50" y="45" width="5" height="15" rx="1" fill="var(--visual-accent)"/>
    <rect x="60" y="48" width="5" height="12" rx="1" fill="var(--visual-accent)"/>
    <rect x="70" y="42" width="5" height="18" rx="1" fill="var(--visual-accent)"/>
    {/* Stats cards */}
    <rect x="35" y="65" width="22" height="15" rx="2" fill="var(--visual-border)" opacity="0.5"/>
    <rect x="63" y="65" width="22" height="15" rx="2" fill="var(--visual-border)" opacity="0.5"/>
    {/* Sidebar items */}
    <rect x="15" y="38" width="10" height="2.5" rx="1" fill="var(--visual-accent)"/>
    <rect x="15" y="45" width="10" height="2.5" rx="1" fill="var(--visual-accent)"/>
    <rect x="15" y="52" width="10" height="2.5" rx="1" fill="var(--visual-accent)"/>
  </svg>
);

// Helper function to render icon based on type
const renderIcon = (option: IconOption, size: "small" | "large" = "small") => {
  const iconSize = size === "large" ? "w-12 h-12" : "w-4 h-4";
  if (option.iconType === "lucide") {
    const iconMap: Record<string, React.ReactNode> = {
      Code: <Code className={`${iconSize} text-primary`} />,
      AppWindow: <AppWindow className={`${iconSize} text-primary`} />,
    };
    return iconMap[option.icon] || null;
  } else if (option.iconType === "phosphor") {
    const iconMap: Record<string, React.ReactNode> = {
      ChatText: <ChatText weight="fill" className={`${iconSize} text-primary`} />,
      EnvelopeSimple: <EnvelopeSimple weight="fill" className={`${iconSize} text-primary`} />,
      Phone: <PhoneIcon weight="fill" className={`${iconSize} text-primary`} />,
      Bell: <Bell weight="fill" className={`${iconSize} text-primary`} />,
    };
    return iconMap[option.icon] || null;
  } else if (option.iconType === "svg" || option.iconType === "img") {
    return <img src={option.icon} alt={option.label} className={iconSize} />;
  } else if (option.iconType === "visual") {
    const visualMap: Record<string, React.ReactNode> = {
      codeSnippet: <CodeSnippetVisual />,
      dashboard: <DashboardVisual />,
    };
    return visualMap[option.icon] || null;
  }
  return null;
};

// Define the onboarding questions and options (4 questions for "start from scratch")
const onboardingSteps = [
  {
    id: 1,
    question: "What's your primary goal with our platform?",
    options: [
      { id: "goal-1", label: "Customer engagement" },
      { id: "goal-2", label: "Marketing campaigns" },
      { id: "goal-3", label: "Support automation" },
      { id: "goal-4", label: "Lead generation" },
      { id: "goal-5", label: "Internal communications" },
      { id: "goal-6", label: "Sales automation" },
      { id: "goal-7", label: "Customer retention" },
      { id: "goal-8", label: "Analytics & reporting" },
      { id: "goal-9", label: "Multi-channel messaging" },
    ],
    multiSelect: true,
  },
  {
    id: 2,
    question: "Which channels do you plan to use?",
    options: [
      { id: "channel-2", label: "WhatsApp", iconType: "svg", icon: "/icons/WhatsApp.svg" },
      { id: "channel-6", label: "Instagram", iconType: "svg", icon: "/icons/Instagram.svg" },
      { id: "channel-5", label: "Messenger", iconType: "img", icon: "/icons/Messenger.png" },
      { id: "channel-1", label: "SMS", iconType: "phosphor", icon: "ChatText" },
      { id: "channel-3", label: "Email", iconType: "phosphor", icon: "EnvelopeSimple" },
      { id: "channel-4", label: "Voice", iconType: "phosphor", icon: "Phone" },
      { id: "channel-7", label: "Push Notifications", iconType: "phosphor", icon: "Bell" },
    ],
    multiSelect: true,
  },
  {
    id: 3,
    question: "What's your company size?",
    options: [
      { id: "team-1", label: "Just me" },
      { id: "team-2", label: "2-5 people" },
      { id: "team-3", label: "6-20 people" },
      { id: "team-4", label: "21-100 people" },
      { id: "team-5", label: "100+ people" },
    ],
    multiSelect: false,
  },
  {
    id: 4,
    question: "How will you use our platform?",
    options: [
      { id: "usage-1", label: "API Integrations (Developers)", iconType: "visual", icon: "codeSnippet" },
      { id: "usage-2", label: "Interfaced Apps (CRM Teams)", iconType: "visual", icon: "dashboard" },
    ],
    multiSelect: true,
    visualOptions: true,
  },
]

// Short wizard steps (only Company size and Persona)
const shortWizardSteps = [
  onboardingSteps[2], // Company size (step 3)
  onboardingSteps[3], // Persona/Usage (step 4)
]

export default function NewUserOnboardingPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<IndustryTemplate | null>(null)
  const [customIndustryName, setCustomIndustryName] = useState("")
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedOptions, setSelectedOptions] = useState<Record<number, string[]>>({})
  const [isCompleted, setIsCompleted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [buildingProgress, setBuildingProgress] = useState(0)
  const wizardCardRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const { user, updateOnboardingStatus, logout } = useAuth()
  const { completeOnboarding: markOnboardingComplete } = useOnboarding()

  // Check if "Other" industry was selected
  const isOtherIndustry = () => {
    return customIndustryName.trim().length > 0 && selectedTemplate === null
  }

  // Get the questions to show based on industry selection
  // If specific industry: show only last 2 questions (company size, usage)
  // If "Other": show all 4 questions (goals, channels, company size, usage)
  const getQuestionsToShow = () => {
    if (isOtherIndustry()) {
      // Show all 4 questions for "Other"
      return onboardingSteps
    } else {
      // Show only last 2 questions for specific industry
      return shortWizardSteps
    }
  }

  // Calculate total steps: 1 (industry) + questions to show
  const questionsToShow = getQuestionsToShow()
  const totalSteps = 1 + questionsToShow.length

  // Map current step to the actual question index
  // Step 0 = industry selection
  // Step 1+ = questions (mapped from questionsToShow array)
  const getCurrentQuestionStep = () => {
    if (currentStep === 0) return null // Industry selection
    // Map to the actual question from questionsToShow
    const questionIndex = currentStep - 1
    return questionsToShow[questionIndex]
  }

  // Redirect if not a new user
  useEffect(() => {
    if (user && user.userType !== "newUser") {
      navigate("/")
    }
  }, [user, navigate])

  const handleTemplateSelect = (template: IndustryTemplate) => {
    setSelectedTemplate(template)
    setCustomIndustryName("")
  }

  const handleCustomIndustry = (industryName: string) => {
    setSelectedTemplate(null)
    setCustomIndustryName(industryName)
  }

  const handleIndustryClear = () => {
    setSelectedTemplate(null)
    setCustomIndustryName("")
  }

  const handleOptionSelect = (optionId: string) => {
    const step = getCurrentQuestionStep()
    if (!step) return // Industry selection handled separately
    
    if (step.multiSelect) {
      // For multi-select, toggle the option
      setSelectedOptions(prev => {
        const currentSelections = prev[step.id] || []
        const isSelected = currentSelections.includes(optionId)
        
        if (isSelected) {
          return {
            ...prev,
            [step.id]: currentSelections.filter(id => id !== optionId)
          }
        } else {
          return {
            ...prev,
            [step.id]: [...currentSelections, optionId]
          }
        }
      })
    } else {
      // For single select, replace the selection
      setSelectedOptions(prev => ({
        ...prev,
        [step.id]: [optionId]
      }))
    }
  }

  const isOptionSelected = (optionId: string) => {
    if (currentStep === 0) return false // Industry selection handled separately
    const step = getCurrentQuestionStep()
    if (!step) return false
    const selections = selectedOptions[step.id] || []
    return selections.includes(optionId)
  }

  // Check if an option matches the selected industry template
  const isOptionCommonForIndustry = (optionId: string) => {
    if (!selectedTemplate) return false
    const step = getCurrentQuestionStep()
    if (!step) return false
    
    // Check based on step type
    if (step.id === 1) {
      // Goals question
      return selectedTemplate.goals.includes(optionId)
    } else if (step.id === 2) {
      // Channels question
      return selectedTemplate.channels.includes(optionId)
    }
    // Step 3 (team size) and Step 4 (usage) don't show badges
    return false
  }

  // Get the industry name for the badge
  const getIndustryName = () => {
    if (selectedTemplate) {
      return selectedTemplate.name
    }
    if (customIndustryName.trim().length > 0) {
      return customIndustryName
    }
    return null
  }

  const canProceed = () => {
    // For industry selection (step 0), require either a template or custom industry name
    if (currentStep === 0) {
      return selectedTemplate !== null || customIndustryName.trim().length > 0
    }
    // For other steps, require selection
    const step = getCurrentQuestionStep()
    if (!step) return false
    const selections = selectedOptions[step.id] || []
    return selections.length > 0
  }

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      handleCompleteOnboarding()
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleCompleteOnboarding = async () => {
    setIsCompleted(true)
    setIsLoading(true)

    // Prepare onboarding data to save
    // Map selected options based on question IDs
    // Question IDs: 1=goals, 2=channels, 3=teamSize, 4=usage
    const onboardingDataToSave = {
      industry: selectedTemplate?.industry || (customIndustryName ? "custom" : "none"),
      customIndustryName: customIndustryName || undefined,
      channels: selectedOptions[2] || [],
      goals: selectedOptions[1] || [],
      teamSize: selectedOptions[3]?.[0] || "",
      usage: selectedOptions[4] || []
    }

    // Simulate building the dashboard
    const interval = setInterval(() => {
      setBuildingProgress(prev => {
        const newProgress = prev + 5
        if (newProgress >= 100) {
          clearInterval(interval)
          setTimeout(async () => {
            try {
              // Check if user has ID before proceeding
              if (!user?.id) {
                // Clear auth state and redirect to login
                toast.error("Session expired", {
                  description: "Please log in again to continue.",
                })
                setTimeout(() => {
                  logout()
                }, 2000)
                setIsLoading(false)
                return
              }
              
              // Update onboarding status in database and context
              // markOnboardingComplete updates the database and onboarding context
              await markOnboardingComplete(onboardingDataToSave)
              
              // Update auth context state (skip database update since it's already done)
              await updateOnboardingStatus(true, true)
              
              // Small delay to ensure state updates propagate
              await new Promise(resolve => setTimeout(resolve, 100))
              
              setIsLoading(false)
              // Redirect after completion - all users go to guide page
              navigate("/getting-started")
            } catch (error: any) {
              console.error("Error completing onboarding:", error)
              const errorMessage = error?.message || "An unknown error occurred"
              console.error("Full error details:", error)
              
              // If error is about missing user ID, redirect to login
              if (errorMessage.includes("User ID not available") || errorMessage.includes("log in again")) {
                toast.error("Session expired", {
                  description: "Please log in again to continue.",
                })
                setTimeout(() => {
                  logout()
                }, 2000)
              } else {
                toast.error("Failed to save preferences", {
                  description: errorMessage || "Please try again.",
                })
              }
              setIsLoading(false)
            }
          }, 1000)
          return 100
        }
        return newProgress
      })
    }, 150)

    // Show toast
    toast.success("Preferences saved!", {
      description: "We're customizing your dashboard based on your preferences.",
      duration: 4000,
    })
  }

  // Animation variants for the steps
  const stepVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 }
  }

  // Building animation phrases
  const buildingPhrases = [
    "Analyzing your preferences...",
    "Customizing your dashboard...",
    "Setting up your channels...",
    "Preparing your templates...",
    "Finalizing your experience..."
  ]

  const currentBuildingPhrase = () => {
    const index = Math.min(
      Math.floor(buildingProgress / 20),
      buildingPhrases.length - 1
    )
    return buildingPhrases[index]
  }

  // Show wizard with industry selection as first step
  return (
    <div className="relative min-h-screen bg-layout">
      {/* Theme Switcher - Top Right Corner */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
        <ThemeSwitcher />
      </div>
      
      <div className="min-h-screen flex flex-col items-center justify-start p-4 pt-16">
        {/* Wizard Card */}
        <Card ref={wizardCardRef} className="w-full max-w-xl bg-card rounded-lg overflow-hidden p-4">
          {!isCompleted ? (
            <motion.div
              initial="initial"
              animate="animate"
              exit="exit"
              variants={pageVariants}
              transition={smoothTransition}
              className="space-y-4"
            >
              {/* Progress indicator - Only show after industry selection (step 0) */}
              {currentStep > 0 && (
                <div className="flex items-center justify-between mb-2">
                  <div className="flex-1 flex space-x-1">
                    {Array.from({ length: questionsToShow.length }).map((_, index) => {
                      // Map question index to current step (currentStep - 1 because step 0 is industry)
                      const questionIndex = index
                      const currentQuestionIndex = currentStep - 1
                      return (
                        <div
                          key={index}
                          className={`h-1 flex-1 rounded-full ${
                            questionIndex <= currentQuestionIndex
                              ? "bg-primary"
                              : "bg-muted"
                          }`}
                        />
                      )
                    })}
                  </div>
                  <span className="ml-2 text-xs text-muted-foreground">
                    {currentStep}/{questionsToShow.length}
                  </span>
                </div>
              )}

              {/* Industry Selection Step (Step 0) */}
              {currentStep === 0 ? (
                <motion.div
                  key="industry-step"
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={stepVariants}
                  transition={{ duration: 0.3 }}
                >
                  <h3 className="text-md font-semibold mb-1">
                    What industry are you in?
                  </h3>
                  <p className="text-xs text-muted-foreground mb-3">
                    Please select an industry or enter a custom industry name
                  </p>
                  
                  <div className="mb-8 mt-4">
                    <OnboardingTemplateSelection
                      onTemplateSelect={handleTemplateSelect}
                      onStartFromScratch={() => {}} // Not used in inline mode
                      onCustomIndustry={handleCustomIndustry}
                      inlineMode={true}
                      selectedTemplate={selectedTemplate}
                      customIndustryName={customIndustryName}
                      onClear={handleIndustryClear}
                      wizardCardRef={wizardCardRef}
                    />
                  </div>
                </motion.div>
              ) : (
                /* Regular Questions */
                <>
                  {/* Question */}
                  {(() => {
                    const currentQuestion = getCurrentQuestionStep()
                    if (!currentQuestion) return null
                    
                    return (
                      <motion.div
                        key={`step-${currentStep}`}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        variants={stepVariants}
                        transition={{ duration: 0.3 }}
                      >
                        <h3 className="text-md font-semibold mb-1">
                          {currentQuestion.question}
                        </h3>
                        
                        {currentQuestion.multiSelect ? (
                          <p className="text-xs text-muted-foreground mb-3">
                            You can select multiple options
                          </p>
                        ) : (
                          <p className="text-xs text-muted-foreground mb-3">
                            Please select one option
                          </p>
                        )}

                        {/* Options */}
                        {currentQuestion.visualOptions ? (
                          // Visual options for usage question - with grayscale visuals above labels
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {currentQuestion.options.map(option => {
                          const isSelected = isOptionSelected(option.id);
                          const hasIconData = hasIcon(option);
                          return (
                            <div
                              key={option.id}
                              onClick={() => handleOptionSelect(option.id)}
                              className={`relative flex flex-col rounded-lg border cursor-pointer transition-colors ${
                                isSelected
                                  ? "border-primary hover:bg-accent"
                                  : "border-border hover:bg-accent"
                              }`}
                            >
                              {/* Visual/Icon above - full width */}
                              {hasIconData && (
                                <div className="w-full flex items-center justify-center rounded-t-lg overflow-hidden">
                                  {renderIcon(option, "large")}
                                </div>
                              )}
                              {/* Checkbox and Label */}
                              <div className="flex flex-col items-center space-y-2 w-full p-4">
                                <div className="flex items-center space-x-2 w-full justify-center">
                                  <Checkbox 
                                    checked={isSelected}
                                    className="pointer-events-none"
                                  />
                                  <Label className="text-sm font-normal cursor-pointer text-center">
                                    {option.label}
                                  </Label>
                                </div>
                                {isOptionCommonForIndustry(option.id) && getIndustryName() && (
                                  <Badge variant="secondary" className="text-xs">
                                    Matches {getIndustryName()}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          );
                        })}
                          </div>
                        ) : (
                          // Standard options for other questions
                          <div className="mt-8">
                            {currentQuestion.options.map(option => {
                          const isSelected = isOptionSelected(option.id);
                          return (
                          <div
                            key={option.id}
                            onClick={() => handleOptionSelect(option.id)}
                            className={`group flex items-center gap-2.5 cursor-pointer rounded-md p-2 -mx-2 transition-colors hover:bg-accent`}
                          >
                              {currentQuestion.multiSelect ? (
                                <Checkbox 
                                  checked={isOptionSelected(option.id)}
                                  className="pointer-events-none"
                                />
                              ) : (
                              <div 
                                className={`h-4 w-4 rounded-full border-1 shrink-0 flex items-center justify-center ${
                                  isOptionSelected(option.id) 
                                    ? "border-primary bg-primary" 
                                    : "border-muted-foreground/50"
                                }`}
                              >
                                {isOptionSelected(option.id) && (
                                  <div className="h-2 w-2 rounded-full bg-primary-foreground"></div>
                                )}
                              </div>
                            )}
                            {hasIcon(option) && (
                              <div className="flex-shrink-0">
                                {renderIcon(option)}
                              </div>
                            )}
                            <Label className="text-sm font-normal cursor-pointer flex-1">
                              {option.label}
                            </Label>
                            {isOptionCommonForIndustry(option.id) && getIndustryName() && (
                              <Badge variant="secondary" className="text-xs shrink-0">
                                Matches {getIndustryName()}
                              </Badge>
                            )}
                          </div>
                          );
                            })}
                          </div>
                        )}
                      </motion.div>
                    )
                  })()}
                </>
              )}

              {/* Navigation buttons */}
              <div className={`flex ${currentStep >= 1 ? 'justify-between' : 'justify-end'} pt-1`}>
                {currentStep >= 1 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBack}
                  >
                    Back
                  </Button>
                )}
                <Button
                  size="sm"
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="flex items-center"
                >
                  {currentStep === totalSteps - 1 ? (
                    <>
                      Get Started
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </>
                  ) : (
                    <>
                      Next
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-4 text-center space-y-3"
            >
              <h2 className="text-lg font-semibold">Building Your Experience</h2>
              <p className="text-muted-foreground text-sm">{currentBuildingPhrase()}</p>

              {/* Progress bar */}
              <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary"
                  initial={{ width: "0%" }}
                  animate={{ width: `${buildingProgress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                Please wait while we set up your personalized dashboard...
              </p>
            </motion.div>
          )}
      </Card>
      </div>
    </div>
  )
}