
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from "@/integrations/supabase/client";
import { getRandomEmoji, getTagEmoji } from '../utils/emojis';

interface AddEntryCardProps {
  username: string;
  userId?: string;
  onEntryAdded: () => void;
}

// Default tags to suggest to users with emojis
const DEFAULT_TAGS = [
  'programming', 'design', 'learning', 'work', 'life', 'health', 'cooking',
  'books', 'science', 'technology', 'creativity', 'productivity', 'mindfulness',
  'fitness', 'travel', 'music', 'art', 'business', 'finance', 'communication'
];

const AddEntryCard: React.FC<AddEntryCardProps> = ({ username, userId, onEntryAdded }) => {
  const [content, setContent] = useState('');
  const [newTag, setNewTag] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { toast } = useToast();

  const addTag = (tagToAdd?: string) => {
    const tag = tagToAdd || newTag.trim();
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      addTag();
    }
  };

  const handleDefaultTagSelect = (value: string) => {
    addTag(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      toast({
        variant: "destructive",
        title: "Content Required",
        description: "Please enter what you learned today.",
      });
      return;
    }

    if (!userId) {
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: "You must be logged in to save entries.",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const today = new Date().toISOString().split('T')[0];
      const randomEmoji = getRandomEmoji();
      
      const { data, error } = await supabase
        .from('notes')
        .insert([{
          user_id: userId,
          content: content.trim(),
          tags: tags,
          date: today,
          emoji: randomEmoji
        }])
        .select()
        .single();

      if (error) {
        console.error('Error saving note:', error);
        toast({
          variant: "destructive",
          title: "Save Failed",
          description: "Failed to save your entry. Please try again.",
        });
        return;
      }

      // Clear form and collapse
      setContent('');
      setTags([]);
      setNewTag('');
      setIsCollapsed(true);
      
      toast({
        title: "Entry Saved! 🎉",
        description: "Your learning moment has been captured.",
      });
      
      onEntryAdded();
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Collapsed view with plus icon
  if (isCollapsed) {
    return (
      <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-lavender-200 border-2">
        <CardContent className="p-6">
          <Button
            onClick={() => setIsCollapsed(false)}
            className="w-full bg-gradient-to-r from-lavender-500 to-blush-500 hover:from-lavender-600 hover:to-blush-600 text-white font-semibold py-6 px-6 rounded-lg shadow-lg transform transition-all duration-300 hover:scale-105"
          >
            <Plus className="h-6 w-6 mr-2" />
            Add New Learning Entry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-lavender-200 border-2">
      <CardHeader>
        <CardTitle className="text-xl text-gray-800 flex items-center">
          <span className="text-2xl mr-2">💡</span>
          What did you learn today?
        </CardTitle>
        <CardDescription className="text-gray-600">
          Capture your daily learning moment and add some tags to organize it.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Today I learned that..."
              className="min-h-[120px] text-base border-lavender-200 focus:border-lavender-400 resize-none"
              disabled={isSubmitting}
            />
          </div>
          
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
                  onKeyPress={handleKeyPress}
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
                    <Badge
                      key={index}
                      variant="secondary"
                      className="bg-lavender-100 text-lavender-700 hover:bg-lavender-200 px-3 py-1"
                    >
                      {getTagEmoji(tag)} {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-2 hover:text-lavender-900"
                        disabled={isSubmitting}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
          
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
      </CardContent>
    </Card>
  );
};

export default AddEntryCard;
