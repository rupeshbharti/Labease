import { Router } from 'express';
import { supabaseAdmin } from '../services/supabase.js';
import verifyToken from '../middleware/auth.js';

const router = Router();

router.use(verifyToken);

// @route   GET /api/users/addresses
// @desc    List saved addresses
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('addresses')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('Error listing addresses:', err);
    res.status(500).json({ error: 'Failed to retrieve addresses' });
  }
});

// @route   POST /api/users/addresses
// @desc    Add new address
router.post('/', async (req, res) => {
  const { label, full_address, lat, lng, is_default } = req.body;

  if (!full_address) {
    return res.status(400).json({ error: 'Full address is required' });
  }

  try {
    // If is_default is true, unset other defaults first
    if (is_default) {
      await supabaseAdmin
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', req.user.id);
    }

    const { data, error } = await supabaseAdmin
      .from('addresses')
      .insert({
        user_id: req.user.id,
        label: label || 'Home',
        full_address,
        lat: lat ? parseFloat(lat) : null,
        lng: lng ? parseFloat(lng) : null,
        is_default: !!is_default,
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    console.error('Error creating address:', err);
    res.status(500).json({ error: 'Failed to add address' });
  }
});

// @route   PUT /api/users/addresses/:id
// @desc    Update address
router.put('/:id', async (req, res) => {
  const { label, full_address, lat, lng, is_default } = req.body;

  try {
    if (is_default) {
      await supabaseAdmin
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', req.user.id);
    }

    const { data, error } = await supabaseAdmin
      .from('addresses')
      .update({
        label,
        full_address,
        lat: lat ? parseFloat(lat) : null,
        lng: lng ? parseFloat(lng) : null,
        is_default,
      })
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('Error updating address:', err);
    res.status(500).json({ error: 'Failed to update address' });
  }
});

// @route   DELETE /api/users/addresses/:id
// @desc    Delete address
router.delete('/:id', async (req, res) => {
  try {
    const { error } = await supabaseAdmin
      .from('addresses')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.user.id);

    if (error) throw error;
    res.json({ message: 'Address deleted' });
  } catch (err) {
    console.error('Error deleting address:', err);
    res.status(500).json({ error: 'Failed to delete address' });
  }
});

export default router;
