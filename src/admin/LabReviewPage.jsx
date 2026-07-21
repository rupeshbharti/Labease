import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, X, ExternalLink } from 'lucide-react';
import { supabase } from '../config/supabase';
import { LAB_STATUS_LABELS, LAB_STATUS_COLORS } from '../config/constants';
import { TopBar } from '../shared/Navbar';
import Card from '../shared/Card';
import Badge from '../shared/Badge';
import Button from '../shared/Button';
import { TextArea } from '../shared/Input';
import Modal from '../shared/Modal';
import toast from 'react-hot-toast';
import './AdminPages.css';

export default function LabReviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lab, setLab] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    fetchLab();
  }, [id]);

  const fetchLab = async () => {
    try {
      const { data, error } = await supabase
        .from('lab_partners')
        .select('*, users!lab_partners_owner_user_id_fkey(name, email, phone)')
        .eq('id', id)
        .single();

      if (error) throw error;
      setLab(data);
    } catch (err) {
      console.error('Error fetching lab:', err);
      toast.error('Lab not found');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('lab_partners')
        .update({ status: 'live', reviewed_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      toast.success('Lab approved and set to Live!');
      fetchLab();
    } catch (err) {
      toast.error('Failed to approve lab');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('lab_partners')
        .update({
          status: 'suspended',
          review_notes: rejectReason,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
      toast.success('Lab application rejected');
      setShowRejectModal(false);
      fetchLab();
    } catch (err) {
      toast.error('Failed to reject lab');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <TopBar title="Lab Review" />
        <div className="admin-content"><p className="text-muted">Loading...</p></div>
      </>
    );
  }

  if (!lab) {
    return (
      <>
        <TopBar title="Lab Review" />
        <div className="admin-content"><p className="text-muted">Lab not found</p></div>
      </>
    );
  }

  return (
    <>
      <TopBar title="Lab Review">
        <Button variant="tertiary" onClick={() => navigate('/admin/labs')} icon={<ArrowLeft size={18} />}>
          Back
        </Button>
      </TopBar>

      <div className="admin-content animate-fade-in">
        <div className="lab-review">
          {/* Status */}
          <div className="flex items-center gap-md mb-lg">
            <h2 className="headline-lg">{lab.name || 'Unnamed Lab'}</h2>
            <Badge variant={LAB_STATUS_COLORS[lab.status] || 'default'} size="md">
              {LAB_STATUS_LABELS[lab.status]}
            </Badge>
          </div>

          {/* Business Details */}
          <Card padding="lg" className="lab-review__section">
            <h3 className="title-md mb-md">Business Details</h3>
            <div className="lab-review__detail-grid">
              <div className="lab-review__detail">
                <span className="lab-review__detail-label">Lab Name</span>
                <span className="body-lg">{lab.name || '—'}</span>
              </div>
              <div className="lab-review__detail">
                <span className="lab-review__detail-label">Owner</span>
                <span className="body-lg">{lab.users?.name || '—'}</span>
              </div>
              <div className="lab-review__detail">
                <span className="lab-review__detail-label">Email</span>
                <span className="body-lg">{lab.users?.email || '—'}</span>
              </div>
              <div className="lab-review__detail">
                <span className="lab-review__detail-label">Phone</span>
                <span className="body-lg">{lab.users?.phone || '—'}</span>
              </div>
              <div className="lab-review__detail">
                <span className="lab-review__detail-label">Address</span>
                <span className="body-lg">{lab.address || '—'}</span>
              </div>
              <div className="lab-review__detail">
                <span className="lab-review__detail-label">Service Radius</span>
                <span className="body-lg">{lab.service_radius_km ? `${lab.service_radius_km} km` : '—'}</span>
              </div>
              <div className="lab-review__detail">
                <span className="lab-review__detail-label">Commission Rate</span>
                <span className="body-lg">{lab.commission_rate ? `${lab.commission_rate}%` : 'Default'}</span>
              </div>
              <div className="lab-review__detail">
                <span className="lab-review__detail-label">Submitted</span>
                <span className="body-lg">{new Date(lab.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </Card>

          {/* NABL Certificate */}
          {lab.nabl_certificate_url && (
            <Card padding="lg" className="lab-review__section">
              <h3 className="title-md mb-md">NABL Certificate</h3>
              <a
                href={lab.nabl_certificate_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-xs text-primary"
              >
                <ExternalLink size={16} /> View Certificate
              </a>
            </Card>
          )}

          {/* Actions */}
          {lab.status === 'pending_review' && (
            <div className="lab-review__actions">
              <Button
                variant="primary"
                size="lg"
                icon={<Check size={18} />}
                onClick={handleApprove}
                loading={actionLoading}
              >
                Approve & Set Live
              </Button>
              <Button
                variant="danger"
                size="lg"
                icon={<X size={18} />}
                onClick={() => setShowRejectModal(true)}
              >
                Reject
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Reject Modal */}
      <Modal
        open={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        title="Reject Lab Application"
        footer={
          <>
            <Button variant="tertiary" onClick={() => setShowRejectModal(false)}>Cancel</Button>
            <Button variant="danger" onClick={handleReject} loading={actionLoading}>
              Confirm Rejection
            </Button>
          </>
        }
      >
        <TextArea
          label="Reason for rejection"
          placeholder="Explain why this application is being rejected..."
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          rows={4}
        />
      </Modal>
    </>
  );
}
