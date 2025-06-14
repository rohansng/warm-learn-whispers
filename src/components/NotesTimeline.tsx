
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Note } from '@/types/auth';
import { formatDistanceToNow } from 'date-fns';
import { Calendar, Tag } from 'lucide-react';

interface NotesTimelineProps {
  notes: Note[];
}

const NotesTimeline = ({ notes }: NotesTimelineProps) => {
  if (notes.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📚</div>
        <h3 className="text-xl font-semibold text-white mb-2">No notes yet</h3>
        <p className="text-gray-300">Start your learning journey by adding your first note!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Your Learning Timeline</h2>
      
      <div className="space-y-4">
        {notes.map((note, index) => (
          <Card
            key={note.id}
            className="bg-white/5 backdrop-blur-lg border-white/10 hover:bg-white/10 transition-all duration-300"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <span className="text-3xl">{note.emoji}</span>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2 text-purple-300">
                      <Calendar className="w-4 h-4" />
                      <time className="text-sm font-medium">
                        {new Date(note.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </time>
                    </div>
                    <span className="text-xs text-gray-400">
                      {formatDistanceToNow(new Date(note.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  
                  <div className="prose prose-invert max-w-none">
                    <p className="text-white leading-relaxed whitespace-pre-wrap">
                      {note.content}
                    </p>
                  </div>
                  
                  {note.tags.length > 0 && (
                    <div className="flex items-center flex-wrap gap-2 mt-3">
                      <Tag className="w-4 h-4 text-purple-400" />
                      {note.tags.map((tag, tagIndex) => (
                        <span
                          key={tagIndex}
                          className="inline-block px-2 py-1 text-xs rounded-full bg-purple-600/20 text-purple-300 border border-purple-600/30"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default NotesTimeline;
