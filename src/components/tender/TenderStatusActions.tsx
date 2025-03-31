import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toggleSaveTender } from '@/services/documentService';
import { useState } from 'react';

interface TenderStatusActionsProps {
  tenderId: string;
  isSaved: boolean;
  onToggleSave?: (id: string) => void;
  getStatusClass: (status: string) => string;
  status?: string;
}

const TenderStatusActions = ({ 
  tenderId, 
  isSaved: initialSaved, 
  onToggleSave,
  getStatusClass,
  status = '' 
}: TenderStatusActionsProps) => {
  const [isSaved, setIsSaved] = useState(initialSaved);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggleSave = async () => {
    try {
      setIsLoading(true);
      
      // Call our service method - we only care about it completing successfully
      await toggleSaveTender(tenderId, isSaved);
      
      // Toggle the state locally after successful server response
      const newSavedState = !isSaved;
      setIsSaved(newSavedState);
      
      // Still call the parent handler if provided
      if (onToggleSave) {
        onToggleSave(tenderId);
      }
    } catch (error) {
      console.error('Error toggling tender save status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span className={`status-badge ${getStatusClass(status)}`}>
        {status}
      </span>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 rounded-full"
        onClick={handleToggleSave}
        disabled={isLoading}
      >
        <Heart
          className={`h-5 w-5 transition-colors ${
            isSaved
              ? 'fill-gober-accent-500 text-gober-accent-500'
              : 'text-gray-400 hover:text-gober-accent-500'
          }`}
        />
        <span className="sr-only">
          {isSaved ? 'Unsave' : 'Save'} tender
        </span>
      </Button>
    </div>
  );
};

export default TenderStatusActions;
