import { TrendingUp, Award, MapPin } from 'lucide-react';
import Card from '../../shared/Card';

export function EarningsCard({ totalEarnings = 0, completedCount = 0, incentiveBonus = 0, conveyancePay = 0 }) {
  return (
    <div className="earnings-summary-grid">
      <Card className="earnings-main-card">
        <div className="earnings-main-card__header">
          <span className="earnings-label">TOTAL EARNINGS</span>
          <span className="earnings-badge">WEEKLY DISBURSEMENT</span>
        </div>
        <div className="earnings-amount">₹{totalEarnings}</div>
        <p className="earnings-subtext">Calculated from {completedCount} fulfilled sample collections</p>
      </Card>

      <div className="earnings-sub-grid">
        <Card className="earnings-mini-card">
          <div className="mini-card__icon text-primary">
            <TrendingUp size={20} />
          </div>
          <div>
            <span className="mini-card__label">BASE COLLECTION PAY</span>
            <div className="mini-card__val">₹{totalEarnings - incentiveBonus - conveyancePay > 0 ? totalEarnings - incentiveBonus - conveyancePay : completedCount * 200}</div>
          </div>
        </Card>

        <Card className="earnings-mini-card">
          <div className="mini-card__icon text-warning">
            <Award size={20} />
          </div>
          <div>
            <span className="mini-card__label">INCENTIVE BONUS</span>
            <div className="mini-card__val">₹{incentiveBonus || completedCount * 50}</div>
          </div>
        </Card>

        <Card className="earnings-mini-card">
          <div className="mini-card__icon text-secondary">
            <MapPin size={20} />
          </div>
          <div>
            <span className="mini-card__label">DISTANCE CONVEYANCE</span>
            <div className="mini-card__val">₹{conveyancePay || completedCount * 30}</div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default EarningsCard;
