
import React from 'react';
import { Button } from '@/components/ui/button';
import { Tender } from '@/types/types';
import TenderCard from './TenderCard';

interface TenderResultsProps {
  tenders: Tender[];
  isLoading: boolean;
  savedTenderIds: string[];
  onToggleSave: (tenderId: string) => void;
}

const TenderResults = ({ 
  tenders, 
  isLoading, 
  savedTenderIds, 
  onToggleSave 
}: TenderResultsProps) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(6)].map((_, index) => (
          <div
            key={index}
            className="h-24 animate-pulse rounded-lg bg-gray-200 dark:bg-gober-primary-800/50"
          />
        ))}
      </div>
    );
  }

  if (tenders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="text-lg font-medium mb-2">No tenders found</div>
        <p className="text-gray-600 dark:text-gray-400 max-w-md">
          Try adjusting your search or filters to find what you're looking for.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {tenders.map((tender) => (
          <TenderCard 
            key={tender.id}
            tender={tender}
            isSaved={savedTenderIds.includes(tender.id)}
            onToggleSave={onToggleSave}
          />
        ))}
      </div>
      
      <div className="flex justify-center mt-8">
        <Button variant="outline" size="lg">
          Load More
        </Button>
      </div>
    </>
  );
};

export default TenderResults;
