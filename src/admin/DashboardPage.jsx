import { useState, useEffect } from 'react';
import { Building2, ClipboardList, Users, TrendingUp } from 'lucide-react';
import { supabase } from '../config/supabase';
import Card from '../shared/Card';
import { TopBar } from '../shared/Navbar';
import './AdminPages.css';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalLabs: 0,
    pendingReviews: 0,
    activeLabs: 0,
    totalUsers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [labsRes, pendingRes, liveRes, usersRes] = await Promise.all([
        supabase.from('lab_partners').select('id', { count: 'exact', head: true }),
        supabase.from('lab_partners').select('id', { count: 'exact', head: true }).eq('status', 'pending_review'),
        supabase.from('lab_partners').select('id', { count: 'exact', head: true }).eq('status', 'live'),
        supabase.from('users').select('id', { count: 'exact', head: true }),
      ]);

      setStats({
        totalLabs: labsRes.count || 0,
        pendingReviews: pendingRes.count || 0,
        activeLabs: liveRes.count || 0,
        totalUsers: usersRes.count || 0,
      });
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: 'Total Labs', value: stats.totalLabs, icon: <Building2 size={24} />, color: 'primary' },
    { label: 'Pending Reviews', value: stats.pendingReviews, icon: <ClipboardList size={24} />, color: 'warning' },
    { label: 'Active Labs', value: stats.activeLabs, icon: <TrendingUp size={24} />, color: 'success' },
    { label: 'Total Users', value: stats.totalUsers, icon: <Users size={24} />, color: 'info' },
  ];

  return (
    <>
      <TopBar title="Admin Dashboard" />
      <div className="admin-content animate-fade-in-up">
        <div className="stats-grid">
          {statCards.map((stat) => (
            <Card key={stat.label} padding="lg" hoverable>
              <div className="stat-card">
                <div className={`stat-card__icon stat-card__icon--${stat.color}`}>
                  {stat.icon}
                </div>
                <div className="stat-card__info">
                  <span className="stat-card__value display-lg">
                    {loading ? '–' : stat.value}
                  </span>
                  <span className="stat-card__label body-sm text-muted">{stat.label}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Card padding="lg" className="mt-xl">
          <h2 className="title-md mb-md">Recent Activity</h2>
          <p className="body-sm text-muted">Activity feed will appear here once labs start onboarding.</p>
        </Card>
      </div>
    </>
  );
}
