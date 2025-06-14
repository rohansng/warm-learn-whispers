
import React from 'react';
import { Card } from '@/components/ui/card';
import { TILEntry } from '../types';
import { Heart } from 'lucide-react';

interface RandomMemoryCardProps {
  entry: TILEntry;
}

const RandomMemoryCard: React.FC<RandomMemoryCardProps> = ({ entry }) => {
  return (
    <Card className="p-6 bg-gradient-to-r from-red-900/20 to-black/60 border-2 border-red-600/30 shadow-lg animate-scale-in hover:shadow-red-600/20 hover:shadow-2xl transition-all duration-300">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <Heart className="w-6 h-6 text-red-500 animate-bounce-gentle" />
        </div>
        
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-red-400 mb-2">
            💭 Remember what you learned?
          </h3>
          
          <div className="bg-black/40 rounded-lg p-4 mb-3 border border-red-600/20">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-2xl">{entry.emoji}</span>
              <time className="text-sm font-medium text-gray-300">
                {new Date(entry.date).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </time>
            </div>
            
            <p className="text-gray-200 leading-relaxed">
              {entry.content}
            </p>
            
            {entry.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {entry.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-block px-2 py-1 text-xs rounded-full bg-red-600/20 text-red-400 border border-red-600/30"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
          
          <p className="text-sm text-red-300">
            ✨ Here's a beautiful moment from your learning journey!
          </p>
        </div>
      </div>
    </Card>
  );
};

export default RandomMemoryCard;
