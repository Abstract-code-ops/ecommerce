'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  Eye,
  Clock,
  CheckCircle2,
  AlertCircle,
  Truck
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

// Stat Cards Data - Replace with real data
const stats = [
  {
    title: 'Total Revenue',
    value: 'AED 45,231.89',
    change: '+20.1%',
    trend: 'up',
    description: 'from last month',
    icon: DollarSign,
    color: 'bg-green-500',
  },
  {
    title: 'Total Orders',
    value: '2,350',
    change: '+15.3%',
    trend: 'up',
    description: 'from last month',
    icon: ShoppingCart,
    color: 'bg-blue-500',
  },
  {
    title: 'Products Sold',
    value: '12,234',
    change: '+12.5%',
    trend: 'up',
    description: 'from last month',
    icon: Package,
    color: 'bg-purple-500',
  },
  {
    title: 'Active Customers',
    value: '573',
    change: '-2.4%',
    trend: 'down',
    description: 'from last month',
    icon: Users,
    color: 'bg-orange-500',
  },
]

// Recent Orders - Replace with real data
const recentOrders = [
  {
    id: 'ORD-001',
    customer: 'Ahmed Hassan',
    email: 'ahmed@email.com',
    product: 'Premium Paper Bags (50pc)',
    amount: 'AED 299.00',
    status: 'completed',
    date: '2 min ago',
  },
  {
    id: 'ORD-002',
    customer: 'Sara Al-Rashid',
    email: 'sara@email.com',
    product: 'Kraft Shopping Bags (100pc)',
    amount: 'AED 450.00',
    status: 'processing',
    date: '15 min ago',
  },
  {
    id: 'ORD-003',
    customer: 'Mohammed Ali',
    email: 'mohammed@email.com',
    product: 'Luxury Gift Bags (25pc)',
    amount: 'AED 175.00',
    status: 'pending',
    date: '1 hour ago',
  },
  {
    id: 'ORD-004',
    customer: 'Fatima Khan',
    email: 'fatima@email.com',
    product: 'Eco-Friendly Bags (200pc)',
    amount: 'AED 820.00',
    status: 'shipped',
    date: '2 hours ago',
  },
  {
    id: 'ORD-005',
    customer: 'Omar Youssef',
    email: 'omar@email.com',
    product: 'Custom Print Bags (75pc)',
    amount: 'AED 560.00',
    status: 'completed',
    date: '3 hours ago',
  },
]

// Low Stock Products - Replace with real data
const lowStockProducts = [
  { name: 'Premium White Paper Bags', stock: 5, threshold: 20, category: 'Paper Bags' },
  { name: 'Kraft Brown Large', stock: 12, threshold: 30, category: 'Kraft Bags' },
  { name: 'Gift Bag Assorted Colors', stock: 8, threshold: 25, category: 'Gift Bags' },
  { name: 'Eco Recycled Medium', stock: 3, threshold: 15, category: 'Eco Bags' },
]

// Top Selling Products - Replace with real data
const topProducts = [
  { name: 'Premium Paper Bags (50pc)', sales: 1245, revenue: 'AED 37,350', growth: '+12%' },
  { name: 'Kraft Shopping Bags (100pc)', sales: 890, revenue: 'AED 26,700', growth: '+8%' },
  { name: 'Luxury Gift Bags (25pc)', sales: 654, revenue: 'AED 11,421', growth: '+15%' },
  { name: 'Eco-Friendly Bags (200pc)', sales: 432, revenue: 'AED 17,280', growth: '+5%' },
]

// Activity Feed
const activityFeed = [
  { type: 'order', message: 'New order #ORD-001 received', time: '2 min ago', icon: ShoppingCart },
  { type: 'stock', message: 'Low stock alert: Premium White Paper Bags', time: '15 min ago', icon: AlertCircle },
  { type: 'delivery', message: 'Order #ORD-098 delivered successfully', time: '1 hour ago', icon: CheckCircle2 },
  { type: 'customer', message: 'New customer registration: Sara Al-Rashid', time: '2 hours ago', icon: Users },
  { type: 'shipping', message: 'Order #ORD-095 shipped via Express', time: '3 hours ago', icon: Truck },
]

const getStatusStyles = (status: string) => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
    case 'processing':
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
    case 'pending':
      return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
    case 'shipped':
      return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
    case 'cancelled':
      return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    default:
      return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
  }
}

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here&apos;s what&apos;s happening with your store today.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Clock className="mr-2 h-4 w-4" />
            Last 30 days
          </Button>
          <Button size="sm">
            Download Report
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className={cn("p-2 rounded-lg", stat.color)}>
                    <Icon className="h-5 w-5 text-white" />
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
                <div className="mt-4">
                  <h3 className="text-2xl font-bold">{stat.value}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {stat.title}
                  </p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Revenue Chart */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Revenue Overview</CardTitle>
                <CardDescription>Monthly revenue trends</CardDescription>
              </div>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Placeholder for chart - integrate with recharts or similar */}
            <div className="h-[300px] flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-center">
                <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">Revenue Chart</p>
                <p className="text-sm text-muted-foreground">Integrate with recharts library</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Top Selling Products</CardTitle>
                <CardDescription>Best performers this month</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin/analytics/products">View all</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={product.name} className="flex items-center gap-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 font-semibold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{product.name}</p>
                    <p className="text-sm text-muted-foreground">{product.sales} sales</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{product.revenue}</p>
                    <p className="text-sm text-green-600">{product.growth}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders and Activity */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Recent Orders */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Latest customer orders</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin/orders">View all</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center gap-4 py-2 border-b last:border-0">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{order.customer}</p>
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-xs font-medium capitalize",
                        getStatusStyles(order.status)
                      )}>
                        {order.status}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{order.product}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{order.amount}</p>
                    <p className="text-sm text-muted-foreground">{order.date}</p>
                  </div>
                  <Button variant="ghost" size="icon" asChild>
                    <Link href={`/admin/orders/${order.id}`}>
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Activity Feed */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest store events</CardDescription>
              </div>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activityFeed.map((activity, index) => {
                const Icon = activity.icon
                return (
                  <div key={index} className="flex items-start gap-3">
                    <div className={cn(
                      "p-2 rounded-full",
                      activity.type === 'order' && 'bg-blue-100 text-blue-600',
                      activity.type === 'stock' && 'bg-yellow-100 text-yellow-600',
                      activity.type === 'delivery' && 'bg-green-100 text-green-600',
                      activity.type === 'customer' && 'bg-purple-100 text-purple-600',
                      activity.type === 'shipping' && 'bg-orange-100 text-orange-600',
                    )}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">{activity.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alert */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              <div>
                <CardTitle>Low Stock Alerts</CardTitle>
                <CardDescription>Products that need restocking</CardDescription>
              </div>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/products/inventory">Manage Inventory</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {lowStockProducts.map((product) => (
              <div
                key={product.name}
                className="flex items-center justify-between p-4 rounded-lg border border-yellow-200 bg-yellow-50 dark:border-yellow-900/50 dark:bg-yellow-900/20"
              >
                <div>
                  <p className="font-medium text-sm">{product.name}</p>
                  <p className="text-xs text-muted-foreground">{product.category}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-yellow-600 dark:text-yellow-400">{product.stock}</p>
                  <p className="text-xs text-muted-foreground">of {product.threshold}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
          <Link href="/admin/products/new">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="p-3 rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                <Package className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold">Add Product</h3>
                <p className="text-sm text-muted-foreground">Create new product</p>
              </div>
            </CardContent>
          </Link>
        </Card>
        <Card className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
          <Link href="/admin/orders?status=pending">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="p-3 rounded-lg bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold">Pending Orders</h3>
                <p className="text-sm text-muted-foreground">8 orders waiting</p>
              </div>
            </CardContent>
          </Link>
        </Card>
        <Card className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
          <Link href="/admin/returns">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="p-3 rounded-lg bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                <AlertCircle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold">Return Requests</h3>
                <p className="text-sm text-muted-foreground">3 pending returns</p>
              </div>
            </CardContent>
          </Link>
        </Card>
        <Card className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
          <Link href="/admin/analytics">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="p-3 rounded-lg bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold">View Analytics</h3>
                <p className="text-sm text-muted-foreground">Sales & reports</p>
              </div>
            </CardContent>
          </Link>
        </Card>
      </div>
    </div>
  )
}
