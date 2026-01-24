-- =============================================================================
-- RETURNS TABLE SCHEMA FOR GMQG E-COMMERCE
-- Run this SQL in your Supabase SQL Editor to add returns functionality
-- =============================================================================

-- =============================================================================
-- RETURNS TABLE
-- Handles return requests for delivered orders
-- =============================================================================
CREATE TABLE IF NOT EXISTS returns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- References
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  order_item_id UUID REFERENCES order_items(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Return number (auto-generated for easy reference)
  return_number TEXT UNIQUE NOT NULL,
  
  -- Return details
  reason TEXT NOT NULL CHECK (reason IN (
    'damaged',
    'wrong_item',
    'not_as_described',
    'defective',
    'changed_mind',
    'other'
  )),
  reason_details TEXT,
  
  -- Status workflow: pending -> approved/rejected -> (if approved) processing -> refunded
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected', 'processing', 'refunded')) DEFAULT 'pending',
  
  -- Admin response
  admin_notes TEXT,
  rejection_reason TEXT,
  
  -- Refund info (stored as cents for precision)
  quantity INTEGER NOT NULL DEFAULT 1,
  refund_amount_cents INTEGER,
  
  -- Evidence images (URLs stored as JSON array)
  images TEXT[] DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  resolved_at TIMESTAMP WITH TIME ZONE,
  refunded_at TIMESTAMP WITH TIME ZONE
);

-- =============================================================================
-- RETURN NUMBER GENERATION FUNCTION
-- Generates sequential return numbers like RTN-000001
-- =============================================================================
CREATE OR REPLACE FUNCTION generate_return_number()
RETURNS TRIGGER AS $$
DECLARE
  new_number INTEGER;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(return_number FROM 5) AS INTEGER)), 0) + 1
  INTO new_number
  FROM returns;
  
  NEW.return_number := 'RTN-' || LPAD(new_number::TEXT, 6, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate return number
DROP TRIGGER IF EXISTS set_return_number ON returns;
CREATE TRIGGER set_return_number
  BEFORE INSERT ON returns
  FOR EACH ROW
  WHEN (NEW.return_number IS NULL)
  EXECUTE FUNCTION generate_return_number();

-- =============================================================================
-- UPDATE TIMESTAMP FUNCTION
-- Creates if not exists (may already exist from other tables)
-- =============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- UPDATE TIMESTAMP TRIGGER
-- =============================================================================
DROP TRIGGER IF EXISTS update_returns_updated_at ON returns;
CREATE TRIGGER update_returns_updated_at
  BEFORE UPDATE ON returns
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES FOR RETURNS
-- =============================================================================

-- Enable RLS
ALTER TABLE returns ENABLE ROW LEVEL SECURITY;

-- Users can view their own returns
CREATE POLICY "Users can view own returns"
  ON returns FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create returns for their own orders
CREATE POLICY "Users can create own returns"
  ON returns FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own pending returns (e.g., add images, update reason)
CREATE POLICY "Users can update own pending returns"
  ON returns FOR UPDATE
  USING (auth.uid() = user_id AND status = 'pending')
  WITH CHECK (auth.uid() = user_id AND status = 'pending');

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_returns_user_id ON returns(user_id);
CREATE INDEX IF NOT EXISTS idx_returns_order_id ON returns(order_id);
CREATE INDEX IF NOT EXISTS idx_returns_order_item_id ON returns(order_item_id);
CREATE INDEX IF NOT EXISTS idx_returns_status ON returns(status);
CREATE INDEX IF NOT EXISTS idx_returns_created_at ON returns(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_returns_return_number ON returns(return_number);

-- =============================================================================
-- VERIFICATION QUERY
-- Run this to verify the table was created correctly
-- =============================================================================
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'returns'
-- ORDER BY ordinal_position;
