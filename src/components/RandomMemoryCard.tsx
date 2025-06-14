
import React from 'react';
import { Card } from '@/components/ui/card';
import { TILEntry } from '../types';
import { Heart } from 'lucide-react';

interface RandomMemoryCardProps {
  entry: TILEntry;
}

const RandomMemoryCard: React.FC<RandomMemoryCardProps> = ({ entry }) => {
  return (
    <Card className="glass-card p-6 rounded-2xl glow-cherry animate-scale-in">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <Heart className="w-6 h-6 text-cherry-red animate-bounce-gentle" />
        </div>
        
        <div className="flex-1">
          <h3 className="text-lg font-orbitron font-semibold gradient-text mb-2">
            💭 Remember what you learned?
          </h3>
          
          <div className="glass rounded-lg p-4 mb-3">
            <div className="flex items-center space-x-2 mb-2">
              <div className="pulse-cherry p-1 rounded-full bg-gradient-primary">
                <span className="text-2xl">{entry.emoji}</span>
              </div>
              <time className="text-sm font-medium text-cherry-red font-orbitron">
                {new Date(entry.date).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </time>
            </div>
            
            <p className="text-gray-800 leading-relaxed">
              {entry.content}
            </p>
            
            {entry.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {entry.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-block px-2 py-1 text-xs rounded-full bg-gradient-primary text-white"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
          
          <p className="text-sm text-cherry-red">
            ✨ Here's a beautiful moment from your learning journey!
          </p>
        </div>
      </div>
    </Card>
  );
};

export default RandomMemoryCard;
