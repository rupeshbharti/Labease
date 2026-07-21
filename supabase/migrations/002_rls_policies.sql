-- ============================================================
-- LabEase — Row Level Security Policies
-- Using Supabase Auth (auth.uid()) — no Clerk dependency
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE package_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE phlebotomist_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE phlebotomist_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Helper: Check if user is platform_admin
-- ============================================================

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'platform_admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- ============================================================
-- USERS — Users can read/update their own profile, admins see all
-- ============================================================

CREATE POLICY "Users can view own profile"
  ON users FOR SELECT USING (id = auth.uid() OR is_admin());

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT WITH CHECK (id = auth.uid());

-- ============================================================
-- LAB PARTNERS — Owners manage their lab, admins see all
-- ============================================================

CREATE POLICY "Lab owners can view own lab"
  ON lab_partners FOR SELECT USING (owner_user_id = auth.uid() OR is_admin());

CREATE POLICY "Lab owners can update own lab"
  ON lab_partners FOR UPDATE USING (owner_user_id = auth.uid() OR is_admin());

CREATE POLICY "Authenticated users can create labs"
  ON lab_partners FOR INSERT WITH CHECK (owner_user_id = auth.uid());

-- Public read for active/live labs (patients browsing)
CREATE POLICY "Anyone can view live labs"
  ON lab_partners FOR SELECT USING (status = 'live');

-- ============================================================
-- FAMILY MEMBERS — Patients manage their own
-- ============================================================

CREATE POLICY "Patients manage own family members"
  ON family_members FOR ALL USING (patient_user_id = auth.uid());

-- ============================================================
-- ADDRESSES — Users manage their own
-- ============================================================

CREATE POLICY "Users manage own addresses"
  ON addresses FOR ALL USING (user_id = auth.uid());

-- ============================================================
-- TESTS — Lab staff manage their lab's tests, public read for active
-- ============================================================

CREATE POLICY "Lab staff manage own tests"
  ON tests FOR ALL USING (
    lab_id IN (SELECT id FROM lab_partners WHERE owner_user_id = auth.uid())
    OR is_admin()
  );

CREATE POLICY "Anyone can view active tests"
  ON tests FOR SELECT USING (is_active = TRUE);

-- ============================================================
-- PACKAGES — Same as tests
-- ============================================================

CREATE POLICY "Lab staff manage own packages"
  ON packages FOR ALL USING (
    lab_id IN (SELECT id FROM lab_partners WHERE owner_user_id = auth.uid())
    OR is_admin()
  );

CREATE POLICY "Anyone can view active packages"
  ON packages FOR SELECT USING (is_active = TRUE);

-- ============================================================
-- PACKAGE_TESTS
-- ============================================================

CREATE POLICY "Lab staff manage package_tests"
  ON package_tests FOR ALL USING (
    package_id IN (
      SELECT id FROM packages WHERE lab_id IN (
        SELECT id FROM lab_partners WHERE owner_user_id = auth.uid()
      )
    ) OR is_admin()
  );

CREATE POLICY "Anyone can view package_tests"
  ON package_tests FOR SELECT USING (TRUE);

-- ============================================================
-- BOOKINGS — Patients see own, labs see their orders, admins see all
-- ============================================================

CREATE POLICY "Patients view own bookings"
  ON bookings FOR SELECT USING (patient_user_id = auth.uid());

CREATE POLICY "Labs view their bookings"
  ON bookings FOR SELECT USING (
    lab_id IN (SELECT id FROM lab_partners WHERE owner_user_id = auth.uid())
  );

CREATE POLICY "Admins view all bookings"
  ON bookings FOR SELECT USING (is_admin());

CREATE POLICY "Patients create bookings"
  ON bookings FOR INSERT WITH CHECK (patient_user_id = auth.uid());

CREATE POLICY "Labs update their bookings"
  ON bookings FOR UPDATE USING (
    lab_id IN (SELECT id FROM lab_partners WHERE owner_user_id = auth.uid())
    OR is_admin()
  );

-- ============================================================
-- BOOKING ITEMS
-- ============================================================

CREATE POLICY "Booking items follow booking access"
  ON booking_items FOR SELECT USING (
    booking_id IN (
      SELECT id FROM bookings WHERE patient_user_id = auth.uid()
      UNION
      SELECT id FROM bookings WHERE lab_id IN (
        SELECT id FROM lab_partners WHERE owner_user_id = auth.uid()
      )
    ) OR is_admin()
  );

CREATE POLICY "Patients insert booking items"
  ON booking_items FOR INSERT WITH CHECK (
    booking_id IN (SELECT id FROM bookings WHERE patient_user_id = auth.uid())
  );

-- ============================================================
-- PHLEBOTOMIST ASSIGNMENTS
-- ============================================================

CREATE POLICY "Phlebotomists view own assignments"
  ON phlebotomist_assignments FOR SELECT USING (
    phlebotomist_user_id = auth.uid() OR is_admin()
  );

CREATE POLICY "Phlebotomists update own assignments"
  ON phlebotomist_assignments FOR UPDATE USING (
    phlebotomist_user_id = auth.uid() OR is_admin()
  );

-- ============================================================
-- PHLEBOTOMIST LOCATIONS
-- ============================================================

CREATE POLICY "Phlebotomists manage own location"
  ON phlebotomist_locations FOR ALL USING (
    phlebotomist_user_id = auth.uid() OR is_admin()
  );

-- ============================================================
-- REPORTS — Patients see own, labs see their reports
-- ============================================================

CREATE POLICY "Patients view own reports"
  ON reports FOR SELECT USING (
    booking_id IN (SELECT id FROM bookings WHERE patient_user_id = auth.uid())
    OR is_admin()
  );

CREATE POLICY "Lab staff manage reports"
  ON reports FOR ALL USING (
    booking_id IN (
      SELECT id FROM bookings WHERE lab_id IN (
        SELECT id FROM lab_partners WHERE owner_user_id = auth.uid()
      )
    ) OR is_admin()
  );

-- ============================================================
-- REVIEWS — Patients create, public read
-- ============================================================

CREATE POLICY "Patients create reviews"
  ON reviews FOR INSERT WITH CHECK (patient_user_id = auth.uid());

CREATE POLICY "Anyone can view reviews"
  ON reviews FOR SELECT USING (TRUE);

-- ============================================================
-- PAYOUTS — Labs see own, admins see all
-- ============================================================

CREATE POLICY "Labs view own payouts"
  ON payouts FOR SELECT USING (
    lab_id IN (SELECT id FROM lab_partners WHERE owner_user_id = auth.uid())
    OR is_admin()
  );

CREATE POLICY "Admins manage payouts"
  ON payouts FOR ALL USING (is_admin());

-- ============================================================
-- AUDIT LOGS — Admins only
-- ============================================================

CREATE POLICY "Admins view audit logs"
  ON audit_logs FOR SELECT USING (is_admin());

CREATE POLICY "System inserts audit logs"
  ON audit_logs FOR INSERT WITH CHECK (TRUE);

-- ============================================================
-- PROMO CODES — Public read for active, admins manage
-- ============================================================

CREATE POLICY "Anyone can view active promo codes"
  ON promo_codes FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Admins manage promo codes"
  ON promo_codes FOR ALL USING (is_admin());
