import * as React from "react"
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
  InputGroupAddon,
  InputGroupButton
} from "@/components/ui/input-group"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { User, Mail, Phone, Tag, Plus, X, Search, ChevronDown } from "lucide-react"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { CircleFlag } from "react-circle-flags"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { useCreateContact } from "@/hooks/use-contacts"
import type { AppContact } from "@/lib/supabase/types"
import { detectCountryFromPhoneNumber, checkWhatsAppAvailability, getCountryISOFromCallingCode, validatePhoneNumber, formatPhoneForDisplay } from "@/lib/phone-utils"

interface ContactFormData {
  firstName: string
  lastName: string
  phone: string
  email: string
  tags: string[]
  notes: string
}

interface CreateContactSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateContactSheet({ open, onOpenChange }: CreateContactSheetProps) {
  const createContactMutation = useCreateContact()
  const [newTag, setNewTag] = React.useState("")
  const [countryCode, setCountryCode] = React.useState("+966")
  const [countryISO, setCountryISO] = React.useState<string>("SA")
  const [searchQuery, setSearchQuery] = React.useState("")
  const [isCountryPopoverOpen, setIsCountryPopoverOpen] = React.useState(false)
  const [phoneError, setPhoneError] = React.useState<string>("")
  const [isCheckingWhatsApp, setIsCheckingWhatsApp] = React.useState(false)
  const [hasWhatsApp, setHasWhatsApp] = React.useState<boolean | null>(null)
  
  const [formData, setFormData] = React.useState<ContactFormData>({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    tags: [],
    notes: ""
  })

  // Reset form when sheet closes
  React.useEffect(() => {
    if (!open) {
      setFormData({
        firstName: "",
        lastName: "",
        phone: "",
        email: "",
        tags: [],
        notes: ""
      })
      setNewTag("")
      setCountryCode("+966")
      setCountryISO("SA")
      setHasWhatsApp(null)
      setIsCheckingWhatsApp(false)
    }
  }, [open])

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
  ]

  const filteredCountries = searchQuery 
    ? countryCodes.filter(country => 
        country.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        country.dialCode.includes(searchQuery))
    : countryCodes

  const selectedCountry = countryCodes.find(c => c.dialCode === countryCode) || countryCodes[0]

  const handleInputChange = (field: keyof ContactFormData, value: string) => {
    // Capitalize first letter for firstName and lastName
    if (field === 'firstName' || field === 'lastName') {
      if (value.length > 0) {
        value = value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
      }
    }
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handlePhoneNumberChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow digits - keep value writable
    let value = e.target.value.replace(/\D/g, '')
    setPhoneError("")
    setHasWhatsApp(null) // Reset WhatsApp status when number changes
    
    // Auto-detect country from phone number using operator prefixes (first 3 digits)
    // This prioritizes operator prefix detection for better accuracy
    if (value.length >= 3) {
      try {
        const detection = detectCountryFromPhoneNumber(value)
        
        // Update country code if detected and different
        if (detection.countryCode && detection.countryCode !== countryCode) {
          console.log('Auto-detected country code:', detection.countryCode, 'from operator number:', value)
          setCountryCode(detection.countryCode)
          
          // Remove leading "0" ONLY after country code is detected
          if (value.startsWith('0')) {
            value = value.substring(1)
          }
        }
        
        // Update country ISO if detected and different
        if (detection.countryISO && detection.countryISO !== countryISO) {
          console.log('Auto-detected country ISO:', detection.countryISO, 'from operator number:', value)
          setCountryISO(detection.countryISO)
        }
      } catch (error) {
        console.error('Error in country detection:', error)
      }
    }
    
    handleInputChange("phone", value)
  }
  
  // Separate effect for WhatsApp checking with debounce
  React.useEffect(() => {
    const phoneValue = formData.phone
    // Only check if we have at least 7 digits
    if (phoneValue.length >= 7) {
      const timeoutId = setTimeout(async () => {
        // Double-check the phone value hasn't changed
        if (formData.phone === phoneValue) {
          console.log('Checking WhatsApp for:', { phone: phoneValue, countryCode })
          setIsCheckingWhatsApp(true)
          
          try {
            // IMPORTANT: We're checking the CONTACT'S phone number (the number being entered in the form)
            // NOT the channel configuration or user's number
            // Prepare the contact's phone number for WhatsApp availability check
            let contactPhoneNumber: string
            
            if (countryCode && phoneValue) {
              // Combine country code with the contact's phone number (ensure no double +)
              const cleanCountryCode = countryCode.startsWith('+') ? countryCode : `+${countryCode}`
              const cleanPhone = phoneValue.replace(/^0+/, '') // Remove any leading zeros
              contactPhoneNumber = cleanCountryCode + cleanPhone
            } else if (phoneValue) {
              // Use contact's phone value as-is, detection will handle it
              contactPhoneNumber = phoneValue
            } else {
              // No phone value, skip check
              setIsCheckingWhatsApp(false)
              setHasWhatsApp(null)
              return
            }
            
            console.log('🔍 Checking WhatsApp availability for CONTACT phone number:', { 
              enteredPhone: phoneValue, 
              countryCode, 
              fullNumber: contactPhoneNumber,
              note: 'This checks if the entered contact number has WhatsApp, not channel config'
            })
            
            // Check if the CONTACT'S phone number is registered on WhatsApp
            // This uses the whatsapp-number-verify API to check the specific number entered
            const result = await checkWhatsAppAvailability(contactPhoneNumber)
            
            // Only update if we still have the same number
            if (formData.phone === phoneValue) {
              console.log('✅ WhatsApp check result for contact number:', { 
                contactNumber: contactPhoneNumber,
                hasWhatsApp: result.hasWhatsApp,
                error: result.error 
              })
              
              // Only set hasWhatsApp if we got a definitive result (true)
              // If false with no error, it means we can't check automatically
              if (result.hasWhatsApp === true) {
                setHasWhatsApp(true)
                console.log('✅ Contact number HAS WhatsApp:', contactPhoneNumber)
              } else if (result.error) {
                // Only show error if there's an actual error message
                console.warn('⚠️ WhatsApp check:', result.error)
                setHasWhatsApp(null) // Set to null to show "unknown" state
              } else {
                // Can't check automatically - set to null (unknown)
                setHasWhatsApp(null)
                console.log('ℹ️ WhatsApp status unknown - cannot verify automatically')
              }
            }
          } catch (error) {
            console.error('Error checking WhatsApp:', error)
            if (formData.phone === phoneValue) {
              setHasWhatsApp(null)
            }
          } finally {
            if (formData.phone === phoneValue) {
              setIsCheckingWhatsApp(false)
            }
          }
        }
      }, 800) // 800ms debounce
      
      return () => clearTimeout(timeoutId)
    } else {
      setIsCheckingWhatsApp(false)
      setHasWhatsApp(null)
    }
  }, [formData.phone, countryCode])

  const handlePhoneBlur = () => {
    // Try detection first (handles operator prefixes)
    const detection = detectCountryFromPhoneNumber(formData.phone)
    
    if (detection.isValid && detection.formattedNumber) {
      setPhoneError("")
      // Optionally update the input to show local format
      // But keep the raw digits for editing
    } else {
      // Fallback: validate with country code
      const fullPhone = countryCode + formData.phone
      const validation = validatePhoneNumber(fullPhone)
      if (!validation.isValid) {
        setPhoneError(validation.error || "Please enter a valid phone number")
      } else {
        setPhoneError("")
      }
    }
  }

  const handleCountryCodeChange = (value: string) => {
    setCountryCode(value)
    setIsCountryPopoverOpen(false)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  // Helper to get country ISO from dial code
  const getCountryISOFromDialCode = (dialCode: string): string => {
    // Use the detected country ISO from phone number if available (most accurate)
    if (countryISO) {
      return countryISO.toUpperCase()
    }
    // Fallback to countryCodes list based on dial code
    const country = countryCodes.find(c => c.dialCode === dialCode)
    return country?.code.toUpperCase() || "SA" // Default to SA if not found
  }

  const handleSave = async () => {
    // Detect and normalize phone number from input (handles operator prefixes)
    const phoneInput = formData.phone
    const detection = detectCountryFromPhoneNumber(phoneInput)
    
    // If detection found a valid number, use it; otherwise try with country code
    let normalizedPhone: string
    let finalCountryISO: string
    
    if (detection.isValid && detection.formattedNumber) {
      // Use detected and normalized phone number (E.164 format)
      normalizedPhone = detection.formattedNumber
      finalCountryISO = detection.countryISO || getCountryISOFromDialCode(countryCode)
    } else {
      // Fallback: try with country code
      const fullPhone = countryCode + phoneInput
      const phoneValidation = validatePhoneNumber(fullPhone)
      
      if (!phoneValidation.isValid) {
        setPhoneError(phoneValidation.error || "Please enter a valid phone number")
        toast.error(phoneValidation.error || "Please enter a valid phone number")
        return
      }
      
      normalizedPhone = phoneValidation.formatted || fullPhone
      finalCountryISO = phoneValidation.countryISO || getCountryISOFromDialCode(countryCode)
    }

    // Generate name from firstName and lastName
    const name = [formData.firstName, formData.lastName].filter(Boolean).join(" ").trim() || "Unknown Contact"
    
    // Prepare contact data for database - store phone in E.164 format
    const contactData: Partial<AppContact> = {
      name,
      firstName: formData.firstName || undefined,
      lastName: formData.lastName || undefined,
      phone: normalizedPhone, // Store in E.164 format
      emailAddress: formData.email || undefined,
      countryISO: finalCountryISO,
      tags: formData.tags,
      channel: null, // Channel can be null - will be set later or can be edited
      conversationStatus: "unassigned", // Default status
      assignee: null,
      lastMessage: "",
      avatar: name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
      avatarColor: 'bg-blue-500',
      // Notes are not stored in the schema currently
    }

    try {
      await createContactMutation.mutateAsync(contactData)
      toast.success("Contact created successfully!")
      onOpenChange(false)
    } catch (error) {
      console.error("Error creating contact:", error)
      toast.error("Failed to create contact. Please try again.")
    }
  }

  // Validate phone number for save button state
  const phoneInput = formData.phone
  const phoneDetection = detectCountryFromPhoneNumber(phoneInput)
  const phoneValidation = phoneDetection.isValid 
    ? { isValid: true, formatted: phoneDetection.formattedNumber }
    : validatePhoneNumber(countryCode + phoneInput)
  const canSave = phoneValidation.isValid && formData.phone.trim() !== ""

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-lg bg-popover flex flex-col p-0 gap-0 [&>button.absolute]:hidden">
        <SheetHeader className="px-4 pt-4 pb-2">
          <SheetTitle>Create Contact</SheetTitle>
          <SheetDescription>
            Add a new contact to your list. Phone number is required.
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto px-4">
            <div className="mt-4 space-y-6 pb-4">
              {/* Main Fields */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="firstName">First Name</FieldLabel>
                    <FieldContent>
                      <InputGroup>
                        <InputGroupAddon>
                          <User className="h-4 w-4" />
                        </InputGroupAddon>
                        <InputGroupInput
                          id="firstName"
                          value={formData.firstName}
                          onChange={(e) => handleInputChange("firstName", e.target.value)}
                          placeholder="Enter first name"
                        />
                      </InputGroup>
                    </FieldContent>
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="lastName">Last Name</FieldLabel>
                    <FieldContent>
                      <InputGroup>
                        <InputGroupAddon>
                          <User className="h-4 w-4" />
                        </InputGroupAddon>
                        <InputGroupInput
                          id="lastName"
                          value={formData.lastName}
                          onChange={(e) => handleInputChange("lastName", e.target.value)}
                          placeholder="Enter last name"
                        />
                      </InputGroup>
                    </FieldContent>
                  </Field>
                </div>

                <Field>
                  <FieldLabel htmlFor="phone">Phone Number *</FieldLabel>
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
                              "text-black hover:text-black"
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
                            
                            <div className="relative flex-1 min-h-0 overflow-hidden">
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
                        id="phone"
                        type="tel"
                        placeholder="Enter phone number"
                        value={formData.phone}
                        onChange={handlePhoneNumberChange}
                        onBlur={handlePhoneBlur}
                        autoComplete="tel"
                        autoCorrect="off"
                        autoCapitalize="off"
                        spellCheck="false"
                        className={cn(
                          "flex-1 rounded-l-none h-9",
                          phoneError && "border-destructive focus-visible:ring-destructive"
                        )}
                        required
                      />
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <FieldDescription>Required - include country code</FieldDescription>
                      {formData.phone.length >= 7 && (
                        <div className="flex items-center gap-1.5">
                          {isCheckingWhatsApp ? (
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <div className="h-3 w-3 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
                              <span className="text-muted-foreground">Checking...</span>
                            </div>
                          ) : hasWhatsApp === true ? (
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <img 
                                src="/icons/WhatsApp.svg" 
                                alt="WhatsApp" 
                                className="h-3.5 w-3.5"
                              />
                              <span className="text-muted-foreground">Has WhatsApp</span>
                            </div>
                          ) : hasWhatsApp === false ? (
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground opacity-60">
                              <img 
                                src="/icons/WhatsApp.svg" 
                                alt="WhatsApp" 
                                className="h-3.5 w-3.5"
                              />
                              <span className="text-muted-foreground">No WhatsApp</span>
                            </div>
                          ) : null}
                        </div>
                      )}
                    </div>
                    {phoneError && <FieldError>{phoneError}</FieldError>}
                  </FieldContent>
                </Field>
              </div>

              {/* Additional Details - Always Visible */}
              <div className="border-t pt-4 space-y-4">
                <Field>
                  <FieldLabel htmlFor="email">Email Address</FieldLabel>
                  <FieldContent>
                    <InputGroup>
                      <InputGroupAddon>
                        <Mail className="h-4 w-4" />
                      </InputGroupAddon>
                      <InputGroupInput
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        placeholder="Enter email address"
                      />
                    </InputGroup>
                  </FieldContent>
                </Field>

                <Field>
                  <FieldLabel>Tags</FieldLabel>
                  <FieldContent>
                    <InputGroup>
                      <InputGroupInput
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        placeholder="Add a tag and press Enter"
                        onKeyPress={(e: React.KeyboardEvent) => {
                          if (e.key === "Enter") {
                            e.preventDefault()
                            addTag()
                          }
                        }}
                      />
                      <InputGroupAddon align="inline-end">
                        <InputGroupButton
                          onClick={addTag}
                          disabled={!newTag.trim()}
                          variant="outline"
                          size="xs"
                        >
                          <Plus className="h-4 w-4" />
                        </InputGroupButton>
                      </InputGroupAddon>
                    </InputGroup>
                    {formData.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="flex items-center gap-1"
                          >
                            {tag}
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeTag(tag)}
                              className="ml-1 hover:bg-gray-200 rounded-full p-0.5 h-auto w-auto"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </FieldContent>
                </Field>

                <Field>
                  <FieldLabel>Notes</FieldLabel>
                  <FieldContent>
                    <Textarea
                      value={formData.notes}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange("notes", e.target.value)}
                      placeholder="Add any additional notes about this contact..."
                      className="min-h-[100px]"
                    />
                  </FieldContent>
                </Field>
              </div>
            </div>
          </div>

          {/* Footer - Sticky like segments */}
          <SheetFooter className="sticky bottom-0 border-t bg-popover px-4 py-3 mt-auto z-10 shrink-0">
            <div className="flex gap-3 w-full justify-between">
              <div className="flex gap-2">
                {/* Left side actions can be added here if needed */}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={createContactMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={!canSave || createContactMutation.isPending}
                >
                  {createContactMutation.isPending ? "Creating..." : "Create Contact"}
                </Button>
              </div>
            </div>
          </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  )
}
