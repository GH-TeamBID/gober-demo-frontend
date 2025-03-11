
import { useState, useMemo } from 'react';
import { SortState, Tender } from '@/types/types';

export const useTenderSort = (tenders: Tender[]) => {
  const [sort, setSort] = useState<SortState>({
    field: 'updatedOn',
    direction: 'desc'
  });
  
  const sortedTenders = useMemo(() => {
    return [...tenders].sort((a, b) => {
      let compareA, compareB;
      
      // Determine values to compare based on sort field
      switch (sort.field) {
        case 'id':
          compareA = a.id;
          compareB = b.id;
          break;
        case 'budget':
          compareA = a.budget;
          compareB = b.budget;
          break;
        case 'submitOn':
          compareA = new Date(a.submitOn).getTime();
          compareB = new Date(b.submitOn).getTime();
          break;
        case 'updatedOn':
          compareA = new Date(a.updatedOn).getTime();
          compareB = new Date(b.updatedOn).getTime();
          break;
        case 'title':
          compareA = a.title.toLowerCase();
          compareB = b.title.toLowerCase();
          break;
        default:
          compareA = new Date(a.updatedOn).getTime();
          compareB = new Date(b.updatedOn).getTime();
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
