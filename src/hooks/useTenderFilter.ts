
import { useState, useMemo } from 'react';
import { FilterState, Tender } from '@/types/types';

export const useTenderFilter = (tenders: Tender[], searchQuery: string) => {
  const [filters, setFilters] = useState<FilterState>({
    budgetRange: [0, 10000000],
    categories: [],
    states: [],
    dateRange: {
      from: null,
      to: null
    },
    status: []
  });
  
  const filteredTenders = useMemo(() => {
    return tenders.filter(tender => {
      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          tender.id.toLowerCase().includes(query) ||
          tender.title.toLowerCase().includes(query) ||
          tender.description.toLowerCase().includes(query) ||
          tender.category.toLowerCase().includes(query) ||
          tender.organisation.toLowerCase().includes(query);
        
        if (!matchesSearch) return false;
      }
      
      // Filter by budget range
      if (
        tender.budget < filters.budgetRange[0] ||
        tender.budget > filters.budgetRange[1]
      ) {
        return false;
      }
      
      // Filter by categories
      if (
        filters.categories.length > 0 &&
        !filters.categories.includes(tender.category)
      ) {
        return false;
      }
      
      // Filter by states/locations
      if (
        filters.states.length > 0 &&
        !filters.states.includes(tender.location)
      ) {
        return false;
      }
      
      // Filter by status
      if (
        filters.status.length > 0 &&
        !filters.status.includes(tender.status)
      ) {
        return false;
      }
      
      // Filter by date range
      if (filters.dateRange.from) {
        const fromDate = new Date(filters.dateRange.from);
        const tenderDate = new Date(tender.submitOn);
        if (tenderDate < fromDate) return false;
      }
      
      if (filters.dateRange.to) {
        const toDate = new Date(filters.dateRange.to);
        const tenderDate = new Date(tender.submitOn);
        if (tenderDate > toDate) return false;
      }
      
      return true;
    });
  }, [tenders, searchQuery, filters]);
  
  return { filters, setFilters, filteredTenders };
};
