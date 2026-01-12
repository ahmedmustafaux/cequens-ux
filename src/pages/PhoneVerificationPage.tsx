import * as React from "react"
import { useState, useEffect } from "react"
import { useNavigate, Link, useLocation } from "react-router-dom"
import { Phone, AlertCircle, CheckCircle2, Shield, ArrowLeft, Globe, Search, ChevronDown, Info } from "lucide-react"
import { Item, ItemMedia, ItemContent, ItemTitle, ItemDescription } from "@/components/ui/item"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useAuth, UserType } from "@/hooks/use-auth"
import { getUserTypeFromEmail } from "@/lib/user-utils"
import { motion } from "framer-motion"
import { getLogoAltText, getWelcomeMessage, getAppName } from "@/lib/config"
import { smoothTransition, pageVariants } from "@/lib/transitions"
import { parsePhoneNumber } from 'awesome-phonenumber'
import { 
  Field, 
  FieldLabel, 
  FieldContent, 
  FieldError 
} from "@/components/ui/field"
import { 
  InputGroup, 
  InputGroupInput, 
  InputGroupAddon 
} from "@/components/ui/input-group"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { validatePhoneNumber, type FieldValidation } from "@/lib/validation"
import { Input } from "@/components/ui/input"
import { CircleFlag } from "react-circle-flags"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

export default function PhoneVerificationPage() {
  enum VerificationStep {
    PHONE_INPUT,
    OTP_VERIFICATION,
    SUCCESS
  }

  const [currentStep, setCurrentStep] = useState<VerificationStep>(VerificationStep.PHONE_INPUT)
  const [phoneNumber, setPhoneNumber] = useState("")
  const [countryCode, setCountryCode] = useState("+966") // Default to Saudi Arabia
  const [searchQuery, setSearchQuery] = useState("")
  const [isCountryPopoverOpen, setIsCountryPopoverOpen] = useState(false)
  
  // List of common country codes for the select dropdown
  const countryCodes = [
    { code: "sa", dialCode: "+966", name: "Saudi Arabia" },
    { code: "us", dialCode: "+1", name: "United States" },
    { code: "gb", dialCode: "+44", name: "United Kingdom" },
    { code: "ae", dialCode: "+971", name: "United Arab Emirates" },
    { code: "eg", dialCode: "+20", name: "Egypt" },
    { code: "in", dialCode: "+91", name: "India" },
    { code: "ca", dialCode: "+1", name: "Canada" },
    { code: "au", dialCode: "+61", name: "Australia" },
    { code: "de", dialCode: "+49", name: "Germany" },
    { code: "fr", dialCode: "+33", name: "France" },
    { code: "it", dialCode: "+39", name: "Italy" },
    { code: "es", dialCode: "+34", name: "Spain" },
    { code: "jp", dialCode: "+81", name: "Japan" },
    { code: "cn", dialCode: "+86", name: "China" },
    { code: "br", dialCode: "+55", name: "Brazil" },
    { code: "ru", dialCode: "+7", name: "Russia" },
    { code: "kr", dialCode: "+82", name: "South Korea" },
    { code: "sg", dialCode: "+65", name: "Singapore" },
    { code: "my", dialCode: "+60", name: "Malaysia" },
    { code: "th", dialCode: "+66", name: "Thailand" },
    { code: "id", dialCode: "+62", name: "Indonesia" },
    { code: "ph", dialCode: "+63", name: "Philippines" },
    { code: "vn", dialCode: "+84", name: "Vietnam" },
    { code: "tr", dialCode: "+90", name: "Turkey" },
    { code: "qa", dialCode: "+974", name: "Qatar" },
    { code: "kw", dialCode: "+965", name: "Kuwait" },
    { code: "bh", dialCode: "+973", name: "Bahrain" },
    { code: "om", dialCode: "+968", name: "Oman" },
    { code: "jo", dialCode: "+962", name: "Jordan" },
    { code: "lb", dialCode: "+961", name: "Lebanon" },
    { code: "dz", dialCode: "+213", name: "Algeria" },
    { code: "ma", dialCode: "+212", name: "Morocco" },
    { code: "tn", dialCode: "+216", name: "Tunisia" },
    { code: "ly", dialCode: "+218", name: "Libya" },
    { code: "sd", dialCode: "+249", name: "Sudan" },
    { code: "ng", dialCode: "+234", name: "Nigeria" },
    { code: "za", dialCode: "+27", name: "South Africa" },
    { code: "ke", dialCode: "+254", name: "Kenya" },
    { code: "et", dialCode: "+251", name: "Ethiopia" },
    { code: "gh", dialCode: "+233", name: "Ghana" },
    { code: "mx", dialCode: "+52", name: "Mexico" },
    { code: "ar", dialCode: "+54", name: "Argentina" },
    { code: "co", dialCode: "+57", name: "Colombia" },
    { code: "cl", dialCode: "+56", name: "Chile" },
    { code: "pe", dialCode: "+51", name: "Peru" },
    { code: "nl", dialCode: "+31", name: "Netherlands" },
    { code: "be", dialCode: "+32", name: "Belgium" },
    { code: "se", dialCode: "+46", name: "Sweden" },
    { code: "no", dialCode: "+47", name: "Norway" },
    { code: "dk", dialCode: "+45", name: "Denmark" },
    { code: "fi", dialCode: "+358", name: "Finland" },
    { code: "ch", dialCode: "+41", name: "Switzerland" },
    { code: "at", dialCode: "+43", name: "Austria" },
    { code: "pt", dialCode: "+351", name: "Portugal" },
    { code: "gr", dialCode: "+30", name: "Greece" },
    { code: "ie", dialCode: "+353", name: "Ireland" },
    { code: "nz", dialCode: "+64", name: "New Zealand" },
    { code: "il", dialCode: "+972", name: "Israel" },
    { code: "pk", dialCode: "+92", name: "Pakistan" },
    { code: "bd", dialCode: "+880", name: "Bangladesh" },
    { code: "np", dialCode: "+977", name: "Nepal" },
    { code: "lk", dialCode: "+94", name: "Sri Lanka" },
    { code: "mm", dialCode: "+95", name: "Myanmar" }
  ]
  
  // Filter countries based on search query
  const filteredCountries = searchQuery 
    ? countryCodes.filter(country => 
        country.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        country.dialCode.includes(searchQuery))
    : countryCodes
  
  const [otp, setOtp] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [resendCountdown, setResendCountdown] = useState(0)
  const [errors, setErrors] = useState<FieldValidation>({})
  const [touched, setTouched] = useState<{[key: string]: boolean}>({})
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  
  // Get user data from location state
  const userData = location.state?.userData || {
    email: "user@example.com",
    firstName: "User",
    lastName: "Name"
  }
  
  // Get the intended redirect path
  const from = location.state?.from?.pathname || "/"

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

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setPhoneNumber(value)
    setTouched(prev => ({ ...prev, phoneNumber: true }))
    
    // Clear errors when user starts typing
    if (errors.phoneNumber) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors.phoneNumber
        return newErrors
      })
    }
    
    // Auto-detect country based on phone number input
    try {
      // If user is typing a full international number with +
      if (value.startsWith('+')) {
        const pn = parsePhoneNumber(value)
        if (pn.valid && pn.countryCode) {
          setCountryCode(`+${pn.countryCode}`)
          setPhoneNumber(pn.number.significant)
        }
      } 
      // Detect Egyptian numbers (starting with 010, 011, 012, 015)
      else if (value.match(/^0(10|11|12|15)/) && value.length >= 4) {
        setCountryCode('+20') // Egypt
      }
      // Detect Saudi numbers (starting with 05)
      else if (value.match(/^05/) && value.length >= 3 && countryCode !== '+20') {
        setCountryCode('+966') // Saudi Arabia
      }
      // Detect UAE numbers (starting with 05)
      else if (value.match(/^05/) && value.length >= 3 && countryCode !== '+966' && countryCode !== '+20') {
        setCountryCode('+971') // UAE
      }
      // Detect UK numbers (starting with 07)
      else if (value.match(/^07/) && value.length >= 3) {
        setCountryCode('+44') // UK
      }
      // Try to parse with current country code
      else if (value.length >= 3) {
        // Try to parse with current country code
        const fullNumber = countryCode + value.replace(/^0+/, '')
        const pn = parsePhoneNumber(fullNumber)
        
        if (pn.valid) {
          // Keep the current country code since it's valid
          return
        }
      }
    } catch (error) {
      // If there's an error in parsing, just continue with the current input
      console.error("Error parsing phone number:", error)
    }
  }

  const handleCountryCodeChange = (value: string) => {
    setCountryCode(value)
    setIsCountryPopoverOpen(false)
    
    // Clear errors when user changes country code
    if (errors.phoneNumber) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors.phoneNumber
        return newErrors
      })
    }
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
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
      case 'phoneNumber':
        validation = validatePhoneNumber(value)
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
      case 'phoneNumber':
        value = phoneNumber
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

    if (currentStep === VerificationStep.PHONE_INPUT) {
      // Mark field as touched
      setTouched({ phoneNumber: true })

      // Use libphonenumber-js to validate and format the phone number
      const formattedPhoneNumber = phoneNumber.replace(/^0+/, '')
      const fullPhoneNumber = countryCode + formattedPhoneNumber
      
      try {
        const parsedNumber = parsePhoneNumber(fullPhoneNumber)
        
        if (!parsedNumber || !parsedNumber.valid) {
          setErrors({ 
            phoneNumber: { 
              isValid: false, 
              message: "Please enter a valid phone number" 
            } 
          })
          setIsLoading(false)
          return
        }
        
        // Format the phone number in international format
        const internationalNumber = parsedNumber.number.international
        
        // Update the displayed phone number with the properly formatted national number
        setPhoneNumber(parsedNumber.number.significant)
        
        // Store the formatted number for display in the next step
        const formattedForDisplay = parsedNumber.number.national
      } catch (error) {
        // Fallback to the basic validation if libphonenumber-js fails
        const phoneValidation = validatePhoneNumber(fullPhoneNumber)
        if (!phoneValidation.isValid) {
          setErrors({ phoneNumber: phoneValidation })
          setIsLoading(false)
          return
        }
      }

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Move to OTP step
      setCurrentStep(VerificationStep.OTP_VERIFICATION)
      setOtp("")
      setErrors({})
      setTouched({})
      
      // Start countdown for resend code
      setResendCountdown(30)
      
      // Format the phone number for display in the toast
      let displayNumber = formattedPhoneNumber
      try {
        const parsedNumber = parsePhoneNumber(fullPhoneNumber)
        if (parsedNumber.valid) {
          displayNumber = parsedNumber.number.national
        }
      } catch (error) {
        // Fallback to basic formatting if parsing fails
        console.error("Error formatting phone number for display:", error)
      }
      
      toast.info("Verification code sent", {
        description: `We've sent a 6-digit code to ${displayNumber}. Please enter it to verify your phone number.`,
        duration: 5000,
      })
    } else if (currentStep === VerificationStep.OTP_VERIFICATION) {
      // Mark OTP field as touched
      setTouched({ otp: true })

      if (otp.length !== 6) {
        setIsLoading(false)
        return
      }

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Check demo OTP
      if (otp === "000000") {
        setCurrentStep(VerificationStep.SUCCESS)
        
        // Determine user type based on email
        const userType = getUserTypeFromEmail(userData.email)
        
        toast.success("Phone verified successfully!", {
          description: userType === "newUser" 
            ? "Your phone number has been verified. Let's set up your experience..." 
            : "Your phone number has been verified. Redirecting to your guide...",
          duration: 4000,
        })
        
        // Simulate final account creation
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        // Use auth context to login with user's full name and user type
        login(userData.email, `${userData.firstName} ${userData.lastName}`, userType)
        
        // Redirect based on user type
        if (userType === "newUser") {
          // New users go to onboarding
          navigate("/onboarding")
        } else {
          // Existing users go to guide page
          navigate("/getting-started")
        }
      } else {
        // Show error in form
        setErrors({
          otp: { isValid: false, message: "Invalid OTP code" }
        })
      }
    }

    setIsLoading(false)
  }
  
  const resendVerificationCode = async () => {
    setIsLoading(true)
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Reset countdown
    setResendCountdown(30)
    
    // Format the phone number for display in the toast
    let displayNumber = `${countryCode} ${phoneNumber.replace(/^0+/, '')}`
    try {
      const parsedNumber = parsePhoneNumber(countryCode + phoneNumber.replace(/^0+/, ''))
      if (parsedNumber.valid) {
        displayNumber = parsedNumber.number.international
      }
    } catch (error) {
      // Fallback to basic formatting if parsing fails
      console.error("Error formatting phone number for display:", error)
    }
    
    // Show confirmation code sent toast
    toast.info("Verification code resent", {
      description: `We've sent another verification code to ${displayNumber}. Please check your phone.`,
      duration: 5000,
    })
    
    setIsLoading(false)
  }

  const goBackToPhoneInput = () => {
    setCurrentStep(VerificationStep.PHONE_INPUT)
    setOtp("")
    setErrors({})
    setTouched({})
  }

  const selectedCountry = countryCodes.find(c => c.dialCode === countryCode) || countryCodes[0]

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

          <form onSubmit={handleSubmit}>
            {currentStep === VerificationStep.PHONE_INPUT ? (
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
                    <Phone className="h-6 w-6" />
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle>Verify your phone number</ItemTitle>
                    <ItemDescription>
                      Please enter your phone number to receive a verification code
                    </ItemDescription>
                  </ItemContent>
                </Item>

                <div className="grid gap-4">
                  <Field>
                    <FieldLabel htmlFor="phoneNumber">Phone Number</FieldLabel>
                    <FieldContent>
                      <div className="flex">
                        <Popover open={isCountryPopoverOpen} onOpenChange={setIsCountryPopoverOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "justify-between font-normal h-9 px-3",
                                "w-[130px] rounded-r-none border-r-0",
                                "bg-transparent hover:bg-muted/50",
                                "text-foreground hover:text-foreground"
                              )}
                            >
                              <div className="flex items-center gap-2">
                                <CircleFlag 
                                  countryCode={selectedCountry.code} 
                                  height="16" 
                                  width="16" 
                                />
                                <span className="text-sm">{selectedCountry.dialCode}</span>
                              </div>
                              <ChevronDown className="h-4 w-4 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent 
                            className="w-[300px] p-0 max-h-[400px] flex flex-col" 
                            align="start"
                            onOpenAutoFocus={(e) => e.preventDefault()}
                          >
                            <div className="flex flex-col flex-1 min-h-0">
                              {/* Search input at the top */}
                              <div className="flex flex-col flex-shrink-0">
                                <div>
                                  <Field>
                                    <FieldContent>
                                      <InputGroup className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none">
                                        <InputGroupAddon>
                                          <Search className="h-3 w-3" />
                                        </InputGroupAddon>
                                        <InputGroupInput
                                          placeholder="Search countries..."
                                          value={searchQuery}
                                          onChange={handleSearchChange}
                                          className="h-6 text-sm"
                                          autoFocus={false}
                                        />
                                      </InputGroup>
                                    </FieldContent>
                                  </Field>
                                </div>
                                <div className="border-t border-border" />
                              </div>
                              
                              {/* Country options container with relative positioning */}
                              <div className="relative flex-1 min-h-0 overflow-hidden">
                                {/* Scrollable country list */}
                                <div className="h-full overflow-y-auto p-1" style={{ maxHeight: '300px' }}>
                                  {filteredCountries.length > 0 ? (
                                    filteredCountries.map((country) => (
                                      <div 
                                        key={country.code} 
                                        className={cn(
                                          "flex items-center gap-2 p-2 hover:bg-accent rounded-sm cursor-pointer",
                                          country.dialCode === countryCode && "bg-accent"
                                        )}
                                        onClick={() => handleCountryCodeChange(country.dialCode)}
                                      >
                                        <CircleFlag countryCode={country.code} height="16" width="16" />
                                        <span className="text-sm">{country.name}</span>
                                        <span className="text-sm text-muted-foreground ml-auto">{country.dialCode}</span>
                                      </div>
                                    ))
                                  ) : (
                                    <div className="px-2 py-1 text-sm text-muted-foreground text-center">
                                      No results found
                                    </div>
                                  )}
                                </div>
                                
                                {/* Fixed arrow indicator outside the scrollable area */}
                                {filteredCountries.length > 6 && (
                                  <div className="absolute bottom-0 inset-x-0 flex justify-center bg-gradient-to-t from-white via-white/80 to-transparent py-1 pointer-events-none">
                                    <ChevronDown className="h-4 w-4 text-muted-foreground animate-bounce" />
                                  </div>
                                )}
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                        <Input
                          id="phoneNumber"
                          type="tel"
                          placeholder="Enter phone number"
                          value={phoneNumber}
                          onChange={handlePhoneNumberChange}
                          onBlur={() => handleBlur("phoneNumber")}
                          autoComplete="tel"
                          autoCorrect="off"
                          autoCapitalize="off"
                          spellCheck="false"
                          required
                          className="flex-1 rounded-l-none h-9"
                        />
                      </div>
                      {touched.phoneNumber && errors.phoneNumber && <FieldError>{errors.phoneNumber.message}</FieldError>}
                    </FieldContent>
                  </Field>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        <span>Sending code...</span>
                      </div>
                    ) : (
                      "Send Verification Code"
                    )}
                  </Button>
                </div>
              </motion.div>
            ) : currentStep === VerificationStep.OTP_VERIFICATION ? (
              <motion.div
                initial="initial"
                animate="animate"
                exit="exit"
                variants={pageVariants}
                transition={smoothTransition}
                className="w-full"
              >
                {/* Back button */}
                <div className="flex items-center mb-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={goBackToPhoneInput}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to phone number
                  </Button>
                </div>

                {/* OTP Section */}
                <Item className="mb-6">
                  <ItemMedia variant="icon">
                    <Shield className="h-6 w-6" />
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle>Enter verification code</ItemTitle>
                    <ItemDescription>
                      {(() => {
                        // Format the phone number for display
                        try {
                          const parsedNumber = parsePhoneNumber(countryCode + phoneNumber.replace(/^0+/, ''))
                          if (parsedNumber.valid) {
                            return `We've sent a 6-digit code to ${parsedNumber.number.international}`
                          }
                        } catch (error) {
                          console.error("Error formatting phone number:", error)
                        }
                        // Fallback to basic formatting
                        return `We've sent a 6-digit code to ${countryCode} ${phoneNumber.replace(/^0+/, '')}`
                      })()}
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
                        onClick={resendVerificationCode}
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
                  className="w-full mt-4"
                  disabled={isLoading || otp.length !== 6}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>Verifying...</span>
                    </div>
                  ) : (
                    "Verify Phone Number"
                  )}
                </Button>
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
                  <h2 className="text-xl font-semibold mb-1">Phone verified!</h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    {getUserTypeFromEmail(userData.email) === "newUser"
                      ? "Your phone number has been successfully verified. Setting up your experience..."
                      : "Your phone number has been successfully verified. Redirecting to dashboard..."}
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
          </form>
        </div>
      </div>
      
    </>
  )
}