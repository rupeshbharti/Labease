import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../config/supabase';
import { useAuth } from '../auth/AuthProvider';
import { LAB_STATUS_LABELS, LAB_STATUS_COLORS } from '../config/constants';
import { TopBar } from '../shared/Navbar';
import Card from '../shared/Card';
import Badge from '../shared/Badge';
import Button from '../shared/Button';
import './LabPages.css';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [lab, setLab] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLab();
  }, [user]);

  const fetchLab = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('lab_partners')
        .select('*')
        .eq('owner_user_id', user.id)
        .single();

      if (!error) setLab(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const statusConfig = {
    pending_review: {
      icon: <Clock size={48} />,
      title: 'Application Under Review',
      desc: 'Your lab application is being reviewed by the LabEase team. You will be notified once it is approved.',
      color: 'warning',
    },
    verified: {
      icon: <CheckCircle size={48} />,
      title: 'Verified! Almost Live',
      desc: 'Your lab has been verified. Complete your profile and test catalog to go live.',
      color: 'info',
    },
    live: {
      icon: <CheckCircle size={48} />,
      title: 'Your Lab is Live!',
      desc: 'Patients can now discover and book tests from your lab.',
      color: 'success',
    },
    suspended: {
      icon: <AlertCircle size={48} />,
      title: 'Account Suspended',
      desc: 'Your lab account has been suspended. Please contact support.',
      color: 'error',
    },
  };

  if (loading) {
    return (
      <>
        <TopBar title="Lab Dashboard" />
        <div className="lab-content"><p className="text-muted">Loading...</p></div>
      </>
    );
  }

  if (!lab) {
    return (
      <>
        <TopBar title="Lab Dashboard" />
        <div className="lab-content animate-fade-in-up">
          <Card padding="lg">
            <div className="text-center p-xl">
              <h2 className="title-md mb-md">Welcome to LabEase!</h2>
              <p className="body-lg text-muted mb-lg">
                You haven't submitted your lab onboarding yet. Let's get started!
              </p>
              <Button variant="primary" size="lg" onClick={() => navigate('/lab/onboard')}>
                Start Onboarding
              </Button>
            </div>
          </Card>
        </div>
      </>
    );
  }

  const status = statusConfig[lab.status] || statusConfig.pending_review;

  return (
    <>
      <TopBar title="Lab Dashboard" />
      <div className="lab-content animate-fade-in-up">
        {/* Status Banner */}
        <Card padding="lg" className="lab-status-banner">
          <div className={`lab-status-banner__icon lab-status-banner__icon--${status.color}`}>
            {status.icon}
          </div>
          <div className="lab-status-banner__content">
            <div className="flex items-center gap-sm">
              <h2 className="title-md">{status.title}</h2>
              <Badge variant={status.color}>{LAB_STATUS_LABELS[lab.status]}</Badge>
            </div>
            <p className="body-lg text-muted mt-xs">{status.desc}</p>
          </div>
        </Card>

        {/* Lab Info */}
        <div className="stats-grid mt-lg">
          <Card padding="lg">
            <span className="label-md text-muted">Lab Name</span>
            <p className="title-md mt-xs">{lab.name || '—'}</p>
          </Card>
          <Card padding="lg">
            <span className="label-md text-muted">Address</span>
            <p className="body-lg mt-xs">{lab.address || '—'}</p>
          </Card>
          <Card padding="lg">
            <span className="label-md text-muted">Service Radius</span>
            <p className="title-md mt-xs">{lab.service_radius_km ? `${lab.service_radius_km} km` : 'Not set'}</p>
          </Card>
          <Card padding="lg">
            <span className="label-md text-muted">Rating</span>
            <p className="title-md mt-xs">{lab.rating_avg ? `⭐ ${lab.rating_avg}` : 'No ratings yet'}</p>
          </Card>
        </div>
      </div>
    </>
  );
}
