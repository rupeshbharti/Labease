import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';

const PhleboTaskContext = createContext();

export function PhleboTaskProvider({ children }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [updatingId, setUpdatingId] = useState(null);

  // Collection modal state
  const [isChecklistOpen, setIsChecklistOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  // Load tasks & profile duty status
  const loadTasks = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    const cached = localStorage.getItem('phlebo_tasks_cache');
    if (cached) {
      try {
        setTasks(JSON.parse(cached));
      } catch (e) {
        // ignore JSON parse error
      }
    }
    loadTasks();

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
  }, [loadTasks]);

  // Toggle Online/Offline duty status
  const handleToggleOnline = async (checked) => {
    if (isOffline) {
      toast.error('Cannot change duty status while offline.');
      return;
    }
    try {
      const res = await api.put('/api/phlebo/status', { duty_status: checked });
      setIsOnline(res.data.duty_status);
      toast.success(res.data.duty_status ? 'You are Online (Active for Tasks)' : 'You are Offline');
    } catch (err) {
      toast.error('Failed to update duty status');
    }
  };

  // Socket.io Geolocation Broadcast loop
  useEffect(() => {
    const activeRouteTask = tasks.find(t => t.status === 'en_route');
    if (!activeRouteTask || isOffline) return;

    const socketUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
    const socket = io(socketUrl);

    socket.emit('join-tracking', activeRouteTask.bookings?.id || activeRouteTask.booking_id);

    let step = 0;
    const startLat = 12.9716;
    const startLng = 77.5946;
    const destLat = activeRouteTask.bookings?.addresses?.lat || 12.9750;
    const destLng = activeRouteTask.bookings?.addresses?.lng || 77.6000;

    const intervalId = setInterval(async () => {
      step += 1;
      const progress = Math.min(step / 10, 1);
      const currentLat = startLat + (destLat - startLat) * progress;
      const currentLng = startLng + (destLng - startLng) * progress;
      const etaMinutes = Math.max(15 - step, 1);

      socket.emit('location-update', {
        bookingId: activeRouteTask.booking_id,
        lat: currentLat,
        lng: currentLng,
        eta: `${etaMinutes} mins`
      });

      try {
        await api.post('/api/phlebo/location', {
          lat: currentLat,
          lng: currentLng
        });
      } catch (err) {
        // silent catch
      }
    }, 5000);

    return () => {
      clearInterval(intervalId);
      socket.disconnect();
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

  // Open & submit collection checklist
  const openCollectionModal = (task) => {
    setSelectedTask(task);
    setIsChecklistOpen(true);
  };

  const closeCollectionModal = () => {
    setIsChecklistOpen(false);
    setSelectedTask(null);
  };

  const submitCollectionChecklist = async ({ otp, photoUrl }) => {
    if (!selectedTask) return;
    try {
      await api.put(`/api/phlebo/tasks/${selectedTask.id}/status`, {
        status: 'collected',
        otp,
        collection_photo_url: photoUrl || 'https://via.placeholder.com/150/sample_vials.png'
      });
      toast.success('Sample collection verified successfully!');
      closeCollectionModal();
      loadTasks();
    } catch (err) {
      toast.error(err.response?.data?.error || err.message || 'Failed to verify OTP');
      throw err;
    }
  };

  return (
    <PhleboTaskContext.Provider value={{
      tasks,
      loading,
      isOnline,
      isOffline,
      updatingId,
      loadTasks,
      handleToggleOnline,
      handleUpdateStatus,
      handleDeclineStatus,
      isChecklistOpen,
      selectedTask,
      openCollectionModal,
      closeCollectionModal,
      submitCollectionChecklist,
    }}>
      {children}
    </PhleboTaskContext.Provider>
  );
}

export function usePhleboTask() {
  return useContext(PhleboTaskContext);
}
