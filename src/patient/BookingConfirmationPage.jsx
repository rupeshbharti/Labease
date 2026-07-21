import { useParams, useNavigate } from 'react-router-dom';
import Card from '../shared/Card';
import Button from '../shared/Button';
import { CheckCircle2, ChevronRight, Clipboard } from 'lucide-react';

export default function BookingConfirmationPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div style={{ padding: '40px 16px', maxWidth: '480px', margin: '60px auto', textAlign: 'center' }}>
      <CheckCircle2 size={64} className="text-success" style={{ margin: '0 auto 20px', display: 'block' }} />
      
      <h1 className="headline-md" style={{ fontWeight: 700, marginBottom: '8px' }}>
        Booking Confirmed!
      </h1>
      <p className="body-md text-secondary" style={{ marginBottom: '24px' }}>
        Your diagnostic lab has received the booking request and is reviewing it. We will notify you once confirmed.
      </p>

      <Card style={{ padding: '16px', marginBottom: '24px', textAlign: 'left' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px' }}>
          <span className="text-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Clipboard size={16} /> Booking Reference ID
          </span>
          <span style={{ fontFamily: 'monospace', fontWeight: 'bold', fontSize: '15px' }}>
            {id.substring(0, 8).toUpperCase()}
          </span>
        </div>
      </Card>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <Button onClick={() => navigate(`/patient/bookings`)} fullWidth>
          Track Bookings <ChevronRight size={16} />
        </Button>
        <Button variant="secondary" onClick={() => navigate('/patient')} fullWidth>
          Back to Home
        </Button>
      </div>
    </div>
  );
}
