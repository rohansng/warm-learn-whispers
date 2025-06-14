
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Plus, Tag, Smile } from 'lucide-react';

interface AddNoteFormProps {
  onAddNote: (content: string, tags: string[], emoji: string) => Promise<void>;
  disabled?: boolean;
}

const EMOJI_OPTIONS = ['📚', '💡', '🚀', '🎯', '⭐', '🔥', '💻', '🎨', '🌟', '📝'];

const AddNoteForm: React.FC<AddNoteFormProps> = ({ onAddNote, disabled }) => {
  const [content, setContent] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [selectedEmoji, setSelectedEmoji] = useState('📚');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      const newTag = tagInput.trim().startsWith('#') ? tagInput.trim() : `#${tagInput.trim()}`;
      setTags([...tags, newTag]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onAddNote(content.trim(), tags, selectedEmoji);
      setContent('');
      setTags([]);
      setTagInput('');
      setSelectedEmoji('📚');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-6 bg-black/40 backdrop-blur-lg border border-red-500/20 shadow-2xl">
      <div className="flex items-center space-x-2 mb-4">
        <Plus className="w-5 h-5 text-red-400" />
        <h2 className="text-xl font-semibold text-white">What did you learn today?</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share your learning moment... What new insight, skill, or knowledge did you gain today?"
          className="min-h-[120px] bg-black/30 border-red-500/30 text-white placeholder-red-200 focus:border-red-400 resize-none"
          disabled={disabled || isSubmitting}
        />

        {/* Emoji Selection */}
        <div>
          <label className="block text-sm font-medium text-red-200 mb-2">
            <Smile className="inline w-4 h-4 mr-1" />
            Choose an emoji
          </label>
          <div className="flex flex-wrap gap-2">
            {EMOJI_OPTIONS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => setSelectedEmoji(emoji)}
                className={`p-2 rounded-lg text-2xl transition-all ${
                  selectedEmoji === emoji
                    ? 'bg-red-600 scale-110'
                    : 'bg-black/30 hover:bg-red-500/20'
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {tags.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-red-600/20 text-red-200 border border-red-500/30 cursor-pointer hover:bg-red-600/30 transition-colors"
              onClick={() => removeTag(tag)}
            >
              {tag} ×
            </span>
          ))}
        </div>

        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-red-300" />
            <Input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              placeholder="Add tags (e.g., coding, design, life)"
              className="pl-10 bg-black/30 border-red-500/30 text-white placeholder-red-200 focus:border-red-400"
              disabled={disabled || isSubmitting}
            />
          </div>
          <Button
            type="button"
            onClick={addTag}
            variant="outline"
            className="border-red-500/30 text-red-200 hover:bg-red-500/10 hover:border-red-400"
            disabled={!tagInput.trim() || disabled || isSubmitting}
          >
            Add Tag
          </Button>
        </div>

        <Button
          type="submit"
          disabled={!content.trim() || disabled || isSubmitting}
          className="w-full bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white font-semibold py-3 rounded-lg shadow-lg transform transition-all duration-300 hover:scale-105 disabled:opacity-50"
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
              Saving your learning...
            </div>
          ) : (
            "💾 Save Today's Learning"
          )}
        </Button>
      </form>
    </Card>
  );
};

export default AddNoteForm;
