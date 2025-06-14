
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { TILEntry } from '../types';
import { saveEntry } from '../utils/localStorage';
import { getCategoryEmoji } from '../utils/emojis';
import { Plus, Tag } from 'lucide-react';

interface AddEntryCardProps {
  username: string;
  onEntryAdded: () => void;
}

const AddEntryCard: React.FC<AddEntryCardProps> = ({ username, onEntryAdded }) => {
  const [content, setContent] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
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
    if (!content.trim()) return;

    setIsSubmitting(true);

    const entry: TILEntry = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      username,
      content: content.trim(),
      tags: tags,
      date: new Date().toISOString(),
      emoji: getCategoryEmoji(tags),
      createdAt: new Date()
    };

    saveEntry(entry);
    
    // Reset form
    setContent('');
    setTags([]);
    setTagInput('');
    
    setTimeout(() => {
      setIsSubmitting(false);
      onEntryAdded();
    }, 500);
  };

  return (
    <Card className="p-6 bg-gradient-card backdrop-blur-sm border-2 border-lavender-200 shadow-lg">
      <div className="flex items-center space-x-2 mb-4">
        <Plus className="w-5 h-5 text-lavender-600" />
        <h2 className="text-xl font-semibold text-gray-800">What did you learn today?</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share your learning moment... What new insight, skill, or knowledge did you gain today?"
            className="min-h-[120px] border-2 border-lavender-200 focus:border-lavender-400 rounded-xl resize-none"
            disabled={isSubmitting}
          />
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {tags.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-lavender-100 text-lavender-800 cursor-pointer hover:bg-lavender-200 transition-colors"
              onClick={() => removeTag(tag)}
            >
              {tag} ×
            </span>
          ))}
        </div>

        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              placeholder="Add tags (e.g., coding, design, life)"
              className="pl-10 border-2 border-lavender-200 focus:border-lavender-400 rounded-xl"
              disabled={isSubmitting}
            />
          </div>
          <Button
            type="button"
            onClick={addTag}
            variant="outline"
            className="border-lavender-300 text-lavender-700 hover:bg-lavender-50"
            disabled={!tagInput.trim() || isSubmitting}
          >
            Add Tag
          </Button>
        </div>

        <Button
          type="submit"
          disabled={!content.trim() || isSubmitting}
          className="w-full bg-gradient-to-r from-lavender-500 to-blush-500 hover:from-lavender-600 hover:to-blush-600 text-white font-semibold py-3 rounded-xl shadow-lg transform transition-all duration-300 hover:scale-105 disabled:opacity-50"
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

      <p className="text-xs text-gray-500 mt-4 text-center">
        ✨ You can add one entry per day. Make it count!
      </p>
    </Card>
  );
};

export default AddEntryCard;
