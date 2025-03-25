import { useCallback } from 'react';
import { useTenderSearch } from './useTenderSearch';
import { useTenderFilter } from './useTenderFilter';
import { useTenderSort } from './useTenderSort';
import { useSavedTenders } from './useSavedTenders.tsx';
import { useToast } from '@/components/ui/use-toast';
import { useTenders as useAPITenders } from '@/contexts/TendersContext';
import { TenderPreview } from '../services/tenderService';

// Available categories for filtering (moved from mockTenders)
export const CATEGORIES = [
  'Healthcare',
  'Transportation',
  'Education',
  'IT & Cybersecurity',
  'Environment',
  'Housing',
  'Public Safety',
  'Energy',
  'Water & Utilities',
  'Telecommunications'
];

// Available locations (states) for filtering (moved from mockTenders)
export const LOCATIONS = [
  'New South Wales',
  'Victoria',
  'Queensland',
  'Western Australia',
  'South Australia',
  'Tasmania',
  'Northern Territory',
  'Australian Capital Territory'
];

// Available statuses for filtering (moved from mockTenders)
export const STATUSES = ['Open', 'Closed', 'Under Review', 'Awarded'];

export function useTenders() {
  const { toast } = useToast();
  
  // Use the API tenders from the context directly - no conversion needed
  const { 
    tenders,
    isLoading: apiLoading,
    error,
    loadTenders
  } = useAPITenders();
  
  // Get search functionality
  const { searchQuery, isLoading: searchLoading, setSearchQuery } = useTenderSearch();
  
  // Get filter functionality - pass tenders directly
  const { filters, setFilters, filteredTenders } = useTenderFilter(tenders, searchQuery);
  
  // Get sort functionality - pass filteredTenders directly
  const { sort, setSort, sortedTenders } = useTenderSort(filteredTenders);
  
  // Get saved tenders functionality - use tender_hash as ID
  const { savedTenderIds, savedTenders, toggleSaveTender, isTenderSaved } = useSavedTenders(tenders);
  
  // Update a tender
  const updateTender = useCallback((updatedTender: TenderPreview) => {
    toast({
      title: "Changes saved",
      description: "Your changes to the tender have been saved.",
      duration: 3000,
    });
    
    return updatedTender;
  }, [toast]);
  
  // Get a single tender by hash
  const getTenderById = useCallback((id: string) => {
    return tenders.find(tender => tender.tender_hash === id);
  }, [tenders]);
  
  return {
    allTenders: tenders,
    filteredTenders: sortedTenders,
    savedTenders,
    isLoading: apiLoading || searchLoading,
    searchQuery,
    filters,
    sort,
    error,
    setSearchQuery,
    setFilters,
    setSort,
    toggleSaveTender,
    isTenderSaved,
    updateTender,
    getTenderById,
    refreshTenders: loadTenders,
    CATEGORIES,
    LOCATIONS,
    STATUSES,
  };
}
