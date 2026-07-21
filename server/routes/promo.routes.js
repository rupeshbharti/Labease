import { Router } from 'express';
import { supabaseAdmin } from '../services/supabase.js';
import verifyToken from '../middleware/auth.js';

const router = Router();

// Protect all routes to authenticated users
router.use(verifyToken);

// @route   POST /api/promo/apply
// @desc    Validate and apply a coupon promo code
router.post('/apply', async (req, res) => {
  const { code, order_amount } = req.body;

  if (!code || order_amount === undefined) {
    return res.status(400).json({ error: 'Promo coupon code and order amount are required' });
  }

  try {
    // Fetch coupon promo code
    const { data: promo, error } = await supabaseAdmin
      .from('promo_codes')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('is_active', true)
      .maybeSingle();

    if (error) throw error;

    if (!promo) {
      return res.status(404).json({ error: 'Invalid coupon code' });
    }

    // Verify dates
    const today = new Date();
    if (promo.start_date && new Date(promo.start_date) > today) {
      return res.status(400).json({ error: 'This coupon code is not active yet' });
    }
    if (promo.end_date && new Date(promo.end_date) < today) {
      return res.status(400).json({ error: 'This coupon code has expired' });
    }

    // Verify usage limits
    if (promo.usage_limit && promo.usage_count >= promo.usage_limit) {
      return res.status(400).json({ error: 'This coupon usage limit has been reached' });
    }

    // Verify minimum order value
    if (promo.min_order_value && Number(order_amount) < Number(promo.min_order_value)) {
      return res.status(400).json({
        error: `Minimum order value of ₹${promo.min_order_value} required for this coupon`
      });
    }

    // Calculate discount amount
    let discount = 0;
    const amountVal = Number(order_amount);
    const valueVal = Number(promo.value);

    if (promo.type === 'percentage') {
      discount = amountVal * (valueVal / 100);
      if (promo.max_discount && discount > Number(promo.max_discount)) {
        discount = Number(promo.max_discount);
      }
    } else if (promo.type === 'fixed') {
      discount = valueVal;
    }

    // Cap discount to order amount
    if (discount > amountVal) {
      discount = amountVal;
    }

    res.json({
      code: promo.code,
      discount_amount: Math.round(discount),
      final_amount: Math.round(amountVal - discount),
      type: promo.type,
      value: promo.value
    });
  } catch (err) {
    console.error('Error applying promo code:', err);
    res.status(500).json({ error: 'Failed to apply coupon promo code' });
  }
});

// @route   GET /api/promo/list
// @desc    List all active public promo codes
router.get('/list', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const { data: promos, error } = await supabaseAdmin
      .from('promo_codes')
      .select('code, type, value, min_order_value, end_date')
      .eq('is_active', true)
      .or(`end_date.gt.${today},end_date.is.null`);

    if (error) throw error;
    res.json(promos);
  } catch (err) {
    console.error('Error listing promos:', err);
    res.status(500).json({ error: 'Failed to retrieve promo codes' });
  }
});

export default router;
