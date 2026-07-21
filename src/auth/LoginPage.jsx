import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Phone } from 'lucide-react';
import { useAuth } from './AuthProvider';
import Button from '../shared/Button';
import Input from '../shared/Input';
import toast from 'react-hot-toast';
import './AuthPages.css';

export default function LoginPage() {
  const [mode, setMode] = useState('email'); // 'email' | 'phone'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const { signIn, signInWithOtp, verifyOtp, signInWithGoogle, getDashboardPath } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || null;

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter email and password');
      return;
    }
    setLoading(true);
    try {
      const { error } = await signIn(email, password);
      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Welcome back!');
        // Small delay to let profile load
        setTimeout(() => {
          navigate(from || getDashboardPath(), { replace: true });
        }, 500);
      }
    } catch (err) {
      toast.error('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    if (!phone) {
      toast.error('Please enter your phone number');
      return;
    }
    setLoading(true);
    try {
      const { error } = await signInWithOtp(phone);
      if (error) {
        toast.error(error.message);
      } else {
        setOtpSent(true);
        toast.success('OTP sent!');
      }
    } catch (err) {
      toast.error('Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp) {
      toast.error('Please enter the OTP');
      return;
    }
    setLoading(true);
    try {
      const { error } = await verifyOtp(phone, otp);
      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Verified!');
        setTimeout(() => {
          navigate(from || getDashboardPath(), { replace: true });
        }, 500);
      }
    } catch (err) {
      toast.error('Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const { error } = await signInWithGoogle();
    if (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-page__container animate-fade-in-up">
        <div className="auth-page__header">
          <div className="auth-page__logo">L</div>
          <h1 className="headline-lg">Welcome to LabEase</h1>
          <p className="body-lg text-muted">Sign in to your account</p>
        </div>

        {/* Tab switcher */}
        <div className="auth-tabs">
          <button
            className={`auth-tab ${mode === 'email' ? 'auth-tab--active' : ''}`}
            onClick={() => { setMode('email'); setOtpSent(false); }}
          >
            <Mail size={16} /> Email
          </button>
          <button
            className={`auth-tab ${mode === 'phone' ? 'auth-tab--active' : ''}`}
            onClick={() => { setMode('phone'); setOtpSent(false); }}
          >
            <Phone size={16} /> Phone
          </button>
        </div>

        {mode === 'email' ? (
          <form onSubmit={handleEmailLogin} className="auth-form">
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
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
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
            <Button type="submit" fullWidth size="lg" loading={loading}>
              Sign In
            </Button>
          </form>
        ) : (
          <form onSubmit={otpSent ? handleVerifyOtp : (e) => { e.preventDefault(); handleSendOtp(); }} className="auth-form">
            <Input
              label="Phone Number"
              type="tel"
              placeholder="+91 9876543210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={otpSent}
            />
            {otpSent && (
              <Input
                label="OTP"
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
              />
            )}
            <Button type="submit" fullWidth size="lg" loading={loading}>
              {otpSent ? 'Verify OTP' : 'Send OTP'}
            </Button>
            {otpSent && (
              <Button variant="tertiary" onClick={handleSendOtp} disabled={loading}>
                Resend OTP
              </Button>
            )}
          </form>
        )}

        <div className="auth-divider">
          <span>or</span>
        </div>

        <Button
          variant="secondary"
          fullWidth
          size="lg"
          onClick={handleGoogleLogin}
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
          Don't have an account?{' '}
          <Link to="/signup" className="auth-page__link">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
