import { useState, useEffect } from 'react';
import { FilterState } from '../types/types';
import { TenderPreview } from '../services/tenderService';

type TenderTypes = TenderPreview;

/**
 * Custom hook for filtering tenders based on multiple criteria
 */
export function useTenderFilter(
  tenders: TenderTypes[],
  searchQuery: string
) {
  // Default filter state
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    states: [],
    status: [],
    dateRange: { from: null, to: null },
    budgetRange: [0, 10000000],
  });

  // The filtered tenders
  const [filteredTenders, setFilteredTenders] = useState<TenderPreview[]>(tenders as TenderPreview[]);

  // Effect to apply filters when any filter criteria changes
  useEffect(() => {
    let result = [...tenders] as TenderPreview[];

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
        filters.categories.some(cat => 
          tender.cpv_categories?.includes(cat)
        ) : false
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
      // Since we don't have real status data yet, default all to "Open"
      result = result.filter(() => 
        filters.status.includes('Open')
      );
    }

    // Apply date range filter
    if (filters.dateRange.from || filters.dateRange.to) {
      result = result.filter((tender) => {
        if (!tender.submission_date) return false;
        
        const tenderDate = new Date(tender.submission_date);
        
        if (filters.dateRange.from) {
          const fromDate = new Date(filters.dateRange.from);
          if (tenderDate < fromDate) return false;
        }
        
        if (filters.dateRange.to) {
          const toDate = new Date(filters.dateRange.to);
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
  }, [tenders, searchQuery, filters]);

  return { filters, setFilters, filteredTenders };
} 