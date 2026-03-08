'use client'

import { useState, useEffect, useRef } from 'react'
import { Phone, Loader2, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react'
import { sendPhoneOTP, verifyPhoneOTP, validateUAEPhoneFormat } from '@/lib/actions/phone.actions'
import { cn } from '@/lib/utils'

interface PhoneVerificationProps {
  phone: string
  onVerified: () => void
  onPhoneChange: (phone: string) => void
  className?: string
}

export default function PhoneVerification({
  phone,
  onVerified,
  onPhoneChange,
  className
}: PhoneVerificationProps) {
  const [step, setStep] = useState<'input' | 'verify' | 'verified'>('input')
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [error, setError] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [sessionId, setSessionId] = useState('')
  const [countdown, setCountdown] = useState(0)
  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([])
  
  // Phone validation
  const phoneValidation = validateUAEPhoneFormat(phone)
  
  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])
  
  // Handle sending OTP
  const handleSendOTP = async () => {
    if (!phoneValidation.isValid) {
      setError(phoneValidation.error || 'Invalid phone number')
      return
    }
    
    setStatus('loading')
    setError('')
    
    const result = await sendPhoneOTP(phone)
    
    if (result.success && result.verificationId) {
      setSessionId(result.verificationId)
      setStep('verify')
      setCountdown(60) // 60 second cooldown
      // Focus first OTP input
      setTimeout(() => otpInputsRef.current[0]?.focus(), 100)
    } else {
      setError(result.error || 'Failed to send verification code')
    }
    setStatus('idle')
  }
  
  // Handle OTP input change
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return // Only allow digits
    
    const newOtp = [...otp]
    newOtp[index] = value.slice(-1) // Only keep last digit
    setOtp(newOtp)
    
    // Auto-focus next input
    if (value && index < 5) {
      otpInputsRef.current[index + 1]?.focus()
    }
    
    // Auto-verify when all digits entered
    if (newOtp.every(d => d !== '') && newOtp.join('').length === 6) {
      verifyOTP(newOtp.join(''))
    }
  }
  
  // Handle OTP keydown
  const handleOtpKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus()
    }
  }
  
  // Handle OTP paste
  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pastedData.length === 6) {
      const newOtp = pastedData.split('')
      setOtp(newOtp)
      verifyOTP(pastedData)
    }
  }
  
  // Verify OTP
  const verifyOTP = async (otpCode: string) => {
    setStatus('loading')
    setError('')
    
    const result = await verifyPhoneOTP(phone, otpCode, sessionId)
    
    if (result.success && result.verified) {
      setStep('verified')
      onVerified()
    } else {
      setError(result.error || 'Invalid verification code')
      setOtp(['', '', '', '', '', ''])
      otpInputsRef.current[0]?.focus()
    }
    setStatus('idle')
  }
  
  // Resend OTP
  const handleResend = () => {
    setOtp(['', '', '', '', '', ''])
    handleSendOTP()
  }
  
  return (
    <div className={cn("space-y-4", className)}>
      {/* Phone Input Step */}
      {step === 'input' && (
        <div className="space-y-3">
          <label className="block text-sm font-medium text-[#5A6B5E]">
            UAE Phone Number <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5A6B5E]">
                🇦🇪
              </span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => onPhoneChange(e.target.value)}
                placeholder="+971 5X XXX XXXX"
                className={cn(
                  "w-full pl-12 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all",
                  phoneValidation.isValid 
                    ? "border-[#9DBE91] focus:ring-[#9DBE91]/30" 
                    : "border-gray-200 focus:ring-[#9DBE91]/30 focus:border-[#9DBE91]"
                )}
              />
              {phone && (
                <span className="absolute right-4 top-1/2 -translate-y-1/2">
                  {phoneValidation.isValid ? (
                    <CheckCircle className="w-5 h-5 text-[#9DBE91]" />
                  ) : null}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={handleSendOTP}
              disabled={!phoneValidation.isValid || status === 'loading'}
              className="px-4 py-3 bg-[#1B3022] text-white rounded-lg hover:bg-[#2a4633] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
            >
              {status === 'loading' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Phone className="w-4 h-4" />
              )}
              <span>Verify</span>
            </button>
          </div>
          
          {error && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {error}
            </p>
          )}
          
          <p className="text-xs text-[#5A6B5E]">
            We&apos;ll send a verification code to this number
          </p>
        </div>
      )}
      
      {/* OTP Verification Step */}
      {step === 'verify' && (
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="font-semibold text-[#1B3022]">Enter Verification Code</h3>
            <p className="text-sm text-[#5A6B5E] mt-1">
              We sent a 6-digit code to {phoneValidation.formatted}
            </p>
          </div>
          
          {/* OTP Input */}
          <div className="flex justify-center gap-2" onPaste={handleOtpPaste}>
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => { otpInputsRef.current[index] = el }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(e, index)}
                disabled={status === 'loading'}
                className={cn(
                  "w-12 h-14 text-center text-xl font-bold border-2 rounded-lg focus:outline-none focus:border-[#9DBE91] focus:ring-2 focus:ring-[#9DBE91]/30 transition-all",
                  digit ? "border-[#9DBE91] bg-[#9DBE91]/5" : "border-gray-200"
                )}
              />
            ))}
          </div>
          
          {error && (
            <p className="text-sm text-red-500 text-center flex items-center justify-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {error}
            </p>
          )}
          
          {status === 'loading' && (
            <div className="flex justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-[#9DBE91]" />
            </div>
          )}
          
          {/* Resend */}
          <div className="text-center">
            {countdown > 0 ? (
              <p className="text-sm text-[#5A6B5E]">
                Resend code in {countdown}s
              </p>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                className="text-sm text-[#9DBE91] hover:underline flex items-center gap-1 mx-auto"
              >
                <RefreshCw className="w-4 h-4" />
                Resend Code
              </button>
            )}
          </div>
          
          {/* Change Number */}
          <button
            type="button"
            onClick={() => {
              setStep('input')
              setOtp(['', '', '', '', '', ''])
              setError('')
            }}
            className="w-full text-sm text-[#5A6B5E] hover:text-[#1B3022] transition-colors"
          >
            Change phone number
          </button>
        </div>
      )}
      
      {/* Verified Step */}
      {step === 'verified' && (
        <div className="flex items-center gap-3 p-4 bg-[#9DBE91]/10 border border-[#9DBE91]/30 rounded-lg">
          <CheckCircle className="w-6 h-6 text-[#9DBE91]" />
          <div>
            <p className="font-medium text-[#1B3022]">Phone Verified</p>
            <p className="text-sm text-[#5A6B5E]">{phoneValidation.formatted}</p>
          </div>
        </div>
      )}
    </div>
  )
}
