import { TopBar } from '../shared/Navbar';
import Card from '../shared/Card';
import './AdminPages.css';

export default function OrderMonitorPage() {
  return (
    <>
      <TopBar title="Order Monitor" />
      <div className="admin-content animate-fade-in">
        <Card padding="lg">
          <div className="text-center p-xl">
            <h2 className="title-md mb-md">Coming in Phase 2</h2>
            <p className="body-lg text-muted">
              The order monitoring dashboard will be available once the marketplace is live.
              You'll be able to track all bookings, their statuses, and resolve disputes.
            </p>
          </div>
        </Card>
      </div>
    </>
  );
}
