import { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { supabase } from '../config/supabase';
import api from '../utils/api';
import Card from '../shared/Card';
import Badge from '../shared/Badge';
import Button from '../shared/Button';
import LoadingSpinner from '../shared/LoadingSpinner';
import AssignPhlebotomistModal from './AssignPhlebotomistModal';
import { Calendar, MapPin, ClipboardList, Check, X, UserCheck, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import './OrdersPage.css';

export default function OrdersPage() {
  const { user } = useAuth();
  const [labId, setLabId] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('new'); // 'new' | 'active' | 'completed' | 'cancelled'
  const [assigningId, setAssigningId] = useState(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  // Fetch Lab ID
  useEffect(() => {
    async function fetchLabId() {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from('lab_partners')
          .select('id')
          .eq('owner_user_id', user.id)
          .single();

        if (error) throw error;
        setLabId(data.id);
      } catch (err) {
        console.error('Error fetching lab id:', err);
      }
    }
    fetchLabId();
  }, [user]);

  // Load orders queue
  const loadOrders = async () => {
    if (!labId) return;
    setLoading(true);
    try {
      const res = await api.get(`/api/labs/${labId}/orders`);
      setOrders(res.data);
    } catch (err) {
      console.error('Error loading lab orders:', err);
      toast.error('Failed to load orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (labId) loadOrders();
  }, [labId]);

  // Accept Booking
  const handleAcceptOrder = async (orderId) => {
    try {
      await api.put(`/api/labs/${labId}/orders/${orderId}/accept`);
      toast.success('Order accepted successfully!');
      loadOrders();
    } catch (err) {
      toast.error(err.message || 'Failed to accept order');
    }
  };

  // Reject Booking
  const handleRejectOrder = async (orderId) => {
    const reason = window.prompt('Please enter the reason for rejection (optional):');
    if (reason === null) return; // user cancelled prompt

    try {
      await api.put(`/api/labs/${labId}/orders/${orderId}/reject`, { reason });
      toast.success('Order rejected.');
      loadOrders();
    } catch (err) {
      toast.error(err.message || 'Failed to reject order');
    }
  };

  // Assign Phlebotomist
  const handleAssignPhlebotomist = async (phleboUserId) => {
    try {
      await api.put(`/api/labs/${labId}/orders/${assigningId}/assign`, {
        phlebotomist_user_id: phleboUserId,
      });
      toast.success('Phlebotomist assigned successfully!');
      setIsAssignModalOpen(false);
      loadOrders();
    } catch (err) {
      toast.error(err.message || 'Assignment failed');
      throw err;
    }
  };

  // Update Status manually
  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/api/labs/${labId}/orders/${orderId}/status`, { status: newStatus });
      toast.success('Order status updated!');
      loadOrders();
    } catch (err) {
      toast.error(err.message || 'Failed to update status');
    }
  };

  if (!labId) return <LoadingSpinner text="Retrieving lab configuration..." />;

  // Filter orders by tabs
  const getFilteredOrders = () => {
    switch (activeTab) {
      case 'new':
        return orders.filter(o => o.status === 'pending_lab_acceptance');
      case 'active':
        return orders.filter(o =>
          ['confirmed', 'phlebotomist_assigned', 'sample_collected', 'sample_received_at_lab', 'processing'].includes(o.status)
        );
      case 'completed':
        return orders.filter(o => o.status === 'report_ready');
      case 'cancelled':
        return orders.filter(o => ['cancelled', 'failed'].includes(o.status));
      default:
        return [];
    }
  };

  const currentOrders = getFilteredOrders();

  const getStatusLabel = (status) => {
    return status.replace(/_/g, ' ').toUpperCase();
  };

  return (
    <div className="orders-page">
      <div className="orders-header">
        <div>
          <h1 className="headline-lg">Orders Queue</h1>
          <p className="body-md text-secondary">Manage incoming patient bookings and track collection statuses</p>
        </div>
        <Button variant="secondary" icon={<RefreshCw size={16} />} onClick={loadOrders}>
          Refresh Queue
        </Button>
      </div>

      {/* Tabs */}
      <div className="orders-tabs">
        <button
          className={`orders-tab ${activeTab === 'new' ? 'orders-tab--active' : ''}`}
          onClick={() => setActiveTab('new')}
        >
          New Requests ({orders.filter(o => o.status === 'pending_lab_acceptance').length})
        </button>
        <button
          className={`orders-tab ${activeTab === 'active' ? 'orders-tab--active' : ''}`}
          onClick={() => setActiveTab('active')}
        >
          Active Tasks ({orders.filter(o => ['confirmed', 'phlebotomist_assigned', 'sample_collected', 'sample_received_at_lab', 'processing'].includes(o.status)).length})
        </button>
        <button
          className={`orders-tab ${activeTab === 'completed' ? 'orders-tab--active' : ''}`}
          onClick={() => setActiveTab('completed')}
        >
          Completed ({orders.filter(o => o.status === 'report_ready').length})
        </button>
        <button
          className={`orders-tab ${activeTab === 'cancelled' ? 'orders-tab--active' : ''}`}
          onClick={() => setActiveTab('cancelled')}
        >
          Cancelled ({orders.filter(o => ['cancelled', 'failed'].includes(o.status)).length})
        </button>
      </div>

      {loading ? (
        <LoadingSpinner text="Synchronizing orders queue..." />
      ) : currentOrders.length === 0 ? (
        <Card style={{ padding: '48px 16px', textAlign: 'center' }}>
          <ClipboardList size={40} className="text-muted" style={{ margin: '0 auto 12px', display: 'block' }} />
          <p className="body-lg text-secondary">No orders in this section</p>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {currentOrders.map(order => (
            <Card key={order.id} className={`order-card order-card--${order.status} animate-fade-in`}>
              <div className="order-card__header">
                <div className="order-card__meta">
                  <span className="order-card__ref">REF: {order.booking_number}</span>
                  <h3 className="order-card__title">{order.family_members?.name || 'Patient (Self)'}</h3>
                </div>
                <Badge variant={order.status === 'pending_lab_acceptance' ? 'warning' : 'info'}>
                  {getStatusLabel(order.status)}
                </Badge>
              </div>

              <div className="order-card__details">
                <div>
                  <strong>Tests Booked:</strong> {order.booking_items?.map(i => i.tests?.name || i.packages?.name).join(', ')}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                  <Calendar size={14} className="text-muted" />
                  <span>Scheduled: {new Date(order.slot_datetime).toLocaleDateString()} at {new Date(order.slot_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                  <MapPin size={14} className="text-muted" />
                  <span style={{ textTransform: 'capitalize' }}>
                    {order.collection_mode.replace(/_/g, ' ')}
                    {order.collection_mode === 'home_collection' && ` (${order.addresses?.full_address})`}
                  </span>
                </div>
                {order.notes && (
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', padding: '6px', backgroundColor: 'var(--surface-variant)', borderRadius: 'var(--radius-sm)' }}>
                    <strong>Note:</strong> {order.notes}
                  </div>
                )}
              </div>

              {/* Action buttons panel */}
              <div className="order-card__actions">
                {activeTab === 'new' && (
                  <>
                    <Button variant="secondary" size="sm" icon={<X size={14} />} onClick={() => handleRejectOrder(order.id)}>
                      Reject
                    </Button>
                    <Button variant="primary" size="sm" icon={<Check size={14} />} onClick={() => handleAcceptOrder(order.id)}>
                      Accept Booking
                    </Button>
                  </>
                )}

                {activeTab === 'active' && (
                  <>
                    {order.collection_mode === 'home_collection' && order.status === 'confirmed' && (
                      <Button
                        variant="primary"
                        size="sm"
                        icon={<UserCheck size={14} />}
                        onClick={() => {
                          setAssigningId(order.id);
                          setIsAssignModalOpen(true);
                        }}
                      >
                        Assign Phlebotomist
                      </Button>
                    )}

                    {/* Status updates dropdown */}
                    <select
                      className="input-group__input"
                      value={order.status}
                      onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                      style={{ maxHeight: '36px', padding: '6px 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius)', fontSize: '13px', width: 'auto' }}
                    >
                      <option value="confirmed">Confirmed</option>
                      <option value="sample_received_at_lab">Sample Received at Lab</option>
                      <option value="processing">Processing Sample</option>
                      <option value="failed">Failed/Cancelled</option>
                    </select>
                  </>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <AssignPhlebotomistModal
        isOpen={isAssignModalOpen}
        onClose={() => { setIsAssignModalOpen(false); setAssigningId(null); }}
        onAssign={handleAssignPhlebotomist}
        bookingId={assigningId}
        labId={labId}
      />
    </div>
  );
}
