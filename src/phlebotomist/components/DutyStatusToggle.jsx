import { RefreshCw, WifiOff, Power } from 'lucide-react';
import Badge from '../../shared/Badge';
import Button from '../../shared/Button';

export function DutyStatusToggle({ isOnline, isOffline, taskCount, onToggle, onRefresh }) {
  return (
    <div className="phlebo-duty-header">
      <div className="phlebo-duty-header__top">
        <div>
          <p className="label-md text-on-surface-variant uppercase tracking-wider">Today's Schedule</p>
          <h2 className="title-md text-on-surface mt-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={isOnline ? 'success' : 'neutral'}>
            {isOnline ? 'ONLINE (ACTIVE)' : 'OFFLINE'}
          </Badge>
          <Button variant="ghost" size="sm" icon={<RefreshCw size={16} />} onClick={onRefresh} />
        </div>
      </div>

      {isOffline && (
        <div className="phlebo-offline-banner">
          <WifiOff size={16} />
          <span>Offline Mode Active • Local cache active</span>
        </div>
      )}

      <div className="phlebo-duty-header__controls">
        <label className="phlebo-toggle-label">
          <input
            type="checkbox"
            checked={isOnline}
            disabled={isOffline}
            onChange={(e) => onToggle(e.target.checked)}
          />
          <span className="toggle-slider" />
          <span className="toggle-text flex items-center gap-1">
            <Power size={14} />
            {isOnline ? 'Active Duty' : 'Go Online'}
          </span>
        </label>

        <div className="phlebo-task-count-pill">
          <span>{taskCount} TASKS</span>
        </div>
      </div>
    </div>
  );
}

export default DutyStatusToggle;
