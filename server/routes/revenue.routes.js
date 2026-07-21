import { Router } from 'express';
import { supabaseAdmin } from '../services/supabase.js';
import verifyToken from '../middleware/auth.js';
import requireRole from '../middleware/roleGuard.js';

const router = Router();

// Protect all routes to lab_staff
router.use(verifyToken, requireRole('lab_staff'));

// Helper to verify lab ownership
async function verifyLabOwner(userId, labId) {
  const { data, error } = await supabaseAdmin
    .from('lab_partners')
    .select('id')
    .eq('id', labId)
    .eq('owner_user_id', userId)
    .single();
  return !error && !!data;
}

// @route   GET /api/revenue/:labId/revenue
// @desc    Calculate revenue statistics and booking analytics for dashboard
router.get('/:labId/revenue', async (req, res) => {
  const { labId } = req.params;
  if (!(await verifyLabOwner(req.user.id, labId))) {
    return res.status(403).json({ error: 'Unauthorized: You do not own this lab' });
  }

  try {
    // 1. Fetch all bookings for the lab
    const { data: bookings, error: bookingsErr } = await supabaseAdmin
      .from('bookings')
      .select('status, total_amount, platform_commission, slot_datetime, created_at')
      .eq('lab_id', labId);

    if (bookingsErr) throw bookingsErr;

    // Time ranges
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay())).getTime();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    let todayEarnings = 0;
    let weekEarnings = 0;
    let monthEarnings = 0;
    let totalGross = 0;
    let totalCommission = 0;
    let totalNet = 0;

    let fulfilledCount = 0;
    let cancelledCount = 0;
    let activeCount = 0;

    bookings.forEach(booking => {
      const bTime = new Date(booking.created_at).getTime();
      const gross = Number(booking.total_amount || 0);
      const comm = Number(booking.platform_commission || 0);
      const net = gross - comm;

      // Status aggregation
      if (['report_ready', 'sample_collected', 'sample_received_at_lab'].includes(booking.status)) {
        fulfilledCount++;
        totalGross += gross;
        totalCommission += comm;
        totalNet += net;

        if (bTime >= startOfToday) {
          todayEarnings += net;
        }
        if (bTime >= startOfWeek) {
          weekEarnings += net;
        }
        if (bTime >= startOfMonth) {
          monthEarnings += net;
        }
      } else if (booking.status === 'cancelled' || booking.status === 'failed') {
        cancelledCount++;
      } else {
        activeCount++;
      }
    });

    res.json({
      summary: {
        today: todayEarnings,
        week: weekEarnings,
        month: monthEarnings,
        totalGross,
        totalCommission,
        totalNet
      },
      counts: {
        total: bookings.length,
        fulfilled: fulfilledCount,
        cancelled: cancelledCount,
        active: activeCount
      }
    });
  } catch (err) {
    console.error('Error calculating revenue stats:', err);
    res.status(500).json({ error: 'Failed to retrieve revenue summary' });
  }
});

// @route   GET /api/revenue/:labId/payouts
// @desc    Retrieve payouts list
router.get('/:labId/payouts', async (req, res) => {
  const { labId } = req.params;
  if (!(await verifyLabOwner(req.user.id, labId))) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  try {
    const { data: payouts, error } = await supabaseAdmin
      .from('payouts')
      .select('*')
      .eq('lab_id', labId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(payouts);
  } catch (err) {
    console.error('Error fetching payouts list:', err);
    res.status(500).json({ error: 'Failed to retrieve payouts schedule' });
  }
});

// @route   GET /api/revenue/:labId/reviews
// @desc    Get all ratings and reviews for a lab
router.get('/:labId/reviews', async (req, res) => {
  const { labId } = req.params;
  if (!(await verifyLabOwner(req.user.id, labId))) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  try {
    const { data: reviews, error } = await supabaseAdmin
      .from('reviews')
      .select('*, patient:users!reviews_patient_user_id_fkey(name, avatar_url), bookings!inner(lab_id, booking_number)')
      .eq('bookings.lab_id', labId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(reviews);
  } catch (err) {
    console.error('Error fetching reviews:', err);
    res.status(500).json({ error: 'Failed to retrieve reviews feedback' });
  }
});

// @route   PUT /api/revenue/:labId/reviews/:reviewId/response
// @desc    Submit lab response/reply to patient rating
router.put('/:labId/reviews/:reviewId/response', async (req, res) => {
  const { labId, reviewId } = req.params;
  const { response_text } = req.body;

  if (!(await verifyLabOwner(req.user.id, labId))) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  if (!response_text) {
    return res.status(400).json({ error: 'Response reply text is required' });
  }

  try {
    const { data: updatedReview, error } = await supabaseAdmin
      .from('reviews')
      .update({
        lab_response_text: response_text,
        lab_responded_at: new Date().toISOString()
      })
      .eq('id', reviewId)
      .select()
      .single();

    if (error) throw error;
    res.json(updatedReview);
  } catch (err) {
    console.error('Error responding to review:', err);
    res.status(500).json({ error: 'Failed to submit response reply' });
  }
});

export default router;
