import { Router } from 'express';
import { supabaseAdmin } from '../services/supabase.js';
import verifyToken from '../middleware/auth.js';
import requireRole from '../middleware/roleGuard.js';

const router = Router();

// Protect all routes under /api/admin to platform_admin only
router.use(verifyToken, requireRole('platform_admin'));

// @route   GET /api/admin/labs
// @desc    List all registered labs / applications
// @access  Private (Admin only)
router.get('/labs', async (req, res) => {
  const { status } = req.query;

  try {
    let query = supabaseAdmin
      .from('lab_partners')
      .select('*, users!lab_partners_owner_user_id_fkey(name, email, phone)')
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data: labs, error } = await query;
    if (error) throw error;

    res.json(labs);
  } catch (err) {
    console.error('Error listing labs for admin:', err);
    res.status(500).json({ error: 'Failed to retrieve labs' });
  }
});

// @route   PUT /api/admin/labs/:id/review
// @desc    Approve/reject a lab onboarding application
// @access  Private (Admin only)
router.put('/labs/:id/review', async (req, res) => {
  const { status, review_notes, commission_rate } = req.body;

  if (!status || !['live', 'verified', 'suspended', 'pending_review'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status update. Must be live, verified, or suspended.' });
  }

  try {
    const updateData = {
      status,
      review_notes,
      reviewed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (commission_rate !== undefined) {
      updateData.commission_rate = parseFloat(commission_rate);
    }

    const { data: lab, error } = await supabaseAdmin
      .from('lab_partners')
      .update(updateData)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;

    res.json(lab);
  } catch (err) {
    console.error('Error reviewing lab:', err);
    res.status(500).json({ error: 'Failed to update lab application review status' });
  }
});

// @route   GET /api/admin/stats
// @desc    Get platform-wide statistics for admin dashboard
// @access  Private (Admin only)
router.get('/stats', async (req, res) => {
  try {
    const [labsCount, pendingCount, activeCount, usersCount] = await Promise.all([
      supabaseAdmin.from('lab_partners').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('lab_partners').select('id', { count: 'exact', head: true }).eq('status', 'pending_review'),
      supabaseAdmin.from('lab_partners').select('id', { count: 'exact', head: true }).eq('status', 'live'),
      supabaseAdmin.from('users').select('id', { count: 'exact', head: true }),
    ]);

    res.json({
      totalLabs: labsCount.count || 0,
      pendingReviews: pendingCount.count || 0,
      activeLabs: activeCount.count || 0,
      totalUsers: usersCount.count || 0,
    });
  } catch (err) {
    console.error('Error fetching admin dashboard statistics:', err);
    res.status(500).json({ error: 'Failed to fetch platform statistics' });
  }
});

// @route   GET /api/admin/payouts
// @desc    Retrieve all payouts history for all labs
router.get('/payouts', async (req, res) => {
  try {
    const { data: payouts, error } = await supabaseAdmin
      .from('payouts')
      .select('*, lab_partners(name)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json(payouts);
  } catch (err) {
    console.error('Error fetching admin payouts:', err);
    res.status(500).json({ error: 'Failed to retrieve payouts' });
  }
});

// @route   POST /api/admin/payouts/disburse
// @desc    Disburse payout to a lab (simulated)
router.post('/payouts/disburse', async (req, res) => {
  const { lab_id, amount } = req.body;
  if (!lab_id || !amount) {
    return res.status(400).json({ error: 'Lab ID and amount are required' });
  }
  try {
    const gross = parseFloat(amount);
    const comm = gross * 0.15; // 15% platform commission
    const net = gross - comm;

    const { data, error } = await supabaseAdmin
      .from('payouts')
      .insert({
        lab_id,
        period_start: new Date(Date.now() - 7*24*60*60*1000).toISOString().split('T')[0],
        period_end: new Date().toISOString().split('T')[0],
        gross_amount: gross,
        commission_deducted: comm,
        net_payout: net,
        status: 'paid',
        paid_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('Error disbursing payout:', err);
    res.status(500).json({ error: 'Failed to disburse payout' });
  }
});

export default router;
