import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { LayoutDashboard, Building2, ClipboardList, Settings, Landmark } from 'lucide-react';
import Sidebar from '../shared/Sidebar';
import Navbar from '../shared/Navbar';
import { TopBar } from '../shared/Navbar';

const navItems = [
  { label: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={20} />, end: true },
  { label: 'Lab Applications', path: '/admin/labs', icon: <Building2 size={20} /> },
  { label: 'Orders', path: '/admin/orders', icon: <ClipboardList size={20} /> },
  { label: 'Payouts', path: '/admin/payouts', icon: <Landmark size={20} /> },
  { label: 'Settings', path: '/admin/settings', icon: <Settings size={20} /> },
];

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="page-layout">
      <Sidebar
        navItems={navItems}
        title="LabEase Admin"
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
