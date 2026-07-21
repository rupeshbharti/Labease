import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import TestCard from './TestCard';
import Card from '../shared/Card';
import Badge from '../shared/Badge';
import Button from '../shared/Button';
import LoadingSpinner from '../shared/LoadingSpinner';
import { useCart } from './CartContext';
import { ArrowLeft, Star, Clock, MapPin, ShieldCheck, Heart } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LabDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, isInCart } = useCart();
  const [loading, setLoading] = useState(true);
  const [lab, setLab] = useState(null);
  const [activeSubTab, setActiveSubTab] = useState('tests'); // 'tests' | 'packages' | 'about'
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function loadLabDetail() {
      setLoading(true);
      try {
        const res = await api.get(`/api/discovery/labs/${id}`);
        setLab(res.data);
      } catch (err) {
        console.error('Error loading lab details:', err);
        toast.error('Failed to load lab profile.');
        navigate('/patient');
      } finally {
        setLoading(false);
      }
    }
    loadLabDetail();
  }, [id, navigate]);

  const handleAddTest = (test) => {
    addToCart(test, id);
  };

  const handleAddPackage = (pkg) => {
    addToCart(pkg, id);
  };

  if (loading) return <LoadingSpinner fullPage text="Loading lab profile..." />;
  if (!lab) return null;

  // Filter lists by search query
  const filteredTests = lab.tests.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.code?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPackages = lab.packages.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="lab-detail-page" style={{ paddingBottom: '80px', maxWidth: '800px', margin: '0 auto', minHeight: '100vh', backgroundColor: 'var(--surface-container-lowest)' }}>
      {/* Header section with back button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 16px 8px' }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <ArrowLeft size={24} className="text-primary" />
        </button>
        <h1 className="headline-lg-mobile text-primary" style={{ margin: 0, fontWeight: 700, fontSize: '18px' }}>Lab Profile</h1>
      </div>

      {/* Bento Grid Gallery */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-6" style={{ padding: '0 16px', marginBottom: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '12px' }}>
          {/* Main Cover */}
          <div style={{ gridColumn: 'span 12', height: '200px', borderRadius: 'var(--radius-xl)', overflow: 'hidden', border: '1px solid var(--outline-variant)', position: 'relative' }} className="md:col-span-8">
            <img 
              src={lab.logo_url || "https://images.unsplash.com/photo-1579684389782-64d84b5e901d?auto=format&fit=crop&q=80&w=800"} 
              alt={lab.name} 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            />
            <div 
              style={{ position: 'absolute', bottom: '12px', right: '12px', backgroundColor: 'rgba(9, 28, 53, 0.6)', color: 'white', padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: '11px', backdropFilter: 'blur(4px)' }}
            >
              1/3 Photos
            </div>
          </div>
        </div>
      </section>

      {/* Lab Header Details */}
      <div style={{ padding: '0 16px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '16px' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-2)',
              border: '3px solid white',
              flexShrink: 0,
            }}
          >
            {lab.logo_url ? (
              <img src={lab.logo_url} alt={lab.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--primary)' }}>
                {lab.name.charAt(0)}
              </span>
            )}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 className="title-md" style={{ margin: 0, fontWeight: 700, fontSize: '20px' }}>
              {lab.name}
            </h1>
            <p className="body-sm text-secondary" style={{ margin: '4px 0 0', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}>
              <MapPin size={14} className="text-muted" />
              <span>{lab.address}, {lab.city}</span>
            </p>
          </div>
        </div>

        {/* Credentials Strip */}
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', borderTop: '1px solid var(--outline-variant)', borderBottom: '1px solid var(--outline-variant)', padding: '12px 0' }}>
          {lab.rating_avg > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Star size={16} fill="#FFB000" stroke="#FFB000" />
              <span style={{ fontWeight: 600, fontSize: '13px' }}>{parseFloat(lab.rating_avg).toFixed(1)}</span>
              <span className="body-sm text-muted" style={{ fontSize: '12px' }}>({lab.rating_count} reviews)</span>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: 'var(--text-secondary)' }}>
            <Clock size={16} className="text-muted" />
            <span>9:00 AM - 6:00 PM</span>
          </div>

          {lab.nabl_certificate_url && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: 'var(--text-secondary)' }}>
              <ShieldCheck size={16} className="text-success" />
              <span style={{ fontWeight: 600, color: 'var(--success)' }}>NABL Certified</span>
            </div>
          )}
        </div>
      </div>

      {/* Search within lab */}
      <div style={{ padding: '0 16px 16px' }}>
        <input
          type="text"
          placeholder="Search test or health package in this lab..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ 
            width: '100%', 
            padding: '12px 16px', 
            border: '1px solid var(--outline-variant)', 
            borderRadius: 'var(--radius-xl)',
            fontSize: '14px',
            outline: 'none',
            backgroundColor: 'var(--surface-container-lowest)',
            boxShadow: 'var(--shadow-1)'
          }}
        />
      </div>

      {/* Tab selection */}
      <div className="catalog-tabs" style={{ padding: '0 16px', display: 'flex', gap: '16px', borderBottom: '1px solid var(--outline-variant)', marginBottom: '16px' }}>
        <button
          className={`catalog-tab ${activeSubTab === 'tests' ? 'catalog-tab--active' : ''}`}
          onClick={() => setActiveSubTab('tests')}
          style={{
            padding: '8px 4px 12px',
            fontSize: '14px',
            fontWeight: 600,
            border: 'none',
            borderBottom: activeSubTab === 'tests' ? '2px solid var(--primary)' : 'none',
            color: activeSubTab === 'tests' ? 'var(--primary)' : 'var(--text-muted)',
            cursor: 'pointer',
            backgroundColor: 'transparent'
          }}
        >
          Individual Tests
        </button>
        <button
          className={`catalog-tab ${activeSubTab === 'packages' ? 'catalog-tab--active' : ''}`}
          onClick={() => setActiveSubTab('packages')}
          style={{
            padding: '8px 4px 12px',
            fontSize: '14px',
            fontWeight: 600,
            border: 'none',
            borderBottom: activeSubTab === 'packages' ? '2px solid var(--primary)' : 'none',
            color: activeSubTab === 'packages' ? 'var(--primary)' : 'var(--text-muted)',
            cursor: 'pointer',
            backgroundColor: 'transparent'
          }}
        >
          Packages
        </button>
        <button
          className={`catalog-tab ${activeSubTab === 'about' ? 'catalog-tab--active' : ''}`}
          onClick={() => setActiveSubTab('about')}
          style={{
            padding: '8px 4px 12px',
            fontSize: '14px',
            fontWeight: 600,
            border: 'none',
            borderBottom: activeSubTab === 'about' ? '2px solid var(--primary)' : 'none',
            color: activeSubTab === 'about' ? 'var(--primary)' : 'var(--text-muted)',
            cursor: 'pointer',
            backgroundColor: 'transparent'
          }}
        >
          About & Reviews
        </button>
      </div>

      {/* Catalog Rendered lists */}
      <div style={{ padding: '0 16px' }}>
        {activeSubTab === 'tests' && (
          filteredTests.length === 0 ? (
            <p className="body-md text-muted" style={{ textAlign: 'center', padding: '40px 0' }}>No tests match your query.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {filteredTests.map(test => (
                <TestCard 
                  key={test.id} 
                  test={test} 
                  isAdded={isInCart(test.id)} 
                  onAdd={handleAddTest} 
                />
              ))}
            </div>
          )
        )}

        {activeSubTab === 'packages' && (
          filteredPackages.length === 0 ? (
            <p className="body-md text-muted" style={{ textAlign: 'center', padding: '40px 0' }}>No packages available.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {filteredPackages.map(pkg => (
                <Card key={pkg.id} style={{ padding: '16px', backgroundColor: 'var(--surface-container-lowest)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h4 className="title-md" style={{ fontWeight: 600, margin: 0, fontSize: '15px' }}>{pkg.name}</h4>
                      <p className="body-sm text-secondary" style={{ margin: '6px 0 12px', fontSize: '13px' }}>
                        {pkg.description || 'Custom bundled tests package.'}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--primary)' }}>₹{pkg.price}</div>
                      <Button 
                        size="sm" 
                        variant={isInCart(pkg.id) ? 'secondary' : 'primary'}
                        onClick={() => handleAddPackage(pkg)} 
                        style={{ marginTop: '8px', minWidth: '70px' }}
                      >
                        {isInCart(pkg.id) ? 'Added' : 'Add'}
                      </Button>
                    </div>
                  </div>

                  <div
                    style={{
                      borderTop: '1px solid var(--outline-variant)',
                      paddingTop: '12px',
                      marginTop: '8px',
                    }}
                  >
                    <span className="label-sm text-muted" style={{ display: 'block', marginBottom: '6px', fontSize: '10px', fontWeight: 700, letterSpacing: '0.5px' }}>
                      INCLUDED TESTS:
                    </span>
                    <ul style={{ paddingLeft: '16px', margin: 0, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
                      {pkg.package_tests?.map(pt => (
                        <li key={pt.test_id} className="body-sm text-secondary" style={{ fontSize: '12px' }}>
                          • {pt.tests?.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                </Card>
              ))}
            </div>
          )
        )}

        {activeSubTab === 'about' && (
          <div>
            <Card style={{ padding: '16px', marginBottom: '20px', backgroundColor: 'var(--surface-container-lowest)' }}>
              <h3 className="title-md" style={{ fontWeight: 600, marginTop: 0, fontSize: '16px' }}>Lab Information</h3>
              <p className="body-md text-secondary" style={{ lineHeight: 1.6, fontSize: '14px' }}>
                {lab.description || 'Welcome to LabEase diagnostic services. We offer accurate, timely test results utilizing certified laboratory technicians and modern diagnostic procedures.'}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                <div><strong>Address:</strong> {lab.address}, {lab.city}, {lab.state} - {lab.pincode}</div>
                <div><strong>Opening Hours:</strong> 9:00 AM - 6:00 PM (Monday - Saturday)</div>
              </div>
            </Card>

            <h3 className="title-md" style={{ fontWeight: 600, fontSize: '16px', marginBottom: '12px' }}>Patient Reviews</h3>
            {lab.reviews?.length === 0 ? (
              <p className="body-sm text-muted">No reviews available yet for this lab partner.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {lab.reviews?.map(rev => (
                  <Card key={rev.id} style={{ padding: '12px', backgroundColor: 'var(--surface-container-lowest)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--primary-fixed)', color: 'var(--on-primary-fixed-variant)', display: 'flex', alignItems: 'center', justifyCenter: 'center', fontWeight: 'bold', fontSize: '13px' }}>
                          {rev.users?.name?.charAt(0) || 'P'}
                        </div>
                        <span className="body-sm" style={{ fontWeight: 500 }}>{rev.users?.name || 'Patient'}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                        <Star size={14} fill="#FFB000" stroke="#FFB000" />
                        <span className="body-sm" style={{ fontWeight: 600 }}>{rev.lab_rating}</span>
                      </div>
                    </div>
                    {rev.lab_review_text && (
                      <p className="body-sm text-secondary" style={{ margin: '8px 0 0', lineHeight: 1.4, fontSize: '13px' }}>
                        {rev.lab_review_text}
                      </p>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
