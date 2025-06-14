
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
      <div className="text-center py-16">
        <div className="text-8xl mb-6 animate-bounce-gentle">📚</div>
        <h3 className="text-2xl font-bold text-white mb-4">No entries yet</h3>
        <p className="text-gray-400 text-lg">Start your learning journey by adding your first TIL entry!</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-crimson-300 bg-clip-text text-transparent">
          Your Learning Timeline
        </h2>
        <span className="glass-card px-4 py-2 rounded-lg text-cherry-300 font-semibold">
          {entries.length} entries
        </span>
      </div>

      <div className="space-y-6">
        {entries.map((entry, index) => (
          <Card
            key={entry.id}
            className="glass-card p-8 shadow-2xl border border-crimson-500/30 hover:border-cherry-500/50 transition-all duration-500 hover:scale-[1.02] animate-fade-in-up glow-red group"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex items-start space-x-6">
              <div className="flex-shrink-0">
                <span className="text-4xl group-hover:scale-110 transition-transform duration-300">
                  {entry.emoji}
                </span>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-4">
                  <time className="text-lg font-semibold text-cherry-300">
                    {new Date(entry.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </time>
                  <span className="text-sm text-gray-400 bg-dark-800/50 px-3 py-1 rounded-full">
                    {formatDistanceToNow(new Date(entry.date), { addSuffix: true })}
                  </span>
                </div>
                
                <p className="text-white leading-relaxed mb-4 text-lg">
                  {entry.content}
                </p>
                
                {entry.tags.length > 0 && (
                  <div className="flex flex-wrap gap-3">
                    {entry.tags.map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="inline-block px-3 py-1 text-sm rounded-full bg-gradient-to-r from-crimson-500/20 to-cherry-500/20 text-cherry-300 border border-crimson-500/30 hover:scale-105 transition-transform duration-300"
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
