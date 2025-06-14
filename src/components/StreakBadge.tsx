
import React from 'react';

interface StreakBadgeProps {
  streakCount: number;
}

const StreakBadge: React.FC<StreakBadgeProps> = ({ streakCount }) => {
  if (streakCount === 0) return null;

  return (
    <div className="flex items-center space-x-2 bg-gradient-to-r from-orange-100 to-red-100 px-3 py-1 rounded-full border border-orange-200">
      <span className="text-lg">🔥</span>
      <span className="text-sm font-semibold text-orange-700">
        {streakCount}-day streak
      </span>
    </div>
  );
};

export default StreakBadge;
