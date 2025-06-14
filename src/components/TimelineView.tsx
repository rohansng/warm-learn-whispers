
import React from 'react';
import { Card } from '@/components/ui/card';
import { TILEntry } from '../types';
import { formatDistanceToNow } from 'date-fns';
import { getTagEmoji } from '../utils/emojis';

interface TimelineViewProps {
  entries: TILEntry[];
}

const TimelineView: React.FC<TimelineViewProps> = ({ entries }) => {
  if (entries.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📚</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No entries yet</h3>
        <p className="text-gray-500">Start your learning journey by adding your first TIL entry!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Your Learning Timeline</h2>
        <span className="text-sm text-gray-500">{entries.length} entries</span>
      </div>

      <div className="space-y-4">
        {entries.map((entry, index) => (
          <Card
            key={entry.id}
            className="p-6 bg-white/80 backdrop-blur-sm border-2 border-lavender-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] animate-fade-in-up"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <span className="text-3xl">{entry.emoji}</span>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <time className="text-sm font-medium text-lavender-600">
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
                
                <p className="text-gray-800 leading-relaxed mb-3">
                  {entry.content}
                </p>
                
                {entry.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {entry.tags.map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="inline-block px-2 py-1 text-xs rounded-full bg-gradient-to-r from-mint-100 to-lavender-100 text-lavender-700 border border-lavender-200"
                      >
                        {getTagEmoji(tag)} {tag}
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
