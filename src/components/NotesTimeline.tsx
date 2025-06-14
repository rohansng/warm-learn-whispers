
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { Edit, Trash2, Filter } from 'lucide-react';
import { Note } from './NotesManager';

interface NotesTimelineProps {
  notes: Note[];
  onUpdateNote: (id: string, content: string, tags: string[], emoji: string) => Promise<void>;
  onDeleteNote: (id: string) => Promise<void>;
}

const NotesTimeline: React.FC<NotesTimelineProps> = ({ notes, onUpdateNote, onDeleteNote }) => {
  const [filterTag, setFilterTag] = useState<string>('');
  const [editingNote, setEditingNote] = useState<string | null>(null);

  // Get all unique tags from notes
  const allTags = Array.from(new Set(notes.flatMap(note => note.tags))).sort();

  // Filter notes by selected tag
  const filteredNotes = filterTag 
    ? notes.filter(note => note.tags.includes(filterTag))
    : notes;

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      await onDeleteNote(id);
    }
  };

  if (notes.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📚</div>
        <h3 className="text-xl font-semibold text-white mb-2">No learning moments yet</h3>
        <p className="text-red-200">Start your journey by adding your first learning note!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-2xl font-bold text-white">Your Learning Timeline</h2>
        
        {/* Tag Filter */}
        {allTags.length > 0 && (
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-red-300" />
            <select
              value={filterTag}
              onChange={(e) => setFilterTag(e.target.value)}
              className="bg-black/30 border border-red-500/30 text-white rounded-lg px-3 py-1 text-sm focus:border-red-400"
            >
              <option value="">All notes ({notes.length})</option>
              {allTags.map(tag => (
                <option key={tag} value={tag}>
                  {tag} ({notes.filter(note => note.tags.includes(tag)).length})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {filteredNotes.map((note, index) => (
          <Card
            key={note.id}
            className="p-6 bg-black/40 backdrop-blur-lg border border-red-500/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] animate-fade-in-up"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <span className="text-3xl">{note.emoji}</span>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-3">
                  <time className="text-sm font-medium text-red-400">
                    {new Date(note.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </time>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-red-300">
                      {formatDistanceToNow(new Date(note.created_at), { addSuffix: true })}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditingNote(editingNote === note.id ? null : note.id)}
                      className="text-red-300 hover:text-red-200 hover:bg-red-500/10"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(note.id)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <p className="text-white leading-relaxed mb-3 whitespace-pre-wrap">
                  {note.content}
                </p>
                
                {note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {note.tags.map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className={`inline-block px-2 py-1 text-xs rounded-full border cursor-pointer transition-colors ${
                          filterTag === tag
                            ? 'bg-red-600/30 text-red-200 border-red-400'
                            : 'bg-red-600/10 text-red-300 border-red-500/30 hover:bg-red-600/20'
                        }`}
                        onClick={() => setFilterTag(filterTag === tag ? '' : tag)}
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

      {filteredNotes.length === 0 && filterTag && (
        <div className="text-center py-8">
          <p className="text-red-200">No notes found with tag "{filterTag}"</p>
          <Button
            onClick={() => setFilterTag('')}
            variant="outline"
            className="mt-2 border-red-500/30 text-red-200 hover:bg-red-500/10"
          >
            Clear filter
          </Button>
        </div>
      )}
    </div>
  );
};

export default NotesTimeline;
