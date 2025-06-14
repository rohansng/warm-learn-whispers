
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { User } from '../../types';

interface ProgressSidebarProps {
  userProfile: User | null;
  entries: any[];
  isGuest: boolean;
}

const ProgressSidebar: React.FC<ProgressSidebarProps> = ({ userProfile, entries, isGuest }) => {
  const thisMonthEntries = entries.filter(entry => {
    const entryDate = new Date(entry.date);
    const now = new Date();
    return entryDate.getMonth() === now.getMonth() && 
           entryDate.getFullYear() === now.getFullYear();
  }).length;

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-lavender-100">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Progress</h3>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Total Learnings</span>
          <Badge variant="secondary" className="bg-lavender-100 text-lavender-700">
            {userProfile?.totalEntries || 0}
          </Badge>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">This Month</span>
          <Badge variant="secondary" className="bg-mint-100 text-mint-700">
            {thisMonthEntries}
          </Badge>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Account Type</span>
          <Badge variant={isGuest ? "outline" : "default"} className={isGuest ? "border-mint-300 text-mint-700" : "bg-lavender-500 text-white"}>
            {isGuest ? "Guest" : "Member"}
          </Badge>
        </div>
      </div>
    </div>
  );
};

export default ProgressSidebar;
