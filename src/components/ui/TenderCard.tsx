
import { format } from 'date-fns';
import { Heart, ExternalLink } from 'lucide-react';
import { Tender } from '@/types/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';

interface TenderCardProps {
  tender: Tender;
  isSaved: boolean;
  onToggleSave: (tenderId: string) => void;
}

const TenderCard = ({ tender, isSaved, onToggleSave }: TenderCardProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      maximumFractionDigits: 0,
    }).format(value);
  };
  
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd MMM yyyy');
  };
  
  const getStatusClass = (status: string) => {
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
  
  return (
    <Card className="tender-card group overflow-hidden">
      <CardContent className="p-0">
        <div className="relative">
          {/* Header with Actions */}
          <div className="flex items-center justify-between p-4 pb-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {tender.id}
            </span>
            <div className="flex items-center space-x-2">
              <span className={`status-badge ${getStatusClass(tender.status)}`}>
                {tender.status}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={() => onToggleSave(tender.id)}
              >
                <Heart
                  className={`h-5 w-5 transition-colors ${
                    isSaved
                      ? 'fill-gober-accent-500 text-gober-accent-500'
                      : 'text-gray-400 hover:text-gober-accent-500'
                  }`}
                />
                <span className="sr-only">
                  {isSaved ? 'Unsave' : 'Save'} tender
                </span>
              </Button>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="p-4 pt-0">
            <Link to={`/tender/${tender.id}`} className="block group">
              <h3 className="text-xl font-semibold mb-2 text-gober-primary-900 dark:text-white group-hover:text-gober-accent-500 transition-colors">
                {tender.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-4">
                {tender.description}
              </p>
            </Link>
            
            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-gray-500 dark:text-gray-400">Submit On</div>
                <div className="font-medium">{formatDate(tender.submitOn)}</div>
              </div>
              <div>
                <div className="text-gray-500 dark:text-gray-400">Lots</div>
                <div className="font-medium">{tender.lots}</div>
              </div>
              <div>
                <div className="text-gray-500 dark:text-gray-400">Organisation</div>
                <div className="font-medium">{tender.organisation}</div>
              </div>
              <div>
                <div className="text-gray-500 dark:text-gray-400">Budget</div>
                <div className="font-medium">{formatCurrency(tender.budget)}</div>
              </div>
              <div>
                <div className="text-gray-500 dark:text-gray-400">Location</div>
                <div className="font-medium">{tender.location}</div>
              </div>
              <div>
                <div className="text-gray-500 dark:text-gray-400">Contract Type</div>
                <div className="font-medium">{tender.contractType}</div>
              </div>
              <div className="col-span-2">
                <div className="text-gray-500 dark:text-gray-400">Category</div>
                <div className="font-medium">{tender.category}</div>
              </div>
            </div>
            
            {/* Footer */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Updated {formatDate(tender.updatedOn)}
              </div>
              <Link 
                to={`/tender/${tender.id}`}
                className="inline-flex items-center text-sm font-medium text-gober-accent-500 hover:text-gober-accent-600 transition-colors"
              >
                View Details
                <ExternalLink className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TenderCard;
