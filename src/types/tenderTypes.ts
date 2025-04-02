export enum TenderStatus {
  OPEN = 'Open',
  CLOSED = 'Closed',
  PLANNED = 'Under Review',
  AWARDED = 'Awarded',
  CANCELED = 'Canceled'
}

export interface CPVCode {
  code: string;
  description?: string;
}

export interface Identifier {
  id: string;
  legalName?: string;
} 