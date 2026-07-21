import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../utils/api';
import Card from '../shared/Card';
import Badge from '../shared/Badge';
import LoadingSpinner from '../shared/LoadingSpinner';
import { ShieldCheck, Download, AlertTriangle, FileText, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PublicReportSharePage() {
  const { token } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchSharedReport() {
      try {
        const res = await api.get(`/api/discovery/share/${token}`);
        setReport(res.data);
      } catch (err) {
        console.error('Error fetching public shared report:', err);
        setError(err.response?.data?.error || 'Shared report link is invalid or expired.');
        toast.error('Unable to view report');
      } finally {
        setLoading(false);
      }
    }
    fetchSharedReport();
  }, [token]);

  if (loading) return <LoadingSpinner fullPage text="Decrypting shared report parameters..." />;

  if (error) {
    return (
      <div style={{ padding: '40px 16px', maxWidth: '500px', margin: '0 auto', textAlign: 'center', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Card style={{ padding: '32px', borderTop: '4px solid var(--error)' }}>
          <AlertTriangle size={48} className="text-error" style={{ margin: '0 auto 16px', display: 'block' }} />
          <h2 className="title-lg" style={{ color: 'var(--error)' }}>Access Denied</h2>
          <p className="body-md text-secondary" style={{ marginTop: '8px', lineHeight: 1.5 }}>
            {error}
          </p>
          <p className="body-sm text-muted" style={{ marginTop: '16px', fontSize: '12px' }}>
            Medical reports are encrypted and share links auto-expire after 7 days for DPDP compliance.
          </p>
        </Card>
      </div>
    );
  }

  const booking = report.bookings;
  const lab = booking?.lab_partners;

  return (
    <div className="public-report-page" style={{ padding: '24px 16px 80px', maxWidth: '600px', margin: '0 auto', minHeight: '100vh', backgroundColor: 'var(--surface-container-lowest)' }}>
      
      {/* Verification Banner */}
      <div style={{
        backgroundColor: 'var(--success-container)',
        border: '1px solid var(--success)',
        borderRadius: 'var(--radius-lg)',
        padding: '12px 16px',
        marginBottom: '24px',
        color: 'var(--on-success-container)',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        <ShieldCheck size={20} className="text-success" />
        <span style={{ fontSize: '13px', fontWeight: 600 }}>
          Verified LabEase Diagnostic Report. Secure Share Link.
        </span>
      </div>

      <Card style={{ padding: '20px', marginBottom: '24px', backgroundColor: 'var(--surface-container-lowest)', border: '1px solid var(--outline-variant)' }}>
        <h2 className="title-md" style={{ margin: '0 0 16px', fontWeight: 700, fontSize: '18px' }}>
          Diagnostic Summary
        </h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px', color: 'var(--text-secondary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--outline-variant)', paddingBottom: '8px' }}>
            <strong>Laboratory Name</strong>
            <span>{lab?.name || 'Partner Lab Center'}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--outline-variant)', paddingBottom: '8px' }}>
            <strong>Booking Reference</strong>
            <span style={{ fontFamily: 'monospace' }}>{booking?.booking_number}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--outline-variant)', paddingBottom: '8px' }}>
            <strong>Collection Date</strong>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Calendar size={13} /> {booking?.slot_datetime ? new Date(booking.slot_datetime).toLocaleDateString() : 'N/A'}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--outline-variant)', paddingBottom: '8px' }}>
            <strong>Report Version</strong>
            <span>Version {report.version} (Latest)</span>
          </div>
        </div>
      </Card>

      {/* PDF file viewer preview & action */}
      <Card style={{ padding: '16px', backgroundColor: 'var(--surface-container-lowest)', border: '1px solid var(--outline-variant)' }}>
        <h3 className="title-sm" style={{ margin: '0 0 12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
          <FileText size={18} className="text-primary" /> Report File Attachment
        </h3>

        <div style={{ height: '350px', width: '100%', border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius)', overflow: 'hidden', marginBottom: '16px', backgroundColor: 'var(--surface-container-low)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          {/* Simulated PDF document view */}
          <div style={{ textAlign: 'center', padding: '24px' }}>
            <FileText size={64} className="text-muted" style={{ margin: '0 auto 16px' }} />
            <div style={{ fontWeight: 600, fontSize: '15px' }}>DiagnosticReport_V{report.version}.pdf</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Encrypted Portable Document Format</div>
          </div>
        </div>

        <a href={report.file_url} target="_blank" rel="noreferrer" download style={{ textDecoration: 'none' }}>
          <Button variant="primary" fullWidth icon={<Download size={16} />}>
            Download PDF Report
          </Button>
        </a>
      </Card>
    </div>
  );
}
