import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Activity,
  ShieldCheck,
  MapPin,
  FileText,
  Clock,
  Users,
  CheckCircle2,
  ArrowRight,
  Star,
  Award,
  TrendingUp,
  Sparkles,
  Smartphone,
  HeartPulse,
  Building2,
  UserCheck,
  ChevronRight,
  Search,
  Lock,
} from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';
import Button from '../shared/Button';
import Card from '../shared/Card';
import Badge from '../shared/Badge';
import './LandingPage.css';

export default function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated, profile, loading } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getDashboardPath = () => {
    if (!profile) return '/patient';
    const dashboards = {
      patient: '/patient',
      lab_staff: '/lab',
      phlebotomist: '/phlebo',
      platform_admin: '/admin',
    };
    return dashboards[profile.role] || '/patient';
  };

  return (
    <div className="landing-page">
      {/* Top Navbar */}
      <header className={`landing-header ${scrolled ? 'landing-header--scrolled' : ''}`}>
        <div className="landing-header__container">
          <Link to="/" className="landing-brand">
            <div className="landing-brand__logo">
              <Activity size={22} className="text-primary" />
            </div>
            <span className="landing-brand__name">LabEase</span>
          </Link>

          <nav className="landing-nav">
            <a href="#features" className="landing-nav__link">Features</a>
            <a href="#how-it-works" className="landing-nav__link">How It Works</a>
            <a href="#ecosystem" className="landing-nav__link">Ecosystem</a>
            <a href="#trust" className="landing-nav__link">Why Us</a>
          </nav>

          <div className="landing-header__actions">
            {isAuthenticated ? (
              <Button
                variant="primary"
                size="md"
                icon={<ArrowRight size={16} />}
                onClick={() => navigate(getDashboardPath())}
              >
                Go to Dashboard
              </Button>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="md"
                  onClick={() => navigate('/login')}
                >
                  Sign In
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  icon={<ArrowRight size={16} />}
                  onClick={() => navigate('/signup')}
                >
                  Get Started
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="landing-hero">
        <div className="landing-hero__bg-blobs">
          <div className="blob blob-1" />
          <div className="blob blob-2" />
        </div>

        <div className="landing-container landing-hero__content">
          <div className="landing-hero__text">
            <div className="landing-pill">
              <Sparkles size={14} className="text-primary" />
              <span>Next-Gen Diagnostic Lab Marketplace</span>
            </div>

            <h1 className="landing-hero__title">
              Healthcare at Your Doorstep, <span className="text-gradient">Simplified.</span>
            </h1>

            <p className="landing-hero__subtitle">
              Compare NABL-certified diagnostic laboratories, book home sample collections with live GPS tracking, and access verified digital medical reports seamlessly.
            </p>

            <div className="landing-hero__buttons">
              {isAuthenticated ? (
                <Button
                  variant="primary"
                  size="lg"
                  icon={<ArrowRight size={18} />}
                  onClick={() => navigate(getDashboardPath())}
                >
                  Open Dashboard
                </Button>
              ) : (
                <>
                  <Button
                    variant="primary"
                    size="lg"
                    icon={<Search size={18} />}
                    onClick={() => navigate('/signup')}
                  >
                    Book a Diagnostic Test
                  </Button>
                  <Button
                    variant="secondary"
                    size="lg"
                    icon={<Building2 size={18} />}
                    onClick={() => navigate('/signup?role=lab_staff')}
                  >
                    Partner as Laboratory
                  </Button>
                </>
              )}
            </div>

            {/* Trust Metrics Bar */}
            <div className="landing-hero__stats">
              <div className="landing-stat">
                <ShieldCheck size={20} className="text-success" />
                <div>
                  <strong>NABL Certified</strong>
                  <span>Accredited Labs</span>
                </div>
              </div>
              <div className="landing-stat">
                <Clock size={20} className="text-primary" />
                <div>
                  <strong>30-Min Slot Pickup</strong>
                  <span>Doorstep Collection</span>
                </div>
              </div>
              <div className="landing-stat">
                <Star size={20} style={{ color: '#FFB300', fill: '#FFB300' }} />
                <div>
                  <strong>4.9 / 5.0 Rating</strong>
                  <span>10,000+ Happy Patients</span>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Feature Demo Card */}
          <div className="landing-hero__preview">
            <div className="preview-card glass-panel">
              <div className="preview-card__header">
                <div className="preview-status">
                  <span className="pulse-dot" />
                  <span>Live Phlebotomist Tracking</span>
                </div>
                <Badge variant="success">IN TRANSIT</Badge>
              </div>

              <div className="preview-card__map">
                <div className="simulated-map">
                  <div className="map-path" />
                  <div className="map-pin map-pin--home">🏠</div>
                  <div className="map-pin map-pin--collector">🩸</div>
                </div>
              </div>

              <div className="preview-card__footer">
                <div className="collector-info">
                  <div className="avatar">R</div>
                  <div>
                    <strong>Rupesh Bharti (Phlebotomist)</strong>
                    <span className="body-sm text-secondary">Arriving in 12 mins • OTP Verification Required</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* App Purpose & Core Features */}
      <section id="features" className="landing-section">
        <div className="landing-container">
          <div className="landing-section__header">
            <span className="section-tag">WHY CHOOSE LABEASE</span>
            <h2 className="headline-lg">Everything You Need for Diagnostic Care</h2>
            <p className="body-lg text-secondary">
              A integrated digital platform connecting patients, laboratories, and phlebotomists.
            </p>
          </div>

          <div className="features-grid">
            <Card className="feature-card">
              <div className="feature-icon feature-icon--teal">
                <Search size={24} />
              </div>
              <h3>Lab Discovery & Price Transparency</h3>
              <p>
                Browse verified local laboratories, compare prices for 1,000+ tests and packages, and apply discount promo codes at checkout.
              </p>
            </Card>

            <Card className="feature-card">
              <div className="feature-icon feature-icon--blue">
                <MapPin size={24} />
              </div>
              <h3>Live GPS Collector Tracking</h3>
              <p>
                Track your phlebotomist on an interactive map in real-time. Secure sample pickups using 4-digit SMS OTP verification.
              </p>
            </Card>

            <Card className="feature-card">
              <div className="feature-icon feature-icon--purple">
                <FileText size={24} />
              </div>
              <h3>Verified Digital PDF Reports</h3>
              <p>
                Get instant notifications when lab reports are finalized. View, download, or share encrypted reports with 7-day DPDP compliance.
              </p>
            </Card>

            <Card className="feature-card">
              <div className="feature-icon feature-icon--green">
                <TrendingUp size={24} />
              </div>
              <h3>Health History & Visual Trends</h3>
              <p>
                Monitor your wellness trajectory with automated SVG health trend line graphs tracking Glucose, HbA1c, and key health metrics.
              </p>
            </Card>

            <Card className="feature-card">
              <div className="feature-icon feature-icon--orange">
                <Award size={24} />
              </div>
              <h3>Refer & Earn Rewards</h3>
              <p>
                Share your unique referral code with family and friends to earn instant discount credits on future diagnostic bookings.
              </p>
            </Card>

            <Card className="feature-card">
              <div className="feature-icon feature-icon--navy">
                <Building2 size={24} />
              </div>
              <h3>Complete Partner Ecosystem</h3>
              <p>
                Dedicated management suites for Lab Owners to handle catalogs, revenue payouts, and patient review responses.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="landing-section landing-section--alt">
        <div className="landing-container">
          <div className="landing-section__header">
            <span className="section-tag">STEP-BY-STEP PROCESS</span>
            <h2 className="headline-lg">How LabEase Works</h2>
            <p className="body-lg text-secondary">
              Book, collect, and review diagnostic results in 4 simple steps.
            </p>
          </div>

          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">01</div>
              <h3>Search & Select</h3>
              <p>Choose tests or health checkup packages from top NABL accredited labs in your area.</p>
            </div>

            <div className="step-card">
              <div className="step-number">02</div>
              <h3>Schedule Sample Pickup</h3>
              <p>Pick a convenient date and time slot for doorstep sample collection.</p>
            </div>

            <div className="step-card">
              <div className="step-number">03</div>
              <h3>Live Track Phlebotomist</h3>
              <p>Watch your assigned collector navigate to your address on the live map and verify via OTP.</p>
            </div>

            <div className="step-card">
              <div className="step-number">04</div>
              <h3>Receive Report & Trends</h3>
              <p>Download your verified PDF report and analyze historical health parameter graphs.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Multi-Role Ecosystem Section */}
      <section id="ecosystem" className="landing-section">
        <div className="landing-container">
          <div className="landing-section__header">
            <span className="section-tag">THREE-SIDED MARKETPLACE</span>
            <h2 className="headline-lg">Designed for Everyone in Healthcare</h2>
          </div>

          <div className="ecosystem-grid">
            <div className="eco-card eco-card--patient">
              <div className="eco-card__badge">PATIENT APP</div>
              <h3>For Individuals & Families</h3>
              <ul>
                <li><CheckCircle2 size={16} className="text-success" /> Easy test search & transparent pricing</li>
                <li><CheckCircle2 size={16} className="text-success" /> Doorstep sample collection with OTP security</li>
                <li><CheckCircle2 size={16} className="text-success" /> Visual HbA1c/Glucose parameter trend charts</li>
                <li><CheckCircle2 size={16} className="text-success" /> Promo codes & referral rewards</li>
              </ul>
              <Button variant="secondary" size="md" onClick={() => navigate('/signup')}>
                Book a Test
              </Button>
            </div>

            <div className="eco-card eco-card--lab">
              <div className="eco-card__badge">LAB PARTNER</div>
              <h3>For Diagnostic Laboratories</h3>
              <ul>
                <li><CheckCircle2 size={16} className="text-primary" /> Test & package catalog management</li>
                <li><CheckCircle2 size={16} className="text-primary" /> Phlebotomist task assignment & status timers</li>
                <li><CheckCircle2 size={16} className="text-primary" /> PDF report uploads with version history</li>
                <li><CheckCircle2 size={16} className="text-primary" /> Revenue ledgers & patient review responses</li>
              </ul>
              <Button variant="secondary" size="md" onClick={() => navigate('/signup?role=lab_staff')}>
                Partner as Lab
              </Button>
            </div>

            <div className="eco-card eco-card--phlebo">
              <div className="eco-card__badge">PHLEBOTOMIST</div>
              <h3>For Sample Collection Agents</h3>
              <ul>
                <li><CheckCircle2 size={16} className="text-warning" /> Duty status online/offline toggle</li>
                <li><CheckCircle2 size={16} className="text-warning" /> Real-time GPS location broadcasting</li>
                <li><CheckCircle2 size={16} className="text-warning" /> Sample verification checklists & vial photos</li>
                <li><CheckCircle2 size={16} className="text-warning" /> Patient OTP confirmation at doorstep</li>
              </ul>
              <Button variant="secondary" size="md" onClick={() => navigate('/signup?role=phlebotomist')}>
                Join as Phlebotomist
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="landing-cta">
        <div className="landing-container landing-cta__content">
          <h2>Ready to Simplify Your Health Diagnostics?</h2>
          <p>Join thousands of satisfied patients and healthcare providers on LabEase today.</p>
          <div className="landing-cta__buttons">
            <Button
              variant="primary"
              size="lg"
              icon={<ArrowRight size={18} />}
              onClick={() => navigate('/signup')}
            >
              Get Started for Free
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => navigate('/login')}
            >
              Sign In to Account
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-container landing-footer__container">
          <div className="landing-footer__brand">
            <div className="landing-brand">
              <div className="landing-brand__logo">
                <Activity size={20} className="text-primary" />
              </div>
              <span className="landing-brand__name">LabEase</span>
            </div>
            <p className="body-sm text-secondary">
              Diagnostic Lab Marketplace Platform. Connecting Patients, Certified Laboratories, and Phlebotomists seamlessly.
            </p>
          </div>

          <div className="landing-footer__links">
            <div>
              <h4>Platform</h4>
              <a href="#features">Features</a>
              <a href="#how-it-works">How It Works</a>
              <a href="#ecosystem">Ecosystem</a>
            </div>
            <div>
              <h4>Access</h4>
              <Link to="/login">Sign In</Link>
              <Link to="/signup">Create Account</Link>
              <Link to="/signup?role=lab_staff">Lab Onboarding</Link>
            </div>
          </div>
        </div>

        <div className="landing-footer__bottom">
          <div className="landing-container">
            <p>© {new Date().getFullYear()} LabEase Inc. All rights reserved. DPDP Compliant Medical Platform.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
