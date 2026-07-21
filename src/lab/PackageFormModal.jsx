import { useState, useEffect } from 'react';
import Modal from '../shared/Modal';
import Input from '../shared/Input';
import Button from '../shared/Button';
import toast from 'react-hot-toast';

export default function PackageFormModal({ isOpen, onClose, onSubmit, tests = [], pkg = null }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [selectedTests, setSelectedTests] = useState([]);
  const [isActive, setIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Sync state if editing an existing package
  useEffect(() => {
    if (pkg) {
      setName(pkg.name || '');
      setDescription(pkg.description || '');
      setPrice(pkg.price || '');
      setIsActive(pkg.is_active !== false);

      // Extract test IDs from package_tests structure
      const ids = pkg.package_tests?.map(pt => pt.test_id) || [];
      setSelectedTests(ids);
    } else {
      setName('');
      setDescription('');
      setPrice('');
      setSelectedTests([]);
      setIsActive(true);
    }
  }, [pkg, isOpen]);

  const handleToggleTest = (testId) => {
    setSelectedTests(prev =>
      prev.includes(testId)
        ? prev.filter(id => id !== testId)
        : [...prev, testId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Package name is required');
      return;
    }
    if (!price || parseFloat(price) <= 0) {
      toast.error('Please enter a valid price');
      return;
    }
    if (selectedTests.length === 0) {
      toast.error('Please select at least one test to include in this package');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        name,
        description: description || null,
        price: parseFloat(price),
        test_ids: selectedTests,
        is_active: isActive,
      });
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to save package');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={pkg ? 'Edit Package' : 'Create Custom Package'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="form-grid">
        <div className="form-grid--full">
          <Input
            label="Package Name *"
            type="text"
            placeholder="e.g. Annual Health Checkup, Diabetes Care Panel"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="form-grid--full">
          <Input
            label="Package Price (INR) *"
            type="number"
            placeholder="e.g. 999"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            min="1"
          />
        </div>

        <div className="form-grid--full">
          <label className="input-group__label">Description</label>
          <textarea
            className="input-group__input"
            rows="3"
            placeholder="Describe what this package is for (e.g. Recommended for ages 30+)..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ width: '100%', padding: '12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius)' }}
          />
        </div>

        <div className="form-grid--full">
          <label className="input-group__label" style={{ marginBottom: '8px', display: 'block' }}>
            Select Included Tests * ({selectedTests.length} selected)
          </label>
          <div className="package-test-picker">
            {tests.length === 0 ? (
              <p className="body-sm text-muted" style={{ padding: '8px' }}>
                No active tests available. Please create tests first.
              </p>
            ) : (
              tests.map(test => (
                <div
                  key={test.id}
                  className="package-test-option"
                  onClick={() => handleToggleTest(test.id)}
                >
                  <input
                    type="checkbox"
                    checked={selectedTests.includes(test.id)}
                    onChange={() => {}} // Handled by option click
                    style={{ cursor: 'pointer' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500, fontSize: '14px' }}>{test.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      Code: {test.code || 'N/A'} • Price: ₹{test.price}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {pkg && (
          <div className="form-grid--full" style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '8px 0' }}>
            <input
              type="checkbox"
              id="pkgActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            <label htmlFor="pkgActive" style={{ fontWeight: 500, cursor: 'pointer' }}>
              Active (Visible in Patient search)
            </label>
          </div>
        )}

        <div className="form-grid--full" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
          <Button type="button" variant="tertiary" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={submitting}>
            {pkg ? 'Save Changes' : 'Create Package'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
