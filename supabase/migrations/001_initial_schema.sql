-- ============================================================
-- LabEase Database Schema — Initial Migration
-- Adapted for Supabase Auth (uses auth.users.id directly)
-- ============================================================

-- Enable UUID extension (already enabled in Supabase by default)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE user_role AS ENUM ('patient', 'lab_staff', 'phlebotomist', 'platform_admin');
CREATE TYPE lab_status AS ENUM ('pending_review', 'verified', 'live', 'suspended');
CREATE TYPE booking_status AS ENUM (
  'pending_lab_acceptance', 'confirmed', 'phlebotomist_assigned',
  'en_route', 'arrived', 'sample_collected', 'sample_received_at_lab',
  'processing', 'report_ready', 'cancelled', 'failed'
);
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'cash_on_collection', 'refunded');
CREATE TYPE collection_mode AS ENUM ('home_collection', 'walk_in');
CREATE TYPE assignment_status AS ENUM ('assigned', 'accepted', 'declined', 'en_route', 'arrived', 'collected', 'failed');
CREATE TYPE payout_status AS ENUM ('scheduled', 'processing', 'paid', 'failed');

-- ============================================================
-- 1. USERS — Profile table linked to Supabase Auth
-- ============================================================

CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'patient',
  name TEXT,
  email TEXT,
  phone TEXT,
  phone_verified BOOLEAN DEFAULT FALSE,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 2. LAB PARTNERS
-- ============================================================

CREATE TABLE lab_partners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  description TEXT,
  logo_url TEXT,
  photos TEXT[] DEFAULT '{}',
  status lab_status NOT NULL DEFAULT 'pending_review',
  address TEXT,
  city TEXT,
  state TEXT,
  pincode TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  service_radius_km DOUBLE PRECISION DEFAULT 10,
  nabl_certificate_url TEXT,
  bank_account_id TEXT,
  commission_rate DECIMAL(5,2) DEFAULT 15.00,
  rating_avg DECIMAL(3,2) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  working_hours JSONB,
  review_notes TEXT,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 3. FAMILY MEMBERS
-- ============================================================

CREATE TABLE family_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  dob DATE,
  gender TEXT,
  relation TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 4. ADDRESSES
-- ============================================================

CREATE TABLE addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  label TEXT DEFAULT 'Home',
  full_address TEXT NOT NULL,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 5. TESTS
-- ============================================================

CREATE TABLE tests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lab_id UUID NOT NULL REFERENCES lab_partners(id) ON DELETE CASCADE,
  code TEXT,
  name TEXT NOT NULL,
  description TEXT,
  sample_type TEXT,
  preparation_instructions TEXT,
  turnaround_hours INTEGER,
  price DECIMAL(10,2) NOT NULL,
  category TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 6. PACKAGES
-- ============================================================

CREATE TABLE packages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lab_id UUID NOT NULL REFERENCES lab_partners(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 7. PACKAGE_TESTS (Join Table)
-- ============================================================

CREATE TABLE package_tests (
  package_id UUID NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
  test_id UUID NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
  PRIMARY KEY (package_id, test_id)
);

-- ============================================================
-- 8. BOOKINGS
-- ============================================================

CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_number TEXT UNIQUE NOT NULL,
  patient_user_id UUID NOT NULL REFERENCES users(id),
  family_member_id UUID REFERENCES family_members(id),
  lab_id UUID NOT NULL REFERENCES lab_partners(id),
  collection_mode collection_mode NOT NULL DEFAULT 'home_collection',
  address_id UUID REFERENCES addresses(id),
  slot_datetime TIMESTAMPTZ,
  status booking_status NOT NULL DEFAULT 'pending_lab_acceptance',
  payment_status payment_status NOT NULL DEFAULT 'pending',
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  platform_commission DECIMAL(10,2) DEFAULT 0,
  lab_payout_amount DECIMAL(10,2) DEFAULT 0,
  promo_code_id UUID,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 9. BOOKING ITEMS
-- ============================================================

CREATE TABLE booking_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  test_id UUID REFERENCES tests(id),
  package_id UUID REFERENCES packages(id),
  price_at_booking DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 10. PHLEBOTOMIST ASSIGNMENTS
-- ============================================================

CREATE TABLE phlebotomist_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id),
  phlebotomist_user_id UUID NOT NULL REFERENCES users(id),
  status assignment_status NOT NULL DEFAULT 'assigned',
  collection_photo_url TEXT,
  patient_otp_confirmed BOOLEAN DEFAULT FALSE,
  failure_reason TEXT,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  collected_at TIMESTAMPTZ
);

-- ============================================================
-- 11. PHLEBOTOMIST LOCATIONS (Time-series, 24h retention)
-- ============================================================

CREATE TABLE phlebotomist_locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phlebotomist_user_id UUID NOT NULL REFERENCES users(id),
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  is_online BOOLEAN DEFAULT FALSE,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 12. REPORTS
-- ============================================================

CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id),
  uploaded_by_user_id UUID NOT NULL REFERENCES users(id),
  file_url TEXT NOT NULL,
  version INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT TRUE,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 13. REVIEWS
-- ============================================================

CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id),
  patient_user_id UUID NOT NULL REFERENCES users(id),
  lab_rating INTEGER CHECK (lab_rating >= 1 AND lab_rating <= 5),
  lab_review_text TEXT,
  phlebotomist_rating INTEGER CHECK (phlebotomist_rating >= 1 AND phlebotomist_rating <= 5),
  phlebotomist_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 14. PAYOUTS
-- ============================================================

CREATE TABLE payouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lab_id UUID NOT NULL REFERENCES lab_partners(id),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  gross_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  commission_deducted DECIMAL(10,2) DEFAULT 0,
  net_payout DECIMAL(10,2) NOT NULL DEFAULT 0,
  status payout_status NOT NULL DEFAULT 'scheduled',
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 15. AUDIT LOGS
-- ============================================================

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 16. PROMO CODES
-- ============================================================

CREATE TABLE promo_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL DEFAULT 'percentage',
  value DECIMAL(10,2) NOT NULL,
  min_order_value DECIMAL(10,2),
  max_discount DECIMAL(10,2),
  start_date DATE,
  end_date DATE,
  usage_limit INTEGER,
  usage_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Auto-update updated_at triggers
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lab_partners_updated_at BEFORE UPDATE ON lab_partners
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tests_updated_at BEFORE UPDATE ON tests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
