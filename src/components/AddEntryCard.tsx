
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from "@/integrations/supabase/client";
import { getRandomEmoji } from '../utils/emojis';

interface AddEntryCardProps {
  username: string;
  userId?: string;
  onEntryAdded: () => void;
}

const AddEntryCard: React.FC<AddEntryCardProps> = ({ username, userId, onEntryAdded }) => {
  const [content, setContent] = useState('');
  const [newTag, setNewTag] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
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

      // Clear form
      setContent('');
      setTags([]);
      setNewTag('');
      
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
            <div className="flex space-x-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Add a tag (e.g., programming, cooking, life)"
                className="flex-1 border-lavender-200 focus:border-lavender-400"
                disabled={isSubmitting}
              />
              <Button
                type="button"
                onClick={addTag}
                variant="outline"
                size="icon"
                className="border-lavender-300 text-lavender-600 hover:bg-lavender-50"
                disabled={isSubmitting || !newTag.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="bg-lavender-100 text-lavender-700 hover:bg-lavender-200 px-3 py-1"
                  >
                    {tag}
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
              "Save Today's Learning 🚀"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AddEntryCard;
