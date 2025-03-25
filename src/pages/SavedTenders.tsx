import { useState } from 'react';
import Layout from '@/components/layout/Layout';
import TenderList from '@/components/ui/TenderList';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { SortState, FilterState } from '@/types/types';
import { useTenders } from '@/contexts/TendersContext';

const SavedTendersContent = () => {
  // Use global state from TendersProvider instead of local hook
  const {
    savedTenders,
    isLoading,
    error,
    toggleSaveTender,
    refreshSavedTenders
  } = useTenders();
  
  // Local UI state
  const [sort, setSort] = useState<SortState>({ 
    field: 'submission_date', 
    direction: 'desc' 
  });
  
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    states: [],
    status: [],
    dateRange: { from: null, to: null },
    budgetRange: [0, 10000000] as [number, number],
  });
  
  // State for manual refresh
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Create a Set of saved tender IDs for the TenderList
  const savedTenderIdsSet = new Set(
    savedTenders
      .map(tender => tender.tender_hash)
      .filter((hash): hash is string => typeof hash === 'string')
  );
  
  // Handlers for sort and filter
  const handleSort = (newSort: SortState) => {
    setSort(newSort);
  };
  
  const handleFilter = (newFilters: FilterState) => {
    setFilters(newFilters);
  };
  
  // Manual refresh handler
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshSavedTenders();
    } finally {
      setIsRefreshing(false);
    }
  };
  
  // Count how many tenders are still loading details
  const loadingTendersCount = savedTenders.filter(
    tender => tender.isLoading
  ).length;
  
  return (
    <Layout>
      <div className="page-container">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">Back</span>
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-gober-primary-900 dark:text-white">
              My Saved Tenders
            </h1>
          </div>
          
          {/* Refresh button */}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isLoading || isRefreshing}
            className="flex items-center gap-1"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
        </div>
        
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription className="flex justify-between items-center">
              <span>{error}</span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefresh}
                className="mt-2 bg-white text-red-600 hover:bg-red-50"
              >
                Try Again
              </Button>
            </AlertDescription>
          </Alert>
        )}
        
        {/* Initial loading state - nothing to show yet */}
        {isLoading && savedTenders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-gober-primary-500 mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading your saved tenders...</p>
          </div>
        ) : savedTenders.length > 0 ? (
          <>
            {/* Show loading progress for individual tenders */}
            {loadingTendersCount > 0 && (
              <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-md mb-4 flex justify-between items-center">
                <div className="flex items-center">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span>Loading details for {loadingTendersCount} tenders...</span>
                </div>
                <span className="text-xs">
                  {savedTenders.length - loadingTendersCount} of {savedTenders.length} loaded
                </span>
              </div>
            )}
            
            <TenderList
              tenders={savedTenders}
              isLoading={false}  
              savedTenderIds={savedTenderIdsSet}
              onToggleSave={toggleSaveTender}
              sort={sort}
              filters={filters}
              onSort={handleSort}
              onFilter={handleFilter}
            />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="text-lg font-medium mb-2">No saved tenders</div>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mb-6">
              You haven't saved any tenders yet. Browse tenders and click the heart icon to save them.
            </p>
            <Link to="/">
              <Button className="bg-gober-accent-500 hover:bg-gober-accent-600">
                Browse Tenders
              </Button>
            </Link>
          </div>
        )}
      </div>
    </Layout>
  );
};

// Wrap the component with TendersProvider
import { TendersProvider } from '@/contexts/TendersContext';

const SavedTenders = () => {
  return (
    <TendersProvider>
      <SavedTendersContent />
    </TendersProvider>
  );
};

export default SavedTenders;
