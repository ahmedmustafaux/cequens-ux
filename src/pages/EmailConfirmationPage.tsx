import * as React from "react"
import { useState, useEffect } from "react"
import { useNavigate, Link, useLocation } from "react-router-dom"
import { Mail, AlertCircle, CheckCircle2, Info } from "lucide-react"
import { Item, ItemMedia, ItemContent, ItemTitle, ItemDescription } from "@/components/ui/item"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useAuth } from "@/hooks/use-auth"
import { motion } from "framer-motion"
import { getLogoAltText, getWelcomeMessage, getAppName } from "@/lib/config"
import { smoothTransition, pageVariants } from "@/lib/transitions"

export default function EmailConfirmationPage() {
  enum ConfirmationStep {
    WAITING,
    LOADING,
    SUCCESS
  }

  const [currentStep, setCurrentStep] = useState<ConfirmationStep>(ConfirmationStep.WAITING)
  const [isLoading, setIsLoading] = useState(false)
  const [resendCountdown, setResendCountdown] = useState(0)
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  
  // Get user data from location state
  const userData = location.state?.userData || {
    email: "user@example.com",
    firstName: "User",
    lastName: "Name",
    password: ""
  }
  
  // Get the intended redirect path
  const from = location.state?.from?.pathname || "/"
  
  // Generate a confirmation token for simulation
  const confirmationToken = React.useMemo(() => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }, [])

  // Countdown effect for resend code
  React.useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    
    if (resendCountdown > 0) {
      interval = setInterval(() => {
        setResendCountdown((prev) => {
          if (prev <= 1) {
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [resendCountdown])

  const handleConfirmation = async () => {
    setIsLoading(true)
    
    // Switch to loading state first
    setCurrentStep(ConfirmationStep.LOADING)
    
    try {
      // Create user account in database
      const { createUser } = await import('@/lib/supabase/users')
      
      const newUser = await createUser({
        email: userData.email,
        password_hash: userData.password, // This will be hashed inside createUser
        first_name: userData.firstName,
        last_name: userData.lastName,
        company_name: userData.companyName,
      })
      
      // Switch to success state
      setCurrentStep(ConfirmationStep.SUCCESS)
      
      toast.success("Email verified successfully!", {
        description: "Your account has been created. You will now be redirected to sign in.",
        duration: 4000,
      })
      
      // Small delay before redirect
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Redirect to signin page after email verification
      navigate("/login", { 
        state: { 
          emailVerified: true,
          userData: {
            email: userData.email,
            firstName: userData.firstName,
            lastName: userData.lastName
          }
        } 
      })
    } catch (error: any) {
      console.error("Error creating user:", error)
      setCurrentStep(ConfirmationStep.WAITING)
      toast.error("Account creation failed", {
        description: error.message || "An error occurred. Please try again.",
        duration: 5000,
      })
    }
    
    setIsLoading(false)
  }
  
  const resendConfirmationEmail = async () => {
    setIsLoading(true)
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Reset countdown
    setResendCountdown(30)
    
    // Show confirmation email sent toast
    toast.info("Confirmation email resent", {
      description: `We've sent another confirmation link to ${userData.email}. Please check your inbox.`,
      duration: 10000,
    })
    
    setIsLoading(false)
  }

  return (
    <>
      <div className="bg-card rounded-2xl shadow-lg overflow-hidden w-full max-w-lg mx-auto border border-border">
        <div className="w-full p-6">
          {/* Logo/Brand */}
          <div className="text-left mb-6 sm:mb-8">
            <div className="h-4 w-auto mb-3 sm:mb-4 py-4">
              <img
                src="/Logo.svg"
                alt={getLogoAltText()}
                className="w-25 h-auto"
              />
            </div>
          </div>

          {currentStep === ConfirmationStep.LOADING ? (
            <motion.div
              initial="initial"
              animate="animate"
              exit="exit"
              variants={pageVariants}
              transition={smoothTransition}
              className="w-full flex flex-col items-center justify-center py-12"
            >
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-border border-t-primary mb-4"></div>
              <p className="text-sm text-muted-foreground">Verifying your email...</p>
            </motion.div>
          ) : currentStep === ConfirmationStep.WAITING ? (
            <motion.div
              initial="initial"
              animate="animate"
              exit="exit"
              variants={pageVariants}
              transition={smoothTransition}
              className="w-full"
            >
              <Item className="mb-6">
                <ItemMedia variant="icon">
                  <Mail className="h-6 w-6" />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>Check your email</ItemTitle>
                  <ItemDescription>
                    We've sent a confirmation link to <span className="font-medium">{userData.email}</span>
                  </ItemDescription>
                </ItemContent>
              </Item>

              <div className="grid gap-4">
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => window.open('https://mail.google.com', '_blank')}
                    className="flex-1"
                  >
                    <img src="/icons/Gmail.svg" alt="Gmail" className="h-4 w-4" />
                    Open your Gmail
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => window.open('https://outlook.live.com', '_blank')}
                    className="flex-1"
                  >
                    <img src="/icons/Outlook.svg" alt="Outlook" className="h-4 w-4" />
                    Open your Outlook
                  </Button>
                </div>
                <div className="text-left">
                  <p className="text-sm text-muted-foreground">
                    Didn't receive an email?{" "}
                    <Button
                      type="button"
                      variant="link"
                      onClick={resendConfirmationEmail}
                      disabled={resendCountdown > 0 || isLoading}
                      className={`font-medium transition-colors ${
                        resendCountdown > 0 || isLoading
                          ? 'text-muted-foreground'
                          : 'text-foreground hover:text-foreground/80'
                      }`}
                    >
                      {isLoading ? (
                        'Sending...'
                      ) : resendCountdown > 0 ? (
                        `Resend email (${resendCountdown}s)`
                      ) : (
                        'Resend email'
                      )}
                    </Button>
                  </p>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial="initial"
              animate="animate"
              exit="exit"
              variants={pageVariants}
              transition={smoothTransition}
              className="w-full grid gap-4 text-center"
            >
              <div className="mx-auto">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-50 text-green-500 mb-4">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h2 className="text-xl font-semibold mb-1">Email verified!</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Your email has been successfully verified. Redirecting to signin page...
                </p>
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-blue-500"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 2, ease: "easeInOut" }}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
      
      {/* Demo button outside the white container - only shown in waiting state */}
      {currentStep === ConfirmationStep.WAITING && (
        <div className="mt-4 space-y-4 w-full max-w-lg mx-auto">
          <div className="text-center">
            <Button
              type="button"
              variant="link"
              onClick={handleConfirmation}
              disabled={isLoading}
              className="text-gray-300 cursor-auto"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
                  <span>Verifying...</span>
                </div>
              ) : (
                "Demo: Simulate Email Confirmation"
              )}
            </Button>
          </div>
        </div>
      )}
    </>
  )
}