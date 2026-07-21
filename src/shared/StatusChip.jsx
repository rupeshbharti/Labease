import './StatusChip.css';

/**
 * StatusChip — Pill-shaped status indicators (e.g., "Fast Results", "Top Rated").
 *
 * @param {'teal' | 'blue' | 'gray' | 'green' | 'amber' | 'red'} color
 * @param {React.ReactNode} icon - Optional leading icon
 */
export default function StatusChip({ children, color = 'teal', icon, className = '' }) {
  return (
    <span className={`status-chip status-chip--${color} ${className}`}>
      {icon && <span className="status-chip__icon">{icon}</span>}
      {children}
    </span>
  );
}
