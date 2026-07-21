import { TopBar } from '../shared/Navbar';
import Card from '../shared/Card';
import './LabPages.css';

export default function ProfilePage() {
  return (
    <>
      <TopBar title="Lab Profile" />
      <div className="lab-content animate-fade-in">
        <Card padding="lg">
          <h2 className="title-md mb-md">Profile Management</h2>
          <p className="body-lg text-muted">
            Edit your lab name, logo, photos, description, and working hours.
            This feature will be fully functional after onboarding approval.
          </p>
        </Card>
      </div>
    </>
  );
}
