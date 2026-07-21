import { Router } from 'express';
import { supabaseAdmin } from '../services/supabase.js';
import verifyToken from '../middleware/auth.js';
import requireRole from '../middleware/roleGuard.js';

const router = Router();

// All routes require authenticated lab_staff
router.use(verifyToken, requireRole('lab_staff'));

// Helper: Verify ownership of a lab
async function verifyLabOwner(userId, labId) {
  const { data, error } = await supabaseAdmin
    .from('lab_partners')
    .select('id')
    .eq('id', labId)
    .eq('owner_user_id', userId)
    .single();

  return !error && !!data;
}

// ============================================================
// TESTS
// ============================================================

// @route   GET /api/labs/:labId/tests
// @desc    List all tests for a lab
router.get('/:labId/tests', async (req, res) => {
  const { labId } = req.params;
  const { active } = req.query;

  if (!(await verifyLabOwner(req.user.id, labId))) {
    return res.status(403).json({ error: 'You do not own this lab' });
  }

  try {
    let query = supabaseAdmin
      .from('tests')
      .select('*')
      .eq('lab_id', labId)
      .order('created_at', { ascending: false });

    if (active !== undefined) {
      query = query.eq('is_active', active === 'true');
    }

    const { data, error } = await query;
    if (error) throw error;

    res.json(data);
  } catch (err) {
    console.error('Error listing tests:', err);
    res.status(500).json({ error: 'Failed to list tests' });
  }
});

// @route   POST /api/labs/:labId/tests
// @desc    Add a new test
router.post('/:labId/tests', async (req, res) => {
  const { labId } = req.params;
  const { name, code, description, sample_type, preparation_instructions, turnaround_hours, price, category } = req.body;

  if (!(await verifyLabOwner(req.user.id, labId))) {
    return res.status(403).json({ error: 'You do not own this lab' });
  }

  if (!name || !price) {
    return res.status(400).json({ error: 'Test name and price are required' });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('tests')
      .insert({
        lab_id: labId,
        name,
        code: code || null,
        description: description || null,
        sample_type: sample_type || null,
        preparation_instructions: preparation_instructions || null,
        turnaround_hours: turnaround_hours ? parseInt(turnaround_hours) : null,
        price: parseFloat(price),
        category: category || null,
        is_active: true,
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    console.error('Error creating test:', err);
    res.status(500).json({ error: 'Failed to create test' });
  }
});

// @route   PUT /api/labs/:labId/tests/:testId
// @desc    Update a test
router.put('/:labId/tests/:testId', async (req, res) => {
  const { labId, testId } = req.params;
  const { name, code, description, sample_type, preparation_instructions, turnaround_hours, price, category, is_active } = req.body;

  if (!(await verifyLabOwner(req.user.id, labId))) {
    return res.status(403).json({ error: 'You do not own this lab' });
  }

  try {
    const updateData = { updated_at: new Date().toISOString() };
    if (name !== undefined) updateData.name = name;
    if (code !== undefined) updateData.code = code;
    if (description !== undefined) updateData.description = description;
    if (sample_type !== undefined) updateData.sample_type = sample_type;
    if (preparation_instructions !== undefined) updateData.preparation_instructions = preparation_instructions;
    if (turnaround_hours !== undefined) updateData.turnaround_hours = turnaround_hours ? parseInt(turnaround_hours) : null;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (category !== undefined) updateData.category = category;
    if (is_active !== undefined) updateData.is_active = is_active;

    const { data, error } = await supabaseAdmin
      .from('tests')
      .update(updateData)
      .eq('id', testId)
      .eq('lab_id', labId)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('Error updating test:', err);
    res.status(500).json({ error: 'Failed to update test' });
  }
});

// @route   DELETE /api/labs/:labId/tests/:testId
// @desc    Deactivate (archive) a test
router.delete('/:labId/tests/:testId', async (req, res) => {
  const { labId, testId } = req.params;

  if (!(await verifyLabOwner(req.user.id, labId))) {
    return res.status(403).json({ error: 'You do not own this lab' });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('tests')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', testId)
      .eq('lab_id', labId)
      .select()
      .single();

    if (error) throw error;
    res.json({ message: 'Test archived', data });
  } catch (err) {
    console.error('Error archiving test:', err);
    res.status(500).json({ error: 'Failed to archive test' });
  }
});

// ============================================================
// PACKAGES
// ============================================================

// @route   GET /api/labs/:labId/packages
// @desc    List all packages with their tests
router.get('/:labId/packages', async (req, res) => {
  const { labId } = req.params;

  if (!(await verifyLabOwner(req.user.id, labId))) {
    return res.status(403).json({ error: 'You do not own this lab' });
  }

  try {
    const { data: packages, error } = await supabaseAdmin
      .from('packages')
      .select('*, package_tests(test_id, tests(id, name, price))')
      .eq('lab_id', labId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(packages);
  } catch (err) {
    console.error('Error listing packages:', err);
    res.status(500).json({ error: 'Failed to list packages' });
  }
});

// @route   POST /api/labs/:labId/packages
// @desc    Create a new package with linked tests
router.post('/:labId/packages', async (req, res) => {
  const { labId } = req.params;
  const { name, description, price, test_ids } = req.body;

  if (!(await verifyLabOwner(req.user.id, labId))) {
    return res.status(403).json({ error: 'You do not own this lab' });
  }

  if (!name || !price) {
    return res.status(400).json({ error: 'Package name and price are required' });
  }

  try {
    // Create package
    const { data: pkg, error: pkgError } = await supabaseAdmin
      .from('packages')
      .insert({
        lab_id: labId,
        name,
        description: description || null,
        price: parseFloat(price),
        is_active: true,
      })
      .select()
      .single();

    if (pkgError) throw pkgError;

    // Link tests to package
    if (test_ids && test_ids.length > 0) {
      const links = test_ids.map(tid => ({
        package_id: pkg.id,
        test_id: tid,
      }));

      const { error: linkError } = await supabaseAdmin
        .from('package_tests')
        .insert(links);

      if (linkError) throw linkError;
    }

    // Refetch with test details
    const { data: fullPkg, error: fetchError } = await supabaseAdmin
      .from('packages')
      .select('*, package_tests(test_id, tests(id, name, price))')
      .eq('id', pkg.id)
      .single();

    if (fetchError) throw fetchError;

    res.status(201).json(fullPkg);
  } catch (err) {
    console.error('Error creating package:', err);
    res.status(500).json({ error: 'Failed to create package' });
  }
});

// @route   PUT /api/labs/:labId/packages/:packageId
// @desc    Update a package (name, price, description, test links)
router.put('/:labId/packages/:packageId', async (req, res) => {
  const { labId, packageId } = req.params;
  const { name, description, price, is_active, test_ids } = req.body;

  if (!(await verifyLabOwner(req.user.id, labId))) {
    return res.status(403).json({ error: 'You do not own this lab' });
  }

  try {
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (is_active !== undefined) updateData.is_active = is_active;

    const { error: updateError } = await supabaseAdmin
      .from('packages')
      .update(updateData)
      .eq('id', packageId)
      .eq('lab_id', labId);

    if (updateError) throw updateError;

    // Update test links if provided
    if (test_ids !== undefined) {
      // Remove old links
      await supabaseAdmin
        .from('package_tests')
        .delete()
        .eq('package_id', packageId);

      // Insert new links
      if (test_ids.length > 0) {
        const links = test_ids.map(tid => ({
          package_id: packageId,
          test_id: tid,
        }));

        const { error: linkError } = await supabaseAdmin
          .from('package_tests')
          .insert(links);

        if (linkError) throw linkError;
      }
    }

    // Refetch with test details
    const { data: fullPkg, error: fetchError } = await supabaseAdmin
      .from('packages')
      .select('*, package_tests(test_id, tests(id, name, price))')
      .eq('id', packageId)
      .single();

    if (fetchError) throw fetchError;

    res.json(fullPkg);
  } catch (err) {
    console.error('Error updating package:', err);
    res.status(500).json({ error: 'Failed to update package' });
  }
});

export default router;
