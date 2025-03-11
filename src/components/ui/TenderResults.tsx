import React from 'react';
import { Button } from '@/components/ui/button';
import { Tender, SortField, SortState } from '@/types/types';
import TenderCard from './TenderCard';
import { ArrowUp, ArrowDown } from 'lucide-react';
interface TenderResultsProps {
  tenders: Tender[];
  isLoading: boolean;
  savedTenderIds: string[];
  onToggleSave: (tenderId: string) => void;
  sort: SortState;
  onSort: (sort: SortState) => void;
}
const TenderResults = ({
  tenders,
  isLoading,
  savedTenderIds,
  onToggleSave,
  sort,
  onSort
}: TenderResultsProps) => {
  const handleSort = (field: SortField) => {
    const direction = sort.field === field && sort.direction === 'asc' ? 'desc' : 'asc';
    onSort({
      field,
      direction
    });
  };
  const getSortIcon = (field: SortField) => {
    if (sort.field !== field) return null;
    return sort.direction === 'asc' ? <ArrowUp className="h-4 w-4 ml-1" /> : <ArrowDown className="h-4 w-4 ml-1" />;
  };
  const getColumnHeaderClass = (field: SortField) => {
    return `text-xs font-medium cursor-pointer hover:text-gober-accent-500 flex items-center ${sort.field === field ? 'text-gober-accent-500' : 'text-gray-600 dark:text-gray-400'}`;
  };
  if (isLoading) {
    return <div className="space-y-4">
        {[...Array(6)].map((_, index) => <div key={index} className="h-24 animate-pulse rounded-lg bg-gray-200 dark:bg-gober-primary-800/50" />)}
      </div>;
  }
  if (tenders.length === 0) {
    return <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="text-lg font-medium mb-2">No tenders found</div>
        <p className="text-gray-600 dark:text-gray-400 max-w-md">
          Try adjusting your search or filters to find what you're looking for.
        </p>
      </div>;
  }
  return <>
      {/* Column Headers */}
      <div className="hidden md:grid grid-cols-12 gap-4 px-4 bg-gray-50 dark:bg-gober-primary-800/50 rounded-t-lg mb-1 py-[14px] text-bold">
        {/* ID */}
        <div className="col-span-1 flex justify-start" onClick={() => handleSort('id')}>
          <span className={getColumnHeaderClass('id')}>
            ID {getSortIcon('id')}
          </span>
        </div>
        
        {/* Title */}
        <div className="col-span-4 flex justify-start" onClick={() => handleSort('title')}>
          <span className={getColumnHeaderClass('title')}>
            Title {getSortIcon('title')}
          </span>
        </div>
        
        {/* Submit On */}
        <div className="col-span-1 flex justify-start" onClick={() => handleSort('submitOn')}>
          <span className={getColumnHeaderClass('submitOn')}>
            Submit On {getSortIcon('submitOn')}
          </span>
        </div>
        
        {/* Lots */}
        <div className="col-span-1 flex justify-start">
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
            Lots
          </span>
        </div>
        
        {/* Organization */}
        <div className="col-span-1 flex justify-start">
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
            Organization
          </span>
        </div>
        
        {/* Budget */}
        <div className="col-span-1 flex justify-start" onClick={() => handleSort('budget')}>
          <span className={getColumnHeaderClass('budget')}>
            Budget {getSortIcon('budget')}
          </span>
        </div>
        
        {/* Location */}
        <div className="col-span-1 flex justify-start">
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
            Location
          </span>
        </div>
        
        {/* Contract Type */}
        <div className="col-span-1 flex justify-start">
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Type</span>
        </div>
        
        {/* Category */}
        <div className="col-span-1 flex justify-start">
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
            Category
          </span>
        </div>
      </div>

      <div className="space-y-2">
        {tenders.map(tender => <TenderCard key={tender.id} tender={tender} isSaved={savedTenderIds.includes(tender.id)} onToggleSave={onToggleSave} showHeaders={false} />)}
      </div>
      
      <div className="flex justify-center mt-8">
        <Button variant="outline" size="lg">
          Load More
        </Button>
      </div>
    </>;
};
export default TenderResults;