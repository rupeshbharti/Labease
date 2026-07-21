import { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { supabase } from '../config/supabase';
import api from '../utils/api';
import Card from '../shared/Card';
import Button from '../shared/Button';
import Badge from '../shared/Badge';
import LoadingSpinner from '../shared/LoadingSpinner';
import TestFormModal from './TestFormModal';
import PackageFormModal from './PackageFormModal';
import { Plus, Edit2, Trash2, Search, SlidersHorizontal } from 'lucide-react';
import toast from 'react-hot-toast';
import './CatalogPage.css';

export default function CatalogPage() {
  const { user } = useAuth();
  const [labId, setLabId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tests');

  // Catalog data lists
  const [tests, setTests] = useState([]);
  const [packages, setPackages] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [isPkgModalOpen, setIsPkgModalOpen] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  const [selectedPkg, setSelectedPkg] = useState(null);

  // Fetch the lab ID associated with the current owner user
  useEffect(() => {
    async function fetchLabId() {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from('lab_partners')
          .select('id')
          .eq('owner_user_id', user.id)
          .single();

        if (error) throw error;
        setLabId(data.id);
      } catch (err) {
        console.error('Error fetching associated lab ID:', err);
        toast.error('Failed to load lab partner information. Please make sure onboarding is complete.');
      }
    }
    fetchLabId();
  }, [user]);

  // Fetch catalog contents once labId is loaded
  useEffect(() => {
    if (!labId) return;

    async function loadCatalog() {
      setLoading(true);
      try {
        const [testsRes, pkgsRes] = await Promise.all([
          api.get(`/api/labs/${labId}/tests`),
          api.get(`/api/labs/${labId}/packages`),
        ]);
        setTests(testsRes.data);
        setPackages(pkgsRes.data);
      } catch (err) {
        console.error('Error loading catalog lists:', err);
        toast.error('Failed to load catalog details.');
      } finally {
        setLoading(false);
      }
    }

    loadCatalog();
  }, [labId]);

  // ============================================================
  // Test Action Handlers
  // ============================================================
  const handleCreateTest = async (testData) => {
    try {
      const res = await api.post(`/api/labs/${labId}/tests`, testData);
      setTests(prev => [res.data, ...prev]);
      toast.success('Test added successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to add test');
      throw err;
    }
  };

  const handleUpdateTest = async (testData) => {
    try {
      const res = await api.put(`/api/labs/${labId}/tests/${selectedTest.id}`, testData);
      setTests(prev => prev.map(t => (t.id === selectedTest.id ? res.data : t)));
      toast.success('Test updated successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to update test');
      throw err;
    }
  };

  const handleArchiveTest = async (testId) => {
    if (!window.confirm('Are you sure you want to archive this test? It will not be shown in search results.')) return;
    try {
      await api.delete(`/api/labs/${labId}/tests/${testId}`);
      setTests(prev => prev.map(t => (t.id === testId ? { ...t, is_active: false } : t)));
      toast.success('Test archived successfully.');
    } catch (err) {
      toast.error(err.message || 'Failed to archive test');
    }
  };

  // ============================================================
  // Package Action Handlers
  // ============================================================
  const handleCreatePackage = async (pkgData) => {
    try {
      const res = await api.post(`/api/labs/${labId}/packages`, pkgData);
      setPackages(prev => [res.data, ...prev]);
      toast.success('Package created successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to create package');
      throw err;
    }
  };

  const handleUpdatePackage = async (pkgData) => {
    try {
      const res = await api.put(`/api/labs/${labId}/packages/${selectedPkg.id}`, pkgData);
      setPackages(prev => prev.map(p => (p.id === selectedPkg.id ? res.data : p)));
      toast.success('Package updated successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to update package');
      throw err;
    }
  };

  // Filtering list by search query
  const filteredTests = tests.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPackages = packages.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!labId) {
    return (
      <div className="catalog-page" style={{ textAlign: 'center', marginTop: '100px' }}>
        <h2 className="headline-md">Lab Registration Required</h2>
        <p className="body-md text-muted" style={{ margin: '12px 0 24px' }}>
          You must complete the Lab Onboarding form and receive verification approval before accessing the Test Catalog.
        </p>
      </div>
    );
  }

  return (
    <div className="catalog-page">
      <div className="catalog-header">
        <div>
          <h1 className="headline-lg">Test Catalog</h1>
          <p className="body-md text-muted">Manage diagnostic tests, packages, and pricing for your lab</p>
        </div>
        <Button
          onClick={() => {
            if (activeTab === 'tests') {
              setSelectedTest(null);
              setIsTestModalOpen(true);
            } else {
              setSelectedPkg(null);
              setIsPkgModalOpen(true);
            }
          }}
          icon={<Plus size={18} />}
        >
          {activeTab === 'tests' ? 'Add Test' : 'Create Package'}
        </Button>
      </div>

      <div className="catalog-tabs">
        <button
          className={`catalog-tab ${activeTab === 'tests' ? 'catalog-tab--active' : ''}`}
          onClick={() => { setActiveTab('tests'); setSearchQuery(''); }}
        >
          Individual Tests ({tests.length})
        </button>
        <button
          className={`catalog-tab ${activeTab === 'packages' ? 'catalog-tab--active' : ''}`}
          onClick={() => { setActiveTab('packages'); setSearchQuery(''); }}
        >
          Bundled Packages ({packages.length})
        </button>
      </div>

      <div className="catalog-controls">
        <div className="input-group catalog-search">
          <div className="input-group__prefix">
            <Search size={18} className="text-muted" />
          </div>
          <input
            type="text"
            className="input-group__input"
            placeholder={activeTab === 'tests' ? 'Search tests by name, code...' : 'Search packages...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="tertiary" icon={<SlidersHorizontal size={16} />}>
          Filter
        </Button>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading catalog details..." />
      ) : activeTab === 'tests' ? (
        // ============================================================
        // TESTS TAB LAYOUT
        // ============================================================
        filteredTests.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <p className="body-lg text-muted">No tests found in your catalog.</p>
          </div>
        ) : (
          <div className="catalog-grid">
            {filteredTests.map(test => (
              <Card key={test.id} className="test-card animate-fade-in">
                <div className="test-card__header">
                  <div>
                    <span className="test-card__code">{test.code || 'No Code'}</span>
                    <h3 className="test-card__title">{test.name}</h3>
                    {test.category && (
                      <Badge variant="info" style={{ marginTop: '4px' }}>{test.category}</Badge>
                    )}
                  </div>
                  <Badge variant={test.is_active ? 'success' : 'neutral'}>
                    {test.is_active ? 'Active' : 'Archived'}
                  </Badge>
                </div>
                <div className="test-card__details">
                  <div className="test-card__detail-item">
                    <span className="test-card__detail-label">Price</span>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>₹{test.price}</span>
                  </div>
                  <div className="test-card__detail-item">
                    <span className="test-card__detail-label">TAT</span>
                    <span>{test.turnaround_hours ? `${test.turnaround_hours} hrs` : 'N/A'}</span>
                  </div>
                  <div className="test-card__detail-item" style={{ gridColumn: 'span 2' }}>
                    <span className="test-card__detail-label">Sample Type</span>
                    <span>{test.sample_type || 'Not specified'}</span>
                  </div>
                </div>
                <div className="test-card__actions">
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={<Edit2 size={14} />}
                    onClick={() => {
                      setSelectedTest(test);
                      setIsTestModalOpen(true);
                    }}
                    style={{ flex: 1 }}
                  >
                    Edit
                  </Button>
                  {test.is_active && (
                    <Button
                      variant="tertiary"
                      size="sm"
                      icon={<Trash2 size={14} />}
                      onClick={() => handleArchiveTest(test.id)}
                      style={{ color: 'var(--error)' }}
                    />
                  )}
                </div>
              </Card>
            ))}
          </div>
        )
      ) : (
        // ============================================================
        // PACKAGES TAB LAYOUT
        // ============================================================
        filteredPackages.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <p className="body-lg text-muted">No custom packages created.</p>
          </div>
        ) : (
          <div className="catalog-grid">
            {filteredPackages.map(pkg => (
              <Card key={pkg.id} className="test-card animate-fade-in">
                <div className="test-card__header">
                  <div>
                    <h3 className="test-card__title" style={{ fontSize: '18px' }}>{pkg.name}</h3>
                    <span className="body-sm text-muted" style={{ display: 'block', marginTop: '4px' }}>
                      {pkg.package_tests?.length || 0} Tests Included
                    </span>
                  </div>
                  <Badge variant={pkg.is_active ? 'success' : 'neutral'}>
                    {pkg.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <p className="body-sm text-secondary" style={{ margin: '12px 0', lineClamp: 2 }}>
                  {pkg.description || 'No description provided.'}
                </p>
                <div className="test-card__details">
                  <div className="test-card__detail-item" style={{ gridColumn: 'span 2' }}>
                    <span className="test-card__detail-label">Package Price</span>
                    <span style={{ fontWeight: 600, color: 'var(--primary-color)', fontSize: '16px' }}>₹{pkg.price}</span>
                  </div>
                </div>
                <div className="test-card__actions">
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={<Edit2 size={14} />}
                    onClick={() => {
                      setSelectedPkg(pkg);
                      setIsPkgModalOpen(true);
                    }}
                    style={{ flex: 1 }}
                  >
                    Edit Details
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )
      )}

      {/* Form Modals */}
      <TestFormModal
        isOpen={isTestModalOpen}
        onClose={() => { setIsTestModalOpen(false); setSelectedTest(null); }}
        onSubmit={selectedTest ? handleUpdateTest : handleCreateTest}
        test={selectedTest}
      />

      <PackageFormModal
        isOpen={isPkgModalOpen}
        onClose={() => { setIsPkgModalOpen(false); setSelectedPkg(null); }}
        onSubmit={selectedPkg ? handleUpdatePackage : handleCreatePackage}
        tests={tests.filter(t => t.is_active)}
        pkg={selectedPkg}
      />
    </div>
  );
}
