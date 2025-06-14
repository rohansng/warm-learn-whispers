
import React from 'react';
import { Card } from '@/components/ui/card';
import { TILEntry } from '../types';
import { Heart } from 'lucide-react';

interface RandomMemoryCardProps {
  entry: TILEntry;
}

const RandomMemoryCard: React.FC<RandomMemoryCardProps> = ({ entry }) => {
  return (
    <Card className="glass-card p-8 shadow-2xl border border-cherry-500/40 glow-red-intense animate-scale-in">
      <div className="flex items-start space-x-6">
        <div className="flex-shrink-0">
          <Heart className="w-8 h-8 text-cherry-400 animate-bounce-gentle" />
        </div>
        
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-cherry-300 mb-4">
            💭 Remember what you learned?
          </h3>
          
          <div className="glass rounded-xl p-6 mb-4 border border-crimson-500/20">
            <div className="flex items-center space-x-3 mb-3">
              <span className="text-3xl">{entry.emoji}</span>
              <time className="text-lg font-semibold text-cherry-300">
                {new Date(entry.date).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </time>
            </div>
            
            <p className="text-white leading-relaxed text-lg mb-4">
              {entry.content}
            </p>
            
            {entry.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {entry.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-block px-3 py-1 text-sm rounded-full bg-gradient-to-r from-crimson-500/20 to-cherry-500/20 text-cherry-300 border border-crimson-500/30"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
          
          <p className="text-lg text-cherry-200">
            ✨ Here's a beautiful moment from your learning journey!
          </p>
        </div>
      </div>
    </Card>
  );
};

export default RandomMemoryCard;
