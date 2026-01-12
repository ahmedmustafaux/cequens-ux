import * as React from "react"
import { useState, useEffect } from "react"
import { useNavigate, Link, useLocation } from "react-router-dom"
import { Eye, EyeOff, Mail, Lock, ArrowLeft, Shield, MessageSquare, Phone, Smartphone, AlertTriangle } from "lucide-react"
import { Item, ItemMedia, ItemContent, ItemTitle, ItemDescription } from "@/components/ui/item"
import { Button } from "@/components/ui/button"
import { 
  Field, 
  FieldLabel, 
  FieldContent, 
  FieldDescription, 
  FieldError 
} from "@/components/ui/field"
import { 
  InputGroup, 
  InputGroupInput, 
  InputGroupAddon 
} from "@/components/ui/input-group"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { useAuth } from "@/hooks/use-auth"
import { validateLoginForm, validateEmail, isFormValid, type FieldValidation } from "@/lib/validation"
import { ErrorMessage } from "@/components/ui/error-message"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { motion } from "framer-motion"
import { smoothTransition } from "@/lib/transitions"
import { getLogoAltText, getAccountText } from "@/lib/config"

// Helper function to mask email addresses
const maskEmail = (email: string) => {
  const [username, domain] = email.split('@')
  const maskedUsername = username.substring(0, 2) + '**' + (username.length > 4 ? username.substring(username.length - 2) : '')
  return `${maskedUsername}@${domain}`
}

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [otp, setOtp] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState<'credentials' | 'otp'>('credentials')
  const [errors, setErrors] = useState<FieldValidation>({})
  const [touched, setTouched] = useState<{[key: string]: boolean}>({})
  const [resendCountdown, setResendCountdown] = useState(0)
  const [isResending, setIsResending] = useState(false)
  const [showVerificationMethods, setShowVerificationMethods] = useState(false)
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null)
  const [verificationContact, setVerificationContact] = useState<string>("+20 010 **33")
  const [generalError, setGeneralError] = useState<string>("")
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  
  // Get the intended redirect path
  const from = location.state?.from?.pathname || "/"
  
  // Check if user came from email verification
  const emailVerified = location.state?.emailVerified || false
  const verifiedUserData = location.state?.userData
  
  // If user came from email verification, pre-fill the email
  useEffect(() => {
    if (emailVerified && verifiedUserData?.email) {
      setEmail(verifiedUserData.email)
      toast.info("Email verified", {
        description: "Your email has been verified. Please sign in to continue.",
        duration: 4000,
      })
    }
  }, [emailVerified, verifiedUserData])

  // Countdown effect for resend code
  useEffect(() => {
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

  const handleEmailChange = (value: string) => {
    setEmail(value)
    setTouched(prev => ({ ...prev, email: true }))
    
    // Clear errors when user starts typing
    if (errors.email) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors.email
        return newErrors
      })
    }
    if (generalError) {
      setGeneralError("")
    }
  }

  const handlePasswordChange = (value: string) => {
    setPassword(value)
    setTouched(prev => ({ ...prev, password: true }))
    
    // Clear errors when user starts typing
    if (errors.password) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors.password
        return newErrors
      })
    }
    if (generalError) {
      setGeneralError("")
    }
  }

  const handleOtpChange = (value: string) => {
    setOtp(value)
    setTouched(prev => ({ ...prev, otp: true }))
    
    // Clear error when user starts typing
    if (errors.otp) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors.otp
        return newErrors
      })
    }

    // Auto-submit when OTP is complete
    if (value.length === 6) {
      setTimeout(() => {
        const form = document.querySelector('form')
        if (form) {
          form.requestSubmit()
        }
      }, 100)
    }
  }

  const validateField = (field: string, value: string) => {
    let validation: any = { isValid: true }
    
    switch (field) {
      case 'email':
        validation = validateEmail(value)
        break
      case 'password':
        if (!value) {
          validation = { isValid: false, message: "Password is required" }
        }
        break
      case 'otp':
        if (value.length === 6 && value !== "000000") { // Only show error for wrong OTP
          validation = { isValid: false, message: "Invalid OTP code" }
        }
        break
    }
    
    if (!validation.isValid) {
      setErrors(prev => ({ ...prev, [field]: validation }))
    } else {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }))
    let value = ''
    switch (field) {
      case 'email':
        value = email
        break
      case 'password':
        value = password
        break
      case 'otp':
        value = otp
        break
    }
    validateField(field, value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    if (currentStep === 'credentials') {
      // Mark all fields as touched
      setTouched({ email: true, password: true })

      // Validate form
      const formErrors = validateLoginForm(email, password)
      setErrors(formErrors)

      if (!isFormValid(formErrors)) {
        setIsLoading(false)
        return
      }

      // Authenticate user against database
      try {
        const { authenticateUser } = await import('@/lib/supabase/users')
        const dbUser = await authenticateUser(email, password)
        
        if (dbUser) {
          // User authenticated successfully
          const userName = dbUser.first_name && dbUser.last_name 
            ? `${dbUser.first_name} ${dbUser.last_name}` 
            : undefined
          
          // Determine user type based on onboarding status
          // New users (haven't completed onboarding) are "newUser", others are "existingUser"
          const userType = dbUser.onboarding_completed ? "existingUser" : "newUser"
          
          // Use auth context to login with user ID and onboarding status
          login(email, userName, userType as any, from, dbUser.id, dbUser.onboarding_completed)
          
          // Show success message
          toast.success("Welcome back! 👋", {
            description: "You've successfully signed in. Redirecting...",
            duration: 3000,
          })
          
          setIsLoading(false)
          return
        }
      } catch (error) {
        console.error("Error authenticating user:", error)
        // Show general error instead of individual field errors
        setGeneralError("Invalid email or password")
        setErrors({})
        setIsLoading(false)
        return
      }

      // If we get here, authentication failed
      setGeneralError("Invalid email or password")
      setErrors({})
      setIsLoading(false)
    } else if (currentStep === 'otp') {
      // Mark OTP field as touched
      setTouched({ otp: true })

      if (otp.length !== 6) {
        setIsLoading(false)
        return
      }

      // OTP verification should be handled through Supabase/auth service
      // For now, show error - OTP flow needs to be implemented with backend
      setErrors({
        otp: { isValid: false, message: "OTP verification is not yet implemented. Please use email/password login." }
      })
      toast.error("OTP verification unavailable", {
        description: "Please use email and password to sign in.",
        duration: 3000,
      })
    }

    setIsLoading(false)
  }

  const goBackToCredentials = () => {
    setCurrentStep('credentials')
    setOtp("")
    setErrors({})
    setTouched({})
  }

  const handleResendCode = () => {
    if (resendCountdown > 0 || isResending) return
    setShowVerificationMethods(true)
  }

  const handleSendVerification = async (method: string) => {
    setIsResending(true)
    setSelectedMethod(method)
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Start countdown
      setResendCountdown(30)
      
      // Update verification contact based on method
      switch (method) {
        case 'email':
          setVerificationContact(email ? maskEmail(email) : "your email")
          break
        case 'sms':
        case 'whatsapp':
          setVerificationContact("+20 010 **33")
          break
        case 'call':
          setVerificationContact("+20 010 **33")
          break
      }
      
      // Close popup
      setShowVerificationMethods(false)
      setSelectedMethod(null)
      
      const methodNames = {
        email: "email",
        sms: "SMS",
        whatsapp: "WhatsApp",
        call: "phone call"
      }
      
      toast.success("Code sent! 📱", {
        description: `A new verification code has been sent via ${methodNames[method as keyof typeof methodNames]}.`,
        duration: 3000,
      })
    } catch (error) {
      toast.error("Failed to send code", {
        description: "Please try again later or contact support if the issue persists.",
        duration: 4000,
      })
    } finally {
      setIsResending(false)
    }
  }

  const closeVerificationMethods = () => {
    setShowVerificationMethods(false)
    setSelectedMethod(null)
  }

  return (
    <>
      <div className="bg-card rounded-2xl shadow-none overflow-hidden w-full max-w-lg mx-auto h-full max-h-[calc(100vh-2rem)] border border-border">
        <div className="h-full">
            {/* Form Panel */}
            <motion.div 
              className="bg-card flex items-center justify-center p-6 h-full"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={smoothTransition}
            >
              <div className="w-full max-w-md">
            {/* Logo/Brand */}
            <div className="text-left mb-6 sm:mb-8">
              <div className="h-4 w-auto mb-3 sm:mb-4 py-6">
                <img
                  src="/Logo.svg"
                  alt={getLogoAltText()}
                  className="w-25 h-auto"
                />
              </div>
              {currentStep === 'credentials' && (
                <>
                  <h1 className="text-xl font-semibold tracking-tight text-foreground mb-1">Welcome back</h1>
                  <p className="text-sm text-muted-foreground">Sign in to your {getAccountText()}</p>
                </>
              )}
            </div>


            {/* Login Form */}
            <form onSubmit={handleSubmit} className="grid gap-3 sm:gap-4">
              {currentStep === 'credentials' ? (
                <>
                  {/* General Error Alert */}
                  {generalError && (
                    <Alert variant="destructive" className="bg-destructive/10 border-border-destructive text-destructive">
                      <AlertTriangle className="h-4 w-4 text-destructive" />
                      <AlertDescription className="text-destructive">
                        {generalError}
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {/* Social Login Options */}
                  <div className="grid grid-cols-2 gap-3 mb-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="flex items-center justify-center gap-2"
                      onClick={() => {
                        toast.info("Google login", {
                          description: "Google authentication would be initiated here.",
                          duration: 3000,
                        })
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                      <span>Sign in with Google</span>
                    </Button>
                    
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="flex items-center justify-center gap-2"
                      onClick={() => {
                        toast.info("Microsoft login", {
                          description: "Microsoft authentication would be initiated here.",
                          duration: 3000,
                        })
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 23 23" className="h-5 w-5">
                        <path fill="#f25022" d="M1 1h10v10H1z"/>
                        <path fill="#00a4ef" d="M1 12h10v10H1z"/>
                        <path fill="#7fba00" d="M12 1h10v10H12z"/>
                        <path fill="#ffb900" d="M12 12h10v10H12z"/>
                      </svg>
                      <span>Sign in with Microsoft</span>
                    </Button>
                  </div>
                  
                  <div className="relative my-2">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-border"></span>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">Or with email</span>
                    </div>
                  </div>
                  
                  <Field>
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <FieldContent>
                      <InputGroup>
                        <InputGroupAddon>
                          <Mail className="h-4 w-4" />
                        </InputGroupAddon>
                        <InputGroupInput
                          id="email"
                          type="email"
                          placeholder="Enter your email"
                          value={email}
                          onChange={(e) => handleEmailChange(e.target.value)}
                          onBlur={() => handleBlur("email")}
                          autoComplete="email"
                          autoCorrect="off"
                          autoCapitalize="off"
                          spellCheck="false"
                          required
                        />
                      </InputGroup>
                      {touched.email && errors.email && <FieldError>{errors.email.message}</FieldError>}
                    </FieldContent>
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                    <FieldContent>
                      <InputGroup>
                        <InputGroupAddon>
                          <Lock className="h-4 w-4" />
                        </InputGroupAddon>
                        <InputGroupInput
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          value={password}
                          onChange={(e) => handlePasswordChange(e.target.value)}
                          onBlur={() => handleBlur("password")}
                          autoComplete="new-password"
                          autoCorrect="off"
                          autoCapitalize="off"
                          spellCheck="false"
                          required
                        />
                        <InputGroupAddon align="inline-end">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => setShowPassword(!showPassword)}
                            className="h-auto w-auto p-1 hover:text-muted-foreground"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </InputGroupAddon>
                      </InputGroup>
                      {touched.password && errors.password && <FieldError>{errors.password.message}</FieldError>}
                    </FieldContent>
                  </Field>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="remember"
                        className="h-4 w-4"
                      />
                      <Label htmlFor="remember" className="text-sm text-muted-foreground">
                        Remember me
                      </Label>
                    </div>
                    <Link
                      to="#"
                      className="text-sm font-medium text-foreground hover:text-foreground/80"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                        <span>Verifying...</span>
                      </div>
                    ) : (
                      "Continue"
                    )}
                  </Button>
                </>
              ) : (
                <>
                  {/* Back button */}
                  <div className="flex items-center mb-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={goBackToCredentials}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to login
                    </Button>
                  </div>

                  {/* OTP Section */}
                  <Item className="mb-6">
                    <ItemMedia variant="icon">
                      <Shield className="h-6 w-6" />
                    </ItemMedia>
                    <ItemContent>
                      <ItemTitle>Verify your identity</ItemTitle>
                      <ItemDescription>
                        We've sent a 6-digit code to {verificationContact}
                      </ItemDescription>
                    </ItemContent>
                  </Item>

                  <div className="grid gap-4">
                    <Field>
                      <FieldLabel htmlFor="otp" className="text-sm font-medium">Verification Code</FieldLabel>
                      <FieldContent>
                        <InputOTP
                          maxLength={6}
                          value={otp}
                          onChange={handleOtpChange}
                        >
                          <InputOTPGroup>
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                          </InputOTPGroup>
                          <InputOTPSeparator />
                          <InputOTPGroup>
                            <InputOTPSlot index={3} />
                            <InputOTPSlot index={4} />
                            <InputOTPSlot index={5} />
                          </InputOTPGroup>
                        </InputOTP>
                        {touched.otp && errors.otp && <FieldError>{errors.otp.message}</FieldError>}
                      </FieldContent>
                    </Field>
                    <div className="text-left">
                      <p className="text-sm text-muted-foreground">
                        Didn't receive the code?{" "}
                        <Button
                          type="button"
                          variant="link"
                          onClick={handleResendCode}
                          disabled={resendCountdown > 0 || isResending}
                          className={`font-medium transition-colors ${
                            resendCountdown > 0 || isResending
                              ? 'text-muted-foreground'
                              : 'text-foreground hover:text-foreground/80'
                          }`}
                        >
                          {isResending ? (
                            'Sending...'
                          ) : resendCountdown > 0 ? (
                            `Resend code (${resendCountdown}s)`
                          ) : (
                            'Resend code'
                          )}
                        </Button>
                      </p>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading || otp.length !== 6}
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                        <span>Verifying...</span>
                      </div>
                    ) : (
                      "Verify & Sign In"
                    )}
                  </Button>
                </>
              )}

              {currentStep === 'credentials' && (
                <div className="text-center m-2 mb-4">
                  <p className="text-sm text-muted-foreground">
                    Don't have an account?{" "}
                    <Link
                      to="/signup"
                      className="font-medium text-foreground hover:text-foreground/80"
                    >
                      Sign up
                    </Link>
                  </p>
                </div>
              )}
            </form>

              </div>
            </motion.div>
        </div>
      </div>

      {/* Verification Methods Dialog */}
      <Dialog open={showVerificationMethods} onOpenChange={setShowVerificationMethods}>
        <DialogContent className="sm:max-w-sm p-4">
          <DialogHeader className="pb-3">
            <DialogTitle className="text-base">Choose verification method</DialogTitle>
            <DialogDescription className="text-xs">
              How would you like to receive your verification code?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            {/* Email */}
            <Button
              onClick={() => handleSendVerification('email')}
              disabled={isResending}
              variant="outline"
              className="w-full flex items-center p-3 border border-border rounded-lg hover:border-border-accent hover:bg-accent transition-all disabled:opacity-50 h-auto justify-start"
            >
              <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center mr-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-left">
                <div className="font-medium text-sm text-foreground">Email</div>
                <div className="text-xs text-muted-foreground">{email ? maskEmail(email) : "your email"}</div>
              </div>
            </Button>

            {/* SMS */}
            <Button
              onClick={() => handleSendVerification('sms')}
              disabled={isResending}
              variant="outline"
              className="w-full flex items-center p-3 border border-border rounded-lg hover:border-border-accent hover:bg-accent transition-all disabled:opacity-50 h-auto justify-start"
            >
              <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center mr-3">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-left">
                <div className="font-medium text-sm text-foreground">SMS</div>
                <div className="text-xs text-muted-foreground">+20 010 **33</div>
              </div>
            </Button>

            {/* WhatsApp */}
            <Button
              onClick={() => handleSendVerification('whatsapp')}
              disabled={isResending}
              variant="outline"
              className="w-full flex items-center p-3 border border-border rounded-lg hover:border-border-accent hover:bg-accent transition-all disabled:opacity-50 h-auto justify-start"
            >
              <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center mr-3">
                <Smartphone className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-left">
                <div className="font-medium text-sm text-foreground">WhatsApp</div>
                <div className="text-xs text-muted-foreground">+20 010 **33</div>
              </div>
            </Button>

            {/* Phone Call */}
            <Button
              onClick={() => handleSendVerification('call')}
              disabled={isResending}
              variant="outline"
              className="w-full flex items-center p-3 border border-border rounded-lg hover:border-border-accent hover:bg-accent transition-all disabled:opacity-50 h-auto justify-start"
            >
              <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center mr-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-left">
                <div className="font-medium text-sm text-foreground">Phone Call</div>
                <div className="text-xs text-muted-foreground">+20 010 **33</div>
              </div>
            </Button>
          </div>

          {isResending && (
            <div className="mt-3 flex items-center justify-center text-xs text-muted-foreground">
              <div className="h-3 w-3 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent mr-2" />
              Sending verification code...
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
