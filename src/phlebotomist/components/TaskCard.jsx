import { Clock, MapPin, Phone, Navigation, CheckCircle2, XCircle } from 'lucide-react';
import Badge from '../../shared/Badge';
import Button from '../../shared/Button';

export function TaskCard({ task, isUpdating, onUpdateStatus, onDeclineStatus, onOpenChecklist }) {
  const booking = task.bookings || {};
  const address = booking.addresses || {};
  const items = booking.booking_items || [];

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'collected': return 'success';
      case 'assigned': return 'warning';
      case 'en_route': return 'info';
      case 'arrived': return 'primary';
      case 'failed':
      case 'declined': return 'error';
      default: return 'neutral';
    }
  };

  const getStatusButtonLabel = (status) => {
    switch (status) {
      case 'assigned': return 'Accept Task';
      case 'accepted': return 'Start Route (En Route)';
      case 'en_route': return 'Mark: Arrived at Location';
      case 'arrived': return 'Open Collection Checklist (OTP)';
      default: return 'Completed';
    }
  };

  const isCompleted = task.status === 'collected';
  const isFailed = task.status === 'failed' || task.status === 'declined';

  return (
    <article className={`task-card ${isCompleted ? 'task-card--completed' : ''}`}>
      <div className="task-card__header">
        <div className="task-card__time">
          <Clock size={16} className="text-primary" />
          <span>{booking.slot_time || '08:00 AM - 09:00 AM'}</span>
        </div>
        <Badge variant={getStatusBadgeVariant(task.status)}>
          {task.status.replace(/_/g, ' ').toUpperCase()}
        </Badge>
      </div>

      <h3 className="task-card__patient-name">{booking.patient_name || 'Patient'}</h3>

      <div className="task-card__location">
        <MapPin size={16} className="text-secondary" />
        <p>{address.address_line1 || 'Address unavailable'}, {address.city || ''} {address.pincode ? `- ${address.pincode}` : ''}</p>
      </div>

      {booking.patient_phone && (
        <div className="task-card__phone">
          <Phone size={14} className="text-primary" />
          <a href={`tel:${booking.patient_phone}`} className="phone-link">{booking.patient_phone}</a>
        </div>
      )}

      {items.length > 0 && (
        <div className="task-card__tests">
          <p className="tests-label">REQUESTED TESTS</p>
          <div className="tests-chips">
            {items.map((item, idx) => (
              <span key={idx} className="test-chip">
                {item.test_catalog?.test_name || 'Diagnostic Test'}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Navigation link */}
      {address.lat && address.lng && !isCompleted && !isFailed && (
        <div className="task-card__nav-row">
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${address.lat},${address.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="nav-button"
          >
            <Navigation size={16} />
            <span>Navigate on Map</span>
          </a>
        </div>
      )}

      {/* Action Buttons */}
      {!isCompleted && !isFailed && (
        <div className="task-card__actions">
          {task.status === 'arrived' ? (
            <Button
              variant="primary"
              size="md"
              fullWidth
              icon={<CheckCircle2 size={18} />}
              onClick={() => onOpenChecklist(task)}
            >
              Open Collection Checklist (OTP)
            </Button>
          ) : (
            <>
              <Button
                variant="primary"
                size="md"
                className="flex-1"
                loading={isUpdating}
                onClick={() => onUpdateStatus(task.id, task.status)}
              >
                {getStatusButtonLabel(task.status)}
              </Button>
              {task.status === 'assigned' && (
                <Button
                  variant="outline"
                  size="md"
                  icon={<XCircle size={16} />}
                  onClick={() => onDeclineStatus(task.id)}
                >
                  Decline
                </Button>
              )}
            </>
          )}
        </div>
      )}
    </article>
  );
}

export default TaskCard;
