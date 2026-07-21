import { NavLink } from 'react-router-dom';
import './Navbar.css';

/**
 * Navbar — Mobile bottom navigation bar.
 *
 * @param {Array} navItems - [{label, path, icon}]
 */
export default function Navbar({ navItems = [] }) {
  return (
    <nav className="bottom-nav safe-area-bottom">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.end}
          className={({ isActive }) =>
            `bottom-nav__item ${isActive ? 'bottom-nav__item--active' : ''}`
          }
        >
          <span className="bottom-nav__icon">{item.icon}</span>
          <span className="bottom-nav__label">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

/**
 * TopBar — Desktop/mobile top header bar.
 */
export function TopBar({ title, children, className = '' }) {
  return (
    <header className={`top-bar ${className}`}>
      <h1 className="top-bar__title headline-lg">{title}</h1>
      {children && <div className="top-bar__actions">{children}</div>}
    </header>
  );
}
