'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  Calendar,
  Download,
  RefreshCw,
  Eye,
  Target,
  Percent
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Mock data for analytics
const overviewStats = [
  {
    title: 'Total Revenue',
    value: 'AED 125,430',
    change: '+12.5%',
    trend: 'up',
    previousValue: 'AED 111,490 last period',
    icon: DollarSign,
    color: 'green'
  },
  {
    title: 'Total Orders',
    value: '1,234',
    change: '+8.2%',
    trend: 'up',
    previousValue: '1,140 last period',
    icon: ShoppingCart,
    color: 'blue'
  },
  {
    title: 'Average Order Value',
    value: 'AED 101.65',
    change: '+3.8%',
    trend: 'up',
    previousValue: 'AED 97.93 last period',
    icon: Target,
    color: 'purple'
  },
  {
    title: 'Conversion Rate',
    value: '3.24%',
    change: '-0.4%',
    trend: 'down',
    previousValue: '3.28% last period',
    icon: Percent,
    color: 'orange'
  },
]

// Mock data for sales by category
const salesByCategory = [
  { category: 'Paper Bags', revenue: 45230, orders: 412, percentage: 36 },
  { category: 'Kraft Bags', revenue: 32150, orders: 298, percentage: 26 },
  { category: 'Gift Bags', revenue: 24890, orders: 245, percentage: 20 },
  { category: 'Eco Bags', revenue: 15400, orders: 189, percentage: 12 },
  { category: 'Custom Bags', revenue: 7760, orders: 90, percentage: 6 },
]

// Mock data for top products
const topProducts = [
  { name: 'Premium Paper Bags (50pc)', revenue: 37350, orders: 125, change: '+12%' },
  { name: 'Kraft Shopping Bags (100pc)', revenue: 26700, orders: 89, change: '+8%' },
  { name: 'Luxury Gift Bags (25pc)', revenue: 11421, orders: 65, change: '+15%' },
  { name: 'Eco-Friendly Bags (200pc)', revenue: 17280, orders: 43, change: '+5%' },
  { name: 'Custom Print Bags (75pc)', revenue: 15680, orders: 28, change: '-3%' },
]

// Mock data for monthly revenue
const monthlyRevenue = [
  { month: 'Jan', revenue: 45230, orders: 412 },
  { month: 'Feb', revenue: 52150, orders: 458 },
  { month: 'Mar', revenue: 48890, orders: 425 },
  { month: 'Apr', revenue: 55400, orders: 489 },
  { month: 'May', revenue: 62760, orders: 534 },
  { month: 'Jun', revenue: 58200, orders: 501 },
  { month: 'Jul', revenue: 64500, orders: 552 },
  { month: 'Aug', revenue: 71200, orders: 612 },
  { month: 'Sep', revenue: 68900, orders: 589 },
  { month: 'Oct', revenue: 75430, orders: 645 },
  { month: 'Nov', revenue: 82100, orders: 702 },
  { month: 'Dec', revenue: 125430, orders: 1234 },
]

// Mock data for customer acquisition
const customerMetrics = {
  newCustomers: 156,
  returningCustomers: 234,
  repeatPurchaseRate: '38.5%',
  customerLifetimeValue: 'AED 1,245',
  churnRate: '4.2%',
  averageTimeToSecondPurchase: '18 days'
}

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState('30days')

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            Track your store performance and insights
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="90days">Last 90 days</SelectItem>
              <SelectItem value="12months">Last 12 months</SelectItem>
              <SelectItem value="custom">Custom range</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {overviewStats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={cn(
                    "p-2 rounded-lg",
                    stat.color === 'green' && 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
                    stat.color === 'blue' && 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
                    stat.color === 'purple' && 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
                    stat.color === 'orange' && 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
                  )}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className={cn(
                    "flex items-center gap-1 text-sm font-medium",
                    stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  )}>
                    {stat.trend === 'up' ? (
                      <ArrowUpRight className="h-4 w-4" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4" />
                    )}
                    {stat.change}
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold">{stat.value}</h3>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.previousValue}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Revenue Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Revenue Overview</CardTitle>
              <CardDescription>Monthly revenue and order trends</CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-primary" />
                <span className="text-sm">Revenue</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-blue-400" />
                <span className="text-sm">Orders</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Chart placeholder - integrate with recharts or similar */}
          <div className="h-80 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="text-center">
              <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">Revenue Chart</p>
              <p className="text-sm text-muted-foreground">
                Monthly breakdown: {monthlyRevenue.map(m => m.month).join(', ')}
              </p>
            </div>
          </div>
          
          {/* Quick stats below chart */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t">
            <div>
              <p className="text-sm text-muted-foreground">Best Month</p>
              <p className="text-lg font-semibold">December</p>
              <p className="text-sm text-green-600">AED 125,430</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg Monthly Revenue</p>
              <p className="text-lg font-semibold">AED 67,516</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Orders (YTD)</p>
              <p className="text-lg font-semibold">6,653</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Growth Rate</p>
              <p className="text-lg font-semibold text-green-600">+24.5%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Sales by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Sales by Category</CardTitle>
            <CardDescription>Revenue breakdown by product category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {salesByCategory.map((category) => (
                <div key={category.category}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{category.category}</span>
                    <span className="text-sm text-muted-foreground">
                      AED {category.revenue.toLocaleString()} ({category.percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-500"
                      style={{ width: `${category.percentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {category.orders} orders
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Selling Products */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Top Selling Products</CardTitle>
                <CardDescription>Best performers this period</CardDescription>
              </div>
              <Button variant="ghost" size="sm">
                <Eye className="mr-2 h-4 w-4" />
                View all
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={product.name} className="flex items-center gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 font-semibold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{product.name}</p>
                    <p className="text-sm text-muted-foreground">{product.orders} orders</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">AED {product.revenue.toLocaleString()}</p>
                    <p className={cn(
                      "text-sm",
                      product.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                    )}>
                      {product.change}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Customer Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Insights</CardTitle>
          <CardDescription>Key customer acquisition and retention metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-6">
            <div className="text-center p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
              <p className="text-2xl font-bold">{customerMetrics.newCustomers}</p>
              <p className="text-sm text-muted-foreground">New Customers</p>
              <p className="text-xs text-green-600 mt-1">+12% vs last period</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
              <p className="text-2xl font-bold">{customerMetrics.returningCustomers}</p>
              <p className="text-sm text-muted-foreground">Returning Customers</p>
              <p className="text-xs text-green-600 mt-1">+8% vs last period</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
              <p className="text-2xl font-bold">{customerMetrics.repeatPurchaseRate}</p>
              <p className="text-sm text-muted-foreground">Repeat Purchase Rate</p>
              <p className="text-xs text-green-600 mt-1">+2.5% vs last period</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
              <p className="text-2xl font-bold">{customerMetrics.customerLifetimeValue}</p>
              <p className="text-sm text-muted-foreground">Customer LTV</p>
              <p className="text-xs text-green-600 mt-1">+5% vs last period</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
              <p className="text-2xl font-bold">{customerMetrics.churnRate}</p>
              <p className="text-sm text-muted-foreground">Churn Rate</p>
              <p className="text-xs text-red-600 mt-1">+0.3% vs last period</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
              <p className="text-2xl font-bold">{customerMetrics.averageTimeToSecondPurchase}</p>
              <p className="text-sm text-muted-foreground">Time to 2nd Purchase</p>
              <p className="text-xs text-green-600 mt-1">-2 days vs last period</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Insights */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-green-200 dark:border-green-900/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">Sales are up</p>
                <p className="text-sm text-muted-foreground">
                  Revenue increased 12.5% compared to last period
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-blue-200 dark:border-blue-900/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">Customer growth</p>
                <p className="text-sm text-muted-foreground">
                  156 new customers acquired this period
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-yellow-200 dark:border-yellow-900/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400">
                <Package className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">Best seller</p>
                <p className="text-sm text-muted-foreground">
                  Premium Paper Bags leads with 125 orders
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
