
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus } from 'lucide-react';

interface CollapsedViewProps {
  onExpand: () => void;
}

const CollapsedView: React.FC<CollapsedViewProps> = ({ onExpand }) => {
  return (
    <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-lavender-200 border-2">
      <CardContent className="p-6">
        <Button
          onClick={onExpand}
          className="w-full bg-gradient-to-r from-lavender-500 to-blush-500 hover:from-lavender-600 hover:to-blush-600 text-white font-semibold py-6 px-6 rounded-lg shadow-lg transform transition-all duration-300 hover:scale-105"
        >
          <Plus className="h-6 w-6 mr-2" />
          Add New Learning Entry
        </Button>
      </CardContent>
    </Card>
  );
};

export default CollapsedView;
