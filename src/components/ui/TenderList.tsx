import { useState, useEffect, useMemo, useCallback } from 'react';
import { Filter, Loader2, AlertCircle } from 'lucide-react';
import { SortState, FilterState } from '@/types/types';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import FilterPanel from './FilterPanel';
import TenderResults from './TenderResults';
import { useTenders } from '@/contexts/TendersContext';
import { TenderPreview, TenderParams } from '@/services/tenderService';
import { useTranslation } from 'react-i18next';
import React from 'react';

const TenderList = () => {
  const { t } = useTranslation('ui');

  const {
    tenders,
    isLoading,
    totalTenders,
    hasMore,
    loadMore,
    error,
    currentParams,
    updateParams,
    resetParams,
    sort,
    setSort,
    toggleSaveTender,
    isTenderSaved
  } = useTenders();

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  const currentUiFilters: FilterState = useMemo(() => ({
    categories: currentParams.categories || [],
    states: currentParams.states || [],
    status: currentParams.status || [],
    dateRange: {
      from: currentParams.date_from || null,
      to: currentParams.date_to || null
    },
    budgetRange: [
      currentParams.budget_min || 0,
      currentParams.budget_max || 10000000
    ] as [number, number]
  }), [currentParams]);

  const handleFilterChange = useCallback((newFiltersFromPanel: FilterState) => {
    console.log('TenderList: Applying filters from panel:', JSON.stringify(newFiltersFromPanel, null, 2));

    const apiParams: Partial<TenderParams> = {
      categories: newFiltersFromPanel.categories.length > 0 ? newFiltersFromPanel.categories : undefined,
      states: newFiltersFromPanel.states.length > 0 ? newFiltersFromPanel.states : undefined,
      status: newFiltersFromPanel.status.length > 0 ? newFiltersFromPanel.status : undefined,
      date_from: newFiltersFromPanel.dateRange.from ? 
        (typeof newFiltersFromPanel.dateRange.from === 'string' ? 
          newFiltersFromPanel.dateRange.from : 
          new Date(newFiltersFromPanel.dateRange.from).toISOString()) 
        : undefined,
      date_to: newFiltersFromPanel.dateRange.to ? 
        (typeof newFiltersFromPanel.dateRange.to === 'string' ? 
          newFiltersFromPanel.dateRange.to : 
          new Date(newFiltersFromPanel.dateRange.to).toISOString()) 
        : undefined,
      budget_min: newFiltersFromPanel.budgetRange[0] > 0 ? newFiltersFromPanel.budgetRange[0] : undefined,
      budget_max: newFiltersFromPanel.budgetRange[1] < 10000000 ? newFiltersFromPanel.budgetRange[1] : undefined,
    };

    console.log('TenderList: Calling context updateParams with:', JSON.stringify(apiParams, null, 2));
    updateParams(apiParams);

    setIsFilterOpen(false);

  }, [updateParams]);

  const handleLoadMore = useCallback(() => {
    console.log('TenderList: Load More button clicked - calling context loadMore()');
    loadMore();
  }, [loadMore]);

  const getActiveFilterCount = useCallback(() => {
    let count = 0;
    if (currentParams.categories && currentParams.categories.length > 0) count++;
    if (currentParams.states && currentParams.states.length > 0) count++;
    if (currentParams.status && currentParams.status.length > 0) count++;
    if (currentParams.date_from || currentParams.date_to) count++;
    if (
      (currentParams.budget_min && currentParams.budget_min > 0) ||
      (currentParams.budget_max && currentParams.budget_max < 10000000)
    ) {
      count++;
    }
    return count;
  }, [currentParams]);

  const handleResetFilters = useCallback(() => {
    console.log('TenderList: Reset filters button clicked - calling context resetParams()');
    resetParams();
    setIsFilterOpen(false);
  }, [resetParams]);

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

  const getTenderCountText = useCallback(() => {
    const currentCount = tenders.length;
    return (
      <span>
        {t('tenderList.showing')} <strong>{currentCount}</strong>
        {totalTenders > 0 && currentCount < totalTenders && (
          <> {t('tenderList.of')} <strong>{totalTenders}</strong></>
        )}
        {' ' + t('tenderList.tenders')}
      </span>
    );
  }, [t, tenders, totalTenders]);

  const isInitialLoading = isLoading && tenders.length === 0;
  const isLoadingMore = isLoading && tenders.length > 0;

  return (
    <div className="space-y-6">
      {renderErrorMessage()}

      <div className="flex flex-wrap items-center justify-end gap-4">
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1"
          onClick={() => setIsFilterOpen(true)}
          disabled={isInitialLoading}
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
      
      <div className="text-sm text-gray-600 dark:text-gray-400">
        {isInitialLoading ? (
          t('tenderList.loadingResults')
        ) : error ? (
          <span className="text-red-500">{t('tenderList.errorLoading')}</span>
        ) : (
          getTenderCountText()
        )}
      </div>
      
      <div className="space-y-4">
        {isInitialLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gober-primary-500" />
          </div>
        ) : tenders.length === 0 && !isLoading ? (
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
          <TenderResults
            tenders={tenders}
            isLoading={isLoadingMore}
            savedTenderIds={tenders.filter(t => isTenderSaved(t.tender_hash)).map(t => t.tender_hash)}
            onToggleSave={toggleSaveTender}
            sort={sort}
            onSort={setSort}
            onLoadMore={handleLoadMore}
            hasMore={hasMore}
          />
        )}
      </div>
      
      <FilterPanel
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={currentUiFilters}
        onApplyFilters={handleFilterChange}
      />
    </div>
  );
};

export default TenderList;
