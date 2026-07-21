import { Router } from 'express';
import { supabaseAdmin } from '../services/supabase.js';
import verifyToken from '../middleware/auth.js';
import requireRole from '../middleware/roleGuard.js';

const router = Router();

// Protect all routes under this prefix to phlebotomists only
router.use(verifyToken, requireRole('phlebotomist'));

// @route   GET /api/phlebo/tasks
// @desc    List all tasks assigned to the current phlebotomist
router.get('/tasks', async (req, res) => {
  try {
    const { data: assignments, error } = await supabaseAdmin
      .from('phlebotomist_assignments')
      .select('*, bookings(*, lab_partners(name), family_members(*), addresses(*))')
      .eq('phlebotomist_user_id', req.user.id)
      .order('assigned_at', { ascending: false });

    if (error) throw error;
    res.json(assignments);
  } catch (err) {
    console.error('Error fetching phlebotomist tasks:', err);
    res.status(500).json({ error: err.message || 'Failed to retrieve tasks' });
  }
});

// @route   PUT /api/phlebo/status
// @desc    Update online duty status of phlebotomist
router.put('/status', async (req, res) => {
  const { duty_status } = req.body;
  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .update({ duty_status: !!duty_status })
      .eq('id', req.user.id)
      .select('id, duty_status')
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('Error updating duty status:', err);
    res.status(500).json({ error: 'Failed to update duty status' });
  }
});

// @route   POST /api/phlebo/location
// @desc    Upload phlebotomist GPS coordinates history
router.post('/location', async (req, res) => {
  const { lat, lng } = req.body;
  if (lat === undefined || lng === undefined) {
    return res.status(400).json({ error: 'Latitude and Longitude are required' });
  }
  try {
    const { data, error } = await supabaseAdmin
      .from('phlebotomist_locations')
      .insert({
        phlebotomist_user_id: req.user.id,
        lat,
        lng,
        is_online: true,
      })
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('Error logging phlebo location:', err);
    res.status(500).json({ error: 'Failed to save location coordinates' });
  }
});

// @route   PUT /api/phlebo/tasks/:assignmentId/status
// @desc    Update status of assignment and corresponding booking
router.put('/tasks/:assignmentId/status', async (req, res) => {
  const { assignmentId } = req.params;
  const { status } = req.body; // e.g. 'accepted', 'declined', 'en_route', 'arrived', 'collected', 'failed'

  const validStatuses = ['accepted', 'declined', 'en_route', 'arrived', 'collected', 'failed'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid assignment status' });
  }

  try {
    // 1. Fetch assignment details
    const { data: assignment, error: fetchError } = await supabaseAdmin
      .from('phlebotomist_assignments')
      .select('booking_id')
      .eq('id', assignmentId)
      .eq('phlebotomist_user_id', req.user.id)
      .single();

    if (fetchError || !assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    // 2. Update assignment status
    const updatePayload = { status };
    let generatedOtp = null;

    if (status === 'accepted') {
      updatePayload.accepted_at = new Date().toISOString();
    } else if (status === 'arrived') {
      // Generate 4-digit OTP code on check-in/arrival
      generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();
      const { error: otpError } = await supabaseAdmin
        .from('bookings')
        .update({ otp_code: generatedOtp })
        .eq('id', assignment.booking_id);
      
      if (otpError) throw otpError;
    } else if (status === 'collected') {
      const { otp, collection_photo_url } = req.body;
      if (!otp) {
        return res.status(400).json({ error: 'Patient verification OTP code is required' });
      }

      // Verify OTP code stored in the booking
      const { data: bookingData, error: bookingErr } = await supabaseAdmin
        .from('bookings')
        .select('otp_code')
        .eq('id', assignment.booking_id)
        .single();

      if (bookingErr || !bookingData) {
        return res.status(404).json({ error: 'Associated booking record not found' });
      }

      if (bookingData.otp_code !== otp) {
        return res.status(400).json({ error: 'Invalid OTP code. Please verify with the patient.' });
      }

      updatePayload.collected_at = new Date().toISOString();
      updatePayload.patient_otp_confirmed = true;
      if (collection_photo_url) {
        updatePayload.collection_photo_url = collection_photo_url;
      }
    } else if (status === 'failed') {
      const { reason } = req.body;
      updatePayload.failure_reason = reason || 'Unreachable / Refused';
    }

    const { data: updatedAssign, error: assignError } = await supabaseAdmin
      .from('phlebotomist_assignments')
      .update(updatePayload)
      .eq('id', assignmentId)
      .select()
      .single();

    if (assignError) throw assignError;

    // 3. Map assignment status to booking status
    let bookingStatus = null;
    if (status === 'accepted') bookingStatus = 'phlebotomist_assigned';
    else if (status === 'en_route') bookingStatus = 'en_route';
    else if (status === 'arrived') bookingStatus = 'arrived';
    else if (status === 'collected') bookingStatus = 'sample_collected';
    else if (status === 'failed') bookingStatus = 'failed';

    // 4. Update booking table status if status mapping exists
    if (bookingStatus) {
      const { error: bookingError } = await supabaseAdmin
        .from('bookings')
        .update({
          status: bookingStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', assignment.booking_id);

      if (bookingError) throw bookingError;
    }

    res.json({
      ...updatedAssign,
      otp_code: generatedOtp
    });
  } catch (err) {
    console.error('Error updating task status:', err);
    res.status(500).json({ error: err.message || 'Failed to update task status' });
  }
});

export default router;
