import { useState, useEffect } from 'react';
import { SortState, Tender } from '../types/types';
import { TenderPreview } from '../services/tenderService';

type TenderTypes = TenderPreview | Tender;

/**
 * Custom hook for sorting tenders
 */
export function useTenderSort(tenders: TenderTypes[]) {
  // Default sort state
  const [sort, setSort] = useState<SortState>({
    field: 'submission_date',
    direction: 'desc',
  });

  // Sorted tenders
  const [sortedTenders, setSortedTenders] = useState<TenderPreview[]>(tenders as TenderPreview[]);

  // Effect to apply sorting when sort criteria or tenders change
  useEffect(() => {
    const sorted = [...tenders].sort((a, b) => {
      let result = 0;

      switch (sort.field) {
        case 'submission_date':
          if (!a.submission_date) return 1;
          if (!b.submission_date) return -1;
          result = new Date(a.submission_date).getTime() - new Date(b.submission_date).getTime();
          break;
          
        case 'title':
          const titleA = a.title || '';
          const titleB = b.title || '';
          result = titleA.localeCompare(titleB);
          break;
          
        case 'budget':
          const budgetA = a.budget?.amount || 0;
          const budgetB = b.budget?.amount || 0;
          result = budgetA - budgetB;
          break;
          
        case 'pub_org_name':
          const orgA = a.pub_org_name || '';
          const orgB = b.pub_org_name || '';
          result = orgA.localeCompare(orgB);
          break;
          
        default:
          result = 0;
      }

      // Apply sort direction
      return sort.direction === 'asc' ? result : -result;
    });

    setSortedTenders(sorted);
  }, [tenders, sort]);

  return { sort, setSort, sortedTenders };
} 