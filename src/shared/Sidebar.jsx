import { NavLink } from 'react-router-dom';
import { ChevronLeft, LogOut } from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';
import './Sidebar.css';

/**
 * Sidebar — Collapsible navigation sidebar for desktop layouts.
 *
 * @param {Array} navItems - [{label, path, icon}]
 * @param {string} title - App/section title
 * @param {boolean} collapsed - Collapsed state
 * @param {function} onToggle - Toggle collapsed state
 */
export default function Sidebar({ navItems = [], title, collapsed = false, onToggle }) {
  const { signOut, profile } = useAuth();

  return (
    <aside className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''}`}>
      <div className="sidebar__header">
        {!collapsed && (
          <div className="sidebar__brand">
            <div className="sidebar__logo">L</div>
            <span className="sidebar__title">{title || 'LabEase'}</span>
          </div>
        )}
        <button className="sidebar__toggle" onClick={onToggle} aria-label="Toggle sidebar">
          <ChevronLeft size={18} />
        </button>
      </div>

      <nav className="sidebar__nav">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            className={({ isActive }) =>
              `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
            }
          >
            <span className="sidebar__link-icon">{item.icon}</span>
            {!collapsed && <span className="sidebar__link-label">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar__footer">
        {!collapsed && profile && (
          <div className="sidebar__user">
            <div className="sidebar__avatar">
              {profile.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="sidebar__user-info">
              <span className="sidebar__user-name body-sm">{profile.name || 'User'}</span>
              <span className="sidebar__user-role label-md">{profile.role}</span>
            </div>
          </div>
        )}
        <button className="sidebar__link sidebar__link--logout" onClick={signOut}>
          <span className="sidebar__link-icon"><LogOut size={20} /></span>
          {!collapsed && <span className="sidebar__link-label">Logout</span>}
        </button>
      </div>
    </aside>
  );
}
