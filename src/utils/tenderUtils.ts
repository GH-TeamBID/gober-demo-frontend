
import { format } from 'date-fns';

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatDate = (dateString: string) => {
  return format(new Date(dateString), 'dd MMMM yyyy');
};

export const getStatusClass = (status: string) => {
  switch (status) {
    case 'Open':
      return 'status-badge-open';
    case 'Closed':
      return 'status-badge-closed';
    case 'Under Review':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
    case 'Awarded':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  }
};
