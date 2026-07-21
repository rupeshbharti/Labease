import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, User } from 'lucide-react';
import { useAuth } from './AuthProvider';
import { USER_ROLES, ROLE_LABELS } from '../config/constants';
import Button from '../shared/Button';
import Input from '../shared/Input';
import toast from 'react-hot-toast';
import './AuthPages.css';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { signUp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const roleOptions = [
    { value: USER_ROLES.PATIENT, label: ROLE_LABELS[USER_ROLES.PATIENT], desc: 'Book diagnostic tests from labs near you', emoji: '🧑‍⚕️' },
    { value: USER_ROLES.LAB_STAFF, label: ROLE_LABELS[USER_ROLES.LAB_STAFF], desc: 'List your lab and manage orders', emoji: '🏥' },
    { value: USER_ROLES.PHLEBOTOMIST, label: ROLE_LABELS[USER_ROLES.PHLEBOTOMIST], desc: 'Collect samples and manage tasks', emoji: '🚴' },
  ];

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!name || !email || !password || !role) {
      toast.error('Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const { error } = await signUp(email, password, {
        name,
        role,
      });

      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Account created! Please complete your profile.');
        navigate('/profile-setup', { state: { name, role } });
      }
    } catch (err) {
      toast.error('Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    const { error } = await signInWithGoogle();
    if (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-page__container auth-page__container--wide animate-fade-in-up">
        <div className="auth-page__header">
          <div className="auth-page__logo">L</div>
          <h1 className="headline-lg">Create your account</h1>
          <p className="body-lg text-muted">Join LabEase and get started</p>
        </div>

        <form onSubmit={handleSignup} className="auth-form">
          <Input
            label="Full Name"
            type="text"
            placeholder="Enter your full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
          />

          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />

          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Min. 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            }
          />

          <Input
            label="Confirm Password"
            type="password"
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
          />

          {/* Role Selection */}
          <div className="form-group">
            <label className="input-group__label">I am a...</label>
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
                  <span className="role-card__desc">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <Button type="submit" fullWidth size="lg" loading={loading}>
            Create Account
          </Button>
        </form>

        <div className="auth-divider">
          <span>or</span>
        </div>

        <Button
          variant="secondary"
          fullWidth
          size="lg"
          onClick={handleGoogleSignup}
          icon={
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
              <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.997 8.997 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
          }
        >
          Continue with Google
        </Button>

        <p className="auth-page__footer body-sm">
          Already have an account?{' '}
          <Link to="/login" className="auth-page__link">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
