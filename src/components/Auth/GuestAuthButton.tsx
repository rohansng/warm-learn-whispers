
import React from 'react';
import { Button } from '@/components/ui/button';
import { User as UserIcon } from 'lucide-react';

interface GuestAuthButtonProps {
  loading: boolean;
  onClick: () => void;
}

const GuestAuthButton: React.FC<GuestAuthButtonProps> = ({ loading, onClick }) => {
  return (
    <Button
      type="button"
      variant="outline"
      onClick={onClick}
      className="w-full border-2 border-mint-300 text-mint-700 hover:bg-mint-50 rounded-xl py-3"
      disabled={loading}
    >
      <UserIcon className="w-4 h-4 mr-2" />
      Continue as Guest
    </Button>
  );
};

export default GuestAuthButton;
