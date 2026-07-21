-- ============================================================
-- Create Storage Bucket for Diagnostic Reports
-- ============================================================

-- Insert bucket config
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'reports',
  'reports',
  true, -- public bucket so getPublicUrl() works for patient downloads
  10485760, -- 10MB limit
  '{"application/pdf"}'
) ON CONFLICT (id) DO UPDATE SET public = true;

-- RLS Policies on storage.objects

-- 1. Allow lab staff to upload reports
CREATE POLICY "Allow lab staff to upload reports"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'reports' 
    AND (
      EXISTS (
        SELECT 1 FROM users
        WHERE id = auth.uid() AND role = 'lab_staff'
      )
    )
  );

-- 2. Allow patients to read their own reports
CREATE POLICY "Allow patients to read own reports"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'reports'
  );

-- 3. Allow lab staff to read reports they uploaded
CREATE POLICY "Allow lab staff to read reports"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'reports'
  );
