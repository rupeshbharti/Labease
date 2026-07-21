import Card from '../shared/Card';
import Button from '../shared/Button';
import { Clock, Beaker, HelpCircle } from 'lucide-react';

export default function TestCard({ test, onAdd, isAdded = false }) {
  return (
    <Card className="test-card-item animate-fade-in" style={{ padding: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
        <div style={{ flex: 1 }}>
          <span
            className="label-sm"
            style={{
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
              fontSize: '10px',
              letterSpacing: '0.5px',
            }}
          >
            {test.code || 'Test'}
          </span>
          <h4 className="title-md" style={{ margin: '4px 0 8px', fontWeight: 600 }}>
            {test.name}
          </h4>
          <p className="body-sm text-secondary" style={{ margin: '0 0 12px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {test.description || 'Standard diagnostic test formulation.'}
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '13px', color: 'var(--text-secondary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Beaker size={14} className="text-muted" />
              <span>{test.sample_type || 'Blood'}</span>
            </div>
            {test.turnaround_hours && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={14} className="text-muted" />
                <span>Reports in {test.turnaround_hours} hrs</span>
              </div>
            )}
          </div>

          {test.preparation_instructions && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginTop: '12px',
                padding: '6px 10px',
                backgroundColor: 'var(--surface-variant)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '12px',
                color: 'var(--text-secondary)',
              }}
            >
              <HelpCircle size={14} className="text-primary" />
              <span>{test.preparation_instructions}</span>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'space-between', height: '100%', minHeight: '80px' }}>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--primary-color)' }}>
            ₹{test.price}
          </div>
          <Button
            size="sm"
            variant={isAdded ? 'secondary' : 'primary'}
            onClick={() => onAdd && onAdd(test)}
            style={{ marginTop: 'auto', minWidth: '80px' }}
          >
            {isAdded ? 'Added' : 'Add'}
          </Button>
        </div>
      </div>
    </Card>
  );
}
