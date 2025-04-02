import { useState, useEffect } from 'react';
import { FilterState } from '../types/types';
import { TenderPreview } from '../services/tenderService';

/**
 * Custom hook for filtering tenders based on multiple criteria
 * When useApiFiltering=true, this hook only tracks filter state but doesn't perform filtering
 * When useApiFiltering=false, it performs client-side filtering (fallback)
 */
export function useTenderFilter(
  tenders: TenderPreview[],
  searchQuery: string,
  useApiFiltering: boolean = true // Default to server-side filtering
) {
  // Default filter state
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    states: [],
    status: [],
    dateRange: { from: null, to: null },
    budgetRange: [0, 10000000],
  });

  // The filtered tenders - if using API, this will just be the passed tenders
  const [filteredTenders, setFilteredTenders] = useState<TenderPreview[]>(tenders);

  // Effect to apply filters when any filter criteria changes
  useEffect(() => {
    // If using API for filtering, don't filter client-side
    if (useApiFiltering) {
      setFilteredTenders(tenders);
      return;
    }
    
    // Only do client-side filtering if not using API filtering
    let result = [...tenders];

    // Apply search query filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (tender) =>
          tender.title?.toLowerCase().includes(query) ||
          tender.pub_org_name?.toLowerCase().includes(query) ||
          tender.tender_id?.toLowerCase().includes(query)
      );
    }

    // Apply category filter
    if (filters.categories.length > 0) {
      result = result.filter((tender) =>
        tender.cpv_categories && tender.cpv_categories.length > 0 ? 
        filters.categories.some(cat => {
          // Extract code from "code - description" format if needed
          const code = cat.includes(' - ') ? cat.split(' - ')[0].trim() : cat;
          return tender.cpv_categories?.some(tenderCat => 
            tenderCat.includes(code) || tenderCat === cat
          );
        }) : false
      );
    }

    // Apply location filter
    if (filters.states.length > 0) {
      result = result.filter((tender) =>
        tender.location ? 
        filters.states.includes(tender.location) : false
      );
    }

    // Apply status filter
    if (filters.status.length > 0) {
      result = result.filter((tender) =>
        tender.status ? 
        filters.status.includes(tender.status) : false
      );
    }

    // Apply date range filter
    if (filters.dateRange.from || filters.dateRange.to) {
      result = result.filter((tender) => {
        if (!tender.submission_date) return false;
        
        const tenderDate = new Date(tender.submission_date);
        
        if (filters.dateRange.from) {
          const fromDate = typeof filters.dateRange.from === 'string' 
            ? new Date(filters.dateRange.from) 
            : filters.dateRange.from;
            
          if (tenderDate < fromDate) return false;
        }
        
        if (filters.dateRange.to) {
          const toDate = typeof filters.dateRange.to === 'string' 
            ? new Date(filters.dateRange.to) 
            : filters.dateRange.to;
            
          if (tenderDate > toDate) return false;
        }
        
        return true;
      });
    }

    // Apply budget range filter
    if (
      filters.budgetRange[0] > 0 ||
      filters.budgetRange[1] < 10000000
    ) {
      result = result.filter((tender) => {
        const budget = tender.budget?.amount || 0;
        return (
          budget >= filters.budgetRange[0] &&
          budget <= filters.budgetRange[1]
        );
      });
    }

    setFilteredTenders(result);
  }, [tenders, searchQuery, filters, useApiFiltering]);

  return { filters, setFilters, filteredTenders };
} 