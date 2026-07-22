import { Outlet } from 'react-router-dom';
import { ListTodo, DollarSign, User, Activity } from 'lucide-react';
import Navbar from '../shared/Navbar';
import { PhleboTaskProvider } from './context/PhleboTaskContext';

const navItems = [
  { label: 'Tasks', path: '/phlebo', icon: <ListTodo size={22} />, end: true },
  { label: 'Earnings', path: '/phlebo/earnings', icon: <DollarSign size={22} /> },
  { label: 'Profile', path: '/phlebo/profile', icon: <User size={22} /> },
];

export default function PhleboLayout() {
  return (
    <PhleboTaskProvider>
      <div className="phlebo-app-shell">
        {/* Top Header Bar */}
        <header className="phlebo-topbar">
          <div className="phlebo-topbar__brand">
            <div className="phlebo-topbar__logo">
              <Activity size={18} />
            </div>
            <span className="phlebo-topbar__title">Clinical Clarity</span>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="phlebo-main-content">
          <Outlet />
        </main>

        {/* Bottom Navigation Bar — Exactly 3 buttons: Tasks, Earnings, Profile */}
        <Navbar navItems={navItems} />
      </div>
    </PhleboTaskProvider>
  );
}
