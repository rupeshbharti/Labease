import { Router } from 'express';
import { supabaseAdmin } from '../services/supabase.js';

const router = Router();

// @route   GET /api/discovery/labs
// @desc    Get nearby live labs with filters and distance calculation
// @access  Public
router.get('/labs', async (req, res) => {
  const { lat, lng, radius_km = 10, rating, sort } = req.query;

  try {
    // If location is provided, compute distance using SQL formula
    let query;
    if (lat && lng) {
      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);
      const radius = parseFloat(radius_km);

      // Raw RPC or custom SQL isn't always available directly through supabase-js unless we make a function.
      // Alternatively, fetch all live labs and calculate distances in Node.js, then sort.
      // For scale, we retrieve live labs, compute distance in JS, and filter/sort. This is very clean and reliable.
      const { data: labs, error } = await supabaseAdmin
        .from('lab_partners')
        .select('*')
        .eq('status', 'live');

      if (error) throw error;

      // Haversine formula in JS
      const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371; // Radius of earth in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
          Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c; // Distance in km
      };

      let nearbyLabs = labs.map(lab => {
        const distance = (lab.lat && lab.lng) ? calculateDistance(userLat, userLng, lab.lat, lab.lng) : null;
        return { ...lab, distance };
      });

      // Filter by radius
      nearbyLabs = nearbyLabs.filter(lab => lab.distance === null || lab.distance <= radius);

      // Filter by rating
      if (rating) {
        nearbyLabs = nearbyLabs.filter(lab => lab.rating_avg >= parseFloat(rating));
      }

      // Sort results
      if (sort === 'nearest') {
        nearbyLabs.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
      } else if (sort === 'rating') {
        nearbyLabs.sort((a, b) => (b.rating_avg || 0) - (a.rating_avg || 0));
      } else {
        // Default sort: created_at
        nearbyLabs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      }

      return res.json(nearbyLabs);
    } else {
      // No lat/lng provided, return all live labs
      let queryBuilder = supabaseAdmin
        .from('lab_partners')
        .select('*')
        .eq('status', 'live');

      if (rating) {
        queryBuilder = queryBuilder.gte('rating_avg', parseFloat(rating));
      }

      if (sort === 'rating') {
        queryBuilder = queryBuilder.order('rating_avg', { ascending: false });
      } else {
        queryBuilder = queryBuilder.order('created_at', { ascending: false });
      }

      const { data, error } = await queryBuilder;
      if (error) throw error;
      return res.json(data);
    }
  } catch (err) {
    console.error('Error fetching discovery labs:', err);
    res.status(500).json({ error: 'Failed to retrieve labs list' });
  }
});

// @route   GET /api/discovery/labs/:id
// @desc    Get detailed lab profile with its active tests and packages
// @access  Public
router.get('/labs/:id', async (req, res) => {
  try {
    const { data: lab, error: labError } = await supabaseAdmin
      .from('lab_partners')
      .select('*')
      .eq('id', req.params.id)
      .eq('status', 'live')
      .single();

    if (labError || !lab) {
      return res.status(404).json({ error: 'Lab not found or is not live' });
    }

    // Fetch tests
    const { data: tests, error: testsError } = await supabaseAdmin
      .from('tests')
      .select('*')
      .eq('lab_id', lab.id)
      .eq('is_active', true);

    if (testsError) throw testsError;

    // Fetch packages
    const { data: packages, error: pkgsError } = await supabaseAdmin
      .from('packages')
      .select('*, package_tests(test_id, tests(id, name, price))')
      .eq('lab_id', lab.id)
      .eq('is_active', true);

    if (pkgsError) throw pkgsError;

    // Fetch reviews
    const { data: reviews, error: reviewsError } = await supabaseAdmin
      .from('reviews')
      .select('*, users!reviews_patient_user_id_fkey(name, avatar_url)')
      .eq('booking_id', lab.id) // Or filtered by lab bookings
      .limit(10);

    res.json({
      ...lab,
      tests: tests || [],
      packages: packages || [],
      reviews: reviews || [],
    });
  } catch (err) {
    console.error('Error fetching lab profile details:', err);
    res.status(500).json({ error: 'Failed to retrieve lab profile details' });
  }
});

// @route   GET /api/discovery/search
// @desc    Search active tests and labs across all live partners
// @access  Public
router.get('/search', async (req, res) => {
  const { query } = req.query;

  if (!query || query.trim().length < 2) {
    return res.json({ labs: [], tests: [] });
  }

  try {
    const searchStr = `%${query.toLowerCase()}%`;

    // Search tests
    const { data: matchingTests, error: testsError } = await supabaseAdmin
      .from('tests')
      .select('*, lab_partners!tests_lab_id_fkey(id, name, rating_avg, status)')
      .eq('is_active', true)
      .eq('lab_partners.status', 'live')
      .or(`name.ilike.${searchStr},code.ilike.${searchStr},category.ilike.${searchStr}`);

    if (testsError) throw testsError;

    // Search labs
    const { data: matchingLabs, error: labsError } = await supabaseAdmin
      .from('lab_partners')
      .select('*')
      .eq('status', 'live')
      .or(`name.ilike.${searchStr},address.ilike.${searchStr}`);

    if (labsError) throw labsError;

    // Filter matchingTests where lab_partners joined correctly
    const validTests = (matchingTests || []).filter(t => t.lab_partners !== null);

    res.json({
      labs: matchingLabs || [],
      tests: validTests || [],
    });
  } catch (err) {
    console.error('Error executing global search:', err);
    res.status(500).json({ error: 'Failed to execute search' });
  }
});

// @route   GET /api/discovery/tests
// @desc    Get active tests from live labs
// @access  Public
router.get('/tests', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('tests')
      .select('*, lab_partners!inner(id, name, status)')
      .eq('is_active', true)
      .eq('lab_partners.status', 'live')
      .limit(10);

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('Error fetching discovery tests:', err);
    res.status(500).json({ error: 'Failed to fetch tests' });
  }
});

// @route   GET /api/discovery/popular-tests
// @desc    Get list of popular tests
// @access  Public
router.get('/popular-tests', async (req, res) => {
  try {
    // Return statically curated popular tests for UI dashboard convenience
    const popular = [
      { name: 'Complete Blood Count (CBC)', category: 'Hematology', desc: 'Evaluates overall health and detects disorders' },
      { name: 'Lipid Profile', category: 'Biochemistry', desc: 'Measures cholesterol and triglyceride levels' },
      { name: 'Thyroid Profile (T3, T4, TSH)', category: 'Hormones', desc: 'Checks thyroid gland function' },
      { name: 'HbA1c (Glycated Haemoglobin)', category: 'Diabetology', desc: 'Monitors average blood sugar level over 3 months' },
      { name: 'Liver Function Test (LFT)', category: 'Biochemistry', desc: 'Checks liver health and enzyme levels' },
      { name: 'Kidney Function Test (KFT)', category: 'Biochemistry', desc: 'Assesses kidney filtration and urea' },
    ];
    res.json(popular);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch popular tests' });
  }
});

// @route   GET /api/discovery/share/:token
// @desc    Retrieve share report details publicly by token
// @access  Public
router.get('/share/:token', async (req, res) => {
  const { token } = req.params;
  try {
    const { data: report, error } = await supabaseAdmin
      .from('reports')
      .select('*, bookings(booking_number, slot_datetime, lab_partners(name))')
      .eq('share_token', token)
      .eq('is_active', true)
      .maybeSingle();

    if (error) throw error;

    if (!report) {
      return res.status(404).json({ error: 'Shared report not found' });
    }

    if (report.share_expires_at && new Date(report.share_expires_at) < new Date()) {
      return res.status(410).json({ error: 'This share link has expired' });
    }

    res.json(report);
  } catch (err) {
    console.error('Error fetching public shared report:', err);
    res.status(500).json({ error: 'Failed to retrieve shared report' });
  }
});

export default router;
