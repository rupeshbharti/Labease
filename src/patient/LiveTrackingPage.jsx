import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import Card from '../shared/Card';
import Badge from '../shared/Badge';
import Button from '../shared/Button';
import LoadingSpinner from '../shared/LoadingSpinner';
import { ArrowLeft, MapPin, Navigation, Phone, Calendar, Clipboard, ShieldCheck, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';

export default function LiveTrackingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState({ lat: 12.9716, lng: 77.5946 }); // Default center coords
  const [eta, setEta] = useState('15 mins');
  const [smsNotification, setSmsNotification] = useState(null);

  // Load booking details
  const loadBooking = async () => {
    try {
      const res = await api.get(`/api/bookings/${id}`);
      setBooking(res.data);
      
      // If status is arrived, show simulated SMS notification
      if (res.data.status === 'arrived' && res.data.otp_code) {
        setSmsNotification(`Simulated SMS: "Your LabEase collection verification code is ${res.data.otp_code}. Please share this with the agent upon arrival."`);
      } else {
        setSmsNotification(null);
      }
    } catch (err) {
      console.error('Error fetching tracking booking details:', err);
      toast.error('Failed to load tracking details.');
      navigate('/patient/bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBooking();
    
    // Set up polling interval to check status updates from API (Supabase Realtime fallback)
    const statusInterval = setInterval(loadBooking, 5000);
    return () => clearInterval(statusInterval);
  }, [id]);

  // Connect to Socket.io to listen for live GPS location updates
  useEffect(() => {
    if (loading || !booking || !['phlebotomist_assigned', 'en_route', 'arrived'].includes(booking.status)) return;

    const socketUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
    const socket = io(socketUrl);

    socket.emit('join-tracking', id);
    console.log(`🔌 Patient tracking socket joined room for booking: ${id}`);

    socket.on('location-update', (data) => {
      console.log('📍 Live location update received:', data);
      if (data.lat && data.lng) {
        setLocation({ lat: data.lat, lng: data.lng });
      }
      if (data.eta) {
        setEta(data.eta);
      }
    });

    return () => {
      socket.disconnect();
      console.log('🔌 Disconnected from socket');
    };
  }, [id, loading, booking?.status]);

  if (loading) return <LoadingSpinner fullPage text="Initiating secure tracking gateway..." />;
  if (!booking) return null;

  // Tracker status steps
  const steps = [
    { key: 'confirmed', label: 'Booking Confirmed' },
    { key: 'en_route', label: 'En Route' },
    { key: 'arrived', label: 'Arrived at Location' },
    { key: 'sample_collected', label: 'Sample Collected' }
  ];

  const currentIdx = steps.findIndex(step => {
    if (step.key === 'confirmed') return ['confirmed', 'phlebotomist_assigned'].includes(booking.status);
    if (step.key === 'en_route') return booking.status === 'en_route';
    if (step.key === 'arrived') return booking.status === 'arrived';
    if (step.key === 'sample_collected') return ['sample_collected', 'sample_received_at_lab', 'report_ready'].includes(booking.status);
    return false;
  });

  // Calculate SVG transit indicator position based on progress
  // Lab at 10% progress, Patient at 90% progress
  const getSimulatedProgress = () => {
    if (booking.status === 'confirmed' || booking.status === 'phlebotomist_assigned') return 10;
    if (booking.status === 'en_route') {
      // Calculate interpolation step if possible, otherwise midpoint 50%
      const startLat = 12.9716;
      const startLng = 77.5946;
      const destLat = booking.addresses?.lat || 12.9750;
      const destLng = booking.addresses?.lng || 77.6000;
      
      const totalDist = Math.sqrt(Math.pow(destLat - startLat, 2) + Math.pow(destLng - startLng, 2));
      const currentDist = Math.sqrt(Math.pow(location.lat - startLat, 2) + Math.pow(location.lng - startLng, 2));
      
      if (totalDist === 0) return 50;
      const percent = Math.min((currentDist / totalDist) * 100, 100);
      return 10 + (percent * 0.8); // Scale between 10% and 90%
    }
    if (booking.status === 'arrived') return 90;
    return 100;
  };

  const progressPercent = getSimulatedProgress();

  return (
    <div className="live-tracking-page" style={{ padding: '24px 16px 80px', maxWidth: '600px', margin: '0 auto', minHeight: '100vh', backgroundColor: 'var(--surface-container-lowest)' }}>
      
      {/* Simulated SMS Toast Overlay */}
      {smsNotification && (
        <div style={{
          backgroundColor: 'var(--primary-container)',
          border: '2px solid var(--primary)',
          borderRadius: 'var(--radius-lg)',
          padding: '16px',
          marginBottom: '20px',
          color: 'var(--primary)',
          boxShadow: 'var(--shadow-2)',
          display: 'flex',
          gap: '12px',
          alignItems: 'flex-start'
        }}>
          <span style={{ fontSize: '24px', flexShrink: 0 }}>💬</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Simulated SMS Message</div>
            <p style={{ margin: '4px 0 0', fontSize: '13px', lineHeight: 1.4 }}>{smsNotification}</p>
          </div>
        </div>
      )}

      {/* Header section */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <button
          onClick={() => navigate(`/patient/bookings/${id}`)}
          style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <ArrowLeft size={24} className="text-primary" />
        </button>
        <div>
          <h1 className="headline-sm" style={{ margin: 0, fontWeight: 700, fontSize: '20px' }}>Live Track Sample Collector</h1>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
            REF: {booking.booking_number}
          </span>
        </div>
      </div>

      {/* SVG Map Tracker Display */}
      <Card style={{ padding: '20px', marginBottom: '20px', backgroundColor: 'var(--surface-container-lowest)', border: '1px solid var(--outline-variant)', overflow: 'hidden' }}>
        <h3 className="title-sm" style={{ margin: '0 0 16px', fontWeight: 600, fontSize: '15px' }}>Collector Transit Map</h3>
        
        <div style={{ position: 'relative', height: '220px', width: '100%', backgroundColor: 'var(--surface-container-low)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--outline-variant)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          
          {/* Base Path SVG drawing */}
          <svg style={{ position: 'absolute', width: '100%', height: '100%', top: 0, left: 0 }}>
            {/* Draw Path */}
            <path
              d="M 50 110 Q 150 40, 250 110 T 450 110"
              fill="none"
              stroke="var(--outline-variant)"
              strokeWidth="4"
              strokeDasharray="8 6"
            />
            {/* Draw active traversed path */}
            <path
              d="M 50 110 Q 150 40, 250 110 T 450 110"
              fill="none"
              stroke="var(--primary)"
              strokeWidth="4"
              strokeDasharray="450"
              strokeDashoffset={450 - (450 * (progressPercent / 100))}
              style={{ transition: 'stroke-dashoffset 0.8s ease' }}
            />
            
            {/* Starting Node (Lab) */}
            <circle cx="50" cy="110" r="10" fill="var(--success)" />
            
            {/* Destination Node (Home) */}
            <circle cx="450" cy="110" r="10" fill="var(--error)" />
          </svg>

          {/* Node Labels */}
          <div style={{ position: 'absolute', left: '20px', top: '130px', textAlign: 'center' }}>
            <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--success)' }}>LAB CENTER</span>
          </div>
          <div style={{ position: 'absolute', right: '20px', top: '130px', textAlign: 'center' }}>
            <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--error)' }}>PATIENT HOME</span>
          </div>

          {/* Animated Delivery Agent Position Pin */}
          <div
            style={{
              position: 'absolute',
              left: `calc(${progressPercent}% - 20px)`,
              top: '75px',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: 'white',
              border: '2px solid var(--primary)',
              boxShadow: 'var(--shadow-2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'left 0.8s ease',
              zIndex: 3
            }}
          >
            <Navigation size={20} className="text-primary" style={{ transform: 'rotate(90deg)' }} />
          </div>

          {/* Real-time coordinates widget */}
          <div style={{ position: 'absolute', bottom: '12px', left: '16px', display: 'flex', gap: '8px', fontSize: '11px', color: 'var(--text-secondary)' }}>
            <span>Lat: {location.lat.toFixed(4)}</span>
            <span>Lng: {location.lng.toFixed(4)}</span>
          </div>

          {/* ETA Floating badge */}
          {booking.status === 'en_route' && (
            <div style={{ position: 'absolute', top: '12px', right: '16px', backgroundColor: 'var(--primary)', color: 'white', padding: '4px 10px', borderRadius: 'var(--radius-xl)', fontSize: '12px', fontWeight: 700 }}>
              ETA: {eta}
            </div>
          )}
        </div>
      </Card>

      {/* Check-in OTP Verification Panel */}
      {booking.status === 'arrived' && booking.otp_code && (
        <Card style={{ padding: '20px', marginBottom: '20px', backgroundColor: 'var(--primary-container)', border: '2px solid var(--primary)', borderRadius: 'var(--radius-xl)' }}>
          <h3 className="title-sm" style={{ margin: '0 0 8px', fontWeight: 700, fontSize: '15px', color: 'var(--primary)' }}>Sample Verification Code</h3>
          <p style={{ margin: '0 0 16px', fontSize: '13px', color: 'var(--primary)', opacity: 0.9 }}>
            Please share this 4-digit OTP code with the check-in collector agent to verify and log your sample collection.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ letterSpacing: '4px', fontSize: '32px', fontWeight: 800, color: 'var(--primary)', fontFamily: 'monospace', border: '2px dashed var(--primary)', padding: '8px 24px', borderRadius: 'var(--radius-lg)', backgroundColor: 'white' }}>
              {booking.otp_code}
            </div>
          </div>
        </Card>
      )}

      {/* Tracker timeline status */}
      <Card style={{ padding: '20px', marginBottom: '20px', backgroundColor: 'var(--surface-container-lowest)', border: '1px solid var(--outline-variant)' }}>
        <h3 className="title-sm" style={{ margin: '0 0 16px', fontWeight: 600, fontSize: '15px' }}>Transit Stages</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative', paddingLeft: '24px' }}>
          <div style={{ position: 'absolute', left: '7px', top: '8px', bottom: '8px', width: '2px', backgroundColor: 'var(--outline-variant)' }}></div>
          
          {steps.map((step, idx) => {
            const isCompleted = idx < currentIdx;
            const isCurrent = idx === currentIdx;
            const isFuture = idx > currentIdx;

            return (
              <div key={step.key} style={{ display: 'flex', alignItems: 'center', gap: '12px', position: 'relative' }}>
                <div
                  className={isCurrent ? 'pulse-animation' : ''}
                  style={{
                    position: 'absolute',
                    left: '-24px',
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    border: '2px solid white',
                    backgroundColor: isCompleted ? 'var(--success)' : isCurrent ? 'var(--primary)' : 'var(--outline)',
                    boxShadow: 'var(--shadow-1)',
                    zIndex: 2
                  }}
                />
                <span
                  style={{
                    fontSize: '13px',
                    fontWeight: isCurrent ? 700 : 500,
                    color: isCompleted ? 'var(--on-surface)' : isCurrent ? 'var(--primary)' : 'var(--outline)'
                  }}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Collector profile card */}
      {booking.phlebotomist && (
        <Card style={{ padding: '16px', backgroundColor: 'var(--surface-container-lowest)', border: '1px solid var(--outline-variant)' }}>
          <h3 className="title-sm" style={{ margin: '0 0 12px', fontWeight: 600, fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={18} className="text-primary" /> Assigned Collector Profile
          </h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '14px' }}>{booking.phlebotomist.name}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Verified Collection Agent • LabEase Partner
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
    </div>
  );
}
