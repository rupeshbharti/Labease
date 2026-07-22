import Badge from '../../shared/Badge';
import Card from '../../shared/Card';

export function EarningsLogTable({ completedTasks = [] }) {
  return (
    <Card className="earnings-log-card">
      <h3 className="title-md" style={{ margin: '0 0 16px', fontWeight: 600 }}>Fulfilled Collection Earnings</h3>
      
      {completedTasks.length === 0 ? (
        <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
          No completed sample collections logged yet today.
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="earnings-table">
            <thead>
              <tr>
                <th>Booking Ref</th>
                <th>Patient</th>
                <th>Slot Time</th>
                <th>Earned Pay</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {completedTasks.map((task) => {
                const booking = task.bookings || {};
                const earned = 280; // Standard base pay + conveyance per task
                return (
                  <tr key={task.id}>
                    <td className="mono-ref">#{booking.id?.slice(0, 8) || 'N/A'}</td>
                    <td>{booking.patient_name || 'Patient'}</td>
                    <td>{booking.slot_time || '08:00 AM'}</td>
                    <td className="earned-val">₹{earned}</td>
                    <td>
                      <Badge variant="success">FULFILLED</Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

export default EarningsLogTable;
