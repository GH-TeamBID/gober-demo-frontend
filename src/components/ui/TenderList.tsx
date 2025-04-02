import { useState, useEffect, useMemo } from 'react';
import { Filter, Loader2, AlertCircle } from 'lucide-react';
import { SortState, FilterState } from '@/types/types';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import FilterPanel from './FilterPanel';
import TenderResults from './TenderResults';
import { useTenders } from '@/contexts/TendersContext';
import TenderCard from './TenderCard';
import { TenderPreview, TenderParams, fetchTenders } from '@/services/tenderService';
import { useSavedTenders } from '@/hooks/useSavedTenders.tsx';
import { useTranslation } from 'react-i18next';
import React from 'react';

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
  const { t } = useTranslation('ui');

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
  const baseTenders = tendersProp || contextTenders;
  const isLoading = isLoadingProp !== undefined ? isLoadingProp : contextIsLoading;
  const totalTenders = contextTotalTenders || baseTenders.length;
  const hasMore = contextHasMore || false;
  const loadMore = contextLoadMore || (() => Promise.resolve());
  const error = contextError;
  
  // Initialize saved tenders hook - this manages saved state via API
  const { 
    savedTenderIds: savedTenderIdsFromHook,
    toggleSaveTender
  } = useSavedTenders(baseTenders);
  
  // Track whether this is the initial load
  const [initialLoad, setInitialLoad] = useState(true);
  useEffect(() => {
    if (!isLoading && initialLoad) {
      setInitialLoad(false);
    }
  }, [isLoading]);

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Use provided filters or initialize default with more explicit defaults
  const [filters, setFilters] = useState<FilterState>(filtersProp || {
    categories: [],
    states: [],
    status: [],
    dateRange: { from: null, to: null },
    budgetRange: [0, 10000000] as [number, number],
  });
  
  // Track loading state of loadMore
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  // Store local copy of tenders to handle pagination directly
  const [localTenders, setLocalTenders] = useState<TenderPreview[]>([]);
  const [localCurrentPage, setLocalCurrentPage] = useState(1);
  const [localHasMore, setLocalHasMore] = useState(true);
  
  // Sync local tenders with context tenders on initial load and when context changes
  useEffect(() => {
    if (baseTenders.length > 0 && localTenders.length === 0) {
      console.log('Initializing local tenders from context:', baseTenders.length);
      setLocalTenders(baseTenders);
      setLocalCurrentPage(contextParams.page || 1);
      setLocalHasMore(hasMore);
    }
  }, [baseTenders, contextParams.page, hasMore]);
  
  // Handle filter changes - uses server-side filtering via the API
  const handleFilterChange = (newFilters: FilterState) => {
    console.log('TenderList: handleFilterChange called with:', JSON.stringify(newFilters, null, 2));
    
    // Update local filter state
    setFilters(newFilters);
    console.log('TenderList: Local filter state updated');
    
    // Call prop callback if provided
    if (onFilter !== (() => {})) {
      console.log('TenderList: Calling parent onFilter callback');
      onFilter(newFilters);
    }
    
    // Use updateParams from context to trigger server-side filtering
    if (updateParams) {
      console.log('TenderList: Using context API for filtering');
      
      // Map the local FilterState to the API's TenderParams format
      const apiParams: Partial<TenderParams> = {
        // Only include parameters that have values
        categories: newFilters.categories.length > 0 ? newFilters.categories : undefined,
        states: newFilters.states.length > 0 ? newFilters.states : undefined,
        status: newFilters.status.length > 0 ? newFilters.status : undefined,
        
        // Convert Date objects to ISO strings for API
        date_from: newFilters.dateRange.from ? 
          (typeof newFilters.dateRange.from === 'string' ? 
            newFilters.dateRange.from : 
            new Date(newFilters.dateRange.from).toISOString()) 
          : undefined,
        
        date_to: newFilters.dateRange.to ? 
          (typeof newFilters.dateRange.to === 'string' ? 
            newFilters.dateRange.to : 
            new Date(newFilters.dateRange.to).toISOString()) 
          : undefined,
        
        // Only include budget range if it differs from defaults
        budget_min: newFilters.budgetRange[0] > 0 ? newFilters.budgetRange[0] : undefined,
        budget_max: newFilters.budgetRange[1] < 10000000 ? newFilters.budgetRange[1] : undefined,
        
        // Always start with page 1 when changing filters
        page: 1
      };
      
      console.log('TenderList: Constructed API params:', JSON.stringify(apiParams, null, 2));
      
      // This will trigger a new API request with these parameters
      console.log('TenderList: Calling updateParams to trigger API request');
      updateParams(apiParams);
    } else {
      console.log('TenderList: WARNING - updateParams is not available');
      console.log('TenderList: Check if this component is wrapped with TendersProvider');
    }
  };

  // Modified load more function that directly handles pagination
  const handleLoadMore = async () => {
    console.log('🔍 LOAD MORE: handleLoadMore called in TenderList');
    console.log('🔍 LOAD MORE: State - isLoadingMore:', isLoadingMore, 'localHasMore:', localHasMore);
    
    if (isLoadingMore) {
      console.log('🔍 LOAD MORE: Already loading more data, returning early');
      return;
    }
    
    console.log('🔍 LOAD MORE: Setting isLoadingMore to true');
    setIsLoadingMore(true);
    
    try {
      // FORCE A DIRECT API CALL
      // This bypasses any issues with the context's loadMore function
      console.log('🔍 LOAD MORE: Making direct API call regardless of context');
      
      // Determine the next page from our local state
      const nextPage = localCurrentPage + 1;
      console.log(`🔍 LOAD MORE: Directly loading page ${nextPage}`);
      
      const response = await fetchTenders({
        ...contextParams,
        page: nextPage
      });
      
      console.log('🔍 LOAD MORE: Direct API call succeeded!', {
        items: response.items.length,
        total: response.total,
        page: response.page,
        has_next: response.has_next
      });
      
      // Update our local state with the new tenders
      if (response.items.length > 0) {
        console.log('🔍 LOAD MORE: Appending', response.items.length, 'new items to existing', localTenders.length, 'items');
        
        // Combine existing tenders with new ones
        const combined = [...localTenders, ...response.items];
        setLocalTenders(combined);
        
        // Update other local state
        setLocalCurrentPage(nextPage);
        setLocalHasMore(response.has_next);
        
        console.log('🔍 LOAD MORE: Updated local state, now have', combined.length, 'items');
      } else {
        console.log('🔍 LOAD MORE: No more items to load');
        setLocalHasMore(false);
      }
      
      // We don't need to call the context's loadMore anymore since we're managing state ourselves
    } catch (error) {
      console.error('🔍 LOAD MORE: Error in handleLoadMore:', error);
    } finally {
      console.log('🔍 LOAD MORE: Setting isLoadingMore back to false');
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
  
  // Function to completely reset filters
  const handleResetFilters = () => {
    console.log('TenderList: Reset filters called');
    
    const defaultFilters: FilterState = {
      categories: [],
      states: [],
      status: [],
      dateRange: { from: null, to: null },
      budgetRange: [0, 10000000] as [number, number],
    };
    
    console.log('TenderList: Setting filters to default values');
    // Update local state
    setFilters(defaultFilters);
    
    console.log('TenderList: Calling handleFilterChange with default filters');
    // Call handler with default filters
    handleFilterChange(defaultFilters);
    
    // Close filter panel
    setIsFilterOpen(false);
    console.log('TenderList: Closed filter panel');
  };
  
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
  
  // Apply client-side sorting to tenders from context
  const sortedTenders = useMemo(() => {
    // If we have local tenders (from pagination), use those instead of baseTenders
    const tenders = localTenders.length > 0 ? localTenders : baseTenders;
    
    if (!tenders || tenders.length === 0) return [];
    
    console.log('Sorting tenders client-side with:', sort);
    return sortTenders(tenders, sort);
  }, [localTenders, baseTenders, sort]);
  
  // Function to get the current count of loaded tenders and total
  const getTenderCountText = () => {
    const currentCount = localTenders.length > 0 ? localTenders.length : baseTenders.length;
    
    return (
      <span>
        {t('tenderList.showing')} <strong>{currentCount}</strong> 
        {totalTenders > 0 && currentCount < totalTenders && (
          <> {t('tenderList.of')} <strong>{totalTenders}</strong></>
        )} 
        {' ' + t('tenderList.tenders')}
      </span>
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
          <span>{t('tenderList.filters')}</span>
          {getActiveFilterCount() > 0 && (
            <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-gober-accent-500 text-xs text-white">
              {getActiveFilterCount()}
            </span>
          )}
        </Button>
      </div>
      
      {/* Results Count */}
      <div className="text-sm text-gray-600 dark:text-gray-400">
        {isLoading && baseTenders.length === 0 ? (
          t('tenderList.loadingResults')
        ) : error ? (
          <span className="text-red-500">{t('tenderList.errorLoading')}</span>
        ) : (
          getTenderCountText()
        )}
      </div>
      
      {/* Tenders List */}
      <div className="space-y-4">
        {isLoading && !isLoadingMore && baseTenders.length === 0 ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gober-primary-500" />
          </div>
        ) : sortedTenders.length === 0 ? (
          <div className="text-center py-12 border border-dashed rounded-lg border-gray-200 dark:border-gray-700">
            <div className="text-gray-500">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium">{t('tenderList.noResults')}</h3>
              <p className="mt-1 text-sm">{t('tenderList.noResultsDescription')}</p>
              {getActiveFilterCount() > 0 && (
                <button 
                  onClick={handleResetFilters}
                  className="mt-3 text-sm text-gober-accent-500 hover:text-gober-accent-600"
                >
                  {t('tenderList.clearFilters')}
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* TenderResults component */}
            <TenderResults 
              tenders={sortedTenders}
              isLoading={isLoadingMore}
              savedTenderIds={Array.from(savedTenderIdsFromHook)}
              onToggleSave={handleToggleSave}
              sort={sort}
              onSort={onSort}
              onLoadMore={handleLoadMore}
              hasMore={localHasMore}
            />
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
