
import { useState } from 'react';
import { Filter, ArrowUp, ArrowDown, AlertCircle, CheckCircle, Clock, Award } from 'lucide-react';
import { SortField, SortDirection, SortState, Tender, FilterState } from '@/types/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import FilterPanel from './FilterPanel';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

interface TenderListProps {
  tenders: Tender[];
  isLoading: boolean;
  savedTenderIds: string[];
  sort: SortState;
  filters: FilterState;
  onToggleSave: (tenderId: string) => void;
  onSort: (sort: SortState) => void;
  onFilter: (filters: FilterState) => void;
}

const TenderList = ({
  tenders,
  isLoading,
  savedTenderIds,
  sort,
  filters,
  onToggleSave,
  onSort,
  onFilter,
}: TenderListProps) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  const handleSort = (field: SortField) => {
    const direction: SortDirection =
      sort.field === field && sort.direction === 'asc' ? 'desc' : 'asc';
    onSort({ field, direction });
  };
  
  const getSortIcon = (field: SortField) => {
    if (sort.field !== field) return null;
    
    return sort.direction === 'asc' ? (
      <ArrowUp className="h-4 w-4 ml-1" />
    ) : (
      <ArrowDown className="h-4 w-4 ml-1" />
    );
  };
  
  const getStatusIcon = (status: Tender['status']) => {
    switch (status) {
      case 'Open':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'Closed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'Under Review':
        return <Clock className="h-4 w-4 text-amber-500" />;
      case 'Awarded':
        return <Award className="h-4 w-4 text-blue-500" />;
      default:
        return null;
    }
  };
  
  const getActiveFilterCount = () => {
    let count = 0;
    
    if (filters.categories.length > 0) count++;
    if (filters.states.length > 0) count++;
    if (filters.status.length > 0) count++;
    if (filters.dateRange.from || filters.dateRange.to) count++;
    if (
      filters.budgetRange[0] > 0 ||
      filters.budgetRange[1] < 10000000
    ) {
      count++;
    }
    
    return count;
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  return (
    <div className="space-y-6">
      {/* Sorting and Filter Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Sort by:
          </span>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="ghost"
              size="sm"
              className={`flex items-center ${
                sort.field === 'budget'
                  ? 'text-gober-accent-500 font-medium'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
              onClick={() => handleSort('budget')}
            >
              Budget
              {getSortIcon('budget')}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`flex items-center ${
                sort.field === 'submitOn'
                  ? 'text-gober-accent-500 font-medium'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
              onClick={() => handleSort('submitOn')}
            >
              Submit On
              {getSortIcon('submitOn')}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`flex items-center ${
                sort.field === 'updatedOn'
                  ? 'text-gober-accent-500 font-medium'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
              onClick={() => handleSort('updatedOn')}
            >
              Updated On
              {getSortIcon('updatedOn')}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`flex items-center ${
                sort.field === 'title'
                  ? 'text-gober-accent-500 font-medium'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
              onClick={() => handleSort('title')}
            >
              Title
              {getSortIcon('title')}
            </Button>
          </div>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1"
          onClick={() => setIsFilterOpen(true)}
        >
          <Filter className="h-4 w-4" />
          <span>Filters</span>
          {getActiveFilterCount() > 0 && (
            <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-gober-accent-500 text-xs text-white">
              {getActiveFilterCount()}
            </span>
          )}
        </Button>
      </div>
      
      {/* Results Count */}
      <div className="text-sm text-gray-600 dark:text-gray-400">
        {isLoading ? (
          'Loading results...'
        ) : (
          <span>
            Found <strong>{tenders.length}</strong> tenders
          </span>
        )}
      </div>
      
      {/* Tenders List */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(6)].map((_, index) => (
            <div
              key={index}
              className="h-24 animate-pulse rounded-lg bg-gray-200 dark:bg-gober-primary-800/50"
            />
          ))}
        </div>
      ) : tenders.length > 0 ? (
        <div className="space-y-4">
          {tenders.map((tender) => (
            <Card key={tender.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-4">
                <div className="grid grid-cols-12 gap-4">
                  {/* Tender ID */}
                  <div className="col-span-2 sm:col-span-1">
                    <div className="text-xs text-gray-500 mb-1">ID</div>
                    <div className="text-sm font-medium">{tender.id}</div>
                  </div>
                  
                  {/* Title and Description */}
                  <div className="col-span-10 sm:col-span-5 md:col-span-4">
                    <div className="text-xs text-gray-500 mb-1">Title</div>
                    <Link to={`/tender/${tender.id}`} className="hover:text-gober-accent-500">
                      <h3 className="text-sm font-semibold">{tender.title}</h3>
                    </Link>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">{tender.description}</p>
                  </div>
                  
                  {/* Created On */}
                  <div className="col-span-4 sm:col-span-2 md:col-span-1">
                    <div className="text-xs text-gray-500 mb-1">Submit On</div>
                    <div className="text-sm">{new Date(tender.submitOn).toLocaleDateString()}</div>
                  </div>
                  
                  {/* No of Lots */}
                  <div className="col-span-4 sm:col-span-2 md:col-span-1">
                    <div className="text-xs text-gray-500 mb-1">Lots</div>
                    <div className="text-sm">{tender.lots}</div>
                  </div>
                  
                  {/* Organization */}
                  <div className="col-span-4 sm:col-span-2 md:col-span-1">
                    <div className="text-xs text-gray-500 mb-1">Organization</div>
                    <div className="text-sm truncate">{tender.organisation}</div>
                  </div>
                  
                  {/* Budget */}
                  <div className="col-span-4 sm:col-span-2 md:col-span-1">
                    <div className="text-xs text-gray-500 mb-1">Budget</div>
                    <div className="text-sm font-medium">{formatCurrency(tender.budget)}</div>
                  </div>
                  
                  {/* Location */}
                  <div className="col-span-4 sm:col-span-2 md:col-span-1 hidden md:block">
                    <div className="text-xs text-gray-500 mb-1">Location</div>
                    <div className="text-sm">{tender.location}</div>
                  </div>
                  
                  {/* Contract Type */}
                  <div className="col-span-4 sm:col-span-2 md:col-span-1 hidden md:block">
                    <div className="text-xs text-gray-500 mb-1">Contract Type</div>
                    <div className="text-sm">{tender.contractType}</div>
                  </div>
                  
                  {/* Category */}
                  <div className="col-span-4 sm:col-span-2 md:col-span-1 hidden lg:block">
                    <div className="text-xs text-gray-500 mb-1">Category</div>
                    <div className="text-sm">{tender.category}</div>
                  </div>
                  
                  {/* Status */}
                  <div className="col-span-4 sm:col-span-2 md:col-span-1 hidden lg:block">
                    <div className="text-xs text-gray-500 mb-1">Status</div>
                    <div className="text-sm flex items-center gap-1">
                      {getStatusIcon(tender.status)}
                      <span>{tender.status}</span>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="col-span-4 sm:col-span-2 md:col-span-1 flex items-end justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "h-9 w-9 p-0",
                        savedTenderIds.includes(tender.id) && "text-red-500"
                      )}
                      onClick={() => onToggleSave(tender.id)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill={savedTenderIds.includes(tender.id) ? "currentColor" : "none"}
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-5 w-5"
                      >
                        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                      </svg>
                      <span className="sr-only">
                        {savedTenderIds.includes(tender.id) ? "Unsave" : "Save"}
                      </span>
                    </Button>
                  </div>
                </div>
                
                {/* Mobile expandable section for additional information */}
                <div className="md:hidden mt-2 pt-2 border-t text-sm grid grid-cols-2 gap-x-4 gap-y-2">
                  <div>
                    <span className="text-xs text-gray-500">Location:</span> {tender.location}
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Contract:</span> {tender.contractType}
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Category:</span> {tender.category}
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-500">Status:</span>
                    {getStatusIcon(tender.status)}
                    <span>{tender.status}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="text-lg font-medium mb-2">No tenders found</div>
          <p className="text-gray-600 dark:text-gray-400 max-w-md">
            Try adjusting your search or filters to find what you're looking for.
          </p>
        </div>
      )}
      
      {/* Load More Button */}
      {tenders.length > 0 && (
        <div className="flex justify-center mt-8">
          <Button variant="outline" size="lg">
            Load More
          </Button>
        </div>
      )}
      
      {/* Filter Panel */}
      <FilterPanel
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={filters}
        onApplyFilters={onFilter}
      />
    </div>
  );
};

export default TenderList;
