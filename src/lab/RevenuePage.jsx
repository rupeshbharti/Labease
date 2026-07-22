import { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { supabase } from '../config/supabase';
import api from '../utils/api';
import Card from '../shared/Card';
import Button from '../shared/Button';
import Badge from '../shared/Badge';
import LoadingSpinner from '../shared/LoadingSpinner';
import { DollarSign, Wallet, TrendingUp, Calendar, ArrowUpRight, ArrowDownLeft, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RevenuePage() {
  const { user } = useAuth();
  const [labId, setLabId] = useState(null);
  const [revenueData, setRevenueData] = useState(null);
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch Lab ID
  useEffect(() => {
    async function fetchLabId() {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from('lab_partners')
          .select('id')
          .eq('owner_user_id', user.id)
          .single();

        if (error) throw error;
        setLabId(data.id);
      } catch (err) {
        console.error('Error fetching lab id:', err);
      }
    }
    fetchLabId();
  }, [user]);

  const loadFinancialData = async () => {
    if (!labId) return;
    setLoading(true);
    try {
      const [revRes, payRes] = await Promise.all([
        api.get(`/api/revenue/${labId}/revenue`),
        api.get(`/api/revenue/${labId}/payouts`),
      ]);
      setRevenueData(revRes.data);
      setPayouts(payRes.data);
    } catch (err) {
      console.error('Error fetching financial dashboard:', err);
      toast.error('Failed to load financial details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (labId) loadFinancialData();
  }, [labId]);

  if (!labId) return <LoadingSpinner text="Retrieving lab financial records..." />;

  const summary = revenueData?.summary || { today: 0, week: 0, month: 0, totalGross: 0, totalCommission: 0, totalNet: 0 };
  const counts = revenueData?.counts || { total: 0, fulfilled: 0, cancelled: 0, active: 0 };

  return (
    <div className="revenue-page" style={{ padding: '16px 12px 80px', maxWidth: '900px', margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 className="headline-lg">Revenue & Payouts</h1>
          <p className="body-md text-secondary">Track diagnostic laboratory earnings, platform commission, and payouts</p>
        </div>
        <Button variant="secondary" icon={<RefreshCw size={16} />} onClick={loadFinancialData}>
          Refresh
        </Button>
      </div>

      {loading ? (
        <LoadingSpinner text="Compiling ledger records..." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Main indicators */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
            <Card style={{ padding: '20px', borderLeft: '4px solid var(--primary)', backgroundColor: 'var(--surface-container-lowest)', border: '1px solid var(--outline-variant)', borderLeftWidth: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>NET EARNINGS TODAY</span>
                  <div style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--primary)', marginTop: '4px' }}>
                    ₹{summary.today}
                  </div>
                </div>
                <div style={{ padding: '8px', backgroundColor: 'var(--primary-container)', borderRadius: '50%' }}>
                  <TrendingUp size={20} className="text-primary" />
                </div>
              </div>
            </Card>

            <Card style={{ padding: '20px', borderLeft: '4px solid var(--success)', backgroundColor: 'var(--surface-container-lowest)', border: '1px solid var(--outline-variant)', borderLeftWidth: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>MONTH TO DATE</span>
                  <div style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--success)', marginTop: '4px' }}>
                    ₹{summary.month}
                  </div>
                </div>
                <div style={{ padding: '8px', backgroundColor: 'var(--success-container)', borderRadius: '50%' }}>
                  <Wallet size={20} className="text-success" />
                </div>
              </div>
            </Card>

            <Card style={{ padding: '20px', borderLeft: '4px solid var(--warning)', backgroundColor: 'var(--surface-container-lowest)', border: '1px solid var(--outline-variant)', borderLeftWidth: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>TOTAL NET PAYOUT</span>
                  <div style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--warning)', marginTop: '4px' }}>
                    ₹{summary.totalNet}
                  </div>
                </div>
                <div style={{ padding: '8px', backgroundColor: 'var(--warning-container)', borderRadius: '50%' }}>
                  <DollarSign size={20} className="text-warning" />
                </div>
              </div>
            </Card>
          </div>

          {/* Breakdown layout */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            
            {/* Detailed Ledger split */}
            <Card style={{ padding: '20px', backgroundColor: 'var(--surface-container-lowest)', border: '1px solid var(--outline-variant)' }}>
              <h3 className="title-md" style={{ margin: '0 0 16px', fontWeight: 600 }}>Ledger Split Summary</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--outline-variant)', paddingBottom: '8px' }}>
                  <span>Gross Billings (Revenue Booked)</span>
                  <span style={{ fontWeight: 600 }}>₹{summary.totalGross}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--outline-variant)', paddingBottom: '8px', color: 'var(--error)' }}>
                  <span>Platform Commission Deducted (15%)</span>
                  <span style={{ fontWeight: 600 }}>-₹{summary.totalCommission}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid var(--outline-variant)', paddingBottom: '8px', fontWeight: 'bold', fontSize: '16px', color: 'var(--success)' }}>
                  <span>Net Ledger Balance</span>
                  <span>₹{summary.totalNet}</span>
                </div>
              </div>
            </Card>

            {/* Volume Analytics */}
            <Card style={{ padding: '20px', backgroundColor: 'var(--surface-container-lowest)', border: '1px solid var(--outline-variant)' }}>
              <h3 className="title-md" style={{ margin: '0 0 16px', fontWeight: 600 }}>Booking Volumes</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Fulfilled Collections:</span>
                  <strong className="text-success">{counts.fulfilled}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>In-Progress Active:</span>
                  <strong className="text-primary">{counts.active}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Cancelled/Failed:</span>
                  <strong className="text-secondary">{counts.cancelled}</strong>
                </div>
              </div>
            </Card>
          </div>

          {/* Payout Schedule History */}
          <Card style={{ padding: '20px', backgroundColor: 'var(--surface-container-lowest)', border: '1px solid var(--outline-variant)' }}>
            <h3 className="title-md" style={{ margin: '0 0 16px', fontWeight: 600 }}>Payout Disbursements (Weekly Schedule)</h3>
            {payouts.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                No past disbursements logged.
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', minWidth: '550px', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--outline-variant)', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600 }}>
                    <th style={{ padding: '8px 4px' }}>Disbursement Date</th>
                    <th>Payout Period</th>
                    <th>Gross Amount</th>
                    <th>Platform Comm.</th>
                    <th>Net Disbursed</th>
                    <th style={{ textAlign: 'right' }}>Disburse Status</th>
                  </tr>
                </thead>
                <tbody>
                  {payouts.map(pay => (
                    <tr key={pay.id} style={{ borderBottom: '1px solid var(--outline-variant)' }}>
                      <td style={{ padding: '12px 4px' }}>
                        {pay.paid_at ? new Date(pay.paid_at).toLocaleDateString() : 'Pending'}
                      </td>
                      <td>
                        {new Date(pay.period_start).toLocaleDateString()} - {new Date(pay.period_end).toLocaleDateString()}
                      </td>
                      <td>₹{pay.gross_amount}</td>
                      <td style={{ color: 'var(--error)' }}>-₹{pay.commission_deducted}</td>
                      <td style={{ fontWeight: 600, color: 'var(--success)' }}>₹{pay.net_payout}</td>
                      <td style={{ textAlign: 'right' }}>
                        <Badge variant={pay.status === 'paid' ? 'success' : 'warning'}>
                          {pay.status.toUpperCase()}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
