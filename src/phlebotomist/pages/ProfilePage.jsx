import { User, Phone, ShieldCheck, Star, LogOut, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../auth/AuthProvider';
import { usePhleboTask } from '../context/PhleboTaskContext';
import Card from '../../shared/Card';
import Button from '../../shared/Button';
import Badge from '../../shared/Badge';

export function ProfilePage() {
  const { user, profile, logout } = useAuth();
  const { isOnline, isOffline, handleToggleOnline, tasks } = usePhleboTask();

  const completedCount = tasks.filter(t => t.status === 'collected').length;

  return (
    <div className="phlebo-page-container">
      <div className="phlebo-header-row">
        <div>
          <h1 className="headline-sm" style={{ margin: 0, fontWeight: 700, fontSize: '22px' }}>Phlebotomist Profile</h1>
          <p className="body-sm text-secondary">Duty status, certifications & account settings</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Profile Card */}
        <Card className="phlebo-profile-card">
          <div className="profile-card__avatar">
            {profile?.name ? profile.name.charAt(0).toUpperCase() : 'P'}
          </div>
          <div className="profile-card__info">
            <h2 className="title-md">{profile?.name || 'Certified Phlebotomist'}</h2>
            <p className="body-sm text-secondary flex items-center gap-1">
              <Phone size={14} />
              {profile?.phone || user?.email || 'N/A'}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="primary" icon={<ShieldCheck size={12} />}>NABL CERTIFIED</Badge>
              <Badge variant="success" icon={<Star size={12} style={{ color: '#FFB300', fill: '#FFB300' }} />}>4.9 RATING</Badge>
            </div>
          </div>
        </Card>

        {/* Duty Status Switch */}
        <Card style={{ padding: '20px' }}>
          <h3 className="title-md" style={{ margin: '0 0 12px', fontWeight: 600 }}>Active Duty Status</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong style={{ fontSize: '15px' }}>{isOnline ? 'Online (Receiving Task Assignments)' : 'Offline (Inactive)'}</strong>
              <p className="body-sm text-secondary" style={{ margin: '2px 0 0' }}>
                Toggle your availability for local lab sample collection orders
              </p>
            </div>
            <label className="phlebo-toggle-label">
              <input
                type="checkbox"
                checked={isOnline}
                disabled={isOffline}
                onChange={(e) => handleToggleOnline(e.target.checked)}
              />
              <span className="toggle-slider" />
            </label>
          </div>
        </Card>

        {/* Metrics Card */}
        <Card style={{ padding: '20px' }}>
          <h3 className="title-md" style={{ margin: '0 0 16px', fontWeight: 600 }}>Performance & Metrics</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="metric-box">
              <span className="metric-box__val">{completedCount}</span>
              <span className="metric-box__label">Samples Collected</span>
            </div>
            <div className="metric-box">
              <span className="metric-box__val">99.4%</span>
              <span className="metric-box__label">On-Time Arrival</span>
            </div>
          </div>
        </Card>

        {/* Account Logout */}
        <Button
          variant="secondary"
          size="lg"
          fullWidth
          icon={<LogOut size={18} />}
          onClick={logout}
          style={{ marginTop: '12px', color: 'var(--error)' }}
        >
          Sign Out of Account
        </Button>
      </div>
    </div>
  );
}

export default ProfilePage;
