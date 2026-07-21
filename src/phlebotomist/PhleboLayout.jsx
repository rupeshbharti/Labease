import { Outlet } from 'react-router-dom';
import { Home, ListTodo, DollarSign, User } from 'lucide-react';
import Navbar from '../shared/Navbar';

const navItems = [
  { label: 'Dashboard', path: '/phlebo', icon: <Home size={22} />, end: true },
  { label: 'Tasks', path: '/phlebo/tasks', icon: <ListTodo size={22} /> },
  { label: 'Earnings', path: '/phlebo/earnings', icon: <DollarSign size={22} /> },
  { label: 'Profile', path: '/phlebo/profile', icon: <User size={22} /> },
];

export default function PhleboLayout() {
  return (
    <div>
      <main style={{ paddingBottom: 72 }}>
        <Outlet />
      </main>
      <Navbar navItems={navItems} />
    </div>
  );
}
