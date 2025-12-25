'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { toast } from 'react-toastify'
import { useAuth } from '@/lib/hooks/useAuth'
import { createClient } from '@/lib/supabase/client'
import { 
  Lock, Bell, Eye, Globe, Moon, Sun, Trash2, 
  Shield, Smartphone, Mail, Loader2, AlertTriangle,
  ChevronRight, Check
} from 'lucide-react'

const PASSWORD_CHANGED_KEY = 'gmqg_password_changed_at'

function getPasswordChangedDate(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(PASSWORD_CHANGED_KEY)
}

function setPasswordChangedDate(date: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(PASSWORD_CHANGED_KEY, date)
  }
}

function formatPasswordDate(dateString: string | null): string {
  if (!dateString) return 'Never changed'
  
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - date.getTime())
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return 'Changed today'
  if (diffDays === 1) return 'Changed yesterday'
  if (diffDays < 7) return `Changed ${diffDays} days ago`
  if (diffDays < 30) return `Changed ${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`
  if (diffDays < 365) return `Changed ${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? 's' : ''} ago`
  return `Changed ${Math.floor(diffDays / 365)} year${Math.floor(diffDays / 365) > 1 ? 's' : ''} ago`
}

export default function SettingsPage() {
  const { user, signOut } = useAuth()
  const supabase = createClient()
  
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [isSendingResetEmail, setIsSendingResetEmail] = useState(false)
  const [resetEmailSent, setResetEmailSent] = useState(false)
  const [passwordChangedAt, setPasswordChangedAt] = useState<string | null>(null)
  
  const [notifications, setNotifications] = useState({
    orderUpdates: true,
    promotions: false,
    newsletter: true,
    security: true,
  })

  useEffect(() => {
    // Load password changed date from localStorage
    const savedDate = getPasswordChangedDate()
    setPasswordChangedAt(savedDate)
  }, [])

  const handleSendPasswordResetEmail = async () => {
    if (!user?.email) {
      toast.error('No email address found')
      return
    }

    setIsSendingResetEmail(true)
    try {
      const getURL = () => {
        let url =
          process?.env?.NEXT_PUBLIC_SITE_URL ??
          process?.env?.NEXT_PUBLIC_VERCEL_URL ??
          'http://localhost:3000/'
        url = url.startsWith('http') ? url : `https://${url}`
        url = url.endsWith('/') ? url : `${url}/`
        return url
      }

      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${getURL()}auth/callback?next=/reset-password`,
      })

      if (error) {
        toast.error(error.message)
        return
      }

      setResetEmailSent(true)
      toast.success('Password reset link sent to your email!')
      
      // Update the password changed date when they complete the reset
      // This will be updated when they actually change the password
    } catch (error) {
      toast.error('Failed to send reset email')
    } finally {
      setIsSendingResetEmail(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return
    }
    
    // In production, implement account deletion with proper cleanup
    toast.info('Account deletion is not yet implemented')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Security Section */}
      <div className="bg-card border border-border/50 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="font-semibold">Security</h2>
              <p className="text-xs text-muted-foreground">Manage your password and security settings</p>
            </div>
          </div>
        </div>

        <div className="divide-y divide-border/50">
          {/* Change Password */}
          <div className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium text-sm">Password</p>
                  <p className="text-xs text-muted-foreground">{formatPasswordDate(passwordChangedAt)}</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsChangingPassword(!isChangingPassword)}
                className='cursor-pointer'
              >
                {isChangingPassword ? 'Cancel' : 'Change'}
              </Button>
            </div>

            {isChangingPassword && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 space-y-4"
              >
                {!resetEmailSent ? (
                  <>
                    <p className="text-sm text-muted-foreground">
                      For security, we&apos;ll send a password reset link to your email address: <strong>{user?.email}</strong>
                    </p>
                    <Button 
                      onClick={handleSendPasswordResetEmail}
                      disabled={isSendingResetEmail}
                      className="w-full"
                    >
                      {isSendingResetEmail && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Send Password Reset Link
                    </Button>
                  </>
                ) : (
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/50 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                        <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="font-medium text-sm text-green-800 dark:text-green-300">Check your email</p>
                        <p className="text-xs text-green-700 dark:text-green-400 mt-1">
                          We&apos;ve sent a password reset link to <strong>{user?.email}</strong>. 
                          Click the link in the email to set your new password.
                        </p>
                        <Button 
                          variant="link" 
                          size="sm" 
                          className="p-0 h-auto mt-2 text-green-700 dark:text-green-400"
                          onClick={() => {
                            setResetEmailSent(false)
                            handleSendPasswordResetEmail()
                          }}
                        >
                          Didn&apos;t receive it? Send again
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </div>

          {/* Two-Factor Auth */}
          {/* <div className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium text-sm">Two-Factor Authentication</p>
                  <p className="text-xs text-muted-foreground">Add an extra layer of security</p>
                </div>
              </div>
              <Button variant="outline" size="sm" disabled>
                Coming Soon
              </Button>
            </div>
          </div> */}

          {/* Active Sessions */}
          {/* <div className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Eye className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium text-sm">Active Sessions</p>
                  <p className="text-xs text-muted-foreground">Manage your logged-in devices</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </div>
          </div> */}
        </div>
      </div>

      {/* Notifications Section */}
      <div className="bg-card border border-border/50 rounded-2xl overflow-hidden" id='notifications'>
        <div className="p-5 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <Bell className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h2 className="font-semibold">Notifications</h2>
              <p className="text-xs text-muted-foreground">Choose what updates you receive</p>
            </div>
          </div>
        </div>

        <div className="divide-y divide-border/50">
          {[
            { key: 'orderUpdates', label: 'Order Updates', desc: 'Get notified about your order status', icon: Mail },
            { key: 'promotions', label: 'Promotions', desc: 'Receive offers and discount codes', icon: Mail },
            { key: 'newsletter', label: 'Newsletter', desc: 'Weekly updates and new arrivals', icon: Mail },
            { key: 'security', label: 'Security Alerts', desc: 'Important account security notifications', icon: Shield },
          ].map((item) => (
            <div key={item.key} className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <item.icon className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
                <button
                  onClick={() => setNotifications(prev => ({ 
                    ...prev, 
                    [item.key]: !prev[item.key as keyof typeof notifications] 
                  }))}
                  className={`w-11 h-6 rounded-full transition-colors relative ${
                    notifications[item.key as keyof typeof notifications]
                      ? 'bg-primary'
                      : 'bg-muted'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white shadow-sm absolute top-0.5 transition-transform ${
                    notifications[item.key as keyof typeof notifications]
                      ? 'translate-x-[22px]'
                      : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Preferences Section */}
      

      {/* Danger Zone */}
      <div className="bg-card border border-red-200 dark:border-red-900/50 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h2 className="font-semibold text-red-600 dark:text-red-400">Danger Zone</h2>
              <p className="text-xs text-red-600/70 dark:text-red-400/70">Irreversible actions</p>
            </div>
          </div>
        </div>

        <div className="p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Trash2 className="w-5 h-5 text-red-500" />
              <div>
                <p className="font-medium text-sm">Delete Account</p>
                <p className="text-xs text-muted-foreground">Permanently delete your account and all data</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-900/50 dark:hover:bg-red-900/20"
              onClick={handleDeleteAccount}
            >
              Delete
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
