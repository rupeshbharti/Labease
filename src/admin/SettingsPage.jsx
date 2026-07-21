import { TopBar } from '../shared/Navbar';
import Card from '../shared/Card';
import Input from '../shared/Input';
import Button from '../shared/Button';
import './AdminPages.css';

export default function SettingsPage() {
  return (
    <>
      <TopBar title="Platform Settings" />
      <div className="admin-content animate-fade-in">
        <Card padding="lg" className="lab-review" style={{ maxWidth: 600 }}>
          <h2 className="title-md mb-lg">Commission Configuration</h2>
          <div className="flex flex-col gap-md">
            <Input
              label="Default Commission Rate (%)"
              type="number"
              placeholder="15"
              defaultValue="15"
              min={0}
              max={100}
            />
            <Input
              label="Minimum Booking Value (₹)"
              type="number"
              placeholder="200"
              defaultValue="200"
            />
            <Button variant="primary" size="lg">
              Save Settings
            </Button>
          </div>
        </Card>
      </div>
    </>
  );
}
