import { Router } from 'express';
import { supabaseAdmin } from '../services/supabase.js';
import verifyToken from '../middleware/auth.js';

const router = Router();

router.use(verifyToken);

// @route   GET /api/users/family
// @desc    List family members for current patient
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('family_members')
      .select('*')
      .eq('patient_user_id', req.user.id);

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('Error listing family members:', err);
    res.status(500).json({ error: 'Failed to retrieve family members' });
  }
});

// @route   POST /api/users/family
// @desc    Add family member
router.post('/', async (req, res) => {
  const { name, dob, gender, relation } = req.body;

  if (!name || !relation) {
    return res.status(400).json({ error: 'Name and relation are required' });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('family_members')
      .insert({
        patient_user_id: req.user.id,
        name,
        dob: dob || null,
        gender: gender || null,
        relation,
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    console.error('Error adding family member:', err);
    res.status(500).json({ error: 'Failed to add family member' });
  }
});

// @route   PUT /api/users/family/:id
// @desc    Update family member
router.put('/:id', async (req, res) => {
  const { name, dob, gender, relation } = req.body;

  try {
    const { data, error } = await supabaseAdmin
      .from('family_members')
      .update({
        name,
        dob,
        gender,
        relation,
      })
      .eq('id', req.params.id)
      .eq('patient_user_id', req.user.id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('Error updating family member:', err);
    res.status(500).json({ error: 'Failed to update family member' });
  }
});

// @route   DELETE /api/users/family/:id
// @desc    Remove family member
router.delete('/:id', async (req, res) => {
  try {
    const { error } = await supabaseAdmin
      .from('family_members')
      .delete()
      .eq('id', req.params.id)
      .eq('patient_user_id', req.user.id);

    if (error) throw error;
    res.json({ message: 'Family member removed' });
  } catch (err) {
    console.error('Error deleting family member:', err);
    res.status(500).json({ error: 'Failed to delete family member' });
  }
});

export default router;
