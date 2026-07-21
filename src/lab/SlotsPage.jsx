import { TopBar } from '../shared/Navbar';
import Card from '../shared/Card';
import './LabPages.css';

export default function SlotsPage() {
  return (
    <>
      <TopBar title="Slot Management" />
      <div className="lab-content animate-fade-in">
        <Card padding="lg">
          <h2 className="title-md mb-md">Time Slot Configuration</h2>
          <p className="body-lg text-muted mb-lg">
            Configure your available time slots for home collection. This will be fully functional once your lab is live.
          </p>
        </Card>
      </div>
    </>
  );
}
