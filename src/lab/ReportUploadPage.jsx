import { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { supabase } from '../config/supabase';
import api from '../utils/api';
import Card from '../shared/Card';
import Button from '../shared/Button';
import Badge from '../shared/Badge';
import LoadingSpinner from '../shared/LoadingSpinner';
import { FileText, Upload, CheckCircle2, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ReportUploadPage() {
  const { user } = useAuth();
  const [labId, setLabId] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadingId, setUploadingId] = useState(null);

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

  // Load orders that need report upload (ready or processing states)
  const loadPendingReports = async () => {
    if (!labId) return;
    setLoading(true);
    try {
      // Retrieve orders in processing or sample received states
      const res = await api.get(`/api/labs/${labId}/orders`);
      const pending = res.data.filter(ord =>
        ['sample_collected', 'sample_received_at_lab', 'processing', 'report_ready'].includes(ord.status)
      );
      setOrders(pending);
    } catch (err) {
      console.error('Error loading pending orders:', err);
      toast.error('Failed to load pending report list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (labId) loadPendingReports();
  }, [labId]);

  const handleFileUpload = async (e, bookingId) => {
    const file = e.target.files[0];
    if (!file) return;

    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      toast.error('Only PDF report files are supported.');
      return;
    }

    setUploadingId(bookingId);
    const formData = new FormData();
    formData.append('report', file);

    try {
      await api.post(`/api/labs/${labId}/orders/${bookingId}/report`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success('Diagnostic report uploaded successfully!');
      loadPendingReports(); // Refresh order queue
    } catch (err) {
      toast.error(err.message || 'Report upload failed');
    } finally {
      setUploadingId(null);
    }
  };

  if (!labId) return <LoadingSpinner text="Locating lab credentials..." />;

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 className="headline-lg">Diagnostic Reports</h1>
          <p className="body-md text-secondary">Upload finalized PDF medical reports against patient bookings</p>
        </div>
        <Button variant="secondary" icon={<RefreshCw size={16} />} onClick={loadPendingReports}>
          Refresh
        </Button>
      </div>

      {loading ? (
        <LoadingSpinner text="Retrieving orders..." />
      ) : orders.length === 0 ? (
        <Card style={{ padding: '32px', textAlign: 'center', marginTop: '40px' }}>
          <FileText size={40} className="text-muted" style={{ margin: '0 auto 12px', display: 'block' }} />
          <p className="body-lg text-secondary">No orders ready for reports</p>
          <p className="body-sm text-muted">
            Reports can be uploaded once samples are collected and marked as "Received at Lab".
          </p>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {orders.map(order => (
            <Card key={order.id} style={{ padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <span style={{ fontSize: '11px', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                    REF: {order.booking_number}
                  </span>
                  <h3 className="title-sm" style={{ margin: '4px 0 0', fontWeight: 600 }}>
                    {order.family_members?.name || 'Patient (Self)'}
                  </h3>
                </div>
                <Badge variant={order.status === 'report_ready' ? 'success' : 'info'}>
                  {order.status === 'report_ready' ? 'REPORT DELIVERED' : 'AWAITING UPLOAD'}
                </Badge>
              </div>

              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                <strong>Tests:</strong> {order.booking_items?.map(i => i.tests?.name || i.packages?.name).join(', ')}
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: '12px',
                  borderTop: '1px solid var(--border-color)',
                }}
              >
                <span className="body-sm text-muted">
                  Slot: {new Date(order.slot_datetime).toLocaleDateString()}
                </span>

                <div style={{ position: 'relative' }}>
                  <input
                    type="file"
                    id={`file-upload-${order.id}`}
                    accept=".pdf"
                    style={{ display: 'none' }}
                    onChange={(e) => handleFileUpload(e, order.id)}
                    disabled={uploadingId === order.id}
                  />
                  <label htmlFor={`file-upload-${order.id}`} style={{ cursor: 'pointer' }}>
                    <span
                      className={`btn btn--${order.status === 'report_ready' ? 'secondary' : 'primary'} btn--sm`}
                      style={{ pointerEvents: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                      {uploadingId === order.id ? (
                        <span className="btn__spinner" style={{ animation: 'spin 1s linear infinite' }}>⏳</span>
                      ) : (
                        <span className="btn__icon">
                          {order.status === 'report_ready' ? <RefreshCw size={14} /> : <Upload size={14} />}
                        </span>
                      )}
                      <span className="btn__label">
                        {order.status === 'report_ready' ? 'Re-upload Report' : 'Upload PDF'}
                      </span>
                    </span>
                  </label>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
