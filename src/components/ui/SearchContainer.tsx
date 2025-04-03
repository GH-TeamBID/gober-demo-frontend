import React, { useEffect } from 'react';
import SearchBar from './SearchBar';
import TenderList from './TenderList';
import { useTenders } from '@/hooks/useTenders';
import { useTranslation } from 'react-i18next';

/**
 * SearchContainer component that integrates the SearchBar with TenderList
 * and manages search state and API interaction
 */
const SearchContainer: React.FC = () => {
  const { t } = useTranslation('ui');
  const {
    filteredTenders,
    isLoading,
    savedTenders,
    searchQuery,
    filters,
    sort,
    setSearchQuery,
    setFilters,
    setSort,
    toggleSaveTender,
    error,
    isTenderSaved,
    refreshTenders,
    allTenders
  } = useTenders();

  // Create set of savedTender ids for TenderList
  const savedTenderIdsSet = new Set(savedTenders.map(tender => tender.tender_hash));
  
  // Log when search results are received
  useEffect(() => {
    console.log(`SearchContainer: Received ${filteredTenders.length} search results for query "${searchQuery}"`);
  }, [filteredTenders, searchQuery]);

  // Get total count from allTenders or filteredTenders, ensure it's a number
  const totalCount = Number(allTenders.length || filteredTenders.length || 0);

  return (
    <div className="space-y-6">
      <div className="max-w-3xl mx-auto mb-8">
        <SearchBar
          value={searchQuery}
          onSearch={setSearchQuery}
          placeholder={t('search.placeholder')}
          autoSearchDelay={500}
        />
        
        
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {t('tenderList.errorLoading')}: {error}
        </div>
      )}

      <TenderList
        tenders={filteredTenders}
        isLoading={isLoading}
        savedTenderIds={savedTenderIdsSet}
        sort={sort}
        filters={filters}
        onToggleSave={toggleSaveTender}
        onSort={setSort}
        onFilter={setFilters}
      />
    </div>
  );
};

export default SearchContainer; 