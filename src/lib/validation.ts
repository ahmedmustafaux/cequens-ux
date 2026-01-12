// Validation utility functions for forms

export interface ValidationResult {
  isValid: boolean
  message?: string
}

export interface FieldValidation {
  [key: string]: ValidationResult
}

// Phone number validation
export const validatePhoneNumber = (phoneNumber: string): ValidationResult => {
  if (!phoneNumber.trim()) {
    return { isValid: false, message: "Phone number is required" }
  }
  
  // Remove spaces, dashes, and parentheses for validation
  const cleanedNumber = phoneNumber.replace(/[\s\-\(\)]/g, '')
  
  // Basic phone number validation (digits only, reasonable length)
  if (!/^\+?\d{8,15}$/.test(cleanedNumber)) {
    return { isValid: false, message: "Please enter a valid phone number" }
  }
  
  return { isValid: true }
}

// Email validation
export const validateEmail = (email: string, requireBusinessEmail: boolean = false): ValidationResult => {
  if (!email.trim()) {
    return { isValid: false, message: "Email is required" }
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { isValid: false, message: "Please enter a valid email address" }
  }
  
  if (requireBusinessEmail) {
    // Check for common personal email domains
    const personalDomains = [
      'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com', 
      'icloud.com', 'mail.com', 'protonmail.com', 'zoho.com', 'yandex.com',
      'gmx.com', 'live.com', 'me.com', 'inbox.com'
    ]
    
    const domain = email.split('@')[1].toLowerCase()
    if (personalDomains.includes(domain)) {
      return { 
        isValid: false, 
        message: "Please use your business email address instead of a personal email" 
      }
    }
  }
  
  return { isValid: true }
}

// Password validation
export const validatePassword = (password: string): ValidationResult => {
  if (!password) {
    return { isValid: false, message: "Password is required" }
  }
  
  if (password.length < 8) {
    return { isValid: false, message: "Password must be at least 8 characters long" }
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    return { isValid: false, message: "Password must contain at least one lowercase letter" }
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    return { isValid: false, message: "Password must contain at least one uppercase letter" }
  }
  
  if (!/(?=.*\d)/.test(password)) {
    return { isValid: false, message: "Password must contain at least one number" }
  }
  
  if (!/(?=.*[@$!%*?&])/.test(password)) {
    return { isValid: false, message: "Password must contain at least one special character (@$!%*?&)" }
  }
  
  return { isValid: true }
}

// Name validation
export const validateName = (name: string, fieldName: string = "Name"): ValidationResult => {
  if (!name.trim()) {
    return { isValid: false, message: `${fieldName} is required` }
  }
  
  if (name.trim().length < 2) {
    return { isValid: false, message: `${fieldName} must be at least 2 characters long` }
  }
  
  if (name.trim().length > 50) {
    return { isValid: false, message: `${fieldName} must be less than 50 characters` }
  }
  
  if (!/^[a-zA-Z\s'-]+$/.test(name.trim())) {
    return { isValid: false, message: `${fieldName} can only contain letters, spaces, hyphens, and apostrophes` }
  }
  
  return { isValid: true }
}

// Confirm password validation
export const validateConfirmPassword = (password: string, confirmPassword: string): ValidationResult => {
  if (!confirmPassword) {
    return { isValid: false, message: "Please confirm your password" }
  }
  
  if (password !== confirmPassword) {
    return { isValid: false, message: "Passwords do not match" }
  }
  
  return { isValid: true }
}

// Terms agreement validation
export const validateTermsAgreement = (agreed: boolean): ValidationResult => {
  if (!agreed) {
    return { isValid: false, message: "You must agree to the terms and conditions" }
  }
  
  return { isValid: true }
}

// Login form validation
export const validateLoginForm = (email: string, password: string): FieldValidation => {
  const errors: FieldValidation = {}
  
  const emailValidation = validateEmail(email)
  if (!emailValidation.isValid) {
    errors.email = emailValidation
  }
  
  if (!password) {
    errors.password = { isValid: false, message: "Password is required" }
  }
  
  return errors
}

// Signup form validation
export const validateSignupForm = (formData: {
  firstName: string
  lastName: string
  companyName: string
  email: string
  password: string
  confirmPassword: string
  agreeToTerms: boolean
}): FieldValidation => {
  const errors: FieldValidation = {}
  
  const firstNameValidation = validateName(formData.firstName, "First name")
  if (!firstNameValidation.isValid) {
    errors.firstName = firstNameValidation
  }
  
  const lastNameValidation = validateName(formData.lastName, "Last name")
  if (!lastNameValidation.isValid) {
    errors.lastName = lastNameValidation
  }
  
  // Company name validation
  if (!formData.companyName.trim()) {
    errors.companyName = { isValid: false, message: "Company name is required" }
  } else if (formData.companyName.trim().length < 2) {
    errors.companyName = { isValid: false, message: "Company name must be at least 2 characters long" }
  }
  
  const emailValidation = validateEmail(formData.email, false) // false = allow personal emails
  if (!emailValidation.isValid) {
    errors.email = emailValidation
  }
  
  const passwordValidation = validatePassword(formData.password)
  if (!passwordValidation.isValid) {
    errors.password = passwordValidation
  }
  
  const confirmPasswordValidation = validateConfirmPassword(formData.password, formData.confirmPassword)
  if (!confirmPasswordValidation.isValid) {
    errors.confirmPassword = confirmPasswordValidation
  }
  
  const termsValidation = validateTermsAgreement(formData.agreeToTerms)
  if (!termsValidation.isValid) {
    errors.agreeToTerms = termsValidation
  }
  
  return errors
}

// Check if form is valid
export const isFormValid = (errors: FieldValidation): boolean => {
  return Object.keys(errors).length === 0
}
