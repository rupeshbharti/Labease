import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import LabCard from './LabCard';
import TestCard from './TestCard';
import Card from '../shared/Card';
import LoadingSpinner from '../shared/LoadingSpinner';
import { useCart } from './CartContext';
import { Search, MapPin, Sparkles, Filter, Activity, Droplet, Dna, Heart } from 'lucide-react';
import toast from 'react-hot-toast';
import './PatientPages.css';

export default function HomePage() {
  const navigate = useNavigate();
  const { addToCart, isInCart } = useCart();
  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [popularTests, setPopularTests] = useState([]);
  const [realTests, setRealTests] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Load nearby labs, popular tests and bookable tests
  useEffect(() => {
    async function loadFeed() {
      setLoading(true);
      try {
        const [labsRes, popularRes, testsRes] = await Promise.all([
          api.get('/api/discovery/labs'),
          api.get('/api/discovery/popular-tests'),
          api.get('/api/discovery/tests'),
        ]);
        setLabs(labsRes.data);
        setPopularTests(popularRes.data);
        setRealTests(testsRes.data);
      } catch (err) {
        console.error('Error loading home feed:', err);
        toast.error('Failed to load home feed.');
      } finally {
        setLoading(false);
      }
    }
    loadFeed();
  }, []);

  const categories = [
    { name: 'Full Body Checkup', icon: 'Activity', color: 'var(--primary-fixed)', textColor: 'var(--on-primary-fixed-variant)' },
    { name: 'Blood Test', icon: 'Droplet', color: 'var(--secondary-container)', textColor: 'var(--on-secondary-container)' },
    { name: 'Radiology', icon: 'Sparkles', color: 'var(--surface-container-high)', textColor: 'var(--primary)' },
    { name: 'Diabetes', icon: 'Dna', color: 'var(--tertiary-container)', textColor: 'var(--on-tertiary-container)' },
    { name: 'Heart Health', icon: 'Heart', color: 'var(--surface-variant)', textColor: 'var(--on-surface-variant)' },
  ];

  return (
    <div className="patient-home animate-fade-in-up" style={{ backgroundColor: 'var(--surface-container-lowest)', minHeight: '100vh' }}>
      {/* Hero / Header with search integration */}
      <div 
        className="patient-hero"
        style={{
          background: 'linear-gradient(135deg, var(--primary-container) 0%, var(--primary) 60%, var(--tertiary) 100%)',
          padding: '48px 16px 32px',
          color: 'var(--on-primary)',
          textAlign: 'center'
        }}
      >
        <div className="patient-hero__content" style={{ maxWidth: 'var(--max-width)', margin: '0 auto' }}>
          <h1 className="headline-lg" style={{ fontSize: '28px', fontWeight: 700, margin: '0 0 8px' }}>Find Diagnostic Tests Near You</h1>
          <p className="body-lg" style={{ color: 'rgba(255,255,255,0.85)', margin: 0 }}>
            Compare prices, ratings & book instantly
          </p>
          <div 
            className="patient-search" 
            onClick={() => navigate('/patient/search')} 
            style={{ 
              marginTop: '24px',
              position: 'relative',
              maxWidth: '560px',
              margin: '24px auto 0',
              cursor: 'pointer'
            }}
          >
            <Search size={20} className="patient-search__icon" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--outline)' }} />
            <input
              type="text"
              placeholder="Search tests (e.g., CBC, Thyroid, Sugar)"
              className="patient-search__input"
              readOnly
              style={{ 
                width: '100%',
                height: '48px',
                padding: '0 16px 0 48px',
                border: '1px solid var(--outline-variant)',
                borderRadius: 'var(--radius-xl)',
                fontSize: '15px',
                background: 'var(--surface-container-lowest)',
                color: 'var(--on-surface)',
                outline: 'none',
                cursor: 'pointer',
                boxShadow: 'var(--shadow-1)'
              }}
            />
          </div>
        </div>
      </div>

      <div className="container mt-lg" style={{ padding: '24px 16px 80px', maxWidth: '800px', margin: '0 auto' }}>
        {/* Categories Section */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h2 className="title-md" style={{ fontWeight: 600, fontSize: '18px', margin: 0 }}>Categories</h2>
            <span style={{ fontSize: '12px', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }} onClick={() => navigate('/patient/search')}>
              View All
            </span>
          </div>
          <div className="hide-scrollbar" style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '8px' }}>
            {categories.map((cat, idx) => {
              const Icon = cat.icon === 'Activity' ? Activity : cat.icon === 'Droplet' ? Droplet : cat.icon === 'Dna' ? Dna : cat.icon === 'Heart' ? Heart : Sparkles;
              return (
                <div 
                  key={idx} 
                  onClick={() => navigate(`/patient/search?q=${cat.name}`)}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', minWidth: '80px', cursor: 'pointer' }}
                >
                  <div 
                    className="transition-transform duration-150 hover:scale-105"
                    style={{ 
                      width: '64px', 
                      height: '64px', 
                      borderRadius: '50%', 
                      backgroundColor: cat.color, 
                      color: cat.textColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: 'var(--shadow-1)'
                    }}
                  >
                    <Icon size={26} />
                  </div>
                  <span className="font-label-md" style={{ fontSize: '11px', fontWeight: 600, textAlign: 'center', display: 'block', maxWidth: '80px', color: 'var(--on-surface-variant)' }}>{cat.name}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Promotional Banner */}
        <section 
          className="relative overflow-hidden flex items-center bg-primary" 
          style={{ 
            position: 'relative',
            overflow: 'hidden',
            borderRadius: 'var(--radius-xl)',
            minHeight: '144px',
            backgroundColor: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            marginBottom: '28px',
            padding: '20px',
            boxShadow: 'var(--shadow-1)'
          }}
        >
          <div style={{ zIndex: 10, maxWidth: '65%', color: 'var(--on-primary)', textAlign: 'left' }}>
            <h3 className="headline-lg-mobile" style={{ margin: '0 0 6px', fontWeight: 700, fontSize: '18px', color: 'white' }}>Stay Ahead of Your Health</h3>
            <p className="body-sm" style={{ margin: '0 0 16px', opacity: 0.9, color: 'white', fontSize: '13px' }}>Get up to 40% off on Complete Health Packages this month.</p>
            <button 
              onClick={() => navigate('/patient/search?q=package')}
              className="transition-colors duration-150"
              style={{ 
                backgroundColor: 'var(--secondary-container)', 
                color: 'var(--on-secondary-container)', 
                padding: '6px 14px', 
                borderRadius: 'var(--radius-full)', 
                fontWeight: 600,
                fontSize: '11px',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Book Now
            </button>
          </div>
          {/* Circular banner background accent */}
          <div 
            style={{
              position: 'absolute',
              right: '-30px',
              top: '-30px',
              width: '180px',
              height: '180px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.08)'
            }}
          />
        </section>

        {/* Curated Popular Tests Strip */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h2 className="title-md" style={{ fontWeight: 600, fontSize: '18px', margin: 0 }}>Popular Diagnostic Tests</h2>
          <span style={{ fontSize: '12px', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px', fontWeight: 600 }} onClick={() => navigate('/patient/search')}>
            <Sparkles size={14} /> View All
          </span>
        </div>

        <div className="hide-scrollbar" style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '16px', marginBottom: '28px' }}>
          {popularTests.map((t, idx) => (
            <Card
              key={idx}
              onClick={() => navigate(`/patient/search?q=${t.name}`)}
              style={{
                minWidth: '200px',
                padding: '12px',
                flexShrink: 0,
                cursor: 'pointer',
                borderLeft: '4px solid var(--primary)',
                backgroundColor: 'var(--surface-container-lowest)'
              }}
              hoverable
            >
              <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>{t.name}</h4>
              <p className="body-sm text-secondary" style={{ margin: '4px 0 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', fontSize: '12px' }}>
                {t.desc}
              </p>
            </Card>
          ))}
        </div>

        {/* Book Popular Health Tests Section */}
        {realTests.length > 0 && (
          <div style={{ marginBottom: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h2 className="title-md" style={{ fontWeight: 600, fontSize: '18px', margin: 0 }}>Book Popular Health Tests</h2>
              <span
                style={{ fontSize: '12px', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}
                onClick={() => navigate('/patient/search')}
              >
                View All
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {realTests.slice(0, 4).map(test => (
                <TestCard
                  key={test.id}
                  test={test}
                  isAdded={isInCart(test.id)}
                  onAdd={() => addToCart(test, test.lab_id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Labs Discovery Feed */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 className="title-md" style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', fontSize: '18px', margin: 0 }}>
            <MapPin size={18} className="text-primary" /> Recommended Labs Near You
          </h2>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
            <Filter size={16} />
          </button>
        </div>

        {loading ? (
          <LoadingSpinner text="Locating best labs near you..." />
        ) : labs.length === 0 ? (
          <Card style={{ padding: '32px', textAlign: 'center' }}>
            <p className="body-lg text-muted">No active labs are operating in your area yet.</p>
            <p className="body-sm text-secondary" style={{ marginTop: '8px' }}>
              Check back soon as diagnostic partners complete onboarding.
            </p>
          </Card>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {labs.map(lab => (
              <LabCard key={lab.id} lab={lab} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
