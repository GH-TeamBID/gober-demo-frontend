
import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SortField, SortDirection, SortState } from '@/types/types';

interface TenderSortHeaderProps {
  sort: SortState;
  onSort: (sort: SortState) => void;
}

const TenderSortHeader = ({ sort, onSort }: TenderSortHeaderProps) => {
  const handleSort = (field: SortField) => {
    const direction: SortDirection =
      sort.field === field && sort.direction === 'asc' ? 'desc' : 'asc';
    onSort({ field, direction });
  };
  
  const getSortIcon = (field: SortField) => {
    if (sort.field !== field) return null;
    
    return sort.direction === 'asc' ? (
      <ArrowUp className="h-4 w-4 ml-1" />
    ) : (
      <ArrowDown className="h-4 w-4 ml-1" />
    );
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
        Sort by:
      </span>
      <div className="flex flex-wrap gap-2">
        <Button
          variant="ghost"
          size="sm"
          className={`flex items-center ${
            sort.field === 'budget'
              ? 'text-gober-accent-500 font-medium'
              : 'text-gray-600 dark:text-gray-400'
          }`}
          onClick={() => handleSort('budget')}
        >
          Budget
          {getSortIcon('budget')}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={`flex items-center ${
            sort.field === 'submitOn'
              ? 'text-gober-accent-500 font-medium'
              : 'text-gray-600 dark:text-gray-400'
          }`}
          onClick={() => handleSort('submitOn')}
        >
          Submit On
          {getSortIcon('submitOn')}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={`flex items-center ${
            sort.field === 'updatedOn'
              ? 'text-gober-accent-500 font-medium'
              : 'text-gray-600 dark:text-gray-400'
          }`}
          onClick={() => handleSort('updatedOn')}
        >
          Updated On
          {getSortIcon('updatedOn')}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={`flex items-center ${
            sort.field === 'title'
              ? 'text-gober-accent-500 font-medium'
              : 'text-gray-600 dark:text-gray-400'
          }`}
          onClick={() => handleSort('title')}
        >
          Title
          {getSortIcon('title')}
        </Button>
      </div>
    </div>
  );
};

export default TenderSortHeader;
