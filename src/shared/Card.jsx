import './Card.css';

/**
 * Card — Surface container with elevation levels.
 *
 * @param {'1' | '2'} elevation - Shadow level
 * @param {boolean} hoverable - Elevates on hover
 * @param {boolean} clickable - Shows pointer cursor
 * @param {string} padding - 'sm' | 'md' | 'lg'
 */
export default function Card({
  children,
  elevation = '1',
  hoverable = false,
  clickable = false,
  padding = 'lg',
  className = '',
  onClick,
  ...props
}) {
  return (
    <div
      className={`card card--elevation-${elevation} card--pad-${padding} ${hoverable ? 'card--hoverable' : ''} ${clickable ? 'card--clickable' : ''} ${className}`}
      onClick={onClick}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      {...props}
    >
      {children}
    </div>
  );
}
