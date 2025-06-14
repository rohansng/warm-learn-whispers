
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shuffle, Calendar, Tag } from 'lucide-react';
import { getRandomPastEntryFromDB } from '@/utils/supabaseStorage';
import { TILEntry } from '../types';

interface RandomTILProps {
  userId: string;
}

const RandomTIL: React.FC<RandomTILProps> = ({ userId }) => {
  const [randomEntry, setRandomEntry] = useState<TILEntry | null>(null);
  const [loading, setLoading] = useState(false);

  const loadRandomEntry = async () => {
    setLoading(true);
    try {
      const entry = await getRandomPastEntryFromDB(userId);
      setRandomEntry(entry);
    } catch (error) {
      console.error('Error loading random entry:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRandomEntry();
  }, [userId]);

  return (
    <Card className="bg-white/80 backdrop-blur-sm shadow-md">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎲</span>
            Memory Lane
          </div>
          <Button
            onClick={loadRandomEntry}
            variant="outline"
            size="sm"
            disabled={loading}
            className="border-purple-300 text-purple-700 hover:bg-purple-50"
          >
            {loading ? (
              <div className="w-4 h-4 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
            ) : (
              <Shuffle className="w-4 h-4" />
            )}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {randomEntry ? (
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-2xl">{randomEntry.emoji}</span>
              <div className="flex-1">
                <p className="text-gray-800 mb-3">{randomEntry.content}</p>
                
                {randomEntry.tags && randomEntry.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {randomEntry.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="bg-purple-100 text-purple-700 text-xs">
                        <Tag className="w-3 h-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
                
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Calendar className="w-3 h-3" />
                  {new Date(randomEntry.date).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="text-3xl mb-2">🌱</div>
            <p className="text-gray-600 text-sm">
              No past entries to show yet. Keep learning and come back later!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RandomTIL;
