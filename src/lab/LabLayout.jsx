import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { LayoutDashboard, FileText, Clock, MapPin, User, ClipboardList, ShoppingBag, FileCheck, TrendingUp, MessageSquare } from 'lucide-react';
import Sidebar from '../shared/Sidebar';
import Navbar from '../shared/Navbar';

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

export default function LabLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="page-layout">
      <Sidebar
        navItems={navItems}
        title="Lab Partner"
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
      />
      <main className="page-layout__main" style={{ marginLeft: collapsed ? 72 : 260 }}>
        <Outlet />
      </main>
      <Navbar navItems={navItems} />
    </div>
  );
}
