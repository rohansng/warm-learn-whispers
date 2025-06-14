
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TILEntry } from '../types';
import { getProfileByUsername, createProfile, saveNote } from '../utils/supabaseStorage';
import { getCategoryEmoji } from '../utils/emojis';
import { Plus, Tag, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AddEntryCardProps {
  username: string;
  onEntryAdded: () => void;
}

const DEFAULT_TAGS = [
  { name: '#coding', emoji: '💻' },
  { name: '#design', emoji: '🎨' },
  { name: '#productivity', emoji: '⚡' },
  { name: '#mindfulness', emoji: '🧘' },
  { name: '#reading', emoji: '📚' },
  { name: '#fitness', emoji: '💪' },
  { name: '#cooking', emoji: '👨‍🍳' },
  { name: '#travel', emoji: '✈️' },
  { name: '#language', emoji: '🗣️' },
  { name: '#business', emoji: '💼' },
  { name: '#science', emoji: '🔬' },
  { name: '#music', emoji: '🎵' }
];

const AddEntryCard: React.FC<AddEntryCardProps> = ({ username, onEntryAdded }) => {
  const [content, setContent] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const addTag = (tagName?: string) => {
    const newTagName = tagName || tagInput.trim();
    if (newTagName && !tags.includes(newTagName)) {
      const formattedTag = newTagName.startsWith('#') ? newTagName : `#${newTagName}`;
      setTags([...tags, formattedTag]);
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

    try {
      console.log('Getting profile for username:', username);
      
      // Get user profile, create if it doesn't exist
      let profile = await getProfileByUsername(username);
      
      if (!profile) {
        console.log('Profile not found, creating new profile for:', username);
        profile = await createProfile(username);
        
        if (!profile) {
          console.error('Failed to create profile for:', username);
          toast({
            title: "Error",
            description: "Failed to create user profile. Please try again.",
            variant: "destructive"
          });
          setIsSubmitting(false);
          return;
        }
        console.log('Successfully created profile:', profile);
      }

      console.log('Using profile:', profile);

      const entry = {
        content: content.trim(),
        tags: tags,
        date: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
        emoji: getCategoryEmoji(tags)
      };

      console.log('Saving note with entry:', entry);
      const savedNote = await saveNote(profile.id, entry);
      
      if (savedNote) {
        console.log('Note saved successfully:', savedNote);
        toast({
          title: "Success! 🎉",
          description: "Your learning moment has been saved!",
        });
        
        // Reset form
        setContent('');
        setTags([]);
        setTagInput('');
        onEntryAdded();
      } else {
        throw new Error('Failed to save note');
      }
    } catch (error) {
      console.error('Error saving entry:', error);
      toast({
        title: "Error",
        description: "Failed to save your entry. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
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

        {/* Popular Tags Section */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-lavender-600" />
            <span className="text-sm font-medium text-gray-700">Popular tags:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {DEFAULT_TAGS.map((tag) => (
              <Badge
                key={tag.name}
                variant="outline"
                className="cursor-pointer hover:bg-lavender-100 border-lavender-300 text-lavender-700 transition-colors"
                onClick={() => addTag(tag.name)}
              >
                <span className="mr-1">{tag.emoji}</span>
                {tag.name}
              </Badge>
            ))}
          </div>
        </div>

        {/* Selected Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {tags.map((tag, index) => (
              <Badge
                key={index}
                className="cursor-pointer bg-lavender-100 text-lavender-800 hover:bg-lavender-200 transition-colors"
                onClick={() => removeTag(tag)}
              >
                {tag} ×
              </Badge>
            ))}
          </div>
        )}

        {/* Custom Tag Input */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              placeholder="Add custom tags..."
              className="pl-10 border-2 border-lavender-200 focus:border-lavender-400 rounded-xl"
              disabled={isSubmitting}
            />
          </div>
          <Button
            type="button"
            onClick={() => addTag()}
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
