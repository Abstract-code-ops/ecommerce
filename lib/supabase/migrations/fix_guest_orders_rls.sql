-- =============================================================================
-- MIGRATION: Fix RLS Policies for Guest Checkout
-- Date: 2026-02-14
-- Purpose: Allow guest orders (where user_id is NULL) to be created
-- =============================================================================

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can insert own orders" ON orders;
DROP POLICY IF EXISTS "Users can insert own order items" ON order_items;
DROP POLICY IF EXISTS "Users can view own orders" ON orders;

-- =============================================================================
-- ORDERS TABLE RLS POLICIES
-- =============================================================================

-- Allow users to view their own orders OR guest orders with matching email
-- Note: For guests viewing orders, you'll need a separate guest order lookup feature
CREATE POLICY "Users can view own orders or guest orders" 
  ON orders FOR SELECT 
  USING (
    -- Authenticated users can see their orders
    (auth.uid() = user_id)
    -- Note: Add guest order lookup logic separately if needed
  );

-- Allow inserting orders for both authenticated users AND guests
CREATE POLICY "Allow order creation for authenticated users and guests" 
  ON orders FOR INSERT 
  WITH CHECK (
    -- Case 1: Authenticated user creating order (user_id must match)
    (auth.uid() IS NOT NULL AND auth.uid() = user_id)
    OR
    -- Case 2: Guest creating order (no auth, user_id is null, must have guest_email)
    (auth.uid() IS NULL AND user_id IS NULL AND guest_email IS NOT NULL)
  );

-- Users can only update notes on their own orders
CREATE POLICY "Users can update own order notes" 
  ON orders FOR UPDATE 
  USING (auth.uid() = user_id);

-- =============================================================================
-- ORDER ITEMS TABLE RLS POLICIES
-- =============================================================================

-- Allow viewing order items for own orders
CREATE POLICY "Users can view own order items" 
  ON order_items FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );

-- Allow inserting order items for both authenticated users AND guests
CREATE POLICY "Allow order items for authenticated users and guests" 
  ON order_items FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND (
        -- Case 1: Order belongs to authenticated user
        orders.user_id = auth.uid()
        OR
        -- Case 2: Guest order (user_id is null, has guest_email)
        (orders.user_id IS NULL AND orders.guest_email IS NOT NULL)
      )
    )
  );

-- =============================================================================
-- VERIFICATION QUERIES (Run these to test)
-- =============================================================================

-- Test 1: Check if policies exist
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
-- FROM pg_policies
-- WHERE tablename IN ('orders', 'order_items')
-- ORDER BY tablename, policyname;

-- Test 2: Test guest order insert (as unauthenticated user)
-- This should work now:
-- INSERT INTO orders (order_number, user_id, guest_email, subtotal_cents, shipping_cents, tax_cents, total_cents, shipping_address, payment_method)
-- VALUES ('TEST-001', NULL, 'guest@test.com', 1000, 100, 0, 1100, '{"fullName":"Test"}'::jsonb, 'CashOnDelivery');
