import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Home, Search, ShoppingCart, ClipboardList, User, MapPin, Bell } from 'lucide-react';
import Navbar from '../shared/Navbar';
import { useCart } from './CartContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

const navItems = [
  { label: 'Home', path: '/patient', icon: <Home size={20} />, end: true },
  { label: 'Search', path: '/patient/search', icon: <Search size={20} /> },
  { label: 'Cart', path: '/patient/cart', icon: <ShoppingCart size={20} /> },
  { label: 'Bookings', path: '/patient/bookings', icon: <ClipboardList size={20} /> },
  { label: 'Profile', path: '/patient/profile', icon: <User size={20} /> },
];

export default function PatientLayout() {
  const navigate = useNavigate();
  const { itemCount } = useCart();
  const [defaultAddress, setDefaultAddress] = useState('New York, Downtown');

  useEffect(() => {
    async function fetchAddress() {
      try {
        const res = await api.get('/api/users/addresses');
        const def = res.data.find(addr => addr.is_default);
        if (def) {
          setDefaultAddress(`${def.label}, ${def.full_address.split(',')[0]}`);
        } else if (res.data.length > 0) {
          // If no default but addresses exist, pick first
          setDefaultAddress(`${res.data[0].label}, ${res.data[0].full_address.split(',')[0]}`);
        }
      } catch (err) {
        console.error('Error fetching default address:', err);
      }
    }
    fetchAddress();

    // Listen for custom address storage event to live-update
    window.addEventListener('storage', fetchAddress);
    return () => window.removeEventListener('storage', fetchAddress);
  }, []);

  const handleNotificationClick = () => {
    toast('All caught up! No new notifications.', { icon: '🔔' });
  };

  return (
    <div className="patient-layout">
      {/* Stitch-style TopAppBar (Sticky Desktop Header & Mobile Location Bar) */}
      <header className="flex justify-between items-center w-full px-4 h-16 sticky top-0 z-50 bg-white shadow-sm" style={{ borderBottom: '1px solid var(--border-color)' }}>
        <div 
          className="flex items-center gap-2 cursor-pointer active:scale-95 duration-150" 
          onClick={() => navigate('/patient/profile')}
        >
          <MapPin size={22} className="text-primary" />
          <div className="flex flex-col text-left">
            <span className="font-label-md" style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>Current Location</span>
            <span className="font-title-md text-primary leading-none" style={{ fontSize: '14px', fontWeight: 600 }}>{defaultAddress}</span>
          </div>
        </div>

        <h1 
          className="hidden md:block font-bold text-primary cursor-pointer" 
          style={{ fontSize: '20px', letterSpacing: '-0.5px', margin: 0 }}
          onClick={() => navigate('/patient')}
        >
          LabEase
        </h1>

        <div className="flex items-center gap-2">
          {/* Notification Button */}
          <button 
            onClick={handleNotificationClick} 
            className="p-2 rounded-full hover:bg-surface-container-low transition-colors"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <Bell size={20} className="text-secondary" />
          </button>
        </div>
      </header>

      {/* Desktop sidebar-free nav or responsive layout wrapper */}
      <header className="patient-desktop-header">
        <div className="patient-desktop-header__container">
          <div className="patient-desktop-header__logo" onClick={() => navigate('/patient')} style={{ cursor: 'pointer' }}>
            LabEase
          </div>
          <nav className="patient-desktop-header__nav">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                className={({ isActive }) =>
                  `patient-desktop-header__link ${isActive ? 'patient-desktop-header__link--active' : ''}`
                }
              >
                <span className="patient-desktop-header__icon">{item.icon}</span>
                <span>
                  {item.label}
                  {item.label === 'Cart' && itemCount > 0 && ` (${itemCount})`}
                </span>
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="patient-layout__main">
        <Outlet />
      </main>
      
      {/* Mobile Bottom Navigation */}
      <Navbar navItems={navItems} />
    </div>
  );
}
