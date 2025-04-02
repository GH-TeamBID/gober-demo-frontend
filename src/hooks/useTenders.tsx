import { useCallback } from 'react';
import { useTenderSort } from './useTenderSort';
import { useSavedTenders } from './useSavedTenders.tsx';
import { useToast } from '@/components/ui/use-toast';
import { useTenders as useAPITenders } from '@/contexts/TendersContext';
import { TenderPreview, TenderParams } from '../services/tenderService';
import { FilterState } from '@/types/types';

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
  
  // Use the API tenders functionality from the context
  const { 
    tenders,
    isLoading,
    error,
    loadTenders,
    currentParams,
    updateParams
  } = useAPITenders();
  
  // Get sort functionality - use on loaded tenders
  const { sort, setSort, sortedTenders } = useTenderSort(tenders);
  
  // Get saved tenders functionality - use tender_hash as ID
  const { savedTenderIds, savedTenders, toggleSaveTender, isTenderSaved } = useSavedTenders(tenders);
  
  // Convert API parameters to FilterState for UI
  const filters: FilterState = {
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
  };
  
  // Set search query - update the API parameters
  const setSearchQuery = useCallback((query: string) => {
    updateParams({ match: query, page: 1 });
  }, [updateParams]);
  
  // Set filters - convert FilterState to API parameters
  const setFilters = useCallback((newFilters: FilterState) => {
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
    
    updateParams(apiParams);
  }, [updateParams]);
  
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
    filteredTenders: sortedTenders, // Now the 'tenders' already come filtered from the API
    savedTenders,
    isLoading,
    searchQuery: currentParams.match || '',
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
