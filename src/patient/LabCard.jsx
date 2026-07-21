import { useNavigate } from 'react-router-dom';
import Card from '../shared/Card';
import Badge from '../shared/Badge';
import { Star, MapPin } from 'lucide-react';

export default function LabCard({ lab }) {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/patient/lab/${lab.id}`);
  };

  return (
    <Card className="lab-card animate-fade-in" onClick={handleCardClick} hoverable style={{ cursor: 'pointer' }}>
      <div className="lab-card__body" style={{ display: 'flex', gap: '16px' }}>
        <div
          className="lab-card__logo-wrapper"
          style={{
            width: '80px',
            height: '80px',
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
            backgroundColor: 'var(--surface-variant)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {lab.logo_url ? (
            <img src={lab.logo_url} alt={lab.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--primary-color)' }}>
              {lab.name.charAt(0)}
            </span>
          )}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
            <h3 className="title-md" style={{ margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {lab.name}
            </h3>
            {lab.rating_avg > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: 'var(--success-container)', padding: '2px 6px', borderRadius: 'var(--radius-sm)' }}>
                <Star size={12} fill="var(--success)" stroke="var(--success)" />
                <span className="label-sm" style={{ color: 'var(--on-success-container)', fontWeight: 'bold' }}>
                  {parseFloat(lab.rating_avg).toFixed(1)}
                </span>
              </div>
            )}
          </div>

          <p className="body-sm text-secondary" style={{ margin: '4px 0 8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {lab.description || 'NABL Accredited Diagnostics'}
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', marginTop: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--text-secondary)' }}>
              <MapPin size={14} className="text-muted" />
              <span>
                {lab.distance !== null && lab.distance !== undefined
                  ? `${lab.distance.toFixed(1)} km`
                  : lab.city || 'Nearby'}
              </span>
            </div>

            <Badge variant="success">Home Collection</Badge>

            {lab.nabl_certificate_url && (
              <Badge variant="primary" style={{ fontSize: '10px' }}>NABL Accredited</Badge>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
