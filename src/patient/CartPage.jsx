import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from './CartContext';
import api from '../utils/api';
import Button from '../shared/Button';
import Card from '../shared/Card';
import Input from '../shared/Input';
import LoadingSpinner from '../shared/LoadingSpinner';
import { Trash2, Calendar, MapPin, User, ChevronRight, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CartPage() {
  const navigate = useNavigate();
  const { cartItems, labId, removeFromCart, clearCart, getSubtotal } = useCart();

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // checkout options lists
  const [familyMembers, setFamilyMembers] = useState([]);
  const [addresses, setAddresses] = useState([]);

  // form selection state
  const [selectedFamilyId, setSelectedFamilyId] = useState(''); // Empty = Self
  const [collectionMode, setCollectionMode] = useState('home_collection');
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [slotDate, setSlotDate] = useState('');
  const [slotTime, setSlotTime] = useState('');
  const [notes, setNotes] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [appliedPromo, setAppliedPromo] = useState('');
  const [applyingPromo, setApplyingPromo] = useState(false);

  const handleApplyPromo = async () => {
    if (!promoCode) return;
    setApplyingPromo(true);
    try {
      const res = await api.post('/api/promo/apply', {
        code: promoCode,
        order_amount: getSubtotal()
      });
      setPromoDiscount(res.data.discount_amount);
      setAppliedPromo(res.data.code);
      toast.success(`Coupon ${res.data.code} applied successfully! Discount: ₹${res.data.discount_amount}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid or expired coupon code');
      setPromoDiscount(0);
      setAppliedPromo('');
    } finally {
      setApplyingPromo(false);
    }
  };

  // Fetch family members and addresses on load
  useEffect(() => {
    if (cartItems.length === 0) return;

    async function loadCheckoutData() {
      setLoading(true);
      try {
        const [familyRes, addressRes] = await Promise.all([
          api.get('/api/users/family'),
          api.get('/api/users/addresses'),
        ]);
        setFamilyMembers(familyRes.data);
        setAddresses(addressRes.data);

        // Auto-select default address if available
        const defaultAddr = addressRes.data.find(a => a.is_default);
        if (defaultAddr) setSelectedAddressId(defaultAddr.id);
        else if (addressRes.data.length > 0) setSelectedAddressId(addressRes.data[0].id);
      } catch (err) {
        console.error('Error loading checkout resources:', err);
        toast.error('Failed to load profile details.');
      } finally {
        setLoading(false);
      }
    }

    loadCheckoutData();
  }, [cartItems]);

  const handleCheckout = async (e) => {
    e.preventDefault();

    if (cartItems.length === 0) return;

    if (collectionMode === 'home_collection' && !selectedAddressId) {
      toast.error('Please select a collection address');
      return;
    }

    if (!slotDate || !slotTime) {
      toast.error('Please select a preferred date and time slot');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        lab_id: labId,
        family_member_id: selectedFamilyId || null,
        collection_mode: collectionMode,
        address_id: collectionMode === 'home_collection' ? selectedAddressId : null,
        slot_datetime: new Date(`${slotDate}T${slotTime}:00`).toISOString(),
        items: cartItems.map(item => ({ id: item.id, isPackage: !!item.isPackage })),
        notes,
        promo_code: appliedPromo || null,
      };

      const res = await api.post('/api/bookings', payload);
      clearCart();
      toast.success('Order booked successfully!');
      navigate(`/patient/booking-confirmed/${res.data.id}`);
    } catch (err) {
      toast.error(err.message || 'Failed to place booking');
    } finally {
      setSubmitting(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div style={{ padding: '40px 16px', textAlign: 'center', maxWidth: '400px', margin: '80px auto' }}>
        <AlertCircle size={48} className="text-muted" style={{ marginBottom: '16px' }} />
        <h2 className="headline-sm">Your Cart is Empty</h2>
        <p className="body-md text-secondary" style={{ margin: '8px 0 24px' }}>
          Explore recommended labs near you and add tests to book.
        </p>
        <Button onClick={() => navigate('/patient')} fullWidth>
          Browse Labs
        </Button>
      </div>
    );
  }

  if (loading) return <LoadingSpinner fullPage text="Preparing checkout details..." />;

  // Dynamic slot hours configuration
  const timeSlots = [
    '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'
  ];

  return (
    <div className="cart-page" style={{ padding: '20px 16px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 className="headline-sm" style={{ marginBottom: '20px', fontWeight: 600 }}>Checkout Details</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
        {/* Left Side: Order items list */}
        <div>
          <Card style={{ padding: '16px', marginBottom: '20px' }}>
            <h3 className="title-md" style={{ margin: '0 0 16px', fontWeight: 600 }}>Selected Tests</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {cartItems.map(item => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>{item.name}</h4>
                    <span className="body-sm text-secondary">
                      {item.isPackage ? 'Bundled Package' : `Code: ${item.code || 'N/A'}`}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span style={{ fontWeight: 600 }}>₹{item.price}</span>
                    <button
                      type="button"
                      style={{ border: 'none', background: 'none', color: 'var(--error)', cursor: 'pointer' }}
                      onClick={() => removeFromCart(item.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {/* Promo code entry */}
            <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
              <h4 style={{ margin: '0 0 8px', fontSize: '13px', fontWeight: 600 }}>Promo Code / Coupon</h4>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="e.g. FIRST50"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  style={{ flex: 1, padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius)', fontSize: '13px' }}
                />
                <Button type="button" variant="secondary" size="sm" onClick={handleApplyPromo} loading={applyingPromo}>
                  Apply
                </Button>
              </div>
              {appliedPromo && (
                <div style={{ fontSize: '12px', color: 'var(--success)', marginTop: '6px', fontWeight: 600 }}>
                  ✓ Coupon {appliedPromo} applied successfully!
                </div>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text-secondary)' }}>
                <span>Subtotal:</span>
                <span>₹{getSubtotal()}</span>
              </div>
              {promoDiscount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--success)', fontWeight: 600 }}>
                  <span>Discount:</span>
                  <span>-₹{promoDiscount}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '15px', marginTop: '4px' }}>
                <span>Total Amount:</span>
                <span>₹{getSubtotal() - promoDiscount}</span>
              </div>
            </div>
          </Card>

          {/* Checkout Details Form */}
          <form onSubmit={handleCheckout}>
            {/* Patient Selector */}
            <Card style={{ padding: '16px', marginBottom: '20px' }}>
              <h3 className="title-md" style={{ margin: '0 0 12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User size={18} className="text-primary" /> Select Patient
              </h3>
              <select
                className="input-group__input"
                value={selectedFamilyId}
                onChange={(e) => setSelectedFamilyId(e.target.value)}
                style={{ width: '100%', padding: '10px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius)' }}
              >
                <option value="">Myself</option>
                {familyMembers.map(member => (
                  <option key={member.id} value={member.id}>
                    {member.name} ({member.relation})
                  </option>
                ))}
              </select>
            </Card>

            {/* Collection Mode */}
            <Card style={{ padding: '16px', marginBottom: '20px' }}>
              <h3 className="title-md" style={{ margin: '0 0 12px', fontWeight: 600 }}>Collection Mode</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <button
                  type="button"
                  className={`button ${collectionMode === 'home_collection' ? 'button--primary' : 'button--secondary'}`}
                  onClick={() => setCollectionMode('home_collection')}
                >
                  Home Collection
                </button>
                <button
                  type="button"
                  className={`button ${collectionMode === 'walk_in' ? 'button--primary' : 'button--secondary'}`}
                  onClick={() => setCollectionMode('walk_in')}
                >
                  Walk-In at Lab
                </button>
              </div>
            </Card>

            {/* Address Selection (For Home Collection) */}
            {collectionMode === 'home_collection' && (
              <Card style={{ padding: '16px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h3 className="title-md" style={{ margin: 0, fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MapPin size={18} className="text-primary" /> Select Address
                  </h3>
                  <Button size="sm" variant="tertiary" onClick={() => navigate('/patient/profile')}>
                    Manage Addresses
                  </Button>
                </div>
                {addresses.length === 0 ? (
                  <div style={{ padding: '12px', textAlign: 'center', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius)' }}>
                    <p className="body-sm text-secondary" style={{ marginBottom: '8px' }}>No saved addresses found.</p>
                    <Button size="sm" onClick={() => navigate('/patient/profile')}>Add Address</Button>
                  </div>
                ) : (
                  <select
                    className="input-group__input"
                    value={selectedAddressId}
                    onChange={(e) => setSelectedAddressId(e.target.value)}
                    style={{ width: '100%', padding: '10px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius)' }}
                  >
                    {addresses.map(addr => (
                      <option key={addr.id} value={addr.id}>
                        {addr.label}: {addr.full_address}
                      </option>
                    ))}
                  </select>
                )}
              </Card>
            )}

            {/* Slot Selection */}
            <Card style={{ padding: '16px', marginBottom: '20px' }}>
              <h3 className="title-md" style={{ margin: '0 0 12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={18} className="text-primary" /> Choose Time Slot
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <Input
                  type="date"
                  label="Preferred Date"
                  value={slotDate}
                  onChange={(e) => setSlotDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
                <div>
                  <label className="input-group__label">Preferred Time</label>
                  <select
                    className="input-group__input"
                    value={slotTime}
                    onChange={(e) => setSlotTime(e.target.value)}
                    style={{ height: '48px', padding: '10px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius)' }}
                    required
                  >
                    <option value="">Select Time</option>
                    {timeSlots.map(t => (
                      <option key={t} value={t}>{t} AM/PM</option>
                    ))}
                  </select>
                </div>
              </div>
            </Card>

            {/* Notes */}
            <Card style={{ padding: '16px', marginBottom: '24px' }}>
              <label className="input-group__label" style={{ fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                Additional Notes (Optional)
              </label>
              <textarea
                className="input-group__input"
                rows="2"
                placeholder="e.g. Ring bell on second floor, patient is diabetic..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                style={{ width: '100%', padding: '12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius)' }}
              />
            </Card>

            <Button type="submit" variant="primary" size="lg" fullWidth loading={submitting}>
              Confirm Booking & Pay
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
