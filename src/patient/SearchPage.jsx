import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import LabCard from './LabCard';
import TestCard from './TestCard';
import Input from '../shared/Input';
import Button from '../shared/Button';
import LoadingSpinner from '../shared/LoadingSpinner';
import { ArrowLeft, Search, SlidersHorizontal } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SearchPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({ labs: [], tests: [] });

  // Debounced search effect
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults({ labs: [], tests: [] });
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await api.get(`/api/discovery/search`, {
          params: { query: query.trim() },
        });
        setResults(res.data);
      } catch (err) {
        console.error('Error executing search:', err);
        toast.error('Search failed. Please try again.');
      } finally {
        setLoading(false);
      }
    }, 400); // 400ms debounce delay

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  // Navigate to lab page when a test card triggers action (for now, opens the lab detail)
  const handleAddTest = (test) => {
    const labId = test.lab_id || test.lab_partners?.id;
    if (labId) {
      navigate(`/patient/lab/${labId}`);
    }
  };

  return (
    <div className="search-page" style={{ padding: '24px 16px 80px', maxWidth: '800px', margin: '0 auto', minHeight: '100vh', backgroundColor: 'var(--surface-container-lowest)' }}>
      {/* Search Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <button
          onClick={() => navigate(-1)}
          style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <ArrowLeft size={24} className="text-primary" />
        </button>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={18} className="text-outline" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search tests, labs, categories..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
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
              boxShadow: 'var(--shadow-1)'
            }}
          />
        </div>
      </div>

      {/* Filter Row */}
      <div className="hide-scrollbar" style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '20px', alignItems: 'center' }}>
        <button 
          className="btn btn--tertiary btn--sm" 
          style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '4px', 
            padding: '6px 12px', 
            borderRadius: 'var(--radius-full)', 
            border: '1px solid var(--outline-variant)',
            fontSize: '12px',
            fontWeight: 600,
            whiteSpace: 'nowrap'
          }}
        >
          <SlidersHorizontal size={14} /> Filters
        </button>
        <span className="bg-surface-container-high text-on-surface-variant hover:bg-primary hover:text-white transition-all" style={{ padding: '6px 12px', borderRadius: 'var(--radius-full)', fontSize: '11px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', border: '1px solid var(--outline-variant)' }}>Home Collection</span>
        <span className="bg-surface-container-high text-on-surface-variant hover:bg-primary hover:text-white transition-all" style={{ padding: '6px 12px', borderRadius: 'var(--radius-full)', fontSize: '11px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', border: '1px solid var(--outline-variant)' }}>NABL Certified</span>
        <span className="bg-surface-container-high text-on-surface-variant hover:bg-primary hover:text-white transition-all" style={{ padding: '6px 12px', borderRadius: 'var(--radius-full)', fontSize: '11px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', border: '1px solid var(--outline-variant)' }}>Rating 4.0+</span>
      </div>

      {loading ? (
        <LoadingSpinner text="Searching marketplace..." />
      ) : (
        <div className="search-results animate-fade-in">
          {query.trim().length >= 2 && results.labs.length === 0 && results.tests.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <p className="body-lg text-muted">No matching labs or tests found.</p>
            </div>
          )}

          {/* Labs Results */}
          {results.labs.length > 0 && (
            <div style={{ marginBottom: '32px' }}>
              <h2 className="title-md" style={{ marginBottom: '16px', fontWeight: 600, fontSize: '16px', color: 'var(--on-surface-variant)' }}>
                Diagnostic Labs ({results.labs.length})
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {results.labs.map(lab => (
                  <LabCard key={lab.id} lab={lab} />
                ))}
              </div>
            </div>
          )}

          {/* Tests Results */}
          {results.tests.length > 0 && (
            <div>
              <h2 className="title-md" style={{ marginBottom: '16px', fontWeight: 600, fontSize: '16px', color: 'var(--on-surface-variant)' }}>
                Diagnostic Tests ({results.tests.length})
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {results.tests.map(test => (
                  <div key={test.id} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-muted)', paddingLeft: '8px' }}>
                      <span>Offered by</span>
                      <strong style={{ color: 'var(--primary)', fontWeight: 600 }}>
                        {test.lab_partners?.name || 'Partner Lab'}
                      </strong>
                    </div>
                    <TestCard test={test} onAdd={handleAddTest} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
