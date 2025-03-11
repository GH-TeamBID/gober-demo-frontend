
import { format } from 'date-fns';
import { Tender } from '@/types/types';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import TenderStatusActions from './TenderStatusActions';

interface TenderDetailsCardProps {
  tender: Tender;
  isTenderSaved: (id: string) => boolean;
  toggleSaveTender: (id: string) => void;
  getStatusClass: (status: string) => string;
}

const TenderDetailsCard = ({ 
  tender, 
  isTenderSaved, 
  toggleSaveTender,
  getStatusClass 
}: TenderDetailsCardProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      maximumFractionDigits: 0,
    }).format(value);
  };
  
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd MMMM yyyy');
  };
  
  return (
    <Card className="overflow-hidden shadow-md border-gray-200 dark:border-gray-700">
      <CardContent className="p-0">
        {/* Header */}
        <div className="px-6 py-5 bg-gray-50 dark:bg-gober-primary-700/30 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Tender ID: {tender.id}
            </div>
            <h2 className="text-xl font-semibold mt-1 text-gober-primary-900 dark:text-white">
              {tender.title}
            </h2>
          </div>
          
          <TenderStatusActions 
            status={tender.status}
            tenderId={tender.id}
            isSaved={isTenderSaved(tender.id)}
            onToggleSave={toggleSaveTender}
            getStatusClass={getStatusClass}
          />
        </div>
        
        {/* Content */}
        <div className="p-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Description
              </h3>
              <p className="text-gober-primary-900 dark:text-white">
                {tender.description}
              </p>
            </div>
            
            <Separator />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Submit By
                </h3>
                <p className="text-gober-primary-900 dark:text-white font-medium">
                  {formatDate(tender.submitOn)}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Budget
                </h3>
                <p className="text-gober-primary-900 dark:text-white font-medium">
                  {formatCurrency(tender.budget)}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Organisation
                </h3>
                <p className="text-gober-primary-900 dark:text-white">
                  {tender.organisation}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Location
                </h3>
                <p className="text-gober-primary-900 dark:text-white">
                  {tender.location}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Contract Type
                </h3>
                <p className="text-gober-primary-900 dark:text-white">
                  {tender.contractType}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Number of Lots
                </h3>
                <p className="text-gober-primary-900 dark:text-white">
                  {tender.lots}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Category
                </h3>
                <p className="text-gober-primary-900 dark:text-white">
                  {tender.category}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Last Updated
                </h3>
                <p className="text-gober-primary-900 dark:text-white">
                  {formatDate(tender.updatedOn)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TenderDetailsCard;
