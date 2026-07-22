import { RefreshCw } from 'lucide-react';
import { usePhleboTask } from '../context/PhleboTaskContext';
import EarningsCard from '../components/EarningsCard';
import EarningsLogTable from '../components/EarningsLogTable';
import Button from '../../shared/Button';
import LoadingSpinner from '../../shared/LoadingSpinner';

export function EarningsPage() {
  const { tasks, loading, loadTasks } = usePhleboTask();

  const completedTasks = tasks.filter(t => t.status === 'collected');
  const completedCount = completedTasks.length;
  
  // Financial calculations
  const basePayPerSample = 200;
  const conveyancePerSample = 30;
  const incentivePerSample = 50;
  const totalEarnings = completedCount * (basePayPerSample + conveyancePerSample + incentivePerSample);

  return (
    <div className="phlebo-page-container">
      <div className="phlebo-header-row">
        <div>
          <h1 className="headline-sm" style={{ margin: 0, fontWeight: 700, fontSize: '22px' }}>Phlebotomist Earnings</h1>
          <p className="body-sm text-secondary">Weekly collection payouts, bonuses, and conveyance</p>
        </div>
        <Button variant="secondary" size="sm" icon={<RefreshCw size={16} />} onClick={loadTasks}>
          Refresh
        </Button>
      </div>

      {loading ? (
        <LoadingSpinner text="Calculating payout ledger..." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <EarningsCard
            totalEarnings={totalEarnings}
            completedCount={completedCount}
            incentiveBonus={completedCount * incentivePerSample}
            conveyancePay={completedCount * conveyancePerSample}
          />
          <EarningsLogTable completedTasks={completedTasks} />
        </div>
      )}
    </div>
  );
}

export default EarningsPage;
