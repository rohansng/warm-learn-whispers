
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from "@/integrations/supabase/client";
import { getRandomEmoji } from '../utils/emojis';
import CollapsedView from './AddEntryCard/CollapsedView';
import EntryForm from './AddEntryCard/EntryForm';

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
    return <CollapsedView onExpand={() => setIsCollapsed(false)} />;
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
        <EntryForm
          content={content}
          setContent={setContent}
          tags={tags}
          newTag={newTag}
          setNewTag={setNewTag}
          addTag={addTag}
          removeTag={removeTag}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit}
          onKeyPress={handleKeyPress}
        />
      </CardContent>
    </Card>
  );
};

export default AddEntryCard;
