import { useState, useEffect, useMemo } from 'react';
import { Filter, Loader2, AlertCircle } from 'lucide-react';
import { SortState, FilterState } from '@/types/types';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import FilterPanel from './FilterPanel';
import TenderResults from './TenderResults';
import { useTenders } from '@/contexts/TendersContext';
import TenderCard from './TenderCard';
import { TenderPreview } from '@/services/tenderService';
import { useSavedTenders } from '@/hooks/useSavedTenders.tsx';

// Updated interface to only use TenderPreview
interface TenderListProps {
  tenders?: TenderPreview[]; 
  isLoading?: boolean;
  savedTenderIds?: Set<string>;
  onToggleSave?: (tenderId: string) => void;
  sort?: SortState;
  onSort?: (sort: SortState) => void;
  filters?: FilterState;
  onFilter?: (filters: FilterState) => void;
}

// Helper function for client-side sorting
const sortTenders = (tenders: TenderPreview[], sort: SortState): TenderPreview[] => {
  // Create a new array to avoid mutating the original
  const sortedTenders = [...tenders];
  
  // Sort the tenders based on the sort field and direction
  return sortedTenders.sort((a, b) => {
    let valueA: any;
    let valueB: any;
    
    // Handle nested fields like budget.amount
    if (sort.field === 'budget.amount') {
      valueA = a.budget?.amount;
      valueB = b.budget?.amount;
    } else {
      // Access the field using bracket notation
      valueA = a[sort.field as keyof TenderPreview];
      valueB = b[sort.field as keyof TenderPreview];
    }
    
    // Handle undefined or null values (sort them to the end)
    if (valueA === undefined || valueA === null) return 1;
    if (valueB === undefined || valueB === null) return -1;
    
    // Use appropriate comparison based on field type
    if (typeof valueA === 'string' && typeof valueB === 'string') {
      return sort.direction === 'asc' 
        ? valueA.localeCompare(valueB)
        : valueB.localeCompare(valueA);
    }
    
    // For numbers and dates
    return sort.direction === 'asc'
      ? valueA - valueB
      : valueB - valueA;
  });
};

const TenderList = ({
  tenders: tendersProp,
  isLoading: isLoadingProp,
  savedTenderIds = new Set(),
  onToggleSave = () => {},
  sort = { field: 'submission_date', direction: 'desc' },
  onSort = () => {},
  filters: filtersProp,
  onFilter = () => {},
}: TenderListProps) => {
  // Use context when TenderList is used within TendersProvider
  const {
    tenders: contextTenders = [],
    isLoading: contextIsLoading = false,
    totalTenders: contextTotalTenders = 0,
    hasMore: contextHasMore = false,
    loadMore: contextLoadMore = () => Promise.resolve(),
    error: contextError = null,
    currentParams: contextParams = {},
    updateParams
  } = useTenders();
  
  // Use props if provided, otherwise use context
  const tenders = tendersProp || contextTenders;
  const isLoading = isLoadingProp !== undefined ? isLoadingProp : contextIsLoading;
  const totalTenders = contextTotalTenders || tenders.length;
  const hasMore = contextHasMore || false;
  const loadMore = contextLoadMore;
  const error = contextError;
  
  // Initialize saved tenders hook - this manages saved state via API
  const { 
    savedTenderIds: savedTenderIdsFromHook,
    toggleSaveTender
  } = useSavedTenders(tenders);
  
  // Track whether this is the initial load
  const [initialLoad, setInitialLoad] = useState(true);
  useEffect(() => {
    if (!isLoading && initialLoad) {
      setInitialLoad(false);
    }
  }, [isLoading]);

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Use provided filters or initialize default
  const [filters, setFilters] = useState<FilterState>(filtersProp || {
    categories: [],
    states: [],
    status: [],
    dateRange: { from: null, to: null },
    budgetRange: [0, 10000000],
  });
  
  // Track loading state of loadMore
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  const handleLoadMore = async () => {
    setIsLoadingMore(true);
    try {
      await loadMore();
    } catch (error) {
      console.error('Error loading more tenders:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };
  
  // Toggle save handler that uses our API-connected hook
  const handleToggleSave = (tenderId: string) => {
    console.log('TenderList: handling toggle save for', tenderId);
    
    // If we have an external onToggleSave handler, use that instead of our hook
    if (onToggleSave !== (() => {})) {
      console.log('TenderList: delegating to parent onToggleSave');
      onToggleSave(tenderId);
    } else {
      // Only call our hook's toggleSaveTender if there's no external handler
      console.log('TenderList: using local toggleSaveTender');
      toggleSaveTender(tenderId);
    }
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
  
  // Handle filter changes by updating context params or calling onFilter
  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    
    // Call prop callback if provided
    onFilter(newFilters);
    
    // If using context, also update context params
    if (!tendersProp && updateParams) {
      // Map the filters to the API params format
      const apiParams = {
        ...contextParams,
        // Add filter mappings here with proper type conversions
        categories: newFilters.categories,
        states: newFilters.states,
        status: newFilters.status,
        // Convert Date objects to ISO strings or null for API
        date_from: newFilters.dateRange.from ? 
          (typeof newFilters.dateRange.from === 'string' ? 
            newFilters.dateRange.from : 
            new Date(newFilters.dateRange.from).toISOString()) 
          : null,
        date_to: newFilters.dateRange.to ? 
          (typeof newFilters.dateRange.to === 'string' ? 
            newFilters.dateRange.to : 
            new Date(newFilters.dateRange.to).toISOString()) 
          : null,
        budget_min: newFilters.budgetRange[0],
        budget_max: newFilters.budgetRange[1]
      };
      
      updateParams(apiParams);
    }
  };
  
  // Apply client-side sorting
  const sortedTenders = useMemo(() => {
    if (!tenders || tenders.length === 0) return [];
    
    console.log('Sorting tenders client-side with:', sort);
    return sortTenders(tenders, sort);
  }, [tenders, sort]);
  
  const renderErrorMessage = () => {
    if (!error) return null;
    
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {typeof error === 'string' 
            ? error 
            : 'An error occurred while loading tenders. Please try again later.'}
        </AlertDescription>
      </Alert>
    );
  };
  
  return (
    <div className="space-y-6">
      {/* Error message */}
      {renderErrorMessage()}
    
      {/* Filter Controls */}
      <div className="flex flex-wrap items-center justify-end gap-4">
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1"
          onClick={() => setIsFilterOpen(true)}
          disabled={isLoading && initialLoad}
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
        {isLoading && tenders.length === 0 ? (
          'Loading results...'
        ) : error ? (
          <span className="text-red-500">Error loading tenders</span>
        ) : (
          <span>
            Found <strong>{totalTenders}</strong> tenders
          </span>
        )}
      </div>
      
      {/* Tenders List */}
      <div className="space-y-4">
        {isLoading && tenders.length === 0 ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gober-primary-500" />
          </div>
        ) : tenders.length === 0 ? (
          <div className="text-center py-12 border border-dashed rounded-lg border-gray-200 dark:border-gray-700">
            <div className="text-gray-500">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium">No tenders found</h3>
              <p className="mt-1 text-sm">No tenders match your current criteria.</p>
              {getActiveFilterCount() > 0 && (
                <button 
                  onClick={() => handleFilterChange({
                    categories: [],
                    states: [],
                    status: [],
                    dateRange: { from: null, to: null },
                    budgetRange: [0, 10000000],
                  })}
                  className="mt-3 text-sm text-gober-accent-500 hover:text-gober-accent-600"
                >
                  Clear all filters
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* TenderResults component */}
            <TenderResults 
              tenders={sortedTenders}
              isLoading={isLoading}
              savedTenderIds={Array.from(savedTenderIdsFromHook)}
              onToggleSave={handleToggleSave}
              sort={sort}
              onSort={onSort}
            />
            
            {/* Load More Button - only show when using context and there's more data */}
            {!tendersProp && hasMore && (
              <div className="flex justify-center mt-8">
                <Button 
                  onClick={handleLoadMore} 
                  disabled={isLoading || isLoadingMore}
                  variant="outline"
                >
                  {isLoadingMore ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading more...
                    </>
                  ) : isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Load More'
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Filter Panel */}
      <FilterPanel
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={filters}
        onApplyFilters={handleFilterChange}
      />
    </div>
  );
};

export default TenderList;
