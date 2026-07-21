import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import { supabase } from '../config/supabase';
import { useAuth } from '../auth/AuthProvider';
import { TopBar } from '../shared/Navbar';
import Card from '../shared/Card';
import Input, { TextArea } from '../shared/Input';
import Button from '../shared/Button';
import toast from 'react-hot-toast';
import './LabPages.css';

const STEPS = ['Business Info', 'Address', 'Certification', 'Submit'];

export default function OnboardingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    lat: '',
    lng: '',
    service_radius_km: '10',
    nabl_certificate_url: '',
    bank_account_name: '',
    bank_account_number: '',
    bank_ifsc: '',
  });

  const updateForm = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.from('lab_partners').insert({
        owner_user_id: user.id,
        name: form.name,
        description: form.description,
        address: `${form.address}, ${form.city}, ${form.state} - ${form.pincode}`,
        lat: form.lat ? parseFloat(form.lat) : null,
        lng: form.lng ? parseFloat(form.lng) : null,
        service_radius_km: parseFloat(form.service_radius_km) || 10,
        nabl_certificate_url: form.nabl_certificate_url || null,
        status: 'pending_review',
      });

      if (error) throw error;
      toast.success('Application submitted! We\'ll review it shortly.');
      navigate('/lab');
    } catch (err) {
      toast.error(err.message || 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 0: return form.name && form.description;
      case 1: return form.address && form.city && form.state && form.pincode;
      case 2: return true;
      default: return true;
    }
  };

  return (
    <>
      <TopBar title="Lab Onboarding" />
      <div className="lab-content animate-fade-in-up">
        <div className="onboarding-wizard">
          {/* Progress Steps */}
          <div className="onboarding-steps">
            {STEPS.map((label, i) => (
              <span key={label} style={{ display: 'contents' }}>
                <div className={`onboarding-step ${i === step ? 'onboarding-step--active' : ''} ${i < step ? 'onboarding-step--done' : ''}`}>
                  <span className="onboarding-step__dot">
                    {i < step ? <Check size={16} /> : i + 1}
                  </span>
                  <span className="onboarding-step__label">{label}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <span className={`onboarding-step__line ${i < step ? 'onboarding-step__line--done' : ''}`} />
                )}
              </span>
            ))}
          </div>

          <Card padding="lg">
            {/* Step 1: Business Info */}
            {step === 0 && (
              <div className="flex flex-col gap-md">
                <h3 className="title-md">Business Information</h3>
                <Input
                  label="Lab Name *"
                  placeholder="e.g., MedLife Diagnostics"
                  value={form.name}
                  onChange={(e) => updateForm('name', e.target.value)}
                />
                <TextArea
                  label="Description *"
                  placeholder="Tell patients about your lab, services, and specializations..."
                  value={form.description}
                  onChange={(e) => updateForm('description', e.target.value)}
                />
              </div>
            )}

            {/* Step 2: Address */}
            {step === 1 && (
              <div className="flex flex-col gap-md">
                <h3 className="title-md">Lab Address</h3>
                <Input
                  label="Street Address *"
                  placeholder="123 Medical Complex, Main Road"
                  value={form.address}
                  onChange={(e) => updateForm('address', e.target.value)}
                />
                <div className="grid grid-cols-2" style={{ gap: 'var(--space-md)' }}>
                  <Input
                    label="City *"
                    placeholder="Mumbai"
                    value={form.city}
                    onChange={(e) => updateForm('city', e.target.value)}
                  />
                  <Input
                    label="State *"
                    placeholder="Maharashtra"
                    value={form.state}
                    onChange={(e) => updateForm('state', e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2" style={{ gap: 'var(--space-md)' }}>
                  <Input
                    label="PIN Code *"
                    placeholder="400001"
                    value={form.pincode}
                    onChange={(e) => updateForm('pincode', e.target.value)}
                  />
                  <Input
                    label="Service Radius (km)"
                    type="number"
                    placeholder="10"
                    value={form.service_radius_km}
                    onChange={(e) => updateForm('service_radius_km', e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Step 3: Certification */}
            {step === 2 && (
              <div className="flex flex-col gap-md">
                <h3 className="title-md">NABL Certification</h3>
                <p className="body-sm text-muted">
                  Upload your NABL certificate to get verified faster. You can also provide a URL to the certificate.
                </p>
                <Input
                  label="NABL Certificate URL"
                  placeholder="https://... or upload later"
                  value={form.nabl_certificate_url}
                  onChange={(e) => updateForm('nabl_certificate_url', e.target.value)}
                />
                <h3 className="title-md mt-lg">Bank Details (Optional)</h3>
                <Input
                  label="Account Holder Name"
                  placeholder="Lab name or owner name"
                  value={form.bank_account_name}
                  onChange={(e) => updateForm('bank_account_name', e.target.value)}
                />
                <div className="grid grid-cols-2" style={{ gap: 'var(--space-md)' }}>
                  <Input
                    label="Account Number"
                    placeholder="1234567890"
                    value={form.bank_account_number}
                    onChange={(e) => updateForm('bank_account_number', e.target.value)}
                  />
                  <Input
                    label="IFSC Code"
                    placeholder="SBIN0001234"
                    value={form.bank_ifsc}
                    onChange={(e) => updateForm('bank_ifsc', e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Step 4: Review & Submit */}
            {step === 3 && (
              <div className="flex flex-col gap-md">
                <h3 className="title-md">Review & Submit</h3>
                <div className="lab-review__detail-grid">
                  <div className="lab-review__detail">
                    <span className="lab-review__detail-label">Lab Name</span>
                    <span className="body-lg">{form.name}</span>
                  </div>
                  <div className="lab-review__detail">
                    <span className="lab-review__detail-label">Address</span>
                    <span className="body-lg">{`${form.address}, ${form.city}`}</span>
                  </div>
                  <div className="lab-review__detail">
                    <span className="lab-review__detail-label">Service Radius</span>
                    <span className="body-lg">{form.service_radius_km} km</span>
                  </div>
                  <div className="lab-review__detail">
                    <span className="lab-review__detail-label">NABL Certificate</span>
                    <span className="body-lg">{form.nabl_certificate_url ? 'Provided' : 'Not provided'}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-xl">
              {step > 0 ? (
                <Button variant="tertiary" onClick={() => setStep(step - 1)}>
                  Back
                </Button>
              ) : <div />}

              {step < STEPS.length - 1 ? (
                <Button variant="primary" onClick={() => setStep(step + 1)} disabled={!canProceed()}>
                  Continue
                </Button>
              ) : (
                <Button variant="primary" size="lg" onClick={handleSubmit} loading={loading}>
                  Submit Application
                </Button>
              )}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
