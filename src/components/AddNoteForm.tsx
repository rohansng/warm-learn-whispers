
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { X, Save } from 'lucide-react';

interface AddNoteFormProps {
  onSubmit: (content: string, tags: string[], emoji: string) => void;
  onCancel: () => void;
}

const emojis = ['📚', '💡', '🔥', '⚡', '🎯', '🚀', '💪', '🎨', '🔬', '🌟'];

const AddNoteForm = ({ onSubmit, onCancel }: AddNoteFormProps) => {
  const [content, setContent] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('📚');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    const tags = tagsInput
      .split(',')
      .map(tag => tag.trim().replace('#', ''))
      .filter(tag => tag.length > 0);

    onSubmit(content.trim(), tags, selectedEmoji);
  };

  return (
    <Card className="bg-white/5 backdrop-blur-lg border-white/10">
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">What did you learn today?</h3>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onCancel}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Choose an emoji</label>
            <div className="flex flex-wrap gap-2">
              {emojis.map(emoji => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setSelectedEmoji(emoji)}
                  className={`p-2 rounded-lg text-2xl transition-all ${
                    selectedEmoji === emoji
                      ? 'bg-purple-600 scale-110'
                      : 'bg-white/10 hover:bg-white/20'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Your learning note</label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Describe what you learned today..."
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 min-h-[120px]"
              autoFocus
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Tags (optional)</label>
            <Input
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="coding, life, soft-skills"
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
            />
            <p className="text-xs text-gray-400">Separate tags with commas</p>
          </div>
          
          <div className="flex gap-2 pt-2">
            <Button
              type="submit"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              disabled={!content.trim()}
            >
              <Save className="w-4 h-4 mr-2" />
              Save Note
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="border-white/20 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AddNoteForm;
