-- ============================================================
-- Sequential Booking Number Generator Sequence & Trigger
-- ============================================================

CREATE SEQUENCE IF NOT EXISTS booking_number_seq START WITH 1000;

CREATE OR REPLACE FUNCTION generate_booking_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.booking_number IS NULL THEN
    NEW.booking_number := 'LE-' || LPAD(nextval('booking_number_seq')::text, 6, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Bind trigger to bookings table
CREATE OR REPLACE TRIGGER trigger_generate_booking_number
  BEFORE INSERT ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION generate_booking_number();
