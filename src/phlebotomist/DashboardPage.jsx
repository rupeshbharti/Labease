import { useState, useEffect } from 'react';
import api from '../utils/api';
import Card from '../shared/Card';
import Button from '../shared/Button';
import Badge from '../shared/Badge';
import Modal from '../shared/Modal';
import LoadingSpinner from '../shared/LoadingSpinner';
import { Calendar, MapPin, Phone, CheckCircle2, Navigation, RefreshCw, Clipboard, AlertCircle, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';
import './PhleboPages.css';

export default function DashboardPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [updatingId, setUpdatingId] = useState(null);

  // Checklist modal states
  const [isChecklistOpen, setIsChecklistOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [identityVerified, setIdentityVerified] = useState(false);
  const [fastingConfirmed, setFastingConfirmed] = useState(false);
  const [vialsLabeled, setVialsLabeled] = useState(false);
  const [collectionPhoto, setCollectionPhoto] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [submittingChecklist, setSubmittingChecklist] = useState(false);

  // Load assignments and online status
  const loadTasks = async () => {
    setLoading(true);
    try {
      const [tasksRes, profileRes] = await Promise.all([
        api.get('/api/phlebo/tasks'),
        api.get('/api/users/me')
      ]);
      setTasks(tasksRes.data);
      setIsOnline(profileRes.data.duty_status || false);
      localStorage.setItem('phlebo_tasks_cache', JSON.stringify(tasksRes.data));
    } catch (err) {
      console.error('Error loading phlebo tasks:', err);
      toast.error('Failed to load assignments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial offline cache load
    const cached = localStorage.getItem('phlebo_tasks_cache');
    if (cached) {
      setTasks(JSON.parse(cached));
    }

    loadTasks();

    // Listen for network connectivity status
    const handleOnline = () => {
      setIsOffline(false);
      loadTasks();
    };
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Handle Duty Status change
  const handleToggleOnline = async (checked) => {
    if (isOffline) {
      toast.error('Cannot change duty status while offline.');
      return;
    }
    try {
      const res = await api.put('/api/phlebo/status', { duty_status: checked });
      setIsOnline(res.data.duty_status);
      toast.success(res.data.duty_status ? 'You are now Online (Active)' : 'You are Offline');
    } catch (err) {
      toast.error('Failed to update duty status');
    }
  };

  // Socket.io Geolocation Broadcast loop
  useEffect(() => {
    const activeRouteTask = tasks.find(t => t.status === 'en_route');
    if (!activeRouteTask || isOffline) return;

    // Initialize Socket.io client connection
    const socketUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
    const socket = io(socketUrl);

    socket.emit('join-tracking', activeRouteTask.bookings.id);
    console.log(`🔌 Phlebo tracking socket joined room for booking: ${activeRouteTask.bookings.id}`);

    // Mock geolocation tracking progress
    let step = 0;
    const startLat = 12.9716;
    const startLng = 77.5946;
    const destLat = activeRouteTask.bookings.addresses?.lat || 12.9750;
    const destLng = activeRouteTask.bookings.addresses?.lng || 77.6000;

    const intervalId = setInterval(async () => {
      step += 1;
      const progress = Math.min(step / 10, 1);
      const currentLat = startLat + (destLat - startLat) * progress;
      const currentLng = startLng + (destLng - startLng) * progress;
      const etaMinutes = Math.max(15 - step, 1);

      // Emit tracking location updates to Socket room
      socket.emit('location-update', {
        bookingId: activeRouteTask.booking_id,
        lat: currentLat,
        lng: currentLng,
        eta: `${etaMinutes} mins`
      });

      // Log coordinates history
      try {
        await api.post('/api/phlebo/location', {
          lat: currentLat,
          lng: currentLng
        });
      } catch (err) {
        console.error('Error logging coordinate history:', err);
      }
    }, 5000);

    return () => {
      clearInterval(intervalId);
      socket.disconnect();
      console.log('🔌 Disconnected tracking socket');
    };
  }, [tasks, isOffline]);

  // Update Status Flow
  const handleUpdateStatus = async (assignmentId, currentStatus) => {
    if (isOffline) {
      toast.error('Connection required to update task status.');
      return;
    }

    let nextStatus = '';
    if (currentStatus === 'assigned') nextStatus = 'accepted';
    else if (currentStatus === 'accepted') nextStatus = 'en_route';
    else if (currentStatus === 'en_route') nextStatus = 'arrived';

    if (!nextStatus) return;

    setUpdatingId(assignmentId);
    try {
      const res = await api.put(`/api/phlebo/tasks/${assignmentId}/status`, { status: nextStatus });
      toast.success(`Task status updated to ${nextStatus.replace(/_/g, ' ')}`);
      
      // If checked in, trigger simulated SMS Toast with OTP code
      if (nextStatus === 'arrived' && res.data.otp_code) {
        toast(`Simulated SMS Sent to Patient:\n"Your LabEase collection OTP code is ${res.data.otp_code}"`, {
          icon: '💬',
          duration: 9000,
          style: {
            border: '2px solid var(--primary)',
            padding: '16px',
            color: 'var(--primary)',
            backgroundColor: 'var(--primary-container)',
            fontWeight: 'bold'
          }
        });
      }
      
      loadTasks();
    } catch (err) {
      toast.error(err.message || 'Failed to update task status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeclineStatus = async (assignmentId) => {
    if (isOffline) {
      toast.error('Connection required to decline task.');
      return;
    }
    if (!window.confirm('Are you sure you want to decline this task assignment?')) return;
    
    setUpdatingId(assignmentId);
    try {
      await api.put(`/api/phlebo/tasks/${assignmentId}/status`, { status: 'failed', reason: 'Declined by phlebotomist' });
      toast.success('Task declined successfully');
      loadTasks();
    } catch (err) {
      toast.error(err.message || 'Failed to decline task');
    } finally {
      setUpdatingId(null);
    }
  };

  // Open checklist modal on collection click
  const handleOpenChecklist = (task) => {
    setSelectedTask(task);
    setIdentityVerified(false);
    setFastingConfirmed(false);
    setVialsLabeled(false);
    setCollectionPhoto('');
    setOtpCode('');
    setIsChecklistOpen(true);
  };

  // Handle photo upload (mock file selection)
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

  // Submit Checklist completion (Arrived -> Collected)
  const handleSubmitChecklist = async (e) => {
    e.preventDefault();
    if (!identityVerified || !fastingConfirmed || !vialsLabeled) {
      toast.error('Please complete all checklist items');
      return;
    }
    if (!otpCode || otpCode.length !== 4) {
      toast.error('Please enter a valid 4-digit patient OTP');
      return;
    }

    setSubmittingChecklist(true);
    try {
      await api.put(`/api/phlebo/tasks/${selectedTask.id}/status`, {
        status: 'collected',
        otp: otpCode,
        collection_photo_url: collectionPhoto || 'https://via.placeholder.com/150/sample_vials.png'
      });
      toast.success('Sample collection checklist verified successfully!');
      setIsChecklistOpen(false);
      loadTasks();
    } catch (err) {
      toast.error(err.response?.data?.error || err.message || 'Failed to verify OTP');
    } finally {
      setSubmittingChecklist(false);
    }
  };

  const getStatusButtonText = (status) => {
    switch (status) {
      case 'assigned':
        return 'Accept Task';
      case 'accepted':
        return 'Start Task (En Route)';
      case 'en_route':
        return 'Mark: Arrived at Location';
      case 'arrived':
        return 'Open Collection Checklist';
      default:
        return 'Done';
    }
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'collected':
        return 'success';
      case 'assigned':
        return 'warning';
      case 'declined':
      case 'failed':
        return 'neutral';
      default:
        return 'info';
    }
  };

  // Filter tasks
  const activeTasks = tasks.filter(t => t.status !== 'collected' && t.status !== 'failed');
  const completedTasks = tasks.filter(t => t.status === 'collected');

  return (
    <div className="phlebo-dashboard" style={{ padding: '24px 16px 80px', maxWidth: '600px', margin: '0 auto', minHeight: '100vh', backgroundColor: 'var(--surface-container-lowest)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 className="headline-sm" style={{ margin: 0, fontWeight: 700, fontSize: '22px' }}>Task Assignments</h1>
          <p className="body-sm text-secondary" style={{ fontSize: '13px' }}>Phlebotomist Fleet Dashboard</p>
        </div>
        <Button variant="secondary" size="sm" icon={<RefreshCw size={16} />} onClick={loadTasks}>
          Refresh
        </Button>
      </div>

      {isOffline && (
        <Badge variant="warning" style={{ display: 'block', textAlign: 'center', padding: '10px', marginBottom: '16px', fontSize: '13px', borderRadius: 'var(--radius-lg)' }}>
          ⚠️ OFFLINE MODE: Showing cached task list. Updates will sync when online.
        </Badge>
      )}

      {/* Online Toggle */}
      <Card style={{ padding: '16px', marginBottom: '20px', backgroundColor: 'var(--surface-container-lowest)', border: '1px solid var(--outline-variant)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600 }}>
              {isOnline ? '🟢 Duty Status: Active (Online)' : '🔴 Duty Status: Offline'}
            </h3>
            <p className="body-sm text-secondary" style={{ margin: '4px 0 0', fontSize: '12px' }}>
              {isOnline ? 'Available to receive local collection assignments' : 'Go online to receive bookings'}
            </p>
          </div>
          <input
            type="checkbox"
            checked={isOnline}
            onChange={(e) => handleToggleOnline(e.target.checked)}
            style={{ width: '22px', height: '22px', cursor: 'pointer' }}
          />
        </div>
      </Card>

      {/* Quick stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
        <Card style={{ padding: '14px', textAlign: 'center', backgroundColor: 'var(--surface-container-lowest)', border: '1px solid var(--outline-variant)' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.5px' }}>ACTIVE TASKS</span>
          <div style={{ fontSize: '26px', fontWeight: 'bold', marginTop: '4px', color: 'var(--primary)' }}>
            {activeTasks.length}
          </div>
        </Card>
        <Card style={{ padding: '14px', textAlign: 'center', backgroundColor: 'var(--surface-container-lowest)', border: '1px solid var(--outline-variant)' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.5px' }}>COMPLETED TODAY</span>
          <div style={{ fontSize: '26px', fontWeight: 'bold', marginTop: '4px', color: 'var(--success)' }}>
            {completedTasks.length}
          </div>
        </Card>
      </div>

      {/* Active Tasks Queue */}
      <h2 className="title-md" style={{ marginBottom: '12px', fontWeight: 600, fontSize: '16px' }}>Current Assignments</h2>
      {loading ? (
        <LoadingSpinner text="Syncing fleet scheduler..." />
      ) : activeTasks.length === 0 ? (
        <Card style={{ padding: '32px', textAlign: 'center', backgroundColor: 'var(--surface-container-lowest)', border: '1px solid var(--outline-variant)' }}>
          <CheckCircle2 size={40} className="text-success" style={{ margin: '0 auto 12px', display: 'block' }} />
          <p className="body-lg text-secondary">All caught up!</p>
          <p className="body-sm text-muted" style={{ fontSize: '13px' }}>No pending collection tasks assigned to you right now.</p>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {activeTasks.map(task => (
            <Card key={task.id} style={{ padding: '16px', borderLeft: '4px solid var(--primary)', backgroundColor: 'var(--surface-container-lowest)', border: '1px solid var(--outline-variant)', borderLeftWidth: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <span style={{ fontSize: '11px', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                    ORDER REF: {task.bookings?.booking_number}
                  </span>
                  <h3 className="title-sm" style={{ margin: '4px 0 0', fontWeight: 600, fontSize: '15px' }}>
                    {task.bookings?.family_members?.name || 'Patient (Self)'}
                  </h3>
                </div>
                <Badge variant={getStatusBadgeVariant(task.status)}>
                  {task.status.toUpperCase()}
                </Badge>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={14} className="text-muted" />
                  <span>Scheduled: {task.bookings?.slot_datetime ? `${new Date(task.bookings.slot_datetime).toLocaleDateString()} at ${new Date(task.bookings.slot_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Flexible / Any time'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                  <MapPin size={14} className="text-muted" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <span>Address: {task.bookings?.addresses?.full_address || 'Walk-In at Diagnostic Center'}</span>
                </div>
                {task.bookings?.notes && (
                  <div style={{ display: 'flex', gap: '6px', padding: '8px 12px', backgroundColor: 'var(--surface-container-highest)', borderRadius: 'var(--radius-sm)', fontSize: '12px' }}>
                    <strong>Notes:</strong> {task.bookings.notes}
                  </div>
                )}
              </div>

              {/* Action triggers */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', paddingTop: '12px', borderTop: '1px solid var(--outline-variant)' }}>
                {task.status === 'assigned' && (
                  <Button
                    size="sm"
                    variant="tertiary"
                    style={{ color: 'var(--error)', backgroundColor: 'var(--error-container)', border: 'none' }}
                    onClick={() => handleDeclineStatus(task.id)}
                    loading={updatingId === task.id}
                  >
                    Decline
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="primary"
                  loading={updatingId === task.id}
                  onClick={() => task.status === 'arrived' ? handleOpenChecklist(task) : handleUpdateStatus(task.id, task.status)}
                >
                  {getStatusButtonText(task.status)}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Earnings Dashboard Section */}
      <h2 className="title-md" style={{ marginTop: '32px', marginBottom: '12px', fontWeight: 600, fontSize: '16px' }}>Daily Earnings Summary</h2>
      <Card style={{ padding: '16px', marginBottom: '24px', backgroundColor: 'var(--surface-container-lowest)', border: '1px solid var(--outline-variant)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL EARNED TODAY</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--primary)', marginTop: '4px' }}>₹{completedTasks.length * 150}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)' }}>Tasks Completed: {completedTasks.length}</div>
            <div style={{ fontSize: '11px', color: 'var(--success)', fontWeight: 700, marginTop: '2px', letterSpacing: '0.2px' }}>RATE: ₹150 / COLLECTED</div>
          </div>
        </div>
      </Card>

      {/* History Feed */}
      <h2 className="title-md" style={{ marginBottom: '12px', fontWeight: 600, fontSize: '16px' }}>Completed History</h2>
      {completedTasks.length === 0 ? (
        <Card style={{ padding: '16px', textAlign: 'center', backgroundColor: 'var(--surface-container-lowest)', border: '1px solid var(--outline-variant)' }}>
          <p className="body-sm text-secondary" style={{ margin: 0, fontSize: '13px' }}>No completed collections today.</p>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {completedTasks.map(task => (
            <Card key={task.id} style={{ padding: '14px', backgroundColor: 'var(--surface-container-lowest)', border: '1px solid var(--outline-variant)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>{task.bookings?.family_members?.name || 'Patient (Self)'}</h4>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>REF: {task.bookings?.booking_number}</span>
                </div>
                <Badge variant="success">Collected</Badge>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Sample Collection Checklist Modal */}
      <Modal
        open={isChecklistOpen}
        onClose={() => setIsChecklistOpen(false)}
        title="Sample Collection Checklist"
        size="md"
      >
        <form onSubmit={handleSubmitChecklist} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ backgroundColor: 'var(--surface-container-low)', padding: '12px', borderRadius: 'var(--radius-lg)' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Patient Details</span>
            <div style={{ fontWeight: 600, fontSize: '15px', marginTop: '4px' }}>{selectedTask?.bookings?.family_members?.name || 'Patient (Self)'}</div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Address: {selectedTask?.bookings?.addresses?.full_address || 'Walk-In'}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 600, borderBottom: '1px solid var(--outline-variant)', paddingBottom: '6px' }}>Digital Checklist</h4>
            
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
              <input
                type="checkbox"
                checked={identityVerified}
                onChange={(e) => setIdentityVerified(e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                required
              />
              Verify patient identity using Government ID/Profile
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
              <input
                type="checkbox"
                checked={fastingConfirmed}
                onChange={(e) => setFastingConfirmed(e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                required
              />
              Confirm patient met fasting requirements (e.g. 10-12 hrs)
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
              <input
                type="checkbox"
                checked={vialsLabeled}
                onChange={(e) => setVialsLabeled(e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                required
              />
              Affix barcode labels on all collection vials / tubes
            </label>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>Labeled Vials Proof Photo</h4>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <label className="btn btn--secondary" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                <Upload size={16} /> Choose Photo
                <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
              </label>
              {collectionPhoto ? (
                <img src={collectionPhoto} alt="Preview" style={{ width: '60px', height: '60px', borderRadius: 'var(--radius)', objectFit: 'cover', border: '1px solid var(--outline-variant)' }} />
              ) : (
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No photo uploaded yet</span>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>Confirm with Patient OTP</h4>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Ask the patient for the 4-digit code shown on their order status page.</span>
            <input
              type="text"
              maxLength={4}
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
              placeholder="e.g. 1234"
              style={{ padding: '10px', border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius)', width: '100px', fontSize: '16px', textAlign: 'center', fontWeight: 'bold', letterSpacing: '2px' }}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid var(--outline-variant)', paddingTop: '16px', marginTop: '8px' }}>
            <Button type="button" variant="secondary" onClick={() => setIsChecklistOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submittingChecklist}>
              Complete Collection
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
