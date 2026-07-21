import './Badge.css';

/**
 * Badge — Status badges with semantic colors.
 *
 * @param {'default' | 'success' | 'warning' | 'error' | 'info' | 'primary'} variant
 * @param {'sm' | 'md'} size
 * @param {boolean} dot - Shows a dot indicator
 */
export default function Badge({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  className = '',
}) {
  return (
    <span className={`badge badge--${variant} badge--${size} ${className}`}>
      {dot && <span className="badge__dot" />}
      {children}
    </span>
  );
}
