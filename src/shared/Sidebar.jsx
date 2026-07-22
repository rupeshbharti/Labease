import { NavLink } from 'react-router-dom';
import { ChevronLeft, LogOut, X } from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';
import './Sidebar.css';

/**
 * Sidebar — Collapsible navigation sidebar for desktop layouts and mobile drawer.
 *
 * @param {Array} navItems - [{label, path, icon}]
 * @param {string} title - App/section title
 * @param {boolean} collapsed - Collapsed state
 * @param {function} onToggle - Toggle collapsed state
 * @param {boolean} mobileOpen - Mobile drawer open state
 * @param {function} onCloseMobile - Close mobile drawer callback
 */
export default function Sidebar({
  navItems = [],
  title,
  collapsed = false,
  onToggle,
  mobileOpen = false,
  onCloseMobile,
}) {
  const { signOut, profile } = useAuth();

  const handleLinkClick = () => {
    if (onCloseMobile) onCloseMobile();
  };

  const handleLogout = () => {
    if (onCloseMobile) onCloseMobile();
    signOut();
  };

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div className="sidebar-backdrop" onClick={onCloseMobile} />
      )}

      <aside
        className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''} ${
          mobileOpen ? 'sidebar--mobile-open' : ''
        }`}
      >
        <div className="sidebar__header">
          <div className="sidebar__brand">
            <div className="sidebar__logo">L</div>
            {(!collapsed || mobileOpen) && (
              <span className="sidebar__title">{title || 'LabEase'}</span>
            )}
          </div>

          {/* Mobile Close Button */}
          {mobileOpen ? (
            <button
              className="sidebar__mobile-close"
              onClick={onCloseMobile}
              aria-label="Close sidebar"
            >
              <X size={20} />
            </button>
          ) : (
            <button
              className="sidebar__toggle"
              onClick={onToggle}
              aria-label="Toggle sidebar"
            >
              <ChevronLeft size={18} />
            </button>
          )}
        </div>

        <nav className="sidebar__nav">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              onClick={handleLinkClick}
              className={({ isActive }) =>
                `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
              }
            >
              <span className="sidebar__link-icon">{item.icon}</span>
              {(!collapsed || mobileOpen) && (
                <span className="sidebar__link-label">{item.label}</span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar__footer">
          {(!collapsed || mobileOpen) && profile && (
            <div className="sidebar__user">
              <div className="sidebar__avatar">
                {profile.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="sidebar__user-info">
                <span className="sidebar__user-name body-sm">
                  {profile.name || 'User'}
                </span>
                <span className="sidebar__user-role label-md">
                  {profile.role}
                </span>
              </div>
            </div>
          )}
          <button
            className="sidebar__link sidebar__link--logout"
            onClick={handleLogout}
          >
            <span className="sidebar__link-icon">
              <LogOut size={20} />
            </span>
            {(!collapsed || mobileOpen) && (
              <span className="sidebar__link-label">Logout</span>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
