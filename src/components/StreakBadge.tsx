
import React from 'react';
import { Note } from '@/types/auth';

interface StreakBadgeProps {
  notes: Note[];
}

const StreakBadge = ({ notes }: StreakBadgeProps) => {
  const calculateStreak = () => {
    if (notes.length === 0) return 0;

    // Sort notes by date descending
    const sortedNotes = [...notes].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    // Get unique dates
    const uniqueDates = Array.from(new Set(sortedNotes.map(note => note.date)))
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    if (uniqueDates.length === 0) return 0;

    let streak = 0;
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const yesterdayString = yesterday.toISOString().split('T')[0];

    // Start checking from today or yesterday
    let currentDate = new Date();
    if (uniqueDates[0] === todayString) {
      streak = 1;
      currentDate.setDate(currentDate.getDate() - 1);
    } else if (uniqueDates[0] === yesterdayString) {
      streak = 1;
      currentDate = yesterday;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      return 0; // No recent activity
    }

    // Count consecutive days
    let dateIndex = 1;
    while (dateIndex < uniqueDates.length) {
      const expectedDate = currentDate.toISOString().split('T')[0];
      if (uniqueDates[dateIndex] === expectedDate) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
        dateIndex++;
      } else {
        break;
      }
    }

    return streak;
  };

  const streak = calculateStreak();

  if (streak === 0) return null;

  return (
    <div className="flex items-center bg-gradient-to-r from-orange-600 to-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
      🔥 {streak}-day streak
    </div>
  );
};

export default StreakBadge;
