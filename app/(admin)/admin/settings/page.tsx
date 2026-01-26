'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Store,
  Mail,
  Phone,
  MapPin,
  Globe,
  CreditCard,
  Truck,
  Bell,
  Shield,
  Users,
  Save,
  Upload,
  Palette,
  Receipt,
  MailOpen,
  Settings2
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Settings navigation
const settingsSections = [
  { id: 'general', name: 'General', icon: Store, description: 'Store name, contact info, address' },
  { id: 'payments', name: 'Payments', icon: CreditCard, description: 'Payment methods and gateways' },
  { id: 'shipping', name: 'Shipping', icon: Truck, description: 'Shipping zones and rates' },
  { id: 'notifications', name: 'Notifications', icon: Bell, description: 'Email and push notifications' },
  { id: 'taxes', name: 'Taxes', icon: Receipt, description: 'Tax rates and regions' },
  { id: 'team', name: 'Team', icon: Users, description: 'Staff accounts and permissions' },
  { id: 'security', name: 'Security', icon: Shield, description: 'Two-factor, sessions' },
]

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('general')
  const [isSaving, setIsSaving] = useState(false)
  
  // General settings state
  const [generalSettings, setGeneralSettings] = useState({
    storeName: 'Global Edge',
    storeEmail: 'support@globaledgeshop.com',
    storePhone: '+90 533 844 57 88',
    storeAddress: 'UAE, Sharjah, Al Majaz',
    storeCity: 'Sharjah',
    storeCountry: 'UAE',
    currency: 'AED',
    timezone: 'Asia/Dubai',
    language: 'en'
  })

  // Payment settings state
  const [paymentSettings, setPaymentSettings] = useState({
    enableCOD: true,
    enableCard: true,
    enableApplePay: false,
    enablePaypal: false,
    stripePublicKey: 'pk_test_...',
    stripeSecretKey: 'sk_test_...',
    codFee: 10
  })

  // Shipping settings state
  const [shippingSettings, setShippingSettings] = useState({
    freeShippingThreshold: 200,
    flatRate: 25,
    expressRate: 50,
    enableLocalPickup: true,
    pickupAddress: 'UAE, Sharjah, Al Majaz'
  })

  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState({
    orderConfirmation: true,
    orderShipped: true,
    orderDelivered: true,
    lowStockAlert: true,
    newCustomerAlert: true,
    dailyReportEmail: false,
    weeklyReportEmail: true,
    adminEmail: 'support@globaledgeshop.com'
  })

  const handleSave = async () => {
    setIsSaving(true)
    // TODO: Implement API call to save settings
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsSaving(false)
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your store settings and preferences
          </p>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <span className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Settings Navigation */}
        <Card className="lg:col-span-1">
          <CardContent className="p-4">
            <nav className="space-y-1">
              {settingsSections.map((section) => {
                const Icon = section.icon
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors",
                      activeSection === section.id
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-gray-100 dark:hover:bg-gray-800"
                    )}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm">{section.name}</p>
                      <p className={cn(
                        "text-xs",
                        activeSection === section.id
                          ? "text-primary-foreground/70"
                          : "text-muted-foreground"
                      )}>
                        {section.description}
                      </p>
                    </div>
                  </button>
                )
              })}
            </nav>
          </CardContent>
        </Card>

        {/* Settings Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* General Settings */}
          {activeSection === 'general' && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Store Information</CardTitle>
                  <CardDescription>
                    Basic information about your store
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Store Name</label>
                      <Input
                        value={generalSettings.storeName}
                        onChange={(e) => setGeneralSettings(prev => ({ ...prev, storeName: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Contact Email</label>
                      <Input
                        type="email"
                        value={generalSettings.storeEmail}
                        onChange={(e) => setGeneralSettings(prev => ({ ...prev, storeEmail: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Phone Number</label>
                      <Input
                        value={generalSettings.storePhone}
                        onChange={(e) => setGeneralSettings(prev => ({ ...prev, storePhone: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Country</label>
                      <Select
                        value={generalSettings.storeCountry}
                        onValueChange={(value) => setGeneralSettings(prev => ({ ...prev, storeCountry: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="UAE">United Arab Emirates</SelectItem>
                          <SelectItem value="SA">Saudi Arabia</SelectItem>
                          <SelectItem value="QA">Qatar</SelectItem>
                          <SelectItem value="KW">Kuwait</SelectItem>
                          <SelectItem value="BH">Bahrain</SelectItem>
                          <SelectItem value="OM">Oman</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Store Address</label>
                    <Input
                      value={generalSettings.storeAddress}
                      onChange={(e) => setGeneralSettings(prev => ({ ...prev, storeAddress: e.target.value }))}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Localization</CardTitle>
                  <CardDescription>
                    Currency, timezone, and language settings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Currency</label>
                      <Select
                        value={generalSettings.currency}
                        onValueChange={(value) => setGeneralSettings(prev => ({ ...prev, currency: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="AED">AED - UAE Dirham</SelectItem>
                          <SelectItem value="SAR">SAR - Saudi Riyal</SelectItem>
                          <SelectItem value="USD">USD - US Dollar</SelectItem>
                          <SelectItem value="EUR">EUR - Euro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Timezone</label>
                      <Select
                        value={generalSettings.timezone}
                        onValueChange={(value) => setGeneralSettings(prev => ({ ...prev, timezone: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Asia/Dubai">Dubai (GMT+4)</SelectItem>
                          <SelectItem value="Asia/Riyadh">Riyadh (GMT+3)</SelectItem>
                          <SelectItem value="UTC">UTC</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Language</label>
                      <Select
                        value={generalSettings.language}
                        onValueChange={(value) => setGeneralSettings(prev => ({ ...prev, language: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="ar">Arabic</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Store Logo</CardTitle>
                  <CardDescription>
                    Upload your store logo (displayed in header and emails)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div className="h-24 w-24 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center">
                      <Store className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <div className="space-y-2">
                      <Button variant="outline">
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Logo
                      </Button>
                      <p className="text-xs text-muted-foreground">
                        Recommended: 200x200px PNG or SVG
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Payment Settings */}
          {activeSection === 'payments' && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Payment Methods</CardTitle>
                  <CardDescription>
                    Enable or disable payment methods for your store
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <CreditCard className="h-5 w-5" />
                      <div>
                        <p className="font-medium">Credit/Debit Cards</p>
                        <p className="text-sm text-muted-foreground">Visa, Mastercard, Amex</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={paymentSettings.enableCard}
                        onChange={(e) => setPaymentSettings(prev => ({ ...prev, enableCard: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <Truck className="h-5 w-5" />
                      <div>
                        <p className="font-medium">Cash on Delivery</p>
                        <p className="text-sm text-muted-foreground">Pay when order arrives</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={paymentSettings.enableCOD}
                        onChange={(e) => setPaymentSettings(prev => ({ ...prev, enableCOD: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>

                  {paymentSettings.enableCOD && (
                    <div className="ml-12 space-y-2">
                      <label className="text-sm font-medium">COD Fee (AED)</label>
                      <Input
                        type="number"
                        value={paymentSettings.codFee}
                        onChange={(e) => setPaymentSettings(prev => ({ ...prev, codFee: Number(e.target.value) }))}
                        className="w-32"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Stripe Settings</CardTitle>
                  <CardDescription>
                    Configure Stripe for card payments
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Publishable Key</label>
                    <Input
                      value={paymentSettings.stripePublicKey}
                      onChange={(e) => setPaymentSettings(prev => ({ ...prev, stripePublicKey: e.target.value }))}
                      placeholder="pk_test_..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Secret Key</label>
                    <Input
                      type="password"
                      value={paymentSettings.stripeSecretKey}
                      onChange={(e) => setPaymentSettings(prev => ({ ...prev, stripeSecretKey: e.target.value }))}
                      placeholder="sk_test_..."
                    />
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Shipping Settings */}
          {activeSection === 'shipping' && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Shipping Rates</CardTitle>
                  <CardDescription>
                    Configure shipping rates for your store
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Free Shipping Threshold (AED)</label>
                      <Input
                        type="number"
                        value={shippingSettings.freeShippingThreshold}
                        onChange={(e) => setShippingSettings(prev => ({ ...prev, freeShippingThreshold: Number(e.target.value) }))}
                      />
                      <p className="text-xs text-muted-foreground">
                        Orders above this amount get free shipping
                      </p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Flat Rate (AED)</label>
                      <Input
                        type="number"
                        value={shippingSettings.flatRate}
                        onChange={(e) => setShippingSettings(prev => ({ ...prev, flatRate: Number(e.target.value) }))}
                      />
                      <p className="text-xs text-muted-foreground">
                        Standard shipping rate
                      </p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Express Rate (AED)</label>
                      <Input
                        type="number"
                        value={shippingSettings.expressRate}
                        onChange={(e) => setShippingSettings(prev => ({ ...prev, expressRate: Number(e.target.value) }))}
                      />
                      <p className="text-xs text-muted-foreground">
                        Same-day/next-day delivery rate
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Local Pickup</CardTitle>
                  <CardDescription>
                    Allow customers to pick up orders from your location
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Enable Local Pickup</p>
                      <p className="text-sm text-muted-foreground">
                        Customers can choose to pick up their orders
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={shippingSettings.enableLocalPickup}
                        onChange={(e) => setShippingSettings(prev => ({ ...prev, enableLocalPickup: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>

                  {shippingSettings.enableLocalPickup && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Pickup Address</label>
                      <Input
                        value={shippingSettings.pickupAddress}
                        onChange={(e) => setShippingSettings(prev => ({ ...prev, pickupAddress: e.target.value }))}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}

          {/* Notification Settings */}
          {activeSection === 'notifications' && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Email Notifications</CardTitle>
                  <CardDescription>
                    Configure which email notifications to send
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Admin Email</label>
                    <Input
                      type="email"
                      value={notificationSettings.adminEmail}
                      onChange={(e) => setNotificationSettings(prev => ({ ...prev, adminEmail: e.target.value }))}
                    />
                    <p className="text-xs text-muted-foreground">
                      Where admin notifications will be sent
                    </p>
                  </div>

                  <div className="space-y-3 pt-4">
                    <p className="font-medium text-sm">Customer Notifications</p>
                    {[
                      { key: 'orderConfirmation', label: 'Order Confirmation', desc: 'When order is placed' },
                      { key: 'orderShipped', label: 'Order Shipped', desc: 'When order is shipped' },
                      { key: 'orderDelivered', label: 'Order Delivered', desc: 'When order is delivered' },
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between p-3 rounded-lg border">
                        <div>
                          <p className="font-medium text-sm">{item.label}</p>
                          <p className="text-xs text-muted-foreground">{item.desc}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={notificationSettings[item.key as keyof typeof notificationSettings] as boolean}
                            onChange={(e) => setNotificationSettings(prev => ({ ...prev, [item.key]: e.target.checked }))}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3 pt-4">
                    <p className="font-medium text-sm">Admin Notifications</p>
                    {[
                      { key: 'lowStockAlert', label: 'Low Stock Alert', desc: 'When product stock is low' },
                      { key: 'newCustomerAlert', label: 'New Customer', desc: 'When new customer registers' },
                      { key: 'dailyReportEmail', label: 'Daily Report', desc: 'Daily sales summary' },
                      { key: 'weeklyReportEmail', label: 'Weekly Report', desc: 'Weekly sales summary' },
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between p-3 rounded-lg border">
                        <div>
                          <p className="font-medium text-sm">{item.label}</p>
                          <p className="text-xs text-muted-foreground">{item.desc}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={notificationSettings[item.key as keyof typeof notificationSettings] as boolean}
                            onChange={(e) => setNotificationSettings(prev => ({ ...prev, [item.key]: e.target.checked }))}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Taxes Settings */}
          {activeSection === 'taxes' && (
            <Card>
              <CardHeader>
                <CardTitle>Tax Settings</CardTitle>
                <CardDescription>
                  Configure tax rates for your store
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">VAT Rate (%)</label>
                    <Input type="number" defaultValue="5" />
                    <p className="text-xs text-muted-foreground">
                      Standard VAT rate in UAE
                    </p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tax Included in Prices</label>
                    <Select defaultValue="yes">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">Yes - Prices include tax</SelectItem>
                        <SelectItem value="no">No - Tax added at checkout</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Team Settings */}
          {activeSection === 'team' && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Team Members</CardTitle>
                    <CardDescription>
                      Manage staff accounts and permissions
                    </CardDescription>
                  </div>
                  <Button>
                    <Users className="mr-2 h-4 w-4" />
                    Add Member
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                        A
                      </div>
                      <div>
                        <p className="font-medium">Admin User</p>
                        <p className="text-sm text-muted-foreground">admin@globaledge.ae</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                        Owner
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Security Settings */}
          {activeSection === 'security' && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Two-Factor Authentication</CardTitle>
                  <CardDescription>
                    Add an extra layer of security to your account
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Enable 2FA</p>
                      <p className="text-sm text-muted-foreground">
                        Require verification code when signing in
                      </p>
                    </div>
                    <Button variant="outline">
                      <Shield className="mr-2 h-4 w-4" />
                      Set Up
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Active Sessions</CardTitle>
                  <CardDescription>
                    Manage your active login sessions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg border">
                      <div>
                        <p className="font-medium">Current Session</p>
                        <p className="text-sm text-muted-foreground">Windows • Chrome • Dubai, UAE</p>
                        <p className="text-xs text-muted-foreground">Started: Today at 9:00 AM</p>
                      </div>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        Active
                      </span>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full mt-4">
                    Sign Out All Other Sessions
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Password</CardTitle>
                  <CardDescription>
                    Change your account password
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Current Password</label>
                    <Input type="password" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">New Password</label>
                    <Input type="password" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Confirm New Password</label>
                    <Input type="password" />
                  </div>
                  <Button>Update Password</Button>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
