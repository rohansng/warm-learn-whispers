
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Tag, X } from 'lucide-react';
import { saveNote } from '@/utils/supabaseStorage';
import { TILEntry } from '../types';
import { useToast } from '@/hooks/use-toast';

interface TILFormProps {
  userId: string;
  username: string;
  onEntryAdded: (entry: TILEntry) => void;
}

const TILForm: React.FC<TILFormProps> = ({ userId, username, onEntryAdded }) => {
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [emoji, setEmoji] = useState('📚');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      const entryData = {
        content: content.trim(),
        tags,
        date: new Date().toISOString().split('T')[0],
        emoji
      };

      const savedNote = await saveNote(userId, entryData);
      
      if (savedNote) {
        const newEntry: TILEntry = {
          id: savedNote.id,
          username,
          content: entryData.content,
          tags: entryData.tags,
          date: entryData.date,
          emoji: entryData.emoji,
          createdAt: new Date(savedNote.created_at)
        };

        onEntryAdded(newEntry);
        
        // Reset form
        setContent('');
        setTags([]);
        setEmoji('📚');
        
        toast({
          title: "Entry Added!",
          description: "Your learning moment has been saved.",
        });
      }
    } catch (error) {
      console.error('Error saving entry:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save your entry. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <span className="text-2xl">{emoji}</span>
          What did you learn today?
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your learning moment..."
              className="min-h-[120px] resize-none border-gray-200 focus:border-purple-300"
              disabled={isSubmitting}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {tags.map(tag => (
              <Badge key={tag} variant="secondary" className="bg-purple-100 text-purple-700">
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-1 text-purple-500 hover:text-purple-700"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>

          <div className="flex gap-2">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
              placeholder="Add a tag..."
              className="flex-1"
              disabled={isSubmitting}
            />
            <Button
              type="button"
              onClick={handleAddTag}
              variant="outline"
              size="sm"
              disabled={!newTag.trim() || isSubmitting}
            >
              <Tag className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex gap-1">
              {['📚', '💡', '🎯', '🔥', '✨', '🚀'].map(emojiOption => (
                <button
                  key={emojiOption}
                  type="button"
                  onClick={() => setEmoji(emojiOption)}
                  className={`text-2xl p-2 rounded-lg transition-all ${
                    emoji === emojiOption ? 'bg-purple-100 scale-110' : 'hover:bg-gray-100'
                  }`}
                  disabled={isSubmitting}
                >
                  {emojiOption}
                </button>
              ))}
            </div>
            
            <Button 
              type="submit" 
              disabled={!content.trim() || isSubmitting}
              className="bg-purple-500 hover:bg-purple-600"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <PlusCircle className="w-4 h-4 mr-2" />
              )}
              {isSubmitting ? 'Saving...' : 'Add Entry'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default TILForm;
