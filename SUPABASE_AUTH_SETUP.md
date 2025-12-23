# Supabase Authentication Implementation Guide

## Overview
This document outlines the Supabase authentication implementation for the Paperly ecommerce application.

## Setup Steps

### 1. Install Dependencies
```bash
npm install @supabase/supabase-js @supabase/ssr
```

### 2. Configure Environment Variables
Create a `.env.local` file in the root of your project:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Get these values from your Supabase project:
1. Go to https://supabase.com/dashboard
2. Create a new project or select existing one
3. Go to Settings > API
4. Copy the Project URL and anon public key

### 3. Supabase Project Setup
In your Supabase dashboard:

1. **Enable Email Authentication**
   - Go to Authentication > Providers
   - Enable Email provider

2. **Enable Google OAuth (Optional)**
   - Go to Authentication > Providers
   - Enable Google provider
   - Add your Google OAuth credentials

3. **Configure Redirect URLs**
   - Go to Authentication > URL Configuration
   - Add your site URL: `http://localhost:3000` (development)
   - Add redirect URL: `http://localhost:3000/auth/callback`

## Files Created

### Supabase Clients
- `lib/supabase/client.ts` - Browser client for client components
- `lib/supabase/server.ts` - Server client for server components
- `lib/supabase/middleware.ts` - Middleware for session management

### Auth Components
- `lib/hooks/useAuth.tsx` - Auth context provider and hook
- `app/(auth)/sign-in/page.tsx` - Sign in page with email/password and Google
- `app/(auth)/sign-up/page.tsx` - Sign up page with password strength indicator
- `app/auth/callback/route.ts` - OAuth callback handler

### Profile Pages
- `app/(profile)/profile/layout.tsx` - Profile layout with sidebar navigation
- `app/(profile)/profile/page.tsx` - User profile with editable information
- `app/(profile)/profile/addresses/page.tsx` - Saved addresses management
- `app/(profile)/profile/wallets/page.tsx` - Payment methods management
- `app/(profile)/profile/settings/page.tsx` - Account settings
- `app/(profile)/orders/page.tsx` - Order history with tracking

### Middleware
- `middleware.ts` - Route protection and session refresh

## Protected Routes
The following routes require authentication:
- `/cart` - Shopping cart
- `/profile` - User profile
- `/orders` - Order history
- `/checkout` - Checkout process

Unauthenticated users will be redirected to `/sign-in` with a redirect parameter.

## Features Implemented

### Authentication
- ✅ Email/Password sign in
- ✅ Email/Password sign up with email verification
- ✅ Google OAuth sign in/sign up
- ✅ Session management with cookies
- ✅ Protected routes with middleware
- ✅ Auth state persistence

### Profile Page
- ✅ User avatar with initials
- ✅ Editable profile information
- ✅ Email (read-only)
- ✅ Phone number
- ✅ Member since date
- ✅ Quick action cards

### Addresses Page
- ✅ Add/Edit/Delete addresses
- ✅ Address type selection (Home/Work/Other)
- ✅ Map location picker integration
- ✅ Set default address
- ✅ UAE emirates selector

### Wallets Page
- ✅ Add credit/debit cards
- ✅ Card number formatting
- ✅ Expiry date formatting
- ✅ Visual card display with brand colors
- ✅ Set default payment method
- ✅ Delete payment methods

### Orders Page
- ✅ Order statistics cards
- ✅ Search and filter orders
- ✅ Order status badges
- ✅ Expandable order details
- ✅ Order progress tracker
- ✅ Order items with images

### Settings Page
- ✅ Password change
- ✅ Notification preferences
- ✅ Theme selection
- ✅ Language selection
- ✅ Account deletion option

### Cart Integration
- ✅ User info display when logged in
- ✅ Sign in/Sign up prompts when not logged in
- ✅ Redirect after sign in

### Header Integration
- ✅ User avatar in header
- ✅ Profile dropdown link
- ✅ Sign out button
- ✅ Mobile menu authentication

## Usage

### Using the Auth Hook
```tsx
import { useAuth } from '@/lib/hooks/useAuth'

function MyComponent() {
  const { user, session, isLoading, signOut } = useAuth()
  
  if (isLoading) return <div>Loading...</div>
  
  if (!user) {
    return <div>Please sign in</div>
  }
  
  return (
    <div>
      <p>Welcome, {user.email}</p>
      <button onClick={signOut}>Sign Out</button>
    </div>
  )
}
```

### Protecting a Server Component
```tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function ProtectedPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/sign-in')
  }
  
  return <div>Protected content for {user.email}</div>
}
```

## Database Schema (Optional)
If you want to extend user profiles in Supabase:

```sql
-- Create profiles table
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  phone text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create addresses table
create table addresses (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  label text,
  type text check (type in ('home', 'work', 'other')),
  full_name text not null,
  phone text,
  street text not null,
  city text not null,
  emirate text not null,
  country text default 'UAE',
  lat numeric,
  lng numeric,
  is_default boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table profiles enable row level security;
alter table addresses enable row level security;

-- Create policies
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Users can view own addresses" on addresses for select using (auth.uid() = user_id);
create policy "Users can insert own addresses" on addresses for insert with check (auth.uid() = user_id);
create policy "Users can update own addresses" on addresses for update using (auth.uid() = user_id);
create policy "Users can delete own addresses" on addresses for delete using (auth.uid() = user_id);
```

## Next Steps
1. Set up Supabase project and get API keys
2. Create `.env.local` with your credentials
3. Test sign up and sign in flows
4. Optionally set up Google OAuth
5. Create database tables for addresses and orders
6. Connect payment methods to Stripe for production use
