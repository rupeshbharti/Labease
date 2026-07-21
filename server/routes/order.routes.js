import { Router } from 'express';
import multer from 'multer';
import { supabaseAdmin } from '../services/supabase.js';
import { uploadReport } from '../services/storage.js';
import verifyToken from '../middleware/auth.js';
import requireRole from '../middleware/roleGuard.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Protect all routes to lab_staff
router.use(verifyToken, requireRole('lab_staff'));

// Helper: Verify if current user is owner of the lab
async function verifyLabOwner(userId, labId) {
  const { data, error } = await supabaseAdmin
    .from('lab_partners')
    .select('id')
    .eq('id', labId)
    .eq('owner_user_id', userId)
    .single();

  return !error && !!data;
}

// @route   GET /api/labs/:labId/orders
// @desc    List all orders for a lab with optional status filters
router.get('/:labId/orders', async (req, res) => {
  const { labId } = req.params;
  const { status } = req.query;

  if (!(await verifyLabOwner(req.user.id, labId))) {
    return res.status(403).json({ error: 'You do not own this lab' });
  }

  try {
    let query = supabaseAdmin
      .from('bookings')
      .select('*, family_members(*), addresses(*), booking_items(*, tests(name, code), packages(name))')
      .eq('lab_id', labId)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data: orders, error } = await query;
    if (error) throw error;

    res.json(orders);
  } catch (err) {
    console.error('Error listing lab orders:', err);
    res.status(500).json({ error: 'Failed to retrieve orders list' });
  }
});

// @route   GET /api/labs/:labId/phlebotomists
// @desc    List all registered phlebotomists
router.get('/:labId/phlebotomists', async (req, res) => {
  const { labId } = req.params;

  if (!(await verifyLabOwner(req.user.id, labId))) {
    return res.status(403).json({ error: 'You do not own this lab' });
  }

  try {
    const { data: phlebos, error } = await supabaseAdmin
      .from('users')
      .select('id, name, phone, email')
      .eq('role', 'phlebotomist');

    if (error) throw error;
    res.json(phlebos);
  } catch (err) {
    console.error('Error listing phlebotomists:', err);
    res.status(500).json({ error: 'Failed to retrieve phlebotomists' });
  }
});

// @route   PUT /api/labs/:labId/orders/:id/accept
// @desc    Accept a booking
router.put('/:labId/orders/:id/accept', async (req, res) => {
  const { labId, id } = req.params;

  if (!(await verifyLabOwner(req.user.id, labId))) {
    return res.status(403).json({ error: 'You do not own this lab' });
  }

  try {
    const { data: booking, error: fetchError } = await supabaseAdmin
      .from('bookings')
      .select('status')
      .eq('id', id)
      .eq('lab_id', labId)
      .single();

    if (fetchError || !booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (booking.status !== 'pending_lab_acceptance') {
      return res.status(400).json({ error: `Cannot accept booking at current status: ${booking.status}` });
    }

    const { data, error } = await supabaseAdmin
      .from('bookings')
      .update({
        status: 'confirmed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('Error accepting order:', err);
    res.status(500).json({ error: 'Failed to accept order' });
  }
});

// @route   PUT /api/labs/:labId/orders/:id/reject
// @desc    Reject a booking with a reason
router.put('/:labId/orders/:id/reject', async (req, res) => {
  const { labId, id } = req.params;
  const { reason } = req.body;

  if (!(await verifyLabOwner(req.user.id, labId))) {
    return res.status(403).json({ error: 'You do not own this lab' });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('bookings')
      .update({
        status: 'cancelled',
        notes: reason ? `Rejected: ${reason}` : 'Rejected by lab staff',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('lab_id', labId)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('Error rejecting order:', err);
    res.status(500).json({ error: 'Failed to reject order' });
  }
});

// @route   PUT /api/labs/:labId/orders/:id/assign
// @desc    Assign a phlebotomist to a booking
router.put('/:labId/orders/:id/assign', async (req, res) => {
  const { labId, id } = req.params;
  const { phlebotomist_user_id } = req.body;

  if (!(await verifyLabOwner(req.user.id, labId))) {
    return res.status(403).json({ error: 'You do not own this lab' });
  }

  if (!phlebotomist_user_id) {
    return res.status(400).json({ error: 'Phlebotomist user ID is required' });
  }

  try {
    // 1. Verify phlebotomist role
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', phlebotomist_user_id)
      .single();

    if (userError || user?.role !== 'phlebotomist') {
      return res.status(400).json({ error: 'Selected user is not a registered phlebotomist' });
    }

    // 2. Create phlebotomist assignment record
    const { error: assignError } = await supabaseAdmin
      .from('phlebotomist_assignments')
      .insert({
        booking_id: id,
        phlebotomist_user_id,
        status: 'assigned',
      });

    if (assignError) throw assignError;

    // 3. Update booking status
    const { data: booking, error: bookingError } = await supabaseAdmin
      .from('bookings')
      .update({
        status: 'phlebotomist_assigned',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (bookingError) throw bookingError;

    res.json(booking);
  } catch (err) {
    console.error('Error assigning phlebotomist:', err);
    res.status(500).json({ error: 'Failed to assign phlebotomist' });
  }
});

// @route   PUT /api/labs/:labId/orders/:id/status
// @desc    Update booking status directly
router.put('/:labId/orders/:id/status', async (req, res) => {
  const { labId, id } = req.params;
  const { status } = req.body;

  if (!(await verifyLabOwner(req.user.id, labId))) {
    return res.status(403).json({ error: 'You do not own this lab' });
  }

  const validStatuses = ['confirmed', 'processing', 'sample_received_at_lab', 'report_ready', 'cancelled', 'failed'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status update request' });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('bookings')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('lab_id', labId)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('Error updating order status:', err);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// @route   POST /api/labs/:labId/orders/:id/report
// @desc    Upload diagnostic PDF report
router.post('/:labId/orders/:id/report', upload.single('report'), async (req, res) => {
  const { labId, id } = req.params;

  if (!(await verifyLabOwner(req.user.id, labId))) {
    return res.status(403).json({ error: 'You do not own this lab' });
  }

  if (!req.file) {
    return res.status(400).json({ error: 'Report file PDF is required' });
  }

  try {
    // 1. Upload file to Supabase storage reports bucket
    const { fileUrl, error: uploadErr } = await uploadReport(id, req.file.buffer, req.file.mimetype);
    if (uploadErr) throw uploadErr;

    // 2. Fetch current version of report if any
    const { data: existingReports } = await supabaseAdmin
      .from('reports')
      .select('version')
      .eq('booking_id', id)
      .order('version', { ascending: false });

    const newVersion = existingReports && existingReports.length > 0 ? existingReports[0].version + 1 : 1;

    // 3. Create report database record
    const { error: dbError } = await supabaseAdmin
      .from('reports')
      .insert({
        booking_id: id,
        uploaded_by_user_id: req.user.id,
        file_url: fileUrl,
        version: newVersion,
      });

    if (dbError) throw new Error(dbError.message || 'Database insert of report record failed');

    // 4. Update booking status to report_ready
    const { data: booking, error: bookingErr } = await supabaseAdmin
      .from('bookings')
      .update({
        status: 'report_ready',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (bookingErr) throw new Error(bookingErr.message || 'Updating booking status to report_ready failed');

    res.json({ message: 'Report uploaded successfully', booking });
  } catch (err) {
    console.error('Error uploading report:', err);
    res.status(500).json({ error: err.message || 'Failed to upload diagnostic report' });
  }
});

export default router;
