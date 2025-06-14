
import React from 'react';

interface GuestBannerProps {
  username: string;
}

const GuestBanner: React.FC<GuestBannerProps> = ({ username }) => {
  return (
    <div className="mb-6 p-4 bg-mint-50 border border-mint-200 rounded-xl">
      <div className="flex items-center space-x-2">
        <div className="text-2xl">👤</div>
        <div>
          <p className="font-medium text-mint-800">Guest Mode Active</p>
          <p className="text-sm text-mint-600">
            Your learning data is saved and will be accessible on any device using the username "{username}".
          </p>
        </div>
      </div>
    </div>
  );
};

export default GuestBanner;
