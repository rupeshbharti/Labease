import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import Card from '../shared/Card';
import Badge from '../shared/Badge';
import Button from '../shared/Button';
import LoadingSpinner from '../shared/LoadingSpinner';
import { ArrowLeft, Calendar, MapPin, Clipboard, FileText, Download, Phone, ShieldCheck, User, Navigation } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '../shared/Modal';

export default function BookingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [labRating, setLabRating] = useState(5);
  const [labText, setLabText] = useState('');
  const [phleboRating, setPhleboRating] = useState(5);
  const [phleboNote, setPhleboNote] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    async function loadBookingDetail() {
      try {
        const res = await api.get(`/api/bookings/${id}`);
        setBooking(res.data);
      } catch (err) {
        console.error('Error fetching booking detail:', err);
        toast.error('Failed to load booking details.');
        navigate('/patient/bookings');
      } finally {
        setLoading(false);
      }
    }
    loadBookingDetail();
  }, [id, navigate]);

  const handleCancelBooking = async () => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    setCancelling(true);
    try {
      const res = await api.put(`/api/bookings/${id}/cancel`);
      setBooking(prev => ({ ...prev, status: res.data.status }));
      toast.success('Booking cancelled successfully.');
    } catch (err) {
      toast.error(err.message || 'Failed to cancel booking');
    } finally {
      setCancelling(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);
    try {
      await api.post(`/api/bookings/${booking.id}/review`, {
        lab_rating: labRating,
        lab_review_text: labText,
        phlebotomist_rating: phleboRating,
        phlebotomist_note: phleboNote
      });
      toast.success('Thank you for your rating feedback!');
      setIsReviewOpen(false);
      
      const res = await api.get(`/api/bookings/${id}`);
      setBooking(res.data);
    } catch (err) {
      toast.error(err.response?.data?.error || err.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleShareReport = async () => {
    setSharing(true);
    try {
      const res = await api.post(`/api/bookings/${booking.id}/share`);
      const fullUrl = `${window.location.origin}${res.data.share_url}`;
      await navigator.clipboard.writeText(fullUrl);
      toast.success('Secure share link copied to clipboard! (Expires in 7 days)');
    } catch (err) {
      toast.error('Failed to generate share link');
    } finally {
      setSharing(false);
    }
  };

  if (loading) return <LoadingSpinner fullPage text="Retrieving booking details..." />;
  if (!booking) return null;

  // Status mapping
  const pipeline = [
    { key: 'pending_lab_acceptance', label: 'Booking Placed' },
    { key: 'confirmed', label: 'Confirmed by Lab' },
    { key: 'phlebotomist_assigned', label: 'Phlebotomist Assigned' },
    { key: 'en_route', label: 'Phlebotomist En Route' },
    { key: 'arrived', label: 'Phlebotomist Arrived' },
    { key: 'sample_collected', label: 'Sample Collected' },
    { key: 'sample_received_at_lab', label: 'Received at Lab' },
    { key: 'report_ready', label: 'Reports Delivered' },
  ];

  const currentStatusIdx = pipeline.findIndex(step => step.key === booking.status);

  return (
    <div className="booking-detail-page" style={{ padding: '24px 16px 80px', maxWidth: '600px', margin: '0 auto', minHeight: '100vh', backgroundColor: 'var(--surface-container-lowest)' }}>
      {/* Header section with back button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <button
          onClick={() => navigate('/patient/bookings')}
          style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <ArrowLeft size={24} className="text-primary" />
        </button>
        <div>
          <h1 className="headline-sm" style={{ margin: 0, fontWeight: 700, fontSize: '20px' }}>Booking Details</h1>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
            REF: {booking.booking_number}
          </span>
        </div>
      </div>

      {/* Lab Partner summary Card */}
      <Card style={{ padding: '16px', marginBottom: '20px', backgroundColor: 'var(--surface-container-lowest)', border: '1px solid var(--outline-variant)' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--surface-container)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
            }}
          >
            {booking.lab_partners?.logo_url ? (
              <img src={booking.lab_partners.logo_url} alt={booking.lab_partners.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ color: 'var(--primary)', fontSize: '18px' }}>{booking.lab_partners?.name?.charAt(0)}</span>
            )}
          </div>
          <div style={{ flex: 1 }}>
            <h3 className="title-md" style={{ margin: 0, fontWeight: 600, fontSize: '16px' }}>{booking.lab_partners?.name}</h3>
            <p className="body-sm text-secondary" style={{ margin: '4px 0 0', fontSize: '13px' }}>{booking.lab_partners?.address}</p>
          </div>
        </div>
      </Card>

      {/* Status timeline */}
      <Card style={{ padding: '20px', marginBottom: '20px', backgroundColor: 'var(--surface-container-lowest)', border: '1px solid var(--outline-variant)' }}>
        <h3 className="title-sm" style={{ margin: '0 0 16px', fontWeight: 600, fontSize: '15px' }}>Order Tracker</h3>
        
        {booking.status === 'cancelled' ? (
          <Badge variant="neutral" style={{ padding: '8px 12px', fontSize: '13px', display: 'block', textAlign: 'center' }}>
            ORDER CANCELLED
          </Badge>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative', paddingLeft: '24px' }}>
            {/* Timeline line */}
            <div style={{ position: 'absolute', left: '7px', top: '8px', bottom: '8px', width: '2px', backgroundColor: 'var(--outline-variant)' }}></div>
            
            {pipeline.map((step, idx) => {
              const isPast = idx <= currentStatusIdx;
              const isCurrent = idx === currentStatusIdx;
              
              return (
                <div key={step.key} style={{ display: 'flex', alignItems: 'center', gap: '12px', position: 'relative' }}>
                  {/* Point circle */}
                  <div
                    className={isCurrent ? 'pulse-animation' : ''}
                    style={{
                      position: 'absolute',
                      left: '-24px',
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      border: '2px solid white',
                      backgroundColor: isCurrent ? 'var(--primary)' : isPast ? 'var(--success)' : 'var(--outline)',
                      boxShadow: 'var(--shadow-1)',
                      zIndex: 2,
                      transition: 'all 0.3s ease'
                    }}
                  />
                  <span
                    className="body-sm"
                    style={{
                      fontWeight: isCurrent ? 600 : 500,
                      color: isCurrent ? 'var(--primary)' : isPast ? 'var(--on-surface)' : 'var(--outline)',
                      fontSize: '13px'
                    }}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
        {['phlebotomist_assigned', 'en_route', 'arrived'].includes(booking.status) && (
          <Button
            variant="primary"
            fullWidth
            onClick={() => navigate(`/patient/bookings/${booking.id}/track`)}
            style={{ marginTop: '16px', borderRadius: 'var(--radius-xl)' }}
            icon={<Navigation size={16} />}
          >
            Live Track Collector
          </Button>
        )}
      </Card>

      {/* Booking details card */}
      <Card style={{ padding: '16px', marginBottom: '20px', backgroundColor: 'var(--surface-container-lowest)', border: '1px solid var(--outline-variant)' }}>
        <h3 className="title-sm" style={{ margin: '0 0 12px', fontWeight: 600, fontSize: '15px' }}>Appointment Details</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px', color: 'var(--text-secondary)' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Calendar size={16} className="text-muted" />
            <span>Scheduled: {booking.slot_datetime ? `${new Date(booking.slot_datetime).toLocaleDateString()} at ${new Date(booking.slot_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Walk-In / Flexible'}</span>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
            <MapPin size={16} className="text-muted" style={{ marginTop: '2px', flexShrink: 0 }} />
            <span>
              {booking.collection_mode === 'walk_in' ? 'Walk-In at Lab' : `Home Collection: ${booking.addresses?.full_address || 'Address not found'}`}
            </span>
          </div>

          {booking.family_members && (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <ShieldCheck size={16} className="text-muted" />
              <span>For Patient: {booking.family_members.name} ({booking.family_members.relation})</span>
            </div>
          )}
        </div>
      </Card>

      {/* Phlebotomist Details Card */}
      {booking.phlebotomist && (
        <Card style={{ padding: '16px', marginBottom: '20px', backgroundColor: 'var(--surface-container-lowest)', border: '1px solid var(--outline-variant)' }}>
          <h3 className="title-sm" style={{ margin: '0 0 12px', fontWeight: 600, fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={18} className="text-primary" /> Phlebotomist Details
          </h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '14px' }}>{booking.phlebotomist.name}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Contact: {booking.phlebotomist.phone || 'No phone number provided'}
              </div>
            </div>
            {booking.phlebotomist.phone && (
              <a href={`tel:${booking.phlebotomist.phone}`} style={{ textDecoration: 'none' }}>
                <span className="btn btn--secondary btn--sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <Phone size={14} /> Call Agent
                </span>
              </a>
            )}
          </div>
        </Card>
      )}

      {/* Selected Items */}
      <Card style={{ padding: '16px', marginBottom: '20px', backgroundColor: 'var(--surface-container-lowest)', border: '1px solid var(--outline-variant)' }}>
        <h3 className="title-sm" style={{ margin: '0 0 12px', fontWeight: 600, fontSize: '15px' }}>Booked Items</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {booking.items?.map(itm => (
            <div key={itm.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
              <span>{itm.tests?.name || itm.packages?.name || 'Diagnostic test'}</span>
              <span style={{ fontWeight: 600 }}>₹{itm.price_at_booking}</span>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--outline-variant)', paddingTop: '12px', fontWeight: 700, fontSize: '14px', color: 'var(--primary)' }}>
            <span>Total Paid:</span>
            <span>₹{booking.total_amount}</span>
          </div>
        </div>
      </Card>

      {/* Reports area */}
      {booking.reports && booking.reports.length > 0 && (
        <Card style={{ padding: '16px', marginBottom: '20px', borderLeft: '4px solid var(--success)', backgroundColor: 'var(--surface-container-lowest)', border: '1px solid var(--outline-variant)', borderLeftWidth: '4px' }}>
          <h3 className="title-sm" style={{ margin: '0 0 12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', fontSize: '15px' }}>
            <FileText size={18} className="text-success" /> Reports Available
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {booking.reports.map(rep => (
              <div key={rep.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '13px' }}>Diagnostic Report.pdf</div>
                  <span className="body-sm text-secondary" style={{ fontSize: '11px' }}>Version {rep.version} • {new Date(rep.uploaded_at).toLocaleDateString()}</span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Button variant="secondary" size="sm" onClick={handleShareReport} loading={sharing} style={{ padding: '4px 10px', fontSize: '12px' }}>
                    Share Link
                  </Button>
                  <a href={rep.file_url} target="_blank" rel="noreferrer" download style={{ textDecoration: 'none' }}>
                    <span className="btn btn--secondary btn--sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <span className="btn__icon"><Download size={14} /></span>
                      <span className="btn__label" style={{ fontSize: '12px' }}>Download</span>
                    </span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Review Feedback Prompter Card */}
      {booking.status === 'report_ready' && !booking.review && (
        <Card style={{ padding: '16px', marginBottom: '20px', backgroundColor: 'var(--primary-container)', border: '1px dashed var(--primary)', borderRadius: 'var(--radius-xl)' }}>
          <h3 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: 700, color: 'var(--primary)' }}>How was your experience?</h3>
          <p style={{ margin: '0 0 12px', fontSize: '13px', color: 'var(--primary)', opacity: 0.9 }}>
            Please take a moment to rate the diagnostic laboratory services and phlebotomist collection agent.
          </p>
          <Button variant="primary" size="sm" onClick={() => setIsReviewOpen(true)}>
            Submit Review Feedback
          </Button>
        </Card>
      )}

      {booking.review && (
        <Card style={{ padding: '14px', marginBottom: '20px', borderLeft: '4px solid var(--success)', backgroundColor: 'var(--surface-container-lowest)', border: '1px solid var(--outline-variant)' }}>
          <h3 style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: 600, color: 'var(--success)' }}>✅ Feedback Submitted</h3>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            You rated the Lab {booking.review.lab_rating}⭐ and the Phlebotomist {booking.review.phlebotomist_rating}⭐
          </div>
          {booking.review.lab_response_text && (
            <div style={{ marginTop: '8px', padding: '8px 12px', backgroundColor: 'var(--surface-container-low)', borderRadius: 'var(--radius-sm)', fontSize: '12px' }}>
              <strong>Lab Response:</strong> {booking.review.lab_response_text}
            </div>
          )}
        </Card>
      )}

      {/* Cancel button */}
      {['pending_lab_acceptance', 'confirmed'].includes(booking.status) && (
        <Button
          variant="tertiary"
          fullWidth
          onClick={handleCancelBooking}
          loading={cancelling}
          style={{ color: 'var(--error)', backgroundColor: 'var(--error-container)', borderRadius: 'var(--radius-xl)' }}
        >
          Cancel Appointment
        </Button>
      )}

      {/* Ratings & Reviews Modal Form */}
      <Modal
        open={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        title="Submit Order Feedback"
        size="md"
      >
        <form onSubmit={handleReviewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <h4 style={{ margin: '0 0 6px', fontSize: '14px', fontWeight: 600 }}>Rate Lab Diagnostic Services</h4>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              {[1, 2, 3, 4, 5].map(stars => (
                <button
                  type="button"
                  key={stars}
                  onClick={() => setLabRating(stars)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '24px', color: stars <= labRating ? '#FFB300' : 'var(--outline-variant)' }}
                >
                  ★
                </button>
              ))}
            </div>
            <textarea
              value={labText}
              onChange={(e) => setLabText(e.target.value)}
              placeholder="What was your experience with their diagnostic services?"
              style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius)', border: '1px solid var(--outline-variant)', minHeight: '80px', fontSize: '13px' }}
            />
          </div>

          <div>
            <h4 style={{ margin: '0 0 6px', fontSize: '14px', fontWeight: 600 }}>Rate Phlebotomist Collection Agent</h4>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              {[1, 2, 3, 4, 5].map(stars => (
                <button
                  type="button"
                  key={stars}
                  onClick={() => setPhleboRating(stars)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '24px', color: stars <= phleboRating ? '#FFB300' : 'var(--outline-variant)' }}
                >
                  ★
                </button>
              ))}
            </div>
            <textarea
              value={phleboNote}
              onChange={(e) => setPhleboNote(e.target.value)}
              placeholder="How was the sample collection agent's behavior and timeliness? (Optional)"
              style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius)', border: '1px solid var(--outline-variant)', minHeight: '80px', fontSize: '13px' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid var(--outline-variant)', paddingTop: '16px', marginTop: '8px' }}>
            <Button type="button" variant="secondary" onClick={() => setIsReviewOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submittingReview}>
              Submit Feedback
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
