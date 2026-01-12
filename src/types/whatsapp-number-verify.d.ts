declare module 'whatsapp-number-verify' {
  export interface VerifyOptions {
    apiToken: string
    apiUrl?: string
  }

  export interface VerifyResult {
    exists?: boolean
    status?: string
    message?: string
  }

  export function verifyPhoneNumber(phoneNumber: string, options: VerifyOptions): Promise<VerifyResult>
}

