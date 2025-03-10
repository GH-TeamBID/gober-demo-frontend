
import { useState } from 'react';
import { Filter, ArrowUp, ArrowDown } from 'lucide-react';
import { SortField, SortDirection, SortState, Tender, FilterState } from '@/types/types';
import { Button } from '@/components/ui/button';
import TenderListRow from './TenderListRow';
import FilterPanel from './FilterPanel';

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
      
      {/* Tenders List Table */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, index) => (
            <div
              key={index}
              className="h-24 animate-pulse rounded-lg bg-gray-200 dark:bg-gober-primary-800/50"
            />
          ))}
        </div>
      ) : tenders.length > 0 ? (
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-10 gap-4 py-3 px-4 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <div className="col-span-1 text-sm font-medium text-gray-600 dark:text-gray-300">
              Tender ID
            </div>
            <div className="col-span-2 text-sm font-medium text-gray-600 dark:text-gray-300">
              Title & Description
            </div>
            <div className="col-span-1 text-sm font-medium text-gray-600 dark:text-gray-300">
              Submit On
            </div>
            <div className="col-span-1 text-sm font-medium text-gray-600 dark:text-gray-300">
              No. of Lots
            </div>
            <div className="col-span-1 text-sm font-medium text-gray-600 dark:text-gray-300">
              Organisation
            </div>
            <div className="col-span-1 text-sm font-medium text-gray-600 dark:text-gray-300">
              Budget
            </div>
            <div className="col-span-1 text-sm font-medium text-gray-600 dark:text-gray-300">
              Location
            </div>
            <div className="col-span-1 text-sm font-medium text-gray-600 dark:text-gray-300">
              Contract Type
            </div>
            <div className="col-span-1 text-sm font-medium text-gray-600 dark:text-gray-300">
              Category
            </div>
            <div className="col-span-1 text-sm font-medium text-gray-600 dark:text-gray-300 text-right">
              Actions
            </div>
          </div>
          
          {/* Table Rows */}
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {tenders.map((tender) => (
              <TenderListRow
                key={tender.id}
                tender={tender}
                isSaved={savedTenderIds.includes(tender.id)}
                onToggleSave={onToggleSave}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="text-lg font-medium mb-2">No tenders found</div>
          <p className="text-gray-600 dark:text-gray-400 max-w-md">
            Try adjusting your search or filters to find what you're looking for.
          </p>
        </div>
      )}
      
      {/* Load More Button */}
      {tenders.length > 0 && (
        <div className="flex justify-center mt-8">
          <Button variant="outline" size="lg">
            Load More
          </Button>
        </div>
      )}
      
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
