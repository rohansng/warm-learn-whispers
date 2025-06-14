
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
    <Card className="p-6 bg-gradient-card backdrop-blur-sm border border-red-600/20 shadow-lg hover:shadow-red-600/20 hover:shadow-2xl transition-all duration-300">
      <div className="flex items-center space-x-2 mb-4">
        <Plus className="w-5 h-5 text-red-500" />
        <h2 className="text-xl font-semibold text-white">What did you learn today?</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share your learning moment... What new insight, skill, or knowledge did you gain today?"
            className="min-h-[120px] border-2 border-red-600/30 focus:border-red-600 rounded-xl resize-none bg-black/50 text-white placeholder:text-gray-500"
            disabled={isSubmitting}
          />
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {tags.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-red-600/20 text-red-400 cursor-pointer hover:bg-red-600/30 transition-colors border border-red-600/30"
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
              className="pl-10 border-2 border-red-600/30 focus:border-red-600 rounded-xl bg-black/50 text-white placeholder:text-gray-500"
              disabled={isSubmitting}
            />
          </div>
          <Button
            type="button"
            onClick={addTag}
            variant="outline"
            className="border-red-600/50 text-red-400 hover:bg-red-600/20 hover:text-red-300"
            disabled={!tagInput.trim() || isSubmitting}
          >
            Add Tag
          </Button>
        </div>

        <Button
          type="submit"
          disabled={!content.trim() || isSubmitting}
          className="w-full bg-gradient-red hover:bg-red-700 text-white font-semibold py-3 rounded-xl shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-red-600/40 hover:shadow-2xl disabled:opacity-50"
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

      <p className="text-xs text-gray-400 mt-4 text-center">
        ✨ You can add one entry per day. Make it count!
      </p>
    </Card>
  );
};

export default AddEntryCard;
