
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Plus } from 'lucide-react';
import { getTagEmoji } from '../../utils/emojis';
import { DEFAULT_TAGS } from '../../constants/tags';

interface TagManagerProps {
  tags: string[];
  newTag: string;
  setNewTag: (tag: string) => void;
  addTag: (tag?: string) => void;
  removeTag: (tag: string) => void;
  isSubmitting: boolean;
  onKeyPress: (e: React.KeyboardEvent) => void;
}

const TagManager: React.FC<TagManagerProps> = ({
  tags,
  newTag,
  setNewTag,
  addTag,
  removeTag,
  isSubmitting,
  onKeyPress
}) => {
  const handleDefaultTagSelect = (value: string) => {
    addTag(value);
  };

  return (
    <div className="space-y-3">
      {/* Default tags selector */}
      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">
          Quick Tags (optional)
        </label>
        <Select onValueChange={handleDefaultTagSelect} disabled={isSubmitting}>
          <SelectTrigger className="border-lavender-200 focus:border-lavender-400">
            <SelectValue placeholder="Choose from popular tags..." />
          </SelectTrigger>
          <SelectContent>
            {DEFAULT_TAGS.filter(tag => !tags.includes(tag)).map((tag) => (
              <SelectItem key={tag} value={tag}>
                {getTagEmoji(tag)} {tag}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Custom tag input */}
      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">
          Create Custom Tag
        </label>
        <div className="flex space-x-2">
          <Input
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyPress={onKeyPress}
            placeholder="Create your own tag..."
            className="flex-1 border-lavender-200 focus:border-lavender-400"
            disabled={isSubmitting}
          />
          <Button
            type="button"
            onClick={() => addTag()}
            variant="outline"
            size="icon"
            className="border-lavender-300 text-lavender-600 hover:bg-lavender-50"
            disabled={isSubmitting || !newTag.trim()}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Selected tags display */}
      {tags.length > 0 && (
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Selected Tags
          </label>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-purple-500 text-white border border-purple-600 hover:bg-purple-600 transition-colors"
              >
                {getTagEmoji(tag)} {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="ml-1 hover:text-purple-200 transition-colors p-0.5 rounded-full hover:bg-purple-600"
                  disabled={isSubmitting}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TagManager;
