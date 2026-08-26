import { ShieldOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from './Button';

export function AccessDenied({ message }) {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 text-danger">
        <ShieldOff size={32} strokeWidth={1.5} />
      </div>
      <h2 className="text-xl font-bold text-primary-token mb-2">Access Denied</h2>
      <p className="text-sm text-muted max-w-md mb-6">
        {message || "You don't have permission to view this page. Contact your administrator if you believe this is an error."}
      </p>
      <Button onClick={() => navigate('/')} variant="primary">
        Go to Dashboard
      </Button>
    </div>
  );
}
