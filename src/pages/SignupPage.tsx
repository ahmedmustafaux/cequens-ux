import * as React from "react"
import { useState, useRef, useEffect } from "react"
import { useNavigate, Link, useLocation } from "react-router-dom"
import { Eye, EyeOff, Mail, Lock, User, Building, CheckCircle2, AlertCircle, ArrowRight, Shield, ChevronLeft, ChevronRight } from "lucide-react"
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
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { useAuth } from "@/hooks/use-auth"
import { validateSignupForm, validateEmail, validateName, validatePassword, validateConfirmPassword, validateTermsAgreement, isFormValid, type FieldValidation } from "@/lib/validation"
import { ErrorMessage } from "@/components/ui/error-message"
import { PasswordStrength } from "@/components/ui/password-strength"
import { motion, AnimatePresence } from "framer-motion"
import { getLogoAltText, getWelcomeMessage, getJoinMessage, getAppName } from "@/lib/config"
import { smoothTransition, fadeVariants, pageVariants, directionalTabVariants } from "@/lib/transitions"

// No StoryIndicator component needed anymore

export default function SignupPage() {
  // Signup step
  enum SignupStep {
    FORM
  }

  const [currentStep, setCurrentStep] = useState<SignupStep>(SignupStep.FORM)
  
  // Story step for the right panel
  const [activeStoryStep, setActiveStoryStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [autoplayFinished, setAutoplayFinished] = useState(false);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const storySteps = [
    {
      image: "/visual/Image1.png",
      title: "a place for everything",
      description: "Communication, Marketing, Supporting and security in one dashboard."
    },
    {
      image: "/visual/Image2.png",
      title: "Seamless Integration",
      description: "Connect with all your favorite platforms and services in one place."
    },
    {
      image: "/visual/Image3.png",
      title: "Powerful Analytics",
      description: "Get insights and make data-driven decisions with comprehensive reports."
    }
  ];
  
  // Auto-rotate story steps with 5-second intervals, stopping after the 3rd step
  useEffect(() => {
    if (autoplayFinished) return; // Don't set up interval if autoplay is finished
    
    const interval = setInterval(() => {
      setActiveStoryStep((prev) => {
        // Mark current step as completed
        setCompletedSteps(completed => {
          // Only add to completed if not already there
          if (!completed.includes(prev)) {
            return [...completed, prev];
          }
          return completed;
        });
        
        const nextStep = prev + 1;
        
        // If we've reached the end, stop autoplay
        if (nextStep >= storySteps.length) {
          setAutoplayFinished(true);
          clearInterval(interval);
          return prev; // Stay on the last step
        }
        
        // Set direction to forward for auto-rotation
        setDirection('forward');
        
        // Reset the progress key for the next step to ensure animation starts from 0
        setProgressKeys(keys => ({
          ...keys,
          [nextStep]: (keys[nextStep] || 0) + 1
        }));
        
        return nextStep;
      });
    }, 5000); // 5 seconds per image
    
    return () => clearInterval(interval);
  }, [autoplayFinished, storySteps.length]);
  
  // Key to force animation restart when going back to a step
  const [progressKeys, setProgressKeys] = useState<{[key: number]: number}>({});
  
  // Handle manual navigation between steps
  const goToStep = (step: number) => {
    // Ensure step is within bounds
    const targetStep = Math.max(0, Math.min(step, storySteps.length - 1));
    
    // Set direction based on target step
    setDirection(targetStep > activeStoryStep ? 'forward' : 'backward');
    
    // Reset progress key for the target step to restart animation
    setProgressKeys(prev => ({
      ...prev,
      [targetStep]: (prev[targetStep] || 0) + 1
    }));
    
    // When going back, remove all steps >= targetStep from completed steps
    if (targetStep < activeStoryStep) {
      setCompletedSteps(prev => prev.filter(s => s < targetStep));
    } else if (targetStep > activeStoryStep) {
      // For forward navigation, add all steps before the target to completed
      const newCompleted = Array.from({ length: targetStep }, (_, i) => i);
      setCompletedSteps(newCompleted);
    }
    
    // Log for debugging
    console.log(`Navigating from step ${activeStoryStep} to step ${targetStep}, direction: ${targetStep > activeStoryStep ? 'forward' : 'backward'}`);
    
    setActiveStoryStep(targetStep);
    setAutoplayFinished(true); // Stop autoplay when manually navigating
  };

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    companyName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: true
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<FieldValidation>({})
  const [touched, setTouched] = useState<{[key: string]: boolean}>({})
  const [passwordFocused, setPasswordFocused] = useState(false)
  const passwordInputRef = useRef<HTMLInputElement>(null)
  const passwordStrengthRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  
  // Get the intended redirect path
  const from = location.state?.from?.pathname || "/"
  

  const handleInputChange = (field: string, value: string | boolean) => {
    // Capitalize first letter for firstName and lastName
    if ((field === 'firstName' || field === 'lastName') && typeof value === 'string') {
      if (value.length > 0) {
        value = value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
      }
    }
    
    setFormData(prev => ({ ...prev, [field]: value }))

    // Mark field as touched
    setTouched(prev => ({ ...prev, [field]: true }))

    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const validateField = (field: string, value: any) => {
    let validation: any = { isValid: true }
    
    switch (field) {
      case 'firstName':
        validation = validateName(value, "First name")
        break
      case 'lastName':
        validation = validateName(value, "Last name")
        break
      case 'companyName':
        if (!value.trim()) {
          validation = { isValid: false, message: "Company name is required" }
        } else if (value.trim().length < 2) {
          validation = { isValid: false, message: "Company name must be at least 2 characters long" }
        }
        break
      case 'email':
        validation = validateEmail(value, true) // true = require business email
        break
      case 'password':
        validation = validatePassword(value)
        break
      case 'confirmPassword':
        validation = validateConfirmPassword(formData.password, value)
        break
      case 'agreeToTerms':
        validation = validateTermsAgreement(value)
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
    validateField(field, formData[field as keyof typeof formData])
    
    if (field === 'password') {
      // Small delay to allow clicking on the strength indicator
      setTimeout(() => {
        if (document.activeElement !== passwordInputRef.current && 
            !passwordStrengthRef.current?.contains(document.activeElement)) {
          setPasswordFocused(false);
        }
      }, 100);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    console.log("Current step:", currentStep)

    // Mark all fields as touched
    const allFields = ['firstName', 'lastName', 'companyName', 'email', 'password', 'confirmPassword', 'agreeToTerms']
    const newTouched = allFields.reduce((acc, field) => ({ ...acc, [field]: true }), {})
    setTouched(newTouched)

    // Validate entire form
    const formErrors = validateSignupForm(formData)
    setErrors(formErrors)

    if (!isFormValid(formErrors)) {
      toast.error("Please fix the errors below", {
        description: "Check the highlighted fields and correct any validation errors before continuing.",
        duration: 5000,
      })
      setIsLoading(false)
      return
    }

    // Check if email already exists
    try {
      const { emailExists } = await import('@/lib/supabase/users')
      const exists = await emailExists(formData.email)
      
      if (exists) {
        toast.error("Email already registered", {
          description: "This email is already registered. Please sign in instead.",
          duration: 5000,
        })
        setIsLoading(false)
        return
      }

      // Show confirmation email sent toast
      toast.info("Confirmation email sent", {
        description: `We've sent a confirmation link to ${formData.email}. Please check your inbox.`,
        duration: 10000,
      })

      console.log("Redirecting to email confirmation page")
      
      // Redirect to email confirmation page with user data (including password)
      navigate("/email-confirmation", { 
        state: { 
          userData: {
            email: formData.email,
            firstName: formData.firstName,
            lastName: formData.lastName,
            companyName: formData.companyName,
            password: formData.password // Include password for account creation after email confirmation
          },
          from: from
        } 
      })
    } catch (error) {
      console.error("Error checking email:", error)
      toast.error("Signup failed", {
        description: "An error occurred. Please try again.",
        duration: 5000,
      })
    }
    
    setIsLoading(false)
  }
  


  return (
    <div className="bg-card rounded-2xl shadow-none overflow-hidden w-full max-w-6xl mx-auto h-full max-h-[calc(100vh-2rem)] border border-border">
      <div className="grid grid-cols-1 md:grid-cols-2 h-full">
          {/* Left Panel - White Background with Form */}
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
            <h1 className="text-xl font-semibold tracking-tight text-foreground mb-1">Create your account</h1>
            <p className="text-sm text-muted-foreground">{getJoinMessage()}</p>
          </div>


          {/* Signup Form */}
          <form onSubmit={handleSubmit} className="grid gap-3 sm:gap-4">
            {currentStep === SignupStep.FORM && (
              <>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start content-start">
                  <Field>
                    <FieldLabel htmlFor="firstName">First name</FieldLabel>
                    <FieldContent>
                      <InputGroup>
                        <InputGroupAddon>
                          <User className="h-4 w-4" />
                        </InputGroupAddon>
                        <InputGroupInput
                          id="firstName"
                          type="text"
                          placeholder="John"
                          value={formData.firstName}
                          onChange={(e) => handleInputChange("firstName", e.target.value)}
                          onBlur={() => handleBlur("firstName")}
                          className={`${touched.firstName && errors.firstName ? 'border-border-destructive focus:border-border-destructive focus:ring-destructive' : ''}`}
                          autoComplete="off"
                          autoCorrect="off"
                          autoCapitalize="off"
                          spellCheck="false"
                          required
                        />
                      </InputGroup>
                      {touched.firstName && errors.firstName && <FieldError>{errors.firstName.message}</FieldError>}
                    </FieldContent>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="lastName">Last name</FieldLabel>
                    <FieldContent>
                      <InputGroup>
                        <InputGroupInput
                          id="lastName"
                          type="text"
                          placeholder="Doe"
                          value={formData.lastName}
                          onChange={(e) => handleInputChange("lastName", e.target.value)}
                          onBlur={() => handleBlur("lastName")}
                          className={`${touched.lastName && errors.lastName ? 'border-border-destructive focus:border-border-destructive focus:ring-destructive' : ''}`}
                          autoComplete="off"
                          autoCorrect="off"
                          autoCapitalize="off"
                          spellCheck="false"
                          required
                        />
                      </InputGroup>
                      {touched.lastName && errors.lastName && <FieldError>{errors.lastName.message}</FieldError>}
                    </FieldContent>
                  </Field>
                </div>

                <Field>
                  <FieldLabel htmlFor="companyName">Company name</FieldLabel>
                  <FieldContent>
                    <InputGroup>
                      <InputGroupAddon>
                        <Building className="h-4 w-4" />
                      </InputGroupAddon>
                      <InputGroupInput
                        id="companyName"
                        type="text"
                        placeholder="Acme Corporation"
                        value={formData.companyName}
                        onChange={(e) => handleInputChange("companyName", e.target.value)}
                        onBlur={() => handleBlur("companyName")}
                        className={`${touched.companyName && errors.companyName ? 'border-border-destructive focus:border-border-destructive focus:ring-destructive' : ''}`}
                        autoComplete="organization"
                        autoCorrect="off"
                        autoCapitalize="off"
                        spellCheck="false"
                        required
                      />
                    </InputGroup>
                    {touched.companyName && errors.companyName && <FieldError>{errors.companyName.message}</FieldError>}
                  </FieldContent>
                </Field>

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
                        placeholder="your.email@example.com"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        onBlur={() => handleBlur("email")}
                        className={`${touched.email && errors.email ? 'border-border-destructive focus:border-border-destructive focus:ring-destructive' : ''}`}
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
                    <div className="relative">
                      <InputGroup>
                        <InputGroupAddon>
                          <Lock className="h-4 w-4" />
                        </InputGroupAddon>
                        <InputGroupInput
                          id="password"
                          ref={passwordInputRef}
                          type={showPassword ? "text" : "password"}
                          placeholder="Create a password"
                          value={formData.password}
                          onChange={(e) => handleInputChange("password", e.target.value)}
                          onFocus={() => setPasswordFocused(true)}
                          onBlur={() => handleBlur("password")}
                          className={`${touched.password && errors.password ? 'border-border-destructive focus:border-border-destructive focus:ring-destructive' : ''}`}
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
                      
                      {/* Password Strength Tooltip - Fixed to prevent clipping */}
                      {passwordFocused && (
                        <div 
                          ref={passwordStrengthRef}
                          className="bg-card p-3 rounded-md shadow-none border border-border z-50 w-auto"
                          style={{ 
                            position: 'fixed',
                            left: passwordInputRef.current ? 
                              passwordInputRef.current.getBoundingClientRect().left + 
                              passwordInputRef.current.getBoundingClientRect().width + 10 : 'auto',
                            top: passwordInputRef.current ? 
                              passwordInputRef.current.getBoundingClientRect().top : 'auto'
                          }}
                        >
                          <PasswordStrength password={formData.password} />
                        </div>
                      )}
                    </div>
                    {touched.password && errors.password && <FieldError>{errors.password.message}</FieldError>}
                  </FieldContent>
                </Field>

                <Field>
                  <FieldLabel htmlFor="confirmPassword">Confirm password</FieldLabel>
                  <FieldContent>
                    <InputGroup>
                      <InputGroupAddon>
                        <Lock className="h-4 w-4" />
                      </InputGroupAddon>
                      <InputGroupInput
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                        onBlur={() => handleBlur("confirmPassword")}
                        className={`${touched.confirmPassword && errors.confirmPassword ? 'border-border-destructive focus:border-border-destructive focus:ring-destructive' : ''}`}
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
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="h-auto w-auto p-1 hover:text-slate-600"
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </InputGroupAddon>
                    </InputGroup>
                    {touched.confirmPassword && errors.confirmPassword && <FieldError>{errors.confirmPassword.message}</FieldError>}
                  </FieldContent>
                </Field>

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="terms"
                    checked={formData.agreeToTerms}
                    onCheckedChange={(checked) => handleInputChange("agreeToTerms", checked as boolean)}
                    onBlur={() => handleBlur("agreeToTerms")}
                    className={`mt-1 ${touched.agreeToTerms && errors.agreeToTerms ? 'border-border-destructive' : ''}`}
                  />
                  <Label htmlFor="terms" className="text-sm text-muted-foreground leading-relaxed">
                    I agree to the{" "}
                    <Link to="#" className="text-sm font-medium text-foreground hover:text-foreground/80">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link to="#" className="text-sm font-medium text-foreground hover:text-foreground/80">
                      Privacy Policy
                    </Link>
                  </Label>
                </div>
                {touched.agreeToTerms && <ErrorMessage message={errors.agreeToTerms?.message} />}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading || !isFormValid(errors)}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                      <span>Submitting...</span>
                    </div>
                  ) : (
                    "Continue"
                  )}
                </Button>
              </>
            )}


            {currentStep === SignupStep.FORM && (
              <div className="text-center m-2 mb-4">
                <p className="text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="font-medium text-foreground hover:text-foreground/80"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            )}
          </form>

            </div>
          </motion.div>

          {/* Right Panel Wrapper */}
          <div className="hidden md:block m-2 border rounded-xl overflow-hidden relative">
          <motion.div 
            className="bg-muted flex flex-col justify-between relative overflow-hidden h-full"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={smoothTransition}
          >

              {/* Small top margin for spacing */}
              <div className="pt-16"></div>
              
              {/* Visual Content */}
              <div className="flex-1 flex flex-col items-center justify-center relative">
                {/* Image Placeholder - Container */}
                <div className="w-full relative">
                  {storySteps.map((step, index) => (
                    <div 
                      key={`image-${index}`}
                      className={`w-full overflow-hidden ${index === activeStoryStep ? 'relative' : 'absolute opacity-0'}`}
                    >
                      <img 
                        src={step.image} 
                        alt={`Visual content ${index + 1}`} 
                        className="w-full h-auto"
                        style={{ objectFit: "cover" }}
                      />
                    </div>
                  ))}
                </div>
            
                
                {/* Content - Container */}
                <div className="w-full h-32 relative">
                  {storySteps.map((step, index) => (
                    <div 
                      key={`content-${index}`}
                      className={`absolute inset-0 flex flex-col justify-center w-full ${index === activeStoryStep ? 'opacity-100' : 'opacity-0'}`}
                    >
                      <h2 className="text-lg font-semibold mb-1 text-center">{step.title}</h2>
                      <p className="text-muted-foreground text-sm text-center px-8 mb-2">
                        {step.description}
                      </p>
                      
                      {/* Navigation Arrows with Carousel Indicator */}
                      {index === activeStoryStep && (
                        <div className="flex justify-center items-center space-x-3 mt-1">
                          <button 
                            type="button"
                            className="bg-card/80 rounded-full p-1 shadow-none hover:bg-card cursor-pointer z-30"
                            onClick={(e) => {
                              e.stopPropagation();
                              console.log(`Left arrow clicked, current step: ${activeStoryStep}`);
                              if (activeStoryStep > 0) {
                                goToStep(activeStoryStep - 1);
                              }
                            }}
                            disabled={activeStoryStep === 0}
                            style={{ opacity: activeStoryStep === 0 ? 0.5 : 1 }}
                          >
                            <ChevronLeft className="h-4 w-4 text-foreground" />
                          </button>
                          
                          {/* Small Line Indicators */}
                          <div className="flex space-x-1.5">
                            {storySteps.map((_, idx) => (
                              <button
                                key={`line-${idx}`}
                                type="button"
                                className="relative h-1.5 w-8 rounded-full overflow-hidden"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  goToStep(idx);
                                }}
                                aria-label={`Go to slide ${idx + 1}`}
                              >
                                {/* Background line */}
                                <div className="absolute inset-0 bg-muted-foreground/30 rounded-full"></div>
                                
                                {/* Filled line */}
                                {idx === activeStoryStep ? (
                                  <motion.div 
                                    key={`progress-${idx}-${progressKeys[idx] || 0}`}
                                    className="absolute inset-0 bg-blue-500 rounded-full origin-left"
                                    initial={{ scaleX: 0 }}
                                    animate={{ scaleX: 1 }}
                                    transition={{ 
                                      duration: 5, 
                                      ease: "linear" 
                                    }}
                                  />
                                ) : (
                                  <div 
                                    className="absolute inset-0 bg-blue-500 rounded-full origin-left"
                                    style={{ 
                                      transform: `scaleX(${completedSteps.includes(idx) ? 1 : 0})`,
                                      transition: "transform 0.3s ease" 
                                    }}
                                  />
                                )}
                              </button>
                            ))}
                          </div>
                          
                          <button 
                            type="button"
                            className="bg-card/80 rounded-full p-1 shadow-none hover:bg-card cursor-pointer z-30"
                            onClick={(e) => {
                              e.stopPropagation();
                              console.log(`Right arrow clicked, current step: ${activeStoryStep}`);
                              if (activeStoryStep < storySteps.length - 1) {
                                goToStep(activeStoryStep + 1);
                              }
                            }}
                            disabled={activeStoryStep === storySteps.length - 1}
                            style={{ opacity: activeStoryStep === storySteps.length - 1 ? 0.5 : 1 }}
                          >
                            <ChevronRight className="h-4 w-4 text-foreground" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Partners Section with Infinite Scrolling - Single Row */}
              <div className="relative mt-auto pb-4">
                <h3 className="text-xs uppercase text-muted-foreground font-medium mb-6 text-center">OUR PARTNERS</h3>
                <div className="relative overflow-hidden">
                  {/* Gradient overlays for smooth edges */}
                  <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-muted to-transparent z-10"></div>
                  <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-muted to-transparent z-10"></div>
                  
                  {/* Single row with infinite scroll */}
                  <div className="overflow-hidden">
                    <motion.div
                      className="flex"
                      animate={{ x: [0, -1080] }}
                      transition={{
                        x: {
                          repeat: Infinity,
                          repeatType: "loop",
                          duration: 30,
                          ease: "linear",
                        },
                      }}
                    >
                      {/* First set of logos */}
                      <div className="flex-shrink-0 mx-10">
                        <div className="h-10 flex items-center justify-center">
                          <img src="/logos/meta.svg" alt="Meta" className="h-5 w-auto" />
                        </div>
                      </div>
                      
                      <div className="flex-shrink-0 mx-10">
                        <div className="h-10 flex items-center justify-center">
                          <img src="/logos/microsoft.svg" alt="Microsoft" className="h-5 w-auto" />
                        </div>
                      </div>
                      
                      <div className="flex-shrink-0 mx-10">
                        <div className="h-10 flex items-center justify-center">
                          <img src="/logos/aws.svg" alt="AWS" className="h-6 w-auto" />
                        </div>
                      </div>
                      
                      <div className="flex-shrink-0 mx-10">
                        <div className="h-10 flex items-center justify-center">
                          <img src="/logos/google.svg" alt="Google" className="h-6 w-auto" />
                        </div>
                      </div>
                      
                      <div className="flex-shrink-0 mx-10">
                        <div className="h-10 flex items-center justify-center">
                          <img src="/logos/mastercard.svg" alt="MasterCard" className="h-7 w-auto" />
                        </div>
                      </div>
                      
                      <div className="flex-shrink-0 mx-10">
                        <div className="h-10 flex items-center justify-center">
                          <img src="/logos/zain.svg" alt="Zain" className="h-7 w-auto" />
                        </div>
                      </div>
                      
                      {/* Duplicate set for seamless looping */}
                      <div className="flex-shrink-0 mx-10">
                        <div className="h-10 flex items-center justify-center">
                          <img src="/logos/meta.svg" alt="Meta" className="h-5 w-auto" />
                        </div>
                      </div>
                      
                      <div className="flex-shrink-0 mx-10">
                        <div className="h-10 flex items-center justify-center">
                          <img src="/logos/microsoft.svg" alt="Microsoft" className="h-5 w-auto" />
                        </div>
                      </div>
                      
                      <div className="flex-shrink-0 mx-10">
                        <div className="h-10 flex items-center justify-center">
                          <img src="/logos/aws.svg" alt="AWS" className="h-6 w-auto" />
                        </div>
                      </div>
                      
                      <div className="flex-shrink-0 mx-10">
                        <div className="h-10 flex items-center justify-center">
                          <img src="/logos/google.svg" alt="Google" className="h-6 w-auto" />
                        </div>
                      </div>
                      
                      <div className="flex-shrink-0 mx-10">
                        <div className="h-10 flex items-center justify-center">
                          <img src="/logos/mastercard.svg" alt="MasterCard" className="h-7 w-auto" />
                        </div>
                      </div>
                      
                      <div className="flex-shrink-0 mx-10">
                        <div className="h-10 flex items-center justify-center">
                          <img src="/logos/zain.svg" alt="Zain" className="h-7 w-auto" />
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
      </div>
    </div>
  )
}
