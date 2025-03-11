
import { useState } from 'react';
import { Filter } from 'lucide-react';
import { SortState, Tender, FilterState } from '@/types/types';
import { Button } from '@/components/ui/button';
import FilterPanel from './FilterPanel';
import TenderSortHeader from './TenderSortHeader';
import TenderResults from './TenderResults';

interface TenderListProps {
  tenders: Tender[];
  isLoading: boolean;
  savedTenderIds: string[];
  sort: SortState;
  filters: FilterState;
  onToggleSave: (tenderId: string) => void;
  onSort: (sort: SortState) => void;
  onFilter: (filters: FilterState) => void;
}

const TenderList = ({
  tenders,
  isLoading,
  savedTenderIds,
  sort,
  filters,
  onToggleSave,
  onSort,
  onFilter,
}: TenderListProps) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  const getActiveFilterCount = () => {
    let count = 0;
    
    if (filters.categories.length > 0) count++;
    if (filters.states.length > 0) count++;
    if (filters.status.length > 0) count++;
    if (filters.dateRange.from || filters.dateRange.to) count++;
    if (
      filters.budgetRange[0] > 0 ||
      filters.budgetRange[1] < 10000000
    ) {
      count++;
    }
    
    return count;
  };
  
  return (
    <div className="space-y-6">
      {/* Sorting and Filter Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <TenderSortHeader sort={sort} onSort={onSort} />
        
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1"
          onClick={() => setIsFilterOpen(true)}
        >
          <Filter className="h-4 w-4" />
          <span>Filters</span>
          {getActiveFilterCount() > 0 && (
            <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-gober-accent-500 text-xs text-white">
              {getActiveFilterCount()}
            </span>
          )}
        </Button>
      </div>
      
      {/* Results Count */}
      <div className="text-sm text-gray-600 dark:text-gray-400">
        {isLoading ? (
          'Loading results...'
        ) : (
          <span>
            Found <strong>{tenders.length}</strong> tenders
          </span>
        )}
      </div>
      
      {/* Tenders List */}
      <TenderResults 
        tenders={tenders}
        isLoading={isLoading}
        savedTenderIds={savedTenderIds}
        onToggleSave={onToggleSave}
      />
      
      {/* Filter Panel */}
      <FilterPanel
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={filters}
        onApplyFilters={onFilter}
      />
    </div>
  );
};

export default TenderList;
