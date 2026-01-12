import { parsePhoneNumberFromString, isValidPhoneNumber, CountryCode } from 'libphonenumber-js'
import { phone } from 'phone'
import { findNetworkByPhoneNumber } from 'mobile-carriers'
import axios from 'axios'

/**
 * Detects country from phone number input using operator prefixes (first 3 digits)
 * This prioritizes operator prefix detection for better accuracy
 * Returns normalized phone number in E.164 format for storage
 */
export function detectCountryFromPhoneNumber(phoneInput: string): {
  countryCode: string | null
  countryISO: string | null
  formattedNumber: string | null // E.164 format for storage
  localFormat: string | null // Local format for display
  isValid: boolean
  nationalNumber: string
  carrier?: string
} {
  if (!phoneInput || phoneInput.length < 3) {
    return {
      countryCode: null,
      countryISO: null,
      formattedNumber: null,
      localFormat: null,
      isValid: false,
      nationalNumber: phoneInput || ''
    }
  }

  // Remove all non-digit characters for clean input
  const digitsOnly = phoneInput.replace(/\D/g, '')
  
  if (digitsOnly.length < 3) {
    return {
      countryCode: null,
      countryISO: null,
      formattedNumber: null,
      localFormat: null,
      isValid: false,
      nationalNumber: digitsOnly
    }
  }

  // PRIORITY 1: Detect from operator prefixes (first 3 digits) - most accurate for local numbers
  if (digitsOnly.length >= 3) {
    const firstThree = digitsOnly.substring(0, 3)
    const firstTwo = digitsOnly.substring(0, 2)
    
    // Extended operator patterns for better detection
    const operatorPatterns: Array<{ 
      pattern: RegExp
      countryCode: string
      countryISO: string
      removePrefix?: string // Prefix to remove for national number
    }> = [
      // Egypt - operator prefixes: 010, 011, 012, 015, 016
      { pattern: /^010|^011|^012|^015|^016/, countryCode: '+20', countryISO: 'EG', removePrefix: '0' },
      // Saudi Arabia - operator prefixes: 05x (where x is 0-9)
      { pattern: /^05[0-9]/, countryCode: '+966', countryISO: 'SA', removePrefix: '0' },
      // UAE - operator prefixes: 05x
      { pattern: /^05[0-9]/, countryCode: '+971', countryISO: 'AE', removePrefix: '0' },
      // UK - operator prefixes: 07x
      { pattern: /^07[0-9]/, countryCode: '+44', countryISO: 'GB', removePrefix: '0' },
      // US/Canada - operator prefixes: 1xx (area codes)
      { pattern: /^1[2-9][0-9]/, countryCode: '+1', countryISO: 'US' },
      // India - operator prefixes: 6-9 followed by 9 digits
      { pattern: /^[6-9][0-9]{9}$/, countryCode: '+91', countryISO: 'IN' },
      // More patterns can be added here
    ]

    // Try operator prefix detection first
    for (const { pattern, countryCode, countryISO, removePrefix } of operatorPatterns) {
      if (pattern.test(digitsOnly)) {
        try {
          // Prepare number for validation
          let numberToTest = digitsOnly
          
          // Remove local prefix if specified (e.g., remove leading 0)
          if (removePrefix && digitsOnly.startsWith(removePrefix)) {
            numberToTest = digitsOnly.substring(removePrefix.length)
          }
          
          // Test with country code
          const testResult = phone(countryCode + numberToTest)
          
          if (testResult.isValid && testResult.countryIso2?.toUpperCase() === countryISO) {
            // Get carrier if possible
            let carrier: string | undefined
            try {
              if (testResult.countryCode) {
                const network = findNetworkByPhoneNumber(testResult.phoneNumber, testResult.countryCode)
                if (network) carrier = network
              }
            } catch {
              // Carrier detection failed, continue
            }

            // Format for local display
            let localFormat: string | null = null
            try {
              const parsed = parsePhoneNumberFromString(testResult.phoneNumber)
              if (parsed) {
                localFormat = parsed.formatNational()
              }
            } catch {
              // Fallback to national number if formatting fails
              localFormat = testResult.phoneNumber.replace(countryCode, '')
            }

            return {
              countryCode: countryCode,
              countryISO: countryISO,
              formattedNumber: testResult.phoneNumber, // E.164 format for storage
              localFormat: localFormat, // Local format for display
              isValid: true,
              nationalNumber: testResult.phoneNumber.replace(countryCode, ''),
              carrier
            }
          }
        } catch (error) {
          // Continue to next pattern
          continue
        }
      }
    }
  }

  // PRIORITY 2: Try with 'phone' package directly (works if number already has country code)
  try {
    const testInput = phoneInput.startsWith('+') ? phoneInput : '+' + digitsOnly
    const result = phone(testInput)
    
    if (result.isValid && result.countryIso2) {
      // Get carrier if possible
      let carrier: string | undefined
      try {
        if (result.countryCode) {
          const network = findNetworkByPhoneNumber(result.phoneNumber, result.countryCode)
          if (network) carrier = network
        }
      } catch {
        // Carrier detection failed, continue
      }

      // Format for local display
      let localFormat: string | null = null
      try {
        const parsed = parsePhoneNumberFromString(result.phoneNumber)
        if (parsed) {
          localFormat = parsed.formatNational()
        }
      } catch {
        localFormat = result.phoneNumber.replace(result.countryCode || '', '')
      }

      return {
        countryCode: result.countryCode || null,
        countryISO: result.countryIso2?.toUpperCase() || null,
        formattedNumber: result.phoneNumber, // E.164 format
        localFormat: localFormat, // Local format
        isValid: true,
        nationalNumber: result.phoneNumber.replace(result.countryCode || '', ''),
        carrier
      }
    }
  } catch (error) {
    // Continue to fallback
  }

  // PRIORITY 3: Fallback to libphonenumber-js
  try {
    const testInput = phoneInput.startsWith('+') ? phoneInput : '+' + digitsOnly
    const phoneNumber = parsePhoneNumberFromString(testInput)
    
    if (phoneNumber && phoneNumber.country) {
      return {
        countryCode: phoneNumber.countryCallingCode ? `+${phoneNumber.countryCallingCode}` : null,
        countryISO: phoneNumber.country || null,
        formattedNumber: phoneNumber.format('E.164'), // E.164 format
        localFormat: phoneNumber.formatNational(), // Local format
        isValid: phoneNumber.isValid(),
        nationalNumber: phoneNumber.nationalNumber
      }
    }
  } catch (error) {
    console.error('Error with libphonenumber-js fallback:', error)
  }

  return {
    countryCode: null,
    countryISO: null,
    formattedNumber: null,
    localFormat: null,
    isValid: false,
    nationalNumber: digitsOnly
  }
}

/**
 * Validates and normalizes a phone number using the 'phone' package
 * Returns E.164 format for storage and local format for display
 */
export function validatePhoneNumber(phoneNumber: string, defaultCountry?: CountryCode): {
  isValid: boolean
  formatted?: string // E.164 format for storage
  localFormat?: string // Local format for display
  error?: string
  countryISO?: string
} {
  try {
    if (!phoneNumber.trim()) {
      return { isValid: false, error: 'Phone number is required' }
    }

    // First try detection from operator prefixes
    const detection = detectCountryFromPhoneNumber(phoneNumber)
    if (detection.isValid && detection.formattedNumber) {
      return {
        isValid: true,
        formatted: detection.formattedNumber, // E.164 format
        localFormat: detection.localFormat || undefined, // Local format
        countryISO: detection.countryISO || undefined
      }
    }

    // Fallback to 'phone' package for validation and normalization
    const result = phone(phoneNumber, { country: defaultCountry })
    
    if (result.isValid) {
      // Get local format
      let localFormat: string | undefined
      try {
        const parsed = parsePhoneNumberFromString(result.phoneNumber)
        if (parsed) {
          localFormat = parsed.formatNational()
        }
      } catch {
        // Use national number as fallback
        localFormat = result.phoneNumber.replace(result.countryCode || '', '')
      }

      return {
        isValid: true,
        formatted: result.phoneNumber, // E.164 format
        localFormat: localFormat, // Local format
        countryISO: result.countryIso2?.toUpperCase()
      }
    }

    return { isValid: false, error: 'Please enter a valid phone number' }
  } catch (error) {
    // Fallback to libphonenumber-js
    try {
      const parsed = parsePhoneNumberFromString(phoneNumber, defaultCountry)
      
      if (parsed && parsed.isValid()) {
        return {
          isValid: true,
          formatted: parsed.format('E.164'), // E.164 format
          localFormat: parsed.formatNational(), // Local format
          countryISO: parsed.country || undefined
        }
      }
    } catch {
      // Both methods failed
    }

    return { isValid: false, error: 'Invalid phone number format' }
  }
}

/**
 * Extracts country code from E.164 phone number
 */
export function extractCountryCode(phoneNumber: string): string | null {
  if (!phoneNumber || !phoneNumber.startsWith('+')) {
    return null
  }
  
  try {
    const detection = detectCountryFromPhoneNumber(phoneNumber)
    if (detection.countryCode) {
      return detection.countryCode
    }
    
    // Fallback: try with phone package
    const result = phone(phoneNumber)
    if (result.isValid && result.countryCode) {
      return result.countryCode
    }
    
    // Last resort: try parsing manually
    const parsed = parsePhoneNumberFromString(phoneNumber)
    if (parsed && parsed.countryCallingCode) {
      return `+${parsed.countryCallingCode}`
    }
    
    return null
  } catch (error) {
    return null
  }
}

/**
 * Formats a phone number for display with country code
 * Returns format: "+20 10 1234 5678" (country code + local format)
 */
export function formatPhoneWithCountryCode(phoneNumber: string, countryISO?: string): string {
  if (!phoneNumber) return ''
  
  try {
    // If number already includes country code in display format, return as is
    if (phoneNumber.includes(' ') && phoneNumber.startsWith('+')) {
      // Check if it's already formatted (has space after country code)
      const parts = phoneNumber.split(' ')
      if (parts.length >= 2 && parts[0].startsWith('+') && parts[0].length <= 5) {
        return phoneNumber // Already formatted
      }
    }
    
    const countryCode = extractCountryCode(phoneNumber)
    
    // If no country code found and number doesn't start with +, return as is
    if (!countryCode && !phoneNumber.startsWith('+')) {
      return phoneNumber
    }
    
    // Get local format
    let localFormat = ''
    if (phoneNumber.startsWith('+')) {
      const parsed = parsePhoneNumberFromString(phoneNumber, countryISO as CountryCode)
      if (parsed && parsed.isValid()) {
        localFormat = parsed.formatNational()
      } else {
        // Fallback: extract national number using phone package
        const result = phone(phoneNumber)
        if (result.isValid && result.countryCode) {
          // Remove country code to get national number
          const national = result.phoneNumber.replace(result.countryCode, '').trim()
          // Try to format it nicely
          localFormat = national
        } else {
          // Last resort: manually remove country code
          localFormat = phoneNumber.replace(/^\+\d{1,4}/, '').trim()
        }
      }
    } else {
      localFormat = phoneNumber
    }
    
    // Remove leading zero from local format when country code is present
    // This prevents redundant display like "+20 01012345678" -> "+20 1012345678"
    if (countryCode && localFormat) {
      // Remove leading zeros (but keep at least one digit)
      localFormat = localFormat.replace(/^0+/, '') || localFormat
    }
    
    // Combine country code with local format
    if (countryCode && localFormat) {
      // Ensure clean spacing
      return `${countryCode} ${localFormat.trim()}`
    } else if (countryCode) {
      return countryCode
    } else if (phoneNumber.startsWith('+')) {
      // If we have E.164 but couldn't extract code, show as is
      return phoneNumber
    } else {
      return localFormat || phoneNumber
    }
  } catch (error) {
    // If all formatting fails, return original
    return phoneNumber
  }
}

/**
 * Formats a phone number for display (local format only)
 * If the number is in E.164 format, converts to local format
 */
export function formatPhoneForDisplay(phoneNumber: string, countryISO?: string): string {
  if (!phoneNumber) return ''
  
  try {
    // If already in local format (doesn't start with +), return as is
    if (!phoneNumber.startsWith('+')) {
      return phoneNumber
    }
    
    // Parse and format as national/local format
    const parsed = parsePhoneNumberFromString(phoneNumber, countryISO as CountryCode)
    if (parsed && parsed.isValid()) {
      return parsed.formatNational()
    }
    
    // Fallback: try with phone package
    const result = phone(phoneNumber)
    if (result.isValid) {
      const parsed2 = parsePhoneNumberFromString(result.phoneNumber)
      if (parsed2) {
        return parsed2.formatNational()
      }
      // Last resort: return national number
      return result.phoneNumber.replace(result.countryCode || '', '')
    }
    
    return phoneNumber
  } catch (error) {
    // If all formatting fails, return original
    return phoneNumber
  }
}

/**
 * Checks if a phone number is registered on WhatsApp
 * Simple check when user enters a phone number in the contact form
 * Uses a workaround method to check WhatsApp availability
 * 
 * @param phoneNumber - Phone number in any format (local, E.164, or with country code)
 * @returns Promise<{ hasWhatsApp: boolean; error?: string }>
 */
export async function checkWhatsAppAvailability(
  phoneNumber: string
): Promise<{ hasWhatsApp: boolean; error?: string }> {
  try {
    if (!phoneNumber || !phoneNumber.trim()) {
      return { hasWhatsApp: false, error: 'Phone number is required' }
    }

    // Clean and format the phone number
    const cleanedInput = phoneNumber.trim()
    let formattedNumber: string | null = null
    
    // Format to E.164
    if (cleanedInput.startsWith('+')) {
      const normalized = phone(cleanedInput)
      if (normalized.isValid) {
        formattedNumber = normalized.phoneNumber
      }
    }
    
    if (!formattedNumber) {
      const detection = detectCountryFromPhoneNumber(cleanedInput)
      if (detection.isValid && detection.formattedNumber) {
        formattedNumber = detection.formattedNumber
      }
    }
    
    if (!formattedNumber) {
      const validation = validatePhoneNumber(cleanedInput)
      if (validation.isValid && validation.formatted) {
        formattedNumber = validation.formatted
      }
    }
    
    if (!formattedNumber) {
      const normalized = phone(cleanedInput)
      if (normalized.isValid) {
        formattedNumber = normalized.phoneNumber
      }
    }

    if (!formattedNumber) {
      return { hasWhatsApp: false, error: 'Invalid phone number format' }
    }

    // Remove + and spaces for the check
    const numberDigits = formattedNumber.replace(/\D/g, '')
    
    console.log('🔍 Checking if contact number has WhatsApp:', { 
      original: phoneNumber, 
      formatted: formattedNumber,
      digits: numberDigits
    })

    // Client-side WhatsApp checking workaround
    // Since direct API calls are blocked by CORS, we use a simple method:
    // Try to fetch the WhatsApp link via a public CORS proxy
    // If that fails, we gracefully return unknown status
    
    try {
      // Try using a public CORS proxy (some may be unreliable)
      const proxyServices = [
        `https://corsproxy.io/?${encodeURIComponent(`https://wa.me/${numberDigits}`)}`,
      ]
      
      for (const proxyUrl of proxyServices) {
        try {
          const response = await fetch(proxyUrl, {
            method: 'GET',
            mode: 'cors',
            cache: 'no-cache',
          })
          
          if (response.ok) {
            const html = await response.text()
            
            // Simple check: if page contains WhatsApp elements, number likely exists
            const hasWhatsApp = 
              html.includes('WhatsApp') && 
              (html.includes('send') || html.includes('message') || html.includes('chat'))
            
            console.log('✅ WhatsApp check result:', hasWhatsApp ? 'Has WhatsApp' : 'No WhatsApp')
            return { hasWhatsApp }
          }
        } catch (proxyError) {
          // Try next proxy or fall through
          continue
        }
      }
    } catch (error) {
      // Silently fail - return unknown status
    }
    
    // If all methods fail, return unknown (not an error)
    // UI will show this as "unknown" status, not an error
    return { 
      hasWhatsApp: false,
      // No error message - just can't determine automatically
    }
  } catch (error: any) {
    console.error('Error checking WhatsApp availability:', error)
    return { hasWhatsApp: false, error: error.message || 'Failed to check WhatsApp availability' }
  }
}

/**
 * Gets country ISO code from country calling code using 'phone' package
 */
export function getCountryISOFromCallingCode(callingCode: string): string | null {
  try {
    // Use 'phone' package to detect country from calling code
    const codeWithoutPlus = callingCode.replace('+', '')
    const sampleNumber = `+${codeWithoutPlus}1234567890`
    const result = phone(sampleNumber)
    
    if (result.isValid && result.countryIso2) {
      return result.countryIso2.toUpperCase()
    }
  } catch {
    // Fallback to libphonenumber-js
    try {
      const codeWithoutPlus = callingCode.replace('+', '')
      const sampleNumber = `+${codeWithoutPlus}1234567890`
      const parsed = parsePhoneNumberFromString(sampleNumber)
      
      if (parsed && parsed.country) {
        return parsed.country
      }
    } catch {
      // Both methods failed
    }
  }
  
  return null
}

/**
 * Gets carrier/network operator information from phone number
 */
export function getCarrierFromPhoneNumber(phoneNumber: string): string | null {
  try {
    // First normalize the number
    const normalized = phone(phoneNumber)
    
    if (!normalized.isValid) {
      return null
    }

    // Use mobile-carriers package to find the network operator
    // findNetworkByPhoneNumber requires phone number and country code
    if (normalized.countryCode) {
      const carrier = findNetworkByPhoneNumber(normalized.phoneNumber, normalized.countryCode)
      return carrier || null
    }
    return null
  } catch (error) {
    console.error('Error getting carrier from phone number:', error)
    return null
  }
}
