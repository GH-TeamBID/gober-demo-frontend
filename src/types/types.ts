
export interface Tender {
  id: string;
  title: string;
  description: string;
  submitOn: string;
  lots: number;
  organisation: string;
  budget: number;
  location: string;
  contractType: string;
  category: string;
  status: 'Open' | 'Closed' | 'Under Review' | 'Awarded';
  updatedOn: string;
  aiSummary?: string;
  statusIndicator?: {
    text: string;
    ago: string;
  };
}

export interface FilterState {
  budgetRange: [number, number];
  categories: string[];
  states: string[];
  dateRange: {
    from: string | null;
    to: string | null;
  };
  status: string[];
}

export type SortField = 'budget' | 'submitOn' | 'updatedOn' | 'title';
export type SortDirection = 'asc' | 'desc';

export interface SortState {
  field: SortField;
  direction: SortDirection;
}
