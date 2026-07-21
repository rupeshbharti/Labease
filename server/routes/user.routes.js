import { Router } from 'express';
import { supabaseAdmin } from '../services/supabase.js';
import verifyToken from '../middleware/auth.js';

const router = Router();

// @route   GET /api/users/me
// @desc    Get current user profile
// @access  Private
router.get('/me', verifyToken, async (req, res) => {
  try {
    const { data: profile, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Profile not found' });
      }
      throw error;
    }

    res.json(profile);
  } catch (err) {
    console.error('Error fetching user profile:', err);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// @route   POST /api/users/setup
// @desc    Complete profile setup (initial setup after auth signup)
// @access  Private
router.post('/setup', verifyToken, async (req, res) => {
  const { name, phone, role } = req.body;

  if (!name || !role) {
    return res.status(400).json({ error: 'Name and role are required' });
  }

  try {
    // Check if profile already exists
    const { data: existingProfile } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (existingProfile?.role) {
      return res.status(400).json({ error: 'Profile already set up' });
    }

    const { data: profile, error } = await supabaseAdmin
      .from('users')
      .upsert({
        id: req.user.id,
        email: req.user.email,
        name,
        phone,
        role,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(profile);
  } catch (err) {
    console.error('Error in profile setup:', err);
    res.status(500).json({ error: 'Failed to create profile' });
  }
});

// @route   PUT /api/users/me
// @desc    Update user profile details
// @access  Private
router.put('/me', verifyToken, async (req, res) => {
  const { name, phone, avatar_url } = req.body;

  try {
    const { data: profile, error } = await supabaseAdmin
      .from('users')
      .update({
        name,
        phone,
        avatar_url,
        updated_at: new Date().toISOString(),
      })
      .eq('id', req.user.id)
      .select()
      .single();

    if (error) throw error;

    res.json(profile);
  } catch (err) {
    console.error('Error updating user profile:', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

export default router;
