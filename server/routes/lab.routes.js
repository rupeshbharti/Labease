import { Router } from 'express';
import { supabaseAdmin } from '../services/supabase.js';
import verifyToken from '../middleware/auth.js';
import requireRole from '../middleware/roleGuard.js';

const router = Router();

// Helper: Verify if current user is owner of the lab
async function checkLabOwnership(userId, labId) {
  const { data: lab, error } = await supabaseAdmin
    .from('lab_partners')
    .select('id, owner_user_id')
    .eq('id', labId)
    .single();

  if (error || !lab) return false;
  return lab.owner_user_id === userId;
}

// @route   POST /api/labs/onboard
// @desc    Submit lab onboarding application
// @access  Private (lab_staff only)
router.post('/onboard', verifyToken, requireRole('lab_staff'), async (req, res) => {
  const { name, description, address, lat, lng, service_radius_km, nabl_certificate_url } = req.body;

  if (!name || !address) {
    return res.status(400).json({ error: 'Name and address are required' });
  }

  try {
    // Check if owner already has a lab registered
    const { data: existingLab } = await supabaseAdmin
      .from('lab_partners')
      .select('id')
      .eq('owner_user_id', req.user.id)
      .single();

    if (existingLab) {
      return res.status(400).json({ error: 'You have already registered a lab application' });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Math.floor(1000 + Math.random() * 9000);

    const { data: lab, error } = await supabaseAdmin
      .from('lab_partners')
      .insert({
        owner_user_id: req.user.id,
        name,
        slug,
        description,
        address,
        lat: lat ? parseFloat(lat) : null,
        lng: lng ? parseFloat(lng) : null,
        service_radius_km: service_radius_km ? parseFloat(service_radius_km) : 10,
        nabl_certificate_url,
        status: 'pending_review',
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(lab);
  } catch (err) {
    console.error('Error on boarding lab:', err);
    res.status(500).json({ error: 'Failed to submit onboarding application' });
  }
});

// @route   GET /api/labs/:id
// @desc    Get lab profile details
// @access  Public / Private
router.get('/:id', async (req, res) => {
  try {
    const { data: lab, error } = await supabaseAdmin
      .from('lab_partners')
      .select('*, users!lab_partners_owner_user_id_fkey(name, email, phone)')
      .eq('id', req.params.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Lab not found' });
      }
      throw error;
    }

    res.json(lab);
  } catch (err) {
    console.error('Error fetching lab profile:', err);
    res.status(500).json({ error: 'Failed to fetch lab details' });
  }
});

// @route   PUT /api/labs/:id
// @desc    Update lab profile details
// @access  Private (lab_staff owner)
router.put('/:id', verifyToken, requireRole('lab_staff'), async (req, res) => {
  const { name, description, logo_url, photos, address } = req.body;
  const isOwner = await checkLabOwnership(req.user.id, req.params.id);

  if (!isOwner) {
    return res.status(403).json({ error: 'Unauthorized: You do not own this lab' });
  }

  try {
    const { data: lab, error } = await supabaseAdmin
      .from('lab_partners')
      .update({
        name,
        description,
        logo_url,
        photos,
        address,
        updated_at: new Date().toISOString(),
      })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;

    res.json(lab);
  } catch (err) {
    console.error('Error updating lab profile:', err);
    res.status(500).json({ error: 'Failed to update lab profile' });
  }
});

// @route   PUT /api/labs/:id/service-area
// @desc    Set home collection service area radius/polygon
// @access  Private (lab_staff owner)
router.put('/:id/service-area', verifyToken, requireRole('lab_staff'), async (req, res) => {
  const { service_radius_km, lat, lng } = req.body;
  const isOwner = await checkLabOwnership(req.user.id, req.params.id);

  if (!isOwner) {
    return res.status(403).json({ error: 'Unauthorized: You do not own this lab' });
  }

  try {
    const { data: lab, error } = await supabaseAdmin
      .from('lab_partners')
      .update({
        service_radius_km: parseFloat(service_radius_km) || 10,
        lat: lat ? parseFloat(lat) : null,
        lng: lng ? parseFloat(lng) : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;

    res.json(lab);
  } catch (err) {
    console.error('Error updating service area:', err);
    res.status(500).json({ error: 'Failed to update service area' });
  }
});

// @route   PUT /api/labs/:id/slots
// @desc    Configure available collection time slots per day
// @access  Private (lab_staff owner)
router.put('/:id/slots', verifyToken, requireRole('lab_staff'), async (req, res) => {
  const { working_hours } = req.body; // JSON object representing slot configuration
  const isOwner = await checkLabOwnership(req.user.id, req.params.id);

  if (!isOwner) {
    return res.status(403).json({ error: 'Unauthorized: You do not own this lab' });
  }

  try {
    const { data: lab, error } = await supabaseAdmin
      .from('lab_partners')
      .update({
        working_hours,
        updated_at: new Date().toISOString(),
      })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;

    res.json(lab);
  } catch (err) {
    console.error('Error updating time slots:', err);
    res.status(500).json({ error: 'Failed to update time slots' });
  }
});

export default router;
