import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import Card from '../shared/Card';
import Badge from '../shared/Badge';
import Button from '../shared/Button';
import LoadingSpinner from '../shared/LoadingSpinner';
import { ClipboardList, Calendar, MapPin, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MyBookingsPage() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'completed' | 'cancelled'

  useEffect(() => {
    async function loadBookings() {
      try {
        const res = await api.get('/api/bookings/my');
        setBookings(res.data);
      } catch (err) {
        console.error('Error fetching patient bookings:', err);
        toast.error('Failed to load bookings history.');
      } finally {
        setLoading(false);
      }
    }
    loadBookings();
  }, []);

  const getStatusVariant = (status) => {
    switch (status) {
      case 'report_ready':
        return 'success';
      case 'cancelled':
      case 'failed':
        return 'neutral';
      case 'pending_lab_acceptance':
        return 'warning';
      default:
        return 'info';
    }
  };

  const getStatusLabel = (status) => {
    return status.replace(/_/g, ' ').toUpperCase();
  };

  if (loading) return <LoadingSpinner fullPage text="Retrieving your bookings..." />;

  // Filter bookings
  const activeBookings = bookings.filter(b => !['report_ready', 'cancelled', 'failed'].includes(b.status));
  const completedBookings = bookings.filter(b => b.status === 'report_ready');
  const cancelledBookings = bookings.filter(b => ['cancelled', 'failed'].includes(b.status));

  const getFilteredList = () => {
    if (activeTab === 'active') return activeBookings;
    if (activeTab === 'completed') return completedBookings;
    return cancelledBookings;
  };

  const filteredList = getFilteredList();

  return (
    <div className="my-bookings-page" style={{ padding: '24px 16px 80px', maxWidth: '600px', margin: '0 auto', minHeight: '100vh', backgroundColor: 'var(--surface-container-lowest)' }}>
      <h1 className="headline-sm" style={{ marginBottom: '20px', fontWeight: 700, fontSize: '22px' }}>My Bookings</h1>

      {/* Tab selection */}
      <div style={{ display: 'flex', gap: '16px', borderBottom: '1px solid var(--outline-variant)', marginBottom: '20px' }}>
        <button
          onClick={() => setActiveTab('active')}
          style={{
            padding: '8px 4px 12px',
            fontSize: '14px',
            fontWeight: 600,
            border: 'none',
            borderBottom: activeTab === 'active' ? '2px solid var(--primary)' : 'none',
            color: activeTab === 'active' ? 'var(--primary)' : 'var(--text-muted)',
            cursor: 'pointer',
            backgroundColor: 'transparent'
          }}
        >
          Active ({activeBookings.length})
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          style={{
            padding: '8px 4px 12px',
            fontSize: '14px',
            fontWeight: 600,
            border: 'none',
            borderBottom: activeTab === 'completed' ? '2px solid var(--primary)' : 'none',
            color: activeTab === 'completed' ? 'var(--primary)' : 'var(--text-muted)',
            cursor: 'pointer',
            backgroundColor: 'transparent'
          }}
        >
          Completed ({completedBookings.length})
        </button>
        <button
          onClick={() => setActiveTab('cancelled')}
          style={{
            padding: '8px 4px 12px',
            fontSize: '14px',
            fontWeight: 600,
            border: 'none',
            borderBottom: activeTab === 'cancelled' ? '2px solid var(--primary)' : 'none',
            color: activeTab === 'cancelled' ? 'var(--primary)' : 'var(--text-muted)',
            cursor: 'pointer',
            backgroundColor: 'transparent'
          }}
        >
          History ({cancelledBookings.length})
        </button>
      </div>

      {filteredList.length === 0 ? (
        <Card style={{ padding: '32px', textAlign: 'center', marginTop: '20px', backgroundColor: 'var(--surface-container-lowest)' }}>
          <ClipboardList size={40} className="text-muted" style={{ margin: '0 auto 12px', display: 'block' }} />
          <p className="body-lg text-secondary">No {activeTab} bookings</p>
          <p className="body-sm text-muted" style={{ margin: '4px 0 20px', fontSize: '13px' }}>
            Book diagnostic tests to see them in this list.
          </p>
          <Button variant="primary" size="sm" onClick={() => navigate('/patient')}>
            Explore Tests
          </Button>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredList.map(booking => (
            <Card
              key={booking.id}
              onClick={() => navigate(`/patient/bookings/${booking.id}`)}
              hoverable
              style={{ cursor: 'pointer', padding: '16px', backgroundColor: 'var(--surface-container-lowest)', border: '1px solid var(--outline-variant)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                    REF: {booking.booking_number}
                  </span>
                  <h3 className="title-sm" style={{ margin: '4px 0 0', fontWeight: 600, fontSize: '15px' }}>
                    {booking.lab_partners?.name || 'Diagnostic Lab'}
                  </h3>
                </div>
                <Badge variant={getStatusVariant(booking.status)}>
                  {getStatusLabel(booking.status)}
                </Badge>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                {booking.slot_datetime && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={14} className="text-muted" />
                    <span>{new Date(booking.slot_datetime).toLocaleDateString()} at {new Date(booking.slot_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={14} className="text-muted" />
                  <span style={{ textTransform: 'capitalize' }}>
                    {booking.collection_mode?.replace(/_/g, ' ') || 'Home Collection'}
                  </span>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: '16px',
                  paddingTop: '12px',
                  borderTop: '1px solid var(--outline-variant)',
                }}
              >
                <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '14px' }}>
                  Total: ₹{booking.total_amount}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '2px', fontSize: '12px', color: 'var(--primary)', fontWeight: 600 }}>
                  Track Order <ChevronRight size={14} />
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
