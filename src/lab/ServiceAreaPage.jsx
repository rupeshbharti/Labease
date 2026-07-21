import { TopBar } from '../shared/Navbar';
import Card from '../shared/Card';
import './LabPages.css';

export default function ServiceAreaPage() {
  return (
    <>
      <TopBar title="Service Area" />
      <div className="lab-content animate-fade-in">
        <Card padding="lg">
          <h2 className="title-md mb-md">Service Area Configuration</h2>
          <p className="body-lg text-muted">
            Define your home collection service area using a map. Google Maps integration will be added in Phase 2.
          </p>
        </Card>
      </div>
    </>
  );
}
