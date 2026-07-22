import { useState } from 'react';
import Modal from '../../shared/Modal';
import Button from '../../shared/Button';
import { Upload, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export function CollectionModal({ isOpen, onClose, task, onSubmit }) {
  const [identityVerified, setIdentityVerified] = useState(false);
  const [fastingConfirmed, setFastingConfirmed] = useState(false);
  const [vialsLabeled, setVialsLabeled] = useState(false);
  const [collectionPhoto, setCollectionPhoto] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !task) return null;

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCollectionPhoto(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identityVerified || !fastingConfirmed || !vialsLabeled) {
      toast.error('Please verify all sample checklist items.');
      return;
    }
    if (!otpCode || otpCode.length !== 4) {
      toast.error('Please enter the 4-digit patient verification OTP.');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({ otp: otpCode, photoUrl: collectionPhoto });
    } catch (err) {
      // toast handled in context
    } finally {
      setSubmitting(false);
    }
  };

  const booking = task.bookings || {};

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Sample Collection Verification">
      <form onSubmit={handleSubmit} className="collection-modal-form">
        <div className="collection-patient-banner">
          <div>
            <strong>{booking.patient_name || 'Patient'}</strong>
            <p className="body-sm text-secondary">REF: #{booking.id?.slice(0, 8)}</p>
          </div>
          <ShieldCheck size={24} className="text-primary" />
        </div>

        <div className="checklist-group">
          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={identityVerified}
              onChange={(e) => setIdentityVerified(e.target.checked)}
            />
            <span>Verified Patient Identity ID / Aadhaar</span>
          </label>

          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={fastingConfirmed}
              onChange={(e) => setFastingConfirmed(e.target.checked)}
            />
            <span>Confirmed Fasting Protocol Requirement</span>
          </label>

          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={vialsLabeled}
              onChange={(e) => setVialsLabeled(e.target.checked)}
            />
            <span>Blood Vials Sealed & Barcode Labeled</span>
          </label>
        </div>

        {/* Photo Upload */}
        <div className="photo-upload-section">
          <label className="photo-label">UPLOAD VIAL COLLECTION PHOTO (OPTIONAL)</label>
          <input
            type="file"
            accept="image/*"
            id="vial-photo-input"
            style={{ display: 'none' }}
            onChange={handlePhotoUpload}
          />
          <label htmlFor="vial-photo-input" className="photo-upload-box">
            {collectionPhoto ? (
              <img src={collectionPhoto} alt="Vial proof" className="photo-preview" />
            ) : (
              <div className="upload-placeholder">
                <Upload size={24} className="text-primary" />
                <span>Tap to capture or upload vial photo</span>
              </div>
            )}
          </label>
        </div>

        {/* Patient 4-Digit OTP Entry */}
        <div className="otp-section">
          <label className="otp-label">ENTER 4-DIGIT PATIENT OTP</label>
          <input
            type="text"
            maxLength={4}
            placeholder="e.g. 1234"
            className="otp-input"
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
          />
          <p className="otp-hint flex items-center gap-1">
            <AlertCircle size={12} />
            <span>Ask patient for 4-digit SMS OTP code sent upon arrival.</span>
          </p>
        </div>

        <div className="modal-actions">
          <Button variant="ghost" type="button" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            loading={submitting}
            icon={<CheckCircle2 size={16} />}
          >
            Verify & Complete Collection
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default CollectionModal;
