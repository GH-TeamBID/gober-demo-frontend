import React from 'react';
import { Button } from '@/components/ui/button';
import { SortField, SortState } from '@/types/types';
import { TenderPreview } from '@/services/tenderService';
import TenderCard from './TenderCard';
import { ArrowUp, ArrowDown, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface TenderResultsProps {
  tenders: TenderPreview[];
  isLoading: boolean;
  savedTenderIds: string[];
  onToggleSave: (tenderId: string) => void;
  sort: SortState;
  onSort: (sort: SortState) => void;
  onLoadMore: () => void;
  hasMore?: boolean;
}

const TenderResults = ({
  tenders,
  isLoading,
  savedTenderIds,
  onToggleSave,
  sort,
  onSort,
  onLoadMore,
  hasMore = false
}: TenderResultsProps) => {
  const { t } = useTranslation('ui');
  
  // Convert array to Set for O(1) lookups
  const savedIdsSet = new Set(savedTenderIds);
  
  const handleSort = (field: SortField) => {
    // Add logging to see what's happening
    console.log(`Client-side sorting by ${field}, current sort:`, sort);
    
    // Toggle direction if same field, otherwise default to ascending
    const direction = sort.field === field && sort.direction === 'asc' ? 'desc' : 'asc';
    
    console.log(`Setting new client-side sort: ${field}, ${direction}`);
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

  // Create a consistent header style for non-sortable columns
  const nonSortableHeaderClass = "text-xs font-medium text-gray-600 dark:text-gray-400 flex items-center h-5";

  // Create a wrapper for sortable headers
  const SortableHeader = ({ field, children }: { field: SortField, children: React.ReactNode }) => {
    return (
      <div 
        className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gober-primary-700/50 p-1 rounded flex items-center"
        onClick={() => handleSort(field)}
      >
        <span className={getColumnHeaderClass(field)}>
          {children} {getSortIcon(field)}
        </span>
      </div>
    );
  };

  // Initial load with no tenders
  if (tenders.length === 0 && isLoading) {
    return <div className="space-y-4">
        {[...Array(6)].map((_, index) => <div key={index} className="h-24 animate-pulse rounded-lg bg-gray-200 dark:bg-gober-primary-800/50" />)}
      </div>;
  }
  
  if (tenders.length === 0) {
    return <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="text-lg font-medium mb-2">{t('tenderList.noResults')}</div>
        <p className="text-gray-600 dark:text-gray-400 max-w-md">
          {t('tenderList.noResultsDescription')}
        </p>
      </div>;
  }
  
  return <>
      {/* Column Headers */}
      <div className="hidden md:grid grid-cols-12 gap-4 px-4 bg-gray-50 dark:bg-gober-primary-800/50 rounded-t-lg mb-1 py-[14px] text-bold">
        {/* ID */}
        <div className="col-span-2 sm:col-span-1 flex items-center">
          <SortableHeader field="tender_id">{t('tenderResults.columns.id')}</SortableHeader>
        </div>
        
        {/* Title - reduced width */}
        <div className="col-span-10 sm:col-span-4 md:col-span-3 flex items-center">
          <SortableHeader field="title">{t('tenderResults.columns.title')}</SortableHeader>
        </div>
        
        {/* Submit On */}
        <div className="col-span-4 sm:col-span-2 md:col-span-1 flex items-center">
          <SortableHeader field="submission_date">{t('tenderResults.columns.submitOn')}</SortableHeader>
        </div>
        
        {/* Lots - make sortable */}
        <div className="col-span-4 sm:col-span-1 md:col-span-1 flex items-center">
          <SortableHeader field="n_lots">{t('tenderResults.columns.lots')}</SortableHeader>
        </div>
        
        {/* Organization - make sortable */}
        <div className="col-span-4 sm:col-span-4 md:col-span-2 flex items-center">
          <SortableHeader field="pub_org_name">{t('tenderResults.columns.organization')}</SortableHeader>
        </div>
        
        {/* Budget */}
        <div className="col-span-4 sm:col-span-2 md:col-span-1 flex items-center">
          <SortableHeader field="budget.amount">{t('tenderResults.columns.budget')}</SortableHeader>
        </div>
        
        {/* Location - make sortable */}
        <div className="col-span-4 sm:col-span-2 md:col-span-1 hidden md:flex md:items-center">
          <SortableHeader field="location">{t('tenderResults.columns.location')}</SortableHeader>
        </div>
        
        {/* Contract Type - make sortable */}
        <div className="col-span-4 sm:col-span-2 md:col-span-1 hidden md:flex md:items-center">
          <SortableHeader field="contract_type">{t('tenderResults.columns.type')}</SortableHeader>
        </div>
        
        {/* Category */}
        <div className="col-span-4 sm:col-span-2 md:col-span-1 hidden lg:flex lg:items-center">
          <span className={nonSortableHeaderClass}>
            {t('tenderResults.columns.category')}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        {tenders.map(tender => (
          <TenderCard 
            key={tender.tender_hash || 'missing-key'} 
            tender={tender} 
            isSaved={tender.tender_hash ? savedIdsSet.has(tender.tender_hash) : false} 
            onToggleSave={onToggleSave} 
            showHeaders={false}
            sortField={sort.field} 
          />
        ))}
        
        {/* Loading placeholders only at the bottom when loading more tenders */}
        {isLoading && tenders.length > 0 && (
          <div className="space-y-2 mt-4">
            {[...Array(3)].map((_, index) => (
              <div key={`loading-more-${index}`} className="h-24 animate-pulse rounded-lg bg-gray-200 dark:bg-gober-primary-800/50" />
            ))}
          </div>
        )}
      </div>
      
      <div className="flex justify-center mt-8">
        <Button 
          variant="outline" 
          size="lg" 
          onClick={() => {
            console.log('📱 UI: Load More button clicked in TenderResults');
            console.log('📱 UI: Props state - hasMore:', hasMore, 'isLoading:', isLoading, 'tenders.length:', tenders.length);
            
            // Call the provided onLoadMore function
            onLoadMore();
          }}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('tenderList.loading')}
            </>
          ) : (
            <>
              {t('tenderList.loadMore')}
              <span className="ml-2 text-xs text-gray-400"></span>
            </>
          )}
        </Button>
      </div>
    </>;
};

export default TenderResults;