
import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import TagManager from './TagManager';

interface EntryFormProps {
  content: string;
  setContent: (content: string) => void;
  tags: string[];
  newTag: string;
  setNewTag: (tag: string) => void;
  addTag: (tag?: string) => void;
  removeTag: (tag: string) => void;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
}

const EntryForm: React.FC<EntryFormProps> = ({
  content,
  setContent,
  tags,
  newTag,
  setNewTag,
  addTag,
  removeTag,
  isSubmitting,
  onSubmit,
  onKeyPress
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Today I learned that..."
          className="min-h-[120px] text-base border-lavender-200 focus:border-lavender-400 resize-none"
          disabled={isSubmitting}
        />
      </div>
      
      <TagManager
        tags={tags}
        newTag={newTag}
        setNewTag={setNewTag}
        addTag={addTag}
        removeTag={removeTag}
        isSubmitting={isSubmitting}
        onKeyPress={onKeyPress}
      />
      
      <Button
        type="submit"
        disabled={!content.trim() || isSubmitting}
        className="w-full bg-gradient-to-r from-lavender-500 to-blush-500 hover:from-lavender-600 hover:to-blush-600 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transform transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      >
        {isSubmitting ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
            Saving your moment...
          </div>
        ) : (
          "Save Learning Moment 🚀"
        )}
      </Button>
    </form>
  );
};

export default EntryForm;
