
import { useState, useCallback } from 'react';
import { Tender } from '@/types/types';
import { MOCK_TENDERS, CATEGORIES, LOCATIONS, STATUSES } from '@/data/mockTenders';
import { useTenderSearch } from './useTenderSearch';
import { useTenderFilter } from './useTenderFilter';
import { useTenderSort } from './useTenderSort';
import { useSavedTenders } from './useSavedTenders';
import { useToast } from '@/components/ui/use-toast';

export function useTenders() {
  const { toast } = useToast();
  
  // State for all tenders
  const [tenders, setTenders] = useState<Tender[]>(MOCK_TENDERS);
  
  // Get search functionality
  const { searchQuery, isLoading, setSearchQuery } = useTenderSearch();
  
  // Get filter functionality
  const { filters, setFilters, filteredTenders } = useTenderFilter(tenders, searchQuery);
  
  // Get sort functionality
  const { sort, setSort, sortedTenders } = useTenderSort(filteredTenders);
  
  // Get saved tenders functionality
  const { savedTenderIds, savedTenders, toggleSaveTender, isTenderSaved } = useSavedTenders(tenders);
  
  // Update a tender (e.g., when editing AI summary)
  const updateTender = useCallback((updatedTender: Tender) => {
    setTenders(prev => 
      prev.map(tender => 
        tender.id === updatedTender.id ? updatedTender : tender
      )
    );
    
    toast({
      title: "Changes saved",
      description: "Your changes to the tender have been saved.",
      duration: 3000,
    });
    
    return updatedTender;
  }, [toast]);
  
  // Get a single tender by ID
  const getTenderById = useCallback((id: string) => {
    return tenders.find(tender => tender.id === id);
  }, [tenders]);
  
  return {
    allTenders: tenders,
    filteredTenders: sortedTenders,
    savedTenders,
    isLoading,
    searchQuery,
    filters,
    sort,
    setSearchQuery,
    setFilters,
    setSort,
    toggleSaveTender,
    isTenderSaved,
    updateTender,
    getTenderById,
    CATEGORIES,
    LOCATIONS,
    STATUSES,
  };
}
