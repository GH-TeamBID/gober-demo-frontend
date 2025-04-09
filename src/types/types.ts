import { TenderPreview } from '../services/tenderService';

export type { TenderPreview };

export interface FilterState {
  budgetRange: [number, number];
  categories: string[];
  states: string[];
  dateRange: {
    from: Date | string | null;
    to: Date | string | null;
  };
  status: string[];
}

export type SortField = 
  'tender_id' | 
  'title' | 
  'submission_date' | 
  'n_lots' | 
  'pub_org_name' | 
  'budget.amount' | 
  'location' | 
  'contract_type';
export type SortDirection = 'asc' | 'desc';

export interface SortState {
  field: SortField;
  direction: SortDirection;
}

export interface ApiResponseToTenderAdapter {
  adaptTender: (apiTender: any) => TenderPreview;
}

export enum TenderStatus {
  PRIOR_NOTICE = 'Prior notice',
  PUBLISHED = 'Published',
  EVALUATION = 'Evaluation',
  AWARDED = 'Awarded',
  SOLVED = 'Solved',
  CANCELLED = 'Canceled'
}
