import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Eye } from 'lucide-react';
import { supabase } from '../config/supabase';
import { LAB_STATUS, LAB_STATUS_LABELS, LAB_STATUS_COLORS } from '../config/constants';
import { TopBar } from '../shared/Navbar';
import Card from '../shared/Card';
import Badge from '../shared/Badge';
import Button from '../shared/Button';
import './AdminPages.css';

export default function LabApplicationsPage() {
  const [labs, setLabs] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchLabs();
  }, [filter]);

  const fetchLabs = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('lab_partners')
        .select('*, users!lab_partners_owner_user_id_fkey(name, email)')
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching labs:', error);
      } else {
        setLabs(data || []);
      }
    } catch (err) {
      console.error('Fetch labs error:', err);
    } finally {
      setLoading(false);
    }
  };

  const statusFilters = [
    { value: 'all', label: 'All' },
    { value: LAB_STATUS.PENDING_REVIEW, label: 'Pending' },
    { value: LAB_STATUS.VERIFIED, label: 'Verified' },
    { value: LAB_STATUS.LIVE, label: 'Live' },
    { value: LAB_STATUS.SUSPENDED, label: 'Suspended' },
  ];

  return (
    <>
      <TopBar title="Lab Applications" />
      <div className="admin-content animate-fade-in">
        {/* Filter Tabs */}
        <div className="auth-tabs mb-lg" style={{ maxWidth: 500 }}>
          {statusFilters.map((f) => (
            <button
              key={f.value}
              className={`auth-tab ${filter === f.value ? 'auth-tab--active' : ''}`}
              onClick={() => setFilter(f.value)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Lab List */}
        <div className="flex flex-col gap-md">
          {loading ? (
            <Card padding="lg"><p className="text-muted text-center">Loading labs...</p></Card>
          ) : labs.length === 0 ? (
            <Card padding="lg"><p className="text-muted text-center">No lab applications found.</p></Card>
          ) : (
            labs.map((lab) => (
              <Card key={lab.id} padding="lg" hoverable clickable onClick={() => navigate(`/admin/labs/${lab.id}`)}>
                <div className="lab-app-card">
                  <div className="lab-app-card__info">
                    <span className="lab-app-card__name title-md">{lab.name || 'Unnamed Lab'}</span>
                    <div className="lab-app-card__meta">
                      {lab.address && (
                        <span className="body-sm text-muted flex items-center gap-xs">
                          <MapPin size={14} /> {lab.address}
                        </span>
                      )}
                      <span className="body-sm text-muted flex items-center gap-xs">
                        <Calendar size={14} /> {new Date(lab.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="lab-app-card__actions">
                    <Badge variant={LAB_STATUS_COLORS[lab.status] || 'default'}>
                      {LAB_STATUS_LABELS[lab.status] || lab.status}
                    </Badge>
                    <Button variant="tertiary" size="sm" icon={<Eye size={16} />}>
                      View
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </>
  );
}
