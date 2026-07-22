import { Outlet, NavLink, Link } from 'react-router-dom';
import { ListTodo, DollarSign, User, Activity } from 'lucide-react';
import Navbar from '../shared/Navbar';
import { PhleboTaskProvider } from './context/PhleboTaskContext';
import './PhleboPages.css';

const navItems = [
  { label: 'Tasks', path: '/phlebo', icon: <ListTodo size={20} />, end: true },
  { label: 'Earnings', path: '/phlebo/earnings', icon: <DollarSign size={20} /> },
  { label: 'Profile', path: '/phlebo/profile', icon: <User size={20} /> },
];

export default function PhleboLayout() {
  return (
    <PhleboTaskProvider>
      <div className="phlebo-app-shell">
        {/* Desktop Header Navigation (Visible on desktop/laptop screens) */}
        <header className="phlebo-desktop-header">
          <div className="phlebo-desktop-header__container">
            <Link to="/phlebo" className="phlebo-brand">
              <div className="phlebo-brand__logo">
                <Activity size={20} />
              </div>
              <span className="phlebo-brand__name">LabEase Phlebotomist</span>
            </Link>

            <nav className="phlebo-desktop-nav">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.end}
                  className={({ isActive }) =>
                    `phlebo-desktop-nav__link ${isActive ? 'phlebo-desktop-nav__link--active' : ''}`
                  }
                >
                  {item.icon}
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </nav>
          </div>
        </header>

        {/* Main Application Area */}
        <main className="phlebo-main-content">
          <Outlet />
        </main>

        {/* Mobile Bottom Navigation Bar (Exactly 3 buttons: Tasks, Earnings, Profile) */}
        <Navbar navItems={navItems} />
      </div>
    </PhleboTaskProvider>
  );
}
