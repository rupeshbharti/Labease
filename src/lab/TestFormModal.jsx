import { useState, useEffect } from 'react';
import Modal from '../shared/Modal';
import Input from '../shared/Input';
import Button from '../shared/Button';
import toast from 'react-hot-toast';

export default function TestFormModal({ isOpen, onClose, onSubmit, test = null }) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [turnaroundHours, setTurnaroundHours] = useState('');
  const [sampleType, setSampleType] = useState('');
  const [preparation, setPreparation] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Sync state if editing an existing test
  useEffect(() => {
    if (test) {
      setName(test.name || '');
      setCode(test.code || '');
      setCategory(test.category || '');
      setPrice(test.price || '');
      setTurnaroundHours(test.turnaround_hours || '');
      setSampleType(test.sample_type || '');
      setPreparation(test.preparation_instructions || '');
      setDescription(test.description || '');
      setIsActive(test.is_active !== false);
    } else {
      setName('');
      setCode('');
      setCategory('');
      setPrice('');
      setTurnaroundHours('');
      setSampleType('');
      setPreparation('');
      setDescription('');
      setIsActive(true);
    }
  }, [test, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Test name is required');
      return;
    }
    if (!price || parseFloat(price) <= 0) {
      toast.error('Please enter a valid price');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        name,
        code: code || null,
        category: category || null,
        price: parseFloat(price),
        turnaround_hours: turnaroundHours ? parseInt(turnaroundHours) : null,
        sample_type: sampleType || null,
        preparation_instructions: preparation || null,
        description: description || null,
        is_active: isActive,
      });
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to submit test details');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={test ? 'Edit Test' : 'Add New Test'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="form-grid">
        <div className="form-grid--full">
          <Input
            label="Test Name *"
            type="text"
            placeholder="e.g. Complete Blood Count (CBC)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <Input
          label="Test Code (Optional)"
          type="text"
          placeholder="e.g. CBC01"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />

        <Input
          label="Category (Optional)"
          type="text"
          placeholder="e.g. Hematology"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />

        <Input
          label="Price (INR) *"
          type="number"
          placeholder="e.g. 299"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
          min="1"
        />

        <Input
          label="Turnaround Time (Hours)"
          type="number"
          placeholder="e.g. 24"
          value={turnaroundHours}
          onChange={(e) => setTurnaroundHours(e.target.value)}
          min="1"
        />

        <Input
          label="Sample Type"
          type="text"
          placeholder="e.g. EDTA Whole Blood, Urine"
          value={sampleType}
          onChange={(e) => setSampleType(e.target.value)}
        />

        <div className="form-grid--full">
          <Input
            label="Preparation Instructions"
            type="text"
            placeholder="e.g. Fasting required for 12 hours"
            value={preparation}
            onChange={(e) => setPreparation(e.target.value)}
          />
        </div>

        <div className="form-grid--full">
          <label className="input-group__label">Description</label>
          <textarea
            className="input-group__input"
            rows="3"
            placeholder="Brief details about the test..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ width: '100%', padding: '12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius)' }}
          />
        </div>

        {test && (
          <div className="form-grid--full" style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '8px 0' }}>
            <input
              type="checkbox"
              id="isActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            <label htmlFor="isActive" style={{ fontWeight: 500, cursor: 'pointer' }}>
              Active (Visible in Patient search)
            </label>
          </div>
        )}

        <div className="form-grid--full" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
          <Button type="button" variant="tertiary" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={submitting}>
            {test ? 'Save Changes' : 'Create Test'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
