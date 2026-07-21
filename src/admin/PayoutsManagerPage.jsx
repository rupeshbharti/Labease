import { useState, useEffect } from 'react';
import api from '../utils/api';
import Card from '../shared/Card';
import Button from '../shared/Button';
import Badge from '../shared/Badge';
import Modal from '../shared/Modal';
import LoadingSpinner from '../shared/LoadingSpinner';
import { Landmark, Settings, RefreshCw, Plus, Users, ShieldAlert, Check } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PayoutsManagerPage() {
  const [labs, setLabs] = useState([]);
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal settings
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [isCommissionModalOpen, setIsCommissionModalOpen] = useState(false);

  // Form states
  const [selectedLabId, setSelectedLabId] = useState('');
  const [disburseAmount, setDisburseAmount] = useState('');
  const [submittingPayout, setSubmittingPayout] = useState(false);

  const [selectedLabForComm, setSelectedLabForComm] = useState(null);
  const [newCommRate, setNewCommRate] = useState('');
  const [submittingComm, setSubmittingComm] = useState(false);

  const loadAdminFinance = async () => {
    setLoading(true);
    try {
      const [labsRes, payRes] = await Promise.all([
        api.get('/api/admin/labs'),
        api.get('/api/admin/payouts')
      ]);
      setLabs(labsRes.data);
      setPayouts(payRes.data);
    } catch (err) {
      console.error('Error fetching admin finance details:', err);
      toast.error('Failed to load financial records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminFinance();
  }, []);

  const handleDisbursePayout = async (e) => {
    e.preventDefault();
    if (!selectedLabId || !disburseAmount) {
      toast.error('Please select a laboratory and enter disbursement amount');
      return;
    }

    setSubmittingPayout(true);
    try {
      await api.post('/api/admin/payouts/disburse', {
        lab_id: selectedLabId,
        amount: parseFloat(disburseAmount)
      });
      toast.success('Payout disbursement simulated successfully!');
      setIsPayoutModalOpen(false);
      setSelectedLabId('');
      setDisburseAmount('');
      loadAdminFinance();
    } catch (err) {
      toast.error(err.message || 'Failed to disburse payout');
    } finally {
      setSubmittingPayout(false);
    }
  };

  const handleOpenCommission = (lab) => {
    setSelectedLabForComm(lab);
    setNewCommRate(lab.commission_rate || '15');
    setIsCommissionModalOpen(true);
  };

  const handleUpdateCommission = async (e) => {
    e.preventDefault();
    if (!newCommRate) return;

    setSubmittingComm(true);
    try {
      await api.put(`/api/admin/labs/${selectedLabForComm.id}/review`, {
        status: selectedLabForComm.status,
        commission_rate: parseFloat(newCommRate)
      });
      toast.success('Commission rate updated successfully!');
      setIsCommissionModalOpen(false);
      loadAdminFinance();
    } catch (err) {
      toast.error(err.message || 'Failed to update commission rate');
    } finally {
      setSubmittingComm(false);
    }
  };

  return (
    <div className="payouts-manager-page" style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 className="headline-lg">Payouts & Commissions</h1>
          <p className="body-md text-secondary">Manage platform commission rates and disburse payments to lab partners</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Button variant="secondary" icon={<RefreshCw size={16} />} onClick={loadAdminFinance}>
            Refresh
          </Button>
          <Button variant="primary" icon={<Plus size={16} />} onClick={() => setIsPayoutModalOpen(true)}>
            Disburse Payout
          </Button>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner text="Connecting central accounts ledger..." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Lab Partner Commission Config List */}
          <Card style={{ padding: '20px', backgroundColor: 'var(--surface-container-lowest)', border: '1px solid var(--outline-variant)' }}>
            <h3 className="title-md" style={{ margin: '0 0 16px', fontWeight: 600 }}>Lab Commission Config</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
              {labs.map(lab => (
                <div key={lab.id} style={{ border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-lg)', padding: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>{lab.name}</h4>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginTop: '2px' }}>
                      Commission Rate: {lab.commission_rate || 15}%
                    </span>
                  </div>
                  <Button size="sm" variant="secondary" icon={<Settings size={12} />} onClick={() => handleOpenCommission(lab)}>
                    Configure
                  </Button>
                </div>
              ))}
            </div>
          </Card>

          {/* Disbursements audit ledger */}
          <Card style={{ padding: '20px', backgroundColor: 'var(--surface-container-lowest)', border: '1px solid var(--outline-variant)' }}>
            <h3 className="title-md" style={{ margin: '0 0 16px', fontWeight: 600 }}>Platform Disbursement Logs</h3>
            {payouts.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                No payout logs found.
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--outline-variant)', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600 }}>
                    <th style={{ padding: '8px 4px' }}>Date</th>
                    <th>Lab Partner</th>
                    <th>Gross Billings</th>
                    <th>Commission Deducted</th>
                    <th>Net Transferred</th>
                    <th style={{ textAlign: 'right' }}>Transfer Status</th>
                  </tr>
                </thead>
                <tbody>
                  {payouts.map(pay => (
                    <tr key={pay.id} style={{ borderBottom: '1px solid var(--outline-variant)' }}>
                      <td style={{ padding: '12px 4px' }}>
                        {pay.paid_at ? new Date(pay.paid_at).toLocaleDateString() : 'N/A'}
                      </td>
                      <td>{pay.lab_partners?.name || 'Partner Center'}</td>
                      <td>₹{pay.gross_amount}</td>
                      <td style={{ color: 'var(--error)' }}>-₹{pay.commission_deducted}</td>
                      <td style={{ fontWeight: 600, color: 'var(--success)' }}>₹{pay.net_payout}</td>
                      <td style={{ textAlign: 'right' }}>
                        <Badge variant="success">PAID</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>
        </div>
      )}

      {/* Disburse Payout Modal */}
      <Modal
        open={isPayoutModalOpen}
        onClose={() => setIsPayoutModalOpen(false)}
        title="Simulate Payout Disbursement"
        size="sm"
      >
        <form onSubmit={handleDisbursePayout} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Select Lab Partner</label>
            <select
              value={selectedLabId}
              onChange={(e) => setSelectedLabId(e.target.value)}
              style={{ width: '100%', padding: '10px', border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius)', fontSize: '13px', backgroundColor: 'var(--surface-container-lowest)' }}
              required
            >
              <option value="">Choose Lab...</option>
              {labs.map(lab => (
                <option key={lab.id} value={lab.id}>{lab.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Gross Amount (Billings to Disburse)</label>
            <input
              type="number"
              value={disburseAmount}
              onChange={(e) => setDisburseAmount(e.target.value)}
              placeholder="e.g. 15000"
              style={{ width: '100%', padding: '10px', border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius)', fontSize: '13px', backgroundColor: 'var(--surface-container-lowest)' }}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid var(--outline-variant)', paddingTop: '16px', marginTop: '8px' }}>
            <Button type="button" variant="secondary" onClick={() => setIsPayoutModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submittingPayout}>
              Disburse Payout
            </Button>
          </div>
        </form>
      </Modal>

      {/* Configure Commission Modal */}
      <Modal
        open={isCommissionModalOpen}
        onClose={() => setIsCommissionModalOpen(false)}
        title="Configure Laboratory Commission"
        size="sm"
      >
        <form onSubmit={handleUpdateCommission} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ backgroundColor: 'var(--surface-container-low)', padding: '12px', borderRadius: 'var(--radius-lg)' }}>
            <strong>Lab Partner:</strong> {selectedLabForComm?.name}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Commission Rate (%)</label>
            <input
              type="number"
              step="0.1"
              value={newCommRate}
              onChange={(e) => setNewCommRate(e.target.value)}
              placeholder="e.g. 15.0"
              style={{ width: '100%', padding: '10px', border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius)', fontSize: '13px', backgroundColor: 'var(--surface-container-lowest)' }}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid var(--outline-variant)', paddingTop: '16px', marginTop: '8px' }}>
            <Button type="button" variant="secondary" onClick={() => setIsCommissionModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submittingComm}>
              Update Commission
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
