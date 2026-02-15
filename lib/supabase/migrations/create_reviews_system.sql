-- =====================================================
-- REVIEWS SYSTEM MIGRATION
-- =====================================================
-- Creates reviews and review_votes tables with RLS policies
-- Performance-optimized with denormalized counts and indexes

-- Drop existing objects if they exist
DROP TABLE IF EXISTS review_votes CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;

-- =====================================================
-- REVIEWS TABLE
-- =====================================================
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Product & User identification
  product_id TEXT NOT NULL,                    -- MongoDB product ObjectId
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,  -- Nullable for verification
  
  -- Review content
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT CHECK (char_length(title) <= 100),
  comment TEXT NOT NULL CHECK (char_length(comment) >= 10 AND char_length(comment) <= 2000),
  
  -- Metadata
  is_verified_purchase BOOLEAN DEFAULT false,
  helpful_count INTEGER DEFAULT 0 CHECK (helpful_count >= 0),  -- Denormalized for performance
  
  -- Admin reply (stored inline for performance)
  admin_reply TEXT CHECK (char_length(admin_reply) <= 1000),
  admin_reply_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  
  -- Business constraint: one review per product per user
  CONSTRAINT unique_user_product_review UNIQUE(product_id, user_id)
);

-- Performance indexes
CREATE INDEX idx_reviews_product_id ON reviews(product_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_created_desc ON reviews(created_at DESC);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_helpful ON reviews(helpful_count DESC);

-- =====================================================
-- REVIEW VOTES TABLE (Helpful votes)
-- =====================================================
CREATE TABLE review_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  
  -- One vote per user per review
  CONSTRAINT unique_user_review_vote UNIQUE(review_id, user_id)
);

-- Performance indexes
CREATE INDEX idx_review_votes_review_id ON review_votes(review_id);
CREATE INDEX idx_review_votes_user_id ON review_votes(user_id);

-- =====================================================
-- AUTO-UPDATE TIMESTAMP TRIGGER
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- RLS POLICIES - REVIEWS
-- =====================================================

-- Enable RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Public read access (anyone can see reviews)
CREATE POLICY "Reviews are viewable by everyone"
  ON reviews FOR SELECT
  USING (true);

-- Authenticated users can create reviews
CREATE POLICY "Authenticated users can create reviews"
  ON reviews FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own reviews (7-day check handled in app logic)
CREATE POLICY "Users can update own reviews"
  ON reviews FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own reviews (7-day check handled in app logic)
CREATE POLICY "Users can delete own reviews"
  ON reviews FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- =====================================================
-- RLS POLICIES - REVIEW VOTES
-- =====================================================

-- Enable RLS
ALTER TABLE review_votes ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Review votes are viewable by everyone"
  ON review_votes FOR SELECT
  USING (true);

-- Authenticated users can vote
CREATE POLICY "Authenticated users can vote on reviews"
  ON review_votes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can remove their own votes
CREATE POLICY "Users can remove own votes"
  ON review_votes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- =====================================================
-- HELPER FUNCTION: Update helpful count when vote changes
-- =====================================================
CREATE OR REPLACE FUNCTION update_review_helpful_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE reviews
    SET helpful_count = helpful_count + 1
    WHERE id = NEW.review_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE reviews
    SET helpful_count = GREATEST(helpful_count - 1, 0)
    WHERE id = OLD.review_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_helpful_count_on_vote
  AFTER INSERT OR DELETE ON review_votes
  FOR EACH ROW
  EXECUTE FUNCTION update_review_helpful_count();

-- =====================================================
-- INDEXES FOR ADMIN QUERIES
-- =====================================================
CREATE INDEX idx_reviews_has_admin_reply ON reviews(admin_reply_at) WHERE admin_reply IS NOT NULL;

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON TABLE reviews IS 'Product reviews by authenticated users';
COMMENT ON TABLE review_votes IS 'Helpful votes on reviews';
COMMENT ON COLUMN reviews.helpful_count IS 'Denormalized count updated by trigger';
COMMENT ON COLUMN reviews.is_verified_purchase IS 'True if user has completed order with this product';
COMMENT ON COLUMN reviews.admin_reply IS 'Optional reply from admin/seller';
