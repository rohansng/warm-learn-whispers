
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { TILEntry } from '../types';
import { Calendar, Tag, Edit, Trash2, Undo } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface TILListProps {
  entries: TILEntry[];
  onEntryUpdate: (updatedEntry: TILEntry) => void;
  onEntryDelete: (entryId: string) => void;
}

interface EditingEntry {
  id: string;
  content: string;
  tags: string[];
}

const TILList: React.FC<TILListProps> = ({ entries, onEntryUpdate, onEntryDelete }) => {
  const [editingEntry, setEditingEntry] = useState<EditingEntry | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deletedEntries, setDeletedEntries] = useState<TILEntry[]>([]);
  const { toast } = useToast();

  if (entries.length === 0) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm shadow-md">
        <CardContent className="p-8 text-center">
          <div className="text-4xl mb-4">📝</div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No entries yet</h3>
          <p className="text-gray-600">Start documenting your learning journey!</p>
        </CardContent>
      </Card>
    );
  }

  const handleEdit = (entry: TILEntry) => {
    setEditingEntry({
      id: entry.id,
      content: entry.content,
      tags: entry.tags
    });
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingEntry) return;

    try {
      const { data, error } = await supabase
        .from('notes')
        .update({
          content: editingEntry.content,
          tags: editingEntry.tags,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingEntry.id)
        .select()
        .single();

      if (error) throw error;

      const updatedEntry: TILEntry = {
        ...entries.find(e => e.id === editingEntry.id)!,
        content: editingEntry.content,
        tags: editingEntry.tags
      };

      onEntryUpdate(updatedEntry);
      setIsEditDialogOpen(false);
      setEditingEntry(null);
      
      toast({
        title: "Entry Updated",
        description: "Your learning entry has been updated successfully.",
      });
    } catch (error) {
      console.error('Error updating entry:', error);
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Failed to update the entry. Please try again.",
      });
    }
  };

  const handleDelete = async (entry: TILEntry) => {
    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', entry.id);

      if (error) throw error;

      setDeletedEntries([...deletedEntries, entry]);
      onEntryDelete(entry.id);
      
      toast({
        title: "Entry Deleted",
        description: "Your learning entry has been deleted.",
        action: (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleUndo(entry)}
          >
            <Undo className="w-4 h-4 mr-1" />
            Undo
          </Button>
        ),
      });
    } catch (error) {
      console.error('Error deleting entry:', error);
      toast({
        variant: "destructive",
        title: "Delete Failed",
        description: "Failed to delete the entry. Please try again.",
      });
    }
  };

  const handleUndo = async (entry: TILEntry) => {
    try {
      const { data, error } = await supabase
        .from('notes')
        .insert({
          id: entry.id,
          user_id: entry.id.split('-')[0], // This is a simplified approach
          content: entry.content,
          tags: entry.tags,
          date: entry.date,
          emoji: entry.emoji,
          created_at: entry.createdAt.toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      setDeletedEntries(deletedEntries.filter(e => e.id !== entry.id));
      onEntryUpdate(entry);
      
      toast({
        title: "Entry Restored",
        description: "Your learning entry has been restored.",
      });
    } catch (error) {
      console.error('Error restoring entry:', error);
      toast({
        variant: "destructive",
        title: "Restore Failed",
        description: "Failed to restore the entry. Please try again.",
      });
    }
  };

  const addTag = (tag: string) => {
    if (editingEntry && tag && !editingEntry.tags.includes(tag)) {
      setEditingEntry({
        ...editingEntry,
        tags: [...editingEntry.tags, tag]
      });
    }
  };

  const removeTag = (tagToRemove: string) => {
    if (editingEntry) {
      setEditingEntry({
        ...editingEntry,
        tags: editingEntry.tags.filter(tag => tag !== tagToRemove)
      });
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
        <span className="text-2xl">📋</span>
        Your Learning Journey
      </h2>
      
      {entries.map((entry) => (
        <Card key={entry.id} className="bg-white/80 backdrop-blur-sm shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">{entry.emoji}</span>
              <div className="flex-1">
                <p className="text-gray-800 mb-3">{entry.content}</p>
                
                {entry.tags && entry.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {entry.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="bg-purple-100 text-purple-700 text-xs">
                        <Tag className="w-3 h-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(entry.date).toLocaleDateString()}
                    </div>
                    <div className="text-xs">
                      {entry.createdAt.toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(entry)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(entry)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Learning Entry</DialogTitle>
          </DialogHeader>
          {editingEntry && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Content</label>
                <Textarea
                  value={editingEntry.content}
                  onChange={(e) => setEditingEntry({...editingEntry, content: e.target.value})}
                  placeholder="What did you learn?"
                  rows={4}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Tags</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {editingEntry.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="bg-purple-100 text-purple-700">
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="ml-1 text-purple-500 hover:text-purple-700"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
                <Input
                  placeholder="Add a tag and press Enter"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addTag(e.currentTarget.value);
                      e.currentTarget.value = '';
                    }
                  }}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveEdit}>
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TILList;
