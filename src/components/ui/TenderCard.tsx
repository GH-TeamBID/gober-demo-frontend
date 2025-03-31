import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import TenderStatusIcon from './TenderStatusIcon';
import { TenderPreview } from '@/services/tenderService';
import { SortField } from '@/types/types';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import TenderStatusActions from '../tender/TenderStatusActions';

interface TenderCardProps {
  tender: TenderPreview;
  isSaved: boolean;
  onToggleSave: (tenderId: string) => void;
  showHeaders?: boolean;
  sortField?: SortField;
}

const TenderCard = ({ 
  tender, 
  isSaved: initialIsSaved, 
  onToggleSave,
  showHeaders = true,
  sortField 
}: TenderCardProps) => {
  // Add local state to immediately reflect UI changes
  const [isSaved, setIsSaved] = useState(initialIsSaved);
  const [isToggling, setIsToggling] = useState(false);
  const { toast } = useToast();
  
  // Ref to track last save/unsave to prevent abuse
  const lastToggleRef = useRef<number>(0);
  const debounceTimeMs = 500; // Minimum ms between save actions
  
  // Update local state when prop changes
  useEffect(() => {
    setIsSaved(initialIsSaved);
  }, [initialIsSaved]);
  
  // Simple debug only when tender is available but missing expected fields
  useEffect(() => {
    if (tender && !tender.tender_hash && !tender.tender_id) {
      console.warn("TenderCard received tender without ID or hash:", tender);
    }
  }, [tender]);

  if (!tender) {
    return (
      <Card className="overflow-hidden opacity-70">
        <div className="p-4">
          <div className="text-center py-2 text-gray-500">
            Tender data missing
          </div>
        </div>
      </Card>
    );
  }

  // Handle loading placeholder state
  if (tender.isLoading) {
    return (
      <Card className="overflow-hidden relative">
        <div className="p-4">
          <div className="grid grid-cols-12 gap-4">
            {/* Loading Indicator */}
            <div className="absolute top-2 right-2">
              <Loader2 className="h-4 w-4 animate-spin text-gober-accent-500" />
            </div>
            
            {/* Tender ID */}
            <div className="col-span-2 sm:col-span-1">
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </div>
            
            {/* Title */}
            <div className="col-span-10 sm:col-span-4 md:col-span-3">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
              <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded animate-pulse w-3/4"></div>
            </div>
            
            {/* Other fields with skeleton loaders */}
            <div className="col-span-4 sm:col-span-2 md:col-span-1">
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </div>
            
            <div className="col-span-4 sm:col-span-1 md:col-span-1">
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </div>
            
            <div className="col-span-4 sm:col-span-4 md:col-span-2">
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </div>
            
            <div className="col-span-4 sm:col-span-2 md:col-span-1">
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </div>
            
            <div className="col-span-4 sm:col-span-2 md:col-span-1 hidden md:block">
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </div>
            
            <div className="col-span-4 sm:col-span-2 md:col-span-1 hidden md:block">
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </div>
            
            {/* Save button - disabled during loading */}
            <div className="col-span-4 sm:col-span-2 md:col-span-1 flex items-end justify-end">
              <Button
                variant="ghost"
                size="sm"
                className="h-9 w-9 p-0 opacity-50"
                disabled={true}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                </svg>
                <span className="sr-only">Loading</span>
              </Button>
            </div>
          </div>
          
          <div className="absolute inset-0 bg-white dark:bg-gray-900 opacity-40 pointer-events-none"></div>
        </div>
      </Card>
    );
  }

  // Safely extract values with fallbacks to prevent rendering errors
  const tenderId = tender.tender_id || 'N/A';
  const tenderHash = tender.tender_hash || '';
  const title = tender.title || 'Untitled Tender';
  const description = tender.description || 'No description available';
  const nLots = tender.n_lots || 0;
  const orgName = tender.pub_org_name || 'Unknown';
  const location = tender.location || 'Not specified';
  const contractType = tender.contract_type || 'Not specified';
  
  // Show all categories instead of just the first one
  const tenderCategories = tender.cpv_categories && tender.cpv_categories.length > 0
    ? tender.cpv_categories
    : ['Not specified'];
  
  // Contract type mapping
  const contractTypeMap: Record<string, string> = {
    '1': 'Works',
    '2': 'Supplies', 
    '3': 'Services',
    '4': 'Mixed',
    '0': 'Other'
  };
  
  // Get human-readable contract type
  const getContractTypeLabel = (type: string | number): string => {
    // Convert to string if it's a number
    const typeKey = typeof type === 'number' ? type.toString() : type;
    return contractTypeMap[typeKey] || String(type);
  };
  
  const formatCurrency = (amount?: number, currency: string = 'EUR') => {
    if (amount === undefined) return 'Not specified';
    
    // Format with dot as thousands separator and currency at end
    return new Intl.NumberFormat('de-DE', {
      style: 'decimal',
      maximumFractionDigits: 0,
    }).format(amount) + ' €';
  };

  // Extract properties with appropriate fallbacks
  const tenderAmount = tender.budget?.amount;
  const tenderCurrency = tender.budget?.currency || 'EUR';
  
  // Format date as DD/MM/YYYY instead of MM/DD/YYYY
  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'Not specified';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB'); // Will format as DD/MM/YYYY
  };
  
  const formattedDate = tender.submission_date 
    ? formatDate(tender.submission_date) 
    : 'Not specified';

  // If neither tender_hash nor id is available, render placeholder
  if (!tenderHash) {
    return (
      <Card className="overflow-hidden opacity-70">
        <div className="p-4">
          <div className="text-center py-2 text-gray-500">
            Tender data incomplete (missing identifier)
            {tenderId !== 'N/A' && <div className="text-xs mt-1">ID: {tenderId}</div>}
            {title !== 'Untitled Tender' && <div className="text-xs mt-1">Title: {title}</div>}
          </div>
        </div>
      </Card>
    );
  }

  // Helper to check if a column is being sorted
  const isSortedColumn = (field: SortField) => sortField === field;
  
  // Create a style for sorted columns
  const getSortedStyle = (field: SortField) => {
    return isSortedColumn(field) ? 'text-gober-accent-500 font-medium' : '';
  };

  // Improved handler with debouncing but NO direct API call
  const handleSaveClick = async (e: React.MouseEvent) => {
    e.preventDefault();  // Prevent navigation
    e.stopPropagation(); // Stop event from bubbling up
    
    if (!tenderHash) return;
    
    // Debounce save/unsave actions to prevent abuse
    const now = Date.now();
    if (now - lastToggleRef.current < debounceTimeMs) {
      console.log('Ignoring rapid save/unsave request');
      return;
    }
    lastToggleRef.current = now;
    
    // Show loading state
    setIsToggling(true);
    
    try {
      // Toggle UI state optimistically
      const newSavedState = !isSaved;
      setIsSaved(newSavedState);
      
      // Notify parent component - let it handle the API call
      onToggleSave(tenderHash);
      
      // Show toast for success (optional)
      toast({
        description: newSavedState 
          ? "Tender saved to your favorites" 
          : "Tender removed from favorites",
        duration: 2000,
      });
    } catch (error) {
      console.error('Error toggling save:', error);
      
      // Revert UI state on error
      setIsSaved(isSaved);
      
      // Show error toast
      toast({
        variant: "destructive",
        title: "Action failed",
        description: "An error occurred. Please try again later.",
      });
    } finally {
      setIsToggling(false);
    }
  };

  // Create a separate handler for TenderStatusActions that matches its expected signature
  const handleSaveToggle = (id: string) => {
    // Just call onToggleSave with the ID
    onToggleSave(id);
  };

  return (
    <Link to={`/tender/${tenderHash}`} className="block no-underline">
      <Card 
        key={tenderHash} 
        className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
      >
        <div className="p-4">
          <div className="grid grid-cols-12 gap-4">
            {/* Tender ID with truncation */}
            <div className="col-span-2 sm:col-span-1">
              {showHeaders && <div className="text-xs text-gray-500 mb-1">ID</div>}
              <div className={`text-sm font-medium truncate ${getSortedStyle('tender_id')}`} title={tenderId}>{tenderId}</div>
            </div>
            
            {/* Title and Description - reduced width */}
            <div className="col-span-10 sm:col-span-4 md:col-span-3">
              {showHeaders && <div className="text-xs text-gray-500 mb-1">Title</div>}
              <h3 className={`text-sm font-semibold hover:text-gober-accent-500 ${getSortedStyle('title')}`}>{title}</h3>
              <p className="text-xs text-gray-600 mt-1 line-clamp-2">{description}</p>
            </div>
            
            {/* Submission Date */}
            <div className="col-span-4 sm:col-span-2 md:col-span-1">
              {showHeaders && <div className="text-xs text-gray-500 mb-1">Submit On</div>}
              <div className={`text-sm ${getSortedStyle('submission_date')}`}>{formattedDate}</div>
            </div>
            
            {/* Lots */}
            <div className="col-span-4 sm:col-span-1 md:col-span-1">
              {showHeaders && <div className="text-xs text-gray-500 mb-1">Lots</div>}
              <div className={`text-sm ${getSortedStyle('n_lots')}`}>{nLots}</div>
            </div>
            
            {/* Organization - increased width */}
            <div className="col-span-4 sm:col-span-4 md:col-span-2">
              {showHeaders && <div className="text-xs text-gray-500 mb-1">Organization</div>}
              <div className={`text-sm ${getSortedStyle('pub_org_name')}`} title={orgName}>{orgName}</div>
            </div>
            
            {/* Budget */}
            <div className="col-span-4 sm:col-span-2 md:col-span-1">
              {showHeaders && <div className="text-xs text-gray-500 mb-1">Budget</div>}
              <div className={`text-sm font-medium ${getSortedStyle('budget.amount')}`}>{formatCurrency(tenderAmount, tenderCurrency)}</div>
            </div>
            
            {/* Location */}
            <div className="col-span-4 sm:col-span-2 md:col-span-1 hidden md:block">
              {showHeaders && <div className="text-xs text-gray-500 mb-1">Location</div>}
              <div className={`text-sm ${getSortedStyle('location')}`}>{location}</div>
            </div>
            
            {/* Contract Type */}
            <div className="col-span-4 sm:col-span-2 md:col-span-1 hidden md:block">
              {showHeaders && <div className="text-xs text-gray-500 mb-1">Type</div>}
              <div className={`text-sm ${getSortedStyle('contract_type')}`}>{getContractTypeLabel(contractType)}</div>
            </div>
            
            {/* Category - limited with +X more indicator */}
            <div className="col-span-4 sm:col-span-2 md:col-span-1 hidden lg:block">
              {showHeaders && <div className="text-xs text-gray-500 mb-1">Category</div>}
              <div className="text-sm">
                {tenderCategories.slice(0, 2).map((category, index) => (
                  <div key={index} className="truncate" title={category}>{category}</div>
                ))}
                {tenderCategories.length > 2 && 
                  <div className="text-xs text-gray-500">+{tenderCategories.length - 2} more</div>
                }
              </div>
            </div>
            
            {/* Status - No direct mapping in API, using placeholder */}
            <div className="col-span-4 sm:col-span-2 md:col-span-1 hidden lg:block">
              {showHeaders && <div className="text-xs text-gray-500 mb-1">Status</div>}
              <div className="text-sm flex items-center gap-1">
                <TenderStatusIcon status="Open" />
                <span>Open</span>
              </div>
            </div>
            
            <TenderStatusActions 
              tenderId={tenderId} 
              isSaved={isSaved} 
              onToggleSave={handleSaveToggle} 
              getStatusClass={getSortedStyle} 
            />
          
            {/* Mobile expandable section for additional information */}
            <div className="md:hidden mt-2 pt-2 border-t text-sm grid grid-cols-2 gap-x-4 gap-y-2">
              <div>
                <span className="text-xs text-gray-500">Location:</span> {location}
              </div>
              <div>
                <span className="text-xs text-gray-500">Contract:</span> {getContractTypeLabel(contractType)}
              </div>
              <div>
                <span className="text-xs text-gray-500">Categories:</span>
                {tenderCategories.map((category, index) => (
                  <div key={index} className={index > 0 ? "mt-1 ml-2" : ""}>{category}</div>
                ))}
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-500">Status:</span>
                <TenderStatusIcon status="Open" />
                <span>Open</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default TenderCard;
