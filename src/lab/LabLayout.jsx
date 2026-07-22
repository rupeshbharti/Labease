import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Clock,
  MapPin,
  User,
  ClipboardList,
  ShoppingBag,
  FileCheck,
  TrendingUp,
  MessageSquare,
  Menu,
} from 'lucide-react';
import Sidebar from '../shared/Sidebar';
import Navbar from '../shared/Navbar';
import './LabPages.css';

const navItems = [
  { label: 'Dashboard', path: '/lab', icon: <LayoutDashboard size={20} />, end: true },
  { label: 'Onboarding', path: '/lab/onboard', icon: <FileText size={20} /> },
  { label: 'Orders', path: '/lab/orders', icon: <ShoppingBag size={20} /> },
  { label: 'Test Catalog', path: '/lab/catalog', icon: <ClipboardList size={20} /> },
  { label: 'Reports', path: '/lab/reports', icon: <FileCheck size={20} /> },
  { label: 'Revenue & Payouts', path: '/lab/revenue', icon: <TrendingUp size={20} /> },
  { label: 'Customer Reviews', path: '/lab/reviews', icon: <MessageSquare size={20} /> },
  { label: 'Slot Management', path: '/lab/slots', icon: <Clock size={20} /> },
  { label: 'Service Area', path: '/lab/service-area', icon: <MapPin size={20} /> },
  { label: 'Profile', path: '/lab/profile', icon: <User size={20} /> },
];

const bottomNavItems = [
  { label: 'Orders', path: '/lab/orders', icon: <ShoppingBag size={20} /> },
  { label: 'Test Catalog', path: '/lab/catalog', icon: <ClipboardList size={20} /> },
  { label: 'Reports', path: '/lab/reports', icon: <FileCheck size={20} /> },
  { label: 'Revenue', path: '/lab/revenue', icon: <TrendingUp size={20} /> },
  { label: 'More', isMore: true, icon: <Menu size={20} /> },
];

export default function LabLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="page-layout">
      <Sidebar
        navItems={navItems}
        title="Lab Partner"
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Mobile Top Navigation Header */}
        <header className="lab-mobile-topbar">
          <div className="lab-mobile-topbar__brand">
            <div className="lab-mobile-topbar__logo">L</div>
            <span className="lab-mobile-topbar__title">Lab Partner</span>
          </div>
          <button
            type="button"
            className="lab-mobile-topbar__btn"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open navigation menu"
          >
            <Menu size={22} />
          </button>
        </header>

        <main className="page-layout__main" style={{ marginLeft: collapsed ? 72 : 260 }}>
          <Outlet />
        </main>
      </div>

      <Navbar
        navItems={bottomNavItems}
        onMoreClick={() => setMobileMenuOpen(true)}
      />
    </div>
  );
}
