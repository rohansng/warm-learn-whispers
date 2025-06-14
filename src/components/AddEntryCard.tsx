
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
    <Card className="glass-card p-8 shadow-2xl border border-crimson-500/30 glow-red">
      <div className="flex items-center space-x-3 mb-6">
        <Plus className="w-6 h-6 text-cherry-400 animate-pulse" />
        <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-crimson-300 bg-clip-text text-transparent">
          What did you learn today?
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share your learning moment... What new insight, skill, or knowledge did you gain today?"
            className="min-h-[140px] bg-dark-800/50 border-2 border-crimson-500/30 focus:border-cherry-500 rounded-xl resize-none text-white placeholder-gray-400 text-lg leading-relaxed hover-glow"
            disabled={isSubmitting}
          />
        </div>

        <div className="flex flex-wrap gap-3 mb-4">
          {tags.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center px-4 py-2 rounded-full text-sm bg-gradient-to-r from-crimson-500/20 to-cherry-500/20 text-cherry-300 border border-crimson-500/30 cursor-pointer hover:bg-gradient-to-r hover:from-crimson-500/30 hover:to-cherry-500/30 transition-all duration-300 hover:scale-105"
              onClick={() => removeTag(tag)}
            >
              {tag} ×
            </span>
          ))}
        </div>

        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Tag className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              placeholder="Add tags (e.g., coding, design, life)"
              className="pl-12 bg-dark-800/50 border-2 border-crimson-500/30 focus:border-cherry-500 rounded-xl text-white placeholder-gray-400 hover-glow"
              disabled={isSubmitting}
            />
          </div>
          <Button
            type="button"
            onClick={addTag}
            variant="outline"
            className="border-crimson-500/50 text-crimson-300 hover:bg-crimson-500/20 hover:text-cherry-300 px-6"
            disabled={!tagInput.trim() || isSubmitting}
          >
            Add Tag
          </Button>
        </div>

        <Button
          type="submit"
          disabled={!content.trim() || isSubmitting}
          className="w-full bg-gradient-button hover:glow-red-intense text-white font-bold py-4 rounded-xl shadow-xl transform transition-all duration-300 hover:scale-105 disabled:opacity-50 text-lg"
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent mr-3"></div>
              Saving your learning...
            </div>
          ) : (
            "💾 Save Today's Learning"
          )}
        </Button>
      </form>

      <p className="text-xs text-gray-400 mt-6 text-center">
        ✨ You can add one entry per day. Make it count!
      </p>
    </Card>
  );
};

export default AddEntryCard;
