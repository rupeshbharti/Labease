-- ============================================================
-- Phase 3 Migration: OTP Code, Duty Status, and Realtime Setup
-- ============================================================

-- Add OTP code column to bookings
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS otp_code VARCHAR(4);

-- Add Duty Status (online/offline) column to users (for phlebotomists)
ALTER TABLE users ADD COLUMN IF NOT EXISTS duty_status BOOLEAN DEFAULT FALSE;

-- Ensure supabase_realtime publication exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Enable Realtime replication for bookings and assignments
-- We catch exceptions in case they are already added to the publication
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE bookings;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE phlebotomist_assignments;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN OTHERS THEN NULL;
END $$;
