import { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthProvider';
import api from '../utils/api';
import Card from '../shared/Card';
import Button from '../shared/Button';
import Input from '../shared/Input';
import Modal from '../shared/Modal';
import Badge from '../shared/Badge';
import { Plus, Trash2, MapPin, Users, Phone, Mail, Award, Check, Activity, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import './PatientPages.css';

export default function ProfilePage() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  
  // Lists data
  const [addresses, setAddresses] = useState([]);
  const [family, setFamily] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modals state
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isFamilyModalOpen, setIsFamilyModalOpen] = useState(false);

  // Address form fields
  const [addressLabel, setAddressLabel] = useState('Home');
  const [fullAddress, setFullAddress] = useState('');
  const [isDefaultAddress, setIsDefaultAddress] = useState(false);

  // Family member form fields
  const [memberName, setMemberName] = useState('');
  const [memberRelation, setMemberRelation] = useState('Spouse');
  const [memberDob, setMemberDob] = useState('');
  const [memberGender, setMemberGender] = useState('Male');

  const loadProfileResources = async () => {
    setLoading(true);
    try {
      const [addressRes, familyRes] = await Promise.all([
        api.get('/api/users/addresses'),
        api.get('/api/users/family'),
      ]);
      setAddresses(addressRes.data);
      setFamily(familyRes.data);
    } catch (err) {
      console.error('Error loading profile resources:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfileResources();
  }, []);

  // Handle Add Address
  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (!fullAddress.trim()) {
      toast.error('Address cannot be empty');
      return;
    }

    try {
      await api.post('/api/users/addresses', {
        label: addressLabel,
        full_address: fullAddress,
        is_default: isDefaultAddress,
      });
      toast.success('Address added successfully!');
      setIsAddressModalOpen(false);
      setFullAddress('');
      setIsDefaultAddress(false);
      loadProfileResources();
      // Dispatch storage event to live-update Layout TopAppBar location
      window.dispatchEvent(new Event('storage'));
    } catch (err) {
      toast.error(err.message || 'Failed to add address');
    }
  };

  // Handle Delete Address
  const handleDeleteAddress = async (id) => {
    if (!window.confirm('Delete this address?')) return;
    try {
      await api.delete(`/api/users/addresses/${id}`);
      toast.success('Address deleted.');
      loadProfileResources();
      // Dispatch storage event to live-update Layout TopAppBar location
      window.dispatchEvent(new Event('storage'));
    } catch (err) {
      toast.error(err.message || 'Failed to delete address');
    }
  };

  // Handle Add Family Member
  const handleAddFamily = async (e) => {
    e.preventDefault();
    if (!memberName.trim()) {
      toast.error('Name is required');
      return;
    }

    try {
      await api.post('/api/users/family', {
        name: memberName,
        relation: memberRelation,
        dob: memberDob || null,
        gender: memberGender,
      });
      toast.success('Family member added!');
      setIsFamilyModalOpen(false);
      setMemberName('');
      setMemberDob('');
      loadProfileResources();
    } catch (err) {
      toast.error(err.message || 'Failed to add family member');
    }
  };

  // Handle Delete Family Member
  const handleDeleteFamily = async (id) => {
    if (!window.confirm('Remove this family member?')) return;
    try {
      await api.delete(`/api/users/family/${id}`);
      toast.success('Family member removed.');
      loadProfileResources();
    } catch (err) {
      toast.error(err.message || 'Failed to remove family member');
    }
  };

  return (
    <div className="patient-profile animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto', padding: '24px 16px 80px', minHeight: '100vh', backgroundColor: 'var(--surface-container-lowest)' }}>
      <div className="patient-profile__header" style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '28px' }}>
        <div className="patient-profile__avatar" style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary-container) 0%, var(--primary) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: 'bold', color: 'white' }}>
          {profile?.name?.charAt(0)?.toUpperCase() || 'U'}
        </div>
        <div>
          <h1 className="headline-sm" style={{ margin: 0, fontWeight: 700, fontSize: '22px' }}>{profile?.name || 'User Profile'}</h1>
          <p className="body-md text-secondary" style={{ margin: '4px 0 0', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px' }}>
            <Mail size={16} className="text-muted" /> {profile?.email}
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Health History Access Card */}
        <Card style={{ padding: '16px', backgroundColor: 'var(--primary-container)', border: '1px solid var(--primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', borderRadius: 'var(--radius-xl)' }} onClick={() => navigate('/patient/health-history')}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Activity className="text-primary" size={24} />
            <div style={{ textAlign: 'left' }}>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--primary)' }}>View Health History & Trends</h3>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--primary)', opacity: 0.9 }}>Glucose, HbA1c parameter tracking & reports archive</p>
            </div>
          </div>
          <ChevronRight size={20} className="text-primary" />
        </Card>

        {/* Contact Info Card */}
        <Card style={{ padding: '20px', backgroundColor: 'var(--surface-container-lowest)', border: '1px solid var(--outline-variant)' }}>
          <h3 className="title-sm" style={{ margin: '0 0 12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px' }}>
            <Phone size={18} className="text-primary" /> Contact Details
          </h3>
          <p className="body-md" style={{ fontSize: '14px', margin: 0 }}>
            <strong>Phone Number:</strong> {profile?.phone || 'Not configured'}
          </p>
        </Card>

        {/* Saved Addresses Section */}
        <Card style={{ padding: '20px', backgroundColor: 'var(--surface-container-lowest)', border: '1px solid var(--outline-variant)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 className="title-sm" style={{ margin: 0, fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px' }}>
              <MapPin size={18} className="text-primary" /> Saved Addresses
            </h3>
            <Button size="sm" variant="secondary" icon={<Plus size={14} />} onClick={() => setIsAddressModalOpen(true)}>
              Add New
            </Button>
          </div>

          {addresses.length === 0 ? (
            <p className="body-sm text-muted" style={{ padding: '12px 0', textAlign: 'center', fontSize: '13px' }}>
              No addresses saved. Add one to make home sample collection bookings.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {addresses.map(addr => (
                <div
                  key={addr.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px',
                    border: '1px solid var(--outline-variant)',
                    borderRadius: 'var(--radius-lg)',
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <strong style={{ fontSize: '14px', textTransform: 'capitalize' }}>{addr.label}</strong>
                      {addr.is_default && <Badge variant="success">Default</Badge>}
                    </div>
                    <p className="body-sm text-secondary" style={{ margin: '4px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '12px' }}>
                      {addr.full_address}
                    </p>
                  </div>
                  <button
                    type="button"
                    style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer', padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    onClick={() => handleDeleteAddress(addr.id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Family Members Section */}
        <Card style={{ padding: '20px', backgroundColor: 'var(--surface-container-lowest)', border: '1px solid var(--outline-variant)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 className="title-sm" style={{ margin: 0, fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px' }}>
              <Users size={18} className="text-primary" /> Family Members
            </h3>
            <Button size="sm" variant="secondary" icon={<Plus size={14} />} onClick={() => setIsFamilyModalOpen(true)}>
              Add Member
            </Button>
          </div>

          {family.length === 0 ? (
            <p className="body-sm text-muted" style={{ padding: '12px 0', textAlign: 'center', fontSize: '13px' }}>
              No family members registered. You can add family members to book tests on their behalf.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {family.map(member => (
                <div
                  key={member.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px',
                    border: '1px solid var(--outline-variant)',
                    borderRadius: 'var(--radius-lg)',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '14px' }}>{member.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      Relation: {member.relation} • Gender: {member.gender}
                    </div>
                  </div>
                  <button
                    type="button"
                    style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer', padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    onClick={() => handleDeleteFamily(member.id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Referral Card */}
        <Card style={{ padding: '20px', backgroundColor: 'var(--surface-container-lowest)', border: '1px solid var(--outline-variant)' }}>
          <h3 className="title-sm" style={{ margin: '0 0 8px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px' }}>
            <Award size={18} className="text-primary" /> Refer & Earn Discount
          </h3>
          <p className="body-sm text-secondary" style={{ fontSize: '12px', margin: '0 0 16px', lineHeight: 1.4 }}>
            Share your unique referral link code with your family and friends. Both of you will get a discount on bookings when they sign up!
          </p>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <div style={{ flex: 1, padding: '10px', border: '1px dashed var(--primary)', borderRadius: 'var(--radius)', backgroundColor: 'var(--primary-container)', textAlign: 'center', fontSize: '16px', fontWeight: 'bold', letterSpacing: '1px', color: 'var(--primary)' }}>
              {profile?.referral_code || `LBE-${profile?.name?.slice(0, 4).toUpperCase() || 'USER'}99`}
            </div>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                const code = profile?.referral_code || `LBE-${profile?.name?.slice(0, 4).toUpperCase() || 'USER'}99`;
                navigator.clipboard.writeText(code);
                toast.success('Referral code copied to clipboard!');
              }}
            >
              Copy Code
            </Button>
          </div>
        </Card>

        <Button variant="danger" fullWidth onClick={signOut}>
          Sign Out of Account
        </Button>
      </div>

      {/* Address Form Modal */}
      <Modal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        title="Add Saved Address"
        size="sm"
      >
        <form onSubmit={handleAddAddress} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label className="input-group__label">Address Tag / Label</label>
            <select
              className="input-group__input"
              value={addressLabel}
              onChange={(e) => setAddressLabel(e.target.value)}
              style={{ width: '100%', padding: '10px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius)' }}
            >
              <option value="Home">Home 🏠</option>
              <option value="Work">Work 💼</option>
              <option value="Other">Other 📍</option>
            </select>
          </div>

          <Input
            type="text"
            label="Full Address *"
            placeholder="House No, Building, Street Name..."
            value={fullAddress}
            onChange={(e) => setFullAddress(e.target.value)}
            required
          />

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '4px 0' }}>
            <input
              type="checkbox"
              id="isDefaultAddr"
              checked={isDefaultAddress}
              onChange={(e) => setIsDefaultAddress(e.target.checked)}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            <label htmlFor="isDefaultAddr" style={{ fontWeight: 500, cursor: 'pointer', fontSize: '14px' }}>
              Set as default delivery address
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
            <Button type="button" variant="tertiary" onClick={() => setIsAddressModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Address
            </Button>
          </div>
        </form>
      </Modal>

      {/* Family Member Form Modal */}
      <Modal
        isOpen={isFamilyModalOpen}
        onClose={() => setIsFamilyModalOpen(false)}
        title="Add Family Member"
        size="sm"
      >
        <form onSubmit={handleAddFamily} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Input
            type="text"
            label="Full Name *"
            placeholder="Enter full name"
            value={memberName}
            onChange={(e) => setMemberName(e.target.value)}
            required
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label className="input-group__label">Relation *</label>
              <select
                className="input-group__input"
                value={memberRelation}
                onChange={(e) => setMemberRelation(e.target.value)}
                style={{ width: '100%', padding: '10px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius)', height: '48px' }}
                required
              >
                <option value="Spouse">Spouse</option>
                <option value="Father">Father</option>
                <option value="Mother">Mother</option>
                <option value="Child">Child</option>
                <option value="Sibling">Sibling</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="input-group__label">Gender *</label>
              <select
                className="input-group__input"
                value={memberGender}
                onChange={(e) => setMemberGender(e.target.value)}
                style={{ width: '100%', padding: '10px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius)', height: '48px' }}
                required
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <Input
            type="date"
            label="Date of Birth"
            value={memberDob}
            onChange={(e) => setMemberDob(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
            <Button type="button" variant="tertiary" onClick={() => setIsFamilyModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Add Member
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
