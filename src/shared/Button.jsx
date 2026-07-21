import { Loader2 } from 'lucide-react';
import './Button.css';

/**
 * Button — Primary, Secondary, Tertiary, Danger variants with loading state.
 *
 * @param {'primary' | 'secondary' | 'tertiary' | 'danger'} variant
 * @param {'sm' | 'md' | 'lg'} size
 * @param {boolean} loading
 * @param {boolean} fullWidth
 * @param {React.ReactNode} icon - Leading icon
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  icon,
  type = 'button',
  onClick,
  className = '',
  ...props
}) {
  return (
    <button
      type={type}
      className={`btn btn--${variant} btn--${size} ${fullWidth ? 'btn--full' : ''} ${className}`}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading ? (
        <Loader2 size={18} className="btn__spinner" />
      ) : icon ? (
        <span className="btn__icon">{icon}</span>
      ) : null}
      <span className="btn__label">{children}</span>
    </button>
  );
}
