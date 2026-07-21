-- ============================================================
-- Phase 4 Migration: Reviews, Referrals, and Report Sharing
-- ============================================================

-- Add reply columns to reviews
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS lab_response_text TEXT;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS lab_responded_at TIMESTAMPTZ;

-- Add referral tracking to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_code VARCHAR(15) UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS referred_by_id UUID REFERENCES users(id);

-- Add share token columns to reports
ALTER TABLE reports ADD COLUMN IF NOT EXISTS share_token UUID UNIQUE DEFAULT uuid_generate_v4();
ALTER TABLE reports ADD COLUMN IF NOT EXISTS share_expires_at TIMESTAMPTZ;
