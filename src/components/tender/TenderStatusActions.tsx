
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TenderStatusActionsProps {
  status: string;
  tenderId: string;
  isSaved: boolean;
  onToggleSave: (id: string) => void;
  getStatusClass: (status: string) => string;
}

const TenderStatusActions = ({ 
  status, 
  tenderId, 
  isSaved, 
  onToggleSave,
  getStatusClass 
}: TenderStatusActionsProps) => {
  return (
    <div className="flex items-center gap-2">
      <span className={`status-badge ${getStatusClass(status)}`}>
        {status}
      </span>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 rounded-full"
        onClick={() => onToggleSave(tenderId)}
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
