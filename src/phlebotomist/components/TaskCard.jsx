import { Clock, MapPin, Phone, Navigation, CheckCircle2, XCircle, Footprints, ShieldCheck } from 'lucide-react';
import Badge from '../../shared/Badge';
import Button from '../../shared/Button';

export function TaskCard({ task, isUpdating, onUpdateStatus, onDeclineStatus, onOpenChecklist }) {
  const booking = task.bookings || {};
  const address = booking.addresses || {};
  const items = booking.booking_items || [];

  const status = task.status || 'assigned';

  const getStatusBadgeVariant = (s) => {
    switch (s) {
      case 'collected': return 'success';
      case 'assigned': return 'warning';
      case 'en_route': return 'info';
      case 'arrived': return 'primary';
      case 'failed':
      case 'declined': return 'error';
      default: return 'neutral';
    }
  };

  const getStatusButtonLabel = (s) => {
    switch (s) {
      case 'assigned': return 'Accept Task';
      case 'accepted': return 'Start Route (En Route)';
      case 'en_route': return 'Mark: Arrived at Location';
      case 'arrived': return 'Open Collection Checklist (OTP)';
      default: return 'Completed';
    }
  };

  const isCompleted = status === 'collected';
  const isFailed = status === 'failed' || status === 'declined';

  // Active Task Workflow Step Calculation
  const getStepIndex = (s) => {
    switch (s) {
      case 'assigned': return 0;
      case 'accepted': return 1;
      case 'en_route': return 2;
      case 'arrived': return 3;
      case 'collected': return 4;
      default: return 0;
    }
  };

  const currentStepIdx = getStepIndex(status);

  return (
    <article className={`task-card ${isCompleted ? 'task-card--completed' : ''}`}>
      {/* Header Row */}
      <div className="task-card__header">
        <div className="task-card__time">
          <Clock size={15} className="text-primary" />
          <span>{booking.slot_time || '08:00 AM - 09:00 AM'}</span>
        </div>
        <Badge variant={getStatusBadgeVariant(status)}>
          {status.replace(/_/g, ' ').toUpperCase()}
        </Badge>
      </div>

      {/* Patient Name & Ref */}
      <div className="task-card__patient-info">
        <h3 className="task-card__patient-name">{booking.patient_name || 'Patient Name'}</h3>
        <span className="task-card__order-ref">REF #{booking.id?.slice(0, 8) || 'PHL-99201'}</span>
      </div>

      {/* Location */}
      <div className="task-card__location">
        <MapPin size={16} className="text-secondary shrink-0" />
        <p>{address.address_line1 || 'Address unavailable'}, {address.city || ''} {address.pincode ? `- ${address.pincode}` : ''}</p>
      </div>

      {booking.patient_phone && (
        <div className="task-card__phone">
          <Phone size={14} className="text-primary" />
          <a href={`tel:${booking.patient_phone}`} className="phone-link">{booking.patient_phone}</a>
        </div>
      )}

      {/* Requested Tests Badges */}
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

      {/* Active Task Flow Stepper Bar (Stitch Active Task Flow Screen) */}
      {!isFailed && (
        <div className="task-stepper">
          <div className={`step-item ${currentStepIdx >= 1 ? 'step-item--done' : currentStepIdx === 0 ? 'step-item--active' : ''}`}>
            <div className="step-circle">
              <CheckCircle2 size={14} />
            </div>
            <span className="step-label">Accepted</span>
          </div>

          <div className={`step-line ${currentStepIdx >= 2 ? 'step-line--done' : ''}`} />

          <div className={`step-item ${currentStepIdx >= 2 ? 'step-item--done' : currentStepIdx === 1 ? 'step-item--active' : ''}`}>
            <div className="step-circle">
              <Footprints size={14} />
            </div>
            <span className="step-label">En Route</span>
          </div>

          <div className={`step-line ${currentStepIdx >= 3 ? 'step-line--done' : ''}`} />

          <div className={`step-item ${currentStepIdx >= 3 ? 'step-item--done' : currentStepIdx === 2 ? 'step-item--active' : ''}`}>
            <div className="step-circle">
              <MapPin size={14} />
            </div>
            <span className="step-label">Arrived</span>
          </div>

          <div className={`step-line ${currentStepIdx >= 4 ? 'step-line--done' : ''}`} />

          <div className={`step-item ${currentStepIdx >= 4 ? 'step-item--done' : ''}`}>
            <div className="step-circle">
              <ShieldCheck size={14} />
            </div>
            <span className="step-label">Collected</span>
          </div>
        </div>
      )}

      {/* Map Navigation Link */}
      {address.lat && address.lng && !isCompleted && !isFailed && (
        <div className="task-card__nav-row">
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${address.lat},${address.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="nav-button"
          >
            <Navigation size={16} />
            <span>GET DIRECTIONS (GOOGLE MAPS)</span>
          </a>
        </div>
      )}

      {/* Primary Action Buttons */}
      {!isCompleted && !isFailed && (
        <div className="task-card__actions">
          {status === 'arrived' ? (
            <Button
              variant="primary"
              size="md"
              fullWidth
              icon={<CheckCircle2 size={18} />}
              onClick={() => onOpenChecklist(task)}
            >
              Open Collection Checklist (OTP Verification)
            </Button>
          ) : (
            <>
              <Button
                variant="primary"
                size="md"
                className="flex-1"
                loading={isUpdating}
                onClick={() => onUpdateStatus(task.id, status)}
              >
                {getStatusButtonLabel(status)}
              </Button>

              {status === 'assigned' && (
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
