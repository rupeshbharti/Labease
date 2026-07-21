-- ============================================================
-- LabEase — Performance Indexes
-- ============================================================

-- Lab Partners: Geospatial search for nearby labs
CREATE INDEX idx_lab_partners_location ON lab_partners (lat, lng);
CREATE INDEX idx_lab_partners_status ON lab_partners (status);
CREATE INDEX idx_lab_partners_owner ON lab_partners (owner_user_id);

-- Tests: Filtering by lab and active status
CREATE INDEX idx_tests_lab_active ON tests (lab_id, is_active);
CREATE INDEX idx_tests_category ON tests (category) WHERE is_active = TRUE;

-- Bookings: Order management queries
CREATE INDEX idx_bookings_patient ON bookings (patient_user_id);
CREATE INDEX idx_bookings_lab ON bookings (lab_id);
CREATE INDEX idx_bookings_status ON bookings (status);
CREATE INDEX idx_bookings_lab_status ON bookings (lab_id, status);
CREATE INDEX idx_bookings_created ON bookings (created_at DESC);

-- Phlebotomist Locations: Time-series queries
CREATE INDEX idx_phlebo_locations_user ON phlebotomist_locations (phlebotomist_user_id);
CREATE INDEX idx_phlebo_locations_time ON phlebotomist_locations (recorded_at DESC);

-- Phlebotomist Assignments
CREATE INDEX idx_phlebo_assignments_booking ON phlebotomist_assignments (booking_id);
CREATE INDEX idx_phlebo_assignments_user ON phlebotomist_assignments (phlebotomist_user_id);

-- Reports
CREATE INDEX idx_reports_booking ON reports (booking_id);

-- Reviews
CREATE INDEX idx_reviews_booking ON reviews (booking_id);

-- Users
CREATE INDEX idx_users_role ON users (role);
CREATE INDEX idx_users_email ON users (email);

-- Audit Logs
CREATE INDEX idx_audit_logs_entity ON audit_logs (entity_type, entity_id);
CREATE INDEX idx_audit_logs_user ON audit_logs (user_id);
CREATE INDEX idx_audit_logs_created ON audit_logs (created_at DESC);
