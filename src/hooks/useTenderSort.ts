import { useState, useMemo } from 'react';
import { SortState } from '@/types/types';
import { TenderPreview } from '@/services/tenderService';

export const useTenderSort = (tenders: TenderPreview[]) => {
  const [sort, setSort] = useState<SortState>({
    field: 'submission_date',
    direction: 'desc'
  });
  
  const sortedTenders = useMemo(() => {
    return [...tenders].sort((a, b) => {
      let compareA: any, compareB: any;
      
      // Determine values to compare based on sort field
      switch (sort.field) {
        case 'tender_id':
          compareA = a.tender_id;
          compareB = b.tender_id;
          break;
        case 'budget_amount':
          compareA = a.budget?.amount || 0;
          compareB = b.budget?.amount || 0;
          break;
        case 'submission_date':
          compareA = a.submission_date ? new Date(a.submission_date).getTime() : 0;
          compareB = b.submission_date ? new Date(b.submission_date).getTime() : 0;
          break;
        case 'title':
          compareA = a.title?.toLowerCase() || '';
          compareB = b.title?.toLowerCase() || '';
          break;
        default:
          compareA = a.submission_date ? new Date(a.submission_date).getTime() : 0;
          compareB = b.submission_date ? new Date(b.submission_date).getTime() : 0;
      }
      
      // Apply sort direction
      if (sort.direction === 'asc') {
        return compareA > compareB ? 1 : -1;
      } else {
        return compareA < compareB ? 1 : -1;
      }
    });
  }, [tenders, sort]);
  return { sort, setSort, sortedTenders };
};
