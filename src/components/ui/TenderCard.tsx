
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import TenderStatusIcon from './TenderStatusIcon';
import { Tender } from '@/types/types';
import { cn } from '@/lib/utils';

interface TenderCardProps {
  tender: Tender;
  isSaved: boolean;
  onToggleSave: (tenderId: string) => void;
  showHeaders?: boolean;
}

const TenderCard = ({ 
  tender, 
  isSaved, 
  onToggleSave,
  showHeaders = true 
}: TenderCardProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card key={tender.id} className="overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-4">
        <div className="grid grid-cols-12 gap-4">
          {/* Tender ID */}
          <div className="col-span-2 sm:col-span-1">
            {showHeaders && <div className="text-xs text-gray-500 mb-1">ID</div>}
            <div className="text-sm font-medium">{tender.id}</div>
          </div>
          
          {/* Title and Description */}
          <div className="col-span-10 sm:col-span-5 md:col-span-4">
            {showHeaders && <div className="text-xs text-gray-500 mb-1">Title</div>}
            <Link to={`/tender/${tender.id}`} className="hover:text-gober-accent-500">
              <h3 className="text-sm font-semibold">{tender.title}</h3>
            </Link>
            <p className="text-xs text-gray-600 mt-1 line-clamp-2">{tender.description}</p>
          </div>
          
          {/* Created On */}
          <div className="col-span-4 sm:col-span-2 md:col-span-1">
            {showHeaders && <div className="text-xs text-gray-500 mb-1">Submit On</div>}
            <div className="text-sm">{new Date(tender.submitOn).toLocaleDateString()}</div>
          </div>
          
          {/* No of Lots */}
          <div className="col-span-4 sm:col-span-2 md:col-span-1">
            {showHeaders && <div className="text-xs text-gray-500 mb-1">Lots</div>}
            <div className="text-sm">{tender.lots}</div>
          </div>
          
          {/* Organization */}
          <div className="col-span-4 sm:col-span-2 md:col-span-1">
            {showHeaders && <div className="text-xs text-gray-500 mb-1">Organization</div>}
            <div className="text-sm truncate">{tender.organisation}</div>
          </div>
          
          {/* Budget */}
          <div className="col-span-4 sm:col-span-2 md:col-span-1">
            {showHeaders && <div className="text-xs text-gray-500 mb-1">Budget</div>}
            <div className="text-sm font-medium">{formatCurrency(tender.budget)}</div>
          </div>
          
          {/* Location */}
          <div className="col-span-4 sm:col-span-2 md:col-span-1 hidden md:block">
            {showHeaders && <div className="text-xs text-gray-500 mb-1">Location</div>}
            <div className="text-sm">{tender.location}</div>
          </div>
          
          {/* Contract Type */}
          <div className="col-span-4 sm:col-span-2 md:col-span-1 hidden md:block">
            {showHeaders && <div className="text-xs text-gray-500 mb-1">Contract Type</div>}
            <div className="text-sm">{tender.contractType}</div>
          </div>
          
          {/* Category */}
          <div className="col-span-4 sm:col-span-2 md:col-span-1 hidden lg:block">
            {showHeaders && <div className="text-xs text-gray-500 mb-1">Category</div>}
            <div className="text-sm">{tender.category}</div>
          </div>
          
          {/* Status */}
          <div className="col-span-4 sm:col-span-2 md:col-span-1 hidden lg:block">
            {showHeaders && <div className="text-xs text-gray-500 mb-1">Status</div>}
            <div className="text-sm flex items-center gap-1">
              <TenderStatusIcon status={tender.status} />
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
                isSaved && "text-red-500"
              )}
              onClick={() => onToggleSave(tender.id)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill={isSaved ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              </svg>
              <span className="sr-only">
                {isSaved ? "Unsave" : "Save"}
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
            <TenderStatusIcon status={tender.status} />
            <span>{tender.status}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default TenderCard;
