
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TILEntry } from '../types';
import { Calendar, Tag } from 'lucide-react';

interface TILListProps {
  entries: TILEntry[];
}

const TILList: React.FC<TILListProps> = ({ entries }) => {
  if (entries.length === 0) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm shadow-md">
        <CardContent className="p-8 text-center">
          <div className="text-4xl mb-4">📝</div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No entries yet</h3>
          <p className="text-gray-600">Start documenting your learning journey!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
        <span className="text-2xl">📋</span>
        Your Learning Journey
      </h2>
      
      {entries.map((entry) => (
        <Card key={entry.id} className="bg-white/80 backdrop-blur-sm shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">{entry.emoji}</span>
              <div className="flex-1">
                <p className="text-gray-800 mb-3">{entry.content}</p>
                
                {entry.tags && entry.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {entry.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="bg-purple-100 text-purple-700 text-xs">
                        <Tag className="w-3 h-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
                
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(entry.date).toLocaleDateString()}
                  </div>
                  <div className="text-xs">
                    {entry.createdAt.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default TILList;
