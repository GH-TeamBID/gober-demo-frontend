
import { format } from 'date-fns';
import { Heart, SquarePen, CheckCircle2 } from 'lucide-react';
import { Tender } from '@/types/types';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface TenderListRowProps {
  tender: Tender;
  isSaved: boolean;
  onToggleSave: (tenderId: string) => void;
}

const TenderListRow = ({ tender, isSaved, onToggleSave }: TenderListRowProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      maximumFractionDigits: 0,
    }).format(value);
  };
  
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd MMM, yyyy');
  };
  
  return (
    <div className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
      <div className="grid grid-cols-10 gap-4 py-4 px-4">
        {/* Tender ID */}
        <div className="col-span-1 flex items-center">
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {tender.id.replace('T-', '')}
          </span>
        </div>
        
        {/* Title & Description */}
        <div className="col-span-2">
          <Link to={`/tender/${tender.id}`} className="group">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white group-hover:text-gober-accent-500">
              {tender.title}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">
              {tender.description}
            </p>
          </Link>
        </div>
        
        {/* Submit On */}
        <div className="col-span-1 flex items-center">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {formatDate(tender.submitOn)}
          </span>
        </div>
        
        {/* No. of Lots */}
        <div className="col-span-1 flex items-center">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {tender.lots}
          </span>
        </div>
        
        {/* Organisation */}
        <div className="col-span-1 flex items-center">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {tender.organisation}
          </span>
        </div>
        
        {/* Budget */}
        <div className="col-span-1 flex items-center">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {formatCurrency(tender.budget)}
          </span>
        </div>
        
        {/* Location */}
        <div className="col-span-1 flex items-center">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {tender.location}
          </span>
        </div>
        
        {/* Contract Type */}
        <div className="col-span-1 flex items-center">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {tender.contractType}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Simplified Procedure
            </span>
          </div>
        </div>
        
        {/* Category */}
        <div className="col-span-1 flex items-center">
          <div className="flex flex-col">
            <span className="text-sm text-gray-900 dark:text-gray-100">
              {tender.category}
            </span>
          </div>
        </div>
        
        {/* Actions */}
        <div className="col-span-1 flex items-center justify-end space-x-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={() => onToggleSave(tender.id)}
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
          
          <Link to={`/tender/${tender.id}`} className="inline-block">
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
              <SquarePen className="h-5 w-5 text-gray-400 hover:text-gober-accent-500" />
              <span className="sr-only">View tender details</span>
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Status Row */}
      <div className="bg-gray-50 dark:bg-gray-800/30 py-2 px-4 flex items-center justify-between">
        <div className="flex items-center">
          <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
            Status: {tender.status}
          </span>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Updated On: {tender.statusIndicator?.ago || '15 hours ago'}
        </div>
      </div>
    </div>
  );
};

export default TenderListRow;
