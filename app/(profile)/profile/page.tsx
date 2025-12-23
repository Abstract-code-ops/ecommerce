'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/lib/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { toast } from 'react-toastify'
import { createClient } from '@/lib/supabase/client'
import { 
  User, Mail, Phone, Calendar, Edit3, Save, X, 
  Camera, Shield, Bell, Loader2, CheckCircle2
} from 'lucide-react'

export default function ProfilePage() {
  const { user, isLoading } = useAuth()
  const supabase = createClient()
  
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    fullName: user?.user_metadata?.full_name || '',
    phone: user?.user_metadata?.phone || '',
  })

  // Update form data when user loads
  React.useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.user_metadata?.full_name || '',
        phone: user.user_metadata?.phone || '',
      })
    }
  }, [user])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: formData.fullName,
          phone: formData.phone,
        }
      })

      if (error) {
        toast.error(error.message)
        return
      }

      toast.success('Profile updated successfully')
      setIsEditing(false)
    } catch (error) {
      toast.error('Failed to update profile')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  const joinDate = user?.created_at 
    ? new Date(user.created_at).toLocaleDateString('en-US', { 
        month: 'long', 
        year: 'numeric' 
      })
    : 'Unknown'

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-border/50 rounded-2xl p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          {/* Avatar */}
          <div className="relative">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground text-3xl font-bold shadow-lg">
              {user?.user_metadata?.full_name?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <button className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-background border border-border shadow-md flex items-center justify-center hover:bg-muted transition-colors">
              <Camera className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          {/* User Info */}
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  {user?.user_metadata?.full_name || 'Welcome!'}
                </h1>
                <p className="text-muted-foreground">{user?.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="inline-flex items-center gap-1 text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-2 py-1 rounded-full">
                    <CheckCircle2 className="w-3 h-3" />
                    Verified
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Member since {joinDate}
                  </span>
                </div>
              </div>

              {!isEditing && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="hidden md:flex"
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Profile Details */}
      <div className="bg-card border border-border/50 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-border/50 flex items-center justify-between">
          <h2 className="font-semibold text-lg">Personal Information</h2>
          {isEditing ? (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(false)}
                disabled={isSaving}
              >
                <X className="w-4 h-4 mr-1" />
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-1" />
                )}
                Save
              </Button>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="md:hidden"
            >
              <Edit3 className="w-4 h-4" />
            </Button>
          )}
        </div>

        <div className="p-6 space-y-6">
          {/* Full Name */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <div className="flex items-center gap-3 text-muted-foreground">
              <User className="w-5 h-5" />
              <span className="text-sm font-medium">Full Name</span>
            </div>
            <div className="md:col-span-2">
              {isEditing ? (
                <Input
                  value={formData.fullName}
                  onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                  placeholder="Enter your full name"
                  className="max-w-md"
                />
              ) : (
                <span className="text-foreground">
                  {user?.user_metadata?.full_name || 'Not set'}
                </span>
              )}
            </div>
          </div>

          <Separator className="bg-border/50" />

          {/* Email */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <div className="flex items-center gap-3 text-muted-foreground">
              <Mail className="w-5 h-5" />
              <span className="text-sm font-medium">Email</span>
            </div>
            <div className="md:col-span-2">
              <span className="text-foreground">{user?.email}</span>
              <span className="ml-2 text-xs text-muted-foreground">(Cannot be changed)</span>
            </div>
          </div>

          <Separator className="bg-border/50" />

          {/* Phone */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <div className="flex items-center gap-3 text-muted-foreground">
              <Phone className="w-5 h-5" />
              <span className="text-sm font-medium">Phone</span>
            </div>
            <div className="md:col-span-2">
              {isEditing ? (
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Enter your phone number"
                  className="max-w-md"
                />
              ) : (
                <span className="text-foreground">
                  {user?.user_metadata?.phone || 'Not set'}
                </span>
              )}
            </div>
          </div>

          <Separator className="bg-border/50" />

          {/* Join Date */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <div className="flex items-center gap-3 text-muted-foreground">
              <Calendar className="w-5 h-5" />
              <span className="text-sm font-medium">Member Since</span>
            </div>
            <div className="md:col-span-2">
              <span className="text-foreground">{joinDate}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div
          whileHover={{ scale: 1.01 }}
          className="bg-card border border-border/50 rounded-2xl p-5 cursor-pointer hover:border-primary/30 transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold">Security Settings</h3>
              <p className="text-sm text-muted-foreground">Manage password & 2FA</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.01 }}
          className="bg-card border border-border/50 rounded-2xl p-5 cursor-pointer hover:border-primary/30 transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <Bell className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h3 className="font-semibold">Notifications</h3>
              <p className="text-sm text-muted-foreground">Email & push preferences</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}