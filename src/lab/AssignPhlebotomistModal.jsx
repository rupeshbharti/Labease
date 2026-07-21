import { useState, useEffect } from 'react';
import Modal from '../shared/Modal';
import Button from '../shared/Button';
import LoadingSpinner from '../shared/LoadingSpinner';
import api from '../utils/api';
import { User, Check } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AssignPhlebotomistModal({ isOpen, onClose, onAssign, bookingId, labId }) {
  const [phlebos, setPhlebos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPhleboId, setSelectedPhleboId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Fetch all registered users with phlebotomist role via backend API to bypass patient profile RLS restriction
  useEffect(() => {
    if (!isOpen || !labId) return;

    async function loadPhlebotomists() {
      setLoading(true);
      try {
        const res = await api.get(`/api/labs/${labId}/phlebotomists`);
        setPhlebos(res.data || []);
      } catch (err) {
        console.error('Error loading phlebotomists:', err);
        toast.error('Failed to load phlebotomists list.');
      } finally {
        setLoading(false);
      }
    }

    loadPhlebotomists();
  }, [isOpen, labId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPhleboId) {
      toast.error('Please select a phlebotomist');
      return;
    }

    setSubmitting(true);
    try {
      await onAssign(selectedPhleboId);
      onClose();
    } catch (err) {
      toast.error(err.message || 'Assignment failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Assign Phlebotomist"
      size="sm"
    >
      {loading ? (
        <LoadingSpinner text="Retrieving online agents..." />
      ) : (
        <form onSubmit={handleSubmit}>
          <div
            style={{
              maxHeight: '240px',
              overflowY: 'auto',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius)',
              marginBottom: '16px',
            }}
          >
            {phlebos.length === 0 ? (
              <p className="body-sm text-muted" style={{ padding: '16px', textAlign: 'center' }}>
                No registered phlebotomists found.
              </p>
            ) : (
              phlebos.map(phlebo => (
                <div
                  key={phlebo.id}
                  onClick={() => setSelectedPhleboId(phlebo.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px',
                    borderBottom: '1px solid var(--border-color)',
                    cursor: 'pointer',
                    backgroundColor: selectedPhleboId === phlebo.id ? 'var(--primary-color-container)' : 'transparent',
                    transition: 'background-color 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--surface-variant)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <User size={18} className="text-secondary" />
                    </div>
                    <div>
                      <div style={{ fontWeight: 500, fontSize: '14px' }}>{phlebo.name || 'Agent'}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{phlebo.phone || phlebo.email}</div>
                    </div>
                  </div>
                  {selectedPhleboId === phlebo.id && (
                    <Check size={18} className="text-primary" style={{ marginRight: '8px' }} />
                  )}
                </div>
              ))
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <Button type="button" variant="tertiary" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitting} disabled={!selectedPhleboId}>
              Confirm Assignment
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
