import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { USER_ROLES, ROLE_LABELS, ROLE_DASHBOARDS } from '../config/constants';
import Button from '../shared/Button';
import Input from '../shared/Input';
import toast from 'react-hot-toast';
import './AuthPages.css';

export default function ProfileSetup() {
  const { user, profile, setupProfile, getDashboardPath } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [name, setName] = useState(location.state?.name || user?.user_metadata?.name || '');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState(location.state?.role || user?.user_metadata?.role || '');
  const [loading, setLoading] = useState(false);

  // If profile already exists, redirect to dashboard
  useEffect(() => {
    if (profile?.role) {
      navigate(ROLE_DASHBOARDS[profile.role] || '/', { replace: true });
    }
  }, [profile, navigate]);

  const roleOptions = [
    { value: USER_ROLES.PATIENT, label: ROLE_LABELS[USER_ROLES.PATIENT], emoji: '🧑‍⚕️' },
    { value: USER_ROLES.LAB_STAFF, label: ROLE_LABELS[USER_ROLES.LAB_STAFF], emoji: '🏥' },
    { value: USER_ROLES.PHLEBOTOMIST, label: ROLE_LABELS[USER_ROLES.PHLEBOTOMIST], emoji: '🚴' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log('ProfileSetup: handleSubmit called', { name, phone, role, user: user?.id });

    if (!name || !role) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      console.log('ProfileSetup: calling setupProfile...');
      const result = await setupProfile({
        name,
        phone: phone || null,
        role,
      });

      console.log('ProfileSetup: setupProfile result:', result);

      if (result.error) {
        toast.error(result.error.message || 'Failed to save profile');
      } else {
        toast.success('Profile saved!');
        navigate(ROLE_DASHBOARDS[role] || '/', { replace: true });
      }
    } catch (err) {
      console.error('ProfileSetup: unexpected error:', err);
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-page__container animate-fade-in-up">
        <div className="auth-page__header">
          <div className="auth-page__logo">L</div>
          <h1 className="headline-lg">Complete Your Profile</h1>
          <p className="body-lg text-muted">Just a few more details to get started</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <Input
            label="Full Name *"
            type="text"
            placeholder="Enter your full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <Input
            label="Phone Number"
            type="tel"
            placeholder="+91 9876543210"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          {!role && (
            <div className="form-group">
              <label className="input-group__label">Select your role *</label>
              <div className="role-selector">
                {roleOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    className={`role-card ${role === opt.value ? 'role-card--selected' : ''}`}
                    onClick={() => setRole(opt.value)}
                  >
                    <span className="role-card__emoji">{opt.emoji}</span>
                    <span className="role-card__label">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {role && (
            <div className="profile-setup__role-badge">
              <span className="body-sm text-muted">Signing up as</span>
              <span className="title-md">{ROLE_LABELS[role]}</span>
            </div>
          )}

          <Button type="submit" fullWidth size="lg" loading={loading}>
            Complete Setup
          </Button>
        </form>
      </div>
    </div>
  );
}
