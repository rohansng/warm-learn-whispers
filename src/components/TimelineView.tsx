
import React from 'react';
import { Card } from '@/components/ui/card';
import { TILEntry } from '../types';
import { formatDistanceToNow } from 'date-fns';

interface TimelineViewProps {
  entries: TILEntry[];
}

const TimelineView: React.FC<TimelineViewProps> = ({ entries }) => {
  if (entries.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📚</div>
        <h3 className="text-xl font-semibold text-white mb-2">No entries yet</h3>
        <p className="text-gray-400">Start your learning journey by adding your first TIL entry!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Your Learning Timeline</h2>
        <span className="text-sm text-gray-400">{entries.length} entries</span>
      </div>

      <div className="space-y-4">
        {entries.map((entry, index) => (
          <Card
            key={entry.id}
            className="p-6 bg-gradient-card backdrop-blur-sm border border-red-600/20 shadow-lg hover:shadow-red-600/20 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] animate-fade-in-up hover:border-red-600/40"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <span className="text-3xl">{entry.emoji}</span>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <time className="text-sm font-medium text-red-400">
                    {new Date(entry.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </time>
                  <span className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(entry.date), { addSuffix: true })}
                  </span>
                </div>
                
                <p className="text-gray-200 leading-relaxed mb-3">
                  {entry.content}
                </p>
                
                {entry.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {entry.tags.map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="inline-block px-2 py-1 text-xs rounded-full bg-red-600/20 text-red-400 border border-red-600/30"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TimelineView;
